import { Router } from "express";
import {
  getDashboardData,
  getKpis,
  getChart,
  getOverview,
  getFinancials,
  getActivity,
  getSubscription,
  getAIUsage,
} from "../controllers/dashboard-controllers/dashboard.controller.js";
import { serachResults } from "../controllers/dashboard-controllers/accountants.controller.js";

const router = Router();

/**
 * GET /api/dashboard
 *
 * Unified dashboard endpoint.
 * Returns:
 * - KPIs (subscribed users / subscriptions for the date)
 * - Daily Subscriptions Chart
 * - Platform Overview (accountants, admins, invoices, clients, plans, payments)
 * - Financial Summary
 * - Recent Activity
 * - Subscription Summary
 * - AI Usage Summary
 *
 * Frontend can load the entire dashboard in one request.
 */
router.get("/", getDashboardData);

/**
 * GET /api/dashboard/kpis?date=YYYY-MM-DD
 *
 * Returns dashboard KPI cards:
 * - Total Subscribed Users (currently active/trialing)
 * - Total Subscriptions created on the given date (defaults to today)
 */
router.get("/kpis", getKpis);

/**
 * GET /api/dashboard/chart?days=30&date=YYYY-MM-DD
 *
 * Returns daily new-subscriptions counts for the `days`-day window
 * ending on `date` (defaults to today). Re-fetch with a new `date`
 * whenever the dashboard's calendar selection changes.
 */
router.get("/chart", getChart);

/**
 * GET /api/dashboard/overview?date=YYYY-MM-DD
 *
 * Returns platform-wide snapshot totals as of the given date
 * (running totals — everything created on or before that day):
 * - Accountants
 * - Admins
 * - Total Invoices
 * - Total Clients
 * - Available Subscription Plans
 * - Total Payments
 */
router.get("/overview", getOverview);

/**
 * GET /api/dashboard/financials
 *
 * Returns:
 * - Cash In
 * - Cash Out
 * - Receivables
 * - Payables
 */
router.get("/financials", getFinancials);

/**
 * GET /api/dashboard/activity?limit=10
 *
 * Returns recent system activity:
 * - Invoice creation
 * - Invoice cancellation
 * - Payments
 * - Refunds
 */
router.get("/activity", getActivity);

/**
 * GET /api/dashboard/subscription
 *
 * Returns current subscription information:
 * - Plan
 * - Status
 * - Credit Limit
 * - Credits Used
 * - Credits Remaining
 */
router.get("/subscription", getSubscription);

/**
 * GET /api/dashboard/ai-usage?days=30
 *
 * Returns AI usage statistics:
 * - Requests count
 * - Credits consumed
 * - Token usage
 */
router.get("/ai-usage", getAIUsage);

/**
 * Acountants page routes
 * GET /api/dashboard/accountant?search=abc
 */
router.get("/accountant", serachResults);

export default router;
