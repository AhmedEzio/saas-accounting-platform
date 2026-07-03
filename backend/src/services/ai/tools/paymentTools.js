import { z } from "zod";
import { tool } from "langchain";
import { createPayment, getPayments } from "../../payment.service.js";
import Client from "../../../models/Client.js";
import Invoice from "../../../models/Invoice.js";

export const createPaymentTool = tool(
  async ({ invoiceNumber, amount, paymentMethod, notes }, config) => {
    try {
      const { userId } = config.context;

      const invoice = await Invoice.findOne({
        accountantId: userId,
        invoiceNumber,
        isCancelled: false,
      });
      console.log(userId);
      console.log(invoice);

      if (!invoice) {
        return `Invoice "${invoiceNumber}" not found or is cancelled.`;
      }

      if (invoice.dueAmount <= 0) {
        return `Invoice "${invoiceNumber}" is already fully paid.`;
      }

      const { invoice: updatedInvoice, paymentTransaction } =
        await createPayment(
          { invoiceId: invoice._id, amount, paymentMethod, notes },
          userId,
          userId,
        );

      return JSON.stringify({
        success: true,
        message: `Payment of ${amount} recorded successfully for invoice ${updatedInvoice.invoiceNumber}. Due amount remaining: ${updatedInvoice.dueAmount}`,
        data: {
          invoiceNumber: updatedInvoice.invoiceNumber,
          amountPaid: updatedInvoice.amountPaid,
          dueAmount: updatedInvoice.dueAmount,
          paymentTransaction: paymentTransaction,
        },
      });
    } catch (err) {
      return JSON.stringify({ success: false, message: err.message });
    }
  },
  {
    name: "record_payment",
    description:
      "Record a manual payment for an existing invoice. Use this when the user says they want to pay, settle, or record a payment for an invoice. Ask for the invoice number, amount, and payment method before calling.",
    schema: z.object({
      invoiceNumber: z
        .string()
        .describe("The human-readable invoice number, e.g. SAL-2025-000001"),
      amount: z.number().positive().describe("Amount to pay"),
      paymentMethod: z
        .enum(["cash", "card", "wallet", "bank_transfer"])
        .describe("Payment method"),
      notes: z
        .string()
        .optional()
        .describe("Optional notes to attach to this payment"),
    }),
  },
);

export const getPaymentsTool = tool(
  async ({ invoiceId, clientId, source }, config) => {
    try {
      const { userId } = config.context;

      const query = {};
      if (invoiceId) query.invoiceId = invoiceId;
      if (clientId) query.clientId = clientId;
      if (source) query.source = source;

      const result = await getPayments(query, userId);

      if (!result.payments.length) {
        return "No payment transactions found matching the given filters.";
      }

      const summary = result.payments.map((p) => ({
        amount: p.amount,
        direction: p.direction,
        source: p.source,
        paymentMethod: p.paymentMethod,
        invoice: p.invoiceId?.invoiceNumber ?? "N/A",
        client: p.clientId?.name ?? "N/A",
        date: p.createdAt,
        notes: p.notes ?? null,
      }));

      return JSON.stringify({
        success: true,
        total: result.total,
        page: result.page,
        pages: result.pages,
        payments: summary,
      });
    } catch (err) {
      return JSON.stringify({ success: false, message: err.message });
    }
  },
  {
    name: "get_payments",
    description:
      "Retrieve payment transactions for the user. Can be filtered by invoiceId, clientId, source, date range, etc. Use when the user asks about payment history or transaction records.",
    schema: z.object({
      invoiceId: z
        .string()
        .optional()
        .describe("Filter by a specific invoice ID"),
      clientId: z
        .string()
        .optional()
        .describe("Filter by a specific client/vendor ID"),
      source: z
        .enum([
          "invoice_creation",
          "manual_payment",
          "refund",
          "cancellation_reversal",
        ])
        .optional()
        .describe("Filter by payment source type"),
      from: z
        .string()
        .optional()
        .describe("Start date filter (ISO 8601 format)"),
      to: z.string().optional().describe("End date filter (ISO 8601 format)"),
      page: z.number().optional().describe("Page number (default: 1)"),
      limit: z.number().optional().describe("Results per page (default: 20)"),
    }),
  },
);
