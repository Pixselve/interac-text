"use client";
import { FormEvent, useEffect, useState } from "react";
import { askQuestion } from "@/lib/pinecone";

export default function ChatPage() {
  const [messages, setMessages] = useState<
    {
      text: string;
      bot: boolean;
      sources?: string[];
    }[]
  >([{ text: "Hi 👋 How can I help you?", bot: true }]);

  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);

  async function askQuestionHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (question.trim().length > 0) {
      setLoading(true);
      const savedQuestion = question.trim();
      setQuestion("");

      setMessages((messages) => [
        ...messages,
        { text: savedQuestion, bot: false },
      ]);
      try {
        const response = await askQuestion(savedQuestion);
        setLoading(false);
        setMessages((messages) => [
          ...messages,
          { text: response.text, bot: true, sources: response.sourceDocuments },
        ]);
      } catch (e) {
        setLoading(false);
        setMessages((messages) => [
          ...messages,
          { text: "I have trouble answering your question.", bot: true },
        ]);
      }

      // save to local storage
      localStorage.setItem("messages", JSON.stringify(messages));
    }
  }


  function clearChat() {
    localStorage.removeItem("messages");
    setMessages([{ text: "Hi 👋 How can I help you?", bot: true }]);
  }

  useEffect(() => {
    const savedMessages = localStorage.getItem("messages");
    console.log(savedMessages);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  return (
    <main className="max-w-3xl m-auto space-y-10">
      <h1 className="text-5xl font-bold">💬 Chat</h1>
      <div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat ${message.bot ? "chat-start" : "chat-end"}`}
          >
            <div className="chat-bubble">
              <p> {message.text}</p>
              {message.sources && (
                <div className="mt-4">
                  {message.sources.map((source, index) => (
                    <div key={index}>
                      <span className="bg-base-300 px-2 py-1 rounded-lg">{source}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className={`chat chat-start`}>
            <div className="chat-bubble">Chatbot is typing...</div>
          </div>
        )}
      </div>

      <form className="flex gap-2" onSubmit={askQuestionHandler}>
        <input
          value={question}
          onInput={(e) => setQuestion((e.target as HTMLInputElement).value)}
          type="text"
          className="input input-bordered w-full"
          placeholder="Ask questions..."
        />
        <button type="submit" className="btn">
          <svg
            className="h-6 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <title>send</title>
            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
          </svg>
        </button>
        <button type="button" onClick={clearChat} className="btn">
          <svg  className="h-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>restart</title><path d="M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.6L7,5.6L12,0.6V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z" /></svg>
        </button>
      </form>
    </main>
  );
}
