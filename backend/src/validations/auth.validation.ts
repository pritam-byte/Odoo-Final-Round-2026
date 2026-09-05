import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const registerSchema = z.object({
  loginId: z
    .string()
    .min(6, "Login ID must be 6 to 12 characters")
    .max(12, "Login ID must be 6 to 12 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .regex(
      passwordRegex,
      "Password must have 8+ characters, at least 1 uppercase, 1 lowercase, and 1 special character"
    ),
  role: z.enum(["ADMIN", "ACCOUNTANT", "PORTAL_USER"]).default("ACCOUNTANT"),
  contactId: z.string().uuid().optional(),
});

export const loginSchema = z.object({
  loginId: z.string().min(1, "Login ID is required"),
  password: z.string().min(1, "Password is required"),
});