import { Request, Response } from "express";
import { TransactionService } from "../services/transaction.service.js";
import {
  purchaseOrderSchema,
  salesOrderSchema,
  vendorBillSchema,
  customerInvoiceSchema,
  paymentSchema,
} from "../validations/transaction.validation.js";

// PO
export async function createPO(req: Request, res: Response) {
  try {
    const parsed = purchaseOrderSchema.parse(req.body);
    const po = await TransactionService.createPurchaseOrder(parsed);
    return res.status(201).json(po);
  } catch (err: any) {
    return res.status(400).json({ error: err.errors?.[0]?.message || err.message });
  }
}

export async function confirmPO(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await TransactionService.confirmPurchaseOrder(id);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

// Vendor Bill
export async function createBill(req: Request, res: Response) {
  try {
    const parsed = vendorBillSchema.parse(req.body);
    const bill = await TransactionService.createVendorBill(parsed);
    return res.status(201).json(bill);
  } catch (err: any) {
    return res.status(400).json({ error: err.errors?.[0]?.message || err.message });
  }
}

export async function confirmBill(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await TransactionService.confirmVendorBill(id);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

// Sales Order
export async function createSO(req: Request, res: Response) {
  try {
    const parsed = salesOrderSchema.parse(req.body);
    const so = await TransactionService.createSalesOrder(parsed);
    return res.status(201).json(so);
  } catch (err: any) {
    return res.status(400).json({ error: err.errors?.[0]?.message || err.message });
  }
}

// Customer Invoice
export async function createInvoice(req: Request, res: Response) {
  try {
    const parsed = customerInvoiceSchema.parse(req.body);
    const invoice = await TransactionService.createCustomerInvoice(parsed);
    return res.status(201).json(invoice);
  } catch (err: any) {
    return res.status(400).json({ error: err.errors?.[0]?.message || err.message });
  }
}

export async function confirmInvoice(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await TransactionService.confirmCustomerInvoice(id);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

// Payment
export async function makePayment(req: Request, res: Response) {
  try {
    const parsed = paymentSchema.parse(req.body);
    const payment = await TransactionService.registerPayment(parsed);
    return res.status(201).json(payment);
  } catch (err: any) {
    return res.status(400).json({ error: err.errors?.[0]?.message || err.message });
  }
}