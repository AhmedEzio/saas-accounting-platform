import { z } from "zod";
import { tool } from "langchain";
import Client from "../../../models/Client.js";

export const createClientTool = tool(
  async ({ name, email, phone, type }, config) => {
    const { userId } = config.context;
    const client = await Client.create({
      name,
      email,
      phone,
      type,
      accountantId: userId,
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
