"use client";

import { OverviewIcons } from "./OverviewIcons";

const navItems = [
  { key: "overview", href: "/overview" },
  { key: "invoices", href: "/invoices" },
  { key: "clients", href: "/clients" },
  { key: "payments", href: "/payments" },
  { key: "subscription", href: "/subscription" },
];

export default function OverviewShell({
  children,
  user,
  router,
  lang,
  setLang,
  isRtl,
  t,
  mobileNavOpen,
  setMobileNavOpen,
  searchTerm,
  onSearchChange,
  onExport,
  onExportExcel,
  onPrint,
  exporting,
  exportingExcel,
  printing,
}) {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const go = (href) => {
    setMobileNavOpen(false);
    router.push(href);
  };

  const sidebar = (
    <aside className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg bg-[#1b2b6b]">
          <span className="text-lg font-extrabold leading-none text-white">F</span>
          <span className="h-0.5 w-5 rounded-full bg-[#1fc99e]" />
          <span className="h-0.5 w-3 rounded-full bg-[#1fc99e] opacity-70" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-[#1b2b6b]">Finora</p>
          <p className="text-[11px] leading-tight text-gray-400">Accounting AI</p>
        </div>
      </div>

      <div className="px-3 py-4">
        <button
          type="button"
          onClick={() => go("/invoices/new")}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1b2b6b] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#162358] focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2"
        >
          <span aria-hidden="true">{OverviewIcons.invoice}</span>
          {t("action.newInvoice")}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const active = item.key === "overview";
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => go(item.href)}
              className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 ${
                active
                  ? "bg-[#e8ebf7] text-[#1b2b6b]"
                  : "text-gray-600 hover:bg-gray-50"
              } ${isRtl ? "text-right" : "text-left"}`}
            >
              <span className={active ? "text-[#1b2b6b]" : "text-gray-400"} aria-hidden="true">
                {item.key === "overview" ? OverviewIcons.trend : OverviewIcons.invoice}
              </span>
              {t(`nav.${item.key}`)}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1b2b6b] text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">{user?.name || "User"}</p>
            <p className="truncate text-xs text-gray-400">{user?.email || ""}</p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-dvh bg-[#f4f5f8] text-gray-900">
      <div
        className={`fixed inset-y-0 z-30 hidden w-64 border-gray-100 print:hidden lg:block ${
          isRtl ? "right-0 border-l" : "left-0 border-r"
        }`}
      >
        {sidebar}
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 print:hidden lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          />
          <div
            className={`absolute inset-y-0 w-72 max-w-[86vw] shadow-xl ${
              isRtl ? "right-0" : "left-0"
            }`}
          >
            {sidebar}
          </div>
        </div>
      )}

      <header
        className={`sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-gray-100 bg-white/95 px-4 backdrop-blur print:hidden lg:fixed lg:h-16 ${
          isRtl ? "lg:left-0 lg:right-64" : "lg:left-64 lg:right-0"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 lg:hidden"
          aria-label="Open navigation"
        >
          {OverviewIcons.menu}
        </button>

        <label className="hidden min-h-11 w-full max-w-xs items-center gap-2 rounded-lg bg-gray-50 px-3 text-gray-400 transition focus-within:ring-2 focus-within:ring-[#1b2b6b] focus-within:ring-offset-2 lg:flex">
          <span aria-hidden="true">{OverviewIcons.search}</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label={t("search.label")}
            placeholder={t("search.placeholder")}
            className={`min-w-0 flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none ${
              isRtl ? "text-right" : "text-left"
            }`}
          />
        </label>

        <div className={`ms-auto flex items-center gap-2 ${isRtl ? "mr-auto ms-0" : ""}`}>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            title={t("action.exportCsv")}
            aria-label={exporting ? t("action.preparingExport") : t("action.exportCsv")}
            className="hidden min-h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 disabled:cursor-wait disabled:text-gray-400 lg:flex"
          >
            {OverviewIcons.download}
            {exporting ? t("action.preparingExport") : t("action.exportCsv")}
          </button>
          <button
            type="button"
            onClick={onExportExcel}
            disabled={exportingExcel}
            title={t("action.exportExcel")}
            aria-label={exportingExcel ? t("action.preparingExcel") : t("action.exportExcel")}
            className="hidden min-h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 disabled:cursor-wait disabled:text-gray-400 lg:flex"
          >
            {OverviewIcons.download}
            {exportingExcel ? t("action.preparingExcel") : t("action.exportExcel")}
          </button>
          <button
            type="button"
            onClick={onPrint}
            disabled={printing}
            title={t("action.printReport")}
            aria-label={printing ? t("action.preparingReport") : t("action.printReport")}
            className="hidden min-h-11 items-center gap-2 rounded-lg bg-[#1b2b6b] px-3 text-sm font-semibold text-white transition hover:bg-[#162358] focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 lg:flex"
          >
            {OverviewIcons.report}
            {printing ? t("action.preparingReport") : t("action.printReport")}
          </button>
          <button
            type="button"
            disabled
            title={t("action.comingSoon")}
            aria-label={t("notify.label")}
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-gray-400 disabled:cursor-not-allowed"
          >
            {OverviewIcons.bell}
            <span className={`absolute top-2 h-2 w-2 rounded-full bg-red-400 ${isRtl ? "left-2" : "right-2"}`} />
          </button>
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="min-h-11 rounded-full border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2"
            aria-label="Switch language"
          >
            {t("lang.switch")}
          </button>
        </div>
      </header>

      <main className={`min-h-dvh px-4 py-5 print:m-0 print:bg-white print:p-0 lg:px-7 lg:pb-8 lg:pt-24 ${isRtl ? "lg:mr-64 print:mr-0" : "lg:ml-64 print:ml-0"}`}>
        {children}
      </main>
    </div>
  );
}
