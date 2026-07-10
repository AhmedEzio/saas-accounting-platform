import { useEffect, useState } from "react";
import { documentsApi } from "@/services/documents";
import { downloadFile } from "@/utils/downloadFile";


export default function DocumentPreviewModal({ documentId, open, onClose, t }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !documentId) return;
    let active = true;

    setLoading(true);
    setError("");
    documentsApi
      .getById(documentId)
      .then((data) => {
        if (active) setDoc(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Failed to load document details");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, documentId]);

  // Escape key listener
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  // Reset doc when closed
  useEffect(() => {
    if (!open) {
      setDoc(null);
      setError("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div
        aria-labelledby="preview-doc-title"
        className="flex max-h-[calc(100dvh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="preview-doc-title" className="text-xl font-semibold text-slate-950 dark:text-white">
              {t("action.preview")}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-slate-500 dark:text-slate-400">{t("preview.loading")}</p>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-900/30 p-4 text-rose-700 dark:text-rose-400">
              {error}
            </div>
          ) : doc ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{t("col.fileName")}</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white break-words">{doc.fileName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{t("col.fileType")}</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white uppercase">{doc.fileType}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{t("col.invoiceRef")}</p>
                  <p className="mt-1 font-mono text-slate-900 dark:text-white">{doc.invoiceId?.invoiceNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{t("col.uploadDate")}</p>
                  <p className="mt-1 text-slate-900 dark:text-white">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {doc.ocrText && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{t("preview.ocrText")}</p>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                    {doc.ocrText}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-4 sm:flex-row sm:justify-end">
          <button
            className="min-h-11 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/25"
            onClick={onClose}
            type="button"
          >
            {t("action.close")}
          </button>
          {doc && doc.fileUrl && (
            <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/25"
              >
                {t("action.openNewTab")}
              </a>
              <button
                onClick={(e) => downloadFile(e, doc.fileUrl, doc.fileName, doc.fileType)}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1b2b6b] dark:bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#162358] dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/30"
                type="button"
              >
                {t("document.download") || t("action.download") || "Download"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
