import { catchError } from "../utils/catchError.js";
import {
  invoiceDocumentBodyValidation,
  invoiceDocumentFileValidation,
} from "../validations/invoiceDocument.validation.js";
import documentModel from "../models/InvoiceDocument.js";
import invoiceModel from "../models/Invoice.js";
import cloudinary from "../config/uploadConfig.js";
import AppError from "../utils/appError.js";

export const createInvoiceDocument = catchError(async (req, res) => {
  const { error, value: inputValues } = invoiceDocumentBodyValidation.validate(
    req.body,
  );

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const { invoiceId, ocrText, uploadedAt } = inputValues;

  const invoice = await invoiceModel.findOne({
  _id: invoiceId,
  accountantId: req.user._id,
});

  /**
   * Find the whether the invoice exist in the database or not
   */

  if (!invoice) {
    throw new AppError(`There is no invoice with this ID ${invoiceId}`, 404);
  }

  if (invoice.documentId) {
    throw new AppError("This invoice already has a document", 400);
  }

  if (!req.cloudInvoice) {
    throw new AppError("Invoice file is required", 400);
  }

  const { error: reqError, value: requestValues } =
    invoiceDocumentFileValidation.validate(req.cloudInvoice);

  if (reqError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: reqError.details.map((detail) => detail.message),
    });
  }

  const { fileName, fileType, fileUrl,publicId  } = requestValues;

const newDocument = await documentModel.create({
  accountantId: req.user._id,
  invoiceId,
  fileName,
  fileType,
  fileUrl,
  publicId,
  ocrText,
  uploadedAt,
  uploadedBy: req.user._id,
});
  invoice.documentId = newDocument._id;
  await invoice.save();

  res.status(201).json({
    success: true,
    message: "Invoice document uploaded and linked successfully",
    data: newDocument,
  });
});

export const getInvoiceDocuments = catchError(async (req, res) => {
  const { page = 1, limit = 20, search = "", fileType } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query = { accountantId: req.user._id };

  if (fileType) {
    query.fileType = fileType;
  }

  if (search) {
    query.$or = [
      { fileName: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } }
    ];
  }

  const total = await documentModel.countDocuments(query);
  const documents = await documentModel.find(query)
    .populate("invoiceId", "invoiceNumber")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    data: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
      documents
    }
  });
});

export const getInvoiceDocumentsStats = catchError(async (req, res) => {
  const accountantId = req.user._id;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const stats = await documentModel.aggregate([
    { $match: { accountantId } },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        pdfFiles: {
          $sum: { $cond: [{ $eq: ["$fileType", "pdf"] }, 1, 0] }
        },
        imageFiles: {
          $sum: {
            $cond: [
              { $in: ["$fileType", ["jpg", "jpeg", "png"]] }, 1, 0
            ]
          }
        },
        processedOCR: {
          $sum: {
            $cond: [
              { $and: [{ $ne: ["$ocrText", ""] }, { $ne: ["$ocrText", null] }] }, 1, 0
            ]
          }
        },
        recentDocuments: {
          $sum: {
            $cond: [{ $gte: ["$uploadedAt", thirtyDaysAgo] }, 1, 0]
          }
        }
      }
    }
  ]);

  const result = stats[0] || {
    totalDocuments: 0,
    pdfFiles: 0,
    imageFiles: 0,
    processedOCR: 0,
    recentDocuments: 0
  };

  delete result._id;

  res.status(200).json({
    success: true,
    data: result
  });
});

export const getInvoiceDocumentById = catchError(async (req, res) => {
  const document = await documentModel.findOne({
    _id: req.params.id,
    accountantId: req.user._id
  }).populate("invoiceId", "invoiceNumber");

  if (!document) {
    throw new AppError("Invoice document not found", 404);
  }

  res.status(200).json({
    success: true,
    data: document
  });
});

export const deleteInvoiceDocument = catchError(async (req, res) => {
  const document = await documentModel.findOne({
    _id: req.params.id,
    accountantId: req.user._id
  });

  if (!document) {
    throw new AppError("Invoice document not found", 404);
  }

  try {
    await cloudinary.uploader.destroy(document.publicId);
  } catch (error) {
    console.error("Cloudinary deletion failed:", error);
  }

  if (document.invoiceId) {
    await invoiceModel.updateOne(
      { _id: document.invoiceId, accountantId: req.user._id },
      { $set: { documentId: null } }
    );
  }

  await documentModel.findByIdAndDelete(document._id);

  res.status(200).json({
    success: true,
    message: "Invoice document deleted successfully"
  });
});
