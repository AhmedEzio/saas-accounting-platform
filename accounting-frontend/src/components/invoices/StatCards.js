const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-US");

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
  const paid = invoices.filter((invoice) => !invoice.isCancelled && invoice.dueAmount <= 0).length;
  const unpaidOrPartial = invoices.filter(
    (invoice) => !invoice.isCancelled && invoice.dueAmount > 0
  ).length;
  const outstanding = invoices.reduce((sum, invoice) => {
    if (invoice.isCancelled) return sum;
    return sum + Number(invoice.dueAmount || 0);
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
        label={t("stats.outstanding")}
        value={formatter.format(outstanding)}
        wide
      />
    </section>
  );
}
