import { t } from "@/locales/invoices";

const styles = {
  sale: "bg-indigo-50 text-indigo-700 border-indigo-100",
  purchase: "bg-amber-50 text-amber-700 border-amber-100",
  sales_return: "bg-cyan-50 text-cyan-700 border-cyan-100",
  purchase_return: "bg-violet-50 text-violet-700 border-violet-100",
  expense: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function InvoiceTypeBadge({ type, lang = "en" }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${
        styles[type] || styles.expense
      }`}
    >
      {t(`type.${type}`, lang)}
    </span>
  );
}
