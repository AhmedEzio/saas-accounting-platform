# Implementation Progress

## Done
- AI module exists from teammate.
- Subscription + Stripe base exists.
- SubscriptionPlan and UserSubscription models exist.
- AIUsageLog and checkAIUsage exist.
- Backend admin subscription plan CRUD implemented.
- Backend admin user subscription management and override endpoints implemented.
- Backend admin AI usage endpoints implemented.
- AI chat route is protected with checkAIUsage.
- Successful AI chat responses consume credits and write AIUsageLog through existing subscription service.
- AI agent now builds allowed tools per request from active subscription feature flags.
- Chat Plan subscriptions can chat and use read-only AI tools.
- Chat + Tools subscriptions can use read-only tools plus enabled write tools.
- User and admin subscription cancellation endpoints now schedule Stripe cancellation at period end when Stripe subscription IDs exist.
- Stripe webhook sync now stores cancel-at-period-end state and period dates, and renewal resets credits against the plan AI credit limit.

## In Progress
- Accountant subscription frontend page.

## Backend Endpoints Added
- GET /api/admin/subscription-plans
- GET /api/admin/subscription-plans/:id
- POST /api/admin/subscription-plans
- PATCH /api/admin/subscription-plans/:id
- DELETE /api/admin/subscription-plans/:id
- GET /api/admin/users/:userId/subscription
- PATCH /api/admin/users/:userId/subscription-override
- GET /api/admin/ai-usage
- GET /api/admin/users/:userId/ai-usage
- PATCH /api/subscriptions/cancel
- PATCH /api/admin/subscriptions/:id/cancel

## Backend Endpoints Completed / Kept
- GET /api/subscription-plans
- GET /api/subscriptions/me
- POST /api/subscriptions/create-checkout-session
- GET /api/admin/subscriptions
- GET /api/admin/users/:userId/subscriptions
- PATCH /api/admin/subscriptions/:id

## Not Included
- Angular admin dashboard UI.
- Technical support feature implementation.
- New AI tools.
- ERP/POS/Inventory.

## Notes
- Technical support is only a feature flag now.
- Actual support module will be implemented later.
- Stripe remains payment source of truth.
- Plan deletion is soft delete using isActive=false.
- Stripe Price ID remains stored on SubscriptionPlan; changing a plan price requires a new stripePriceId.
- No frontend, Angular, or technical support module code was implemented.
- Files changed for AI permissions and subscription cancellation/sync:
  - backend/src/services/ai/agent.js
  - backend/src/services/ai/customLLM.js
  - backend/src/controllers/ai.controller.js
  - backend/src/controllers/subscriptionController.js
  - backend/src/routes/subscription.routes.js
  - backend/src/services/subscription.service.js
  - backend/src/services/stripe.service.js
  - backend/src/models/UserSubscription.js
  - ai/IMPLEMENTATION_PROGRESS.md
- AI tool permission fix summary:
  - aiChat enables read-only tools: get_clients, search_client, search_invoices, get_payments.
  - clientTools enables write tool: create_client.
  - invoiceTools enables write tool: add_invoice.
  - paymentTools enables write tool: record_payment.
  - Disabled write tools are omitted from the LangChain agent entirely.
  - Obvious disabled write requests return an upgrade message without executing a tool or consuming tokens.
- AI token behavior:
  - aiCreditLimit, creditLimit, and creditsUsed are treated as AI token counts.
  - totalTokens is calculated as inputTokens + outputTokens when token usage is available.
  - If token usage is unavailable, successful AI responses fall back to 1 token.
- Stripe cancellation/sync behavior:
  - User cancellation is available at PATCH /api/subscriptions/cancel for the authenticated user's active/trialing subscription.
  - Admin cancellation is available at PATCH /api/admin/subscriptions/:id/cancel for any subscription.
  - Stripe subscriptions are updated with cancel_at_period_end=true when stripeSubscriptionId exists.
  - customer.subscription.updated and customer.subscription.deleted sync status, cancelAtPeriodEnd, cancelledAt, currentPeriodStart, and currentPeriodEnd.
  - invoice.payment_succeeded resets creditsUsed to 0 and refreshes currentPeriodStart/currentPeriodEnd and creditLimit from the current plan.
- Remaining work:
  - Exercise cancellation endpoints with Stripe test subscriptions and webhook fixtures.
  - Add automated tests around feature-gated tool selection and Stripe webhook sync.
