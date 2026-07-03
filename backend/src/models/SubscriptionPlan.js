import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    // Display name shown to users ( "Starter", "Pro", "Enterprise")
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Plan price is required"],
      min: [0, "Price cannot be negative"],
    },

    aiCreditLimit: {
      type: Number,
      required: [true, "AI credit limit is required"],
      min: [0, "Credit limit cannot be negative"],
    },

    features: {
      aiChat: {
        type: Boolean,
        default: false,
      },
      clientTools: {
        type: Boolean,
        default: false,
      },
      invoiceTools: {
        type: Boolean,
        default: false,
      },
      paymentTools: {
        type: Boolean,
        default: false,
      },
      fileExtraction: {
        type: Boolean,
        default: false,
      },
      financialReports: {
        type: Boolean,
        default: false,
      },
      invoiceAnalysis: {
        type: Boolean,
        default: false,
      },
      ragSearch: {
        type: Boolean,
        default: false,
      },
      technicalSupport: {
        type: Boolean,
        default: false,
      },
    },

   
    stripePriceId: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

export default SubscriptionPlan;
