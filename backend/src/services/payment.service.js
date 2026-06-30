import Invoice from "../models/Invoice.js";
import Client from "../models/Client.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import ClientBalanceTransaction from "../models/ClientBalanceTransaction.js";

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const balanceDeltaToEffect = (delta) => (delta >= 0 ? "debit" : "credit");
const balanceEffectToDelta = (tx) =>
  tx.effect === "debit" ? tx.amount : -tx.amount;

const getPaymentDirection = (invoiceType) => {
  // in  = cash received by the accountant
  // out = cash paid by the accountant
  if (["purchase", "expense", "sales_return"].includes(invoiceType))
    return "out";
  return "in";
};

const RETURN_TYPES = ["sales_return", "purchase_return"];
const ORIGINAL_RETURN_TYPES = ["sale", "purchase"];

const getDueBalanceDelta = (invoiceType, amount) => {
  // Positive balance  => client/vendor owes the accountant.
  // Negative balance  => accountant owes the client/vendor.
  if (["sale", "purchase_return"].includes(invoiceType)) return round2(amount);
  if (["purchase", "sales_return"].includes(invoiceType))
    return round2(-amount);
  return 0;
};

const getSettlementBalanceDelta = (invoiceType, amount) => {
  // Settlement reverses the outstanding due effect.
  return round2(-getDueBalanceDelta(invoiceType, amount));
};

const getReturnLabel = (invoiceType) =>
  invoiceType === "purchase_return" ? "Purchase return" : "Sales return";

const getEffectivePaymentState = async ({ invoice, accountantId, session }) => {
  if (!ORIGINAL_RETURN_TYPES.includes(invoice.invoiceType)) {
    return {
      effectiveReturnedAmount: 0,
      effectiveTotal: round2(invoice.finalAmount),
      effectiveDue: round2(invoice.dueAmount),
      isFullyReturned: false,
    };
  }

  const activeReturns = await Invoice.find({
    accountantId,
    relatedInvoiceId: invoice._id,
    invoiceType: { $in: RETURN_TYPES },
    isCancelled: false,
  })
    .select("finalAmount")
    .session(session);

  const effectiveReturnedAmount = round2(
    Math.min(
      invoice.finalAmount,
      activeReturns.reduce(
        (sum, returnInvoice) =>
          round2(sum + Number(returnInvoice.finalAmount || 0)),
        0,
      ),
    ),
  );
  const effectiveTotal = round2(
    Math.max(Number(invoice.finalAmount || 0) - effectiveReturnedAmount, 0),
  );
  const effectivePaid = round2(
    Math.min(Number(invoice.amountPaid || 0), effectiveTotal),
  );
  const effectiveDue = round2(Math.max(effectiveTotal - effectivePaid, 0));

  return {
    effectiveReturnedAmount,
    effectiveTotal,
    effectiveDue,
    isFullyReturned:
      effectiveReturnedAmount > 0 &&
      effectiveReturnedAmount >= Number(invoice.finalAmount || 0),
  };
};

const buildPaymentTxDoc = ({
  accountantId,
  invoiceId,
  clientId,
  amount,
  paymentMethod,
  source,
  direction = "in",
  paidBy,
  notes = null,
}) => ({
  accountantId,
  invoiceId,
  clientId: clientId ?? null,
  amount: round2(amount),
  paymentMethod,
  source,
  direction,
  paidBy,
  notes,
});

const applyClientBalanceDelta = async ({
  accountantId,
  clientId,
  amount,
  delta,
  type,
  sourceInvoiceId,
  createdBy,
  notes,
  session,
}) => {
  const roundedAmount = round2(amount);
  const roundedDelta = round2(delta);

  if (!clientId || roundedAmount <= 0 || roundedDelta === 0) return null;

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

  client.currentBalance = round2(client.currentBalance + roundedDelta);
  await client.save({ session });

  const [tx] = await ClientBalanceTransaction.create(
    [
      {
        accountantId,
        clientId,
        amount: roundedAmount,
        effect: balanceDeltaToEffect(roundedDelta),
        type,
        balanceAfter: client.currentBalance,
        sourceInvoiceId,
        createdBy,
        notes,
      },
    ],
    { session },
  );

  return tx;
};

export const recordInitialPayment = async ({
  invoice,
  session,
  createdBy,
  accountantId,
}) => {
  if (invoice.amountPaid && invoice.amountPaid > 0) {
    const paymentDoc = buildPaymentTxDoc({
      accountantId,
      invoiceId: invoice._id,
      clientId: invoice.clientId,
      amount: invoice.amountPaid,
      paymentMethod: invoice.paymentMethod,
      direction: getPaymentDirection(invoice.invoiceType),
      source: "invoice_creation",
      paidBy: createdBy,
      notes: `Initial payment for invoice ${invoice.invoiceNumber}`,
    });

    await PaymentTransaction.create([paymentDoc], { session });
  }

  if (invoice.clientId && invoice.dueAmount > 0) {
    const delta = getDueBalanceDelta(invoice.invoiceType, invoice.dueAmount);

    await applyClientBalanceDelta({
      accountantId,
      clientId: invoice.clientId,
      amount: invoice.dueAmount,
      delta,
      type: "invoice_due",
      sourceInvoiceId: invoice._id,
      createdBy,
      notes: `Outstanding balance from invoice ${invoice.invoiceNumber}`,
      session,
    });
  }
};

export const createPayment = async (body, paidBy, accountantId = paidBy) => {
  const session = await Invoice.startSession();
  session.startTransaction();

  try {
    const { invoiceId, amount, paymentMethod, notes = null } = body;
    const parsedAmount = round2(Number(amount));

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      accountantId,
    }).session(session);

    if (!invoice) {
      throw Object.assign(new Error("Invoice not found"), { statusCode: 404 });
    }

    if (invoice.isCancelled) {
      throw Object.assign(
        new Error("Cannot record payment on a cancelled invoice"),
        { statusCode: 422 },
      );
    }

    if (RETURN_TYPES.includes(invoice.invoiceType)) {
      throw Object.assign(
        new Error("Cannot record payment on a return invoice"),
        { statusCode: 422 },
      );
    }

    const paymentState = await getEffectivePaymentState({
      invoice,
      accountantId,
      session,
    });

    if (paymentState.isFullyReturned) {
      throw Object.assign(
        new Error("Cannot record payment on a fully returned invoice"),
        { statusCode: 422 },
      );
    }

    if (paymentState.effectiveDue <= 0) {
      throw Object.assign(new Error("Invoice is already fully paid"), {
        statusCode: 422,
      });
    }

    if (parsedAmount > paymentState.effectiveDue) {
      throw Object.assign(
        new Error("Payment amount cannot exceed invoice due amount"),
        { statusCode: 422 },
      );
    }

    const oldDueAmount = paymentState.effectiveDue;
    const newAmountPaid = round2(invoice.amountPaid + parsedAmount);
    const newDueAmount = round2(
      Math.max(paymentState.effectiveTotal - newAmountPaid, 0),
    );

    invoice.amountPaid = newAmountPaid;
    invoice.dueAmount = newDueAmount;
    invoice.changeAmount = 0;

    await invoice.save({ session });

    const [paymentTx] = await PaymentTransaction.create(
      [
        buildPaymentTxDoc({
          accountantId,
          invoiceId: invoice._id,
          clientId: invoice.clientId,
          amount: parsedAmount,
          paymentMethod,
          source: "manual_payment",
          direction: getPaymentDirection(invoice.invoiceType),
          paidBy,
          notes,
        }),
      ],
      { session },
    );

    if (invoice.clientId) {
      const settledAmount = round2(Math.min(parsedAmount, oldDueAmount));
      const delta = getSettlementBalanceDelta(
        invoice.invoiceType,
        settledAmount,
      );

      await applyClientBalanceDelta({
        accountantId,
        clientId: invoice.clientId,
        amount: settledAmount,
        delta,
        type: "manual_adjustment",
        sourceInvoiceId: invoice._id,
        createdBy: paidBy,
        notes: `Payment settlement for invoice ${invoice.invoiceNumber}`,
        session,
      });
    }

    await session.commitTransaction();

    return { invoice, paymentTransaction: paymentTx };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const recordReturnInvoiceSettlement = async ({
  returnInvoice,
  originalInvoice,
  session,
  createdBy,
  accountantId,
}) => {
  if (!RETURN_TYPES.includes(returnInvoice.invoiceType)) return;
  if (!returnInvoice.clientId) return;

  const label = getReturnLabel(returnInvoice.invoiceType);

  // Return value reverses the original outstanding balance. Any paid portion
  // is then settled by a refund/payment transaction below.
  await applyClientBalanceDelta({
    accountantId,
    clientId: returnInvoice.clientId,
    amount: returnInvoice.finalAmount,
    delta: getDueBalanceDelta(returnInvoice.invoiceType, returnInvoice.finalAmount),
    type: "refund",
    sourceInvoiceId: returnInvoice._id,
    createdBy,
    notes: `${label} value for invoice ${returnInvoice.invoiceNumber}`,
    session,
  });

  const previousReturns = await Invoice.find({
    accountantId,
    relatedInvoiceId: originalInvoice._id,
    invoiceType: returnInvoice.invoiceType,
    isCancelled: false,
    _id: { $ne: returnInvoice._id },
  }).session(session);

  const previousRefundedAmount = previousReturns.reduce((sum, inv) => {
    return round2(sum + (inv.amountPaid || 0));
  }, 0);

  const previousReturnedAmount = previousReturns.reduce((sum, inv) => {
    return round2(sum + (inv.finalAmount || 0));
  }, 0);

  const cumulativeReturnedAmount = Math.min(
    originalInvoice.finalAmount,
    round2(previousReturnedAmount + returnInvoice.finalAmount),
  );

  const cumulativeRefundableAmount =
    originalInvoice.finalAmount > 0
      ? round2(
          Math.min(
            originalInvoice.amountPaid,
            (originalInvoice.amountPaid * cumulativeReturnedAmount) /
              originalInvoice.finalAmount,
          ),
        )
      : 0;

  const refundAmount = round2(Math.min(
    returnInvoice.finalAmount,
    Math.max(0, cumulativeRefundableAmount - previousRefundedAmount),
  ));

  returnInvoice.amountPaid = refundAmount;
  returnInvoice.dueAmount = 0;
  returnInvoice.changeAmount = 0;

  await returnInvoice.save({ session });

  if (refundAmount <= 0) return;

  const [refundTx] = await PaymentTransaction.create(
    [
      buildPaymentTxDoc({
        accountantId,
        invoiceId: returnInvoice._id,
        clientId: returnInvoice.clientId,
        amount: refundAmount,
        paymentMethod: returnInvoice.paymentMethod,
        source: "refund",
        direction: getPaymentDirection(returnInvoice.invoiceType),
        paidBy: createdBy,
        notes: `${label} cash settlement for invoice ${returnInvoice.invoiceNumber}`,
      }),
    ],
    { session },
  );

  await applyClientBalanceDelta({
    accountantId,
    clientId: returnInvoice.clientId,
    amount: refundAmount,
    delta: getSettlementBalanceDelta(returnInvoice.invoiceType, refundAmount),
    type: "refund",
    sourceInvoiceId: returnInvoice._id,
    createdBy,
    notes: `${label} cash settlement ${refundTx._id}`,
    session,
  });
};

export const getPayments = async (query, accountantId) => {
  const { invoiceId, clientId, source, from, to, page = 1, limit = 20 } = query;

  const filter = { accountantId };

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

export const getClientBalance = async (clientId, query, accountantId) => {
  const client = await Client.findOne({
    _id: clientId,
    accountantId,
    isActive: true,
  })
    .select("name phone type currentBalance")
    .lean();

  if (!client) {
    throw Object.assign(new Error("Client/Vendor not found"), {
      statusCode: 404,
    });
  }

  const { from, to, page = 1, limit = 20 } = query;

  const filter = {
    accountantId,
    clientId,
  };

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await ClientBalanceTransaction.countDocuments(filter);

  const transactions = await ClientBalanceTransaction.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("sourceInvoiceId", "invoiceNumber invoiceType finalAmount")
    .populate("createdBy", "name email")
    .lean();

  return {
    client,
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.ceil(total / Number(limit)),
    transactions,
  };
};

export const reverseCancelledInvoicePayments = async ({
  invoice,
  cancelledBy,
  session,
  accountantId,
}) => {
  if (!invoice.clientId) {
    await reverseInvoicePaymentTransactions({
      invoice,
      cancelledBy,
      session,
      accountantId,
    });
    return;
  }

  const alreadyReversed = await ClientBalanceTransaction.exists({
    accountantId,
    sourceInvoiceId: invoice._id,
    type: "cancellation_reversal",
  }).session(session);

  if (alreadyReversed) return;

  await reverseInvoicePaymentTransactions({
    invoice,
    cancelledBy,
    session,
    accountantId,
  });

  const balanceTransactions = await ClientBalanceTransaction.find({
    accountantId,
    sourceInvoiceId: invoice._id,
    type: { $ne: "cancellation_reversal" },
  }).session(session);

  const totalDelta = round2(
    balanceTransactions.reduce((sum, tx) => sum + balanceEffectToDelta(tx), 0),
  );

  const reversalDelta = round2(-totalDelta);

  if (reversalDelta === 0) return;

  await applyClientBalanceDelta({
    accountantId,
    clientId: invoice.clientId,
    amount: Math.abs(reversalDelta),
    delta: reversalDelta,
    type: "cancellation_reversal",
    sourceInvoiceId: invoice._id,
    createdBy: cancelledBy,
    notes: `Cancellation balance reversal for invoice ${invoice.invoiceNumber}`,
    session,
  });
};

const reverseInvoicePaymentTransactions = async ({
  invoice,
  cancelledBy,
  session,
  accountantId,
}) => {
  const existingReversals = await PaymentTransaction.exists({
    accountantId,
    invoiceId: invoice._id,
    source: "cancellation_reversal",
  }).session(session);

  if (existingReversals) return;

  const paymentTransactions = await PaymentTransaction.find({
    accountantId,
    invoiceId: invoice._id,
    source: { $ne: "cancellation_reversal" },
  }).session(session);

  if (!paymentTransactions.length) return;

  const reversalDocs = paymentTransactions.map((tx) =>
    buildPaymentTxDoc({
      accountantId,
      invoiceId: invoice._id,
      clientId: tx.clientId,
      amount: tx.amount,
      paymentMethod: tx.paymentMethod,
      source: "cancellation_reversal",
      direction: tx.direction === "in" ? "out" : "in",
      paidBy: cancelledBy,
      notes: `Payment transaction reversed due to invoice cancellation (${invoice.invoiceNumber})`,
    }),
  );

  await PaymentTransaction.create(reversalDocs, { session });
};

export const getClientLastBalanceTransactions = async (
  clientId,
  accountantId,
) => {
  const client = await Client.findOne({
    _id: clientId,
    accountantId,
  });

  if (!client) {
    throw Object.assign(new Error("Client/Vendor not found"), {
      statusCode: 404,
    });
  }

  const [lastDebit, lastCredit] = await Promise.all([
    ClientBalanceTransaction.findOne({
      accountantId,
      clientId,
      effect: "debit",
    }).sort({ createdAt: -1 }),

    ClientBalanceTransaction.findOne({
      accountantId,
      clientId,
      effect: "credit",
    }).sort({ createdAt: -1 }),
  ]);

  const netBalance = round2(client.currentBalance || 0);
  const totalDebit = netBalance > 0 ? netBalance : 0;
  const totalCredit = netBalance < 0 ? round2(Math.abs(netBalance)) : 0;

  return {
    client,
    lastDebit,
    lastCredit,
    totalDebit,
    totalCredit,
    netBalance,
  };
};
