import { z } from "zod";

// --- LINE ITEM SCHEMAS ---
export const orderLineSchema = z.object({
  productId: z.string().uuid("Invalid Product ID"),
  analyticId: z.string().uuid("Invalid Analytic ID").optional(),
  qty: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be non-negative"),
});

export const invoiceBillLineSchema = z.object({
  productId: z.string().uuid("Invalid Product ID"),
  accountId: z.string().uuid("Account ID is required"),
  analyticId: z.string().uuid("Invalid Analytic ID").optional(),
  qty: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be non-negative"),
});

// --- ORDERS ---
export const purchaseOrderSchema = z.object({
  vendorId: z.string().uuid("Vendor Contact ID is required"),
  poDate: z.coerce.date().default(() => new Date()),
  paymentTerms: z.string().optional(),
  lines: z.array(orderLineSchema).min(1, "At least one line item is required"),
});

export const salesOrderSchema = z.object({
  customerId: z.string().uuid("Customer Contact ID is required"),
  soDate: z.coerce.date().default(() => new Date()),
  lines: z.array(orderLineSchema).min(1, "At least one line item is required"),
});

// --- BILL & INVOICE CREATION (Direct or Converted) ---
export const vendorBillSchema = z.object({
  vendorId: z.string().uuid("Vendor Contact ID is required"),
  billReference: z.string().optional(),
  purchaseOrderId: z.string().uuid().optional(),
  billDate: z.coerce.date().default(() => new Date()),
  dueDate: z.coerce.date(),
  lines: z.array(invoiceBillLineSchema).min(1, "At least one bill line is required"),
});

export const customerInvoiceSchema = z.object({
  customerId: z.string().uuid("Customer Contact ID is required"),
  reference: z.string().optional(),
  salesOrderId: z.string().uuid().optional(),
  invoiceDate: z.coerce.date().default(() => new Date()),
  dueDate: z.coerce.date(),
  lines: z.array(invoiceBillLineSchema).min(1, "At least one invoice line is required"),
});

// --- PAYMENT ---
export const paymentSchema = z.object({
  paymentType: z.enum(["SEND", "RECEIVE"]),
  partnerId: z.string().uuid("Partner ID is required"),
  amount: z.coerce.number().positive("Payment amount must be greater than zero"),
  paymentVia: z.enum(["BANK", "CASH"]).default("BANK"),
  note: z.string().optional(),
  vendorBillId: z.string().uuid().optional(),
  customerInvoiceId: z.string().uuid().optional(),
});