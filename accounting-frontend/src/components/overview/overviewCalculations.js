const MS_PER_DAY = 24 * 60 * 60 * 1000;

const number = (value) => Number(value ?? 0);

const isCancelled = (invoice) => Boolean(invoice.isCancelled);

const validDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const addDays = (date, days) => new Date(date.getTime() + days * MS_PER_DAY);

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const startOfYear = (date) => new Date(date.getFullYear(), 0, 1);

const daysBetween = (start, end) => Math.max(1, Math.round((end - start) / MS_PER_DAY));

const formatNumber = (value, lang) =>
  new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
    maximumFractionDigits: 0,
  }).format(value);

const formatDayLabel = (date, lang) =>
  new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(date);

const formatMonthLabel = (date, lang) =>
  new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    year: "2-digit",
  }).format(date);

const netTypeTotal = (invoices, type, returnType) =>
  invoices.reduce((sum, invoice) => {
    if (isCancelled(invoice)) return sum;
    if (invoice.invoiceType === type) return sum + number(invoice.finalAmount);
    if (invoice.invoiceType === returnType) return sum - number(invoice.finalAmount);
    return sum;
  }, 0);

const expenseTotal = (invoices) =>
  invoices.reduce((sum, invoice) => {
    if (isCancelled(invoice) || invoice.invoiceType !== "expense") return sum;
    return sum + number(invoice.finalAmount);
  }, 0);

const receivablesTotal = (invoices) =>
  invoices.reduce((sum, invoice) => {
    if (isCancelled(invoice)) return sum;
    if (!["sale", "purchase_return"].includes(invoice.invoiceType)) return sum;
    return sum + number(invoice.dueAmount);
  }, 0);

const paymentTotal = (payments, direction) =>
  payments.reduce((sum, payment) => {
    if (payment.direction !== direction) return sum;
    return sum + number(payment.amount);
  }, 0);

const invoiceStatus = (invoice) => {
  if (invoice.isCancelled) return "cancelled";
  if (number(invoice.dueAmount) <= 0) return "paid";
  if (number(invoice.amountPaid) > 0) return "partial";
  return "unpaid";
};

const clientName = (invoice) =>
  invoice.clientId?.name || invoice.expenseName || invoice.clientName || "-";

const paymentTitle = (payment) => {
  const invoiceNumber = payment.invoiceId?.invoiceNumber;
  const client = payment.clientId?.name;
  return [invoiceNumber, client, payment.source].filter(Boolean).join(" - ") || payment.source || "-";
};

const comparableRange = (start, end) => {
  if (!start || !end) return { previousStart: null, previousEnd: null };
  const durationDays = daysBetween(start, end);
  const previousEnd = start;
  const previousStart = addDays(start, -durationDays);
  return { previousStart, previousEnd };
};

export function getDateRangeBounds(dateRange, now = new Date()) {
  const today = startOfDay(now);
  const end = addDays(today, 1);
  let start = null;

  if (dateRange === "today") start = today;
  if (dateRange === "last7") start = addDays(today, -6);
  if (dateRange === "last30") start = addDays(today, -29);
  if (dateRange === "thisMonth") start = startOfMonth(today);
  if (dateRange === "thisYear") start = startOfYear(today);

  const { previousStart, previousEnd } = comparableRange(start, end);

  return {
    key: dateRange,
    start,
    end: start ? end : null,
    previousStart,
    previousEnd,
  };
}

const inRange = (dateValue, start, end) => {
  const parsed = validDate(dateValue);
  if (!parsed) return false;
  if (start && parsed < start) return false;
  if (end && parsed >= end) return false;
  return true;
};

const filterByRange = (items, start, end, getDate = (item) => item.createdAt) => {
  if (!start && !end) return items;
  return items.filter((item) => inRange(getDate(item), start, end));
};

const filterClientsByRange = (clients, start, end) => {
  if (!start && !end) return clients;
  const datedClients = clients.filter((client) => client.createdAt || client.updatedAt);
  if (!datedClients.length) return clients;
  return clients.filter((client) => inRange(client.createdAt || client.updatedAt, start, end));
};

const financeMetrics = (invoices, payments) => {
  const sales = netTypeTotal(invoices, "sale", "sales_return");
  const purchases = netTypeTotal(invoices, "purchase", "purchase_return");
  const expenses = expenseTotal(invoices);
  const profit = sales - purchases - expenses;

  return {
    sales,
    purchases,
    expenses,
    profit,
    receivables: receivablesTotal(invoices),
    cashIn: paymentTotal(payments, "in"),
    cashOut: paymentTotal(payments, "out"),
  };
};

const trendFor = (current, previous, available) => {
  if (!available || previous === 0) {
    return { direction: "neutral", percent: null, available: false };
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;
  if (!Number.isFinite(change) || Math.abs(change) < 0.1) {
    return { direction: "neutral", percent: 0, available: true };
  }

  return {
    direction: change > 0 ? "up" : "down",
    percent: Math.abs(change),
    available: true,
  };
};

const groupKey = (date, chartPeriod, anchor) => {
  const day = startOfDay(date);

  if (chartPeriod === "weekly") {
    const weekIndex = Math.floor((day - anchor) / (7 * MS_PER_DAY));
    const weekStart = addDays(anchor, weekIndex * 7);
    return {
      key: weekStart.toISOString().slice(0, 10),
      weekIndex: weekIndex + 1,
      date: weekStart,
    };
  }

  if (chartPeriod === "monthly") {
    return {
      key: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}`,
      date: new Date(day.getFullYear(), day.getMonth(), 1),
    };
  }

  return {
    key: day.toISOString().slice(0, 10),
    date: day,
  };
};

const groupLabel = (bucket, chartPeriod, lang) => {
  if (chartPeriod === "weekly") {
    return lang === "ar"
      ? `الأسبوع ${formatNumber(bucket.weekIndex, lang)}`
      : `Week ${bucket.weekIndex}`;
  }

  if (chartPeriod === "monthly") return formatMonthLabel(bucket.date, lang);

  return formatDayLabel(bucket.date, lang);
};

const buildChartData = (invoices, chartPeriod, lang, rangeStart) => {
  const activeInvoices = invoices.filter((invoice) => !isCancelled(invoice));
  const firstInvoiceDate = activeInvoices
    .map((invoice) => validDate(invoice.createdAt))
    .filter(Boolean)
    .sort((a, b) => a - b)[0];
  const anchor = startOfDay(rangeStart || firstInvoiceDate || new Date());
  const chartMap = new Map();

  activeInvoices.forEach((invoice) => {
    const parsed = validDate(invoice.createdAt);
    if (!parsed) return;

    const bucket = groupKey(parsed, chartPeriod, anchor);
    const current = chartMap.get(bucket.key) ?? {
      key: bucket.key,
      label: groupLabel(bucket, chartPeriod, lang),
      sales: 0,
      purchases: 0,
    };

    if (invoice.invoiceType === "sale") current.sales += number(invoice.finalAmount);
    if (invoice.invoiceType === "sales_return") current.sales -= number(invoice.finalAmount);
    if (invoice.invoiceType === "purchase") current.purchases += number(invoice.finalAmount);
    if (invoice.invoiceType === "purchase_return") current.purchases -= number(invoice.finalAmount);

    chartMap.set(bucket.key, current);
  });

  return Array.from(chartMap.values()).sort((a, b) => a.key.localeCompare(b.key));
};

const buildInvoiceActivities = (invoices) =>
  invoices.flatMap((invoice) => {
    const base = {
      source: "invoice",
      invoiceNumber: invoice.invoiceNumber,
      clientName: clientName(invoice),
      invoiceType: invoice.invoiceType,
      status: invoiceStatus(invoice),
      amount: number(invoice.finalAmount),
    };

    const created = {
      ...base,
      id: `invoice-created-${invoice._id}`,
      kind: "invoiceCreated",
      title: invoice.invoiceNumber,
      time: invoice.createdAt,
      tone: "bg-blue-500",
    };

    if (!invoice.isCancelled) return [created];

    return [
      {
        ...base,
        id: `invoice-cancelled-${invoice._id}`,
        kind: "invoiceCancelled",
        title: invoice.invoiceNumber,
        time: invoice.cancelledAt || invoice.updatedAt || invoice.createdAt,
        tone: "bg-gray-500",
      },
      created,
    ];
  });

const buildPaymentActivities = (payments) =>
  payments.map((payment) => ({
    id: `payment-${payment._id}`,
    source: "payment",
    kind: payment.direction === "out" ? "paymentOut" : "paymentIn",
    title: paymentTitle(payment),
    time: payment.createdAt,
    amount: number(payment.amount),
    status: payment.direction,
    tone: payment.direction === "out" ? "bg-red-500" : "bg-emerald-500",
  }));

export function buildOverviewModel(
  { clients = [], invoices = [], payments = [], subscription = null },
  { dateRange = "last30", chartPeriod = "daily", lang = "en" } = {},
) {
  const range = getDateRangeBounds(dateRange);
  const rangeClients = filterClientsByRange(clients, range.start, range.end);
  const rangeInvoices = filterByRange(invoices, range.start, range.end);
  const rangePayments = filterByRange(payments, range.start, range.end);
  const previousInvoices = filterByRange(invoices, range.previousStart, range.previousEnd);
  const previousPayments = filterByRange(payments, range.previousStart, range.previousEnd);
  const metrics = financeMetrics(rangeInvoices, rangePayments);
  const previousMetrics = financeMetrics(previousInvoices, previousPayments);
  const hasComparison = Boolean(range.previousStart && range.previousEnd);

  const recentInvoices = [...rangeInvoices]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((invoice) => ({
      ...invoice,
      clientName: clientName(invoice),
      status: invoiceStatus(invoice),
    }));

  const rangeInvoiceActivities = buildInvoiceActivities(invoices).filter((item) =>
    !range.start && !range.end ? true : inRange(item.time, range.start, range.end),
  );
  const rangePaymentActivities = buildPaymentActivities(payments).filter((item) =>
    !range.start && !range.end ? true : inRange(item.time, range.start, range.end),
  );

  const recentActivity = [...rangeInvoiceActivities, ...rangePaymentActivities]
    .filter((item) => item.time)
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  return {
    metrics: {
      totalClients: rangeClients.length,
      totalInvoices: rangeInvoices.length,
      ...metrics,
    },
    trends: {
      sales: trendFor(metrics.sales, previousMetrics.sales, hasComparison),
      purchases: trendFor(metrics.purchases, previousMetrics.purchases, hasComparison),
      expenses: trendFor(metrics.expenses, previousMetrics.expenses, hasComparison),
      profit: trendFor(metrics.profit, previousMetrics.profit, hasComparison),
    },
    chartData: buildChartData(rangeInvoices, chartPeriod, lang, range.start),
    recentInvoices: recentInvoices.slice(0, 6),
    allRecentInvoices: recentInvoices,
    recentActivity: recentActivity.slice(0, 8),
    allRecentActivity: recentActivity,
    subscription,
    range,
    hasRecords: clients.length > 0 || invoices.length > 0 || payments.length > 0,
    counts: {
      clients: rangeClients.length,
      invoices: rangeInvoices.length,
      payments: rangePayments.length,
    },
  };
}
