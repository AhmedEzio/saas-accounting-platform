import Link from "next/link";
import InvoiceTypeBadge from "./InvoiceTypeBadge";
import StatusBadge from "./StatusBadge";

function getStatus(invoice) {
  if (invoice?.isCancelled) return "cancelled";
  if (invoice?.paymentStatus) return invoice.paymentStatus;
  if (Number(invoice?.dueAmount || 0) <= 0) return "paid";
  if (Number(invoice?.amountPaid || 0) > 0) return "partial";
  return "unpaid";
}

export default function InvoiceHeader({ invoice, lang, t }) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <Link className="text-sm font-medium text-slate-500 hover:text-[#001540]" href="/invoices">
          {t("action.back")}
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-[#001540]">
            {invoice.invoiceNumber}
          </h1>
          <StatusBadge lang={lang} status={getStatus(invoice)} />
          <InvoiceTypeBadge lang={lang} type={invoice.invoiceType} />
        </div>
        {invoice.isCancelled ? (
          <p className="mt-2 text-sm text-rose-700">
            {t("details.reason")}: {invoice.cancellationReason || "-"}
          </p>
        ) : null}
      </div>
    </header>
  );
}
