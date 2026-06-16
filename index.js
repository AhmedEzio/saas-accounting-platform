import "dotenv/config.js";
// import "./src/server.js";

// import { ChatOpenAI } from "@langchain/openai";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.5,
  maxRetries: 2,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.Index(process.env.PINECONE_INDEX);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-embedding-2",
});

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { Document } from "@langchain/core/documents";

const rawDocuments = [
  new Document({
    pageContent:
      "LangChain is an orchestration framework designed to simplify the creation of applications using large language models (LLMs). It features modular prompts and chains.",
    metadata: { source: "framework-docs" },
  }),
  new Document({
    pageContent:
      "Pinecone is a cloud-native managed vector database. It allows developers to store, manage, and query dense vector embeddings at lightning speed.",
    metadata: { source: "db-docs" },
  }),
];

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});

const splitDocs = await splitter.splitDocuments(rawDocuments);

const vectorStore = await PineconeStore.fromDocuments(splitDocs, embeddings, {
  pineconeIndex: index,
  maxConcurrency: 5,
  namespace: "test",
});
