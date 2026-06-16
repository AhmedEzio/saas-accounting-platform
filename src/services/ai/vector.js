import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";

export function getEmbeddings() {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-embedding-2",
    outputDimensionality: 3072,
  });
  return embeddings;
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
export function getLLM() {
  return new ChatGoogleGenerativeAI({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_API_KEY?.trim(),
    temperature: 0.3,
    maxRetries: 2,
  });
}
