import { checkAvailableAICredits } from "../services/subscription.service.js";
import AppError from "../utils/appError.js";

const normalizeOptions = (options = 1) => {
  if (typeof options === "number") {
    return {
      requiredCredits: options,
      requestType: undefined,
    };
  }

  return {
    requiredCredits: options.requiredCredits ?? 1,
    requestType: options.requestType,
  };
};

const checkAIUsage = (options = 1) => {
  const { requiredCredits, requestType } = normalizeOptions(options);

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AppError("Authentication required before AI credit check.", 401));
      }

      // Will throw AppError if no active subscription, feature access, or credits.
      const result = await checkAvailableAICredits({
        userId: req.user._id,
        requiredCredits,
        requestType,
      });

    
      req.activeSubscription = result.subscription;

 
      req.aiCreditCost = result.requiredCredits;
      req.aiRequestType = result.requestType;
      req.aiRequiredFeature = result.requiredFeature;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkAIUsage;
