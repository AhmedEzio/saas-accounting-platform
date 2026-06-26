const emptyItem = { description: "", quantity: 1, unitPrice: 0 };

export function createEmptyLineItem() {
  return { ...emptyItem };
}

export default function LineItemsEditor({ errors = {}, isRtl, items, onChange, t }) {
  const alignEnd = isRtl ? "text-left" : "text-right";

  const updateItem = (index, field, value) => {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-950">{t("details.items")}</h2>
        <button
          className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-[#001540] transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#001540]/20"
          onClick={() => onChange([...items, createEmptyLineItem()])}
          type="button"
        >
          + {t("action.addItem")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="hidden w-full min-w-[760px] border-collapse text-start sm:table">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100">
              <th className="w-1/2 px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                {t("form.description")}
              </th>
              <th className={`w-28 px-4 py-3 text-xs font-semibold uppercase text-slate-500 ${alignEnd}`}>
                {t("form.qty")}
              </th>
              <th className={`w-36 px-4 py-3 text-xs font-semibold uppercase text-slate-500 ${alignEnd}`}>
                {t("form.unitPrice")}
              </th>
              <th className={`w-36 px-4 py-3 text-xs font-semibold uppercase text-slate-500 ${alignEnd}`}>
                {t("form.total")}
              </th>
              <th className="w-16 px-4 py-3">
                <span className="sr-only">{t("col.actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, index) => {
              const total = Number(item.quantity || 0) * Number(item.unitPrice || 0);

              return (
                <tr className="align-top" key={index}>
                  <td className="px-4 py-3">
                    <textarea
                      aria-label={`${t("form.description")} ${index + 1}`}
                      aria-invalid={Boolean(errors[`items.${index}.description`])}
                      className={`min-h-11 w-full resize-none rounded-lg border px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${
                        errors[`items.${index}.description`] ? "border-rose-400" : "border-slate-300"
                      }`}
                      onChange={(event) => updateItem(index, "description", event.target.value)}
                      rows={1}
                      value={item.description}
                    />
                    {errors[`items.${index}.description`] ? (
                      <p className="mt-1 text-xs text-rose-600">
                        {errors[`items.${index}.description`]}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      aria-label={`${t("form.qty")} ${index + 1}`}
                      aria-invalid={Boolean(errors[`items.${index}.quantity`])}
                      className={`min-h-11 w-full rounded-lg border px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${alignEnd} ${
                        errors[`items.${index}.quantity`] ? "border-rose-400" : "border-slate-300"
                      }`}
                      min="1"
                      onChange={(event) => updateItem(index, "quantity", event.target.value)}
                      step="1"
                      type="number"
                      value={item.quantity}
                    />
                    {errors[`items.${index}.quantity`] ? (
                      <p className="mt-1 text-xs text-rose-600">
                        {errors[`items.${index}.quantity`]}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      aria-label={`${t("form.unitPrice")} ${index + 1}`}
                      aria-invalid={Boolean(errors[`items.${index}.unitPrice`])}
                      className={`min-h-11 w-full rounded-lg border px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${alignEnd} ${
                        errors[`items.${index}.unitPrice`] ? "border-rose-400" : "border-slate-300"
                      }`}
                      min="0"
                      onChange={(event) => updateItem(index, "unitPrice", event.target.value)}
                      step="0.01"
                      type="number"
                      value={item.unitPrice}
                    />
                    {errors[`items.${index}.unitPrice`] ? (
                      <p className="mt-1 text-xs text-rose-600">
                        {errors[`items.${index}.unitPrice`]}
                      </p>
                    ) : null}
                  </td>
                  <td className={`px-4 py-3 font-mono text-sm font-semibold text-slate-950 ${alignEnd}`}>
                    {total.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 ${alignEnd}`}>
                    <button
                      aria-label={t("form.removeItem")}
                      className="min-h-10 rounded-lg px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={items.length === 1}
                      onClick={() => removeItem(index)}
                      type="button"
                    >
                      x
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="divide-y divide-slate-100 sm:hidden">
          {items.map((item, index) => {
            const total = Number(item.quantity || 0) * Number(item.unitPrice || 0);

            return (
              <div className="space-y-4 p-4" key={index}>
                <div>
                  <label className="block text-sm font-medium text-slate-600" htmlFor={`line-desc-${index}`}>
                    {t("form.description")}
                  </label>
                  <textarea
                    aria-invalid={Boolean(errors[`items.${index}.description`])}
                    className={`mt-2 min-h-20 w-full resize-none rounded-lg border px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${
                      errors[`items.${index}.description`] ? "border-rose-400" : "border-slate-300"
                    }`}
                    id={`line-desc-${index}`}
                    onChange={(event) => updateItem(index, "description", event.target.value)}
                    value={item.description}
                  />
                  {errors[`items.${index}.description`] ? (
                    <p className="mt-1 text-xs text-rose-600">{errors[`items.${index}.description`]}</p>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-600" htmlFor={`line-qty-${index}`}>
                      {t("form.qty")}
                    </label>
                    <input
                      aria-invalid={Boolean(errors[`items.${index}.quantity`])}
                      className={`mt-2 min-h-11 w-full rounded-lg border px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${alignEnd} ${
                        errors[`items.${index}.quantity`] ? "border-rose-400" : "border-slate-300"
                      }`}
                      id={`line-qty-${index}`}
                      min="1"
                      onChange={(event) => updateItem(index, "quantity", event.target.value)}
                      step="1"
                      type="number"
                      value={item.quantity}
                    />
                    {errors[`items.${index}.quantity`] ? (
                      <p className="mt-1 text-xs text-rose-600">{errors[`items.${index}.quantity`]}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600" htmlFor={`line-price-${index}`}>
                      {t("form.unitPrice")}
                    </label>
                    <input
                      aria-invalid={Boolean(errors[`items.${index}.unitPrice`])}
                      className={`mt-2 min-h-11 w-full rounded-lg border px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${alignEnd} ${
                        errors[`items.${index}.unitPrice`] ? "border-rose-400" : "border-slate-300"
                      }`}
                      id={`line-price-${index}`}
                      min="0"
                      onChange={(event) => updateItem(index, "unitPrice", event.target.value)}
                      step="0.01"
                      type="number"
                      value={item.unitPrice}
                    />
                    {errors[`items.${index}.unitPrice`] ? (
                      <p className="mt-1 text-xs text-rose-600">{errors[`items.${index}.unitPrice`]}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-500">{t("form.total")}</span>
                  <span className="font-mono text-sm font-semibold text-slate-950">{total.toFixed(2)}</span>
                </div>
                <button
                  className="min-h-11 w-full rounded-lg border border-rose-200 px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={items.length === 1}
                  onClick={() => removeItem(index)}
                  type="button"
                >
                  {t("form.removeItem")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
