# AI Handoff

Version: 1.0

---

# Purpose

This document is the handoff note between AI sessions.

Every AI must update this file before ending its work.

This file represents the current development state.

---

# Current Module

Invoice

---

# Current Phase

Phase 3B — Actions and Modals

Status

Completed

---

# Completed Work

### Backend Integration

Completed

* src/services/invoices.js

Verified against backend.

---

### Localization

Completed

* src/locales/invoices.js

English

Arabic

Manual translations.

Production Ready.

---

### Invoice List Page

Completed

* src/components/invoices/useLang.js
* src/components/invoices/StatusBadge.js
* src/components/invoices/InvoiceTypeBadge.js
* src/components/invoices/StatCards.js
* src/components/invoices/FiltersBar.js
* src/components/invoices/InvoiceTable.js
* src/components/invoices/Pagination.js
* src/components/invoices/SkeletonRow.js
* src/components/invoices/EmptyState.js
* src/components/invoices/ErrorState.js
* src/app/invoices/page.js

Features

* Fetches GET /api/invoices through src/services/invoices.js.
* Uses backend pagination and backend-supported filters.
* Implements client-side search on the loaded invoice page.
* Includes loading, empty, error, stats, table, filters, pagination, and RTL/LTR support.

Verification

* npm run build passed.
* /invoices appears in the Next.js route list.
* PowerShell printed an npm wrapper access warning before build, but the build completed successfully.

---

### Create Invoice Page

Completed

* src/components/invoices/ClientSearch.js
* src/components/invoices/InvoiceTypeSelector.js
* src/components/invoices/LineItemsEditor.js
* src/components/invoices/SummaryPanel.js
* src/components/invoices/InvoiceForm.js
* src/app/invoices/new/page.js
* src/locales/invoices.js updated with Phase 2 form labels and errors

Features

* Fetches clients/vendors with GET /api/clients through src/services/invoices.js.
* Creates invoices with POST /api/invoices through src/services/invoices.js.
* Supports sale, purchase, sales_return, purchase_return, and expense.
* Uses a simple relatedInvoiceId input for return invoices.
* Uses quantity >= 1 validation to match the current backend model.
* Redirects to /invoices after successful creation.
* Does not send unsupported backend fields such as discount, dueDate, draft save, proforma, stripe, paypal, or recurring invoice.
* Includes RTL/LTR support.

Verification

* npm run build passed.
* /invoices/new appears in the Next.js route list.
* PowerShell printed an npm wrapper access warning before build, but the build completed successfully.

---

### Invoice Details Read-Only

Completed

* src/components/invoices/InvoiceHeader.js
* src/components/invoices/InvoiceSummary.js
* src/components/invoices/InvoiceItemsTable.js
* src/components/invoices/PaymentTimeline.js
* src/app/invoices/[id]/page.js
* src/locales/invoices.js updated with Phase 3A payment history fallback label

Features

* Fetches invoice details with GET /api/invoices/:id through src/services/invoices.js.
* Fetches payment history with GET /api/payments?invoiceId=:id through src/services/invoices.js.
* Loads invoice details and payment history concurrently with Promise.all().
* Payment history failure does not crash the page; the timeline shows a graceful fallback.
* Renders loading, invoice error, and empty payment states.
* Hides download, print, share, cancel, payment, and return actions.
* Includes RTL/LTR support and responsive layout.

Verification

* npm run build passed.
* /invoices/[id] appears in the Next.js route list.
* PowerShell printed an npm wrapper access warning before build, but the build completed successfully.

---

### Invoice Details Actions

Completed

* src/components/invoices/CancelModal.js
* src/components/invoices/PaymentModal.js
* src/components/invoices/ReturnModal.js
* src/app/invoices/[id]/page.js updated with Phase 3B action integration
* src/locales/invoices.js updated with Phase 3B modal labels and errors

Features

* Cancels invoices through POST /api/invoices/:id/cancel with a required 3-500 character reason.
* Hides cancel for cancelled invoices, sales_return invoices, and purchase_return invoices.
* Records payments through POST /api/payments when the invoice is not cancelled and dueAmount > 0.
* Validates payment amount > 0 and amount <= dueAmount before submitting.
* Creates return invoices through POST /api/invoices for sale and purchase invoices only.
* Preloads invoice items for returns, keeps description and unitPrice unchanged, and allows quantity edits only.
* Redirects to /invoices after successful return creation.
* Refreshes invoice details and payment history after successful payment or cancellation without a full page reload.
* Shows inline modal errors and preserves the current page state on failed actions.

Verification

* npm run build passed.
* /invoices/[id] appears in the Next.js route list.
* PowerShell printed the existing npm wrapper access warning before build, but the build completed successfully.

---

# Current Design Source

Primary source:

design/finora_invoices_list_english

Do not use Arabic screenshots as the implementation reference.

---

# Current Files Remaining

Phase 3 is completed.

Phase 4 remains.

---

# Backend APIs

Invoices

GET /api/invoices

GET /api/invoices/:id

POST /api/invoices

POST /api/invoices/:id/cancel

Clients

GET /api/clients

Payments

POST /api/payments

Do not change backend contracts.

---

# UI Rules

Follow the English design as closely as possible.

Do not redesign.

Do not replace the design language.

No Material Dashboard.

No custom redesign.

Pixel-perfect implementation whenever practical.

---

# Translation Rules

English

LTR

Arabic

RTL

Use:

src/locales/invoices.js

Do not use machine translation.

---

# Skills

Required:

.claude/skills/ui-ux-pro-max/SKILL.md

The skill must be read before UI implementation.

Use it for:

* UI review
* spacing
* typography
* forms
* tables
* badges
* accessibility
* responsive behavior
* RTL/LTR validation

---

# Before Writing Code

Every AI must:

1.

Read

AI_DEVELOPMENT_RULES.md

2.

Read

INVOICE_IMPLEMENTATION_PLAN.md

3.

Read

INVOICE_IMPLEMENTATION_PROGRESS.md

4.

Read

AI_HANDOFF.md

5.

Read

.claude/skills/ui-ux-pro-max/SKILL.md

6.

Inspect backend contracts.

7.

Inspect current frontend structure.

8.

Inspect the English design.

9.

Summarize the implementation plan.

10.

Wait for approval.

Only then begin coding.

---

# After Completing Any Phase

Update:

Current Phase

Completed Files

Modified Files

Testing Steps

Known Issues

Remaining Tasks

Next Phase

Then stop and wait for approval.

---

# Current Known Issues

Return invoices currently use a simple relatedInvoiceId text input by Phase 2 scope. Advanced original invoice selection belongs to a later approved phase.

Phase 4 has not started. Do not begin final polish without approval.

---

# Next Task

Wait for approval before starting Phase 4.

---

# Handoff Summary

Project State

Stable

Backend

Stable

Authentication

Completed

Invoice Services

Completed

Invoice Locales

Completed

Current Priority

Phase 3B completed. Do not start Phase 4 without approval.
