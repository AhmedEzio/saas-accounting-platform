const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function formatDate(value, lang) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getSourceLabel(source) {
  return String(source || "").replaceAll("_", " ");
}

export default function PaymentTimeline({ error, lang, payments, t }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{t("details.paymentHistory")}</h2>

      {error ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      {!payments?.length ? (
        <p className="mt-4 text-sm text-slate-500">{t("details.noPayments")}</p>
      ) : (
        <ol className="mt-5 space-y-5 border-s-2 border-slate-200 ps-4">
          {payments.map((payment) => (
            <li className="relative" key={payment._id}>
              <span className="absolute -start-[23px] top-1 h-3 w-3 rounded-full bg-[#001540] ring-4 ring-white" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold capitalize text-slate-950">
                    {getSourceLabel(payment.source)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {t(`method.${payment.paymentMethod}`)} · {payment.paidBy?.name || "-"}
                  </p>
                  {payment.notes ? (
                    <p className="mt-1 text-xs text-slate-500">{payment.notes}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-[#001540]">
                    {moneyFormatter.format(Number(payment.amount || 0))}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(payment.createdAt, lang)}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
