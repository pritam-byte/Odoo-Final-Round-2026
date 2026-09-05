import { Router } from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  createBudget,
  getBudgets,
  confirmBudget,
  cancelBudget,
  reviseBudget,
} from "../controllers/budget.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN", "ACCOUNTANT"));

router.get("/", getBudgets);
router.post("/", createBudget);
router.post("/:id/confirm", confirmBudget);
router.post("/:id/cancel", cancelBudget);
router.post("/:id/revise", reviseBudget);

export default router;