# Invoice Implementation Plan

Version: 1.0

---

# Module Goal

Implement the Invoice module for the SaaS Accounting Platform frontend.

This module must integrate directly with the existing backend.

The English invoice design is the single source of truth for UI implementation.

Arabic support must be implemented manually.

---

# Design Source

Use only:

design/finora_invoices_list_english

design/finora_create_invoice_english

design/finora_invoice_details_english

design/finora_invoices_ux_modals_gallery

Do NOT rely on Arabic screenshots.

Do NOT redesign.

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

---

# Invoice Types

sale

purchase

sales_return

purchase_return

expense

---

# Backend Rules

For:

sale

purchase

sales_return

purchase_return

Required:

clientId

items[]

Each item contains:

description

quantity

unitPrice

totalPrice

Expense invoices use:

expenseName

expenseType

expenseDescription

expenseOtherNotes

Never invent payload fields.

Always follow backend validation.

---

# Phase 1

## Goal

Invoice List Page

---

## Files

src/components/invoices/useLang.js

src/components/invoices/StatusBadge.js

src/components/invoices/InvoiceTypeBadge.js

src/components/invoices/StatCards.js

src/components/invoices/FiltersBar.js

src/components/invoices/InvoiceTable.js

src/components/invoices/Pagination.js

src/components/invoices/SkeletonRow.js

src/components/invoices/EmptyState.js

src/components/invoices/ErrorState.js

src/app/invoices/page.js

---

## APIs

GET /api/invoices

---

## Features

Invoice statistics

Invoice table

Pagination

Client-side search

Filters

Status badges

Loading state

Empty state

Error state

Responsive design

RTL/LTR

---

## Acceptance Criteria

The page loads successfully.

Invoices are fetched from backend.

Pagination works.

Filters work.

Client-side search works.

No fake data.

No fake endpoints.

Design closely matches the English reference.

---

# Phase 2

## Goal

Create Invoice

---

## Files

src/components/invoices/ClientSearch.js

src/components/invoices/InvoiceTypeSelector.js

src/components/invoices/LineItemsEditor.js

src/components/invoices/SummaryPanel.js

src/components/invoices/InvoiceForm.js

src/app/invoices/new/page.js

---

## APIs

GET /api/clients

POST /api/invoices

---

## Features

Invoice type selector

Client selector

Dynamic line items

Expense mode

Tax preview

Totals preview

Validation

Responsive layout

RTL/LTR

---

## Acceptance Criteria

Every invoice type can be created.

Validation follows backend rules.

Payload matches backend exactly.

---

# Phase 3

## Goal

Invoice Details

---

## Files

src/components/invoices/InvoiceHeader.js

src/components/invoices/InvoiceSummary.js

src/components/invoices/InvoiceItemsTable.js

src/components/invoices/PaymentTimeline.js

src/components/invoices/CancelModal.js

src/components/invoices/ReturnModal.js

src/components/invoices/PaymentModal.js

src/app/invoices/[id]/page.js

---

## APIs

GET /api/invoices/:id

POST /api/invoices/:id/cancel

POST /api/payments

---

## Features

Invoice details

Items table

Payment history

Cancel invoice

Return invoice

Record payment (if backend supports it)

---

## Acceptance Criteria

Invoice details render correctly.

Cancel action works.

Return action works.

Payment history displays if available.

---

# Phase 4

## Goal

Final Polish

---

## Tasks

Responsive improvements

RTL review

LTR review

Accessibility review

Performance review

Loading review

Error review

Code cleanup

Build verification

---

## Acceptance Criteria

No TypeScript/ESLint errors.

No console errors.

Responsive on desktop/tablet/mobile.

RTL verified.

LTR verified.

Accessibility verified.

Ready for production.

---

# Review Checklist

Before every phase:

Read:

AI_DEVELOPMENT_RULES.md

INVOICE_IMPLEMENTATION_PROGRESS.md

AI_HANDOFF.md

.claude/skills/ui-ux-pro-max/SKILL.md

Review backend contracts.

Review design source.

Do not write code until the review is complete.

Wait for approval before implementation.
