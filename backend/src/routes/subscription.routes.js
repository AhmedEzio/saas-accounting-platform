import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getPlans,
  getAdminPlans,
  getAdminPlan,
  createPlan,
  updatePlan,
  deletePlan,
  createCheckout,
  getMySubscription,
  getAllSubscriptions,
  getUserSubscriptions,
  getUserCurrentSubscription,
  updateUserSubscription,
  cancelMySubscription,
  cancelUserSubscription,
  overrideUserSubscription,
  getAdminAIUsage,
  getUserAIUsage,
} from "../controllers/subscriptionController.js";

const router = express.Router();


router.get("/subscription-plans", getPlans);


router.get(
  "/admin/subscription-plans",
  protect,
  authorize("admin"),
  getAdminPlans
);

router.get(
  "/admin/subscription-plans/:id",
  protect,
  authorize("admin"),
  getAdminPlan
);

router.post(
  "/admin/subscription-plans",
  protect,
  authorize("admin"),
  createPlan
);

router.patch(
  "/admin/subscription-plans/:id",
  protect,
  authorize("admin"),
  updatePlan
);

router.delete(
  "/admin/subscription-plans/:id",
  protect,
  authorize("admin"),
  deletePlan
);

router.post(
  "/subscriptions/create-checkout-session",
  protect,
  createCheckout
);


router.get("/subscriptions/me", protect, getMySubscription);

router.patch("/subscriptions/cancel", protect, cancelMySubscription);

router.get(
  "/admin/subscriptions",
  protect,
  authorize("admin"),
  getAllSubscriptions
);

router.get(
  "/admin/users/:userId/subscriptions",
  protect,
  authorize("admin"),
  getUserSubscriptions
);

router.get(
  "/admin/users/:userId/subscription",
  protect,
  authorize("admin"),
  getUserCurrentSubscription
);

router.patch(
  "/admin/subscriptions/:id",
  protect,
  authorize("admin"),
  updateUserSubscription
);

router.patch(
  "/admin/subscriptions/:id/cancel",
  protect,
  authorize("admin"),
  cancelUserSubscription
);

router.patch(
  "/admin/users/:userId/subscription-override",
  protect,
  authorize("admin"),
  overrideUserSubscription
);

router.get(
  "/admin/ai-usage",
  protect,
  authorize("admin"),
  getAdminAIUsage
);

router.get(
  "/admin/users/:userId/ai-usage",
  protect,
  authorize("admin"),
  getUserAIUsage
);

export default router;
