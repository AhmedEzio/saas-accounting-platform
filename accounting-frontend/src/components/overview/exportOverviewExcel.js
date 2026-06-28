import * as XLSX from "xlsx";

const fitColumns = (rows) =>
  rows[0]?.map((_, index) => ({
    wch: Math.min(
      34,
      Math.max(
        12,
        ...rows.map((row) => String(row[index] ?? "").length + 2),
      ),
    ),
  })) ?? [];

const addSheet = (workbook, name, rows, isRtl) => {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = fitColumns(rows);
  if (isRtl) worksheet["!rtl"] = true;
  XLSX.utils.book_append_sheet(workbook, worksheet, name.slice(0, 31));
};

export function exportOverviewExcel({
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
  isRtl,
  filename,
}) {
  const workbook = XLSX.utils.book_new();
  workbook.Workbook = { Views: [{ RTL: Boolean(isRtl) }] };

  addSheet(
    workbook,
    labels.sheetKpis,
    [
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
    ],
    isRtl,
  );

  addSheet(
    workbook,
    labels.sheetStatus,
    [
      [labels.status, labels.count],
      [labels.paid, formatNumber(model.insights.statusCounts.paid)],
      [labels.partial, formatNumber(model.insights.statusCounts.partial)],
      [labels.unpaid, formatNumber(model.insights.statusCounts.unpaid)],
      [labels.cancelled, formatNumber(model.insights.statusCounts.cancelled)],
    ],
    isRtl,
  );

  addSheet(
    workbook,
    labels.sheetInsights,
    [
      [labels.insight, labels.value],
      [labels.collectionRate, formatPercent(model.insights.collectionRate)],
      [labels.averageInvoice, formatCurrency(model.insights.averageInvoiceValue)],
      ...model.insights.health.map((item) => [labels.financialHealth, labels.healthMessage(item.key)]),
    ],
    isRtl,
  );

  addSheet(
    workbook,
    labels.sheetTop,
    [
      [labels.client, labels.sales, labels.purchases, labels.outstanding],
      ...model.insights.topEntities.map((entity) => [
        entity.name,
        formatCurrency(entity.sales),
        formatCurrency(entity.purchases),
        formatCurrency(entity.outstanding),
      ]),
    ],
    isRtl,
  );

  addSheet(
    workbook,
    labels.sheetRecent,
    [
      [
        labels.invoiceNumber,
        labels.client,
        labels.type,
        labels.amount,
        labels.due,
        labels.status,
        labels.date,
      ],
      ...recentInvoices.map((invoice) => [
        invoice.invoiceNumber,
        invoice.clientName,
        formatType(invoice.invoiceType),
        formatCurrency(invoice.finalAmount),
        formatCurrency(invoice.dueAmount),
        formatStatus(invoice.status),
        formatDate(invoice.createdAt),
      ]),
    ],
    isRtl,
  );

  XLSX.writeFile(workbook, filename, { bookType: "xlsx" });
}
