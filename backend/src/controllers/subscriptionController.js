import SubscriptionPlan from "../models/SubscriptionPlan.js";
import UserSubscription from "../models/UserSubscription.js";
import AIUsageLog from "../models/AIUsageLog.js";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import { catchError } from "../utils/catchError.js";
import {
  cancelSubscriptionAtPeriodEnd,
  createCheckoutSession,
  constructWebhookEvent,
  retrieveSubscription,
} from "../services/stripe.service.js";
import {
  getUserActiveSubscription,
  resetCycleCredits,
  updateSubscriptionStatus,
} from "../services/subscription.service.js";

const getStripePeriodDates = (stripeSub) => {
  const periodStart =
    stripeSub.current_period_start ||
    stripeSub.items?.data?.[0]?.current_period_start;

  const periodEnd =
    stripeSub.current_period_end ||
    stripeSub.items?.data?.[0]?.current_period_end;

  return {
    currentPeriodStart: periodStart ? new Date(periodStart * 1000) : undefined,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
  };
};

const toSubscriptionSummary = (subscription) => {
  if (!subscription) return null;

  const data =
    typeof subscription.toObject === "function"
      ? subscription.toObject()
      : subscription;

  return {
    ...data,
    user: data.userId,
    currentPlan: data.planId,
    subscriptionStatus: data.status,
    creditsRemaining: Math.max(0, data.creditLimit - data.creditsUsed),
  };
};

const getAllowedPlanUpdates = (body) => {
  const allowed = [
    "name",
    "description",
    "price",
    "aiCreditLimit",
    "features",
    "stripePriceId",
    "isActive",
  ];

  return allowed.reduce((updates, field) => {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }

    return updates;
  }, {});
};

export const getPlans = catchError(async (req, res) => {
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({
    price: 1,
  });

  res.status(200).json({
    success: true,
    count: plans.length,
    data: plans,
  });
});

export const getAdminPlans = catchError(async (req, res) => {
  const plans = await SubscriptionPlan.find().sort({
    isActive: -1,
    price: 1,
  });

  res.status(200).json({
    success: true,
    count: plans.length,
    data: plans,
  });
});

export const getAdminPlan = catchError(async (req, res) => {
  const plan = await SubscriptionPlan.findById(req.params.id);

  if (!plan) {
    throw new AppError("Subscription plan not found.", 404);
  }

  res.status(200).json({
    success: true,
    data: plan,
  });
});

export const createPlan = catchError(async (req, res) => {
  const {
    name,
    description,
    price,
    aiCreditLimit,
    features,
    stripePriceId,
    isActive,
  } = req.body;

  if (!name || price === undefined || aiCreditLimit === undefined) {
    throw new AppError("name, price, and aiCreditLimit are required.", 400);
  }

  const plan = await SubscriptionPlan.create({
    name,
    description,
    price,
    aiCreditLimit,
    features,
    stripePriceId: stripePriceId || null,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json({
    success: true,
    message: "Subscription plan created successfully.",
    data: plan,
  });
});

export const updatePlan = catchError(async (req, res) => {
  const plan = await SubscriptionPlan.findById(req.params.id);

  if (!plan) {
    throw new AppError("Subscription plan not found.", 404);
  }

  if (
    req.body.price !== undefined &&
    req.body.price !== plan.price &&
    !req.body.stripePriceId
  ) {
    throw new AppError(
      "Changing a plan price requires a new stripePriceId.",
      400,
    );
  }

  Object.assign(plan, getAllowedPlanUpdates(req.body));
  await plan.save();

  res.status(200).json({
    success: true,
    message: "Subscription plan updated successfully.",
    data: plan,
  });
});

export const deletePlan = catchError(async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true, runValidators: true },
  );

  if (!plan) {
    throw new AppError("Subscription plan not found.", 404);
  }

  res.status(200).json({
    success: true,
    message: "Subscription plan deactivated successfully.",
    data: plan,
  });
});

// POST /api/subscriptions/create-checkout-session

export const createCheckout = catchError(async (req, res) => {
  const { planId } = req.body;

  if (!planId) {
    throw new AppError("planId is required.", 400);
  }

  // Verify the plan exists and is active
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan || !plan.isActive) {
    throw new AppError(
      "Subscription plan not found or is no longer available.",
      404,
    );
  }

  if (!plan.stripePriceId) {
    throw new AppError(
      "This plan is not yet configured for payments. Please contact support.",
      400,
    );
  }

  const existing = await getUserActiveSubscription(req.user._id);
  if (existing) {
    throw new AppError(
      "You already have an active subscription. Cancel it before subscribing to a new plan.",
      409,
    );
  }

  const session = await createCheckoutSession({
    stripePriceId: plan.stripePriceId,
    userEmail: req.user.email,
    userId: req.user._id,
    planId: plan._id,
  });

  res.status(200).json({
    success: true,
    checkoutUrl: session.url,
    sessionId: session.id,
  });
});

// GET /api/subscriptions/me

export const getMySubscription = catchError(async (req, res) => {
  const subscription = await getUserActiveSubscription(req.user._id);

  if (!subscription) {
    return res.status(200).json({
      success: true,
      data: null,
      message: "No active subscription found.",
    });
  }

  const creditsRemaining = Math.max(
    0,
    subscription.creditLimit - subscription.creditsUsed,
  );

  res.status(200).json({
    success: true,
    data: {
      plan: subscription.planId,
      status: subscription.status,
      creditsUsed: subscription.creditsUsed,
      creditLimit: subscription.creditLimit,
      creditsRemaining,
      renewalDate: subscription.currentPeriodEnd,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      cancelledAt: subscription.cancelledAt,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    },
  });
});

export const cancelMySubscription = catchError(async (req, res) => {
  const subscription = await UserSubscription.findOne({
    userId: req.user._id,
    status: { $in: ["active", "trialing"] },
  }).populate("planId");

  if (!subscription) {
    throw new AppError("No active subscription found to cancel.", 404);
  }

  const updateData = {};

  if (subscription.stripeSubscriptionId) {
    const stripeSub = await cancelSubscriptionAtPeriodEnd(
      subscription.stripeSubscriptionId,
    );
    const { currentPeriodStart, currentPeriodEnd } =
      getStripePeriodDates(stripeSub);

    updateData.status =
      stripeSub.status === "canceled" ? "cancelled" : stripeSub.status;
    updateData.cancelAtPeriodEnd = Boolean(stripeSub.cancel_at_period_end);

    if (currentPeriodStart) updateData.currentPeriodStart = currentPeriodStart;
    if (currentPeriodEnd) updateData.currentPeriodEnd = currentPeriodEnd;

    if (updateData.status === "cancelled") {
      updateData.cancelledAt = stripeSub.canceled_at
        ? new Date(stripeSub.canceled_at * 1000)
        : new Date();
      updateData.cancelAtPeriodEnd = false;
    }
  } else {
    updateData.status = "cancelled";
    updateData.cancelledAt = new Date();
    updateData.cancelAtPeriodEnd = false;
  }

  const updated = await UserSubscription.findByIdAndUpdate(
    subscription._id,
    updateData,
    { new: true, runValidators: true },
  )
    .populate("userId", "name email role")
    .populate("planId");

  res.status(200).json({
    success: true,
    message: "Subscription cancellation scheduled successfully.",
    data: toSubscriptionSummary(updated),
  });
});

/**
 * POST /api/stripe/webhook
 * Handles Stripe lifecycle events.
 *
 * Supported events:
 *   - checkout.session.completed   → Create UserSubscription
 *   - invoice.payment_succeeded    → Reset cycle credits
 *   - customer.subscription.updated → Sync status changes
 *   - customer.subscription.deleted → Mark as cancelled
 *
 * IMPORTANT: This route must receive the RAW body (not parsed JSON).
 * The express.raw() middleware is applied at the route level (see routes file).
 */
export const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  // console.log("WEBHOOK BODY IS BUFFER:", Buffer.isBuffer(req.body));
  // console.log(
  //   "WEBHOOK SECRET:",
  //   process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 15),
  // );
  let event;
  try {
    event = constructWebhookEvent(req.body, signature);
  } catch (err) {
    console.error(
      "[Stripe Webhook] Signature verification failed:",
      err.message,
    );
    return res.status(400).json({ success: false, message: err.message });
  }

  try {
    switch (event.type) {
      // New subscription created via checkout
      case "checkout.session.completed": {
        const session = event.data.object;

        if (session.mode !== "subscription") break;

        const stripeSubscriptionId = session.subscription;
        const stripeCustomerId = session.customer;

        const stripeSub = await retrieveSubscription(stripeSubscriptionId);

        const { userId, planId } = stripeSub.metadata;

        const periodStart =
          stripeSub.current_period_start ||
          stripeSub.items?.data?.[0]?.current_period_start;

        const periodEnd =
          stripeSub.current_period_end ||
          stripeSub.items?.data?.[0]?.current_period_end;

        if (!userId || !planId) {
          console.error(
            "[Stripe Webhook] Missing metadata on subscription:",
            stripeSubscriptionId,
          );
          break;
        }

        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
          console.error("[Stripe Webhook] Plan not found:", planId);
          break;
        }

        await UserSubscription.create({
          userId,
          planId,
          stripeSubscriptionId,
          stripeCustomerId,
          status: stripeSub.status === "canceled" ? "cancelled" : stripeSub.status,
          creditLimit: plan.aiCreditLimit,
          creditsUsed: 0,
          currentPeriodStart: periodStart
            ? new Date(periodStart * 1000)
            : new Date(),
          currentPeriodEnd: periodEnd
            ? new Date(periodEnd * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        console.log(`[Stripe Webhook] Subscription created for user ${userId}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;

        if (!invoice.subscription) break;

        const stripeSub = await retrieveSubscription(invoice.subscription);

        const periodStart =
          stripeSub.current_period_start ||
          stripeSub.items?.data?.[0]?.current_period_start;

        const periodEnd =
          stripeSub.current_period_end ||
          stripeSub.items?.data?.[0]?.current_period_end;

        await resetCycleCredits(
          invoice.subscription,
          periodStart ? new Date(periodStart * 1000) : new Date(),
          periodEnd
            ? new Date(periodEnd * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          await UserSubscription.findOne({
            stripeSubscriptionId: invoice.subscription,
          })
            .populate("planId")
            .then((subscription) => subscription?.planId?.aiCreditLimit),
        );

        console.log(
          `[Stripe Webhook] Credits reset for subscription ${invoice.subscription}`,
        );
        break;
      }

      //  Subscription status changed
      case "customer.subscription.updated": {
        const stripeSub = event.data.object;

        await updateSubscriptionStatus(stripeSub.id, stripeSub.status, stripeSub);

        console.log(
          `[Stripe Webhook] Subscription ${stripeSub.id} status → ${stripeSub.status}`,
        );
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object;

        await updateSubscriptionStatus(stripeSub.id, "cancelled", stripeSub);

        console.log(`[Stripe Webhook] Subscription ${stripeSub.id} cancelled`);
        break;
      }

      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("[Stripe Webhook] Handler error:", err);

    res.status(200).json({ received: true, warning: "Internal handler error" });
  }
};

export const getAllSubscriptions = catchError(async (req, res) => {
  const subscriptions = await UserSubscription.find()
    .populate("userId", "name email role")
    .populate("planId")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: subscriptions.length,
    data: subscriptions.map(toSubscriptionSummary),
  });
});

export const getUserSubscriptions = catchError(async (req, res) => {
  const { userId } = req.params;

  const subscriptions = await UserSubscription.find({ userId })
    .populate("planId")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: subscriptions.length,
    data: subscriptions.map(toSubscriptionSummary),
  });
});

export const getUserCurrentSubscription = catchError(async (req, res) => {
  const { userId } = req.params;

  const subscription = await UserSubscription.findOne({
    userId,
    status: { $in: ["active", "trialing"] },
  })
    .populate("userId", "name email role")
    .populate("planId")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: toSubscriptionSummary(subscription),
  });
});

export const updateUserSubscription = catchError(async (req, res) => {
  const { id } = req.params;
  const {
    creditLimit,
    creditsUsed,
    status,
    planId,
    currentPeriodStart,
    currentPeriodEnd,
  } = req.body;

  const updateData = {};

  if (planId !== undefined) {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      throw new AppError("Subscription plan not found.", 404);
    }

    updateData.planId = planId;
    if (creditLimit === undefined) {
      updateData.creditLimit = plan.aiCreditLimit;
    }
  }

  if (creditLimit !== undefined) {
    updateData.creditLimit = creditLimit;
  }

  if (creditsUsed !== undefined) {
    updateData.creditsUsed = creditsUsed;
  }

  if (status !== undefined) {
    updateData.status = status;

    if (status === "cancelled") {
      updateData.cancelledAt = new Date();
    }
  }

  if (currentPeriodStart !== undefined) {
    updateData.currentPeriodStart = currentPeriodStart;
  }

  if (currentPeriodEnd !== undefined) {
    updateData.currentPeriodEnd = currentPeriodEnd;
  }

  const subscription = await UserSubscription.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate("userId", "name email role")
    .populate("planId");

  if (!subscription) {
    throw new AppError("Subscription not found.", 404);
  }

  res.status(200).json({
    success: true,
    message: "Subscription updated successfully.",
    data: toSubscriptionSummary(subscription),
  });
});

export const cancelUserSubscription = catchError(async (req, res) => {
  const { id } = req.params;

  const subscription = await UserSubscription.findById(id).populate("planId");

  if (!subscription) {
    throw new AppError("Subscription not found.", 404);
  }

  const updateData = {};

  if (subscription.stripeSubscriptionId) {
    const stripeSub = await cancelSubscriptionAtPeriodEnd(
      subscription.stripeSubscriptionId,
    );
    const { currentPeriodStart, currentPeriodEnd } =
      getStripePeriodDates(stripeSub);

    updateData.status =
      stripeSub.status === "canceled" ? "cancelled" : stripeSub.status;
    updateData.cancelAtPeriodEnd = Boolean(stripeSub.cancel_at_period_end);

    if (currentPeriodStart) updateData.currentPeriodStart = currentPeriodStart;
    if (currentPeriodEnd) updateData.currentPeriodEnd = currentPeriodEnd;

    if (updateData.status === "cancelled") {
      updateData.cancelledAt = stripeSub.canceled_at
        ? new Date(stripeSub.canceled_at * 1000)
        : new Date();
      updateData.cancelAtPeriodEnd = false;
    }
  } else {
    updateData.status = "cancelled";
    updateData.cancelledAt = new Date();
    updateData.cancelAtPeriodEnd = false;
  }

  const updated = await UserSubscription.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("userId", "name email role")
    .populate("planId");

  res.status(200).json({
    success: true,
    message: "Subscription cancellation scheduled successfully.",
    data: toSubscriptionSummary(updated),
  });
});

export const overrideUserSubscription = catchError(async (req, res) => {
  const { userId } = req.params;
  const {
    planId,
    status = "active",
    creditLimit,
    creditsUsed = 0,
    currentPeriodStart,
    currentPeriodEnd,
  } = req.body;

  if (!planId) {
    throw new AppError("planId is required.", 400);
  }

  const [user, plan] = await Promise.all([
    User.findById(userId),
    SubscriptionPlan.findById(planId),
  ]);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (!plan) {
    throw new AppError("Subscription plan not found.", 404);
  }

  await UserSubscription.updateMany(
    {
      userId,
      status: { $in: ["active", "trialing"] },
    },
    {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  );

  const subscription = await UserSubscription.create({
    userId,
    planId,
    status,
    creditLimit: creditLimit ?? plan.aiCreditLimit,
    creditsUsed,
    currentPeriodStart: currentPeriodStart ?? new Date(),
    currentPeriodEnd:
      currentPeriodEnd ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  await subscription.populate("userId", "name email role");
  await subscription.populate("planId");

  res.status(200).json({
    success: true,
    message: "User subscription override applied successfully.",
    data: toSubscriptionSummary(subscription),
  });
});

export const getAdminAIUsage = catchError(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AIUsageLog.find()
      .populate("userId", "name email role")
      .populate({
        path: "subscriptionId",
        populate: { path: "planId" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AIUsageLog.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: logs,
  });
});

export const getUserAIUsage = catchError(async (req, res) => {
  const { userId } = req.params;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const skip = (page - 1) * limit;

  const [logs, total, subscription] = await Promise.all([
    AIUsageLog.find({ userId })
      .populate("userId", "name email role")
      .populate({
        path: "subscriptionId",
        populate: { path: "planId" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AIUsageLog.countDocuments({ userId }),
    UserSubscription.findOne({
      userId,
      status: { $in: ["active", "trialing"] },
    })
      .populate("userId", "name email role")
      .populate("planId"),
  ]);

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    subscription: toSubscriptionSummary(subscription),
    data: logs,
  });
});
