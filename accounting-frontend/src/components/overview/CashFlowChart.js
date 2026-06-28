function barHeight(value, maxValue) {
  if (!maxValue) return 0;
  return Math.max(4, Math.round((Math.abs(value) / maxValue) * 100));
}

export default function CashFlowChart({ chartData, currency, t, isRtl }) {
  const maxValue = Math.max(
    0,
    ...chartData.flatMap((item) => [Math.abs(item.sales), Math.abs(item.purchases)]),
  );
  const hasData = chartData.some((item) => item.sales || item.purchases);
  const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0);
  const totalPurchases = chartData.reduce((sum, item) => sum + item.purchases, 0);

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">{t("chart.title")}</h2>
          <p className="mt-1 text-xs text-gray-400">{t("chart.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-[#1b2b6b]" />
            {t("chart.sales")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-[#e87a3d]" />
            {t("chart.purchases")}
          </span>
        </div>
      </div>

      <p className="sr-only">
        {t("chart.summary")}: {t("chart.sales")} {currency(totalSales)},{" "}
        {t("chart.purchases")} {currency(totalPurchases)}.
      </p>

      <div className="mt-5 h-64 rounded-lg bg-gray-50 p-4">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            {t("chart.empty")}
          </div>
        ) : (
          <div
            className={`flex h-full items-end gap-2 overflow-x-auto pb-1 ${
              isRtl ? "flex-row-reverse" : ""
            }`}
          >
            {chartData.map((item) => (
              <div
                key={item.key || item.label}
                className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-48 w-full items-end justify-center gap-1">
                  <div
                    className="w-full max-w-5 rounded-t bg-[#1b2b6b]"
                    style={{ height: `${barHeight(item.sales, maxValue)}%` }}
                    title={`${t("chart.sales")}: ${currency(item.sales)}`}
                  />
                  <div
                    className="w-full max-w-5 rounded-t bg-[#e87a3d]"
                    style={{ height: `${barHeight(item.purchases, maxValue)}%` }}
                    title={`${t("chart.purchases")}: ${currency(item.purchases)}`}
                  />
                </div>
                <span className="w-full truncate text-center text-[11px] font-medium text-gray-400">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
