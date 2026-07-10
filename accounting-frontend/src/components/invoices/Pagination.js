function getPages(currentPage, totalPages) {
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

export default function Pagination({ page, pages, limit, total, onPageChange, t, isRtl }) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const visiblePages = getPages(page, pages || 1);
  const prevLabel = isRtl ? t("pagination.next") : t("pagination.prev");
  const nextLabel = isRtl ? t("pagination.prev") : t("pagination.next");

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t("pagination.showing")} {start} {t("pagination.to")} {end}{" "}
        {t("pagination.of")} {total} {t("pagination.entries")}
      </p>
      <div className="flex items-center gap-1">
        <button
          className="min-h-9 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          {prevLabel}
        </button>
        {visiblePages.map((pageNumber, index) => {
          const previous = visiblePages[index - 1];
          const showGap = previous && pageNumber - previous > 1;

          return (
            <span className="flex items-center gap-1" key={pageNumber}>
              {showGap ? <span className="px-2 text-slate-400 dark:text-slate-500">...</span> : null}
              <button
                aria-current={pageNumber === page ? "page" : undefined}
                className={`flex h-9 min-w-9 items-center justify-center rounded text-sm font-medium transition ${
                  pageNumber === page
                    ? "bg-[#001540] dark:bg-blue-600 text-white"
                    : "border border-transparent text-slate-700 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700"
                }`}
                onClick={() => onPageChange(pageNumber)}
                type="button"
              >
                {pageNumber}
              </button>
            </span>
          );
        })}
        <button
          className="min-h-9 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
