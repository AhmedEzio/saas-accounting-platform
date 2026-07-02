import Client from "../models/Client.js";

export const createClientService = async (accountantId, data) => {
  const { name, type, phone, email, address, notes } = data;

  if (!name || !type) throw new Error("Name and type are required");

  if (!["client", "vendor"].includes(type)) throw new Error("Invalid type");

  const exists = await Client.findOne({
    accountantId,
    email,
  });

  if (exists) throw new Error("Client already exists");

  return await Client.create({
    accountantId,
    name,
    type,
    phone,
    email,
    address,
    notes,
  });
};
