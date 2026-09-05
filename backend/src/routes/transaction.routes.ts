import { Router } from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  createPO,
  confirmPO,
  getPurchaseOrders,
  createBill,
  confirmBill,
  getVendorBills,
  createSO,
  getSalesOrders,
  createInvoice,
  confirmInvoice,
  getCustomerInvoices,
  makePayment,
  getPayments,
  getJournalEntries,
} from "../controllers/transaction.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN", "ACCOUNTANT"));

// Purchase pipeline
router.get("/purchase-orders", getPurchaseOrders);
router.post("/purchase-orders", createPO);
router.post("/purchase-orders/:id/confirm", confirmPO);

router.get("/vendor-bills", getVendorBills);
router.post("/vendor-bills", createBill);
router.post("/vendor-bills/:id/confirm", confirmBill);

// Sales pipeline
router.get("/sales-orders", getSalesOrders);
router.post("/sales-orders", createSO);

router.get("/customer-invoices", getCustomerInvoices);
router.post("/customer-invoices", createInvoice);
router.post("/customer-invoices/:id/confirm", confirmInvoice);

// Payment
router.get("/payments", getPayments);
router.post("/payments", makePayment);

// Journal Entries
router.get("/journal-entries", getJournalEntries);

export default router;