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

// Purchase pipeline (Staff only)
router.get("/purchase-orders", authorizeRoles("ADMIN", "ACCOUNTANT"), getPurchaseOrders);
router.post("/purchase-orders", authorizeRoles("ADMIN", "ACCOUNTANT"), createPO);
router.post("/purchase-orders/:id/confirm", authorizeRoles("ADMIN", "ACCOUNTANT"), confirmPO);

router.get("/vendor-bills", authorizeRoles("ADMIN", "ACCOUNTANT"), getVendorBills);
router.post("/vendor-bills", authorizeRoles("ADMIN", "ACCOUNTANT"), createBill);
router.post("/vendor-bills/:id/confirm", authorizeRoles("ADMIN", "ACCOUNTANT"), confirmBill);

// Sales pipeline (Staff only)
router.get("/sales-orders", authorizeRoles("ADMIN", "ACCOUNTANT"), getSalesOrders);
router.post("/sales-orders", authorizeRoles("ADMIN", "ACCOUNTANT"), createSO);

router.get("/customer-invoices", authorizeRoles("ADMIN", "ACCOUNTANT"), getCustomerInvoices);
router.post("/customer-invoices", authorizeRoles("ADMIN", "ACCOUNTANT"), createInvoice);
router.post("/customer-invoices/:id/confirm", authorizeRoles("ADMIN", "ACCOUNTANT"), confirmInvoice);

// Payment endpoints (Accessible by Staff and Portal Customers)
router.get("/payments", authorizeRoles("ADMIN", "ACCOUNTANT", "PORTAL_USER"), getPayments);
router.post("/payments", authorizeRoles("ADMIN", "ACCOUNTANT", "PORTAL_USER"), makePayment);

// Journal Entries (Staff only)
router.get("/journal-entries", authorizeRoles("ADMIN", "ACCOUNTANT"), getJournalEntries);

export default router;