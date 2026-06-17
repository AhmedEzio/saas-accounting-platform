import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as invoiceController from "../controllers/invoiceController.js";
import {
  createInvoiceRules,
  getInvoicesRules,
  getInvoiceByIdRules,
  cancelInvoiceRules,
} from "../validations/invoice.validation.js";

const router = Router();

router.use(protect);

router.post(
  "/",
  authorize("admin", "accountant"),
  createInvoiceRules,
  invoiceController.createInvoice
);

router.get(
  "/",
  authorize("admin", "accountant"),
  getInvoicesRules,
  invoiceController.getInvoices
);

router.get(
  "/:id",
  authorize("admin", "accountant"),
  getInvoiceByIdRules,
  invoiceController.getInvoiceById
);

router.post(
  "/:id/cancel",
  authorize("admin", "accountant"),
  cancelInvoiceRules,
  invoiceController.cancelInvoice
);

export default router;