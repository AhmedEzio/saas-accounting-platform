"use client";

import { useEffect, useMemo, useState } from "react";
import { invoicesApi } from "@/services/invoices";

function extractInvoices(response) {
  if (Array.isArray(response?.invoices)) return response.invoices;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}

export default function InvoiceSearch({
  error,
  label,
  onSelect,
  selectedInvoiceId,
  t,
}) {
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    const timeout = setTimeout(async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await invoicesApi.getAll({
          limit: 20,
          ...(search.trim() ? { search: search.trim() } : {}),
        });

        if (active) setInvoices(extractInvoices(response));
      } catch (err) {
        if (active) {
          setInvoices([]);
          setLoadError(err?.response?.data?.message || t("state.networkError"));
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [search, t]);

  const helper = useMemo(() => {
    if (loading) return t("state.loading") || "Loading...";
    if (loadError) return loadError;
    return t("upload.searchInvoiceHint");
  }, [loadError, loading, t]);

  return (
    <div className="space-y-2">
      <label
        className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
        htmlFor="invoice-search"
      >
        {label}
      </label>
      <input
        aria-describedby="invoice-search-help"
        className={`min-h-11 w-full rounded-lg border bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-950 dark:text-white placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/20 dark:focus:ring-blue-500/20 ${
          error ? "border-rose-400 dark:border-rose-500 focus:border-rose-400" : "border-slate-300 dark:border-slate-600 focus:border-[#1b2b6b] dark:focus:border-blue-500"
        }`}
        id="invoice-search"
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t("upload.searchInvoice")}
        type="search"
        value={search}
      />
      <p
        className={`text-xs ${error || loadError ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"}`}
        id="invoice-search-help"
      >
        {error || helper}
      </p>

      <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        {invoices.map((inv) => (
          <button
            className={`flex min-h-12 w-full items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/50 px-3 py-2 text-start transition last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1b2b6b]/20 dark:focus:ring-blue-500/20 ${
              selectedInvoiceId === inv._id ? "bg-slate-50 dark:bg-slate-700/80" : ""
            }`}
            key={inv._id}
            onClick={() => onSelect(inv._id)}
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
              <span className="text-sm font-semibold text-[#1b2b6b] dark:text-blue-400">
                {t("form.selected") || "Selected"}
              </span>
            ) : null}
          </button>
        ))}
        {!loading && invoices.length === 0 ? (
          <div className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
            {t("state.emptyFiltered") || "No invoices found"}
          </div>
        ) : null}
      </div>
    </div>
  );
}
