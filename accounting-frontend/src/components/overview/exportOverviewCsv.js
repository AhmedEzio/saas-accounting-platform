const csvCell = (value) => {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
};

const csvRow = (cells) => cells.map(csvCell).join(",");

export function buildOverviewCsv({
  model,
  recentInvoices,
  rangeLabel,
  generatedLabel,
  labels,
  formatCurrency,
  formatPercent,
  formatNumber,
  formatDate,
  formatType,
  formatStatus,
}) {
  const rows = [
    [labels.section, labels.value],
    [labels.generatedFrom, generatedLabel],
    [labels.dateRange, rangeLabel],
    [labels.totalClients, formatNumber(model.metrics.totalClients)],
    [labels.totalInvoices, formatNumber(model.metrics.totalInvoices)],
    [labels.sales, formatCurrency(model.metrics.sales)],
    [labels.purchases, formatCurrency(model.metrics.purchases)],
    [labels.expenses, formatCurrency(model.metrics.expenses)],
    [labels.profit, formatCurrency(model.metrics.profit)],
    [labels.receivables, formatCurrency(model.metrics.receivables)],
    [labels.cashIn, formatCurrency(model.metrics.cashIn)],
    [labels.cashOut, formatCurrency(model.metrics.cashOut)],
    [labels.paid, formatNumber(model.insights.statusCounts.paid)],
    [labels.partial, formatNumber(model.insights.statusCounts.partial)],
    [labels.unpaid, formatNumber(model.insights.statusCounts.unpaid)],
    [labels.cancelled, formatNumber(model.insights.statusCounts.cancelled)],
    [labels.collectionRate, formatPercent(model.insights.collectionRate)],
    [labels.averageInvoice, formatCurrency(model.insights.averageInvoiceValue)],
    [],
    [labels.recentInvoices],
    [
      labels.invoiceNumber,
      labels.client,
      labels.type,
      labels.amount,
      labels.due,
      labels.status,
      labels.date,
    ],
  ];

  recentInvoices.forEach((invoice) => {
    rows.push([
      invoice.invoiceNumber,
      invoice.clientName,
      formatType(invoice.invoiceType),
      formatCurrency(invoice.finalAmount),
      formatCurrency(invoice.dueAmount),
      formatStatus(invoice.status),
      formatDate(invoice.createdAt),
    ]);
  });

  if (!recentInvoices.length) rows.push([labels.noRecentInvoices]);

  return rows.map(csvRow).join("\r\n");
}
