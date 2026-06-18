import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { OpenAIEmbeddings } from "@langchain/openai";

export function getEmbeddings() {
  return new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-3-small",
  });
}

export function getPineconeIndex() {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pinecone.Index(process.env.PINECONE_INDEX);
  return index;
}

export function getNamespace(userId) {
  return `user_${userId.toString()}`;
}

export async function getVectorStore(userId) {
  return PineconeStore.fromExistingIndex(getEmbeddings(), {
    pineconeIndex: getPineconeIndex(),
    namespace: getNamespace(userId),
  });
}
// export function getLLM() {
//   return new ChatGoogleGenerativeAI({
//     model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
//     apiKey: process.env.GOOGLE_API_KEY?.trim(),
//     temperature: 0.3,
//     maxRetries: 2,
//   });
// }
export function getLLM() {
  return new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.3,
    maxRetries: 2,
  });
}
