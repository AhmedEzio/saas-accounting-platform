import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { uploadToCloud } from "../middleware/uploadToCloud.js";
import { uploadInvoice } from "../config/uploadConfig.js";
import {
  addAllVectors,
  chat,
  createChatSession,
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
router.post("/addAllVectors", authorize("admin"), addAllVectors);
router.post("/chat", uploadInvoice, chat);

export default router;
