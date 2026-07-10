import express from "express";
import { uploadInvoice } from "../config/uploadConfig.js";
import { uploadToCloud } from "../middleware/uploadToCloud.js";
import { 
  createInvoiceDocument,
  getInvoiceDocuments,
  getInvoiceDocumentsStats,
  getInvoiceDocumentById,
  deleteInvoiceDocument
} from "../controllers/invoiceDocumentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", protect, getInvoiceDocumentsStats);
router.get("/", protect, getInvoiceDocuments);
router.get("/:id", protect, getInvoiceDocumentById);
router.post("/", protect, uploadInvoice, uploadToCloud, createInvoiceDocument);
router.delete("/:id", protect, deleteInvoiceDocument);

export default router;