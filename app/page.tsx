import Link from "next/link";

export default function Home() {
  return (
      <div className="hero bg-base-200 h-full">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Chat with your own data.</h1>
            <p className="py-6">Use your own OpenAI and Pinecone API keys and start chatting with your documents.</p>
            <Link href="/settings" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </div>
  );
}
