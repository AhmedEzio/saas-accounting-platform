"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/invoices/EmptyState";
import ErrorState from "@/components/invoices/ErrorState";
import FiltersBar from "@/components/invoices/FiltersBar";
import InvoiceTable from "@/components/invoices/InvoiceTable";
import Pagination from "@/components/invoices/Pagination";
import StatCards from "@/components/invoices/StatCards";
import useLang from "@/components/invoices/useLang";
import { invoicesApi } from "@/services/invoices";

const initialFilters = {
  invoiceType: "",
  paymentStatus: "",
  dateRange: "all",
  includeCancelled: false,
  search: "",
  page: 1,
  limit: 20,
};

function buildParams(filters) {
  const params = {
    page: filters.page,
    limit: filters.limit,
    includeCancelled: filters.includeCancelled ? "true" : "false",
  };

  if (filters.invoiceType) params.invoiceType = filters.invoiceType;
  if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;

  if (filters.dateRange === "last30") {
    const from = new Date();
    from.setDate(from.getDate() - 30);
    params.from = from.toISOString();
  }

  return params;
}

function invoiceMatchesSearch(invoice, search) {
  const term = search.trim().toLowerCase();
  if (!term) return true;

  const values = [
    invoice.invoiceNumber,
    invoice.invoiceType,
    invoice.paymentStatus,
    invoice.clientId?.name,
    invoice.clientId?.phone,
    invoice.expenseName,
    invoice.expenseType,
    invoice.finalAmount,
    invoice.dueAmount,
  ];

  return values.some((value) => String(value ?? "").toLowerCase().includes(term));
}

export default function InvoicesPage() {
  const router = useRouter();
  const { lang, dir, isRtl, setLang, t } = useLang();
  const [filters, setFilters] = useState(initialFilters);
  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const fetchInvoices = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError("");

    try {
      const response = await invoicesApi.getAll(buildParams(filters));
      const payload = response?.data || {};

      setInvoices(Array.isArray(payload.invoices) ? payload.invoices : []);
      setMeta({
        total: Number(payload.total || 0),
        page: Number(payload.page || filters.page),
        limit: Number(payload.limit || filters.limit),
        pages: Math.max(1, Number(payload.pages || 1)),
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Check your connection and try again.");
      setInvoices([]);
      setMeta((current) => ({ ...current, total: 0, pages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (active) fetchInvoices();
    });

    return () => {
      active = false;
    };
  }, [fetchInvoices, reloadKey]);

  const filteredInvoices = useMemo(
    () => invoices.filter((invoice) => invoiceMatchesSearch(invoice, filters.search)),
    [filters.search, invoices]
  );

  const hasActiveFilters =
    Boolean(filters.invoiceType) ||
    Boolean(filters.paymentStatus) ||
    filters.dateRange !== "all" ||
    filters.includeCancelled ||
    Boolean(filters.search.trim());

  const updateFilters = (nextValues) => {
    if (nextValues.lang) {
      setLang(nextValues.lang);
      return;
    }

    setFilters((current) => ({
      ...current,
      ...nextValues,
      page: nextValues.page || current.page,
    }));
  };

  const clearFilters = () => setFilters(initialFilters);
  const retry = () => setReloadKey((key) => key + 1);

  const displayTotal = filters.search.trim() ? filteredInvoices.length : meta.total;
  const displayPages = filters.search.trim() ? 1 : meta.pages;
  const displayPage = filters.search.trim() ? 1 : meta.page;

  return (
    <main className="min-h-dvh bg-[#faf8fe] px-4 py-6 text-slate-950 sm:px-6 lg:px-8" dir={dir}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">{t("page.invoices")}</h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {t("page.invoicesSubtitle")}
            </p>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#001540] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#0f2a5f] focus:outline-none focus:ring-2 focus:ring-[#001540]/30 sm:w-auto"
              href="/invoices/new"
            >
              {t("action.newInvoice")}
            </Link>
          </div>
        </header>

        <StatCards invoices={filteredInvoices} t={t} total={displayTotal} />

        <section className="flex min-h-[500px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <FiltersBar
            filters={filters}
            isRtl={isRtl}
            lang={lang}
            onChange={updateFilters}
            onClear={clearFilters}
            t={t}
          />

          {error ? (
            <ErrorState
              hint={error || t("state.networkError")}
              onRetry={retry}
              retryLabel={t("action.retry")}
              title={t("state.error")}
            />
          ) : null}

          {!error ? (
            <>
              <InvoiceTable
                invoices={filteredInvoices}
                isRtl={isRtl}
                lang={lang}
                loading={loading}
                t={t}
              />

              {!loading && filteredInvoices.length === 0 ? (
                <EmptyState
                  actionLabel={hasActiveFilters ? t("action.clearFilters") : t("action.createFirst")}
                  hint={
                    hasActiveFilters ? t("state.emptyFilteredHint") : t("state.emptyHint")
                  }
                  onAction={
                    hasActiveFilters
                      ? clearFilters
                      : () => router.push("/invoices/new")
                  }
                  title={hasActiveFilters ? t("state.emptyFiltered") : t("state.empty")}
                />
              ) : null}

              <Pagination
                isRtl={isRtl}
                limit={meta.limit}
                onPageChange={(page) => updateFilters({ page })}
                page={displayPage}
                pages={displayPages}
                t={t}
                total={displayTotal}
              />
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
