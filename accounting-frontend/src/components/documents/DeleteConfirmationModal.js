import { useEffect, useState } from "react";
import { documentsApi } from "@/services/documents";

function getApiError(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    fallback
  );
}

export default function DeleteConfirmationModal({ documentId, open, onClose, onSuccess, t }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset state on open
  useEffect(() => {
    if (!open) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
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

  if (!open || !documentId) return null;

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await documentsApi.delete(documentId);
      await onSuccess?.();
      onClose();
    } catch (err) {
      setError(getApiError(err, t("toast.deleteError")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <form
        aria-labelledby="delete-doc-title"
        className="flex max-h-[calc(100dvh-3rem)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
      >
        <div className="overflow-y-auto p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50 text-xl font-semibold text-rose-700 dark:text-rose-400">
            !
          </div>
          <h2 id="delete-doc-title" className="text-xl font-semibold text-slate-950 dark:text-white">
            {t("delete.confirmTitle")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {t("delete.confirmMessage")}
          </p>

          {error ? (
            <div className="mt-4 text-start">
              <p className="rounded-lg bg-rose-50 dark:bg-rose-900/30 px-3 py-2 text-sm text-rose-700 dark:text-rose-400" role="alert">
                {error}
              </p>
            </div>
          ) : null}
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
            className="min-h-11 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-600/30 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? t("delete.deleting") : t("action.delete")}
          </button>
        </div>
      </form>
    </div>
  );
}
