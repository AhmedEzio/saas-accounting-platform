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
import FinancialSummary from "@/components/overview/FinancialSummary";
import AiCreditsCard from "@/components/overview/AiCreditsCard";
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
    () => buildOverviewModel(rawData ?? {}),
    [rawData],
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
    },
    {
      label: t("kpi.purchases"),
      value: currency(model.metrics.purchases),
      hint: t("kpi.fromRealData"),
      icon: OverviewIcons.cash,
      tone: "amber",
    },
    {
      label: t("kpi.expenses"),
      value: currency(model.metrics.expenses),
      hint: t("kpi.fromRealData"),
      icon: OverviewIcons.cash,
      tone: "red",
    },
    {
      label: t("kpi.profit"),
      value: currency(model.metrics.profit),
      hint: t("kpi.fromRealData"),
      icon: OverviewIcons.trend,
      tone: model.metrics.profit < 0 ? "red" : "green",
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
      hint: t("kpi.monthToDate"),
      icon: OverviewIcons.cash,
      tone: "green",
    },
    {
      label: t("kpi.cashOut"),
      value: currency(model.metrics.cashOut),
      hint: t("kpi.monthToDate"),
      icon: OverviewIcons.cash,
      tone: "red",
    },
  ];

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
                aria-label={`${t("action.export")} - ${t("action.comingSoon")}`}
              >
                {t("action.export")}
              </button>
              <button
                type="button"
                disabled
                className="min-h-11 rounded-lg bg-[#1b2b6b] px-3 text-sm font-semibold text-white opacity-55 disabled:cursor-not-allowed"
                aria-label={`${t("action.createReport")} - ${t("action.comingSoon")}`}
              >
                {t("action.createReport")}
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
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {kpis.map((kpi) => (
                  <KpiCard key={kpi.label} {...kpi} loading={loading} />
                ))}
              </section>

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

              <RecentInvoicesTable
                invoices={model.recentInvoices}
                currency={currency}
                date={date}
                t={t}
                isRtl={isRtl}
                router={router}
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
