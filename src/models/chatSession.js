import mongoose from "mongoose";

const chatSession = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: "New Chat",
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("ChatSession", chatSession);
