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

const model = new ITIChatModel({});

const contextSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  imageUrl: z.string().optional(),
});
const READ_ONLY_TOOLS = [
  getClientsTool,
  searchClientTool,
  searchInvoicesTool,
  getPaymentsTool,
];

const WRITE_TOOL_GROUPS = {
  clientTools: {
    label: "client write tools",
    tools: [createClientTool],
    intent:
      /\b(create|add|new|register)\b[\s\S]{0,40}\b(client|clients|vendor|vendors|customer|customers)\b/i,
  },
  invoiceTools: {
    label: "invoice write tools",
    tools: [addInvoiceTool],
    intent:
      /\b(create|add|extract|upload|save|new)\b[\s\S]{0,40}\b(invoice|invoices|bill|bills)\b/i,
  },
  paymentTools: {
    label: "payment write tools",
    tools: [createPaymentTool],
    intent:
      /\b(record|create|add|pay|settle|new)\b[\s\S]{0,40}\b(payment|payments|transaction|transactions|receipt|receipts)\b/i,
  },
};

const normalizeFeatures = (features = {}) => ({
  aiChat: Boolean(features.aiChat),
  clientTools: Boolean(features.clientTools),
  invoiceTools: Boolean(features.invoiceTools),
  paymentTools: Boolean(features.paymentTools),
});

const buildAllowedTools = (features = {}) => {
  const normalized = normalizeFeatures(features);
  const readTools = normalized.aiChat ? READ_ONLY_TOOLS : [];
  const writeTools = Object.entries(WRITE_TOOL_GROUPS).flatMap(
    ([feature, group]) => (normalized[feature] ? group.tools : []),
  );

  return [...readTools, ...writeTools];
};

const getDeniedToolGroup = (userMessage, features = {}) => {
  const normalized = normalizeFeatures(features);

  return Object.entries(WRITE_TOOL_GROUPS).find(
    ([feature, group]) => !normalized[feature] && group.intent.test(userMessage),
  )?.[1];
};

const getUsageFromMessages = (messages = []) => {
  return messages.reduce(
    (usage, message) => {
      const metadata = message.usage_metadata ?? {};
      const tokenUsage = message.response_metadata?.tokenUsage ?? {};

      const inputTokens =
        metadata.input_tokens ??
        tokenUsage.input_tokens ??
        tokenUsage.prompt_tokens ??
        0;
      const outputTokens =
        metadata.output_tokens ??
        tokenUsage.output_tokens ??
        tokenUsage.completion_tokens ??
        0;
      const summedTokens = inputTokens + outputTokens;
      const totalTokens =
        summedTokens > 0
          ? summedTokens
          : metadata.total_tokens ?? tokenUsage.total_tokens ?? 0;

      usage.inputTokens += Number(inputTokens) || 0;
      usage.outputTokens += Number(outputTokens) || 0;
      usage.totalTokens += Number(totalTokens) || 0;

      return usage;
    },
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
  );
};

export async function runAgent(
  userMessage,
  userId,
  sessionId,
  imageUrl,
  features = {},
) {
  console.log(`\n[Agent] Processing: "${userMessage}"`);
  const deniedGroup = getDeniedToolGroup(userMessage, features);

  if (deniedGroup) {
    return {
      content: `Your current subscription does not include ${deniedGroup.label}. Please upgrade to a plan that includes this feature to use it.`,
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      shouldConsumeCredits: false,
    };
  }

  const tools = buildAllowedTools(features);
  const agent = createAgent({
    model,
    tools,
    systemPrompt:
      tools.length > 0
        ? SYSTEM_PROMPT
        : `${SYSTEM_PROMPT}\n\nThe current subscription only allows AI chat without tools. Do not claim to create, search, list, or update clients, invoices, or payments. If the user requests those actions, tell them they need to upgrade to a plan with tools.`,
    contextSchema,
  });

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
  return {
    content:
      typeof last?.content === "string"
        ? last.content
        : JSON.stringify(last?.content ?? ""),
    usage: getUsageFromMessages(result.messages),
    shouldConsumeCredits: true,
  };
}
