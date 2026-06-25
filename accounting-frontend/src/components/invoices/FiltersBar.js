const invoiceTypes = ["sale", "purchase", "sales_return", "purchase_return", "expense"];
const statuses = ["paid", "partial", "unpaid"];

export default function FiltersBar({
  filters,
  isRtl,
  onChange,
  onClear,
  t,
  lang,
}) {
  const selectPadding = isRtl ? "pl-8 pr-3" : "pl-3 pr-8";

  return (
    <section className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/60 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:w-72">
        <label className="sr-only" htmlFor="invoice-search">
          {t("filter.search")}
        </label>
        <input
          className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20"
          id="invoice-search"
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder={t("filter.search")}
          type="search"
          value={filters.search}
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:w-auto xl:flex-wrap xl:items-center">
        <label className="sr-only" htmlFor="invoice-type-filter">
          {t("form.invoiceType")}
        </label>
        <select
          className={`min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2 text-sm text-slate-900 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 xl:w-auto ${selectPadding}`}
          id="invoice-type-filter"
          onChange={(event) => onChange({ invoiceType: event.target.value, page: 1 })}
          value={filters.invoiceType}
        >
          <option value="">{t("filter.allTypes")}</option>
          {invoiceTypes.map((type) => (
            <option key={type} value={type}>
              {t(`type.${type}`)}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="invoice-status-filter">
          {t("col.status")}
        </label>
        <select
          className={`min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2 text-sm text-slate-900 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 xl:w-auto ${selectPadding}`}
          id="invoice-status-filter"
          onChange={(event) => onChange({ paymentStatus: event.target.value, page: 1 })}
          value={filters.paymentStatus}
        >
          <option value="">{t("filter.allStatuses")}</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {t(`status.${status}`)}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="invoice-date-filter">
          {t("filter.allDates")}
        </label>
        <select
          className={`min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2 text-sm text-slate-900 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 xl:w-auto ${selectPadding}`}
          id="invoice-date-filter"
          onChange={(event) => onChange({ dateRange: event.target.value, page: 1 })}
          value={filters.dateRange}
        >
          <option value="all">{t("filter.allDates")}</option>
          <option value="last30">{t("filter.last30")}</option>
        </select>

        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-1 text-sm text-slate-600">
          <input
            checked={filters.includeCancelled}
            className="h-4 w-4 rounded border-slate-300 text-[#001540] focus:ring-[#001540]/20"
            onChange={(event) =>
              onChange({ includeCancelled: event.target.checked, page: 1 })
            }
            type="checkbox"
          />
          {t("filter.showCancelled")}
        </label>

        <button
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#001540]/20"
          onClick={onClear}
          type="button"
        >
          {t("action.clearFilters")}
        </button>

        <button
          aria-label={lang === "ar" ? "Switch to English" : "Switch to Arabic"}
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#001540]/20"
          onClick={() => onChange({ lang: lang === "ar" ? "en" : "ar" })}
          type="button"
        >
          {lang === "ar" ? "EN" : "AR"}
        </button>
      </div>
    </section>
  );
}
