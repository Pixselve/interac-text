"use server";
import Forms from "@/app/settings/Forms";
import { cookies } from "next/headers";
import { getIndexes } from "@/lib/pinecone";
import { CookiesEnum } from "@/lib/cookies";
import { cache } from 'react';



const getIndexesCache = cache(async (environment: string, apiKey: string) => {
    return await getIndexes({
        environment: environment,
        apiKey: apiKey,
    });
})


export default async function Settings() {
  const pineconeEnvironment = cookies().get(
    CookiesEnum.pineconeEnvironment
  )?.value;
  const pineconeApiKey = cookies().get(CookiesEnum.pineconeApiKey)?.value;
  const pineconeIndex = cookies().get(CookiesEnum.pineconeIndex)?.value;
  const openAIApiKey = cookies().get(CookiesEnum.openAIApiKey)?.value;

  let pineconeIndexes: string[] | null = null;

  if (pineconeEnvironment && pineconeApiKey) {
    // get indexes
    try {
      pineconeIndexes = await getIndexesCache(pineconeEnvironment, pineconeApiKey);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <main className="max-w-3xl m-auto space-y-10">
      <h1 className="text-5xl font-bold">🛠️ Settings</h1>
      <Forms
        pineconeApiKey={pineconeApiKey}
        pineconeEnvironment={pineconeEnvironment}
        pineconeIndexes={pineconeIndexes}
        openAIApiKey={openAIApiKey}
        pineconeIndex={pineconeIndex}
      ></Forms>
    </main>
  );
}
