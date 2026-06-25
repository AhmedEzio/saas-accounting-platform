import Link from "next/link";
import InvoiceTypeBadge from "./InvoiceTypeBadge";
import SkeletonRow from "./SkeletonRow";
import StatusBadge from "./StatusBadge";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function getStatus(invoice) {
  if (invoice.isCancelled) return "cancelled";
  if (invoice.paymentStatus) return invoice.paymentStatus;
  if (Number(invoice.dueAmount || 0) <= 0) return "paid";
  if (Number(invoice.amountPaid || 0) > 0) return "partial";
  return "unpaid";
}

function getClientName(invoice, t) {
  if (invoice.invoiceType === "expense") return invoice.expenseName || t("type.expense");
  return invoice.clientId?.name || "-";
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value, lang) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function InvoiceTable({ invoices, loading, lang, isRtl, t }) {
  const alignEnd = isRtl ? "text-left" : "text-right";

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-100">
            <th className="w-12 px-4 py-3">
              <span className="sr-only">Selection</span>
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase text-slate-500">
              {t("col.invoiceNo")}
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase text-slate-500">
              {t("col.client")}
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase text-slate-500">
              {t("col.type")}
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase text-slate-500">
              {t("col.status")}
            </th>
            <th className={`px-4 py-3 text-[11px] font-semibold uppercase text-slate-500 ${alignEnd}`}>
              {t("col.finalAmount")}
            </th>
            <th className={`px-4 py-3 text-[11px] font-semibold uppercase text-slate-500 ${alignEnd}`}>
              {t("col.dueAmount")}
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase text-slate-500">
              {t("col.date")}
            </th>
            <th className={`px-4 py-3 text-[11px] font-semibold uppercase text-slate-500 ${alignEnd}`}>
              {t("col.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-[13px]">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <SkeletonRow key={index} />)
            : invoices.map((invoice) => {
                const clientName = getClientName(invoice, t);
                const status = getStatus(invoice);

                return (
                  <tr
                    className={`h-[52px] transition hover:bg-slate-50 ${
                      invoice.isCancelled ? "bg-slate-50/80" : ""
                    }`}
                    key={invoice._id}
                  >
                    <td className="px-4 py-2">
                      <input
                        aria-label={`${t("col.invoiceNo")} ${invoice.invoiceNumber}`}
                        className="h-4 w-4 rounded border-slate-300 text-[#001540] focus:ring-[#001540]/20"
                        type="checkbox"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        className="font-mono font-medium text-[#001540] hover:underline focus:outline-none focus:ring-2 focus:ring-[#001540]/20"
                        href={`/invoices/${invoice._id}`}
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-200 text-[10px] font-bold text-slate-600">
                          {getInitials(clientName) || "#"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-950">{clientName}</p>
                          {invoice.clientId?.phone ? (
                            <p className="text-xs text-slate-500">{invoice.clientId.phone}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <InvoiceTypeBadge lang={lang} type={invoice.invoiceType} />
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge lang={lang} status={status} />
                    </td>
                    <td className={`px-4 py-2 font-mono font-semibold text-slate-950 ${alignEnd}`}>
                      {moneyFormatter.format(Number(invoice.finalAmount || 0))}
                    </td>
                    <td
                      className={`px-4 py-2 font-mono ${
                        Number(invoice.dueAmount || 0) > 0 ? "font-medium text-rose-700" : "text-slate-500"
                      } ${alignEnd}`}
                    >
                      {moneyFormatter.format(Number(invoice.dueAmount || 0))}
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {formatDate(invoice.createdAt, lang)}
                    </td>
                    <td className={`px-4 py-2 ${alignEnd}`}>
                      <Link
                        className="inline-flex min-h-9 items-center rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#001540]/20"
                        href={`/invoices/${invoice._id}`}
                      >
                        {t("action.view")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
