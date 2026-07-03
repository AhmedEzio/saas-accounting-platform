import UserSubscription from "../models/UserSubscription.js";
import AIUsageLog from "../models/AIUsageLog.js";
import AppError from "../utils/appError.js";

export const AI_REQUEST_FEATURES = {
  chat: "aiChat",
  client_tool: "clientTools",
  invoice_tool: "invoiceTools",
  payment_tool: "paymentTools",
  file_extract: "fileExtraction",
  financial_report: "financialReports",
  invoice_analysis: "invoiceAnalysis",
  rag_query: "ragSearch",
};

const normalizeAICreditCheckArgs = (userIdOrOptions, requiredCredits = 1) => {
  if (
    userIdOrOptions &&
    typeof userIdOrOptions === "object" &&
    !Array.isArray(userIdOrOptions)
  ) {
    return {
      userId: userIdOrOptions.userId,
      requiredCredits: userIdOrOptions.requiredCredits ?? 1,
      requestType: userIdOrOptions.requestType,
      usesOptionsObject: true,
    };
  }

  return {
    userId: userIdOrOptions,
    requiredCredits,
    requestType: undefined,
    usesOptionsObject: false,
  };
};

/**
 * ملخص الملف 
1. يتأكد إن المستخدم عنده رصيد AI
2. يخصم الرصيد بعد نجاح الطلب
3. يسجل AIUsageLog
4. يجيب اشتراك المستخدم الحالي
5. يحدث الاشتراك من Stripe webhook
*/
/**
 * checkAvailableAICredits
 * ─────────────────────────
 * Verifies the user has an active subscription with enough credits.
 * Call this BEFORE making any OpenAI / AI API call.
 *
 */
export const checkAvailableAICredits = async (
  userIdOrOptions,
  requiredCredits = 1
) => {
  const {
    userId,
    requiredCredits: creditsToCheck,
    requestType,
    usesOptionsObject,
  } = normalizeAICreditCheckArgs(userIdOrOptions, requiredCredits);

  // Find the user's active or trialing subscription
  const subscription = await UserSubscription.findOne({
    userId,
    status: { $in: ["active", "trialing"] },
  }).populate("planId");

  if (!subscription) {
    throw new AppError(
      "No active subscription found. Please subscribe to a plan to use AI features.",
      403
    );
  }

  const requiredFeature = requestType
    ? AI_REQUEST_FEATURES[requestType]
    : undefined;

  if (requestType && !requiredFeature) {
    throw new AppError(`Unknown AI request type: ${requestType}.`, 400);
  }

  if (requiredFeature && !subscription.planId?.features?.[requiredFeature]) {
    throw new AppError(
      `Your subscription plan does not include access to this AI feature: ${requiredFeature}.`,
      403
    );
  }

  const remaining = subscription.creditLimit - subscription.creditsUsed;

  if (remaining < creditsToCheck) {
    throw new AppError(
      `Insufficient AI credits. You have ${remaining} credits remaining but this request requires ${creditsToCheck}.`,
      403
    );
  }

  if (!usesOptionsObject) {
    return subscription;
  }

  return {
    subscription,
    requestType,
    requiredFeature,
    requiredCredits: creditsToCheck,
  };
};

/**
 * consumeAICredits
 * ──────────────────
 * Atomically deducts credits from the user's subscription and creates
 * an AIUsageLog record. Call this AFTER a successful AI API response.
 */

export const consumeAICredits = async ({
  userId,
  requestType,
  inputTokens = 0,
  outputTokens = 0,
  totalTokens = 0,
  creditsUsed,
}) => {
  const updated = await UserSubscription.findOneAndUpdate(
    {
      userId,
      status: { $in: ["active", "trialing"] },
      $expr: {
        $lte: [
          { $add: ["$creditsUsed", creditsUsed] },
          "$creditLimit",
        ],
      },
    },
    {
      $inc: { creditsUsed },
    },
    {
      new: true,
    }
  );

  if (!updated) {
    throw new AppError(
      "Insufficient AI credits or active subscription not found.",
      403
    );
  }

  const creditsAfter = Math.max(0, updated.creditLimit - updated.creditsUsed);

  const log = await AIUsageLog.create({
    userId,
    subscriptionId: updated._id,
    requestType,
    inputTokens,
    outputTokens,
    totalTokens,
    creditsUsed,
    creditsAfter,
    status: "success",
  });

  return log;
};
/**
 * getUserActiveSubscription
 * ──────────────────────────
 * Returns the user's active/trialing subscription with plan details populated.
 * Returns null if no active subscription exists.
 */
export const getUserActiveSubscription = async (userId) => {
  return UserSubscription.findOne({
    userId,
    status: { $in: ["active", "trialing"] },
  }).populate("planId");
};

/**
 * resetCycleCredits
 * ──────────────────
 * Resets creditsUsed to 0 and updates the billing period dates.
 * Called by the Stripe webhook on `invoice.payment_succeeded`.
 */
export const resetCycleCredits = async (
  stripeSubscriptionId,
  periodStart,
  periodEnd
) => {
  return UserSubscription.findOneAndUpdate(
    { stripeSubscriptionId },
    {
      creditsUsed: 0,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    },
    { new: true }
  );
};

/**
 * updateSubscriptionStatus
 * ─────────────────────────
 * Updates the status field on a UserSubscription.
 * Called by the Stripe webhook for status changes (cancelled, past_due, etc.).
 */
const normalizeStripeStatus = (status) => {
  // Stripe uses "canceled". Our database enum uses British spelling "cancelled".
  if (status === "canceled") return "cancelled";
  return status;
};

export const updateSubscriptionStatus = async (
  stripeSubscriptionId,
  newStatus
) => {
  const normalizedStatus = normalizeStripeStatus(newStatus);

  const update = { status: normalizedStatus };

  if (normalizedStatus === "cancelled") {
    update.cancelledAt = new Date();
  }

  return UserSubscription.findOneAndUpdate(
    { stripeSubscriptionId },
    update,
    { new: true, runValidators: true }
  );
};
