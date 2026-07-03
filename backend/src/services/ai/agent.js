import { createAgent } from "langchain";
import { HumanMessage } from "@langchain/core/messages";
import { ITIChatModel } from "./customLLM.js";
import { SYSTEM_PROMPT } from "./systemPrompt.js";
import { addInvoiceTool, searchInvoicesTool } from "./tools/invoiceTools.js";
import {
  createClientTool,
  getClientsTool,
  searchClientTool,
} from "./tools/clientTools.js";
import { createPaymentTool, getPaymentsTool } from "./tools/paymentTools.js";
import { z } from "zod";

const tools = [
  searchInvoicesTool,
  addInvoiceTool,
  createClientTool,
  getClientsTool,
  searchClientTool,
  createPaymentTool,
  getPaymentsTool,
];
const model = new ITIChatModel({});

const contextSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  imageUrl: z.string().optional(),
});
const agent = createAgent({
  model,
  tools,
  systemPrompt: SYSTEM_PROMPT,
  contextSchema,
});

export async function runAgent(userMessage, userId, sessionId, imageUrl) {
  console.log(`\n[Agent] Processing: "${userMessage}"`);
  const result = await agent.invoke(
    {
      messages: [new HumanMessage(userMessage)],
    },
    {
      context: {
        userId: String(userId),
        sessionId: String(sessionId),
        imageUrl: String(imageUrl),
      },
    },
  );
  const last = result.messages.at(-1);
  return typeof last?.content === "string"
    ? last.content
    : JSON.stringify(last?.content ?? "");
}
