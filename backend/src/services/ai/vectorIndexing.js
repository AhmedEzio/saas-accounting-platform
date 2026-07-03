import { Document } from "@langchain/core/documents";
import { getVectorStore } from "./vector.js";

export async function addInvoiceToVector(invoice) {
  const vectorStore = await getVectorStore(
    invoice.accountantId._id ?? invoice.accountantId,
  );
  const invoiceId = invoice._id.toString();

  await vectorStore.addDocuments([
    new Document({
      pageContent: `
      Invoice Number: ${invoice.invoiceNumber}
      Invoice Type: ${invoice.invoiceType}

      Client Name: ${invoice.clientId?.name || "N/A"}
      Client Phone: ${invoice.clientId?.phone || "N/A"}

      Base Amount: ${invoice.baseAmount}
      Final Amount: ${invoice.finalAmount}
      Amount Paid: ${invoice.amountPaid}
      Due Amount: ${invoice.dueAmount}

      Payment Method: ${invoice.paymentMethod}

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
      `,
      metadata: {
        type: "invoice",
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
      },
    }),
  ]);

  return invoiceId;
}

export async function addPaymentTransactionToVector(pt) {
  const vectorStore = await getVectorStore(
    pt.accountantId._id ?? pt.accountantId,
  );
  const transactionId = pt._id.toString();

  await vectorStore.addDocuments([
    new Document({
      pageContent: `
      Transaction Type: Payment
      Direction: ${pt.direction === "in" ? "Incoming" : "Outgoing"}
      Amount: ${pt.amount}
      Payment Method: ${pt.paymentMethod}
      Source: ${pt.source}

      Client Name: ${pt.clientId?.name || "N/A"}
      Invoice Number: ${pt.invoiceId?.invoiceNumber || "N/A"}

      Date: ${pt.createdAt ? new Date(pt.createdAt).toLocaleDateString() : "N/A"}
      Notes: ${pt.notes || "None"}
      `,
      metadata: {
        type: "payment_transaction",
        transactionId,
        invoiceId:
          pt.invoiceId?._id?.toString() ?? pt.invoiceId?.toString() ?? "",
        clientId: pt.clientId?._id?.toString() ?? pt.clientId?.toString() ?? "",
      },
    }),
  ]);

  return transactionId;
}
