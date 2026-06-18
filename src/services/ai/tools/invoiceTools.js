import { z } from "zod";
import { tool, createAgent } from "langchain";
import chatSession from "../../../models/chatSession.js";
import chatMessage from "../../../models/chatMessage.js";
import AppError from "../../../utils/appError.js";
import { getVectorStore, getLLM } from "../vector.js";
import { createWorker } from "tesseract.js";
import Client from "../../../models/Client.js";

export const searchInvoicesTool = tool(
  async ({ question }, config) => {
    const { userId, sessionId } = config.context;

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

export const addInvoiceTool = tool(
  async ({ clientEmail }, config) => {
    const { userId, imageUrl } = config.context;
    const llm = getLLM();
    // const result = await model.invoke([
    //   {
    //     type: "text",
    //     text: `
    //   Extract all invoice information as JSON.
    // `,
    //   },
    //   {
    //     type: "image_url",
    //     image_url: {
    //       imageUrl,
    //     },
    //   },
    // ]);
    console.log(imageUrl);
    const worker = await createWorker("eng");
    const result = await worker.recognize(imageUrl);
    console.log(result.data.text);
    await worker.terminate();
    const client = await Client.findOne({
      email: clientEmail,
      accountantId: userId,
    });

    if (!client) {
      throw new Error("Client/Vendor not found");
    }
    const prompt = `
Extract invoice data from the text below and return ONLY valid JSON.

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
    const res = await llm.invoke(prompt);
    const json = JSON.parse(res.content);
  },
  {
    name: "add_invoice",
    description: "add invoice into db",
    schema: z.object({ clientEmail: z.string().email() }),
  },
);
