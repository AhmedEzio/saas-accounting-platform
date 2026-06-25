"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { invoicesApi } from "@/services/invoices";

const paymentMethods = ["cash", "card", "wallet", "bank_transfer"];

function getApiError(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    fallback
  );
}

function toReturnItems(invoice) {
  return (Array.isArray(invoice?.items) ? invoice.items : []).map((item, index) => ({
    id: `${item.description || "item"}-${index}`,
    description: item.description || "",
    quantity: item.quantity ? String(item.quantity) : "1",
    maxQuantity: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice || 0),
  }));
}

export default function ReturnModal({ invoice, open, onClose, t }) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const returnType = useMemo(() => {
    if (invoice?.invoiceType === "sale") return "sales_return";
    if (invoice?.invoiceType === "purchase") return "purchase_return";
    return "";
  }, [invoice?.invoiceType]);

  useEffect(() => {
    if (!open || !invoice) return;
    setItems(toReturnItems(invoice));
    setPaymentMethod(invoice.paymentMethod || "cash");
    setNotes("");
    setError("");
  }, [invoice, open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open, saving]);

  if (!open || !invoice) return null;

  const updateQuantity = (index, value) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: value } : item
      )
    );
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!returnType) {
      setError(t("return.cannotReturn"));
      return;
    }

    if (!items.length) {
      setError(t("return.noItems"));
      return;
    }

    const payloadItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);

      if (!Number.isFinite(quantity) || quantity < 1) {
        setError(t("error.quantityMin"));
        return;
      }

      if (item.maxQuantity > 0 && quantity > item.maxQuantity) {
        setError(t("return.quantityTooHigh"));
        return;
      }

      payloadItems.push({
        description: item.description,
        quantity,
        unitPrice: item.unitPrice,
      });
    }

    const trimmedNotes = notes.trim();

    if (trimmedNotes.length > 500) {
      setError(t("error.max500"));
      return;
    }

    setSaving(true);
    setError("");

    try {
      await invoicesApi.create({
        invoiceType: returnType,
        clientId: invoice.clientId?._id || invoice.clientId,
        relatedInvoiceId: invoice._id,
        paymentMethod,
        taxPercentage: Number(invoice.taxPercentage || 0),
        amountPaid: 0,
        items: payloadItems,
        notes: trimmedNotes || null,
      });
      router.push("/invoices");
    } catch (err) {
      setError(getApiError(err, t("error.submitFailed")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <form
        aria-labelledby="return-modal-title"
        className="flex max-h-[calc(100dvh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
      >
        <div className="overflow-y-auto p-6">
          <h2 id="return-modal-title" className="text-xl font-semibold text-slate-950">
            {t("return.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{t("return.itemsHint")}</p>

          <div className="mt-5 grid gap-5">
            <div>
              <p className="text-sm font-semibold text-slate-800">{t("return.typeLabel")}</p>
              <div className="mt-2 rounded-lg border border-[#001540] bg-[#dae2ff] px-4 py-3 text-sm font-semibold text-[#001540]">
                {returnType === "sales_return" ? t("return.salesReturn") : t("return.purchaseReturn")}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800" htmlFor="return-payment-method">
                {t("payment.method")}
              </label>
              <select
                className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-[#001540] focus:ring-2 focus:ring-[#001540]/20"
                disabled={saving}
                id="return-payment-method"
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

            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="grid grid-cols-[minmax(0,1fr)_120px_130px] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                <span>{t("form.description")}</span>
                <span>{t("form.qty")}</span>
                <span>{t("form.unitPrice")}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <div
                    className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_120px_130px] sm:items-center"
                    key={item.id}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.description}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {t("return.maxQuantity")}: {item.maxQuantity}
                      </p>
                    </div>
                    <div>
                      <label className="sr-only" htmlFor={`return-quantity-${index}`}>
                        {t("form.qty")}
                      </label>
                      <input
                        className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-[#001540] focus:ring-2 focus:ring-[#001540]/20"
                        disabled={saving}
                        id={`return-quantity-${index}`}
                        min="1"
                        onChange={(event) => updateQuantity(index, event.target.value)}
                        step="1"
                        type="number"
                        value={item.quantity}
                      />
                    </div>
                    <p className="font-mono text-sm text-slate-700">${item.unitPrice.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800" htmlFor="return-notes">
                {t("payment.notes")}
              </label>
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-[#001540] focus:ring-2 focus:ring-[#001540]/20"
                disabled={saving}
                id="return-notes"
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
            {saving ? t("return.submitting") : t("action.return")}
          </button>
        </div>
      </form>
    </div>
  );
}
