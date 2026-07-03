import { Document } from "@langchain/core/documents";
import Invoice from "../../models/Invoice.js";
import PaymentTransaction from "../../models/PaymentTransaction.js";
import { getVectorStore } from "./vector.js";

const INVOICE_VECTOR_PREFIX = "invoice_";
const PAYMENT_VECTOR_PREFIX = "payment_";

const getAccountantId = (record) =>
  record.accountantId?._id ?? record.accountantId;

const buildInvoicePageContent = (invoice) => {
  const status = invoice.isCancelled ? "Cancelled" : "Active";
  const cancellationDetails = invoice.isCancelled
    ? `
      Cancelled At: ${invoice.cancelledAt ? new Date(invoice.cancelledAt).toLocaleDateString() : "N/A"}
      Cancellation Reason: ${invoice.cancellationReason || "None"}`
    : "";

  return `
      Status: ${status}
      Invoice Number: ${invoice.invoiceNumber}
      Invoice Type: ${invoice.invoiceType}

      Client Name: ${invoice.clientId?.name || "N/A"}
      Client Phone: ${invoice.clientId?.phone || "N/A"}

      Base Amount: ${invoice.baseAmount}
      Final Amount: ${invoice.finalAmount}
      Amount Paid: ${invoice.amountPaid}
      Due Amount: ${invoice.dueAmount}

      Payment Method: ${invoice.paymentMethod}
      Payment Status: ${invoice.dueAmount <= 0 ? "paid" : invoice.amountPaid > 0 ? "partial" : "unpaid"}
      ${cancellationDetails}

      Items:
      ${(invoice.items || [])
        .map(
          (item) =>
            `- ${item.description}
            Qty: ${item.quantity}
            Unit Price: ${item.unitPrice}
            Total: ${item.totalPrice}`,
        )
        .join("\n")}
      `;
};

const buildPaymentPageContent = (pt) => `
      Transaction Type: Payment
      Direction: ${pt.direction === "in" ? "Incoming" : "Outgoing"}
      Amount: ${pt.amount}
      Payment Method: ${pt.paymentMethod}
      Source: ${pt.source}

      Client Name: ${pt.clientId?.name || "N/A"}
      Invoice Number: ${pt.invoiceId?.invoiceNumber || "N/A"}

      Date: ${pt.createdAt ? new Date(pt.createdAt).toLocaleDateString() : "N/A"}
      Notes: ${pt.notes || "None"}
      `;

export async function upsertInvoiceToVector(invoice) {
  const accountantId = getAccountantId(invoice);
  const vectorStore = await getVectorStore(accountantId);
  const invoiceId = invoice._id.toString();

  await vectorStore.addDocuments(
    [
      new Document({
        pageContent: buildInvoicePageContent(invoice),
        metadata: {
          type: "invoice",
          invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          isCancelled: Boolean(invoice.isCancelled),
        },
      }),
    ],
    { ids: [`${INVOICE_VECTOR_PREFIX}${invoiceId}`] },
  );

  return invoiceId;
}

export async function upsertPaymentTransactionToVector(pt) {
  const accountantId = getAccountantId(pt);
  const vectorStore = await getVectorStore(accountantId);
  const transactionId = pt._id.toString();

  await vectorStore.addDocuments(
    [
      new Document({
        pageContent: buildPaymentPageContent(pt),
        metadata: {
          type: "payment_transaction",
          transactionId,
          invoiceId:
            pt.invoiceId?._id?.toString() ?? pt.invoiceId?.toString() ?? "",
          clientId:
            pt.clientId?._id?.toString() ?? pt.clientId?.toString() ?? "",
          source: pt.source,
        },
      }),
    ],
    { ids: [`${PAYMENT_VECTOR_PREFIX}${transactionId}`] },
  );

  return transactionId;
}

export async function syncInvoiceById(invoiceId, accountantId) {
  const invoice = await Invoice.findOne({ _id: invoiceId, accountantId })
    .populate("clientId", "name phone")
    .populate("accountantId", "name email");

  if (!invoice) return null;

  await upsertInvoiceToVector(invoice);
  return invoice;
}

export async function syncPaymentById(paymentId, accountantId) {
  const payment = await PaymentTransaction.findOne({
    _id: paymentId,
    accountantId,
  })
    .populate("clientId", "name phone")
    .populate("invoiceId", "invoiceNumber")
    .populate("accountantId", "name email");

  if (!payment) return null;

  await upsertPaymentTransactionToVector(payment);
  return payment;
}

export async function syncPaymentsForInvoice(invoiceId, accountantId) {
  const payments = await PaymentTransaction.find({ invoiceId, accountantId })
    .populate("clientId", "name phone")
    .populate("invoiceId", "invoiceNumber")
    .populate("accountantId", "name email");

  for (const payment of payments) {
    await upsertPaymentTransactionToVector(payment);
  }

  return payments.length;
}

export async function syncInvoiceWithPayments(invoiceId, accountantId) {
  await syncInvoiceById(invoiceId, accountantId);
  await syncPaymentsForInvoice(invoiceId, accountantId);
}

export async function safeSyncInvoiceWithPayments(invoiceId, accountantId) {
  try {
    await syncInvoiceWithPayments(invoiceId, accountantId);
  } catch (err) {
    console.error("Pinecone invoice sync failed:", err.message);
  }
}

export async function safeSyncPaymentAndInvoice(
  paymentId,
  invoiceId,
  accountantId,
) {
  try {
    await syncPaymentById(paymentId, accountantId);
    await syncInvoiceById(invoiceId, accountantId);
  } catch (err) {
    console.error("Pinecone payment sync failed:", err.message);
  }
}

// Backward-compatible aliases
export const addInvoiceToVector = upsertInvoiceToVector;
export const addPaymentTransactionToVector = upsertPaymentTransactionToVector;
