import { getAllInvoicesAdmin } from "../../services/dashboard-services/invoices.service.js";
export const getAllInvoices = async (req, res, next) => {
  try {
    const result = await getAllInvoicesAdmin(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
