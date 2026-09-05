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

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// User Management Routes
router.get("/users", getUsers);
router.post("/users", register);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
