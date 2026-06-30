const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-US");
const operatingTypes = ["sale", "purchase", "expense"];

function getEffectiveDue(invoice) {
  return Number(invoice.effectiveDue ?? invoice.dueAmount ?? 0);
}

function StatCard({ label, value, helper, wide = false }) {
  return (
    <div
      className={`flex h-[120px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] ${
        wide ? "lg:col-span-2" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-950">{value}</p>
        {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
      </div>
    </div>
  );
}

export default function StatCards({ invoices, total, t }) {
  const operatingInvoices = invoices.filter(
    (invoice) =>
      !invoice.isCancelled &&
      !invoice.isFullyReturned &&
      operatingTypes.includes(invoice.invoiceType)
  );
  const paid = operatingInvoices.filter((invoice) => getEffectiveDue(invoice) <= 0).length;
  const unpaidOrPartial = invoices.filter(
    (invoice) =>
      !invoice.isCancelled &&
      !invoice.isFullyReturned &&
      operatingTypes.includes(invoice.invoiceType) &&
      getEffectiveDue(invoice) > 0
  ).length;
  const receivables = invoices.reduce((sum, invoice) => {
    if (invoice.isCancelled || invoice.invoiceType !== "sale") return sum;
    return sum + getEffectiveDue(invoice);
  }, 0);
  const payables = invoices.reduce((sum, invoice) => {
    if (
      invoice.isCancelled ||
      !["purchase", "expense"].includes(invoice.invoiceType)
    ) {
      return sum;
    }
    return sum + getEffectiveDue(invoice);
  }, 0);

  return (
    <section
      aria-label="Invoice statistics"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5"
    >
      <StatCard
        helper={t("stats.allFiltered")}
        label={t("stats.totalInvoices")}
        value={numberFormatter.format(total)}
      />
      <StatCard
        helper={t("stats.currentPage")}
        label={t("stats.paidInvoices")}
        value={numberFormatter.format(paid)}
      />
      <StatCard
        helper={t("stats.currentPage")}
        label={t("stats.unpaidOverdue")}
        value={numberFormatter.format(unpaidOrPartial)}
      />
      <StatCard
        helper={t("stats.currentPage")}
        label={t("stats.receivables")}
        value={formatter.format(receivables)}
      />
      <StatCard
        helper={t("stats.currentPage")}
        label={t("stats.payables")}
        value={formatter.format(payables)}
      />
    </section>
  );
}
