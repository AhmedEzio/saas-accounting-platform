const number = (value) => Number(value ?? 0);

const isCancelled = (invoice) => Boolean(invoice.isCancelled);

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

const groupLabel = (date, useMonth) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return useMonth
    ? `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`
    : parsed.toISOString().slice(0, 10);
};

export function buildOverviewModel({ clients = [], invoices = [], payments = [], subscription = null }) {
  const sales = netTypeTotal(invoices, "sale", "sales_return");
  const purchases = netTypeTotal(invoices, "purchase", "purchase_return");
  const expenses = expenseTotal(invoices);
  const profit = sales - purchases - expenses;
  const receivables = receivablesTotal(invoices);
  const cashIn = paymentTotal(payments, "in");
  const cashOut = paymentTotal(payments, "out");

  const activeInvoices = invoices.filter((invoice) => !isCancelled(invoice));
  const useMonth = activeInvoices.length > 31;
  const chartMap = new Map();

  activeInvoices.forEach((invoice) => {
    const label = groupLabel(invoice.createdAt, useMonth);
    if (label === "-") return;
    const current = chartMap.get(label) ?? { label, sales: 0, purchases: 0 };

    if (invoice.invoiceType === "sale") current.sales += number(invoice.finalAmount);
    if (invoice.invoiceType === "sales_return") current.sales -= number(invoice.finalAmount);
    if (invoice.invoiceType === "purchase") current.purchases += number(invoice.finalAmount);
    if (invoice.invoiceType === "purchase_return") current.purchases -= number(invoice.finalAmount);

    chartMap.set(label, current);
  });

  const chartData = Array.from(chartMap.values())
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(-12);

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)
    .map((invoice) => ({
      ...invoice,
      clientName: clientName(invoice),
      status: invoiceStatus(invoice),
    }));

  return {
    metrics: {
      totalClients: clients.length,
      totalInvoices: invoices.length,
      sales,
      purchases,
      expenses,
      profit,
      receivables,
      cashIn,
      cashOut,
    },
    chartData,
    recentInvoices,
    subscription,
    hasRecords: clients.length > 0 || invoices.length > 0 || payments.length > 0,
    counts: {
      clients: clients.length,
      invoices: invoices.length,
      payments: payments.length,
    },
  };
}
