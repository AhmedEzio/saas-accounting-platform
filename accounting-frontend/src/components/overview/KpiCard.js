export default function KpiCard({ label, value, hint, icon, tone = "default", loading, trend }) {
  const tones = {
    default: "bg-white border-gray-100 text-[#1b2b6b]",
    green: "bg-white border-emerald-100 text-emerald-600",
    amber: "bg-white border-amber-100 text-amber-600",
    red: "bg-white border-red-100 text-red-500",
  };
  const trendTones = {
    up: "bg-emerald-50 text-emerald-700",
    down: "bg-red-50 text-red-700",
    neutral: "bg-gray-50 text-gray-500",
  };

  return (
    <article className={`min-h-32 rounded-xl border px-5 py-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase text-gray-400">{label}</p>
        <span className="text-current" aria-hidden="true">
          {icon}
        </span>
      </div>
      {loading ? (
        <div className="mt-4 h-8 w-24 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="mt-3 break-words text-2xl font-extrabold text-gray-900">{value}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="text-xs text-gray-400">{hint}</p>
        {trend ? (
          <span
            className={`inline-flex min-h-6 items-center rounded-full px-2 text-[11px] font-bold ${
              trendTones[trend.direction]
            }`}
            aria-label={trend.ariaLabel}
            title={trend.ariaLabel}
          >
            {trend.text}
          </span>
        ) : null}
      </div>
    </article>
  );
}
