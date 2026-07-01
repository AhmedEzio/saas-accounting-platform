import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  reactivateClient,
} from "../controllers/clientController.js";
import {
  getClientBalance,
  getClientLastBalanceTransactions,
} from "../controllers/paymentController.js";
import { getClientBalanceRules } from "../validations/payment.validation.js";

const router = Router();

router.use(protect);

router.get("/", authorize("admin", "accountant"), getClients);
router.get("/:id", authorize("admin", "accountant"), getClientById);
router.post("/", authorize("admin", "accountant"), createClient);
router.put("/:id", authorize("admin", "accountant"), updateClient);
router.put(
  "/:id/reactivate",
  authorize("admin", "accountant"),
  reactivateClient,
);
router.delete("/:id", authorize("admin", "accountant"), deleteClient);

router.get(
  "/:id/balance",
  authorize("admin", "accountant"),
  getClientBalanceRules,
  getClientBalance,
);

router.get(
  "/:clientId/totals",
  authorize("admin", "accountant"),
  getClientLastBalanceTransactions,
);
export default router;
