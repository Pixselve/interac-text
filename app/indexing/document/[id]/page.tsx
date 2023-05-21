import { getAllEmbeddings, getStats } from "@/lib/pinecone";
import { cookies } from "next/headers";
import { CookiesEnum } from "@/lib/cookies";
import { redirect } from "next/navigation";

export default async function ({ params }: { params: any }) {
  const pineconeApiKey = cookies().get(CookiesEnum.pineconeApiKey)?.value;
  const pineconeIndex = cookies().get(CookiesEnum.pineconeIndex)?.value;
  const pineconeEnvironment = cookies().get(
    CookiesEnum.pineconeEnvironment
  )?.value;

  if (!pineconeApiKey || !pineconeIndex || !pineconeEnvironment) {
    // redirect to settings
    redirect("/settings");
  }
  const stats = await getStats(
    pineconeEnvironment,
    pineconeApiKey,
    pineconeIndex
  );
  const documents = await getAllEmbeddings(stats.dimension);

  const sourceDisplayName = decodeURIComponent(params.id);

  const document = documents.get(sourceDisplayName);

  if (!document) {
    redirect("/indexing");
  }

  const getColor = (index: number) => {
    // use tailwind color palette
    const colors = [
      "bg-red-600",
      "bg-green-600",
      "bg-blue-600",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-2xl">
        🗒️ {sourceDisplayName} ({document.length} embeddings)
      </h1>
      <div className="bg-base-300 p-10 rounded-xl">
        {document.map((text, index) => (
          <span className="tooltip inline" data-tip={`Embedding #${index} - ${text.length} characters`}>
            <span key={index} className={`text-white ${getColor(index)}`}>
              {text}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
