import { Router } from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import { getPnL, getBalanceSheet } from "../controllers/reporting.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN", "ACCOUNTANT"));

router.get("/profit-and-loss", getPnL);
router.get("/balance-sheet", getBalanceSheet);

export default router;