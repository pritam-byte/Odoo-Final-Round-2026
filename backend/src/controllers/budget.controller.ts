import { Request, Response } from "express";
import { BudgetService } from "../services/budget.service.js";
import { createBudgetSchema } from "../validations/budget.validation.js";

export async function createBudget(req: Request, res: Response) {
  try {
    const parsed = createBudgetSchema.parse(req.body);
    const budget = await BudgetService.createBudget(parsed);
    return res.status(201).json(budget);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors?.[0]?.message || error.message });
  }
}

export async function getBudgets(_req: Request, res: Response) {
  try {
    const budgets = await BudgetService.getBudgetsWithProgress();
    return res.json(budgets);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function confirmBudget(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const budget = await BudgetService.confirmBudget(id);
    return res.json(budget);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function cancelBudget(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const budget = await BudgetService.cancelBudget(id);
    return res.json(budget);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function reviseBudget(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { newCommittedAmount } = req.body;
    if (!newCommittedAmount || Number(newCommittedAmount) <= 0) {
      return res.status(400).json({ error: "Valid new committed amount required" });
    }
    const revised = await BudgetService.reviseBudget(id, Number(newCommittedAmount));
    return res.status(201).json(revised);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}