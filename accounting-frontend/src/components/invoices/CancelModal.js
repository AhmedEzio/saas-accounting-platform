"use client";

import { useEffect, useState } from "react";
import { invoicesApi } from "@/services/invoices";

function getApiError(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    fallback
  );
}

export default function CancelModal({ invoice, open, onClose, onSuccess, t }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;

    queueMicrotask(() => {
      if (!active) return;
      setReason("");
      setError("");
    });

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open, saving]);

  if (!open || !invoice) return null;

  const submit = async (event) => {
    event.preventDefault();
    const trimmedReason = reason.trim();

    if (trimmedReason.length < 3 || trimmedReason.length > 500) {
      setError(t("cancel.reasonHint"));
      return;
    }

    setSaving(true);
    setError("");

    try {
      await invoicesApi.cancel(invoice._id, trimmedReason);
      await onSuccess?.();
      onClose();
    } catch (err) {
      setError(getApiError(err, t("error.submitFailed")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <form
        aria-labelledby="cancel-invoice-title"
        className="flex max-h-[calc(100dvh-3rem)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
      >
        <div className="overflow-y-auto p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-xl font-semibold text-rose-700">
            !
          </div>
          <h2 id="cancel-invoice-title" className="text-xl font-semibold text-slate-950">
            {t("cancel.title")} {invoice.invoiceNumber}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t("cancel.warning")}</p>

          <div className="mt-5 text-start">
            <label className="block text-sm font-semibold text-slate-800" htmlFor="cancel-reason">
              {t("cancel.reasonLabel")}
            </label>
            <textarea
              className="mt-2 min-h-28 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-[#001540] focus:ring-2 focus:ring-[#001540]/20"
              disabled={saving}
              id="cancel-reason"
              maxLength={500}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t("cancel.reasonPlaceholder")}
              rows={4}
              value={reason}
            />
            <p className="mt-1 text-xs text-slate-500">{t("cancel.reasonHint")}</p>
            {error ? (
              <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:justify-end">
          <button
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#001540]/25 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            onClick={onClose}
            type="button"
          >
            {t("action.keepInvoice")}
          </button>
          <button
            className="min-h-11 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-600/30 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? t("cancel.submitting") : t("action.cancelInvoice")}
          </button>
        </div>
      </form>
    </div>
  );
}
