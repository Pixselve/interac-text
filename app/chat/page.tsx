import ApiSnippets from "@/components/ApiSnippets";
import ChatBox from "@/components/ChatBox";
import { cookies } from "next/headers";
import { CookiesEnum } from "@/lib/cookies";
import HTTPSnippet from "httpsnippet";

export default function ChatPage() {
  const pineconeApiKey = cookies().get(CookiesEnum.pineconeApiKey)?.value;
  const pineconeIndex = cookies().get(CookiesEnum.pineconeIndex)?.value;
  const pineconeEnvironment = cookies().get(
    CookiesEnum.pineconeEnvironment
  )?.value;
  const openAiApiKey = cookies().get(CookiesEnum.openAIApiKey)?.value;

  const snippetOptions = {
    cookies: [],
    httpVersion: "HTTP/1.1",
    queryString: [],
    postData: {
      mimeType: "application/json",
      text: JSON.stringify({
        question: "What is the best laptop for programming?",
      }),

      comment: "",
    },
    headersSize: -1,
    bodySize: -1,
    url: "https://interactext.mael.app/api/chat",
    method: "POST",
  };

  const snippetRedactedKeys = new HTTPSnippet({
    ...snippetOptions,
    headers: [
      {
        name: "open-ai-key",
        value: "[REDACTED]",
      },
      {
        name: "pinecone-api-key",
        value: "[REDACTED]",
      },
      {
        name: "pinecone-index",
        value: "[REDACTED]",
      },
      {
        name: "pinecone-environment",
        value: "[REDACTED]",
      },
    ],
  });

  const snippetWithKeys = new HTTPSnippet({
    ...snippetOptions,
    headers: [
      {
        name: "open-ai-key",
        value: openAiApiKey ?? "",
      },
      {
        name: "pinecone-api-key",
        value: pineconeApiKey ?? "",
      },
      {
        name: "pinecone-index",
        value: pineconeIndex ?? "",
      },
      {
        name: "pinecone-environment",
        value: pineconeEnvironment ?? "",
      },
    ],
  });

  const languages = [
    {
      name: "JavaScript",
      clients: [
        {
          name: "Fetch",
          snippetWithKeys: snippetWithKeys.convert(
            "javascript",
            "fetch"
          ) as string,
          snippetRedactedKeys: snippetRedactedKeys.convert(
            "javascript",
            "fetch"
          ) as string,
        },
      ],
    },
    {
      name: "Python",
      clients: [
        {
          name: "Requests",
          snippetWithKeys: snippetWithKeys.convert(
            "python",
            "requests"
          ) as string,
          snippetRedactedKeys: snippetRedactedKeys.convert(
            "python",
            "requests"
          ) as string,
        },
        {
          name: "HTTPX",
          snippetWithKeys: snippetWithKeys.convert("python", "httpx") as string,
          snippetRedactedKeys: snippetRedactedKeys.convert(
            "python",
            "httpx"
          ) as string,
        },
      ],
    },
    {
      name: "Shell",
      clients: [
        {
          name: "Curl",
          snippetWithKeys: snippetWithKeys.convert("shell", "curl") as string,
          snippetRedactedKeys: snippetRedactedKeys.convert(
            "shell",
            "curl"
          ) as string,
        },
      ],
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 p-10">
        <div className="space-y-10">
          <h2 className="font-bold text-3xl">Chat</h2>
          <ChatBox></ChatBox>
        </div>
        <div className="bg-base-300 rounded-3xl p-10 space-y-4">
          <h2 className="font-bold text-3xl">Use the chatbot elsewhere</h2>

          <ApiSnippets languages={languages}></ApiSnippets>
        </div>
      </div>
    </>
  );
}
