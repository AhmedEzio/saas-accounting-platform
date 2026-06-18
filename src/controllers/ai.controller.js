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
import {
  searchInvoicesTool,
  addInvoiceTool,
} from "../services/ai/tools/invoiceTools.js";
import { createClientTool } from "../services/ai/tools/clientTools.js";
import { createAgent } from "langchain";
import { uploadFileToCloudinary } from "../middleware/uploadToCloud.js";

import { z } from "zod";

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
const contextSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  imageUrl: z.string().optional(),
});
export const chat = async (req, res, next) => {
  try {
    const { question, sessionId } = req.body;
    const userId = req.user._id;

    if (!question || !sessionId) {
      return next(new AppError("question and sessionId are required", 400));
    }

    const session = await chatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return next(new AppError("Session not found", 404));
    }
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadFileToCloudinary(req.file).secure_url;
    }
    const agent = createAgent({
      model: getLLM(),
      tools: [searchInvoicesTool, createClientTool, addInvoiceTool],
      systemPrompt: `You are a helpful AI assistant inside a chat system with session support.
Rules:
- Answer clearly and directly.
- Use the 'search_invoices' tool only when the question depends on the user's invoice data or chat history.
-use the 'create_client' tool  when creating a client only
-use the 'add_invoice' tool when the user wants to add invoice image
- Do not hallucinate missing information.
- Keep responses concise and helpful.
- Never expose internal tool logic.`,
      contextSchema,
    });

    const result = await agent.invoke(
      { messages: [{ role: "user", content: question }] },
      {
        context: {
          userId: String(userId),
          sessionId: String(sessionId),
          imageUrl,
        },
      },
    );

    const lastMessage = result.messages[result.messages.length - 1];
    const answer =
      typeof lastMessage.content === "string"
        ? lastMessage.content
        : JSON.stringify(lastMessage.content);

    await chatMessage.create({ sessionId, content: question, from: "user" });
    await chatMessage.create({ sessionId, content: answer, from: "ai" });
    return res.status(200).json({ answer });
  } catch (err) {
    next(err);
  }
};
