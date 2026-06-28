const dateRanges = ["today", "last7", "last30", "thisMonth", "thisYear", "allTime"];
const chartPeriods = ["daily", "weekly", "monthly"];

function SegmentedButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-md px-3 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 ${
        active ? "bg-white text-[#1b2b6b] shadow-sm" : "text-gray-500 hover:bg-white/70"
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export default function TimeAnalyticsControls({
  dateRange,
  onDateRangeChange,
  chartPeriod,
  onChartPeriodChange,
  summary,
  t,
  isRtl,
}) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm print:hidden">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className={isRtl ? "text-right" : "text-left"}>
          <p className="text-sm font-bold text-gray-900">{t("analytics.title")}</p>
          <p className="mt-1 text-xs text-gray-500">{summary}</p>
        </div>

        <div className={`flex flex-col gap-3 lg:flex-row lg:items-center ${isRtl ? "lg:flex-row-reverse" : ""}`}>
          <div>
            <p className={`mb-1 text-[11px] font-bold uppercase text-gray-400 ${isRtl ? "text-right" : "text-left"}`}>
              {t("analytics.dateRange")}
            </p>
            <div
              className={`flex flex-wrap gap-1 rounded-lg bg-gray-50 p-1 ${
                isRtl ? "justify-end" : "justify-start"
              }`}
              aria-label={t("analytics.dateRange")}
            >
              {dateRanges.map((range) => (
                <SegmentedButton
                  key={range}
                  active={dateRange === range}
                  onClick={() => onDateRangeChange(range)}
                >
                  {t(`range.${range}`)}
                </SegmentedButton>
              ))}
            </div>
          </div>

          <div>
            <p className={`mb-1 text-[11px] font-bold uppercase text-gray-400 ${isRtl ? "text-right" : "text-left"}`}>
              {t("analytics.chartPeriod")}
            </p>
            <div
              className={`flex flex-wrap gap-1 rounded-lg bg-gray-50 p-1 ${
                isRtl ? "justify-end" : "justify-start"
              }`}
              aria-label={t("analytics.chartPeriod")}
            >
              {chartPeriods.map((period) => (
                <SegmentedButton
                  key={period}
                  active={chartPeriod === period}
                  onClick={() => onChartPeriodChange(period)}
                >
                  {t(`period.${period}`)}
                </SegmentedButton>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
