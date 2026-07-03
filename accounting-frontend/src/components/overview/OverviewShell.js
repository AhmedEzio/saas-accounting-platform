"use client";

/**
 * OverviewShell – legacy wrapper kept for backward compatibility.
 * Delegates to the shared AppShell component and restores the
 * Export CSV / Export Excel / Print Report header buttons.
 */
import AppShell from "@/components/AppShell";
import { OverviewIcons } from "@/components/overview/OverviewIcons";

export default function OverviewShell({
  children,
  activeKey = "overview",
  lang = "en",
  setLang,
  t,
  // Header action props
  onExport,
  onExportExcel,
  onPrint,
  exporting,
  exportingExcel,
  printing,
  // Legacy layout props (ignored — AppShell handles these internally)
  user: _user,
  router: _router,
  isRtl: _isRtl,
  mobileNavOpen: _mobileNavOpen,
  setMobileNavOpen: _setMobileNavOpen,
  searchTerm: _searchTerm,
  onSearchChange: _onSearchChange,
}) {
  /* Build header action buttons only when the callbacks are provided */
  const headerActions =
    onExport || onExportExcel || onPrint ? (
      <>
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            title={t?.("action.exportCsv") ?? "Export CSV"}
            aria-label={exporting ? (t?.("action.preparingExport") ?? "Preparing…") : (t?.("action.exportCsv") ?? "Export CSV")}
            className="flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 disabled:cursor-wait disabled:text-gray-400"
          >
            {OverviewIcons.download}
            {exporting ? (t?.("action.preparingExport") ?? "Preparing…") : (t?.("action.exportCsv") ?? "Export CSV")}
          </button>
        )}
        {onExportExcel && (
          <button
            type="button"
            onClick={onExportExcel}
            disabled={exportingExcel}
            title={t?.("action.exportExcel") ?? "Export Excel"}
            aria-label={exportingExcel ? (t?.("action.preparingExcel") ?? "Preparing…") : (t?.("action.exportExcel") ?? "Export Excel")}
            className="flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 disabled:cursor-wait disabled:text-gray-400"
          >
            {OverviewIcons.download}
            {exportingExcel ? (t?.("action.preparingExcel") ?? "Preparing…") : (t?.("action.exportExcel") ?? "Export Excel")}
          </button>
        )}
        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            disabled={printing}
            title={t?.("action.printReport") ?? "Print Report"}
            aria-label={printing ? (t?.("action.preparingReport") ?? "Preparing…") : (t?.("action.printReport") ?? "Print Report")}
            className="flex min-h-10 items-center gap-2 rounded-lg bg-[#1b2b6b] px-3 text-sm font-semibold text-white transition hover:bg-[#162358] focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {OverviewIcons.report}
            {printing ? (t?.("action.preparingReport") ?? "Preparing…") : (t?.("action.printReport") ?? "Print Report")}
          </button>
        )}
      </>
    ) : null;

  return (
    <AppShell
      activeKey={activeKey}
      lang={lang}
      setLang={setLang}
      headerActions={headerActions}
    >
      {children}
    </AppShell>
  );
}
