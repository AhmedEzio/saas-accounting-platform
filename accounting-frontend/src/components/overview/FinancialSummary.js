export default function FinancialSummary({ metrics, currency, t }) {
  const rows = [
    { label: t("kpi.cashIn"), value: metrics.cashIn, color: "bg-emerald-400" },
    { label: t("kpi.cashOut"), value: metrics.cashOut, color: "bg-red-400" },
    { label: t("summary.receivables"), value: metrics.receivables, color: "bg-blue-400" },
    { label: t("summary.netPosition"), value: metrics.profit, color: "bg-[#1b2b6b]" },
  ];

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-gray-900">{t("summary.title")}</h2>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${row.color}`} />
              <span className="truncate text-sm text-gray-600">{row.label}</span>
            </div>
            <span className="shrink-0 text-sm font-bold text-gray-900">{currency(row.value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
