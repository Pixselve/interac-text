import { z } from "zod";
import { getAnswer } from "@/lib/pinecone";

const bodySchema = z.object({
  text: z.string().min(1).max(1000),
});

const headersSchema = z.object({
  "open-ai-key": z.string(),
  "pinecone-api-key": z.string(),
  "pinecone-index": z.string(),
  "pinecone-environment": z.string(),
});

export async function POST(request: Request) {
  // check if the body is empty
  if (request.headers.get("content-length") === "0") {
    return new Response(
      JSON.stringify({
        error: "empty body",
        message: "The body of the request is empty",
      }),
      { status: 400 }
    );
  }
  const body = await request.json();

  // request headers to object {key: value}

  const headers = Object.fromEntries(request.headers);
  console.log(headers);

  const parsedBody = bodySchema.safeParse(body);
  if (!parsedBody.success) {
    return new Response(
      JSON.stringify({
        error: parsedBody.error,
        message: "Invalid body",
      }),
      { status: 400 }
    );
  }
  const parsedHeaders = headersSchema.safeParse(headers);
  if (!parsedHeaders.success) {
    return new Response(
      JSON.stringify({
        error: parsedHeaders.error,
        message: "Invalid headers",
      }),
      { status: 400 }
    );
  }

  const { text } = parsedBody.data;

  try {
    const answer = await getAnswer(text, {
      pinecone: {
        environment: parsedHeaders.data["pinecone-environment"],
        apiKey: parsedHeaders.data["pinecone-api-key"],
        indexName: parsedHeaders.data["pinecone-index"],
      },
      openai: {
        apiKey: parsedHeaders.data["open-ai-key"],
      },
    });

    return new Response(
      JSON.stringify({
        answer,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: e,
        message: "Something went wrong",
      }),
      { status: 400 }
    );
  }
}
