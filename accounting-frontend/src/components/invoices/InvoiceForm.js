"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { invoicesApi } from "@/services/invoices";
import ClientSearch from "./ClientSearch";
import InvoiceTypeSelector from "./InvoiceTypeSelector";
import LineItemsEditor, { createEmptyLineItem } from "./LineItemsEditor";
import SummaryPanel from "./SummaryPanel";
import useLang from "./useLang";

const expenseTypes = [
  "rent",
  "salary",
  "electricity",
  "internet",
  "transportation",
  "maintenance",
  "marketing",
  "office_supplies",
  "other",
];

const initialForm = {
  invoiceType: "sale",
  client: null,
  paymentMethod: "cash",
  items: [createEmptyLineItem()],
  expenseName: "",
  expenseType: "rent",
  expenseDescription: "",
  expenseOtherNotes: "",
  baseAmount: "",
  taxPercentage: "0",
  amountPaid: "0",
  notes: "",
};

function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function getClientType(invoiceType) {
  return invoiceType === "purchase" ? "vendor" : "client";
}

function calculateTotals(form) {
  const baseAmount =
    form.invoiceType === "expense"
      ? round2(form.baseAmount)
      : form.items.reduce(
          (sum, item) =>
            round2(sum + Number(item.quantity || 0) * Number(item.unitPrice || 0)),
          0
        );
  const taxPercentage = round2(form.taxPercentage);
  const taxAmount = round2((baseAmount * taxPercentage) / 100);
  const finalAmount = round2(baseAmount + taxAmount);
  const amountPaid = round2(form.amountPaid);

  return {
    baseAmount,
    taxAmount,
    finalAmount,
    amountPaid,
    dueAmount: amountPaid < finalAmount ? round2(finalAmount - amountPaid) : 0,
  };
}

export default function InvoiceForm() {
  const router = useRouter();
  const { dir, isRtl, lang, setLang, t } = useLang();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isExpense = form.invoiceType === "expense";
  const clientType = getClientType(form.invoiceType);
  const totals = useMemo(() => calculateTotals(form), [form]);

  const updateForm = (updates) => {
    setForm((current) => ({ ...current, ...updates }));
    setErrors((current) => {
      const next = { ...current };
      Object.keys(updates).forEach((key) => delete next[key]);
      return next;
    });
  };

  const changeType = (invoiceType) => {
    setForm((current) => ({
      ...current,
      invoiceType,
      client: invoiceType === "expense" ? null : current.client,
      items: invoiceType === "expense" ? current.items : current.items.length ? current.items : [createEmptyLineItem()],
    }));
    setErrors({});
    setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.paymentMethod) nextErrors.paymentMethod = t("error.required");
    if (Number(form.taxPercentage) < 0 || Number(form.taxPercentage) > 100) {
      nextErrors.taxPercentage = t("error.taxRange");
    }
    if (Number(form.amountPaid) < 0) nextErrors.amountPaid = t("error.nonNegative");
    if (form.notes.length > 500) nextErrors.notes = t("error.max500");

    if (isExpense) {
      if (!form.expenseName.trim()) nextErrors.expenseName = t("error.required");
      if (!form.expenseType) nextErrors.expenseType = t("error.required");
      if (form.expenseType === "other" && !form.expenseOtherNotes.trim()) {
        nextErrors.expenseOtherNotes = t("error.required");
      }
      if (Number(form.baseAmount) <= 0) nextErrors.baseAmount = t("error.amountPositive");
    } else {
      if (!form.client?._id) nextErrors.clientId = t("error.required");

      form.items.forEach((item, index) => {
        if (!item.description.trim()) {
          nextErrors[`items.${index}.description`] = t("error.required");
        }
        if (Number(item.quantity) < 1) {
          nextErrors[`items.${index}.quantity`] = t("error.quantityMin");
        }
        if (Number(item.unitPrice) < 0) {
          nextErrors[`items.${index}.unitPrice`] = t("error.nonNegative");
        }
      });
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => {
    const common = {
      invoiceType: form.invoiceType,
      paymentMethod: form.paymentMethod,
      taxPercentage: Number(form.taxPercentage || 0),
      amountPaid: Number(form.amountPaid || 0),
      notes: form.notes.trim() || null,
    };

    if (isExpense) {
      return {
        ...common,
        expenseName: form.expenseName.trim(),
        expenseType: form.expenseType,
        expenseDescription: form.expenseDescription.trim() || null,
        expenseOtherNotes: form.expenseOtherNotes.trim() || null,
        baseAmount: Number(form.baseAmount),
      };
    }

    return {
      ...common,
      clientId: form.client._id,
      items: form.items.map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      await invoicesApi.create(buildPayload());
      router.push("/invoices");
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (Array.isArray(apiErrors)) {
        setSubmitError(apiErrors.map((item) => item.message).join(" "));
      } else {
        setSubmitError(err?.response?.data?.message || err?.message || t("error.submitFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[#faf8fe] px-4 py-6 text-slate-950 sm:px-6 lg:px-8" dir={dir}>
      <form className="mx-auto flex max-w-[1440px] flex-col gap-6" onSubmit={handleSubmit}>
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link className="text-sm font-medium text-slate-500 hover:text-[#001540]" href="/invoices">
              {t("action.back")}
            </Link>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-950">{t("page.createInvoice")}</h1>
              <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {t("form.ready")}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              aria-label={lang === "ar" ? "Switch to English" : "Switch to Arabic"}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#001540]/20"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              type="button"
            >
              {lang === "ar" ? "EN" : "AR"}
            </button>
            <Link
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#001540]/20"
              href="/invoices"
            >
              {t("action.cancel")}
            </Link>
          </div>
        </header>

        {submitError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {submitError}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <InvoiceTypeSelector onChange={changeType} t={t} value={form.invoiceType} />
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-slate-950">{t("form.invoiceDetails")}</h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {!isExpense ? (
                  <div className="md:col-span-2">
                    <ClientSearch
                      clientType={clientType}
                      error={errors.clientId}
                      label={clientType === "vendor" ? t("details.vendor") : t("details.client")}
                      onSelect={(client) => updateForm({ client })}
                      selectedClient={form.client}
                      t={t}
                    />
                  </div>
                ) : null}

                {isExpense ? (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-600" htmlFor="expenseName">
                        {t("form.expenseName")}
                      </label>
                      <input
                        className={`min-h-11 w-full rounded-lg border px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${
                          errors.expenseName ? "border-rose-400" : "border-slate-300"
                        }`}
                        id="expenseName"
                        onChange={(event) => updateForm({ expenseName: event.target.value })}
                        value={form.expenseName}
                      />
                      {errors.expenseName ? <p className="text-xs text-rose-600">{errors.expenseName}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-600" htmlFor="expenseType">
                        {t("form.expenseType")}
                      </label>
                      <select
                        className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20"
                        id="expenseType"
                        onChange={(event) => updateForm({ expenseType: event.target.value })}
                        value={form.expenseType}
                      >
                        {expenseTypes.map((type) => (
                          <option key={type} value={type}>
                            {t(`expense.${type}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-600" htmlFor="baseAmount">
                        {t("form.baseAmount")}
                      </label>
                      <input
                        className={`min-h-11 w-full rounded-lg border px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${
                          errors.baseAmount ? "border-rose-400" : "border-slate-300"
                        }`}
                        id="baseAmount"
                        min="0.01"
                        onChange={(event) => updateForm({ baseAmount: event.target.value })}
                        step="0.01"
                        type="number"
                        value={form.baseAmount}
                      />
                      {errors.baseAmount ? <p className="text-xs text-rose-600">{errors.baseAmount}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-600" htmlFor="expenseOtherNotes">
                        {t("form.expenseNotes")}
                      </label>
                      <input
                        className={`min-h-11 w-full rounded-lg border px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${
                          errors.expenseOtherNotes ? "border-rose-400" : "border-slate-300"
                        }`}
                        id="expenseOtherNotes"
                        onChange={(event) => updateForm({ expenseOtherNotes: event.target.value })}
                        value={form.expenseOtherNotes}
                      />
                      {errors.expenseOtherNotes ? (
                        <p className="text-xs text-rose-600">{errors.expenseOtherNotes}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-medium text-slate-600" htmlFor="expenseDescription">
                        {t("form.expenseDesc")}
                      </label>
                      <textarea
                        className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20"
                        id="expenseDescription"
                        onChange={(event) => updateForm({ expenseDescription: event.target.value })}
                        value={form.expenseDescription}
                      />
                    </div>
                  </>
                ) : null}

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600" htmlFor="notes">
                    {t("form.notes")}
                  </label>
                  <textarea
                    className={`min-h-24 w-full rounded-lg border px-3 py-2 text-sm text-slate-950 focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${
                      errors.notes ? "border-rose-400" : "border-slate-300"
                    }`}
                    id="notes"
                    onChange={(event) => updateForm({ notes: event.target.value })}
                    value={form.notes}
                  />
                  {errors.notes ? <p className="text-xs text-rose-600">{errors.notes}</p> : null}
                </div>
              </div>
            </section>

            {!isExpense ? (
              <LineItemsEditor
                errors={errors}
                isRtl={isRtl}
                items={form.items}
                onChange={(items) => updateForm({ items })}
                t={t}
              />
            ) : null}
          </div>

          <SummaryPanel
            amountPaid={form.amountPaid}
            errors={errors}
            isRtl={isRtl}
            onChange={updateForm}
            paymentMethod={form.paymentMethod}
            submitting={submitting}
            taxPercentage={form.taxPercentage}
            t={t}
            totals={totals}
          />
        </div>
      </form>
    </main>
  );
}
