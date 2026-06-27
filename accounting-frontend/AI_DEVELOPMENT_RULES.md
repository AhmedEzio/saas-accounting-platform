# AI Development Rules

Version: 1.0

---

# Project Overview

This project is the Product Frontend of a SaaS Accounting Platform.

Frontend Stack:

* Next.js 16
* App Router
* JavaScript
* Tailwind CSS

Backend:

* Node.js
* Express.js
* MongoDB
* JWT Authentication

The backend already exists.

The AI must NEVER redesign backend contracts.

The frontend must always adapt to the backend.

---

# General Workflow

Every task MUST follow this workflow.

Step 1

Read:

* AI_DEVELOPMENT_RULES.md
* Module Implementation Plan
* Module Progress
* AI_HANDOFF.md (if exists)

Step 2

Read the backend related to the current module.

Example:

Invoice Module:

* routes
* controller
* service
* validation
* model

Never assume request or response payloads.

Step 3

Read the existing frontend structure.

Reuse existing:

* API service
* AuthContext
* Utilities
* Components

Never duplicate existing logic.

Step 4

Read the design source.

Always use the English design as the source of truth.

Arabic screenshots are reference only.

Step 5

Read the UI/UX Skill.

Required:

.claude/skills/ui-ux-pro-max/SKILL.md

Apply its recommendations during planning and implementation.

---

# UI Rules

Always match the supplied design as closely as possible.

Do NOT redesign.

Do NOT invent another design language.

Do NOT replace the supplied layout with Material Design or another dashboard style.

Spacing

Typography

Component hierarchy

Tables

Forms

Badges

Buttons

Cards

must visually follow the supplied English design.

---

# Responsive Rules

Desktop first.

Tablet supported.

Mobile supported.

Never create horizontal page scrolling.

Use responsive Tailwind utilities.

---

# RTL / LTR

English

LTR

Arabic

RTL

Never rely on translated screenshots.

Use manually written Arabic.

Never use machine-translated wording.

---

# Translation

Every module should use a local translation dictionary.

Example:

src/locales/invoices.js

Avoid external i18n libraries unless the project already contains one.

---

# Backend Rules

Never modify backend code.

Never change API contracts.

Never rename payload properties.

Never invent endpoints.

Never fake response structures.

Always inspect backend code before implementation.

---

# Existing Project Rules

Reuse:

* AuthContext
* services/api.js
* Existing utilities
* Existing hooks

Never duplicate code.

---

# Layout Rules

Unless explicitly requested:

Do NOT create:

* Navbar
* Sidebar
* Footer
* Root Layout
* Dashboard Shell

Only build the requested module.

---

# Component Rules

Prefer:

Small reusable components.

Avoid:

Large monolithic pages.

Each component should have a single responsibility.

---

# Accessibility

Always include:

Visible labels

Keyboard navigation

Focus states

Proper button types

Semantic HTML

---

# Loading States

Every data request must have:

Loading

Empty

Error

Success

---

# Git Rules

Work in small phases.

Never implement multiple phases together.

After every completed phase:

Summarize:

Files created

Files modified

How to test

Known issues

Update:

Module Progress

AI_HANDOFF.md

---

# Review Rules

Before writing code:

Review

Project structure

Backend contracts

Current phase

Existing components

After writing code:

Review

Imports

Unused code

Accessibility

Responsive behavior

RTL

LTR

API integration

---

# Skills

Always read:

.claude/skills/ui-ux-pro-max/SKILL.md

Use the skill for:

Planning

UI Review

Accessibility

Responsive Design

Spacing

Forms

Tables

Cards

Badges

Do not ignore the skill.

---

# Forbidden

Never:

Redesign the project

Change backend

Break authentication

Duplicate API clients

Create fake endpoints

Create fake data

Modify unrelated modules

Skip phases

Start another phase without approval

---

# Expected Output

After every phase return:

Completed files

Modified files

Testing instructions

Known issues

Next recommended step

Wait for approval before continuing.
