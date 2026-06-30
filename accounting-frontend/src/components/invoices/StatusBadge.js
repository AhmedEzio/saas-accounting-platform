import { t } from "@/locales/invoices";

const styles = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
  partial: "bg-blue-50 text-blue-700 border-blue-100",
  unpaid: "bg-rose-50 text-rose-700 border-rose-100",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  settled: "bg-emerald-50 text-emerald-700 border-emerald-100",
  returned: "bg-cyan-50 text-cyan-700 border-cyan-100",
};

export default function StatusBadge({ status, lang = "en" }) {
  const normalized = status || "unpaid";

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium capitalize border ${
        styles[normalized] || styles.unpaid
      }`}
    >
      {t(`status.${normalized}`, lang)}
    </span>
  );
}
