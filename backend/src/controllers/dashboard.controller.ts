import { Request, Response } from "express";
import { DashboardService, DateFilterParams } from "../services/dashboard.service.js";

function parseDateFilter(req: Request): DateFilterParams {
  const { months, startDate, endDate, period } = req.query;

  return {
    months: months ? parseInt(months as string, 10) : undefined,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    period: (period as any) || undefined,
  };
}

export async function getSummary(_req: Request, res: Response) {
  try {
    const summary = await DashboardService.getSummary();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch dashboard summary" });
  }
}

export async function getFinancialTrend(req: Request, res: Response) {
  try {
    const params = parseDateFilter(req);
    const data = await DashboardService.getFinancialTrend(params);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch financial trend" });
  }
}

export async function getCashFlow(req: Request, res: Response) {
  try {
    const params = parseDateFilter(req);
    const data = await DashboardService.getCashFlow(params);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch cash flow" });
  }
}

export async function getReceivablesAging(_req: Request, res: Response) {
  try {
    const data = await DashboardService.getReceivablesAging();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch receivables aging" });
  }
}

export async function getBudgetUtilization(_req: Request, res: Response) {
  try {
    const data = await DashboardService.getBudgetUtilization();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch budget utilization" });
  }
}

export async function getTopDebtors(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const data = await DashboardService.getTopDebtors(limit);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch top debtors" });
  }
}

export async function getRecentActivity(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const data = await DashboardService.getRecentActivity(limit);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch recent activity" });
  }
}
