const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function formatMoney(value) {
  return moneyFormatter.format(Number(value || 0));
}

export default function InvoiceItemsTable({ invoice, isRtl, t }) {
  const alignEnd = isRtl ? "text-left" : "text-right";
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const isExpense = invoice.invoiceType === "expense";

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-950">
          {isExpense ? t("type.expense") : t("details.items")}
        </h2>
      </div>

      {isExpense ? (
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">{t("details.expenseName")}</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{invoice.expenseName || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">{t("details.expenseType")}</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{t(`expense.${invoice.expenseType}`)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase text-slate-500">{t("form.expenseDesc")}</p>
            <p className="mt-1 text-sm text-slate-700">{invoice.expenseDescription || "-"}</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                  {t("form.description")}
                </th>
                <th className={`w-24 px-5 py-3 text-xs font-semibold uppercase text-slate-500 ${alignEnd}`}>
                  {t("form.qty")}
                </th>
                <th className={`w-36 px-5 py-3 text-xs font-semibold uppercase text-slate-500 ${alignEnd}`}>
                  {t("form.unitPrice")}
                </th>
                <th className={`w-36 px-5 py-3 text-xs font-semibold uppercase text-slate-500 ${alignEnd}`}>
                  {t("form.total")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {items.map((item, index) => (
                <tr className="hover:bg-slate-50" key={`${item.description}-${index}`}>
                  <td className="px-5 py-4 font-medium text-slate-950">{item.description}</td>
                  <td className={`px-5 py-4 text-slate-600 ${alignEnd}`}>{item.quantity}</td>
                  <td className={`px-5 py-4 font-mono text-slate-600 ${alignEnd}`}>
                    {formatMoney(item.unitPrice)}
                  </td>
                  <td className={`px-5 py-4 font-mono font-semibold text-slate-950 ${alignEnd}`}>
                    {formatMoney(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-slate-200 bg-slate-50 p-5">
        <div className="ms-auto w-full max-w-sm space-y-2 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>{t("form.subtotal")}</span>
            <span className="font-mono">{formatMoney(invoice.baseAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>{t("form.tax")} ({Number(invoice.taxPercentage || 0)}%)</span>
            <span className="font-mono">{formatMoney(invoice.taxAmount)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-semibold text-[#001540]">
            <span>{t("form.total")}</span>
            <span className="font-mono">{formatMoney(invoice.finalAmount)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
