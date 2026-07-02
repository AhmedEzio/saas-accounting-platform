import PaymentTransaction from "../../models/PaymentTransaction.js";

export const getAllPaymentsDashboard = async (query) => {
  const { invoiceId, clientId, source, from, to, page = 1, limit = 20 } = query;

  const filter = {};

  if (invoiceId) filter.invoiceId = invoiceId;
  if (clientId) filter.clientId = clientId;
  if (source) filter.source = source;

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await PaymentTransaction.countDocuments(filter);

  const payments = await PaymentTransaction.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("invoiceId", "invoiceNumber invoiceType finalAmount dueAmount")
    .populate("clientId", "name phone type")
    .populate("paidBy", "name email")
    .lean();

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.ceil(total / Number(limit)),
    payments,
  };
};
