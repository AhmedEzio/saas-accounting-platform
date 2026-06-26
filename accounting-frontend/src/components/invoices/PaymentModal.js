"use client";

import { useEffect, useState } from "react";
import { paymentsApi } from "@/services/invoices";

const paymentMethods = ["cash", "card", "wallet", "bank_transfer"];

function getApiError(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    fallback
  );
}

export default function PaymentModal({ invoice, open, onClose, onSuccess, t }) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const dueAmount = Number(invoice?.dueAmount || 0);

  useEffect(() => {
    if (!open || !invoice) return;
    let active = true;

    queueMicrotask(() => {
      if (!active) return;
      setAmount(dueAmount > 0 ? String(dueAmount) : "");
      setPaymentMethod(invoice.paymentMethod || "cash");
      setNotes("");
      setError("");
    });

    return () => {
      active = false;
    };
  }, [dueAmount, invoice, open]);

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
    const parsedAmount = Number(amount);
    const trimmedNotes = notes.trim();

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError(t("error.amountPositive"));
      return;
    }

    if (parsedAmount > dueAmount) {
      setError(t("payment.amountTooHigh"));
      return;
    }

    if (trimmedNotes.length > 500) {
      setError(t("error.max500"));
      return;
    }

    setSaving(true);
    setError("");

    try {
      await paymentsApi.create({
        invoiceId: invoice._id,
        amount: parsedAmount,
        paymentMethod,
        notes: trimmedNotes || null,
      });
      await onSuccess?.();
      onClose();
    } catch (err) {
      setError(getApiError(err, t("payment.submitFailed")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <form
        aria-labelledby="payment-modal-title"
        className="flex max-h-[calc(100dvh-3rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
      >
        <div className="overflow-y-auto p-6">
          <h2 id="payment-modal-title" className="text-xl font-semibold text-slate-950">
            {t("payment.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {invoice.invoiceNumber} - {t("col.dueAmount")}: ${dueAmount.toFixed(2)}
          </p>

          <div className="mt-5 grid gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800" htmlFor="payment-amount">
                {t("payment.amount")}
              </label>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-[#001540] focus:ring-2 focus:ring-[#001540]/20"
                disabled={saving}
                id="payment-amount"
                min="0.01"
                onChange={(event) => setAmount(event.target.value)}
                step="0.01"
                type="number"
                value={amount}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800" htmlFor="payment-method">
                {t("payment.method")}
              </label>
              <select
                className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-[#001540] focus:ring-2 focus:ring-[#001540]/20"
                disabled={saving}
                id="payment-method"
                onChange={(event) => setPaymentMethod(event.target.value)}
                value={paymentMethod}
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {t(`method.${method}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800" htmlFor="payment-notes">
                {t("payment.notes")}
              </label>
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-[#001540] focus:ring-2 focus:ring-[#001540]/20"
                disabled={saving}
                id="payment-notes"
                maxLength={500}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                value={notes}
              />
            </div>

            {error ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
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
            {t("action.cancel")}
          </button>
          <button
            className="min-h-11 rounded-lg bg-[#001540] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f2a5f] focus:outline-none focus:ring-2 focus:ring-[#001540]/30 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? t("payment.submitting") : t("action.addPayment")}
          </button>
        </div>
      </form>
    </div>
  );
}
