import { useState, useEffect } from "react";
import { documentsApi } from "@/services/documents";
import InvoiceSearch from "./InvoiceSearch";

function getApiError(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    fallback
  );
}

export default function DocumentUploadModal({ open, onClose, onSuccess, t }) {
  const [file, setFile] = useState(null);
  const [invoiceId, setInvoiceId] = useState("");
  const [notes, setNotes] = useState("");
  
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset state on open
  useEffect(() => {
    if (!open) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setFile(null);
      setInvoiceId("");
      setNotes("");
      setError("");
    });
    return () => { active = false; };
  }, [open]);

  // Escape key listener
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open, saving]);

  if (!open) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError(t("error.required")); // Generic required error
      return;
    }
    if (!invoiceId) {
      setError(t("error.required"));
      return;
    }

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("invoiceId", invoiceId);
      if (notes) formData.append("notes", notes.trim());

      await documentsApi.upload(formData);
      await onSuccess?.();
      onClose();
    } catch (err) {
      setError(getApiError(err, t("toast.uploadError")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <form
        aria-labelledby="upload-doc-title"
        className="flex max-h-[calc(100dvh-3rem)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
      >
        <div className="overflow-y-auto p-6">
          <h2 id="upload-doc-title" className="text-xl font-semibold text-slate-950 dark:text-white mb-4">
            {t("upload.title")}
          </h2>

          <div className="space-y-4">
            {/* File Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                {t("action.upload")} *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={saving}
                className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#e8ebf7] file:text-[#1b2b6b] hover:file:bg-[#d8def2] dark:file:bg-blue-900/30 dark:file:text-blue-400 dark:hover:file:bg-blue-900/50"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("upload.supported")}</p>
            </div>

            {/* Invoice Search */}
            <InvoiceSearch
              label={`${t("col.invoiceRef")} *`}
              onSelect={setInvoiceId}
              selectedInvoiceId={invoiceId}
              t={t}
            />

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2" htmlFor="doc-notes">
                {t("upload.notes")}
              </label>
              <textarea
                id="doc-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={saving}
                maxLength={500}
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-950 dark:text-white outline-none transition focus:border-[#1b2b6b] focus:ring-2 focus:ring-[#1b2b6b]/20 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
              />
            </div>

            {error ? (
              <p className="rounded-lg bg-rose-50 dark:bg-rose-900/30 px-3 py-2 text-sm text-rose-700 dark:text-rose-400" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-4 sm:flex-row sm:justify-end">
          <button
            className="min-h-11 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/25 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            onClick={onClose}
            type="button"
          >
            {t("action.cancel")}
          </button>
          <button
            className="min-h-11 rounded-lg bg-[#1b2b6b] dark:bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#162358] dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/30 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? t("upload.submitting") : t("action.upload")}
          </button>
        </div>
      </form>
    </div>
  );
}
