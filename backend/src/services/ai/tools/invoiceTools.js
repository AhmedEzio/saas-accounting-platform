import { z } from "zod";
import { tool, createAgent } from "langchain";
import chatSession from "../../../models/chatSession.js";
import chatMessage from "../../../models/chatMessage.js";
import AppError from "../../../utils/appError.js";
import { getVectorStore, getLLM } from "../vector.js";
import { createWorker } from "tesseract.js";
import Client from "../../../models/Client.js";
import axios from "axios";
import { createInvoice } from "../../../services/invoice.service.js";
import { uploadFileToCloudinary } from "../../../middleware/uploadToCloud.js";

export const searchInvoicesTool = tool(
  async ({ question }, config) => {
    const { userId, sessionId } = config.context;
    console.log("ahhhhhhhh");
    console.log(userId);
    console.log(sessionId);
    const vectorStore = await getVectorStore(userId);
    const retriever = vectorStore.asRetriever({ k: 3 });
    const relevantDocs = await retriever.invoke(question);

    if (!relevantDocs.length) {
      return "No indexed invoice documents were found related to this question.";
    }

    const context = relevantDocs
      .map((doc, index) => `[Document ${index + 1}]\n${doc.pageContent}`)
      .join("\n\n");

    const history = await chatMessage
      .find({ sessionId })
      .sort({ createdAt: 1 });
    console.log(history);
    console.log(sessionId);
    const historyText = history
      .map((m) => `${m.role === "user" ? "User" : "ai"}: ${m.content}`)
      .join("\n");

    const llm = getLLM();
    const response = await llm.invoke([
      {
        role: "system",
        content:
          "You are an expert accounting assistant. Answer using ONLY the provided context.",
      },
      {
        role: "user",
        content: `${historyText ? `History:\n${historyText}\n\n` : ""}Context:\n${context}\n\nQuestion: ${question}`,
      },
    ]);

    return typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);
  },
  {
    name: "search_invoices",
    description:
      "Search the user's indexed invoice documents to answer questions that depend on their invoice data.",
    schema: z.object({
      question: z.string().describe("The user's question about their invoices"),
    }),
  },
);

// export const addInvoiceTool = tool(
//   async ({ clientEmail }, config) => {
//     const { userId, imageUrl } = config.context;
//     const llm = getLLM();
//     // const result = await model.invoke([
//     //   {
//     //     type: "text",
//     //     text: `
//     //   Extract all invoice information as JSON.
//     // `,
//     //   },
//     //   {
//     //     type: "image_url",
//     //     image_url: {
//     //       imageUrl,
//     //     },
//     //   },
//     // ]);
//     console.log(imageUrl);
//     const worker = await createWorker("eng");
//     const result = await worker.recognize(imageUrl);
//     console.log(result.data.text);
//     await worker.terminate();
//     const client = await Client.findOne({
//       email: clientEmail,
//       accountantId: userId,
//     });

//     if (!client) {
//       throw new Error("Client/Vendor not found");
//     }
//     const prompt = `
// Extract invoice data from the text below and return ONLY valid JSON.

// Text:
// """
// ${text}
// """

// Return format:
// {
//   "invoiceType": "purchase | sale | purchase_return | sales_return | expense",

//   "invoiceNumber": "",

//   "paymentMethod": "cash | card | wallet | bank_transfer",

//   "items": [
//     {
//       "description": "",
//       "quantity": 0,
//       "unitPrice": 0,
//       "totalPrice": 0
//     }
//   ],
//   "baseAmount": 0,
//   "taxPercentage": 0,
//   "taxAmount": 0,
//   "finalAmount": 0,

//   "notes": null
// }

// `;
//     const res = await llm.invoke(prompt);
//     const json = JSON.parse(res.content);
//     console.log(res);
//     return JSON.stringify(json);
//   },
//   {
//     name: "add_invoice",
//     description: "add invoice file data into the db",
//     schema: z.object({ clientEmail: z.string().email() }),
//   },
// );

export const addInvoiceTool = tool(
  async ({ clientEmail }, config) => {
    try {
      const { userId, imageUrl } = config.context;

      console.log("ahhhhhhhh");
      console.log(userId);
      console.log(imageUrl);
      if (!imageUrl) {
        throw new Error("No file provided in tool context");
      }
      const worker = await createWorker("eng");
      const ocrResult = await worker.recognize(imageUrl);
      const text = ocrResult.data.text;
      await worker.terminate();

      console.log("OCR TEXT:", text);

      const client = await Client.findOne({
        email: clientEmail,
        accountantId: userId,
      });

      if (!client) {
        throw new Error("Client/Vendor not found");
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
          "Extract invoice data. Return ONLY JSON with no markdown or explanation.",
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

      const rawOutput = data?.output_text;

      if (!rawOutput) {
        throw new Error("No output_text from AI service");
      }

      const firstBrace = rawOutput.indexOf("{");
      const lastBrace = rawOutput.lastIndexOf("}");

      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No JSON found in AI response");
      }

      const cleaned = rawOutput.slice(firstBrace, lastBrace + 1);
      const json = JSON.parse(cleaned);

      const invoice = await createInvoice(
        {
          ...json,
          clientId: client._id,
          imageUrl,
        },
        userId,
        userId,
      );

      return JSON.stringify({
        success: true,
        data: invoice,
      });
    } catch (err) {
      return JSON.stringify({
        success: false,
        message: err.message,
      });
    }
  },
  {
    name: "add_invoice",
    description:
      "Extract invoice and save it to database. NOTE: If the user requests to add an invoice, assume the image has already been provided in the background context. DO NOT ask the user for an image. Just extract the clientEmail and call this tool.",
    schema: z.object({
      clientEmail: z.string().email(),
    }),
  },
);
