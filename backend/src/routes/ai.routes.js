import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { uploadInvoice } from "../config/uploadConfig.js";
import checkAIUsage from "../middleware/checkAIUsage.js";
import {
  addAllVectors,
  addInvoiceController,
  chat,
  createChatSession,
  deleteSession,
  getSessions,
  getUserSessions,
  sessionMessages,
} from "../controllers/ai.controller.js";
const router = Router();

router.use(protect);
router.post("/newChat", createChatSession);
router.get("/sessions", authorize("admin"), getSessions);
router.get("/userSessions", getUserSessions);
router.get("/usersessions/:sessionId", sessionMessages);
router.delete("/usersessions/:sessionId", deleteSession);
router.post("/addAllVectors", authorize("admin"), addAllVectors);
router.post(
  "/chat/:sessionId",
  checkAIUsage({ requestType: "chat" }),
  uploadInvoice,
  chat
);

router.post("/test", uploadInvoice, addInvoiceController);

export default router;
