import { Router } from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  getSummary,
  getFinancialTrend,
  getCashFlow,
  getReceivablesAging,
  getBudgetUtilization,
  getTopDebtors,
  getRecentActivity,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN", "ACCOUNTANT"));

router.get("/summary", getSummary);
router.get("/financial-trend", getFinancialTrend);
router.get("/cash-flow", getCashFlow);
router.get("/receivables-aging", getReceivablesAging);
router.get("/budget-utilization", getBudgetUtilization);
router.get("/top-debtors", getTopDebtors);
router.get("/recent-activity", getRecentActivity);

export default router;
