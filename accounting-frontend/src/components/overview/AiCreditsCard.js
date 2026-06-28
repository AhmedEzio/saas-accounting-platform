export default function AiCreditsCard({ subscription, t }) {
  if (!subscription) {
    return (
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase text-gray-400">{t("kpi.aiCredits")}</p>
        <p className="mt-4 text-sm font-semibold text-gray-500">{t("kpi.noSubscription")}</p>
      </section>
    );
  }

  const creditLimit = Number(subscription.creditLimit ?? 0);
  const remaining = Number(subscription.creditsRemaining ?? Math.max(0, creditLimit - Number(subscription.creditsUsed ?? 0)));
  const pct = creditLimit ? Math.round((remaining / creditLimit) * 100) : 0;
  const planName = subscription.planId?.name || subscription.plan?.name || subscription.status || "";

  return (
    <section className="rounded-xl border border-emerald-100 bg-[#edf8f4] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase text-gray-500">{t("kpi.aiCredits")}</p>
        <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-emerald-600">{pct}%</span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-gray-900">
        {remaining} / {creditLimit}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {planName ? `${planName} - ` : ""}
        {t("kpi.remaining")}
      </p>
    </section>
  );
}
