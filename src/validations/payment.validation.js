import { body, param, query, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
};

const PAYMENT_METHODS = ["cash", "card", "wallet", "bank_transfer"];

const PAYMENT_SOURCES = [
  "invoice_creation",
  "manual_payment",
  "cancellation_reversal",
  "refund",
];

const MONGO_ID_REGEX = /^[a-f\d]{24}$/i;

const isMongoId = (value) => MONGO_ID_REGEX.test(value);

export const createPaymentRules = [
  body("invoiceId")
    .notEmpty()
    .withMessage("invoiceId is required")
    .custom(isMongoId)
    .withMessage("invoiceId must be a valid MongoDB ObjectId"),

  body("amount")
    .notEmpty()
    .withMessage("amount is required")
    .isFloat({ min: 0.01 })
    .withMessage("amount must be greater than zero"),

  body("paymentMethod")
    .notEmpty()
    .withMessage("paymentMethod is required")
    .isIn(PAYMENT_METHODS)
    .withMessage(`paymentMethod must be one of: ${PAYMENT_METHODS.join(", ")}`),

  body("notes")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("notes must not exceed 500 characters"),

  validate,
];

export const getPaymentsRules = [
  query("invoiceId")
    .optional()
    .custom(isMongoId)
    .withMessage("invoiceId must be a valid MongoDB ObjectId"),

  query("clientId")
    .optional()
    .custom(isMongoId)
    .withMessage("clientId must be a valid MongoDB ObjectId"),

  query("source")
    .optional()
    .isIn(PAYMENT_SOURCES)
    .withMessage(`source must be one of: ${PAYMENT_SOURCES.join(", ")}`),

  query("from")
    .optional()
    .isISO8601()
    .withMessage("from must be a valid ISO 8601 date"),

  query("to")
    .optional()
    .isISO8601()
    .withMessage("to must be a valid ISO 8601 date"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),

  validate,
];

export const getClientBalanceRules = [
  param("id")
    .custom(isMongoId)
    .withMessage("Client ID must be a valid MongoDB ObjectId"),

  query("from")
    .optional()
    .isISO8601()
    .withMessage("from must be a valid ISO 8601 date"),

  query("to")
    .optional()
    .isISO8601()
    .withMessage("to must be a valid ISO 8601 date"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),

  validate,
];