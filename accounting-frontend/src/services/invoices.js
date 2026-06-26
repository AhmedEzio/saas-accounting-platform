import { api } from './api';

// ─── Invoices ─────────────────────────────────────────────────────────────────
// All params confirmed from backend invoice.service.js + invoice.validation.js

export const invoicesApi = {
  /**
   * GET /api/invoices
   * Accepted query params:
   *   invoiceType       : "purchase" | "sale" | "purchase_return" | "sales_return" | "expense"
   *   paymentStatus     : "paid" | "partial" | "unpaid"
   *   clientId          : MongoDB ObjectId string
   *   paymentMethod     : "cash" | "card" | "wallet" | "bank_transfer"
   *   expenseType       : "rent" | "salary" | "electricity" | "internet" | "transportation"
   *                       "maintenance" | "marketing" | "office_supplies" | "other"
   *   includeCancelled  : "true" | "false"   (default: false — excludes cancelled)
   *   from              : ISO 8601 date string
   *   to                : ISO 8601 date string
   *   page              : integer ≥ 1 (default: 1)
   *   limit             : integer 1–100 (default: 20)
   */
  getAll: (params = {}) =>
    api.get('/invoices', { params }).then((r) => r.data),

  /**
   * GET /api/invoices/:id
   * Returns a fully populated invoice with:
   *   clientId → { name, phone, type, email, address }
   *   createdBy → { name, email }
   *   cancelledBy → { name, email }
   *   relatedInvoiceId → { invoiceNumber, invoiceType }
   *   documentId → { fileName, fileUrl, fileType }
   */
  getById: (id) =>
    api.get(`/invoices/${id}`).then((r) => r.data),

  /**
   * POST /api/invoices
   * Creates any invoice type — sale, purchase, expense, sales_return, purchase_return.
   * Body shape varies by invoiceType — see implementation plan for exact payloads.
   * NOTE: baseAmount must NOT be sent for non-expense types (server rejects it).
   */
  create: (body) =>
    api.post('/invoices', body).then((r) => r.data),

  /**
   * POST /api/invoices/:id/cancel
   * Body: { reason: string }   — required, min 3 chars, max 500 chars
   * Cannot cancel purchase_return or sales_return types.
   * Cannot cancel if active return invoices exist for this invoice.
   */
  cancel: (id, reason) =>
    api.post(`/invoices/${id}/cancel`, { reason }).then((r) => r.data),
};

// ─── Clients ──────────────────────────────────────────────────────────────────

export const clientsApi = {
  /**
   * GET /api/clients
   * Accepted query params:
   *   type   : "client" | "vendor"
   *   search : string — regex on name, email, phone
   */
  getAll: (params = {}) =>
    api.get('/clients', { params }).then((r) => r.data),
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const paymentsApi = {
  /**
   * POST /api/payments
   * Body: { invoiceId, amount, paymentMethod, notes? }
   *   invoiceId     : MongoDB ObjectId string
   *   amount        : float > 0
   *   paymentMethod : "cash" | "card" | "wallet" | "bank_transfer"
   *   notes         : string, max 500 chars (optional)
   */
  create: (body) =>
    api.post('/payments', body).then((r) => r.data),

  /**
   * GET /api/payments
   * Accepted query params: invoiceId, clientId, source, from, to, page, limit
   * Used to fetch payment history for the invoice details timeline.
   */
  getAll: (params = {}) =>
    api.get('/payments', { params }).then((r) => r.data),
};
