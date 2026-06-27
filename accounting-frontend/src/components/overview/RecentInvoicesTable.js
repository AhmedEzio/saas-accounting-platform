import StatusBadge from "./StatusBadge";

const statuses = ["all", "paid", "partial", "unpaid", "cancelled"];

export default function RecentInvoicesTable({
  invoices,
  currency,
  date,
  t,
  isRtl,
  router,
  statusFilter,
  onStatusFilterChange,
  hasAnyInvoices,
}) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-base font-bold text-gray-900">{t("table.title")}</h2>
        <div className={`flex flex-col gap-2 sm:flex-row sm:items-center ${isRtl ? "sm:flex-row-reverse" : ""}`}>
          <div className={`flex flex-wrap gap-1 rounded-lg bg-gray-50 p-1 ${isRtl ? "justify-end" : "justify-start"}`} aria-label={t("filter.status")}>
            {statuses.map((status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onStatusFilterChange(status)}
                  className={`min-h-10 rounded-md px-3 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 ${
                    active ? "bg-white text-[#1b2b6b] shadow-sm" : "text-gray-500 hover:bg-white/70"
                  }`}
                  aria-pressed={active}
                >
                  {status === "all" ? t("filter.all") : t(`status.${status}`)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => router.push("/invoices")}
            className="min-h-10 rounded-lg px-2 text-xs font-bold text-[#1b2b6b] transition hover:bg-[#e8ebf7] focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2"
          >
            {t("action.viewAll")}
          </button>
        </div>
      </div>

      {!invoices.length ? (
        <div className="rounded-lg bg-gray-50 px-4 py-10 text-center">
          <p className="font-semibold text-gray-700">
            {hasAnyInvoices ? t("table.noMatches") : t("table.empty")}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {hasAnyInvoices ? t("table.noMatchesHint") : t("table.emptyHint")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold uppercase text-gray-400">
                <th className={`pb-3 ${isRtl ? "text-right" : "text-left"}`}>{t("table.invoice")}</th>
                <th className={`pb-3 ${isRtl ? "text-right" : "text-left"}`}>{t("table.client")}</th>
                <th className={`pb-3 ${isRtl ? "text-right" : "text-left"}`}>{t("table.type")}</th>
                <th className={`pb-3 ${isRtl ? "text-left" : "text-right"}`}>{t("table.amount")}</th>
                <th className={`pb-3 ${isRtl ? "text-left" : "text-right"}`}>{t("table.due")}</th>
                <th className="pb-3 text-center">{t("table.status")}</th>
                <th className={`pb-3 ${isRtl ? "text-left" : "text-right"}`}>{t("table.date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="transition hover:bg-gray-50/70">
                  <td className={`py-3 font-semibold text-gray-800 ${isRtl ? "text-right" : "text-left"}`}>
                    {invoice.invoiceNumber}
                  </td>
                  <td className={`py-3 text-gray-600 ${isRtl ? "text-right" : "text-left"}`}>
                    {invoice.clientName}
                  </td>
                  <td className={`py-3 text-gray-500 ${isRtl ? "text-right" : "text-left"}`}>
                    {t(`type.${invoice.invoiceType}`)}
                  </td>
                  <td className={`py-3 font-semibold text-gray-900 ${isRtl ? "text-left" : "text-right"}`}>
                    {currency(invoice.finalAmount)}
                  </td>
                  <td className={`py-3 text-gray-500 ${isRtl ? "text-left" : "text-right"}`}>
                    {currency(invoice.dueAmount)}
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={invoice.status} t={t} />
                  </td>
                  <td className={`py-3 text-gray-400 ${isRtl ? "text-left" : "text-right"}`}>
                    {date(invoice.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
