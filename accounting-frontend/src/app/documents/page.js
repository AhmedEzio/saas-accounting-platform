"use client";

import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/locales/documents";
// import DocumentsDataTable from "./DocumentsDataTable";
// import DocumentsStatsCards from "./DocumentsStatsCards";

export default function DocumentsPage() {
  const { lang, isRtl } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("page.documents", lang)}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {t("page.documentsSubtitle", lang)}
          </p>
        </div>
        
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => {
              // TODO: Open Upload Modal
            }}
            className="flex items-center gap-2 rounded-xl bg-[#1b2b6b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#162358] focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500 dark:focus:ring-offset-slate-900"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {t("action.upload", lang)}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* <DocumentsStatsCards /> */}
        {/* <DocumentsDataTable /> */}
        
        {/* Placeholder until Phase 2 */}
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-12 text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">Documents Module</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">DataTable and Modals will be implemented in Phase 2.</p>
        </div>
      </div>
    </div>
  );
}
