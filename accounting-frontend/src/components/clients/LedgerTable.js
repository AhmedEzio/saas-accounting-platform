"use client";

/* ─────────────────────────────────────────────────────────────────────────────
   LedgerTable.js
   Renders the "Financial History" table for a client's payment transactions.
───────────────────────────────────────────────────────────────────────────── */

const SOURCE_LABELS = {
  invoice_creation: "Invoice Issued",
  manual_payment: "Payment Received",
  cancellation_reversal: "Overpayment Reversal",
  refund: "Refund Issued",
};

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
  return { int, dec, sign: val < 0 ? "-" : "" };
}

/* ── Effect badge ─────────────────────────────────────────────────────────── */
function EffectBadge({ direction }) {
  const isCredit = direction === "in";
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
        isCredit
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-600"
      }`}
    >
      {isCredit ? "Credit" : "Debit"}
    </span>
  );
}

/* ── Individual row ───────────────────────────────────────────────────────── */
function LedgerRow({ tx, runningBalance }) {
  const label = SOURCE_LABELS[tx.source] ?? tx.source;
  const isCredit = tx.direction === "in";
  const { int, dec } = fmtMoney(tx.amount);
  const { int: balInt, dec: balDec } = fmtMoney(runningBalance);

  // format source reference — try invoiceId, fall back to id
  const ref = tx.invoiceId
    ? `#INV-${String(tx.invoiceId).slice(-6).toUpperCase()}`
    : tx._id
    ? `#TXN-${String(tx._id).slice(-6).toUpperCase()}`
    : "—";

  return (
    <tr className="hover:bg-[#fafbff] transition-colors border-b border-gray-50 last:border-0">
      {/* DATE */}
      <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
        {fmtDate(tx.createdAt)}
      </td>

      {/* TYPE */}
      <td className="px-5 py-3.5 text-sm text-gray-800 font-medium whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          {label}
          {/* spinning coin for manual_payment */}
          {tx.source === "manual_payment" && (
            <span className="text-gray-400 text-xs">✦</span>
          )}
        </div>
      </td>

      {/* EFFECT */}
      <td className="px-5 py-3.5">
        <EffectBadge direction={tx.direction} />
      </td>

      {/* AMOUNT */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span
          className={`font-semibold text-sm ${
            isCredit ? "text-emerald-600" : "text-gray-900"
          }`}
        >
          ${int}
          <span className={`font-normal ${isCredit ? "text-emerald-500" : "text-gray-400"}`}>
            {dec}
          </span>
        </span>
      </td>

      {/* BALANCE */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span className="font-semibold text-sm text-gray-900">
          ${balInt}
          <span className="font-normal text-gray-400">{balDec}</span>
        </span>
      </td>

      {/* SOURCE REF */}
      <td className="px-5 py-3.5 text-sm text-gray-500 font-mono whitespace-nowrap">
        {ref}
      </td>
    </tr>
  );
}

/* ── Main table ───────────────────────────────────────────────────────────── */
export default function LedgerTable({ transactions = [], initialBalance = 0 }) {
  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3 opacity-40">
          <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
          <path d="M13 21l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          <rect x="13" y="13" width="8" height="8" rx="1" />
        </svg>
        <p className="text-sm font-medium">No transactions yet</p>
        <p className="text-xs mt-1">Transactions will appear here once created.</p>
      </div>
    );
  }

  // Build running balance: start from initialBalance, apply each tx in reverse chronological order
  // transactions are newest-first (sorted by createdAt desc from the API)
  // We compute running balance from oldest to newest then reverse
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  let balance = initialBalance;
  // Go backward from the current balance to find the starting balance
  // since initialBalance IS the current balance after all txns,
  // we reverse-apply to get balance at each point
  const balances = [];
  // Walk forward: compute the running balance after each tx
  // We start from 0 and add/subtract, then shift by (initialBalance - finalComputed)
  let running = 0;
  const runningArr = sorted.map((tx) => {
    running += tx.direction === "in" ? tx.amount : -tx.amount;
    return running;
  });
  // offset so the last entry equals initialBalance
  const offset = initialBalance - running;
  const adjustedBalances = runningArr.map((b) => b + offset);

  // Map back to original order (newest first)
  const displayRows = [...transactions]
    .map((tx) => {
      const idx = sorted.findIndex((s) => s._id === tx._id);
      return { tx, runningBalance: adjustedBalances[idx] ?? 0 };
    })
    .sort((a, b) => new Date(b.tx.createdAt) - new Date(a.tx.createdAt));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr className="border-b-[1.5px] border-gray-100">
            {["DATE", "TYPE", "EFFECT", "AMOUNT", "BALANCE", "SOURCE"].map((h) => (
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
          {displayRows.map(({ tx, runningBalance }) => (
            <LedgerRow key={tx._id} tx={tx} runningBalance={runningBalance} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
