import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { TransactionService } from "../services/transaction.service.js";

export async function getPortalInvoices(req: Request, res: Response) {
  try {
    const contactId = req.user?.contactId;
    if (!contactId) {
      return res.status(403).json({ error: "User is not linked to any Contact" });
    }

    const invoices = await prisma.customerInvoice.findMany({
      where: { customerId: contactId, status: "CONFIRMED" },
      include: { lines: { include: { product: true } }, payments: true },
      orderBy: { invoiceDate: "desc" },
    });

    return res.json(invoices);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function payPortalInvoice(req: Request, res: Response) {
  try {
    const contactId = req.user?.contactId;
    const invoiceId = req.params.invoiceId as string;
    const { amount, paymentVia } = req.body;

    if (!contactId) {
      return res.status(403).json({ error: "User is not linked to any Contact" });
    }

    const invoice = await prisma.customerInvoice.findFirst({
      where: { id: invoiceId, customerId: contactId, status: "CONFIRMED" },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found or unauthorized" });
    }

    const payment = await TransactionService.registerPayment({
      paymentType: "RECEIVE",
      partnerId: contactId,
      amount: Number(amount),
      paymentVia: paymentVia || "BANK",
      customerInvoiceId: invoice.id,
      note: "Customer Portal Self-Payment",
    });

    return res.status(201).json(payment);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}