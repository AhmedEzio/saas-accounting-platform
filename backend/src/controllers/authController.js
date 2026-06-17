import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

const signToken = (id) => {
  try {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  } catch {
    throw new Error("Token generation failed");
  }
};

const sendAuthResponse = (
  res,
  statusCode,
  success,
  message,
  additionalData = {}
) => {
  const response = {
    success,
    message,
    ...additionalData,
  };

  res.status(statusCode).json(response);
};

const getFrontendUrl = () =>
  process.env.FRONTEND_URL || "http://localhost:3000";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendAuthResponse(
        res,
        400,
        false,
        "Name, email, and password are required"
      );
    }

    const normalizedData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: password,
      // Public registration must never trust role from the request body.
      role: "accountant",
    };

    const user = await User.create(normalizedData);

    const token = signToken(user._id);

    return sendAuthResponse(res, 201, true, "User registered successfully", {
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");

      return sendAuthResponse(res, 400, false, `Validation error: ${messages}`);
    }

    if (error.code === 11000) {
      return sendAuthResponse(
        res,
        400,
        false,
        "Email already registered. Please use a different email or try logging in."
      );
    }

    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendAuthResponse(
        res,
        400,
        false,
        "Email and password are required"
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash"
    );

    if (!user) {
      return sendAuthResponse(res, 401, false, "Invalid email or password");
    }

    let isPasswordCorrect;

    try {
      isPasswordCorrect = await user.comparePassword(password);
    } catch {
      return sendAuthResponse(res, 401, false, "Authentication failed");
    }

    if (!isPasswordCorrect) {
      return sendAuthResponse(res, 401, false, "Invalid email or password");
    }

    const token = signToken(user._id);

    return sendAuthResponse(res, 200, true, "Login successful", {
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendAuthResponse(res, 401, false, "User not found");
    }

    return sendAuthResponse(res, 200, true, "User profile retrieved", {
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return sendAuthResponse(res, 400, false, "Google credential is required");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email?.toLowerCase();
    const name = payload.name || payload.email?.split("@")[0];

    if (!email) {
      return sendAuthResponse(res, 400, false, "Google account email is required");
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        passwordHash: Math.random().toString(36).slice(-12) + Date.now(),
        role: "accountant",
      });
    }

    const token = signToken(user._id);

    return sendAuthResponse(res, 200, true, "Google authentication successful", {
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendAuthResponse(res, 400, false, "Email is required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Always return the same public message to avoid revealing registered emails.
    const publicMessage =
      "If this email exists, a password reset link has been sent.";

    if (!user) {
      return sendAuthResponse(res, 200, true, publicMessage);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${getFrontendUrl()}/reset-password/${resetToken}`;
    const message = `You requested a password reset.\n\nUse this link to reset your password:\n${resetUrl}\n\nThis link expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Finora Password Reset",
        message,
      });

      return sendAuthResponse(res, 200, true, publicMessage, {
        ...(process.env.NODE_ENV === "development" ? { resetUrl } : {}),
      });
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return sendAuthResponse(
        res,
        500,
        false,
        "Password reset email could not be sent. Please try again later."
      );
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;

    if (!token) {
      return sendAuthResponse(res, 400, false, "Reset token is required");
    }

    if (!password || !passwordConfirm) {
      return sendAuthResponse(
        res,
        400,
        false,
        "Password and password confirmation are required"
      );
    }

    if (password !== passwordConfirm) {
      return sendAuthResponse(res, 400, false, "Passwords do not match");
    }

    if (password.length < 6) {
      return sendAuthResponse(
        res,
        400,
        false,
        "Password must be at least 6 characters"
      );
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires +passwordHash");

    if (!user) {
      return sendAuthResponse(res, 400, false, "Reset token is invalid or expired");
    }

    user.passwordHash = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const authToken = signToken(user._id);

    return sendAuthResponse(res, 200, true, "Password reset successfully", {
      token: authToken,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
