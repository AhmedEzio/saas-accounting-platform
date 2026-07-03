import chatSession from "../models/chatSession.js";
import chatMessage from "../models/chatMessage.js";
import mongoose from "mongoose";
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
import PaymentTransaction from "../models/PaymentTransaction.js";
import {
  searchInvoicesTool,
  addInvoiceTool,
} from "../services/ai/tools/invoiceTools.js";
import { createClientTool } from "../services/ai/tools/clientTools.js";
import { createAgent } from "langchain";
import { uploadFileToCloudinary } from "../middleware/uploadToCloud.js";

import { z } from "zod";
import axios from "axios";
import { getLLMm } from "../services/ai/vector.js";
import { runAgent } from "../services/ai/agent.js";

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

export const deleteSession = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Ensure the session belongs to the requesting user before deleting
    const Session = await chatSession.findOneAndDelete(
      { _id: sessionId, userId },
      { session },
    );

    if (!Session) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Chat session not found" });
    }

    await chatMessage.deleteMany({ sessionId }, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Chat session and its messages deleted successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting chat session:", err);
    return res.status(500).json({ message: "Failed to delete chat session" });
  }
};
export const addAllVectors = async (req, res, next) => {
  try {
    const index = getPineconeIndex();
    const embeddings = getEmbeddings();

    const invoices = await Invoice.find()
      .populate("clientId", "name phone")
      .populate("accountantId", "name email");

    let sz = 0;
    for (const invoice of invoices) {
      const doc = new Document({
        pageContent: `
      Invoice Number: ${invoice.invoiceNumber}
      Invoice Type: ${invoice.invoiceType}

      Client Name: ${invoice.clientId?.name || "N/A"}
      Client Phone: ${invoice.clientId?.phone || "N/A"}

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
      const vectorStore = await getVectorStore(invoice.accountantId._id);
      await vectorStore.addDocuments([doc]);
      sz += 1;
    }

    const paymentTransactions = await PaymentTransaction.find()
      .populate("accountantId", "name email")
      .populate("clientId", "name phone")
      .populate("invoiceId", "invoiceNumber");

    for (const pt of paymentTransactions) {
      const doc = new Document({
        pageContent: `
      Transaction Type: Payment
      Direction: ${pt.direction === "in" ? "Incoming" : "Outgoing"}
      Amount: ${pt.amount}
      Payment Method: ${pt.paymentMethod}
      Source: ${pt.source}
      
      Client Name: ${pt.clientId?.name || "N/A"}
      Invoice Number: ${pt.invoiceId?.invoiceNumber || "N/A"}
      
      Recorded By: ${pt.paidBy?.name || "N/A"}
      Notes: ${pt.notes || "None"}
      `,
        metadata: {
          type: "payment_transaction",
          transactionId: pt._id.toString(),
          invoiceId: pt.invoiceId?._id?.toString() || "",
          clientId: pt.clientId?._id?.toString() || "",
        },
      });
      const accountantId = pt.accountantId._id ;
      const vectorStore = await getVectorStore(accountantId);
      await vectorStore.addDocuments([doc]);
      sz += 1;
    }

    return res.status(200).json({
      totalDocumentsAdded: sz,
      message:
        "Invoices and Payment Transactions successfully added into Pinecone.",
    });
  } catch (err) {
    next(err);
  }
};
// export const addAllVectors = async (req, res, next) => {
//   try {
//     const index = getPineconeIndex();

//     const invoices = await Invoice.find()
//       .populate("clientId", "name phone")
//       .populate("accountantId", "name email");

//     let totalVectors = 0;

//     for (const invoice of invoices) {
//       const text = `
// Invoice Number: ${invoice.invoiceNumber}
// Invoice Type: ${invoice.invoiceType}

// Client Name: ${invoice.clientId?.name}
// Client Phone: ${invoice.clientId?.phone}

// Base Amount: ${invoice.baseAmount}
// Final Amount: ${invoice.finalAmount}
// Amount Paid: ${invoice.amountPaid}
// Due Amount: ${invoice.dueAmount}

// Payment Method: ${invoice.paymentMethod}

// Items:
// ${invoice.items
//   .map(
//     (item) => `
// - ${item.description}
// Qty: ${item.quantity}
// Unit Price: ${item.unitPrice}
// Total: ${item.totalPrice}
// `,
//   )
//   .join("\n")}
// `;

//       console.log(process.env.API_KEY);

//       const { data } = await axios.post(
//         `${process.env.API_URL}/student/embed`,
//         {
//           model_id: "amazon.titan-embed-text-v2:0:8k",
//           texts: [text],
//           input_type: "search_document",
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.API_KEY}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );
//       console.log(data);
//       totalVectors++;
//     }

//     return res.status(200).json({
//       success: true,
//       totalVectors,
//       message: "Invoices embedded and stored in Pinecone.",
//     });
//   } catch (err) {
//     next(err);
//   }
// };

export const chat = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { question } = req.body;
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
      let result = await uploadFileToCloudinary(req.file);
      imageUrl = result.secure_url;
    }
    const result = await runAgent(question, userId, sessionId, imageUrl);
    await chatMessage.create({
      sessionId,
      content: question,
      from: "user",
      imageUrl,
    });
    await chatMessage.create({ sessionId, content: result, from: "ai" });
    return res.status(200).json({ result });
  } catch (err) {
    next(err);
  }
};

import { createWorker } from "tesseract.js";

import { createInvoice } from "../services/invoice.service.js";
export const addInvoiceController = async (req, res) => {
  try {
    const { clientEmail } = req.body;
    const userId = req.user._id;

    let imageUrl = "";
    if (req.file) {
      let result = await uploadFileToCloudinary(req.file);
      imageUrl = result.secure_url;
    }
    console.log(imageUrl);

    const worker = await createWorker("eng");
    const ocrResult = await worker.recognize(imageUrl);
    const text = ocrResult.data.text;

    console.log("OCR TEXT:", text);

    await worker.terminate();

    const client = await Client.findOne({
      email: clientEmail,
      accountantId: userId,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client/Vendor not found",
      });
    }

    const prompt = `
    Text:
    """
    ${text}
    """

    Return format:
    {
      "invoiceType": "purchase | sale | purchase_return | sales_return | expense",
      "invoiceNumber": "",
      "paymentMethod": "cash | card | wallet | bank_transfer",
      "items": [
        {
          "description": "",
          "quantity": 0,
          "unitPrice": 0,
          "totalPrice": 0
        }
      ],
      "baseAmount": 0,
      "taxPercentage": 0,
      "taxAmount": 0,
      "finalAmount": 0,
      "notes": null
    }
    `;
    const payload = {
      model_id: "deepseek.v3.2",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      system_prompt:
        "Extract invoice data from the text below and return ONLY valid JSON, with no explanation and no markdown code fences.",
      max_tokens: 1000,
    };
    const { data } = await axios.post(
      `${process.env.API_URL}/student/chat`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("data :::  ");
    console.log(JSON.stringify(data, null, 2));

    const rawOutput = data?.output_text;
    if (!rawOutput) {
      return res.status(502).json({
        success: false,
        message: "Extraction service returned no output_text",
      });
    }

    const firstBrace = rawOutput.indexOf("{");
    const lastBrace = rawOutput.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      console.error("No JSON object found in output_text:", rawOutput);
      return res.status(502).json({
        success: false,
        message: "Extraction service response did not contain a JSON object",
      });
    }

    const cleaned = rawOutput.slice(firstBrace, lastBrace + 1);

    let json;
    try {
      json = JSON.parse(cleaned);
    } catch (err) {
      console.error("Failed to parse invoice JSON:", cleaned);
      return res.status(502).json({
        success: false,
        message: "Extraction service returned invalid JSON",
      });
    }

    const invoice = await createInvoice(
      {
        ...json,
        clientId: client._id,
      },
      req.user._id,
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
