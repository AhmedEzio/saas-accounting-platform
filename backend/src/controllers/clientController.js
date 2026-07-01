import Client from "../models/Client.js";

export const getClients = async (req, res, next) => {
  try {
    const {
      type,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {
      accountantId: req.user._id,
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

    const validSortFields = ["createdAt", "currentBalance"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const direction = sortOrder === "asc" ? 1 : -1;

    const sortOptions = {};
    sortOptions[sortField] = direction;

    const start = (Number(page) - 1) * Number(limit);
    const end = Number(page) * Number(limit);

    const total = await Client.countDocuments(filter);

    const clients = await Client.find(filter)
      .sort(sortOptions)
      .skip(start)
      .limit(Number(limit));

    const results = {};
    results.total = total;
    results.data = clients;

    if (Number(page) > 1) results.prevPage = Number(page) - 1;
    if (end < total) results.nextPage = Number(page) + 1;

    return res.status(200).json({
      success: true,
      count: clients.length,
      results,
    });
  } catch (error) {
    if (next) return next(error);

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

// PUT /api/clients/:id
export const reactivateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        accountantId: req.user._id,
        isActive: false,
      },
      { isActive: true },
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
