import { z } from "zod";

export const registerSchema = z.object({
  loginId: z
    .string()
    .min(3, "Login ID must be at least 3 characters")
    .max(50, "Login ID must be at most 50 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "ACCOUNTANT", "PORTAL_USER"]).default("ACCOUNTANT"),
  name: z.string().optional(),
  contactId: z.string().uuid().optional().nullable(),
});

export const loginSchema = z.object({
  loginId: z.string().min(1, "Login ID is required"),
  password: z.string().min(1, "Password is required"),
});
