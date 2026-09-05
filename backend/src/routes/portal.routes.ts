import { Router } from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  getPortalInvoices,
  payPortalInvoice,
  getPortalBills,
  getPortalPayments,
  payPortalBill,
} from "../controllers/portal.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("PORTAL_USER", "ADMIN"));

router.get("/invoices", getPortalInvoices);
router.post("/invoices/:invoiceId/pay", payPortalInvoice);
router.get("/bills", getPortalBills);
router.post("/bills/:billId/pay", payPortalBill);
router.get("/payments", getPortalPayments);

export default router;