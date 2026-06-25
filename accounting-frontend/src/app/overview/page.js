"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useLang } from "@/context/LanguageContext";

// ── Icons (page-local — only what the overview content needs) ─────────────────

const Icon = {
  trendUp: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  trendDown: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
  download: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  sparkle: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
      <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z" />
    </svg>
  ),
  warning: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  star: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  more: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n == null
    ? "—"
    : "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });

// ── Chart ─────────────────────────────────────────────────────────────────────

function LineChart({ salesData = [], purchasesData = [], labels = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !labels.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const allVals = [...salesData, ...purchasesData].filter((v) => v != null);
    const maxV = allVals.length ? Math.max(...allVals) * 1.2 : 1;

    const padL = 50,
      padR = 20,
      padT = 16,
      padB = 32;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    const xPos = (i) => padL + (i / (labels.length - 1)) * chartW;
    const yPos = (v) => padT + chartH - (v / maxV) * chartH;

    // Grid lines + Y labels
    for (let g = 0; g <= 4; g++) {
      const y = padT + (g / 4) * chartH;
      ctx.strokeStyle = "#f0f0f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartW, y);
      ctx.stroke();

      const val = maxV - (g / 4) * maxV;
      ctx.fillStyle = "#aaa";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("$" + Math.round(val / 1000) + "k", padL - 6, y + 3);
    }

    // X labels
    ctx.fillStyle = "#bbb";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    const step = Math.ceil(labels.length / 6);
    for (let i = 0; i < labels.length; i += step) {
      ctx.fillText(labels[i]?.slice(5), xPos(i), padT + chartH + 18);
    }

    // Draw line + fill
    const drawLine = (data, color) => {
      if (!data.length) return;

      // Filled area
      ctx.beginPath();
      data.forEach((v, i) => {
        i === 0
          ? ctx.moveTo(xPos(i), yPos(v ?? 0))
          : ctx.lineTo(xPos(i), yPos(v ?? 0));
      });
      ctx.lineTo(xPos(data.length - 1), padT + chartH);
      ctx.lineTo(xPos(0), padT + chartH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      grad.addColorStop(0, color + "33");
      grad.addColorStop(1, color + "00");
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      data.forEach((v, i) => {
        i === 0
          ? ctx.moveTo(xPos(i), yPos(v ?? 0))
          : ctx.lineTo(xPos(i), yPos(v ?? 0));
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();
    };

    drawLine(purchasesData, "#e87a3d");
    drawLine(salesData, "#1b2b6b");
  }, [salesData, purchasesData, labels]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
      {!labels.length && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
          No data available
        </div>
      )}
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const styles = {
    paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
    overdue: "bg-red-50    text-red-500    border-red-100",
    draft: "bg-gray-100  text-gray-500   border-gray-200",
    pending: "bg-amber-50  text-amber-600  border-amber-100",
    cancelled: "bg-gray-100  text-gray-400   border-gray-200",
  };
  const cls = styles[status?.toLowerCase()] ?? styles.draft;
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${cls}`}
    >
      {status}
    </span>
  );
}

// ── AI Credits Card ───────────────────────────────────────────────────────────

function AiCreditsCard({ subscription, loading }) {
  if (loading)
    return (
      <div className="bg-[#edf8f4] rounded-xl p-4 border border-emerald-100 animate-pulse h-28" />
    );

  if (!subscription?.hasActiveSubscription)
    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center h-28 flex items-center justify-center">
        <p className="text-sm text-gray-400">No active subscription</p>
      </div>
    );

  const pct = subscription.creditLimit
    ? Math.round(
        (subscription.creditsRemaining / subscription.creditLimit) * 100,
      )
    : 0;

  const renewDate = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="bg-[#edf8f4] rounded-xl p-4 border border-emerald-100 h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          AI Credits
        </span>
        <svg
          className="w-4 h-4 text-emerald-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          viewBox="0 0 24 24"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
      <p className="text-3xl font-extrabold text-gray-900">{pct}%</p>
      <div className="mt-2 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {renewDate && (
        <p className="text-[11px] text-gray-400 mt-2">
          Auto-renews {renewDate}
        </p>
      )}
    </div>
  );
}

// ── AI Insights Card ──────────────────────────────────────────────────────────

function AiInsightsCard({ kpis, financials, activities, loading }) {
  if (loading)
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );

  const insights = [];

  if (kpis?.sales?.trendUp && kpis.sales.trend > 0) {
    insights.push({
      type: "positive",
      icon: Icon.trendUp,
      text: (
        <>
          Revenue increased by <strong>{kpis.sales.trend}%</strong> today
          compared to yesterday.
        </>
      ),
    });
  } else if (!kpis?.sales?.trendUp && kpis?.sales?.trend !== 0) {
    insights.push({
      type: "negative",
      icon: Icon.trendDown,
      text: (
        <>
          Revenue decreased by <strong>{Math.abs(kpis.sales.trend)}%</strong>{" "}
          compared to yesterday.
        </>
      ),
    });
  }

  if (financials?.receivables > 0) {
    insights.push({
      type: "warning",
      icon: Icon.warning,
      text: (
        <>
          <strong>${Number(financials.receivables).toLocaleString()}</strong> in
          outstanding receivables need attention.
        </>
      ),
    });
  }

  if (activities?.length) {
    insights.push({
      type: "info",
      icon: Icon.star,
      text: (
        <>
          Latest activity: <strong>{activities[0].title}</strong> —{" "}
          {activities[0].detail}.
        </>
      ),
    });
  }

  if (!insights.length)
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-400 text-center">
        No insights yet. Add invoices or clients to get started.
      </div>
    );

  const colors = {
    positive: "bg-emerald-50 text-emerald-600 border-emerald-100",
    negative: "bg-red-50    text-red-500    border-red-100",
    warning: "bg-amber-50  text-amber-600  border-amber-100",
    info: "bg-blue-50   text-blue-600   border-blue-100",
  };

  return (
    <div className="space-y-2">
      {insights.map((ins, i) => (
        <div
          key={i}
          className={`flex gap-2.5 p-3 rounded-lg border text-sm ${colors[ins.type]}`}
        >
          <span className="shrink-0 mt-0.5">{ins.icon}</span>
          <p>{ins.text}</p>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("This Year");

  const chartDays =
    chartPeriod === "This Year" ? 365 : chartPeriod === "This Month" ? 30 : 7;

  // ── Auth guard ──
  useEffect(() => {
    if (!token) router.push("/login");
  }, [token, router]);

  // ── Fetch ──
  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/dashboard?days=${chartDays}&activityLimit=10`,
        );
        setData(res.data.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token, chartDays]); // re-fetch when period changes

  // ── Derived data ──
  const kpis = data?.kpis;
  const chart = data?.chart;
  const financials = data?.financials;
  const activities = data?.activities ?? [];
  const subscription = data?.subscription;

  const recentInvoices = activities
    .filter((a) => a.type === "invoice_created" || a.type === "cancellation")
    .slice(0, 5)
    .map((a, i) => ({
      id: `INV-${String(i).padStart(3, "0")}`,
      client: a.detail?.replace(/^(customer|supplier|client):\s*/i, "") || "—",
      amount: a.amount,
      status: a.type === "cancellation" ? "cancelled" : "paid",
      date: new Date(a.time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));
  const { lang } = useLang();
  // ── Render ──
  return (
    <div className="min-h-screen bg-[#f4f5f8]">
      <Sidebar active="overview" user={user} />
      <Topbar user={user} />

      <main
        className={` pt-14 min-h-screen  transition-all duration-300 ${
          lang === "ar" ? "mr-64 ml-0" : "ml-64 mr-0"
        }`}
      >
        <div className="px-7 py-6">
          {/* ── Page header ── */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Overview
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Here&apos;s what&apos;s happening with your accounts today.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                {Icon.download} Export
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#1b2b6b] hover:bg-[#162358] text-sm font-semibold text-white transition">
                Create Report
              </button>
            </div>
          </div>

          {/* ── KPI row ── */}
          <div className="grid grid-cols-6 gap-3 mb-5">
            {/* Total Clients */}
            <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Total Clients
                </span>
                <svg
                  className="w-4 h-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              {loading ? (
                <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-extrabold text-gray-900">—</p>
              )}
              <span className="text-xs text-gray-400">vs last month</span>
            </div>

            {/* Total Invoices */}
            <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Total Invoices
                </span>
                <svg
                  className="w-4 h-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              {loading ? (
                <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-extrabold text-gray-900">—</p>
              )}
              <span className="text-xs text-gray-400">vs last month</span>
            </div>

            {/* Outstanding */}
            <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Outstanding
                </span>
                <span className="text-amber-400">{Icon.warning}</span>
              </div>
              {loading ? (
                <div className="h-7 w-24 bg-gray-100 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-extrabold text-gray-900">
                  {fmt(financials?.receivables)}
                </p>
              )}
              {!loading && financials && (
                <div className="flex items-center gap-1 text-xs font-semibold text-red-500">
                  {Icon.trendDown} vs last month
                </div>
              )}
            </div>

            {/* Mo. Revenue */}
            <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Mo. Revenue
                </span>
                <svg
                  className="w-4 h-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  viewBox="0 0 24 24"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              {loading ? (
                <div className="h-7 w-24 bg-gray-100 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-extrabold text-gray-900">
                  {fmt(kpis?.sales?.value)}
                </p>
              )}
              {!loading && kpis?.sales && (
                <div
                  className={`flex items-center gap-1 text-xs font-semibold ${kpis.sales.trendUp ? "text-emerald-500" : "text-red-500"}`}
                >
                  {kpis.sales.trendUp ? Icon.trendUp : Icon.trendDown}
                  {kpis.sales.trendUp ? "+" : ""}
                  {kpis.sales.trend}% vs yesterday
                </div>
              )}
            </div>

            {/* Mo. Expenses */}
            <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Mo. Expenses
                </span>
                <svg
                  className="w-4 h-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  viewBox="0 0 24 24"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              {loading ? (
                <div className="h-7 w-24 bg-gray-100 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-extrabold text-gray-900">
                  {fmt(kpis?.expenses?.value)}
                </p>
              )}
              {!loading && kpis?.expenses && (
                <div
                  className={`flex items-center gap-1 text-xs font-semibold ${kpis.expenses.trendUp ? "text-red-500" : "text-emerald-500"}`}
                >
                  {kpis.expenses.trendUp ? Icon.trendUp : Icon.trendDown}
                  {kpis.expenses.trendUp ? "+" : ""}
                  {kpis.expenses.trend}% vs yesterday
                </div>
              )}
            </div>

            {/* AI Credits */}
            <AiCreditsCard subscription={subscription} loading={loading} />
          </div>

          {/* ── Chart + AI Insights ── */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Monthly Cash Flow
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Inflow vs Outflow for the current year
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <span className="w-3 h-0.5 bg-[#1b2b6b] inline-block rounded" />{" "}
                      Sales
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <span className="w-3 h-0.5 bg-[#e87a3d] inline-block rounded" />{" "}
                      Purchases
                    </span>
                  </div>
                  <select
                    value={chartPeriod}
                    onChange={(e) => setChartPeriod(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white outline-none cursor-pointer"
                  >
                    <option>This Year</option>
                    <option>This Month</option>
                    <option>This Week</option>
                  </select>
                </div>
              </div>
              <div className="h-56">
                {loading ? (
                  <div className="w-full h-full bg-gray-50 rounded-lg animate-pulse" />
                ) : (
                  <LineChart
                    salesData={chart?.salesData ?? []}
                    purchasesData={chart?.purchasesData ?? []}
                    labels={chart?.labels ?? []}
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#1b2b6b]">{Icon.sparkle}</span>
                <h2 className="text-base font-bold text-gray-900">
                  AI Insights
                </h2>
              </div>
              <AiInsightsCard
                kpis={kpis}
                financials={financials}
                activities={activities}
                loading={loading}
              />
            </div>
          </div>

          {/* ── Recent Invoices + Financial summary ── */}
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Recent Invoices
                </h2>
                <button
                  onClick={() => router.push("/invoices")}
                  className="text-xs font-semibold text-[#1b2b6b] hover:underline"
                >
                  View All
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                    <th className="pb-2 text-left">Invoice #</th>
                    <th className="pb-2 text-left">Client</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-center">Status</th>
                    <th className="pb-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <tr key={i}>
                          {Array(5)
                            .fill(0)
                            .map((_, j) => (
                              <td key={j} className="py-3">
                                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                              </td>
                            ))}
                        </tr>
                      ))
                  ) : recentInvoices.length ? (
                    recentInvoices.map((inv, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition">
                        <td className="py-3 font-medium text-gray-700">
                          {inv.id}
                        </td>
                        <td className="py-3 text-gray-600">{inv.client}</td>
                        <td className="py-3 text-right font-semibold text-gray-900">
                          {fmt(inv.amount)}
                        </td>
                        <td className="py-3 text-center">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="py-3 text-right text-gray-400">
                          {inv.date}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-gray-400 text-sm"
                      >
                        No recent invoices.{" "}
                        <button
                          onClick={() => router.push("/invoices/new")}
                          className="text-[#1b2b6b] font-semibold hover:underline"
                        >
                          Create one
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5">
              {/* Financial summary */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-gray-900">
                    Financial Summary
                  </h2>
                  <button className="text-gray-400 hover:text-gray-600 transition">
                    {Icon.more}
                  </button>
                </div>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {[
                      {
                        label: "Cash In",
                        value: financials?.cashIn,
                        color: "bg-emerald-400",
                      },
                      {
                        label: "Cash Out",
                        value: financials?.cashOut,
                        color: "bg-red-400",
                      },
                      {
                        label: "Receivables",
                        value: financials?.receivables,
                        color: "bg-blue-400",
                      },
                      {
                        label: "Payables",
                        value: financials?.payables,
                        color: "bg-amber-400",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${item.color}`}
                          />
                          <span className="text-sm text-gray-600">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {fmt(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Payables */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="text-base font-bold text-gray-900 mb-3">
                  Upcoming Payables
                </h2>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : financials?.payables > 0 ? (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-gray-600">Total Payables</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {fmt(financials.payables)}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No upcoming payables.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
