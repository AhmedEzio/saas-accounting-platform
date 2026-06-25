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

Phase 1 — Invoice List

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

# Current Design Source

Primary source:

design/finora_invoices_list_english

Do not use Arabic screenshots as the implementation reference.

---

# Current Files Remaining

None for Phase 1.

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

The New Invoice action links to /invoices/new, which belongs to Phase 2 and is not implemented yet.

---

# Next Task

Wait for approval before starting Phase 2.

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

Phase 1 completed. Do not start Phase 2 without approval.
