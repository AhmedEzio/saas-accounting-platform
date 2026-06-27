export default function RecentActivity({ activities, currency, date, t, isRtl }) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-gray-900">{t("activity.title")}</h2>

      {!activities.length ? (
        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
          {t("activity.empty")}
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {activities.map((item) => (
            <li
              key={item.id}
              className={`flex gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 ${
                isRtl ? "flex-row-reverse text-right" : "text-left"
              }`}
            >
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.tone}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="truncate text-sm font-semibold text-gray-800">{t(`activity.${item.kind}`)}</p>
                  <span className="shrink-0 text-xs text-gray-400">{date(item.time)}</span>
                </div>
                <p className="mt-1 truncate text-sm text-gray-500">{item.title}</p>
                <p className="mt-1 text-xs font-semibold text-gray-700">{currency(item.amount)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
