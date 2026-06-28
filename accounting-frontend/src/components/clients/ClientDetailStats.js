"use client";


function fmtMoney(n) {
  const val = Number(n) || 0;
  const int = Math.floor(Math.abs(val)).toLocaleString("en-US");
  const dec = (Math.abs(val) % 1).toFixed(2).slice(1);
  return { int, dec };
}

function StatCard({ label, value, icon, accent }) {
  const { int, dec } = fmtMoney(value);

  const accentMap = {
    neutral: {
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      valueColor: "text-gray-900",
      decColor: "text-gray-400",
    },
    blue: {
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      valueColor: "text-gray-900",
      decColor: "text-gray-400",
    },
    red: {
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      valueColor: "text-gray-900",
      decColor: "text-gray-400",
    },
    green: {
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
      decColor: "text-emerald-500",
    },
  };

  const c = accentMap[accent] ?? accentMap.neutral;

  return (
    <div className="bg-white rounded-2xl px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,.06)] flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[.07em] text-gray-400 mb-2.5">
          {label}
        </p>
        {typeof value === "number" && label !== "Total Transactions" ? (
          <p className={`text-[26px] sm:text-[30px] font-extrabold leading-none ${c.valueColor}`}>
            ${int}
            <span className={`text-[18px] font-normal ${c.decColor}`}>{dec}</span>
          </p>
        ) : (
          <p className={`text-[26px] sm:text-[30px] font-extrabold leading-none ${c.valueColor}`}>
            {typeof value === "number" ? int : value}
          </p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg} ${c.iconColor}`}>
        {icon}
      </div>
    </div>
  );
}

export default function ClientDetailStats({
  currentBalance,
  totalTransactions,
  totalDebit,
  totalCredit,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <StatCard
        label="Current Balance"
        value={currentBalance}
        accent="neutral"
        icon={
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        }
      />
      <StatCard
        label="Total Transactions"
        value={totalTransactions}
        accent="blue"
        icon={
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        }
      />
      <StatCard
        label="Total Debit"
        value={totalDebit}
        accent="red"
        icon={
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        }
      />
      <StatCard
        label="Total Credit"
        value={totalCredit}
        accent="green"
        icon={
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        }
      />
    </div>
  );
}
