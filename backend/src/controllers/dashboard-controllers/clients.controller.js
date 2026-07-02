import Client from "../../models/Client.js";
import { getAllClientsAdmin } from "../../services/dashboard-services/clients.service.js";

// GET /api/dashbaord/clients?type=vendor|client&search=...
export const getAllClients = async (req, res) => {
  try {
    const { type, search } = req.query;

    const clients = await getAllClientsAdmin({ type, search });    
    return res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
