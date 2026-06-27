"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { overviewApi } from "@/services/overview";
import { OverviewIcons } from "@/components/overview/OverviewIcons";
import OverviewShell from "@/components/overview/OverviewShell";
import KpiCard from "@/components/overview/KpiCard";
import CashFlowChart from "@/components/overview/CashFlowChart";
import RecentInvoicesTable from "@/components/overview/RecentInvoicesTable";
import RecentActivity from "@/components/overview/RecentActivity";
import FinancialSummary from "@/components/overview/FinancialSummary";
import AiCreditsCard from "@/components/overview/AiCreditsCard";
import TimeAnalyticsControls from "@/components/overview/TimeAnalyticsControls";
import InsightCards from "@/components/overview/InsightCards";
import TopEntitiesPanel from "@/components/overview/TopEntitiesPanel";
import FinancialHealthPanel from "@/components/overview/FinancialHealthPanel";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "@/components/overview/OverviewStates";
import useOverviewLang from "@/components/overview/useOverviewLang";
import { buildOverviewModel } from "@/components/overview/overviewCalculations";

export default function OverviewPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [lang, setLang] = useState("en");
  const { dir, isRtl, t } = useOverviewLang(lang);
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("last30");
  const [chartPeriod, setChartPeriod] = useState("daily");

  useEffect(() => {
    if (!authLoading && !token) router.push("/login");
  }, [authLoading, router, token]);

  const loadOverview = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const data = await overviewApi.getOverviewData();
      setRawData(data);
    } catch (err) {
      setRawData(null);
      setError(err?.response?.data?.message || t("state.error"));
    } finally {
      setLoading(false);
    }
  }, [t, token]);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (active) loadOverview();
    });

    return () => {
      active = false;
    };
  }, [loadOverview]);

  const model = useMemo(
    () => buildOverviewModel(rawData ?? {}, { dateRange, chartPeriod, lang }),
    [chartPeriod, dateRange, lang, rawData],
  );

  const currency = useCallback(
    (value) =>
      new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(Number(value ?? 0)),
    [lang],
  );

  const date = useCallback(
    (value) => {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return "-";
      return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(parsed);
    },
    [lang],
  );

  const percent = useCallback(
    (value) =>
      new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
        maximumFractionDigits: 0,
      }).format(Number(value ?? 0)),
    [lang],
  );

  const numberValue = useCallback(
    (value) => Number(value ?? 0).toLocaleString(lang === "ar" ? "ar-EG" : "en-US"),
    [lang],
  );

  const percentValue = useCallback(
    (value) => `${percent(value)}%`,
    [percent],
  );

  const trend = useCallback(
    (value) => {
      if (!value || !value.available) {
        return {
          direction: "neutral",
          text: t("trend.neutral"),
          ariaLabel: t("trend.neutral"),
        };
      }

      const marker = value.direction === "up" ? "↑" : value.direction === "down" ? "↓" : "•";
      const text = value.direction === "neutral" ? `0%` : `${marker} ${percent(value.percent)}%`;
      return {
        direction: value.direction,
        text,
        ariaLabel: `${text} ${t("trend.vsPrevious")}`,
      };
    },
    [percent, t],
  );

  const kpis = [
    {
      label: t("kpi.totalClients"),
      value: model.metrics.totalClients.toLocaleString(lang === "ar" ? "ar-EG" : "en-US"),
      hint: t("kpi.fromRealData"),
      icon: OverviewIcons.users,
    },
    {
      label: t("kpi.totalInvoices"),
      value: model.metrics.totalInvoices.toLocaleString(lang === "ar" ? "ar-EG" : "en-US"),
      hint: t("kpi.fromRealData"),
      icon: OverviewIcons.invoice,
    },
    {
      label: t("kpi.sales"),
      value: currency(model.metrics.sales),
      hint: t("kpi.fromRealData"),
      icon: OverviewIcons.trend,
      tone: "green",
      trend: trend(model.trends.sales),
    },
    {
      label: t("kpi.purchases"),
      value: currency(model.metrics.purchases),
      hint: t("kpi.fromRealData"),
      icon: OverviewIcons.cash,
      tone: "amber",
      trend: trend(model.trends.purchases),
    },
    {
      label: t("kpi.expenses"),
      value: currency(model.metrics.expenses),
      hint: t("kpi.fromRealData"),
      icon: OverviewIcons.cash,
      tone: "red",
      trend: trend(model.trends.expenses),
    },
    {
      label: t("kpi.profit"),
      value: currency(model.metrics.profit),
      hint: t("kpi.fromRealData"),
      icon: OverviewIcons.trend,
      tone: model.metrics.profit < 0 ? "red" : "green",
      trend: trend(model.trends.profit),
    },
    {
      label: t("kpi.outstanding"),
      value: currency(model.metrics.receivables),
      hint: t("kpi.fromRealData"),
      icon: OverviewIcons.warning,
      tone: "amber",
    },
    {
      label: t("kpi.cashIn"),
      value: currency(model.metrics.cashIn),
      hint: t("kpi.selectedPeriod"),
      icon: OverviewIcons.cash,
      tone: "green",
    },
    {
      label: t("kpi.cashOut"),
      value: currency(model.metrics.cashOut),
      hint: t("kpi.selectedPeriod"),
      icon: OverviewIcons.cash,
      tone: "red",
    },
  ];

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredInvoices = useMemo(() => {
    return model.allRecentInvoices.filter((invoice) => {
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;

      const haystack = [
        invoice.invoiceNumber,
        invoice.clientName,
        invoice.invoiceType,
        t(`type.${invoice.invoiceType}`),
        invoice.status,
        t(`status.${invoice.status}`),
        String(invoice.finalAmount ?? ""),
        currency(invoice.finalAmount),
        String(invoice.dueAmount ?? ""),
        currency(invoice.dueAmount),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [currency, model.allRecentInvoices, normalizedSearch, statusFilter, t]);

  const filteredActivity = useMemo(() => {
    if (!normalizedSearch) return model.recentActivity;

    return model.allRecentActivity
      .filter((item) => {
        const haystack = [
          item.title,
          item.kind,
          t(`activity.${item.kind}`),
          item.invoiceNumber,
          item.clientName,
          item.invoiceType,
          item.status,
          String(item.amount ?? ""),
          currency(item.amount),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
      .slice(0, 8);
  }, [currency, model.allRecentActivity, model.recentActivity, normalizedSearch, t]);

  return (
    <div dir={dir} lang={lang}>
      <OverviewShell
        user={user}
        router={router}
        lang={lang}
        setLang={setLang}
        isRtl={isRtl}
        t={t}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className={isRtl ? "text-right" : "text-left"}>
              <h1 className="text-2xl font-extrabold text-gray-900">{t("page.title")}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">{t("page.subtitle")}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:hidden">
              <button
                type="button"
                disabled
                className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-400 disabled:cursor-not-allowed"
                aria-label={t("action.exportSoon")}
              >
                {t("action.export")}
                <span className="ms-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold">
                  {t("action.comingSoon")}
                </span>
              </button>
              <button
                type="button"
                disabled
                className="min-h-11 rounded-lg bg-[#1b2b6b] px-3 text-sm font-semibold text-white opacity-55 disabled:cursor-not-allowed"
                aria-label={t("action.reportSoon")}
              >
                {t("action.createReport")}
                <span className="ms-2 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                  {t("action.comingSoon")}
                </span>
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingPanel t={t} />
          ) : error ? (
            <ErrorPanel t={t} onRetry={loadOverview} />
          ) : !model.hasRecords ? (
            <EmptyPanel t={t} />
          ) : (
            <div className="space-y-5">
              <label className="flex min-h-11 items-center gap-2 rounded-lg bg-white px-3 text-gray-400 shadow-sm ring-1 ring-gray-100 focus-within:ring-2 focus-within:ring-[#1b2b6b] sm:hidden">
                <span aria-hidden="true">{OverviewIcons.search}</span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label={t("search.label")}
                  placeholder={t("search.placeholder")}
                  className={`min-w-0 flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none ${
                    isRtl ? "text-right" : "text-left"
                  }`}
                />
              </label>

              <TimeAnalyticsControls
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                chartPeriod={chartPeriod}
                onChartPeriodChange={setChartPeriod}
                summary={t(`range.summary.${dateRange}`)}
                t={t}
                isRtl={isRtl}
              />

              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {kpis.map((kpi) => (
                  <KpiCard key={kpi.label} {...kpi} loading={loading} />
                ))}
              </section>

              <InsightCards
                insights={model.insights}
                numberValue={numberValue}
                currency={currency}
                percentValue={percentValue}
                t={t}
                isRtl={isRtl}
              />

              <div className="grid gap-5 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <CashFlowChart
                    chartData={model.chartData}
                    currency={currency}
                    t={t}
                    isRtl={isRtl}
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                  <AiCreditsCard subscription={model.subscription} t={t} />
                  <FinancialSummary metrics={model.metrics} currency={currency} t={t} />
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <TopEntitiesPanel
                    entities={model.insights.topEntities}
                    currency={currency}
                    t={t}
                    isRtl={isRtl}
                  />
                </div>
                <FinancialHealthPanel health={model.insights.health} t={t} isRtl={isRtl} />
              </div>

              <RecentInvoicesTable
                invoices={filteredInvoices.slice(0, 6)}
                currency={currency}
                date={date}
                t={t}
                isRtl={isRtl}
                router={router}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                hasAnyInvoices={model.allRecentInvoices.length > 0}
              />

              <RecentActivity
                activities={filteredActivity}
                currency={currency}
                date={date}
                t={t}
                isRtl={isRtl}
              />

              <p className={`text-xs text-gray-400 ${isRtl ? "text-right" : "text-left"}`}>
                {t("summary.records")}: {model.counts.clients} {t("nav.clients")},{" "}
                {model.counts.invoices} {t("nav.invoices")},{" "}
                {model.counts.payments} {t("nav.payments")}
              </p>
            </div>
          )}
        </div>
      </OverviewShell>
    </div>
  );
}
