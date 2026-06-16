export const createInvoiceTool = (context) =>
  tool(
    async () => {
      const extracted = await extractInvoiceFromFile(context.file);

      // 2. Upload file
      const uploadedFile = await uploadBufferToCloud({
        buffer: context.file.buffer,
        originalName: context.file.originalname,
      });

      // 3. Resolve client if needed
      let clientId = null;

      if (extracted.invoiceType !== "expense" && extracted.clientName) {
        const client = await Client.findOne({
          accountantId: context.userId,
          name: new RegExp(`^${extracted.clientName.trim()}$`, "i"),
          isActive: true,
        });

        if (client) {
          clientId = client._id;
        }
      }

      // 4. Build invoice payload
      const payload = {
        invoiceType: extracted.invoiceType || "purchase",
        paymentMethod: extracted.paymentMethod || "cash",
        amountPaid: extracted.amountPaid || 0,
        taxPercentage: extracted.taxPercentage || 0,
        notes: extracted.notes || "",
      };

      if (payload.invoiceType === "expense") {
        payload.expenseName = extracted.expenseName || "Uploaded Expense";

        payload.expenseType = extracted.expenseType || "other";

        payload.baseAmount = extracted.baseAmount || 0;
      } else {
        if (!clientId) {
          throw new Error(`Client "${extracted.clientName}" not found`);
        }

        payload.clientId = clientId;
        payload.items = extracted.items || [];
      }

      // 5. Create invoice
      const invoice = await invoiceService.createInvoice(
        payload,
        context.userId,
        context.userId,
      );

      // 6. Create document record
      const document = await InvoiceDocument.create({
        accountantId: context.userId,
        invoiceId: invoice._id,
        fileName: uploadedFile.fileName,
        fileType: uploadedFile.fileType,
        fileUrl: uploadedFile.fileUrl,
        publicId: uploadedFile.publicId,
        ocrText: extracted.ocrText || "",
        uploadedBy: context.userId,
      });

      invoice.documentId = document._id;
      await invoice.save();

      // 7. Index
      await indexInvoice(invoice, context.userId);
      await indexInvoiceDocument(document, context.userId);

      return {
        success: true,
        invoiceId: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        documentId: document._id.toString(),
      };
    },
    {
      name: "create_invoice_from_file",
      description:
        "Extract invoice data from uploaded file and save it into database.",
      schema: z.object({}),
    },
  );
