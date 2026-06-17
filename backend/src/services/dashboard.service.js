import Invoice from "../models/Invoice.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import Client from "../models/Client.js";
import UserSubscription from "../models/UserSubscription.js";
import AIUsageLog from "../models/AIUsageLog.js";

function dayRange(offsetDays = 0) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() + offsetDays);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

function daysAgoStart(days) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days + 1);
  return d;
}

const ALL_INVOICE_TYPES = [
  "purchase",
  "sale",
  "purchase_return",
  "sales_return",
  "expense",
];

function totalsByType(rows) {
  const map = Object.fromEntries(ALL_INVOICE_TYPES.map((type) => [type, 0]));

  for (const row of rows) {
    if (row._id in map) {
      map[row._id] = row.total;
    }
  }

  return map;
}

function netSales(totals) {
  return totals.sale - totals.sales_return;
}

function netPurchases(totals) {
  return totals.purchase - totals.purchase_return;
}

function netProfit(totals) {
  return netSales(totals) - netPurchases(totals) - totals.expense;
}

function pctChange(today, yesterday) {
  if (yesterday === 0) return today > 0 ? 100 : 0;
  return Number((((today - yesterday) / yesterday) * 100).toFixed(1));
}

export async function getKpis(accountantId) {
  const { start, end } = dayRange(0);
  const yesterday = dayRange(-1);

  const [todayResult, yesterdayResult] = await Promise.all([
    Invoice.aggregate([
      {
        $match: {
          accountantId,
          isCancelled: false,
          invoiceType: { $in: ALL_INVOICE_TYPES },
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$invoiceType",
          total: { $sum: "$finalAmount" },
        },
      },
    ]),

    Invoice.aggregate([
      {
        $match: {
          accountantId,
          isCancelled: false,
          invoiceType: { $in: ALL_INVOICE_TYPES },
          createdAt: { $gte: yesterday.start, $lt: yesterday.end },
        },
      },
      {
        $group: {
          _id: "$invoiceType",
          total: { $sum: "$finalAmount" },
        },
      },
    ]),
  ]);

  const todayTotals = totalsByType(todayResult);
  const yesterdayTotals = totalsByType(yesterdayResult);

  const todaySales = netSales(todayTotals);
  const todayPurchases = netPurchases(todayTotals);
  const todayExpenses = todayTotals.expense;
  const todayProfit = netProfit(todayTotals);

  const yestSales = netSales(yesterdayTotals);
  const yestPurchases = netPurchases(yesterdayTotals);
  const yestExpenses = yesterdayTotals.expense;
  const yestProfit = netProfit(yesterdayTotals);

  return {
    sales: {
      value: todaySales,
      trend: pctChange(todaySales, yestSales),
      trendUp: todaySales >= yestSales,
    },
    purchases: {
      value: todayPurchases,
      trend: pctChange(todayPurchases, yestPurchases),
      trendUp: todayPurchases >= yestPurchases,
    },
    expenses: {
      value: todayExpenses,
      trend: pctChange(todayExpenses, yestExpenses),
      trendUp: todayExpenses >= yestExpenses,
    },
    profit: {
      value: todayProfit,
      trend: pctChange(todayProfit, yestProfit),
      trendUp: todayProfit >= yestProfit,
    },
  };
}

export async function getSalesPurchasesChart(accountantId, days = 30) {
  const rangeStart = daysAgoStart(days);
  const now = new Date();

  const rows = await Invoice.aggregate([
    {
      $match: {
        accountantId,
        isCancelled: false,
        invoiceType: {
          $in: ["sale", "purchase", "sales_return", "purchase_return"],
        },
        createdAt: { $gte: rangeStart, $lt: now },
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          type: "$invoiceType",
        },
        total: { $sum: "$finalAmount" },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  const salesMap = {};
  const purchasesMap = {};

  for (let i = 0; i < days; i++) {
    const d = new Date(rangeStart);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);

    salesMap[key] = 0;
    purchasesMap[key] = 0;
  }

  for (const row of rows) {
    const { date, type } = row._id;

    if (type === "sale") salesMap[date] += row.total;
    if (type === "sales_return") salesMap[date] -= row.total;
    if (type === "purchase") purchasesMap[date] += row.total;
    if (type === "purchase_return") purchasesMap[date] -= row.total;
  }

  const labels = Object.keys(salesMap).sort();

  return {
    labels,
    salesData: labels.map((label) => salesMap[label]),
    purchasesData: labels.map((label) => purchasesMap[label]),
  };
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