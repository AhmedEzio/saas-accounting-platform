export default function StatusBadge({ status, t }) {
  const styles = {
    paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
    partial: "bg-amber-50 text-amber-700 border-amber-100",
    unpaid: "bg-red-50 text-red-600 border-red-100",
    cancelled: "bg-gray-100 text-gray-500 border-gray-200",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] ?? styles.unpaid}`}>
      {t(`status.${status}`)}
    </span>
  );
}
