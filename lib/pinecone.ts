"use server";
import { PineconeClient } from "@pinecone-database/pinecone";
import { cookies } from "next/headers";
import { CookiesEnum } from "@/lib/cookies";
import { DescribeIndexStatsResponse } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";

const pinecone = new PineconeClient();

export async function getIndexes({
  environment,
  apiKey,
}: {
  environment: string;
  apiKey: string;
}): Promise<string[]> {
  await pinecone.init({
    environment: environment,
    apiKey: apiKey,
  });

  return await pinecone.listIndexes();
}

export async function getIndexAndSetCookies({
  environment,
  apiKey,
}: {
  environment: string;
  apiKey: string;
}) {
  const indexes = await getIndexes({ environment, apiKey });
  cookies().set(CookiesEnum.pineconeEnvironment, environment);
  cookies().set(CookiesEnum.pineconeApiKey, apiKey);
  return indexes;
}

export async function saveIndexToCookies(index: string) {
  cookies().set(CookiesEnum.pineconeIndex, index);
}

export async function createIndex(
  name: string,
  environment: string,
  apiKey: string
) {
  await pinecone.init({
    environment: environment,
    apiKey: apiKey,
  });
  return await pinecone.createIndex({
    createRequest: {
      name: name,
      dimension: 1536,
    },
  });
}

export async function getStats(
  environment: string,
  apiKey: string,
  indexName: string
): Promise<DescribeIndexStatsResponse> {
  await pinecone.init({
    environment: environment,
    apiKey: apiKey,
  });
  const index = pinecone.Index(indexName);
  return await index.describeIndexStats({
    describeIndexStatsRequest: {},
  });
}

/**
 * Converts a plain text file to embeddings
 * @param file the file to convert
 * @returns the embeddings
 */
export async function plainTextFileToEmbeddings(
  body: FormData,
  sourceDisplayName: string,
  chunkSize: number = 1000
) {
  // get the cookies
  const environment = cookies().get(CookiesEnum.pineconeEnvironment);
  const apiKey = cookies().get(CookiesEnum.pineconeApiKey);
  const indexName = cookies().get(CookiesEnum.pineconeIndex);
  const openAIApiKey = cookies().get(CookiesEnum.openAIApiKey);

  // check if cookies are set
  if (!environment || !apiKey || !indexName || !openAIApiKey) {
    return new Response(
      JSON.stringify({
        msg: "no cookies",
      }),
      {
        status: 400,
      }
    );
  }

  const environmentValue = environment.value;
  const apiKeyValue = apiKey.value;
  const indexNameValue = indexName.value;
  const openAIApiKeyValue = openAIApiKey.value;

  // print file contents
  const file = body.get("file") as File;
  if (!file || typeof file === "string") {
    return new Response(
      JSON.stringify({
        msg: "no file",
      }),
      {
        status: 400,
      }
    );
  }
  const ab = await file.arrayBuffer();
  const bf = Buffer.from(ab);
  const contents = bf.toString();

  // add to pinecone
  await pinecone.init({
    environment: environmentValue,
    apiKey: apiKeyValue,
  });
  const index = pinecone.Index(indexNameValue);

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
  });
  const docs = await textSplitter.createDocuments(
    [contents],
    [
      {
        sourceDisplayName: sourceDisplayName,
      },
    ]
  );

  await PineconeStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: openAIApiKeyValue,
    }),
    {
      pineconeIndex: index,
    }
  );

  return;
}

export async function askQuestion(question: string) {
  // get the cookies
  const environment = cookies().get(CookiesEnum.pineconeEnvironment);
  const apiKey = cookies().get(CookiesEnum.pineconeApiKey);
  const indexName = cookies().get(CookiesEnum.pineconeIndex);
  const openAIApiKey = cookies().get(CookiesEnum.openAIApiKey);

  // check if cookies are set
  if (!environment || !apiKey || !indexName || !openAIApiKey) {
    throw new Error("no cookies");
  }

  const environmentValue = environment.value;
  const apiKeyValue = apiKey.value;
  const indexNameValue = indexName.value;
  const openAIApiKeyValue = openAIApiKey.value;

  // add to pinecone
  await pinecone.init({
    environment: environmentValue,
    apiKey: apiKeyValue,
  });
  const index = pinecone.Index(indexNameValue);

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({
      openAIApiKey: openAIApiKeyValue,
    }),
    { pineconeIndex: index }
  );


  const model = new OpenAI({
    openAIApiKey: openAIApiKeyValue,
  });

  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 1,
    returnSourceDocuments: true,
  });

  const response = await chain.call({ query: question });

  return {
    text: response.text,
    sourceDocuments: response.sourceDocuments.map((doc: any) => { return doc.metadata.sourceDisplayName })
  };
}


export async function getAllEmbeddings(dimensions: number = 1536) {
  // get the cookies
  const environment = cookies().get(CookiesEnum.pineconeEnvironment);
  const apiKey = cookies().get(CookiesEnum.pineconeApiKey);
  const indexName = cookies().get(CookiesEnum.pineconeIndex);
  const openAIApiKey = cookies().get(CookiesEnum.openAIApiKey);

  // check if cookies are set
  if (!environment || !apiKey || !indexName || !openAIApiKey) {
    throw new Error("no cookies");
  }

  const environmentValue = environment.value;
  const apiKeyValue = apiKey.value;
  const indexNameValue = indexName.value;
  const openAIApiKeyValue = openAIApiKey.value;

  // add to pinecone
  await pinecone.init({
    environment: environmentValue,
    apiKey: apiKeyValue,
  });
  const index = pinecone.Index(indexNameValue);

  const embeddings = await index.query({
    queryRequest: {
      topK: 1000,
      vector: new Array(dimensions).fill(0),
      includeMetadata: true,
      includeValues: false,
    }
  });

  // group by source display name
  const groupedEmbeddings = new Map<string, string[]>();
  if (!embeddings.matches) {
    return groupedEmbeddings;
  }
    for (const match of embeddings.matches) {
      if (!match.metadata) {
        continue;
      }
        // @ts-ignore
      const sourceDisplayName = match.metadata.sourceDisplayName;
        if (!groupedEmbeddings.has(sourceDisplayName)) {
            groupedEmbeddings.set(sourceDisplayName, []);
        }
        // @ts-ignore
      groupedEmbeddings.get(sourceDisplayName)?.push(match.metadata.text);
    }

    return groupedEmbeddings;
}
