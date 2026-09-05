import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  type: z.enum(["CUSTOMER", "VENDOR", "BOTH"]).default("BOTH"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  image: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().optional(),
  salesPrice: z.coerce.number().min(0, "Sales price cannot be negative"),
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
  type: z.enum(["GOODS", "SERVICE", "COMBO"]).default("GOODS"),
  image: z.string().optional(),
});

export const analyticSchema = z.object({
  name: z.string().min(1, "Analytic account name is required"),
  type: z.enum(["INCOME", "EXPENSE"]),
});