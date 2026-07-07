# Development Rules

- Do not remove or rewrite existing AI code.
- Do not remove chat, tools, RAG, Pinecone, Gemini, or LangChain files.
- Do not change invoice/payment/client business logic.
- Do not add ERP/POS/Inventory concepts.
- Keep accountantId/user ownership.
- Backend and frontend must be developed separately.
- Admin subscription UI is NOT part of Next.js frontend.
- Admin subscription UI will be implemented later in Angular Dashboard.
- Next.js frontend is only for accountant/user subscription page.
- Stripe is the payment source of truth.
- Do not edit Stripe prices directly in DB as real payment prices.
- If plan price changes, use a new Stripe Price ID.
- Deleting plans must be soft delete using isActive=false.