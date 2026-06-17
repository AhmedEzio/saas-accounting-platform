import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

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