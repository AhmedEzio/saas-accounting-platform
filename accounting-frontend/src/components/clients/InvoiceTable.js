"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   InvoiceTable.js
   Renders the "Invoices" tab for a client detail page.
   Props:
     invoices     – array of invoice objects
     loading      – boolean
     onCancel     – async fn(invoiceId, reason) => void  (triggers parent refetch)
───────────────────────────────────────────────────────────────────────────── */

/* ── helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function fmtMoney(n) {
  const val = Number(n) || 0;
  const abs = Math.abs(val);
  const int = Math.floor(abs).toLocaleString("en-US");
  const dec = (abs % 1).toFixed(2).slice(1);
  return { int, dec };
}

const TYPE_META = {
  sale: { label: "Sale", bg: "bg-blue-50", text: "text-blue-600" },
  purchase: { label: "Purchase", bg: "bg-violet-50", text: "text-violet-600" },
  purchase_return: { label: "Purch. Return", bg: "bg-orange-50", text: "text-orange-600" },
  sales_return: { label: "Sales Return", bg: "bg-pink-50", text: "text-pink-600" },
  expense: { label: "Expense", bg: "bg-gray-100", text: "text-gray-600" },
};

const STATUS_META = {
  paid: { label: "Paid", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  partial: { label: "Partial", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  unpaid: { label: "Unpaid", bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
  returned: { label: "Returned / مرتجع", bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
  settled: { label: "Settled / مسوى", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
};

const METHOD_ICONS = {
  cash: "💵",
  card: "💳",
  wallet: "👛",
  bank_transfer: "🏦",
};

function getPaymentStatus(inv) {
  if (inv.isCancelled) return "cancelled";
  if (["sales_return", "purchase_return"].includes(inv.invoiceType)) return "settled";
  if (inv.isFullyReturned) return "returned";

  const hasEffectiveFields =
    inv.effectiveDue !== undefined || inv.effectiveTotal !== undefined;

  if (!hasEffectiveFields && inv.dueAmount <= 0) return "paid";
  if (!hasEffectiveFields && inv.amountPaid > 0) return "partial";

  const total = Number(inv.effectiveTotal ?? inv.finalAmount ?? 0);
  const paid = Math.min(Number(inv.amountPaid || 0), total);
  const due = Number(inv.effectiveDue ?? inv.dueAmount ?? 0);

  if (due <= 0) return "paid";
  if (paid > 0) return "partial";
  return "unpaid";
}

function getDueAmount(inv) {
  return Number(inv.effectiveDue ?? inv.dueAmount ?? 0);
}

/* ── CSV export ──────────────────────────────────────────────────────────── */
function downloadCSV(invoices) {
  const header = "Invoice #,Type,Date,Base Amount,Tax,Final Amount,Paid,Due,Status,Method\n";
  const rows = invoices.map((inv) => {
    const status = getPaymentStatus(inv);
    const date = fmtDate(inv.createdAt);
    const due = getDueAmount(inv);
    return [
      inv.invoiceNumber,
      TYPE_META[inv.invoiceType]?.label ?? inv.invoiceType,
      date,
      inv.baseAmount?.toFixed(2) ?? "0.00",
      inv.taxAmount?.toFixed(2) ?? "0.00",
      inv.finalAmount?.toFixed(2) ?? "0.00",
      inv.amountPaid?.toFixed(2) ?? "0.00",
      due.toFixed(2),
      status,
      inv.paymentMethod,
    ].join(",");
  });
  const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "invoices.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Cancel confirm modal ────────────────────────────────────────────────── */
function CancelModal({ invoice, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSubmit() {
    setLoading(true);
    setErr(null);
    try {
      await onConfirm(invoice._id, reason.trim() || null);
      onClose();
    } catch (e) {
      setErr(e.message ?? "Failed to cancel invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[400] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl p-7 w-full max-w-[420px] shadow-[0_24px_60px_rgba(0,0,0,.2)]"
        style={{ animation: "modalIn .18s ease" }}
      >
        {/* icon */}
        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h3 className="text-[16px] font-extrabold text-gray-900 text-center mb-1">Cancel Invoice</h3>
        <p className="text-sm text-gray-500 text-center mb-5">
          This will cancel{" "}
          <span className="font-semibold text-gray-700">{invoice.invoiceNumber}</span> and
          reverse all related balance effects.
        </p>

        {/* reason */}
        <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Reason <span className="normal-case font-normal">(leave blank to use default)</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder={`Enter cancellation reason… (defaults to "Cancelled by accountant")`}
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1b2b6b] resize-none transition-colors"
        />

        {err && <p className="text-xs text-red-500 mt-2">{err}</p>}

        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 border-[1.5px] border-gray-200 rounded-[10px] bg-white text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Keep Invoice
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 border-none rounded-[10px] bg-red-500 hover:bg-red-600 text-white text-sm font-bold cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : "Cancel Invoice"}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1)  translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Invoice detail expand ───────────────────────────────────────────────── */
function InvoiceItems({ items }) {
  if (!items?.length) return <p className="text-xs text-gray-400 italic">No line items.</p>;
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-gray-400 uppercase tracking-wide">
          <th className="text-left py-1 pr-4 font-semibold">Description</th>
          <th className="text-right py-1 pr-4 font-semibold">Qty</th>
          <th className="text-right py-1 pr-4 font-semibold">Unit Price</th>
          <th className="text-right py-1 font-semibold">Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          const { int: tInt, dec: tDec } = fmtMoney(item.totalPrice);
          const { int: uInt, dec: uDec } = fmtMoney(item.unitPrice);
          return (
            <tr key={i} className="border-t border-gray-100">
              <td className="py-1.5 pr-4 text-gray-700">{item.description}</td>
              <td className="py-1.5 pr-4 text-right text-gray-600">{item.quantity}</td>
              <td className="py-1.5 pr-4 text-right text-gray-600">${uInt}<span className="text-gray-400">{uDec}</span></td>
              <td className="py-1.5 text-right font-semibold text-gray-800">${tInt}<span className="text-gray-400 font-normal">{tDec}</span></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ── Invoice row ─────────────────────────────────────────────────────────── */
function InvoiceRow({ inv, onCancelClick }) {
  const [expanded, setExpanded] = useState(false);

  const typeMeta = TYPE_META[inv.invoiceType] ?? { label: inv.invoiceType, bg: "bg-gray-100", text: "text-gray-600" };
  const status = getPaymentStatus(inv);
  const cancelled = inv.isCancelled;
  const dueAmount = getDueAmount(inv);

  const { int: finalInt, dec: finalDec } = fmtMoney(inv.finalAmount);
  const { int: paidInt, dec: paidDec } = fmtMoney(inv.amountPaid);
  const { int: dueInt, dec: dueDec } = fmtMoney(dueAmount);
  const statusMeta = STATUS_META[status] ?? STATUS_META.unpaid;

  const canCancel = !cancelled && !["purchase_return", "sales_return"].includes(inv.invoiceType);

  return (
    <>
      <tr
        className={`border-b border-gray-50 last:border-0 transition-colors ${cancelled ? "opacity-50" : "hover:bg-[#fafbff]"
          }`}
      >
        {/* expand toggle */}
        <td className="px-3 py-3.5">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <svg
              width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"
              style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .15s" }}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </td>

        {/* invoice # */}
        <td className="px-3 py-3.5 whitespace-nowrap">
          <span className="text-[13px] font-bold text-[#1b2b6b] font-mono">{inv.invoiceNumber}</span>
          {cancelled && (
            <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500">
              Cancelled
            </span>
          )}
        </td>

        {/* type */}
        <td className="px-3 py-3.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${typeMeta.bg} ${typeMeta.text}`}>
            {typeMeta.label}
          </span>
        </td>

        {/* date */}
        <td className="px-3 py-3.5 text-sm text-gray-500 whitespace-nowrap">
          {fmtDate(inv.createdAt)}
        </td>

        {/* final amount */}
        <td className="px-3 py-3.5 whitespace-nowrap">
          <span className="font-semibold text-sm text-gray-900">
            ${finalInt}<span className="font-normal text-gray-400">{finalDec}</span>
          </span>
        </td>

        {/* paid */}
        <td className="px-3 py-3.5 whitespace-nowrap">
          <span className="text-sm text-emerald-600 font-semibold">
            ${paidInt}<span className="font-normal text-emerald-400">{paidDec}</span>
          </span>
        </td>

        {/* due */}
        <td className="px-3 py-3.5 whitespace-nowrap">
          <span className={`text-sm font-semibold ${dueAmount > 0 ? "text-red-500" : "text-gray-400"}`}>
            ${dueInt}<span className={`font-normal ${dueAmount > 0 ? "text-red-300" : "text-gray-300"}`}>{dueDec}</span>
          </span>
        </td>

        {/* status */}
        <td className="px-3 py-3.5">
          {!cancelled ? (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusMeta.bg} ${statusMeta.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Cancelled
            </span>
          )}
        </td>

        {/* method */}
        <td className="px-3 py-3.5 text-sm text-gray-500 whitespace-nowrap">
          {METHOD_ICONS[inv.paymentMethod] ?? "—"} {inv.paymentMethod?.replace("_", " ")}
        </td>

        {/* action */}
        <td className="px-3 py-3.5">
          {canCancel && (
            <button
              onClick={() => onCancelClick(inv)}
              title="Cancel invoice"
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>
          )}
        </td>
      </tr>

      {/* ── expanded row: items + notes ── */}
      {expanded && (
        <tr className="bg-[#f8f9ff]">
          <td colSpan={10} className="px-8 py-4">
            <div className="max-w-2xl">
              {/* expense info */}
              {inv.invoiceType === "expense" && (
                <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  {inv.expenseName && (
                    <span><span className="text-gray-400 text-xs uppercase font-semibold">Name:</span> <span className="text-gray-700 font-medium">{inv.expenseName}</span></span>
                  )}
                  {inv.expenseType && (
                    <span><span className="text-gray-400 text-xs uppercase font-semibold">Type:</span> <span className="text-gray-700 font-medium capitalize">{inv.expenseType?.replace("_", " ")}</span></span>
                  )}
                  {inv.expenseDescription && (
                    <span><span className="text-gray-400 text-xs uppercase font-semibold">Desc:</span> <span className="text-gray-700">{inv.expenseDescription}</span></span>
                  )}
                </div>
              )}

              {/* line items */}
              {inv.invoiceType !== "expense" && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">Line Items</p>
                  <InvoiceItems items={inv.items} />
                </>
              )}

              {/* tax + notes */}
              <div className="flex flex-wrap gap-x-8 gap-y-1 mt-3 text-xs text-gray-500">
                {inv.taxPercentage > 0 && (
                  <span>Tax: <span className="font-semibold text-gray-700">{inv.taxPercentage}% (${fmtMoney(inv.taxAmount).int}{fmtMoney(inv.taxAmount).dec})</span></span>
                )}
                {inv.notes && (
                  <span>Notes: <span className="text-gray-700 italic">{inv.notes}</span></span>
                )}
                {inv.cancellationReason && (
                  <span className="text-red-500">Cancellation reason: <span className="italic">{inv.cancellationReason}</span></span>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
function EmptyInvoices() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <svg width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" className="mb-3 opacity-30">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
        <line x1="9" y1="11" x2="15" y2="11" />
      </svg>
      <p className="text-sm font-semibold">No invoices yet</p>
      <p className="text-xs mt-1">Invoices for this client will appear here.</p>
    </div>
  );
}

/* ── Pagination ─────────────────────────────────────────────────────────── */
function Pagination({ page, totalPages, rangeStart, rangeEnd, total, onPage }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-t-[1.5px] border-gray-100">
      <span className="text-[12px] sm:text-[13px] text-gray-500 order-2 sm:order-1">
        Showing {total === 0 ? 0 : rangeStart} to {rangeEnd} of {total} invoice{total !== 1 ? "s" : ""}
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

/* ── Main export ─────────────────────────────────────────────────────────── */
export default function InvoiceTable({
  invoices = [],
  loading = false,
  onCancel,
  page,
  totalPages,
  total,
  rangeStart,
  rangeEnd,
  onPage,
}) {
  const [cancelTarget, setCancelTarget] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
        <svg className="animate-spin w-5 h-5 text-[#1b2b6b]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-sm font-medium">Loading invoices…</span>
      </div>
    );
  }

  if (!invoices.length) return <EmptyInvoices />;

  const COLS = ["", "Invoice #", "Type", "Date", "Total", "Paid", "Due", "Status", "Method", ""];

  return (
    <>
      {/* toolbar */}
      <div className="px-5 py-3 border-b border-gray-50 flex justify-end">
        <button
          title="Export CSV"
          onClick={() => downloadCSV(invoices)}
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
        <table className="w-full border-collapse min-w-[860px]">
          <thead>
            <tr className="border-b-[1.5px] border-gray-100">
              {COLS.map((h, i) => (
                <th
                  key={i}
                  className="text-left text-[11px] font-bold uppercase tracking-[.06em] text-gray-400 px-3 py-3 whitespace-nowrap first:pl-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <InvoiceRow
                key={inv._id}
                inv={inv}
                onCancelClick={setCancelTarget}
              />
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

      {cancelTarget && (
        <CancelModal
          invoice={cancelTarget}
          onConfirm={onCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </>
  );
}
