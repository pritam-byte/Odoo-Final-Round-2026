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

// Protect master data routes
router.use(authenticate);

// Contacts (Readable by all authenticated users, writeable by Staff)
router.get("/contacts", getContacts);
router.post("/contacts", authorizeRoles("ADMIN", "ACCOUNTANT"), createContact);

// Products (Readable by all authenticated users, writeable by Staff)
router.get("/products", getProducts);
router.post("/products", authorizeRoles("ADMIN", "ACCOUNTANT"), createProduct);

// Analytics endpoints
router.get("/analytics", authorizeRoles("ADMIN", "ACCOUNTANT"), getAnalytics);
router.post("/analytics", authorizeRoles("ADMIN", "ACCOUNTANT"), createAnalytic);

// Chart of Accounts & Journals lookups
router.get("/accounts", authorizeRoles("ADMIN", "ACCOUNTANT"), getAccounts);
router.get("/journals", authorizeRoles("ADMIN", "ACCOUNTANT"), getJournals);

export default router;