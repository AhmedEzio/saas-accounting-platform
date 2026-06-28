"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   PaymentTable.js
   Renders the "Payments" tab for a client detail page.
   Props:
     payments – array of PaymentTransaction objects
     loading  – boolean
───────────────────────────────────────────────────────────────────────────── */

/* ── helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtMoney(n) {
  const val = Number(n) || 0;
  const abs = Math.abs(val);
  const int = Math.floor(abs).toLocaleString("en-US");
  const dec = (abs % 1).toFixed(2).slice(1);
  return { int, dec };
}

const SOURCE_META = {
  invoice_creation:    { label: "Invoice Creation",     icon: "📄", bg: "bg-blue-50",    text: "text-blue-600"   },
  manual_payment:      { label: "Manual Payment",       icon: "✦",  bg: "bg-emerald-50", text: "text-emerald-700"},
  cancellation_reversal:{ label: "Cancellation Reversal",icon: "↩", bg: "bg-orange-50",  text: "text-orange-600" },
  refund:              { label: "Refund",               icon: "↲",  bg: "bg-pink-50",    text: "text-pink-600"   },
};

const METHOD_LABELS = {
  cash:          { label: "Cash",          icon: "💵" },
  card:          { label: "Card",          icon: "💳" },
  wallet:        { label: "Wallet",        icon: "👛" },
  bank_transfer: { label: "Bank Transfer", icon: "🏦" },
};

/* ── CSV export ──────────────────────────────────────────────────────────── */
function downloadCSV(payments) {
  const header = "Date,Invoice #,Source,Direction,Amount,Method,Recorded By\n";
  const rows = payments.map((p) => {
    const date = fmtDate(p.createdAt);
    const invNum = p.invoiceId?.invoiceNumber ?? "—";
    const src = SOURCE_META[p.source]?.label ?? p.source;
    const dir = p.direction === "in" ? "Received" : "Paid Out";
    const method = METHOD_LABELS[p.paymentMethod]?.label ?? p.paymentMethod;
    const by = p.paidBy?.name ?? "—";
    return `${date},"${invNum}","${src}","${dir}",${p.amount.toFixed(2)},${method},${by}`;
  });
  const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "payments.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Pagination ─────────────────────────────────────────────────────────── */
function Pagination({ page, totalPages, rangeStart, rangeEnd, total, onPage }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-t-[1.5px] border-gray-100">
      <span className="text-[12px] sm:text-[13px] text-gray-500 order-2 sm:order-1">
        Showing {total === 0 ? 0 : rangeStart} to {rangeEnd} of {total} transaction{total !== 1 ? "s" : ""}
      </span>
      <div className="flex gap-1.5 order-1 sm:order-2">
        <button
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="px-4 py-1.5 border-[1.5px] border-gray-200 rounded-[9px] bg-white text-[13px] font-semibold text-gray-700 cursor-pointer transition-colors hover:border-[#1b2b6b] hover:text-[#1b2b6b] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="px-4 py-1.5 border-[1.5px] border-gray-200 rounded-[9px] bg-white text-[13px] font-semibold text-gray-700 cursor-pointer transition-colors hover:border-[#1b2b6b] hover:text-[#1b2b6b] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ── Summary cards ───────────────────────────────────────────────────────── */
function SummaryBar({ payments }) {
  const received = payments
    .filter((p) => p.direction === "in")
    .reduce((s, p) => s + (p.amount ?? 0), 0);

  const paidOut = payments
    .filter((p) => p.direction === "out")
    .reduce((s, p) => s + (p.amount ?? 0), 0);

  const { int: rInt, dec: rDec } = fmtMoney(received);
  const { int: oInt, dec: oDec } = fmtMoney(paidOut);

  return (
    <div className="flex gap-3 px-5 py-3 border-b border-gray-50">
      {/* received */}
      <div className="flex items-center gap-2.5 bg-emerald-50 rounded-xl px-4 py-2.5">
        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
          <svg width="13" height="13" fill="none" stroke="#059669" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Received</p>
          <p className="text-[15px] font-extrabold text-emerald-700 leading-none">
            ${rInt}<span className="font-normal text-emerald-400 text-xs">{rDec}</span>
          </p>
        </div>
      </div>

      {/* paid out */}
      <div className="flex items-center gap-2.5 bg-red-50 rounded-xl px-4 py-2.5">
        <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
          <svg width="13" height="13" fill="none" stroke="#ef4444" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">Paid Out</p>
          <p className="text-[15px] font-extrabold text-red-600 leading-none">
            ${oInt}<span className="font-normal text-red-300 text-xs">{oDec}</span>
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center">
        <span className="text-xs text-gray-400 font-medium">
          {payments.length} transaction{payments.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

/* ── Payment row ─────────────────────────────────────────────────────────── */
function PaymentRow({ p }) {
  const isIn  = p.direction === "in";
  const src   = SOURCE_META[p.source] ?? { label: p.source, icon: "·", bg: "bg-gray-100", text: "text-gray-600" };
  const meth  = METHOD_LABELS[p.paymentMethod] ?? { label: p.paymentMethod, icon: "—" };
  const { int, dec } = fmtMoney(p.amount);

  const invRef  = p.invoiceId?.invoiceNumber
    ? `#${p.invoiceId.invoiceNumber}`
    : `#TXN-${String(p._id).slice(-6).toUpperCase()}`;

  const invType = p.invoiceId?.invoiceType ?? null;

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-[#fafbff] transition-colors">

      {/* date + time */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <p className="text-sm text-gray-700">{fmtDate(p.createdAt)}</p>
        <p className="text-[11px] text-gray-400">{fmtTime(p.createdAt)}</p>
      </td>

      {/* invoice ref */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span className="text-[13px] font-bold text-[#1b2b6b] font-mono">{invRef}</span>
        {invType && (
          <p className="text-[10px] text-gray-400 capitalize mt-0.5">{invType.replace("_", " ")}</p>
        )}
      </td>

      {/* source */}
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${src.bg} ${src.text}`}>
          <span>{src.icon}</span>
          {src.label}
        </span>
      </td>

      {/* direction */}
      <td className="px-5 py-3.5">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
            isIn
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          <span>{isIn ? "↑" : "↓"}</span>
          {isIn ? "Received" : "Paid Out"}
        </span>
      </td>

      {/* amount */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span className={`font-bold text-[15px] ${isIn ? "text-emerald-600" : "text-gray-900"}`}>
          {isIn ? "+" : "-"}${int}
          <span className={`font-normal text-sm ${isIn ? "text-emerald-400" : "text-gray-400"}`}>{dec}</span>
        </span>
      </td>

      {/* method */}
      <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
        {meth.icon} {meth.label}
      </td>

      {/* recorded by */}
      <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
        {p.paidBy?.name ?? "—"}
      </td>
    </tr>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
function EmptyPayments() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <svg width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" className="mb-3 opacity-30">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
      <p className="text-sm font-semibold">No payment transactions yet</p>
      <p className="text-xs mt-1">Payments recorded against this client's invoices will appear here.</p>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────────────── */
export default function PaymentTable({
  payments = [],
  loading = false,
  page,
  totalPages,
  total,
  rangeStart,
  rangeEnd,
  onPage,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
        <svg className="animate-spin w-5 h-5 text-[#1b2b6b]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-sm font-medium">Loading payments…</span>
      </div>
    );
  }

  if (!payments.length) return <EmptyPayments />;

  const COLS = ["Date", "Invoice Ref", "Source", "Direction", "Amount", "Method", "Recorded By"];

  return (
    <>
      <SummaryBar payments={payments} />

      {/* export btn */}
      <div className="px-5 py-2.5 border-b border-gray-50 flex justify-end">
        <button
          title="Export CSV"
          onClick={() => downloadCSV(payments)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b-[1.5px] border-gray-100">
              {COLS.map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-bold uppercase tracking-[.06em] text-gray-400 px-5 py-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <PaymentRow key={p._id} p={p} />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        total={total}
        onPage={onPage}
      />
    </>
  );
}
