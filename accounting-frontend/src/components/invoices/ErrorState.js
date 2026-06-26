export default function ErrorState({ title, hint, retryLabel, onRetry }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-700">
        <span aria-hidden="true" className="text-lg font-semibold">
          !
        </span>
      </div>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{hint}</p>
      <button
        className="mt-5 min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#001540]/20"
        onClick={onRetry}
        type="button"
      >
        {retryLabel}
      </button>
    </div>
  );
}
