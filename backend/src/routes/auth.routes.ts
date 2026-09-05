import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/auth.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// User Management Routes
router.get("/users", authenticate, getUsers);
router.put("/users/:id", authenticate, authorizeRoles("ADMIN"), updateUser);
router.delete("/users/:id", authenticate, authorizeRoles("ADMIN"), deleteUser);

export default router;