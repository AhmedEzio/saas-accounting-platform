import { getAllPaymentsDashboard } from "../../services/dashboard-services/payments.service.js";
import { searchPaymentsDashboard } from "../../services/dashboard-services/payments-search.service.js";
import { catchError } from "../../utils/catchError.js";

// GET /api/dashboard/payments
export const getAllPayments = catchError(async (req, res, next) => {
  const result = await getAllPaymentsDashboard(req.query);
console.log(result);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// GET /api/dashboard/payments/search
export const searchAllPayments = catchError(async (req, res, next) => {
  const result = await searchPaymentsDashboard(req.query);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

