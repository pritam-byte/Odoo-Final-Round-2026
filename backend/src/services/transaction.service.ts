import { prisma } from "../lib/prisma.js";
import { AccountingEngine } from "./accounting.service.js";
import { Prisma } from "@prisma/client";

export class TransactionService {
  // --- PURCHASE ORDERS ---
  static async createPurchaseOrder(data: {
    vendorId: string;
    poDate: Date;
    paymentTerms?: string;
    lines: Array<{ productId: string; analyticId?: string; qty: number; unitPrice: number }>;
  }) {
    const totalAmount = data.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
    const count = await prisma.purchaseOrder.count();
    const poNo = `P${(count + 1).toString().padStart(5, "0")}`;

    return prisma.purchaseOrder.create({
      data: {
        poNo,
        vendorId: data.vendorId,
        poDate: data.poDate,
        paymentTerms: data.paymentTerms,
        totalAmount: new Prisma.Decimal(totalAmount),
        lines: {
          create: data.lines.map((l) => ({
            productId: l.productId,
            analyticId: l.analyticId,
            qty: l.qty,
            unitPrice: new Prisma.Decimal(l.unitPrice),
            subtotal: new Prisma.Decimal(l.qty * l.unitPrice),
          })),
        },
      },
      include: { lines: true },
    });
  }

  static async confirmPurchaseOrder(poId: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { lines: true },
    });
    if (!po) throw new Error("Purchase Order not found");

    // Non-blocking warning check against budget
    const budgetWarnings: string[] = [];
    for (const line of po.lines) {
      if (line.analyticId) {
        const budget = await prisma.budget.findFirst({
          where: {
            analyticId: line.analyticId,
            status: "CONFIRMED",
            startDate: { lte: po.poDate },
            endDate: { gte: po.poDate },
          },
        });

        if (budget) {
          // Calculate achieved expenses for this analytic in this period
          const bills = await prisma.vendorBillLine.findMany({
            where: {
              analyticId: line.analyticId,
              bill: {
                status: "CONFIRMED",
                billDate: { gte: budget.startDate, lte: budget.endDate },
              },
            },
          });
          const currentSpent = bills.reduce((acc, b) => acc.add(b.subtotal), new Prisma.Decimal(0));
          const remaining = budget.committedAmount.sub(currentSpent);

          if (line.subtotal.gt(remaining)) {
            budgetWarnings.push(
              "Exceeds Approved Budget — the entered amount is higher than the remaining budget amount for this line. Consider adjusting the value or revise the budget."
            );
          }
        }
      }
    }

    const updatedPo = await prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: "CONFIRMED" },
    });

    return { order: updatedPo, warnings: budgetWarnings };
  }

  // --- VENDOR BILLS ---
  static async createVendorBill(data: {
    vendorId: string;
    billReference?: string;
    purchaseOrderId?: string;
    billDate: Date;
    dueDate: Date;
    lines: Array<{ productId: string; accountId: string; analyticId?: string; qty: number; unitPrice: number }>;
  }) {
    const totalAmount = data.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
    const count = await prisma.vendorBill.count();
    const billNo = `Bill/${new Date().getFullYear()}/${(count + 1).toString().padStart(4, "0")}`;

    return prisma.vendorBill.create({
      data: {
        billNo,
        vendorId: data.vendorId,
        billReference: data.billReference,
        purchaseOrderId: data.purchaseOrderId,
        billDate: data.billDate,
        dueDate: data.dueDate,
        totalAmount: new Prisma.Decimal(totalAmount),
        amountDue: new Prisma.Decimal(totalAmount),
        lines: {
          create: data.lines.map((l) => ({
            productId: l.productId,
            accountId: l.accountId,
            analyticId: l.analyticId,
            qty: l.qty,
            unitPrice: new Prisma.Decimal(l.unitPrice),
            subtotal: new Prisma.Decimal(l.qty * l.unitPrice),
          })),
        },
      },
      include: { lines: true },
    });
  }

  static async confirmVendorBill(billId: string) {
    return prisma.$transaction(async (tx) => {
      const bill = await tx.vendorBill.findUnique({
        where: { id: billId },
        include: { lines: true },
      });

      if (!bill) throw new Error("Vendor Bill not found");
      if (bill.status === "CONFIRMED") throw new Error("Bill is already confirmed");

      const totalNum = bill.totalAmount.toNumber();

      // Trigger Accounting Engine: Purchase Expense (Dr) / Creditor A/c (Cr)
      const journalEntry = await AccountingEngine.postAutomatedJournalEntry(tx, {
        journalName: "Purchase",
        partnerId: bill.vendorId,
        reference: bill.billNo,
        items: [
          { accountName: "Purchase Expense", debit: totalNum, credit: 0 },
          { accountName: "Creditors", debit: 0, credit: totalNum },
        ],
      });

      return tx.vendorBill.update({
        where: { id: billId },
        data: {
          status: "CONFIRMED",
          journalEntryId: journalEntry.id,
        },
        include: { journalEntry: true },
      });
    });
  }

  // --- SALES ORDERS ---
  static async createSalesOrder(data: {
    customerId: string;
    soDate: Date;
    lines: Array<{ productId: string; qty: number; unitPrice: number }>;
  }) {
    const totalAmount = data.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
    const count = await prisma.salesOrder.count();
    const soNo = `S${(count + 1).toString().padStart(5, "0")}`;

    return prisma.salesOrder.create({
      data: {
        soNo,
        customerId: data.customerId,
        soDate: data.soDate,
        totalAmount: new Prisma.Decimal(totalAmount),
        lines: {
          create: data.lines.map((l) => ({
            productId: l.productId,
            qty: l.qty,
            unitPrice: new Prisma.Decimal(l.unitPrice),
            subtotal: new Prisma.Decimal(l.qty * l.unitPrice),
          })),
        },
      },
      include: { lines: true },
    });
  }

  // --- CUSTOMER INVOICES ---
  static async createCustomerInvoice(data: {
    customerId: string;
    reference?: string;
    salesOrderId?: string;
    invoiceDate: Date;
    dueDate: Date;
    lines: Array<{ productId: string; accountId: string; analyticId?: string; qty: number; unitPrice: number }>;
  }) {
    const totalAmount = data.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
    const count = await prisma.customerInvoice.count();
    const invoiceNo = `INV/${new Date().getFullYear()}/${(count + 1).toString().padStart(4, "0")}`;

    return prisma.customerInvoice.create({
      data: {
        invoiceNo,
        customerId: data.customerId,
        reference: data.reference,
        salesOrderId: data.salesOrderId,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        totalAmount: new Prisma.Decimal(totalAmount),
        amountDue: new Prisma.Decimal(totalAmount),
        lines: {
          create: data.lines.map((l) => ({
            productId: l.productId,
            accountId: l.accountId,
            analyticId: l.analyticId,
            qty: l.qty,
            unitPrice: new Prisma.Decimal(l.unitPrice),
            subtotal: new Prisma.Decimal(l.qty * l.unitPrice),
          })),
        },
      },
      include: { lines: true },
    });
  }

  static async confirmCustomerInvoice(invoiceId: string) {
    return prisma.$transaction(async (tx) => {
      const invoice = await tx.customerInvoice.findUnique({
        where: { id: invoiceId },
        include: { lines: true },
      });

      if (!invoice) throw new Error("Customer Invoice not found");
      if (invoice.status === "CONFIRMED") throw new Error("Invoice is already confirmed");

      const totalNum = invoice.totalAmount.toNumber();

      // Trigger Accounting Engine: Debtor A/c (Dr) / Sales Income (Cr)
      const journalEntry = await AccountingEngine.postAutomatedJournalEntry(tx, {
        journalName: "Sales",
        partnerId: invoice.customerId,
        reference: invoice.invoiceNo,
        items: [
          { accountName: "Debtors", debit: totalNum, credit: 0 },
          { accountName: "Sales Income", debit: 0, credit: totalNum },
        ],
      });

      return tx.customerInvoice.update({
        where: { id: invoiceId },
        data: {
          status: "CONFIRMED",
          journalEntryId: journalEntry.id,
        },
        include: { journalEntry: true },
      });
    });
  }

  // --- PAYMENTS ---
  static async registerPayment(data: {
    paymentType: "SEND" | "RECEIVE";
    partnerId: string;
    amount: number;
    paymentVia: "BANK" | "CASH";
    note?: string;
    vendorBillId?: string;
    customerInvoiceId?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const payAmount = new Prisma.Decimal(data.amount);
      const journalName = data.paymentVia === "BANK" ? "Bank" : "Cash";

      let bill = null;
      let invoice = null;

      if (data.vendorBillId) {
        bill = await tx.vendorBill.findUnique({ where: { id: data.vendorBillId } });
        if (!bill) throw new Error("Vendor bill not found");
        if (payAmount.gt(bill.amountDue)) throw new Error("Payment exceeds remaining amount due");
      }

      if (data.customerInvoiceId) {
        invoice = await tx.customerInvoice.findUnique({ where: { id: data.customerInvoiceId } });
        if (!invoice) throw new Error("Customer invoice not found");
        if (payAmount.gt(invoice.amountDue)) throw new Error("Payment exceeds remaining amount due");
      }

      // Accounting trigger for Payments
      let items: Array<{ accountName: string; debit: number; credit: number }> = [];
      if (data.paymentType === "SEND") {
        // Bill payment: Creditors (Dr) / Bank or Cash (Cr)
        items = [
          { accountName: "Creditors", debit: data.amount, credit: 0 },
          { accountName: data.paymentVia === "BANK" ? "Bank" : "Cash", debit: 0, credit: data.amount },
        ];
      } else {
        // Invoice payment: Bank or Cash (Dr) / Debtors (Cr)
        items = [
          { accountName: data.paymentVia === "BANK" ? "Bank" : "Cash", debit: data.amount, credit: 0 },
          { accountName: "Debtors", debit: 0, credit: data.amount },
        ];
      }

      const journalEntry = await AccountingEngine.postAutomatedJournalEntry(tx, {
        journalName,
        partnerId: data.partnerId,
        reference: bill ? bill.billNo : invoice ? invoice.invoiceNo : "Direct Payment",
        items,
      });

      const payment = await tx.payment.create({
        data: {
          paymentType: data.paymentType,
          partnerId: data.partnerId,
          amount: payAmount,
          paymentVia: data.paymentVia,
          note: data.note,
          vendorBillId: data.vendorBillId,
          customerInvoiceId: data.customerInvoiceId,
          journalEntryId: journalEntry.id,
        },
      });

      // Update Bill balance and status
      if (bill) {
        const newDue = bill.amountDue.sub(payAmount);
        const paymentState = newDue.equals(0) ? "PAID" : "PARTIAL";
        await tx.vendorBill.update({
          where: { id: bill.id },
          data: { amountDue: newDue, paymentState },
        });
      }

      // Update Invoice balance and status
      if (invoice) {
        const newDue = invoice.amountDue.sub(payAmount);
        const paymentState = newDue.equals(0) ? "PAID" : "PARTIAL";
        await tx.customerInvoice.update({
          where: { id: invoice.id },
          data: { amountDue: newDue, paymentState },
        });
      }

      return payment;
    });
  }
}