"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { subscriptionApi } from "@/services/api";
import { t as translate } from "@/locales/subscriptions";

const numberFormat = (lang) => new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US");
const currencyFormat = (lang) =>
  new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const normalizePlans = (response) => {
  const payload = response?.data;
  return Array.isArray(payload) ? payload : [];
};

const getPlanId = (plan) => String(plan?._id || plan?.id || "");

const CheckIcon = ({ muted = false }) => (
  <svg
    className={`mt-0.5 h-5 w-5 shrink-0 ${muted ? "text-slate-300" : "text-[#1fc99e]"}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

function SkeletonState() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
        <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
        <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry, t }) {
  return (
    <section className="mx-auto flex min-h-[420px] max-w-3xl flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-[#001540]">{t("state.error")}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {error || t("state.errorHint")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1b2b6b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#162358] focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/30"
      >
        {t("action.retry")}
      </button>
    </section>
  );
}

function UsageBar({ used, limit }) {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#3755c3] to-[#1fc99e] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-slate-500">{percent}%</p>
    </div>
  );
}

function StatusBadge({ status, t }) {
  const normalized = status || "unknown";
  const tone =
    normalized === "active" || normalized === "trialing"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : normalized === "past_due"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${tone}`}>
      {t(`status.${normalized}`)}
    </span>
  );
}

function CurrentSubscription({ subscription, lang, t, onCancel, cancelling }) {
  if (!subscription) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#e8ebf7] text-[#1b2b6b]">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
            <path d="M8 12h8" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-[#001540]">{t("state.noActive")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
          {t("state.noActiveHint")}
        </p>
      </section>
    );
  }

  const used = Number(subscription.creditsUsed || 0);
  const limit = Number(subscription.creditLimit || 0);
  const remaining = Number(subscription.creditsRemaining ?? Math.max(0, limit - used));
  const planName = subscription.plan?.name || "-";
  const renewalDate = formatDate(subscription.renewalDate || subscription.currentPeriodEnd, lang);
  const isScheduled = Boolean(subscription.cancelAtPeriodEnd);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      {isScheduled ? (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center">
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 8v5m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
          </svg>
          <div>
            <p className="font-semibold">{t("state.cancellationScheduled")}</p>
            <p>{t("state.cancellationMessage")} {renewalDate}</p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3755c3]">{t("label.currentPlan")}</p>
            <StatusBadge status={subscription.status} t={t} />
            {isScheduled ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
                {t("state.cancellationScheduled")}
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-[#001540]">{planName}</h2>

          <div className="mt-6 max-w-xl">
            <div className="mb-2 flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-slate-600">{t("label.aiTokens")}</span>
              <span className="font-semibold text-[#001540]">
                {numberFormat(lang).format(used)} / {numberFormat(lang).format(limit)}
              </span>
            </div>
            <UsageBar used={used} limit={limit} />
          </div>

          <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label={t("label.used")} value={numberFormat(lang).format(used)} />
            <Metric label={t("label.remaining")} value={numberFormat(lang).format(remaining)} />
            <Metric label={t("label.monthlyLimit")} value={numberFormat(lang).format(limit)} />
            <Metric label={isScheduled ? t("label.cancellationDate") : t("label.renewalDate")} value={renewalDate} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-56">
          <button
            type="button"
            onClick={onCancel}
            disabled={isScheduled || cancelling}
            className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/30 ${
              isScheduled || cancelling
                ? "cursor-not-allowed bg-slate-100 text-slate-500"
                : "border border-red-200 bg-white text-red-700 hover:bg-red-50"
            }`}
          >
            {isScheduled ? t("action.scheduled") : cancelling ? t("action.cancelling") : t("action.cancel")}
          </button>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function TokenUsageCard({ subscription, lang, t }) {
  const used = Number(subscription?.creditsUsed || 0);
  const limit = Number(subscription?.creditLimit || 0);
  const remaining = Number(subscription?.creditsRemaining ?? Math.max(0, limit - used));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3755c3]">{t("section.usage")}</p>
          <h2 className="mt-2 text-xl font-semibold text-[#001540]">{t("label.aiTokens")}</h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8ebf7] text-[#1b2b6b]">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
          </svg>
        </div>
      </div>
      <div className="mt-6">
        <UsageBar used={used} limit={limit} />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Metric label={t("label.used")} value={numberFormat(lang).format(used)} />
        <Metric label={t("label.remaining")} value={numberFormat(lang).format(remaining)} />
        <Metric label={t("label.monthlyLimit")} value={numberFormat(lang).format(limit)} />
      </div>
    </section>
  );
}

function PlanCard({ plan, currentPlanId, lang, t, onSubscribe, loadingPlanId }) {
  const planId = getPlanId(plan);
  const isCurrent = planId && planId === currentPlanId;
  const features = plan.features || {};
  const featureRows = buildFeatureRows(features, t);
  const price = currencyFormat(lang).format(Number(plan.price || 0));
  const isBusy = loadingPlanId === planId;

  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isCurrent ? "border-[#3755c3] ring-2 ring-[#3755c3]/15" : "border-slate-200"
      }`}
    >
      {isCurrent ? (
        <span className="absolute -top-3 start-5 rounded-full bg-[#3755c3] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {t("plan.currentBadge")}
        </span>
      ) : null}

      <div className="mb-5 pt-2">
        <h3 className="text-xl font-semibold text-[#001540]">{plan.name}</h3>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#001540]">{price}</span>
          <span className="text-sm text-slate-500">{t("plan.priceSuffix")}</span>
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          {numberFormat(lang).format(Number(plan.aiCreditLimit || 0))} {t("plan.tokensIncluded")}
        </p>
      </div>

      <div className="mb-6 flex-1">
        <p className="mb-3 text-sm font-semibold text-slate-900">{t("label.features")}</p>
        <ul className="space-y-3">
          {featureRows.map((row) => (
            <li key={row.label} className={`flex items-start gap-3 text-sm leading-5 ${row.muted ? "text-slate-400" : "text-slate-600"}`}>
              <CheckIcon muted={row.muted} />
              <span>{row.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => onSubscribe(planId)}
        disabled={isCurrent || isBusy || !planId}
        className={`mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/30 ${
          isCurrent
            ? "cursor-not-allowed bg-slate-100 text-slate-500"
            : "border border-[#3755c3] bg-white text-[#3755c3] hover:bg-[#eef2ff]"
        }`}
      >
        {isCurrent ? t("action.current") : isBusy ? t("action.redirecting") : t("action.subscribe")}
      </button>
    </article>
  );
}

function buildFeatureRows(features, t) {
  const rows = [];
  if (features.aiChat) {
    rows.push({ label: t("feature.aiChat") });
    rows.push({ label: t("feature.readOnlyTools") });
  }
  if (features.clientTools) rows.push({ label: t("feature.clientTools") });
  if (features.invoiceTools) rows.push({ label: t("feature.invoiceTools") });
  if (features.paymentTools) rows.push({ label: t("feature.paymentTools") });
  if (features.technicalSupport) rows.push({ label: t("feature.technicalSupport") });
  if (!features.clientTools && !features.invoiceTools && !features.paymentTools) {
    rows.push({ label: t("feature.noWriteTools"), muted: true });
  }
  return rows.length ? rows : [{ label: t("feature.aiChat") }];
}

function formatDate(value, lang) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function SubscriptionsPage() {
  const { lang, setLang, dir } = useLanguage();
  const t = useCallback((key) => translate(key, lang), [lang]);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loadingPlanId, setLoadingPlanId] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    setActionError("");
    try {
      const [plansResponse, currentResponse] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getCurrent(),
      ]);
      setPlans(normalizePlans(plansResponse));
      setSubscription(currentResponse?.data || null);
    } catch (err) {
      setLoadError(err?.response?.data?.message || err?.message || translate("state.errorHint", lang));
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (active) loadData();
    });

    return () => {
      active = false;
    };
  }, [loadData]);

  const currentPlanId = useMemo(() => getPlanId(subscription?.plan), [subscription]);

  const handleSubscribe = async (planId) => {
    if (!planId) return;
    setLoadingPlanId(planId);
    setActionError("");
    try {
      const response = await subscriptionApi.createCheckoutSession(planId);
      const checkoutUrl = response?.checkoutUrl || response?.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      throw new Error("Checkout URL was not returned.");
    } catch (err) {
      setActionError(err?.response?.data?.message || err?.message || translate("state.errorHint", lang));
      setLoadingPlanId("");
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setActionError("");
    try {
      await subscriptionApi.cancel();
      await loadData();
    } catch (err) {
      setActionError(err?.response?.data?.message || err?.message || translate("state.errorHint", lang));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <AppShell activeKey="subscriptions" lang={lang} setLang={setLang}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6" dir={dir}>
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#3755c3]">Finora AI</p>
          <h1 className="font-display text-3xl font-semibold text-[#001540]">{t("page.title")}</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-500">{t("page.subtitle")}</p>
        </header>

        {loading ? (
          <SkeletonState />
        ) : loadError ? (
          <ErrorState error={loadError} onRetry={loadData} t={t} />
        ) : (
          <>
            {actionError ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                {actionError}
              </div>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
              <CurrentSubscription
                cancelling={cancelling}
                lang={lang}
                onCancel={handleCancel}
                subscription={subscription}
                t={t}
              />
              <TokenUsageCard lang={lang} subscription={subscription} t={t} />
            </div>

            <section className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#001540]">{t("section.plans")}</h2>
                <p className="mt-1 text-sm text-slate-500">{t("state.noActiveHint")}</p>
              </div>
              <div className="grid gap-5 lg:grid-cols-3">
                {plans.map((plan) => (
                  <PlanCard
                    currentPlanId={currentPlanId}
                    key={getPlanId(plan)}
                    lang={lang}
                    loadingPlanId={loadingPlanId}
                    onSubscribe={handleSubscribe}
                    plan={plan}
                    t={t}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
