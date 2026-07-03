"use client";

import AppShell from "@/components/AppShell";
import InvoiceForm from "@/components/invoices/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <AppShell activeKey="invoices">
      <InvoiceForm />
    </AppShell>
  );
}
