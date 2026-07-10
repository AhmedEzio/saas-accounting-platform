"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { invoicesApi } from "@/services/invoices";

function extractInvoices(response) {
  if (Array.isArray(response?.data?.invoices)) {
    return response.data.invoices;
  }

  if (Array.isArray(response?.results?.data)) {
    return response.results.data;
  }

  if (Array.isArray(response?.invoices)) {
    return response.invoices;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
}

export default function InvoiceSearch({
  error,
  label,
  onSelect,
  selectedInvoiceId,
  t,
}) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedInvoice = useMemo(() => {
    return invoices.find((inv) => inv._id === selectedInvoiceId) || null;
  }, [invoices, selectedInvoiceId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    
    const fetchInvoices = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await invoicesApi.getAll({ limit: 100 });
        if (active) {
          setInvoices(extractInvoices(response));
        }
      } catch (err) {
        if (active) {
          setInvoices([]);
          setLoadError(err?.response?.data?.message || t("state.networkError"));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchInvoices();

    return () => {
      active = false;
    };
  }, [t]);

  const helper = useMemo(() => {
    if (loading) return t("state.loading") || "Loading...";
    if (loadError) return loadError;
    return t("upload.searchInvoiceHint");
  }, [loadError, loading, t]);

  return (
    <div ref={wrapperRef} className="space-y-2 relative">
      <label
        className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
        htmlFor="invoice-search-trigger"
      >
        {label}
      </label>
      <button
        id="invoice-search-trigger"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex min-h-11 w-full items-center justify-between rounded-lg border bg-white dark:bg-slate-700 px-3 py-2 text-start text-sm transition focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/20 dark:focus:ring-blue-500/20 ${
          error ? "border-rose-400 dark:border-rose-500" : "border-slate-300 dark:border-slate-600"
        } ${selectedInvoice ? "text-slate-950 dark:text-white" : "text-slate-400"}`}
      >
        <span className="truncate">
          {selectedInvoice ? selectedInvoice.invoiceNumber : t("upload.searchInvoice")}
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <p
        className={`text-xs ${error || loadError ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"}`}
        id="invoice-search-help"
      >
        {error || helper}
      </p>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 flex flex-col rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
          <div className="max-h-48 overflow-y-auto py-1">
            {invoices.map((inv) => (
              <button
                className={`flex min-h-12 w-full items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/50 px-3 py-2 text-start transition last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-700/50 ${
                  selectedInvoiceId === inv._id ? "bg-slate-50 dark:bg-slate-700/80" : ""
                }`}
                key={inv._id}
                onClick={() => {
                  onSelect(inv._id);
                  setIsOpen(false);
                }}
                type="button"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#e8ebf7] dark:bg-blue-900/30 text-xs font-bold text-[#1b2b6b] dark:text-blue-400">
                    #
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-950 dark:text-white">
                      {inv.invoiceNumber}
                    </span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                      {inv.invoiceType} - {inv.clientId?.name || "-"}
                    </span>
                  </span>
                </span>
                {selectedInvoiceId === inv._id ? (
                  <span className="text-sm font-semibold text-[#1b2b6b] dark:text-blue-400 shrink-0">
                    {t("form.selected") || "Selected"}
                  </span>
                ) : null}
              </button>
            ))}
            {!loading && invoices.length === 0 ? (
              <div className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                {t("state.emptyFiltered") || "No invoices found"}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
