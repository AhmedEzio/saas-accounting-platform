import PaymentTransaction from "../../models/PaymentTransaction.js";
import Invoice from "../../models/Invoice.js";
import Client from "../../models/Client.js";
import User from "../../models/User.js";

// Escape regex special characters so user input can't break or hijack the
// query (basic injection / ReDoS guard) before it's used to build a RegExp.
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isValidObjectId = (val) => /^[a-f\d]{24}$/i.test(val);

/**
 * Free-text payments search.
 *
 * Mirrors getAllPaymentsDashboard's existing filters/shape exactly, and adds
 * a single optional `search` param that matches against:
 *   - Invoice number              (Invoice.invoiceNumber)
 *   - Client name / phone / email (Client.name / Client.phone / Client.email)
 *   - Recorded-by user name/email (User.name / User.email)
 *   - Payment notes               (PaymentTransaction.notes)
 *   - Exact payment amount        (if the term is numeric)
 *   - Exact id                    (if the term is a 24-char ObjectId —
 *                                  matches the transaction's own _id,
 *                                  its invoiceId, or its clientId)
 *
 * This is purely additive — invoiceId/clientId/source/from/to keep working
 * exactly as before. `search` only adds extra $or conditions on top.
 */
export const searchPaymentsDashboard = async (query) => {
  const {
    search,
    invoiceId,
    clientId,
    source,
    from,
    to,
    page = 1,
    limit = 20,
  } = query;

  const filter = {};

  if (invoiceId) filter.invoiceId = invoiceId;
  if (clientId) filter.clientId = clientId;
  if (source) filter.source = source;

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const term = (search || "").trim();

  if (term) {
    const regex = new RegExp(escapeRegExp(term), "i");
    const orConditions = [{ notes: regex }];

    if (isValidObjectId(term)) {
      orConditions.push({ _id: term }, { invoiceId: term }, { clientId: term });
    }

    const numericTerm = Number(term);
    if (term !== "" && !Number.isNaN(numericTerm)) {
      orConditions.push({ amount: numericTerm });
    }

    // Resolve text matches against the related collections in parallel,
    // then fold matching ids into the same $or.
    const [invoiceMatches, clientMatches, userMatches] = await Promise.all([
      Invoice.find({ invoiceNumber: regex }).select("_id").lean(),
      Client.find({ $or: [{ name: regex }, { phone: regex }, { email: regex }] })
        .select("_id")
        .lean(),
      User.find({ $or: [{ name: regex }, { email: regex }] })
        .select("_id")
        .lean(),
    ]);

    if (invoiceMatches.length) {
      orConditions.push({ invoiceId: { $in: invoiceMatches.map((d) => d._id) } });
    }
    if (clientMatches.length) {
      orConditions.push({ clientId: { $in: clientMatches.map((d) => d._id) } });
    }
    if (userMatches.length) {
      orConditions.push({ paidBy: { $in: userMatches.map((d) => d._id) } });
    }

    filter.$or = orConditions;
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
