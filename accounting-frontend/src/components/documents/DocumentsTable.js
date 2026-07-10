import Link from "next/link";
import SkeletonRow from "@/components/invoices/SkeletonRow";

function formatDate(value, lang) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getFileTypeColor(type) {
  switch (type?.toLowerCase()) {
    case "pdf":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "jpg":
    case "jpeg":
    case "png":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
  }
}

export default function DocumentsTable({ documents, loading, lang, t, isRtl, onPreview, onDelete }) {
  const alignEnd = isRtl ? "text-start" : "text-end"; // Since it's flex row reverse sometimes, let's keep it robust. Actually for LTR it's text-end, for RTL it's text-start if we just use "text-end" with logical properties, but since InvoiceTable used standard align, we'll use "text-end" which logicalizes to left in RTL. wait, logical classes in tailwind are `text-end`. `text-end` is automatically left in RTL.

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table className="w-full min-w-[900px] border-collapse text-start">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
            <th className="px-4 py-3 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              {t("col.fileName", lang)}
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              {t("col.fileType", lang)}
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              {t("col.invoiceRef", lang)}
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              {t("col.uploadDate", lang)}
            </th>
            <th className={`px-4 py-3 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 text-end`}>
              {t("col.actions", lang)}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-[13px]">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <SkeletonRow key={index} />)
            : documents.map((doc) => {
                const invoiceNumber = doc.invoiceId?.invoiceNumber || "-";

                return (
                  <tr
                    className="h-[52px] transition hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    key={doc._id}
                  >
                    <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-200">
                      <div className="flex items-center gap-2 truncate max-w-xs" title={doc.fileName}>
                        <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="truncate">{doc.fileName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getFileTypeColor(doc.fileType)}`}>
                        {doc.fileType || "unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">
                      {doc.invoiceId ? (
                        <Link href={`/invoices/${doc.invoiceId._id}`} className="hover:text-[#1b2b6b] dark:hover:text-blue-400 hover:underline">
                          {invoiceNumber}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                      {formatDate(doc.uploadedAt, lang)}
                    </td>
                    <td className="px-4 py-2 text-end">
                      <div className="flex items-center justify-end gap-2">
                        {/* Placeholder buttons for Phase 2, actual modals in Phase 3 */}
                        <button
                          type="button"
                          onClick={() => onPreview(doc._id)}
                          className="inline-flex min-h-8 items-center rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b]/20"
                          title={t("action.preview", lang)}
                        >
                          {t("action.preview", lang)}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(doc._id)}
                          className="inline-flex min-h-8 items-center rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 text-xs font-medium text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          title={t("action.delete", lang)}
                        >
                          {t("action.delete", lang)}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
