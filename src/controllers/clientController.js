import Client from "../models/Client.js";

// GET /api/clients?type=vendor|client&search=...
export const getClients = async (req, res) => {
  try {
    const { type, search } = req.query;

    const filter = {
      accountantId: req.user._id,
      isActive: true,
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

    const clients = await Client.find(filter).sort({ createdAt: -1 });

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

// GET /api/clients/:id
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      accountantId: req.user._id,
      isActive: true,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client/Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// POST /api/clients
export const createClient = async (req, res) => {
  try {
    const { name, type, phone, email, address, notes } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Name and type are required",
      });
    }
    ////
    const clientt = await Client.findOne({
      email,
      accountantId: req.user._id,
    });

    if (clientt) {
      return res.status(400).json({
        success: false,
        message: "Client/Vendor already exists",
      });
    }
    ////
    if (!["client", "vendor"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Use 'client' or 'vendor'",
      });
    }

    const client = await Client.create({
      accountantId: req.user._id,
      name,
      type,
      phone,
      email,
      address,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Client/Vendor created successfully",
      data: client,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// PUT /api/clients/:id
export const updateClient = async (req, res) => {
  try {
    const { name, type, phone, email, address, notes } = req.body;

    if (type && !["client", "vendor"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Use 'client' or 'vendor'",
      });
    }

    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        accountantId: req.user._id,
        isActive: true,
      },
      { name, type, phone, email, address, notes },
      { new: true, runValidators: true },
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client/Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client/Vendor updated successfully",
      data: client,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE /api/clients/:id
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        accountantId: req.user._id,
        isActive: true,
      },
      { isActive: false },
      { new: true },
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client/Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client/Vendor deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
