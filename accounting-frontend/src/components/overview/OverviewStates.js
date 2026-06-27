export function LoadingPanel({ t }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={t("state.loading")}>
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-xl border border-gray-100 bg-white p-5">
          <div className="h-3 w-24 rounded bg-gray-100" />
          <div className="mt-5 h-8 w-32 rounded bg-gray-100" />
          <div className="mt-4 h-3 w-28 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export function ErrorPanel({ t, onRetry }) {
  return (
    <section className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-700" role="alert">
      <h2 className="text-lg font-bold">{t("state.error")}</h2>
      <p className="mt-2 text-sm">{t("state.errorHint")}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 min-h-11 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        {t("action.retry")}
      </button>
    </section>
  );
}

export function EmptyPanel({ t }) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-8 text-center">
      <h2 className="text-lg font-bold text-gray-900">{t("state.empty")}</h2>
      <p className="mt-2 text-sm text-gray-500">{t("state.emptyHint")}</p>
    </section>
  );
}
