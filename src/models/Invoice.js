import mongoose from "mongoose";

// Invoice Item Sub-Schema
const invoiceItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Item description is required"],
      trim: true,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },

    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },

    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    accountantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "accountantId is required"],
      index: true,
    },

    invoiceType: {
      type: String,
      enum: {
        values: [
          "purchase",
          "sale",
          "purchase_return",
          "sales_return",
          "expense",
        ],
        message:
          "invoiceType must be one of: purchase, sale, purchase_return, sales_return, expense",
      },
      required: [true, "Invoice type is required"],
    },

    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: {
        values: ["cash", "card", "wallet", "bank_transfer"],
        message:
          "paymentMethod must be one of: cash, card, wallet, bank_transfer",
      },
      required: [true, "Payment method is required"],
    },

    items: {
      type: [invoiceItemSchema],
      validate: {
        validator: function (items) {
          if (this.invoiceType === "expense") return true;
          return Array.isArray(items) && items.length > 0;
        },
        message: "Invoice must contain at least one item",
      },
      default: [],
    },

    expenseName: {
      type: String,
      trim: true,
      default: null,
    },

    expenseType: {
      type: String,
      enum: [
        "rent",
        "salary",
        "electricity",
        "internet",
        "transportation",
        "maintenance",
        "marketing",
        "office_supplies",
        "other",
        null,
      ],
      default: null,
    },

    expenseDescription: {
      type: String,
      trim: true,
      default: null,
    },

    expenseOtherNotes: {
      type: String,
      trim: true,
      default: null,
    },

    baseAmount: {
      type: Number,
      required: [true, "Base amount is required"],
      min: [0, "Base amount cannot be negative"],
    },

    taxPercentage: {
      type: Number,
      default: 0,
      min: [0, "Tax percentage cannot be negative"],
      max: [100, "Tax percentage cannot exceed 100"],
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: [0, "Tax amount cannot be negative"],
    },

    finalAmount: {
      type: Number,
      required: [true, "Final amount is required"],
      min: [0, "Final amount cannot be negative"],
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: [0, "Amount paid cannot be negative"],
    },

    changeAmount: {
      type: Number,
      default: 0,
      min: [0, "Change amount cannot be negative"],
    },

    dueAmount: {
      type: Number,
      default: 0,
      min: [0, "Due amount cannot be negative"],
    },

    relatedInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvoiceDocument",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "createdBy is required"],
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "invoices",
  }
);

invoiceSchema.pre("validate", function (next) {
  if (this.invoiceType === "expense") {
    if (!this.expenseName) {
      return next(new Error("expenseName is required"));
    }

    if (!this.expenseType) {
      return next(new Error("expenseType is required"));
    }

    if (this.expenseType === "other" && !this.expenseOtherNotes) {
      return next(
        new Error("expenseOtherNotes is required when expenseType is other")
      );
    }

    if (this.baseAmount <= 0) {
      return next(new Error("Expense amount must be greater than zero"));
    }

    this.clientId = null;
    this.items = [];
  }

  if (this.invoiceType !== "expense" && !this.clientId) {
    return next(new Error("clientId is required for non-expense invoices"));
  }

  next();
});

invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ accountantId: 1, createdAt: -1 });
invoiceSchema.index({ accountantId: 1, invoiceType: 1, createdAt: -1 });
invoiceSchema.index({ accountantId: 1, clientId: 1 });
invoiceSchema.index({ accountantId: 1, isCancelled: 1 });
invoiceSchema.index({ accountantId: 1, relatedInvoiceId: 1 });
invoiceSchema.index({ createdBy: 1 });

invoiceSchema.virtual("paymentStatus").get(function () {
  if (this.dueAmount <= 0) return "paid";
  if (this.amountPaid > 0) return "partial";
  return "unpaid";
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;