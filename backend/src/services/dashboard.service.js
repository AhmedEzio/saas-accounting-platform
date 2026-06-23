import Invoice from "../models/Invoice.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import Client from "../models/Client.js";
import UserSubscription from "../models/UserSubscription.js";
import AIUsageLog from "../models/AIUsageLog.js";

function daysAgoStart(days) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days + 1);
  return d;
}

/** Returns the [start, end) UTC boundaries for the calendar day containing `date`. */
function getDayBounds(date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

/**
 * getSubscriptionKpis
 * ────────────────────
 * KPI #1: Total Subscribed Users — count of UserSubscription docs
 *   currently "active" or "trialing" (one per user, enforced by the
 *   model's unique partial index).
 * KPI #2: Total Subscriptions for the selected date — count of
 *   UserSubscription docs created on that calendar day.
 */
export async function getSubscriptionKpis(date = new Date()) {
  const { start, end } = getDayBounds(date);

  const [totalSubscribedUsers, totalSubscriptionsForDate] = await Promise.all([
    UserSubscription.countDocuments({
      status: { $in: ["active", "trialing"] },
    }),
    UserSubscription.countDocuments({
      createdAt: { $gte: start, $lt: end },
    }),
  ]);

  return { totalSubscribedUsers, totalSubscriptionsForDate };
}

/**
 * getSubscriptionsChart
 * ──────────────────────
 * Total new subscriptions per day, for the `days`-day window ending
 * on `date` (inclusive). Days with zero subscriptions are filled in
 * with 0 so the chart has no gaps.
 */
export async function getSubscriptionsChart(date = new Date(), days = 30) {
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);

  const rows = await UserSubscription.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
  ]);

  const countByDate = new Map(rows.map((r) => [r._id, r.count]));

  const labels = [];
  const subscriptionsData = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    labels.push(key);
    subscriptionsData.push(countByDate.get(key) ?? 0);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return { labels, subscriptionsData };
}

export async function getFinancialSummary(accountantId) {
  const now = new Date();

  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );

  const [paymentAgg, receivablesAgg, payablesAgg] = await Promise.all([
    PaymentTransaction.aggregate([
      {
        $match: {
          accountantId,
          createdAt: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: "$direction",
          total: { $sum: "$amount" },
        },
      },
    ]),

    Invoice.aggregate([
      {
        $match: {
          accountantId,
          isCancelled: false,
          dueAmount: { $gt: 0 },
          invoiceType: { $in: ["sale", "purchase_return"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$dueAmount" },
        },
      },
    ]),

    Client.aggregate([
      {
        $match: {
          accountantId,
          isActive: true,
          currentBalance: { $lt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$currentBalance" },
        },
      },
    ]),
  ]);

  const extractPayment = (direction) =>
    paymentAgg.find((row) => row._id === direction)?.total ?? 0;

  return {
    cashIn: extractPayment("in"),
    cashOut: extractPayment("out"),
    receivables: receivablesAgg[0]?.total ?? 0,
    payables: Math.abs(payablesAgg[0]?.total ?? 0),
  };
}

export async function getRecentActivity(accountantId, limit = 20) {
  const [recentInvoices, recentPayments] = await Promise.all([
    Invoice.find(
      { accountantId },
      "invoiceNumber invoiceType finalAmount isCancelled cancelledAt createdAt updatedAt clientId"
    )
      .populate("clientId", "name type")
      .sort({ createdAt: -1 })
      .limit(limit * 2)
      .lean(),

    PaymentTransaction.find(
      { accountantId },
      "invoiceId amount direction source createdAt"
    )
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
  ]);

  const events = [];

  for (const invoice of recentInvoices) {
    if (invoice.isCancelled) {
      events.push({
        type: "cancellation",
        title: `Invoice ${invoice.invoiceNumber} cancelled`,
        detail: invoice.clientId?.name
          ? `${invoice.clientId.type}: ${invoice.clientId.name}`
          : `Type: ${invoice.invoiceType}`,
        amount: invoice.finalAmount,
        time: invoice.cancelledAt ?? invoice.updatedAt,
      });
    } else {
      events.push({
        type: "invoice_created",
        title: `Invoice ${invoice.invoiceNumber} created`,
        detail: invoice.clientId?.name
          ? `${invoice.clientId.type}: ${invoice.clientId.name}`
          : `Type: ${invoice.invoiceType}`,
        amount: invoice.finalAmount,
        time: invoice.createdAt,
      });
    }
  }

  for (const payment of recentPayments) {
    events.push({
      type: "payment",
      title:
        payment.direction === "in" ? "Payment received" : "Payment refunded",
      detail: `${payment.source} • ${payment.direction}`,
      amount: payment.amount,
      time: payment.createdAt,
    });
  }

  events.sort((a, b) => new Date(b.time) - new Date(a.time));

  return events.slice(0, limit);
}

export async function getSubscriptionSummary(accountantId) {
  const subscription = await UserSubscription.findOne({
    userId: accountantId,
    status: { $in: ["active", "trialing"] },
  })
    .populate("planId")
    .lean();

  if (!subscription) {
    return {
      hasActiveSubscription: false,
      plan: null,
      status: null,
      creditLimit: 0,
      creditsUsed: 0,
      creditsRemaining: 0,
    };
  }

  return {
    hasActiveSubscription: true,
    plan: subscription.planId,
    status: subscription.status,
    creditLimit: subscription.creditLimit,
    creditsUsed: subscription.creditsUsed,
    creditsRemaining: Math.max(
      0,
      subscription.creditLimit - subscription.creditsUsed
    ),
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
  };
}

export async function getAIUsageSummary(accountantId, days = 30) {
  const rangeStart = daysAgoStart(days);

  const rows = await AIUsageLog.aggregate([
    {
      $match: {
        userId: accountantId,
        createdAt: { $gte: rangeStart },
      },
    },
    {
      $group: {
        _id: "$requestType",
        requests: { $sum: 1 },
        creditsUsed: { $sum: "$creditsUsed" },
        totalTokens: { $sum: "$totalTokens" },
      },
    },
  ]);

  return rows.map((row) => ({
    requestType: row._id,
    requests: row.requests,
    creditsUsed: row.creditsUsed,
    totalTokens: row.totalTokens,
  }));
}

