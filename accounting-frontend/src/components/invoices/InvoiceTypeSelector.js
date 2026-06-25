const invoiceTypes = ["sale", "purchase", "sales_return", "purchase_return", "expense"];

export default function InvoiceTypeSelector({ value, onChange, t }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-slate-600">
        {t("form.invoiceType")}
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {invoiceTypes.map((type) => {
          const selected = value === type;

          return (
            <button
              aria-pressed={selected}
              className={`min-h-11 rounded-lg border px-4 py-3 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${
                selected
                  ? "border-[#001540] bg-[#001540] text-white shadow-sm"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              key={type}
              onClick={() => onChange(type)}
              type="button"
            >
              {t(`type.${type}`)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
