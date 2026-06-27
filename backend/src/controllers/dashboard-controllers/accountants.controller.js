import { accountantsSearch } from "../../services/dashboard-services/accountants.service.js";
import AppError from "../../utils/appError.js";
import { catchError } from "../../utils/catchError.js";
/**
 * Implement Search function
 */
export const serachResults = catchError(async (req, res) => {
  const { search } = req.query;
//   if (!search) throw new AppError("No serach results found", 404);

  const response = await accountantsSearch(search);
  if (!response) throw new AppError("No serach results found", 404);
  res.status(200).json({
    data: response,
  });
});
