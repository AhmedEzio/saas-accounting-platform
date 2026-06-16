import chatSession from "../models/chatSession.js";
import chatMessage from "../models/chatMessage.js";

import AppError from "../utils/appError.js";
import {
  getPineconeIndex,
  getEmbeddings,
  getNamespace,
  getVectorStore,
  getLLM,
} from "../services/ai/vector.js";
import { Document } from "@langchain/core/documents";
import { PineconeStore } from "@langchain/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import Client from "../models/Client.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";
export const createChatSession = async (req, res, next) => {
  try {
    const title = req.body.title || "New Chat";

    const session = await chatSession.create({ userId: req.user._id, title });
    res.status(201).json({
      message: "Session created",
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await chatSession.find();
    res.status(200).json({
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserSessions = async (req, res, next) => {
  try {
    const sessions = await chatSession.find({ userId: req.user._id });
    res.status(200).json({
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
};

export const sessionMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await chatSession.findOne({
      userId: req.user._id,
      _id: sessionId,
    });
    if (!session) {
      throw new AppError("Session not found or you do not have access.", 404);
    }
    const result = await chatMessage.find({ sessionId });

    res.status(200).json({
      data: {
        result,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const addAllVectors = async (req, res, next) => {
  try {
    const index = getPineconeIndex();
    const embeddings = getEmbeddings();
    const users = await User.find();
    // for (const user of users) {
    // await index.deleteNamespace(
    //   "user_{ _id: new ObjectId('6a2fb0db9f046e40d47dabbb'), name: 'Ahmed', email: 'ahmed@test.com' }",
    // );
    // }

    const clients = await Client.find();
    const invoices = await Invoice.find()
      .populate("clientId", "name phone")
      .populate("accountantId", "name email");

    let sz = 0;
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    for (const invoice of invoices) {
      const doc = new Document({
        pageContent: `
      Invoice Number: ${invoice.invoiceNumber}
      Invoice Type: ${invoice.invoiceType}

      Client Name: ${invoice.clientId?.name}
      Client Phone: ${invoice.clientId?.phone}

      Base Amount: ${invoice.baseAmount}
      Final Amount: ${invoice.finalAmount}
      Amount Paid: ${invoice.amountPaid}
      Due Amount: ${invoice.dueAmount}

      Payment Method: ${invoice.paymentMethod}

      Items:
      ${invoice.items
        .map(
          (item) =>
            `- ${item.description}
            Qty: ${item.quantity}
            Unit Price: ${item.unitPrice}
            Total: ${item.totalPrice}`,
        )
        .join("\n")}
      `,
        metadata: {
          type: "invoice",
          invoiceId: invoice._id.toString(),
          invoiceNumber: invoice.invoiceNumber,
        },
      });

      // const chunks = await splitter.splitDocuments([doc]);
      const vectorStore = await getVectorStore(invoice.accountantId._id);
      await vectorStore.addDocuments([doc]);
      sz += doc.length;
    }
    return res.status(200).json({
      totalChunks: sz,
      message: "data successfully added into Pinecone.",
    });
  } catch (err) {
    next(err);
  }
};

export async function addInvoice(invoice) {
  const vectorStore = await getVectorStore(invoice.accountantId._id);
  const invoiceId = invoice._id.toString();
  await vectorStore.addDocuments([
    new Document({
      pageContent: `
      Invoice Number: ${invoice.invoiceNumber}
      Invoice Type: ${invoice.invoiceType}

      Client Name: ${invoice.clientId?.name}
      Client Phone: ${invoice.clientId?.phone}

      Base Amount: ${invoice.baseAmount}
      Final Amount: ${invoice.finalAmount}
      Amount Paid: ${invoice.amountPaid}
      Due Amount: ${invoice.dueAmount}

      Payment Method: ${invoice.paymentMethod}

      Items:
      ${invoice.items
        .map(
          (item) =>
            `- ${item.description}
            Qty: ${item.quantity}
            Unit Price: ${item.unitPrice}
            Total: ${item.totalPrice}`,
        )
        .join("\n")}
      `,
      metadata: {
        type: "invoice",
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
      },
    }),
  ]);

  return invoiceId;
}

export const chat = async (req, res, next) => {
  try {
    const { question, sessionId } = req.body;
    const vectorStore = await getVectorStore(req.user._id);
    const retriever = vectorStore.asRetriever({ k: 3 });
    const relevantDocs = await retriever.invoke(question);
    const context = relevantDocs
      .map(
        (doc, index) => `
[Document ${index + 1}]
${doc.pageContent}
`,
      )
      .join("\n\n");
    if (context.length === 0) {
      return {
        answer:
          "I couldn't find any indexed invoice documents related to your question. Upload documents with OCR text and run indexing first.",
      };
    }
    const session = await chatSession.findOne({
      userId: req.user._id,
      _id: sessionId,
    });
    if (!session) {
      throw new AppError("Session not found or you do not have access.", 404);
    }
    const history = await chatMessage.find({ sessionId });
    const historyText = history
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const llm = getLLM();
    const prompt = `You are an accounting assistant for an invoice management system.
    Answer the user's question using ONLY the context below.
    If the context does not contain enough information, say that clearly instead of guessing.

    Context:
    ${context}

    Question: ${question}
    `;
    console.log(context);

    const systemPrompt = `You are an expert accounting assistant. 
Answer questions based on the provided invoice documents and financial data.
If the answer is not in the provided context, say so clearly but still help with general accounting knowledge.
Always be precise with numbers and dates.
Reply in the same language as the user's question.`;

    const userPrompt = `${historyText ? `Previous conversation:\n${historyText}\n\n` : ""}Relevant document context:
${context || "No relevant documents found in vector store."}

User question: ${question}

Provide a clear, accurate answer. If using information from the context, reference which source you used.`;

    const response = await llm.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
    const answer = response.content;

    await chatMessage.create({
      sessionId,
      content: question,
      from: "user",
    });
    await chatMessage.create({
      sessionId,
      content: answer,
      from: "ai",
    });
    return res.status(200).json({
      answer,
    });
  } catch (err) {
    next(err);
  }
};
