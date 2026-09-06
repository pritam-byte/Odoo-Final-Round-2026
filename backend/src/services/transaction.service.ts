import { prisma } from "../lib/prisma.js";
import { AccountingEngine } from "./accounting.service.js";
import { Prisma } from "@prisma/client";

export class TransactionService {
  private static async validateProductLimits(lines: Array<{ productId: string; qty: number }>) {
    for (const line of lines) {
      if (!line.productId) continue;
      const prod = await prisma.product.findUnique({ where: { id: line.productId } });
      if (prod && (prod as any).maxQuantity && (prod as any).maxQuantity > 0 && line.qty > (prod as any).maxQuantity) {
        throw new Error(
          `Quantity (${line.qty}) exceeds the maximum allowed limit of ${(prod as any).maxQuantity} for product "${prod.name}". Please reduce the quantity.`
        );
      }
    }
  }

  // --- PURCHASE ORDERS ---
  static async createPurchaseOrder(data: {
    vendorId: string;
    poDate: Date;
    paymentTerms?: string;
    lines: Array<{ productId: string; analyticId?: string; qty: number; unitPrice: number }>;
  }) {
    await TransactionService.validateProductLimits(data.lines);
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
    await TransactionService.validateProductLimits(data.lines);
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
    // --- BUDGET ENFORCEMENT (outside transaction so we can throw cleanly) ---
    const bill = await prisma.vendorBill.findUnique({
      where: { id: billId },
      include: { lines: true },
    });
    if (!bill) throw new Error("Vendor Bill not found");
    if (bill.status === "CONFIRMED") throw new Error("Bill is already confirmed");

    for (const line of bill.lines) {
      if (!line.analyticId) continue;

      const budget = await prisma.budget.findFirst({
        where: {
          analyticId: line.analyticId,
          type: "EXPENSE",
          status: "CONFIRMED",
          startDate: { lte: bill.billDate },
          endDate: { gte: bill.billDate },
        },
      });

      if (!budget) continue;

      // Sum all already-confirmed bill lines for this analytic in the budget period
      const spentLines = await prisma.vendorBillLine.findMany({
        where: {
          analyticId: line.analyticId,
          bill: {
            id: { not: billId }, // exclude this bill itself
            status: "CONFIRMED",
            billDate: { gte: budget.startDate, lte: budget.endDate },
          },
        },
      });
      const alreadySpent = spentLines.reduce(
        (acc, l) => acc.add(l.subtotal),
        new Prisma.Decimal(0)
      );
      const remaining = budget.committedAmount.sub(alreadySpent);

      if (line.subtotal.gt(remaining)) {
        const analyticRecord = await prisma.analytic.findUnique({ where: { id: line.analyticId } });
        const analyticName = analyticRecord?.name ?? line.analyticId;
        throw new Error(
          `BUDGET_EXCEEDED: Bill line exceeds the approved budget for analytic "${analyticName}". ` +
          `Budget limit: ₹${budget.committedAmount.toFixed(2)}, ` +
          `already spent: ₹${alreadySpent.toFixed(2)}, ` +
          `remaining: ₹${remaining.toFixed(2)}, ` +
          `this line: ₹${line.subtotal.toFixed(2)}.`
        );
      }
    }

    // --- ACCOUNTING POST ---
    return prisma.$transaction(async (tx) => {
      const totalNum = bill.totalAmount.toNumber();

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
    await TransactionService.validateProductLimits(data.lines);
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
    await TransactionService.validateProductLimits(data.lines);
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
    // --- BUDGET ENFORCEMENT (outside transaction so we can throw cleanly) ---
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: invoiceId },
      include: { lines: true },
    });
    if (!invoice) throw new Error("Customer Invoice not found");
    if (invoice.status === "CONFIRMED") throw new Error("Invoice is already confirmed");

    for (const line of invoice.lines) {
      if (!line.analyticId) continue;

      const budget = await prisma.budget.findFirst({
        where: {
          analyticId: line.analyticId,
          type: "INCOME",
          status: "CONFIRMED",
          startDate: { lte: invoice.invoiceDate },
          endDate: { gte: invoice.invoiceDate },
        },
      });

      if (!budget) continue;

      // Sum already-confirmed invoice lines for this analytic in the budget period
      const earnedLines = await prisma.customerInvoiceLine.findMany({
        where: {
          analyticId: line.analyticId,
          invoice: {
            id: { not: invoiceId }, // exclude this invoice itself
            status: "CONFIRMED",
            invoiceDate: { gte: budget.startDate, lte: budget.endDate },
          },
        },
      });
      const alreadyEarned = earnedLines.reduce(
        (acc, l) => acc.add(l.subtotal),
        new Prisma.Decimal(0)
      );
      const remaining = budget.committedAmount.sub(alreadyEarned);

      if (line.subtotal.gt(remaining)) {
        const analyticRecord = await prisma.analytic.findUnique({ where: { id: line.analyticId } });
        const analyticName = analyticRecord?.name ?? line.analyticId;
        throw new Error(
          `BUDGET_EXCEEDED: Invoice line exceeds the approved income budget for analytic "${analyticName}". ` +
          `Budget target: ₹${budget.committedAmount.toFixed(2)}, ` +
          `already earned: ₹${alreadyEarned.toFixed(2)}, ` +
          `remaining: ₹${remaining.toFixed(2)}, ` +
          `this line: ₹${line.subtotal.toFixed(2)}.`
        );
      }
    }

    // --- ACCOUNTING POST ---
    return prisma.$transaction(async (tx) => {
      const totalNum = invoice.totalAmount.toNumber();

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

  // --- QUERY LISTS ---
  static async listPurchaseOrders() {
    return prisma.purchaseOrder.findMany({
      include: {
        vendor: true,
        lines: {
          include: { product: true, analytic: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async listVendorBills() {
    return prisma.vendorBill.findMany({
      include: {
        vendor: true,
        lines: {
          include: { product: true, account: true, analytic: true },
        },
        payments: true,
        journalEntry: {
          include: { items: { include: { account: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async listSalesOrders() {
    return prisma.salesOrder.findMany({
      include: {
        customer: true,
        lines: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async listCustomerInvoices() {
    return prisma.customerInvoice.findMany({
      include: {
        customer: true,
        lines: {
          include: { product: true, account: true, analytic: true },
        },
        payments: true,
        journalEntry: {
          include: { items: { include: { account: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async listPayments() {
    return prisma.payment.findMany({
      include: {
        partner: true,
        vendorBill: true,
        customerInvoice: true,
        journalEntry: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async listJournalEntries() {
    return prisma.journalEntry.findMany({
      include: {
        journal: true,
        items: {
          include: {
            account: true,
            partner: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}