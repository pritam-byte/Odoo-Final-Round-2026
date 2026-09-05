import { Request, Response } from "express";
import { ReportingService } from "../services/reporting.service.js";

export async function getPnL(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    const report = await ReportingService.getProfitAndLoss(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    return res.json(report);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getBalanceSheet(req: Request, res: Response) {
  try {
    const { asOfDate } = req.query;
    const report = await ReportingService.getBalanceSheet(
      asOfDate ? new Date(asOfDate as string) : undefined
    );
    return res.json(report);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}