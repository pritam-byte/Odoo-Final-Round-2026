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
    const id = req.params.id as string;
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
    const id = req.params.id as string;
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
    const id = req.params.id as string;
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

// --- List Handlers ---
export async function getPurchaseOrders(_req: Request, res: Response) {
  try {
    const pos = await TransactionService.listPurchaseOrders();
    return res.json(pos);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getVendorBills(_req: Request, res: Response) {
  try {
    const bills = await TransactionService.listVendorBills();
    return res.json(bills);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getSalesOrders(_req: Request, res: Response) {
  try {
    const sos = await TransactionService.listSalesOrders();
    return res.json(sos);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getCustomerInvoices(_req: Request, res: Response) {
  try {
    const invoices = await TransactionService.listCustomerInvoices();
    return res.json(invoices);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getPayments(_req: Request, res: Response) {
  try {
    const payments = await TransactionService.listPayments();
    return res.json(payments);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getJournalEntries(_req: Request, res: Response) {
  try {
    const entries = await TransactionService.listJournalEntries();
    return res.json(entries);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}