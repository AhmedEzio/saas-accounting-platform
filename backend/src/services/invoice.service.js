import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Client from "../models/Client.js";
import {
  recordInitialPayment,
  reverseCancelledInvoicePayments,
  recordReturnInvoiceSettlement,
} from "./payment.service.js";

const INVOICE_TYPE_PREFIX = {
  purchase: "PUR",
  sale: "SAL",
  purchase_return: "PRE",
  sales_return: "SRE",
  expense: "EXP",
};

const RETURN_TYPES = ["purchase_return", "sales_return"];
const ORIGINAL_RETURN_TYPES = ["purchase", "sale"];

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const getInvoiceId = (invoice) => String(invoice?._id || invoice?.id || "");

const computeEffectiveFields = (invoice, returnedAmount = 0) => {
  if (RETURN_TYPES.includes(invoice.invoiceType)) {
    return {
      effectiveReturnedAmount: 0,
      effectiveTotal: round2(Number(invoice.finalAmount || 0)),
      effectiveDue: 0,
      isFullyReturned: false,
      hasActiveReturns: false,
    };
  }

  const effectiveReturnedAmount = RETURN_TYPES.includes(invoice.invoiceType)
    ? 0
    : round2(Math.min(Number(invoice.finalAmount || 0), returnedAmount));
  const effectiveTotal = round2(
    Math.max(Number(invoice.finalAmount || 0) - effectiveReturnedAmount, 0)
  );
  const effectivePaid = round2(
    Math.min(Number(invoice.amountPaid || 0), effectiveTotal)
  );
  const effectiveDue = round2(Math.max(effectiveTotal - effectivePaid, 0));
  const hasActiveReturns = effectiveReturnedAmount > 0;

  return {
    effectiveReturnedAmount,
    effectiveTotal,
    effectiveDue,
    isFullyReturned:
      hasActiveReturns &&
      Number(invoice.finalAmount || 0) > 0 &&
      effectiveReturnedAmount >= Number(invoice.finalAmount || 0),
    hasActiveReturns,
  };
};

const attachEffectiveFields = async (invoices, accountantId) => {
  const list = Array.isArray(invoices) ? invoices : [invoices];
  const originalIds = list
    .filter((invoice) => ORIGINAL_RETURN_TYPES.includes(invoice.invoiceType))
    .map(getInvoiceId)
    .filter(Boolean);

  if (!originalIds.length) {
    return Array.isArray(invoices)
      ? list.map((invoice) => ({ ...invoice, ...computeEffectiveFields(invoice) }))
      : { ...invoices, ...computeEffectiveFields(invoices) };
  }

  const returns = await Invoice.find({
    accountantId,
    relatedInvoiceId: { $in: originalIds },
    invoiceType: { $in: RETURN_TYPES },
    isCancelled: false,
  })
    .select("relatedInvoiceId finalAmount")
    .lean();

  const returnedAmountByOriginalId = returns.reduce((map, invoice) => {
    const originalId = String(invoice.relatedInvoiceId);
    map.set(
      originalId,
      round2((map.get(originalId) || 0) + Number(invoice.finalAmount || 0))
    );
    return map;
  }, new Map());

  const withEffectiveFields = list.map((invoice) => ({
    ...invoice,
    ...computeEffectiveFields(
      invoice,
      returnedAmountByOriginalId.get(getInvoiceId(invoice)) || 0
    ),
  }));

  return Array.isArray(invoices) ? withEffectiveFields : withEffectiveFields[0];
};

const computeAmounts = ({ baseAmount, taxPercentage = 0, amountPaid = 0 }) => {
  const base = round2(baseAmount);
  const taxPct = round2(taxPercentage);
  const taxAmt = round2((base * taxPct) / 100);
  const final = round2(base + taxAmt);
  const paid = round2(amountPaid);
  const change = paid > final ? round2(paid - final) : 0;
  const due = paid < final ? round2(final - paid) : 0;

  return {
    baseAmount: base,
    taxPercentage: taxPct,
    taxAmount: taxAmt,
    finalAmount: final,
    amountPaid: paid,
    changeAmount: change,
    dueAmount: due,
  };
};

const generateInvoiceNumber = async (invoiceType, session) => {
  const prefix = INVOICE_TYPE_PREFIX[invoiceType];
  const year = new Date().getFullYear();
  const key = `${invoiceType}-${year}`;

  const counter = await mongoose.connection
    .collection("invoicecounters")
    .findOneAndUpdate(
      { _id: key },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after", session }
    );

  const sequence = String(counter.seq).padStart(6, "0");
  return `${prefix}-${year}-${sequence}`;
};

const sanitizeItems = (items = []) => {
  return items.map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    return {
      description: item.description?.trim(),
      quantity,
      unitPrice: round2(unitPrice),
      totalPrice: round2(quantity * unitPrice),
    };
  });
};

const validateClientOwnership = async ({ accountantId, clientId, session }) => {
  if (!clientId) return null;

  const client = await Client.findOne({
    _id: clientId,
    accountantId,
    isActive: true,
  }).session(session);

  if (!client) {
    throw Object.assign(new Error("Client/Vendor not found"), {
      statusCode: 404,
    });
  }

  return client;
};

const validateReturnInvoice = async ({
  accountantId,
  invoiceType,
  relatedInvoiceId,
  clientId,
  items,
  session,
}) => {
  const original = await Invoice.findOne({
    _id: relatedInvoiceId,
    accountantId,
  }).session(session);

  if (!original) {
    throw Object.assign(new Error("Related invoice not found"), {
      statusCode: 404,
    });
  }

  if (original.isCancelled) {
    throw Object.assign(
      new Error("Cannot create return for a cancelled invoice"),
      { statusCode: 422 }
    );
  }

  if (invoiceType === "purchase_return" && original.invoiceType !== "purchase") {
    throw Object.assign(
      new Error("Purchase return must reference a purchase invoice"),
      { statusCode: 422 }
    );
  }

  if (invoiceType === "sales_return" && original.invoiceType !== "sale") {
    throw Object.assign(
      new Error("Sales return must reference a sale invoice"),
      { statusCode: 422 }
    );
  }

  if (String(original.clientId) !== String(clientId)) {
    throw Object.assign(
      new Error("Return invoice client/vendor must match the original invoice"),
      { statusCode: 422 }
    );
  }

  const previousReturns = await Invoice.find({
    accountantId,
    relatedInvoiceId: original._id,
    invoiceType,
    isCancelled: false,
  })
    .select("items")
    .session(session);

  for (const item of items) {
    const originalItem = original.items.find(
      (i) =>
        i.description === item.description &&
        round2(i.unitPrice) === round2(item.unitPrice)
    );

    const alreadyReturnedQty = previousReturns.reduce((sum, ret) => {
      const returnedItem = ret.items.find(
        (i) =>
          i.description === item.description &&
          round2(i.unitPrice) === round2(item.unitPrice)
      );

      return sum + (returnedItem?.quantity || 0);
    }, 0);

    if (!originalItem) {
      throw Object.assign(
        new Error(
          `Item "${item.description}" does not exist in original invoice`
        ),
        { statusCode: 422 }
      );
    }

    if (alreadyReturnedQty + item.quantity > originalItem.quantity) {
      throw Object.assign(
        new Error(
          `Return quantity exceeds remaining quantity for item "${item.description}". Original: ${originalItem.quantity}, Already Returned: ${alreadyReturnedQty}, Requested: ${item.quantity}`
        ),
        { statusCode: 422 }
      );
    }
  }

  return original;
};

export const createInvoice = async (body, createdBy, accountantId = createdBy) => {
  const session = await Invoice.startSession();
  session.startTransaction();

  try {
    const {
      invoiceType,
      clientId = null,
      paymentMethod,

      expenseName = null,
      expenseType = null,
      expenseDescription = null,
      expenseOtherNotes = null,

      items = [],

      relatedInvoiceId = null,
      documentId = null,
      notes = null,

      taxPercentage = 0,
      amountPaid = 0,
      baseAmount: expenseBaseAmount = null,
    } = body;

    if (invoiceType !== "expense" && !clientId) {
      throw Object.assign(
        new Error("clientId is required for non-expense invoices"),
        { statusCode: 422 }
      );
    }

    await validateClientOwnership({
      accountantId,
      clientId,
      session,
    });

    let sanitizedItems = [];

    if (invoiceType !== "expense") {
      sanitizedItems = sanitizeItems(items);
    }

    let originalInvoice = null;

    if (RETURN_TYPES.includes(invoiceType)) {
      originalInvoice = await validateReturnInvoice({
        accountantId,
        invoiceType,
        relatedInvoiceId,
        clientId,
        items: sanitizedItems,
        session,
      });
    }

    let baseAmount;

    if (invoiceType === "expense") {
      baseAmount = round2(Number(expenseBaseAmount || 0));
    } else {
      baseAmount = sanitizedItems.reduce(
        (sum, item) => round2(sum + item.totalPrice),
        0
      );
    }

    const amounts = computeAmounts({
      baseAmount,
      taxPercentage,
      amountPaid,
    });

    if (amounts.amountPaid > amounts.finalAmount) {
      throw Object.assign(new Error("amountPaid cannot exceed invoice total"), {
        statusCode: 422,
      });
    }

    const invoiceNumber = await generateInvoiceNumber(invoiceType, session);

    const [invoice] = await Invoice.create(
      [
        {
          accountantId,
          invoiceType,
          invoiceNumber,
          clientId: invoiceType === "expense" ? null : clientId,
          paymentMethod,
          expenseName,
          expenseType,
          expenseDescription,
          expenseOtherNotes,
          ...amounts,
          items: invoiceType === "expense" ? [] : sanitizedItems,
          relatedInvoiceId,
          documentId,
          createdBy,
          notes,
        },
      ],
      { session }
    );

    if (RETURN_TYPES.includes(invoiceType)) {
      await recordReturnInvoiceSettlement({
        returnInvoice: invoice,
        originalInvoice,
        session,
        createdBy,
        accountantId,
      });
    } else {
      await recordInitialPayment({
        invoice,
        session,
        createdBy,
        accountantId,
      });
    }

    await session.commitTransaction();
    return invoice;
  } catch (err) {
    await session.abortTransaction();

    if (err.code === 11000 && err.keyPattern?.invoiceNumber) {
      throw Object.assign(new Error("Invoice number conflict — please retry"), {
        statusCode: 409,
      });
    }

    throw err;
  } finally {
    session.endSession();
  }
};

export const getInvoices = async (query, accountantId) => {
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

  const filter = { accountantId };

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
  const invoicesWithEffectiveFields = await attachEffectiveFields(
    invoices,
    accountantId
  );

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.ceil(total / Number(limit)),
    invoices: invoicesWithEffectiveFields,
  };
};

export const getInvoiceById = async (id, accountantId) => {
  const invoice = await Invoice.findOne({
    _id: id,
    accountantId,
  })
    .populate("clientId", "name phone type email address")
    .populate("createdBy", "name email")
    .populate("cancelledBy", "name email")
    .populate("relatedInvoiceId", "invoiceNumber invoiceType")
    .populate("documentId", "fileName fileUrl fileType")
    .lean({ virtuals: true });

  if (!invoice) {
    throw Object.assign(new Error("Invoice not found"), { statusCode: 404 });
  }

  return attachEffectiveFields(invoice, accountantId);
};

export const cancelInvoice = async (
  invoiceId,
  cancelledBy,
  reason = null,
  accountantId = cancelledBy
) => {
  const session = await Invoice.startSession();
  session.startTransaction();

  try {
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      accountantId,
    }).session(session);

    if (!invoice) {
      throw Object.assign(new Error("Invoice not found"), { statusCode: 404 });
    }

    if (RETURN_TYPES.includes(invoice.invoiceType)) {
      throw Object.assign(new Error("Return invoices cannot be cancelled"), {
        statusCode: 422,
      });
    }

    if (invoice.isCancelled) {
      throw Object.assign(new Error("Invoice already cancelled"), {
        statusCode: 409,
      });
    }

    const activeReturn = await Invoice.findOne({
      accountantId,
      relatedInvoiceId: invoice._id,
      isCancelled: false,
    }).session(session);

    if (activeReturn) {
      throw Object.assign(
        new Error("Cannot cancel invoice because it has active return invoices"),
        { statusCode: 422 }
      );
    }

    await reverseCancelledInvoicePayments({
      invoice,
      cancelledBy,
      session,
      accountantId,
    });

    invoice.isCancelled = true;
    invoice.cancelledAt = new Date();
    invoice.cancelledBy = cancelledBy;
    invoice.cancellationReason = reason;

    await invoice.save({ session });

    await session.commitTransaction();

    return invoice;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
