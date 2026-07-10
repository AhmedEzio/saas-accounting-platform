export default function DocumentsFilters({
  filters,
  isRtl,
  onChange,
  t,
  lang,
}) {
  const selectPadding = isRtl ? "pl-8 pr-3" : "pl-3 pr-8";
  
  // Note: we'll handle clear inline if needed or skip it since we only have two filters.

  return (
    <section className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:w-72">
        <label className="sr-only" htmlFor="document-search">
          {t("filter.search", lang)}
        </label>
        <input
          className="min-h-11 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition focus:border-[#1b2b6b] dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/20 dark:focus:ring-blue-500/20"
          id="document-search"
          onChange={(event) => onChange({ search: event.target.value, page: 1 })}
          placeholder={t("filter.search", lang)}
          type="search"
          value={filters.search}
        />
      </div>

      <div className="flex w-full sm:w-auto">
        <label className="sr-only" htmlFor="document-type-filter">
          {t("col.fileType", lang)}
        </label>
        <select
          className={`min-h-11 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 text-sm text-slate-900 dark:text-white focus:border-[#1b2b6b] dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/20 dark:focus:ring-blue-500/20 sm:w-auto ${selectPadding}`}
          id="document-type-filter"
          onChange={(event) => onChange({ fileType: event.target.value, page: 1 })}
          value={filters.fileType}
        >
          <option value="">{t("filter.allTypes", lang)}</option>
          <option value="pdf">PDF</option>
          <option value="jpg">JPG</option>
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
        </select>
      </div>
    </section>
  );
}
