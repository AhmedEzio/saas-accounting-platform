import Invoice from "../../models/Invoice.js";

export const getAllInvoicesAdmin = async (query) => {
  const {
    invoiceType,
    clientId,
    paymentMethod,
    expenseType,
    paymentStatus,
    from,
    to,
    page = 1,
    limit = 20,
    includeCancelled,
  } = query;

  const filter = {};

  if (includeCancelled !== "true") {
    filter.isCancelled = false;
  }

  if (invoiceType) filter.invoiceType = invoiceType;
  if (clientId) filter.clientId = clientId;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (expenseType) filter.expenseType = expenseType;

  if (paymentStatus === "paid") {
    filter.dueAmount = 0;
  }

  if (paymentStatus === "partial") {
    filter.amountPaid = { $gt: 0 };
    filter.dueAmount = { $gt: 0 };
  }

  if (paymentStatus === "unpaid") {
    filter.amountPaid = 0;
    filter.dueAmount = { $gt: 0 };
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Invoice.countDocuments(filter);

  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("clientId", "name phone type")
    .populate("createdBy", "name email")
    .lean({ virtuals: true });

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.ceil(total / Number(limit)),
    invoices,
  };
};
