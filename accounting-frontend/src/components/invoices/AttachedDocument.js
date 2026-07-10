import React from "react";
import { downloadFile } from "@/utils/downloadFile";


export default function AttachedDocument({ invoice, lang, t }) {
  const document = invoice?.documentId;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
        {t("document.title")}
      </h3>

      {!document ? (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("document.noDocument")}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8ebf7] dark:bg-blue-900/30 font-bold text-[#1b2b6b] dark:text-blue-400">
              <span className="text-xs uppercase">{document.fileType || "FILE"}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white" title={document.fileName}>
                {document.fileName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                {document.fileType}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center justify-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/20"
            >
              {t("document.open")}
            </a>
            <button
              onClick={(e) => downloadFile(e, document.fileUrl, document.fileName, document.fileType)}
              className="inline-flex h-8 items-center justify-center rounded bg-[#1b2b6b] dark:bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-[#162358] dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/30"
              type="button"
            >
              {t("document.download")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
