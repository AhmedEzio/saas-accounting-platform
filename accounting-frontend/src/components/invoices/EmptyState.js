export default function EmptyState({ title, hint, actionLabel, onAction }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
        <span aria-hidden="true" className="text-xl font-semibold">
          #
        </span>
      </div>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{hint}</p>
      {actionLabel && onAction ? (
        <button
          className="mt-5 min-h-11 rounded-lg bg-[#001540] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#0f2a5f] focus:outline-none focus:ring-2 focus:ring-[#001540]/30"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
