const insightCards = [
  { key: "paid", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { key: "partial", tone: "bg-amber-50 text-amber-700 border-amber-100" },
  { key: "unpaid", tone: "bg-red-50 text-red-700 border-red-100" },
  { key: "cancelled", tone: "bg-gray-50 text-gray-600 border-gray-100" },
];

export default function InsightCards({ insights, numberValue, currency, percentValue, t, isRtl }) {
  const cards = [
    ...insightCards.map((item) => ({
      label: t(`insight.${item.key}`),
      value: numberValue(insights.statusCounts[item.key]),
      hint: t("insight.statusHint"),
      tone: item.tone,
    })),
    {
      label: t("insight.collectionRate"),
      value: percentValue(insights.collectionRate),
      hint: t("insight.collectionHint"),
      tone: "bg-blue-50 text-[#1b2b6b] border-blue-100",
    },
    {
      label: t("insight.averageInvoice"),
      value: currency(insights.averageInvoiceValue),
      hint: t("insight.averageHint"),
      tone: "bg-white text-[#1b2b6b] border-gray-100",
    },
  ];

  return (
    <section aria-label={t("insight.cardsTitle")}>
      <div className={`mb-3 ${isRtl ? "text-right" : "text-left"}`}>
        <h2 className="text-base font-bold text-gray-900">{t("insight.cardsTitle")}</h2>
        <p className="mt-1 text-xs text-gray-500">{t("insight.cardsSubtitle")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => (
          <article key={card.label} className={`min-h-28 rounded-xl border p-4 shadow-sm ${card.tone}`}>
            <p className="text-[11px] font-bold uppercase text-current opacity-75">{card.label}</p>
            <p className="mt-3 break-words text-2xl font-extrabold text-gray-900">{card.value}</p>
            <p className="mt-2 text-xs text-gray-500">{card.hint}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
