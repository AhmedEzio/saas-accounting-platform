import mongoose from "mongoose";

const BALANCE_TRANSACTION_TYPES = [
  "invoice_due",
  "overpayment",
  "refund",
  "cancellation_reversal",
  "manual_adjustment",
];

const clientBalanceTransactionSchema = new mongoose.Schema(
  {
    accountantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "accountantId is required"],
      index: true,
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "clientId is required"],
    },

    amount: {
      type: Number,
      required: [true, "amount is required"],
      min: [0.01, "amount must be greater than zero"],
    },

    effect: {
      type: String,
      enum: {
        values: ["credit", "debit"],
        message: "effect must be either credit or debit",
      },
      required: [true, "effect is required"],
    },

    type: {
      type: String,
      enum: {
        values: BALANCE_TRANSACTION_TYPES,
        message: `type must be one of: ${BALANCE_TRANSACTION_TYPES.join(", ")}`,
      },
      required: [true, "type is required"],
    },

    balanceAfter: {
      type: Number,
      required: [true, "balanceAfter is required"],
    },

    sourceInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "createdBy is required"],
    },

    notes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "client_balance_transactions",
  }
);

clientBalanceTransactionSchema.index({ accountantId: 1, clientId: 1, createdAt: -1 });
clientBalanceTransactionSchema.index({ accountantId: 1, sourceInvoiceId: 1 });
clientBalanceTransactionSchema.index({ accountantId: 1, type: 1, createdAt: -1 });

const ClientBalanceTransaction = mongoose.model(
  "ClientBalanceTransaction",
  clientBalanceTransactionSchema
);

export default ClientBalanceTransaction;