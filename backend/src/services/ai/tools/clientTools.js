import { z } from "zod";
import { tool } from "langchain";
import Client from "../../../models/Client.js";
import { createClientService } from "../../client.service.js";

export const createClientTool = tool(
  async ({ name, email, phone, type }, config) => {
    const { userId } = config.context;
    console.log("dddddd");
    console.log(userId);
    const client = await createClientService(userId, {
      name,
      email,
      phone,
      type,
    });

    return JSON.stringify(client);
  },
  {
    name: "create_client",
    description: "Create a new client",
    schema: z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
      type: z.enum(["client", "vendor"]),
    }),
  },
);

export const getClientsTool = tool(
  async ({ type }, config) => {
    try {
      const { userId } = config.context;

      const filter = { accountantId: userId, isActive: true };
      if (type) filter.type = type;

      const [clients, total] = await Promise.all([
        Client.find(filter)
          .sort({ createdAt: -1 })
          .select("name email phone type currentBalance isActive createdAt")
          .lean(),
        Client.countDocuments(filter),
      ]);

      if (!clients.length) {
        return `No ${type ?? "clients or vendors"} found for this account.`;
      }

      return JSON.stringify({
        success: true,
        total,
        clients,
      });
    } catch (err) {
      return JSON.stringify({ success: false, message: err.message });
    }
  },
  {
    name: "get_clients",
    description:
      "List the user's active clients or vendors. Can optionally filter by type ('client' or 'vendor') . Use this when the user asks to see their clients, vendors, or contact list.",
    schema: z.object({
      type: z
        .enum(["client", "vendor"])
        .optional()
        .describe("Filter by client type: 'client' or 'vendor'"),
    }),
  },
);

export const searchClientTool = tool(
  async ({ query }, config) => {
    try {
      const { userId } = config.context;

      const clients = await Client.find({
        accountantId: userId,
        isActive: true,
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { phone: { $regex: query, $options: "i" } },
        ],
      })
        .select("_id name email phone type currentBalance")
        .limit(10)
        .lean();

      if (!clients.length) {
        return `No clients or vendors found matching "${query}".`;
      }

      return JSON.stringify({ success: true, clients });
    } catch (err) {
      return JSON.stringify({ success: false, message: err.message });
    }
  },
  {
    name: "search_client",
    description:
      "Search for a client or vendor by name, email, or phone number. Use this before creating an invoice or payment when you need to resolve the client's ID from a name or partial detail provided by the user.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "The search term — could be the client's name, email, or phone number",
        ),
    }),
  },
);
