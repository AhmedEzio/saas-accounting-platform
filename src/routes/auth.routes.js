import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ============ PUBLIC ROUTES ============

/**
 * @route   POST /api/auth/register
 * @desc    Register a new accountant account
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post("/login", login);

// ============ PROTECTED ROUTES ============

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
router.get("/me", protect, getMe);

export default router;
