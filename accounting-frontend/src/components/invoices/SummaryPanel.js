const paymentMethods = ["cash", "card", "wallet", "bank_transfer"];

export default function SummaryPanel({
  amountPaid,
  errors = {},
  onChange,
  paymentMethod,
  submitting,
  taxPercentage,
  totals,
  t,
}) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-6">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-950">{t("details.summary")}</h2>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t("form.subtotal")}</span>
            <span className="font-mono font-medium text-slate-950">
              {totals.baseAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t("form.tax")}</span>
            <span className="font-mono font-medium text-slate-950">
              {totals.taxAmount.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-slate-950">{t("form.total")}</span>
              <span className="font-mono text-2xl font-bold text-[#001540]">
                {totals.finalAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t("form.amountPaid")}</span>
            <span className="font-mono font-medium text-emerald-700">
              {totals.amountPaid.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t("col.dueAmount")}</span>
            <span className="font-mono font-medium text-rose-700">
              {totals.dueAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-600" htmlFor="taxPercentage">
            {t("form.taxPct")}
          </label>
          <input
            className={`min-h-11 w-full rounded-lg border px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${
              errors.taxPercentage ? "border-rose-400" : "border-slate-300"
            }`}
            id="taxPercentage"
            max="100"
            min="0"
            onChange={(event) => onChange({ taxPercentage: event.target.value })}
            step="0.01"
            type="number"
            value={taxPercentage}
          />
          {errors.taxPercentage ? <p className="text-xs text-rose-600">{errors.taxPercentage}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-600" htmlFor="amountPaid">
            {t("form.amountPaid")}
          </label>
          <input
            className={`min-h-11 w-full rounded-lg border px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${
              errors.amountPaid ? "border-rose-400" : "border-slate-300"
            }`}
            id="amountPaid"
            min="0"
            onChange={(event) => onChange({ amountPaid: event.target.value })}
            step="0.01"
            type="number"
            value={amountPaid}
          />
          {errors.amountPaid ? <p className="text-xs text-rose-600">{errors.amountPaid}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-600" htmlFor="paymentMethod">
            {t("form.paymentMethod")}
          </label>
          <select
            className={`min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${
              errors.paymentMethod ? "border-rose-400" : "border-slate-300"
            }`}
            id="paymentMethod"
            onChange={(event) => onChange({ paymentMethod: event.target.value })}
            value={paymentMethod}
          >
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {t(`method.${method}`)}
              </option>
            ))}
          </select>
          {errors.paymentMethod ? <p className="text-xs text-rose-600">{errors.paymentMethod}</p> : null}
        </div>

        <button
          className="min-h-11 w-full rounded-lg bg-[#001540] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f2a5f] focus:outline-none focus:ring-2 focus:ring-[#001540]/30 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? t("form.submitting") : t("action.submit")}
        </button>
      </div>
    </aside>
  );
}
