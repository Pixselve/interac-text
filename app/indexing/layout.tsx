import Link from "next/link";
import { cookies } from "next/headers";
import { CookiesEnum } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { getAllEmbeddings, getStats } from "@/lib/pinecone";

export default async function ({ children }: { children: any }) {
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
  const documentsKeysToArr = Array.from(documents.keys());

  return (
    <>
      <div className="flex h-full">
        <ul className="menu bg-base-100 w-56 p-2 rounded-box h-full">
          <li>
            <div className="stat">
              <div className="stat-title">Embedding count</div>
              <div className="stat-value">{stats.totalVectorCount}</div>
            </div>
          </li>
          <li className="mb-4">
            <Link href="/indexing/new" className="btn">
              Add a document
            </Link>
          </li>

          <li className="menu-title">
            <span>Documents</span>
          </li>
          {documentsKeysToArr.map((key) => (
            <li key={key}>
              <Link
                href={`/indexing/document/${key}`}
              >
                🗒️ {key}
              </Link>
            </li>
          ))}
        </ul>
        <div className="bg-base-200 grow p-10 rounded-3xl">{children}</div>
      </div>
    </>
  );
}
