export default function TopEntitiesPanel({ entities, currency, t, isRtl }) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={isRtl ? "text-right" : "text-left"}>
        <h2 className="text-base font-bold text-gray-900">{t("top.title")}</h2>
        <p className="mt-1 text-xs text-gray-500">{t("top.subtitle")}</p>
      </div>

      {!entities.length ? (
        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
          {t("top.empty")}
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {entities.map((entity, index) => (
            <li
              key={entity.name}
              className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#1b2b6b] shadow-sm">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900" title={entity.name}>
                    {entity.name}
                  </p>
                  <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                    <div>
                      <dt className="font-semibold text-gray-400">{t("top.sales")}</dt>
                      <dd className="mt-1 font-bold text-emerald-700">{currency(entity.sales)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-400">{t("top.purchases")}</dt>
                      <dd className="mt-1 font-bold text-amber-700">{currency(entity.purchases)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-400">{t("top.outstanding")}</dt>
                      <dd className="mt-1 font-bold text-[#1b2b6b]">{currency(entity.outstanding)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
