import express from "express";
import {
  register,
  login,
  getMe,
  googleAuth,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
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

router.post("/google", googleAuth);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Create password reset token and send reset link
 * @access  Public
 */
router.post("/forgot-password", forgotPassword);

/**
 * @route   PATCH /api/auth/reset-password/:token
 * @desc    Reset password using reset token
 * @access  Public
 */
router.patch("/reset-password/:token", resetPassword);

// ============ PROTECTED ROUTES ============

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
router.get("/me", protect, getMe);

export default router;
