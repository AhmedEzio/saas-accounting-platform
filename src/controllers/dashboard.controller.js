import * as DashboardService from "../services/dashboard.service.js";

// ─── Unified dashboard endpoint ──────────────────────────────────────────────

/**
 * GET /api/dashboard
 * Returns all dashboard data in one round-trip.
 * All sections run in parallel via Promise.allSettled so a single failure
 * in one section doesn't take down the whole response.
 */
export async function getDashboardData(req, res, next) {
  try {
    const accountantId = req.user._id;
    const days = parseInt(req.query.days ?? "30", 10) || 30;
    const activityLimit = parseInt(req.query.activityLimit ?? "10", 10) || 10;

    const [
      kpisResult,
      chartResult,
      financialsResult,
      activityResult,
      subscriptionResult,
      aiUsageResult,
    ] = await Promise.allSettled([
      DashboardService.getKpis(accountantId),
      DashboardService.getSalesPurchasesChart(accountantId, days),
      DashboardService.getFinancialSummary(accountantId),
      DashboardService.getRecentActivity(accountantId, activityLimit),
      DashboardService.getSubscriptionSummary(accountantId),
      DashboardService.getAIUsageSummary(accountantId, days),
    ]);

    const unwrap = (result, fallback) =>
      result.status === "fulfilled" ? result.value : fallback;

    return res.status(200).json({
      success: true,
      data: {
        kpis: unwrap(kpisResult, null),
        chart: unwrap(chartResult, null),
        financials: unwrap(financialsResult, null),
        activities: unwrap(activityResult, []),
        subscription: unwrap(subscriptionResult, null),
        aiUsage: unwrap(aiUsageResult, []),
      },
      errors: {
        kpis:
          kpisResult.status === "rejected"
            ? kpisResult.reason?.message
            : null,
        chart:
          chartResult.status === "rejected"
            ? chartResult.reason?.message
            : null,
        financials:
          financialsResult.status === "rejected"
            ? financialsResult.reason?.message
            : null,
        activities:
          activityResult.status === "rejected"
            ? activityResult.reason?.message
            : null,
        subscription:
          subscriptionResult.status === "rejected"
            ? subscriptionResult.reason?.message
            : null,
        aiUsage:
          aiUsageResult.status === "rejected"
            ? aiUsageResult.reason?.message
            : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getKpis(req, res, next) {
  try {
    const data = await DashboardService.getKpis(req.user._id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getChart(req, res, next) {
  try {
    const days = parseInt(req.query.days ?? "30", 10) || 30;
    const data = await DashboardService.getSalesPurchasesChart(
      req.user._id,
      days
    );

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getFinancials(req, res, next) {
  try {
    const data = await DashboardService.getFinancialSummary(req.user._id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getActivity(req, res, next) {
  try {
    const limit = parseInt(req.query.limit ?? "10", 10) || 10;
    const data = await DashboardService.getRecentActivity(req.user._id, limit);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getSubscription(req, res, next) {
  try {
    const data = await DashboardService.getSubscriptionSummary(req.user._id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getAIUsage(req, res, next) {
  try {
    const days = parseInt(req.query.days ?? "30", 10) || 30;
    const data = await DashboardService.getAIUsageSummary(req.user._id, days);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}