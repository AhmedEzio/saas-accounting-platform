# Implementation Plan

Phase 1: Backend only
- Review existing SubscriptionPlan, UserSubscription, AIUsageLog, checkAIUsage.
- Add missing admin subscription plan CRUD.
- Add soft delete for plans.
- Add admin user subscription override.
- Add admin AI usage endpoints.
- Protect AI chat with checkAIUsage.
- Consume credits after successful AI response.
- Test backend endpoints with Postman/Thunder Client.

Phase 2: Frontend only
- Add accountant /subscriptions page.
- Add subscription API helpers.
- Show plans and current subscription.
- Add Stripe checkout redirect.
- Add loading/error states.
- Do not create admin UI in Next.js.

Phase 3: Angular later
- Admin dashboard pages will be implemented in Angular separately.
- Do not include Angular code in this task.