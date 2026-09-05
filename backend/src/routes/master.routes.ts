import { Router } from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  getContacts,
  createContact,
  getProducts,
  createProduct,
  getAnalytics,
  createAnalytic,
  getAccounts,
  getJournals,
} from "../controllers/master.controller.js";

const router = Router();

// Protect all master data routes
router.use(authenticate);
router.use(authorizeRoles("ADMIN", "ACCOUNTANT"));

// Contact endpoints
router.get("/contacts", getContacts);
router.post("/contacts", createContact);

// Product endpoints
router.get("/products", getProducts);
router.post("/products", createProduct);

// Analytics endpoints
router.get("/analytics", getAnalytics);
router.post("/analytics", createAnalytic);

// Chart of Accounts & Journals lookups
router.get("/accounts", getAccounts);
router.get("/journals", getJournals);

export default router;