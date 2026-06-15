import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";
import { getClientBalance } from "../controllers/paymentController.js";
import { getClientBalanceRules } from "../validations/payment.validation.js";

const router = Router();

router.use(protect);

router.get("/", authorize("admin", "accountant"), getClients);
router.get("/:id", authorize("admin", "accountant"), getClientById);
router.post("/", authorize("admin", "accountant"), createClient);
router.put("/:id", authorize("admin", "accountant"), updateClient);
router.delete("/:id", authorize("admin", "accountant"), deleteClient);

router.get(
  "/:id/balance",
  authorize("admin", "accountant"),
  getClientBalanceRules,
  getClientBalance
);

export default router;