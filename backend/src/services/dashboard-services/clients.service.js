import Client from "../../models/Client.js";
// GET /api/dashbaord/clients?type=vendor|client&search=...
export async function getAllClientsAdmin({ type, search }) {
  const filter = {
    // isActive: true,
  };

  if (type) {
    if (!["client", "vendor"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Use 'client' or 'vendor'",
      });
    }

    filter.type = type;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }  

  return await Client.find(filter).sort({ createdAt: -1 });
}
