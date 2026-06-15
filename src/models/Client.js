import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    accountantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "accountantId is required"],
      index: true,
    },

    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },

    type: {
      type: String,
      enum: ["client", "vendor"],
      required: [true, "Type is required"],
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Positive  => client/vendor owes the accountant
    // Negative  => accountant owes client/vendor
    currentBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

clientSchema.index({ accountantId: 1, type: 1, createdAt: -1 });
clientSchema.index({ accountantId: 1, isActive: 1 });
clientSchema.index({ accountantId: 1, name: "text", email: "text", phone: "text" });

const Client = mongoose.model("Client", clientSchema);

export default Client;