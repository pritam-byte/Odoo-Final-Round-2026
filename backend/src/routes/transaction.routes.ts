import { Router } from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  createPO,
  confirmPO,
  createBill,
  confirmBill,
  createSO,
  createInvoice,
  confirmInvoice,
  makePayment,
} from "../controllers/transaction.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN", "ACCOUNTANT"));

// Purchase pipeline
router.post("/purchase-orders", createPO);
router.post("/purchase-orders/:id/confirm", confirmPO);
router.post("/vendor-bills", createBill);
router.post("/vendor-bills/:id/confirm", confirmBill);

// Sales pipeline
router.post("/sales-orders", createSO);
router.post("/customer-invoices", createInvoice);
router.post("/customer-invoices/:id/confirm", confirmInvoice);

// Payment
router.post("/payments", makePayment);

export default router;