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

const INVOICE_TYPES = [
  "purchase",
  "sale",
  "purchase_return",
  "sales_return",
  "expense",
];

const PAYMENT_METHODS = ["cash", "card", "wallet", "bank_transfer"];

const RETURN_TYPES = ["purchase_return", "sales_return"];

const EXPENSE_TYPES = [
  "rent",
  "salary",
  "electricity",
  "internet",
  "transportation",
  "maintenance",
  "marketing",
  "office_supplies",
  "other",
];

const MONGO_ID_REGEX = /^[a-f\d]{24}$/i;

const isMongoId = (value) => MONGO_ID_REGEX.test(value);

const isNullableMongoId = (value) => {
  if (value === null || value === "") return true;
  return isMongoId(value);
};

const itemRules = [
  body("items")
    .if((_, { req }) => req.body.invoiceType !== "expense")
    .isArray({ min: 1 })
    .withMessage("items must be a non-empty array"),

  body("items")
    .if((_, { req }) => req.body.invoiceType === "expense")
    .optional()
    .isArray()
    .withMessage("items must be an array"),

  body("items.*.description")
    .if((_, { req }) => req.body.invoiceType !== "expense")
    .notEmpty()
    .withMessage("Each item must have a description")
    .isString()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Item description must not exceed 300 characters"),

  body("items.*.quantity")
    .if((_, { req }) => req.body.invoiceType !== "expense")
    .notEmpty()
    .withMessage("Each item must have a quantity")
    .isFloat({ min: 0.01 })
    .withMessage("quantity must be greater than zero"),

  body("items.*.unitPrice")
    .if((_, { req }) => req.body.invoiceType !== "expense")
    .notEmpty()
    .withMessage("Each item must have a unitPrice")
    .isFloat({ min: 0 })
    .withMessage("unitPrice cannot be negative"),
];

export const createInvoiceRules = [
  body("invoiceType")
    .notEmpty()
    .withMessage("invoiceType is required")
    .isIn(INVOICE_TYPES)
    .withMessage(`invoiceType must be one of: ${INVOICE_TYPES.join(", ")}`),

  body("clientId")
    .if((_, { req }) => req.body.invoiceType !== "expense")
    .notEmpty()
    .withMessage("clientId is required for non-expense invoices")
    .custom(isMongoId)
    .withMessage("clientId must be a valid MongoDB ObjectId"),

  body("clientId")
    .if((_, { req }) => req.body.invoiceType === "expense")
    .optional({ nullable: true })
    .custom(isNullableMongoId)
    .withMessage("clientId must be a valid MongoDB ObjectId"),

  body("paymentMethod")
    .notEmpty()
    .withMessage("paymentMethod is required")
    .isIn(PAYMENT_METHODS)
    .withMessage(`paymentMethod must be one of: ${PAYMENT_METHODS.join(", ")}`),

  body("relatedInvoiceId")
    .if((_, { req }) => RETURN_TYPES.includes(req.body.invoiceType))
    .notEmpty()
    .withMessage("relatedInvoiceId is required for return invoices")
    .custom(isMongoId)
    .withMessage("relatedInvoiceId must be a valid MongoDB ObjectId"),

  body("relatedInvoiceId")
    .if((_, { req }) => !RETURN_TYPES.includes(req.body.invoiceType))
    .optional({ nullable: true })
    .custom(isNullableMongoId)
    .withMessage("relatedInvoiceId must be a valid MongoDB ObjectId"),

  body("expenseName")
    .if((_, { req }) => req.body.invoiceType === "expense")
    .notEmpty()
    .withMessage("expenseName is required for expense invoices")
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage("expenseName must not exceed 200 characters"),

  body("expenseType")
    .if((_, { req }) => req.body.invoiceType === "expense")
    .notEmpty()
    .withMessage("expenseType is required for expense invoices")
    .isIn(EXPENSE_TYPES)
    .withMessage(`expenseType must be one of: ${EXPENSE_TYPES.join(", ")}`),

  body("expenseDescription")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("expenseDescription must not exceed 500 characters"),

  body("expenseOtherNotes")
    .if((_, { req }) =>
      req.body.invoiceType === "expense" && req.body.expenseType === "other"
    )
    .notEmpty()
    .withMessage("expenseOtherNotes is required when expenseType is other")
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("expenseOtherNotes must not exceed 500 characters"),

  body("baseAmount")
    .if((_, { req }) => req.body.invoiceType === "expense")
    .notEmpty()
    .withMessage("baseAmount is required for expense invoices")
    .isFloat({ min: 0.01 })
    .withMessage("baseAmount must be greater than zero"),

  body("baseAmount")
    .if((_, { req }) => req.body.invoiceType !== "expense")
    .optional()
    .custom(() => {
      throw new Error("baseAmount is server-computed for non-expense invoices");
    }),

  body("taxPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("taxPercentage must be between 0 and 100"),

  body("amountPaid")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("amountPaid cannot be negative"),

  ...itemRules,

  body("documentId")
    .optional({ nullable: true })
    .custom(isNullableMongoId)
    .withMessage("documentId must be a valid MongoDB ObjectId"),

  body("notes")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("notes must not exceed 500 characters"),

  validate,
];

export const getInvoicesRules = [
  query("invoiceType")
    .optional()
    .isIn(INVOICE_TYPES)
    .withMessage(`invoiceType must be one of: ${INVOICE_TYPES.join(", ")}`),

  query("clientId")
    .optional()
    .custom(isMongoId)
    .withMessage("clientId must be a valid MongoDB ObjectId"),

  query("paymentMethod")
    .optional()
    .isIn(PAYMENT_METHODS)
    .withMessage(`paymentMethod must be one of: ${PAYMENT_METHODS.join(", ")}`),

  query("expenseType")
    .optional()
    .isIn(EXPENSE_TYPES)
    .withMessage(`expenseType must be one of: ${EXPENSE_TYPES.join(", ")}`),

  query("paymentStatus")
    .optional()
    .isIn(["paid", "partial", "unpaid"])
    .withMessage("paymentStatus must be one of: paid, partial, unpaid"),

  query("includeCancelled")
    .optional()
    .isIn(["true", "false"])
    .withMessage("includeCancelled must be true or false"),

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

export const getInvoiceByIdRules = [
  param("id")
    .custom(isMongoId)
    .withMessage("Invoice ID must be a valid MongoDB ObjectId"),

  validate,
];

export const cancelInvoiceRules = [
  param("id")
    .custom(isMongoId)
    .withMessage("Invoice ID must be a valid MongoDB ObjectId"),

  body("reason")
    .notEmpty()
    .withMessage("Cancellation reason is required")
    .isString()
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage("Cancellation reason must be between 3 and 500 characters"),

  validate,
];