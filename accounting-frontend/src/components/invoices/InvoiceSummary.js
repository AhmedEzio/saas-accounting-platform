const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function formatMoney(value) {
  return moneyFormatter.format(Number(value || 0));
}

function formatDate(value, lang) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value || "-"}</p>
    </div>
  );
}

export default function InvoiceSummary({ invoice, lang, t }) {
  const isExpense = invoice.invoiceType === "expense";
  const party = invoice.clientId;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              {isExpense ? t("details.expenseName") : t("details.client")}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[#001540]">
              {isExpense ? invoice.expenseName || t("type.expense") : party?.name || "-"}
            </h2>
            {!isExpense ? (
              <div className="mt-2 space-y-1 text-sm text-slate-500">
                <p>{party?.email || "-"}</p>
                <p>{party?.phone || "-"}</p>
                <p>{party?.address || "-"}</p>
              </div>
            ) : (
              <div className="mt-2 space-y-1 text-sm text-slate-500">
                <p>{t("details.expenseType")}: {t(`expense.${invoice.expenseType}`)}</p>
                <p>{invoice.expenseDescription || "-"}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label={t("details.issuedOn")} value={formatDate(invoice.createdAt, lang)} />
            <InfoItem label={t("details.createdBy")} value={invoice.createdBy?.name} />
            <InfoItem label={t("details.paymentMethod")} value={t(`method.${invoice.paymentMethod}`)} />
            <InfoItem label={t("details.relatedTo")} value={invoice.relatedInvoiceId?.invoiceNumber} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-slate-500">{t("col.finalAmount")}</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#001540]">
            {formatMoney(invoice.finalAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-slate-500">{t("form.amountPaid")}</p>
          <p className="mt-2 font-mono text-xl font-semibold text-emerald-700">
            {formatMoney(invoice.amountPaid)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-slate-500">{t("col.dueAmount")}</p>
          <p className="mt-2 font-mono text-xl font-semibold text-rose-700">
            {formatMoney(invoice.dueAmount)}
          </p>
        </div>
      </section>

      {invoice.notes ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">{t("details.notes")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{invoice.notes}</p>
        </section>
      ) : null}
    </div>
  );
}
