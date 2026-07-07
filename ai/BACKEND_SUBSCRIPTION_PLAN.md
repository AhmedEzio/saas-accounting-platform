# Backend Task: Subscription Plans + User Subscriptions

Work only on backend.

Goal:
Implement SubscriptionPlan and UserSubscription admin APIs while keeping existing Stripe + AI Usage logic.

Required plans:
1. Chat
- aiChat: true
- tools: false
- technicalSupport: false

2. Chat + Tools
- aiChat: true
- clientTools: true
- invoiceTools: true
- paymentTools: true
- ragSearch: true
- technicalSupport: false

3. Chat + Tools + Support
- aiChat: true
- clientTools: true
- invoiceTools: true
- paymentTools: true
- ragSearch: true
- technicalSupport: true

Backend Requirements:

Admin only endpoints:
- GET    /api/admin/subscription-plans
- GET    /api/admin/subscription-plans/:id
- POST   /api/admin/subscription-plans
- PATCH  /api/admin/subscription-plans/:id
- DELETE /api/admin/subscription-plans/:id

Delete must be soft delete:
isActive = false

Accountant/User endpoints:
- GET  /api/subscription-plans
- GET  /api/subscriptions/me
- POST /api/subscriptions/create-checkout-session

Admin user subscription endpoints:
- GET   /api/admin/subscriptions
- GET   /api/admin/users/:userId/subscriptions
- GET   /api/admin/users/:userId/subscription
- PATCH /api/admin/subscriptions/:id
- PATCH /api/admin/users/:userId/subscription-override

Admin usage endpoints:
- GET /api/admin/ai-usage
- GET /api/admin/users/:userId/ai-usage

Admin must see:
- user
- current plan
- subscription status
- creditsUsed
- creditLimit
- creditsRemaining
- currentPeriodStart
- currentPeriodEnd
- usage logs

Accountant must only see:
- own plan
- creditsUsed
- creditLimit
- creditsRemaining
- renewal date

Important Stripe rule:
- Stripe Price is the real payment price.
- stripePriceId must be stored in SubscriptionPlan.
- Do not edit real Stripe prices from MongoDB.
- If price changes, admin must provide a new stripePriceId.

AI protection:
Apply checkAIUsage to AI chat route.
After successful AI response, consume credits and write AIUsageLog.

Do not break existing AI routes or tools.