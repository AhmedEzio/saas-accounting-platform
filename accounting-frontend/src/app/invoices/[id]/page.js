"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CancelModal from "@/components/invoices/CancelModal";
import ErrorState from "@/components/invoices/ErrorState";
import InvoiceHeader from "@/components/invoices/InvoiceHeader";
import InvoiceItemsTable from "@/components/invoices/InvoiceItemsTable";
import InvoiceSummary from "@/components/invoices/InvoiceSummary";
import PaymentModal from "@/components/invoices/PaymentModal";
import PaymentTimeline from "@/components/invoices/PaymentTimeline";
import ReturnModal from "@/components/invoices/ReturnModal";
import SkeletonRow from "@/components/invoices/SkeletonRow";
import useLang from "@/components/invoices/useLang";
import { invoicesApi, paymentsApi } from "@/services/invoices";

const returnTypes = ["sales_return", "purchase_return"];

function getApiError(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    fallback
  );
}

function extractPayments(response) {
  const payload = response?.data || {};
  return Array.isArray(payload.payments) ? payload.payments : [];
}

function DetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-8 w-52 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded bg-slate-200" />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonRow key={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function InvoiceDetailsPage() {
  const params = useParams();
  const invoiceId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";
  const { dir, isRtl, lang, t } = useLang();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [activeModal, setActiveModal] = useState("");

  const refreshDetails = async () => {
    if (!invoiceId) return;

    setError("");
    setPaymentError("");

    try {
      const [invoiceResponse, paymentsResult] = await Promise.all([
        invoicesApi.getById(invoiceId),
        paymentsApi
          .getAll({ invoiceId, limit: 50 })
          .then((response) => ({ ok: true, response }))
          .catch(() => ({ ok: false })),
      ]);

      setInvoice(invoiceResponse?.data || null);

      if (paymentsResult.ok) {
        setPayments(extractPayments(paymentsResult.response));
      } else {
        setPayments([]);
        setPaymentError("Payment history is unavailable right now.");
      }
    } catch (err) {
      setInvoice(null);
      setPayments([]);
      setError(getApiError(err, "Invoice not found."));
    }
  };

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      if (!invoiceId) {
        setLoading(false);
        setError("Invoice not found.");
        return;
      }

      setLoading(true);
      setError("");
      setPaymentError("");

      try {
        const [invoiceResponse, paymentsResult] = await Promise.all([
          invoicesApi.getById(invoiceId),
          paymentsApi
            .getAll({ invoiceId, limit: 50 })
            .then((response) => ({ ok: true, response }))
            .catch(() => ({ ok: false })),
        ]);

        if (!active) return;

        setInvoice(invoiceResponse?.data || null);

        if (paymentsResult.ok) {
          setPayments(extractPayments(paymentsResult.response));
        } else {
          setPayments([]);
          setPaymentError("Payment history is unavailable right now.");
        }
      } catch (err) {
        if (!active) return;
        setInvoice(null);
        setPayments([]);
        setError(err?.response?.data?.message || err?.message || "Invoice not found.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [invoiceId]);

  const canCancel =
    invoice &&
    !invoice.isCancelled &&
    !returnTypes.includes(invoice.invoiceType);
  const canPay = invoice && !invoice.isCancelled && Number(invoice.dueAmount || 0) > 0;
  const canReturn =
    invoice &&
    !invoice.isCancelled &&
    (invoice.invoiceType === "sale" || invoice.invoiceType === "purchase");

  return (
    <main className="min-h-dvh bg-[#faf8fe] px-4 py-6 text-slate-950 sm:px-6 lg:px-8" dir={dir}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        {loading ? <DetailsSkeleton /> : null}

        {!loading && error ? (
          <ErrorState
            hint={error}
            onRetry={() => window.location.reload()}
            retryLabel={t("action.retry")}
            title={t("state.notFound")}
          />
        ) : null}

        {!loading && !error && invoice ? (
          <>
            <InvoiceHeader invoice={invoice} lang={lang} t={t} />
            {(canPay || canReturn || canCancel) ? (
              <section
                aria-label={t("col.actions")}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap"
              >
                {canPay ? (
                  <button
                    className="min-h-11 rounded-lg bg-[#001540] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f2a5f] focus:outline-none focus:ring-2 focus:ring-[#001540]/30"
                    onClick={() => setActiveModal("payment")}
                    type="button"
                  >
                    {t("action.addPayment")}
                  </button>
                ) : null}
                {canReturn ? (
                  <button
                    className="min-h-11 rounded-lg border border-[#001540] bg-white px-4 text-sm font-semibold text-[#001540] transition hover:bg-[#dae2ff] focus:outline-none focus:ring-2 focus:ring-[#001540]/25"
                    onClick={() => setActiveModal("return")}
                    type="button"
                  >
                    {t("action.return")}
                  </button>
                ) : null}
                {canCancel ? (
                  <button
                    className="min-h-11 rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-600/25"
                    onClick={() => setActiveModal("cancel")}
                    type="button"
                  >
                    {t("action.cancelInvoice")}
                  </button>
                ) : null}
              </section>
            ) : null}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-6">
                <InvoiceSummary invoice={invoice} lang={lang} t={t} />
                <InvoiceItemsTable invoice={invoice} isRtl={isRtl} t={t} />
              </div>
              <PaymentTimeline
                error={paymentError}
                lang={lang}
                payments={payments}
                t={t}
              />
            </div>
            <CancelModal
              invoice={invoice}
              onClose={() => setActiveModal("")}
              onSuccess={refreshDetails}
              open={activeModal === "cancel"}
              t={t}
            />
            <PaymentModal
              invoice={invoice}
              onClose={() => setActiveModal("")}
              onSuccess={refreshDetails}
              open={activeModal === "payment"}
              t={t}
            />
            <ReturnModal
              invoice={invoice}
              onClose={() => setActiveModal("")}
              open={activeModal === "return"}
              t={t}
            />
          </>
        ) : null}
      </div>
    </main>
  );
}
