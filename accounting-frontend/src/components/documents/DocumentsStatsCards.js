import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/locales/documents";

const numberFormatter = new Intl.NumberFormat("en-US");

function StatCard({ label, value, hint }) {
  return (
    <div className="flex h-[120px] flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {value !== undefined ? numberFormatter.format(value) : "-"}
        </p>
        {hint && <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

export default function DocumentsStatsCards({ stats, loading }) {
  const { lang } = useLanguage();

  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[120px] animate-pulse rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50" />
        ))}
      </section>
    );
  }

  const defaultStats = {
    totalDocuments: 0,
    pdfFiles: 0,
    imageFiles: 0,
    processedOCR: 0,
    recentDocuments: 0,
  };

  const data = stats || defaultStats;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label={t("stats.totalDocuments", lang)}
        value={data.totalDocuments}
        hint={t("stats.allFiltered", lang)}
      />
      <StatCard
        label={t("stats.pdfFiles", lang)}
        value={data.pdfFiles}
      />
      <StatCard
        label={t("stats.imageFiles", lang)}
        value={data.imageFiles}
      />
      <StatCard
        label={t("stats.processedOCR", lang)}
        value={data.processedOCR}
      />
      <StatCard
        label={t("stats.recentDocuments", lang)}
        value={data.recentDocuments}
      />
    </section>
  );
}
