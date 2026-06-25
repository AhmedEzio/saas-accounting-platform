"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ErrorState from "@/components/invoices/ErrorState";
import InvoiceHeader from "@/components/invoices/InvoiceHeader";
import InvoiceItemsTable from "@/components/invoices/InvoiceItemsTable";
import InvoiceSummary from "@/components/invoices/InvoiceSummary";
import PaymentTimeline from "@/components/invoices/PaymentTimeline";
import SkeletonRow from "@/components/invoices/SkeletonRow";
import useLang from "@/components/invoices/useLang";
import { invoicesApi, paymentsApi } from "@/services/invoices";

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
          const payload = paymentsResult.response?.data || {};
          setPayments(Array.isArray(payload.payments) ? payload.payments : []);
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
          </>
        ) : null}
      </div>
    </main>
  );
}
