const tones = {
  green: "border-emerald-100 bg-emerald-50 text-emerald-800",
  amber: "border-amber-100 bg-amber-50 text-amber-800",
  red: "border-red-100 bg-red-50 text-red-800",
};

export default function FinancialHealthPanel({ health, t, isRtl }) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={isRtl ? "text-right" : "text-left"}>
        <h2 className="text-base font-bold text-gray-900">{t("health.title")}</h2>
        <p className="mt-1 text-xs text-gray-500">{t("health.subtitle")}</p>
      </div>

      <ul className="mt-4 space-y-3">
        {health.map((item) => (
          <li
            key={item.key}
            className={`rounded-lg border px-4 py-3 text-sm font-semibold leading-6 ${tones[item.tone]}`}
          >
            <span className={isRtl ? "block text-right" : "block text-left"}>{t(item.key)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
