import { prisma } from "../lib/prisma.js";
import { AccountType, Prisma, PaymentType, InvoiceBillStatus } from "@prisma/client";

export interface DateFilterParams {
  months?: number;
  startDate?: Date;
  endDate?: Date;
  period?: "30d" | "6m" | "fy" | "custom" | "all";
}

export class DashboardService {
  /**
   * Helper to normalize date boundaries based on months or period parameter
   */
  private static getDateRange(params: DateFilterParams): { start: Date; end: Date; monthsCount: number } {
    const end = params.endDate ? new Date(params.endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    let start = params.startDate ? new Date(params.startDate) : new Date();
    let monthsCount = params.months || 6;

    if (params.period === "30d") {
      start = new Date();
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      monthsCount = 1;
    } else if (params.period === "6m") {
      start = new Date();
      start.setMonth(start.getMonth() - 5, 1);
      start.setHours(0, 0, 0, 0);
      monthsCount = 6;
    } else if (params.period === "fy") {
      const now = new Date();
      // Indian Financial Year: April 1 to March 31
      const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      start = new Date(currentYear, 3, 1, 0, 0, 0, 0);
      monthsCount = 12;
    } else if (params.months) {
      start = new Date();
      start.setMonth(start.getMonth() - (params.months - 1), 1);
      start.setHours(0, 0, 0, 0);
      monthsCount = params.months;
    } else if (!params.startDate) {
      start = new Date();
      start.setMonth(start.getMonth() - 5, 1);
      start.setHours(0, 0, 0, 0);
      monthsCount = 6;
    }

    return { start, end, monthsCount };
  }

  /**
   * 1. GET /api/dashboard/summary
   * High-level metrics for dashboard stat cards
   */
  static async getSummary() {
    // 1. Receivables: Unpaid customer invoices
    const openInvoices = await prisma.customerInvoice.findMany({
      where: {
        status: { in: ["CONFIRMED"] },
      },
      select: { amountDue: true },
    });
    const totalReceivables = openInvoices.reduce(
      (sum, inv) => sum + inv.amountDue.toNumber(),
      0
    );

    // 2. Payables: Unpaid vendor bills
    const openBills = await prisma.vendorBill.findMany({
      where: {
        status: { in: ["CONFIRMED"] },
      },
      select: { amountDue: true },
    });
    const totalPayables = openBills.reduce(
      (sum, bill) => sum + bill.amountDue.toNumber(),
      0
    );

    // 3. Liquid Cash & Bank Position: Sum debit - credit for ASSET accounts with Bank / Cash in name
    const cashBankAccounts = await prisma.chartOfAccount.findMany({
      where: {
        type: AccountType.ASSET,
        OR: [
          { name: { contains: "Bank", mode: "insensitive" } },
          { name: { contains: "Cash", mode: "insensitive" } },
        ],
      },
      include: {
        journalItems: {
          where: {
            journalEntry: { status: "POSTED" },
          },
          select: { debit: true, credit: true },
        },
      },
    });

    let totalLiquidCash = 0;
    for (const acc of cashBankAccounts) {
      for (const item of acc.journalItems) {
        totalLiquidCash += item.debit.toNumber() - item.credit.toNumber();
      }
    }

    // 4. Budgets Count
    const activeBudgets = await prisma.budget.findMany({
      where: { status: { in: ["CONFIRMED", "DRAFT"] } },
      select: { id: true, status: true },
    });
    const activeBudgetsCount = activeBudgets.filter((b) => b.status === "CONFIRMED").length;

    // 5. Total all-time posted Revenue and Expenses
    const incomeItems = await prisma.journalItem.findMany({
      where: {
        journalEntry: { status: "POSTED" },
        account: { type: AccountType.INCOME },
      },
      select: { debit: true, credit: true },
    });
    const totalRevenue = incomeItems.reduce(
      (acc, item) => acc + (item.credit.toNumber() - item.debit.toNumber()),
      0
    );

    const expenseItems = await prisma.journalItem.findMany({
      where: {
        journalEntry: { status: "POSTED" },
        account: { type: AccountType.EXPENSE },
      },
      select: { debit: true, credit: true },
    });
    const totalExpenses = expenseItems.reduce(
      (acc, item) => acc + (item.debit.toNumber() - item.credit.toNumber()),
      0
    );

    return {
      totalReceivables,
      totalPayables,
      totalLiquidCash,
      activeBudgetsCount,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
    };
  }

  /**
   * 2. GET /api/dashboard/financial-trend
   * Monthly Revenue vs Expenses line chart (calculated ONLY from posted journal entries)
   * Revenue = Income-account credits - debits
   * Expenses = Expense-account debits - credits
   * Profit = Revenue - Expenses
   */
  static async getFinancialTrend(params: DateFilterParams) {
    const { start, end } = this.getDateRange(params);

    // Fetch posted journal items for Income and Expense accounts
    const items = await prisma.journalItem.findMany({
      where: {
        journalEntry: {
          status: "POSTED",
          accountingDate: {
            gte: start,
            lte: end,
          },
        },
        account: {
          type: { in: [AccountType.INCOME, AccountType.EXPENSE] },
        },
      },
      include: {
        account: { select: { type: true } },
        journalEntry: { select: { accountingDate: true } },
      },
    });

    // Build map of months in chronological order
    const monthMap = new Map<
      string,
      { month: string; rawDate: Date; revenue: number; expenses: number; profit: number }
    >();

    const cursor = new Date(start);
    cursor.setDate(1);
    while (cursor <= end) {
      const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = cursor.toLocaleString("default", { month: "short", year: "2-digit" });
      monthMap.set(monthKey, {
        month: monthLabel,
        rawDate: new Date(cursor),
        revenue: 0,
        expenses: 0,
        profit: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    let hasNonZeroData = false;

    for (const item of items) {
      const date = item.journalEntry.accountingDate;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthMap.get(monthKey);
      if (!entry) continue;

      const debit = item.debit.toNumber();
      const credit = item.credit.toNumber();

      if (item.account.type === AccountType.INCOME) {
        const netInc = credit - debit;
        entry.revenue += netInc;
        if (netInc !== 0) hasNonZeroData = true;
      } else if (item.account.type === AccountType.EXPENSE) {
        const netExp = debit - credit;
        entry.expenses += netExp;
        if (netExp !== 0) hasNonZeroData = true;
      }
    }

    const trend = Array.from(monthMap.values()).map((m) => {
      const profit = m.revenue - m.expenses;
      return {
        month: m.month,
        revenue: Math.round(m.revenue * 100) / 100,
        expenses: Math.round(m.expenses * 100) / 100,
        profit: Math.round(profit * 100) / 100,
      };
    });

    const totalRevenue = trend.reduce((s, t) => s + t.revenue, 0);
    const totalExpenses = trend.reduce((s, t) => s + t.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;

    return {
      period: { start, end },
      hasData: hasNonZeroData && items.length > 0,
      totalRevenue,
      totalExpenses,
      totalProfit,
      trend,
    };
  }

  /**
   * 3. GET /api/dashboard/cash-flow
   * Grouped vertical bars for monthly cash movement:
   * Teal: customer collections (RECEIVE)
   * Orange: vendor disbursements (SEND)
   */
  static async getCashFlow(params: DateFilterParams) {
    const { start, end } = this.getDateRange(params);

    const payments = await prisma.payment.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      select: {
        paymentType: true,
        amount: true,
        date: true,
      },
    });

    const monthMap = new Map<
      string,
      { month: string; received: number; paid: number; netCash: number }
    >();

    const cursor = new Date(start);
    cursor.setDate(1);
    while (cursor <= end) {
      const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = cursor.toLocaleString("default", { month: "short", year: "2-digit" });
      monthMap.set(monthKey, {
        month: monthLabel,
        received: 0,
        paid: 0,
        netCash: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    let hasNonZeroData = false;

    for (const p of payments) {
      const date = p.date;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthMap.get(monthKey);
      if (!entry) continue;

      const amt = p.amount.toNumber();
      if (amt > 0) hasNonZeroData = true;

      if (p.paymentType === PaymentType.RECEIVE) {
        entry.received += amt;
      } else if (p.paymentType === PaymentType.SEND) {
        entry.paid += amt;
      }
    }

    const cashFlow = Array.from(monthMap.values()).map((c) => ({
      month: c.month,
      received: Math.round(c.received * 100) / 100,
      paid: Math.round(c.paid * 100) / 100,
      netCash: Math.round((c.received - c.paid) * 100) / 100,
    }));

    const totalReceived = cashFlow.reduce((s, c) => s + c.received, 0);
    const totalPaid = cashFlow.reduce((s, c) => s + c.paid, 0);

    return {
      period: { start, end },
      hasData: hasNonZeroData && payments.length > 0,
      totalReceived,
      totalPaid,
      cashFlow,
    };
  }

  /**
   * 4. GET /api/dashboard/receivables-aging
   * Aging horizontal bar chart:
   * - Not overdue
   * - 1–30 days
   * - 31–60 days
   * - 61–90 days
   * - 90+ days
   */
  static async getReceivablesAging() {
    const openInvoices = await prisma.customerInvoice.findMany({
      where: {
        status: "CONFIRMED",
        amountDue: { gt: 0 },
      },
      select: {
        id: true,
        invoiceNo: true,
        dueDate: true,
        totalAmount: true,
        amountDue: true,
        customerId: true,
        customer: { select: { name: true } },
      },
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const buckets = [
      { range: "Not overdue", minDays: -Infinity, maxDays: 0, amount: 0, count: 0 },
      { range: "1–30 days", minDays: 1, maxDays: 30, amount: 0, count: 0 },
      { range: "31–60 days", minDays: 31, maxDays: 60, amount: 0, count: 0 },
      { range: "61–90 days", minDays: 61, maxDays: 90, amount: 0, count: 0 },
      { range: "90+ days", minDays: 91, maxDays: Infinity, amount: 0, count: 0 },
    ];

    let totalOutstanding = 0;

    for (const inv of openInvoices) {
      const due = new Date(inv.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffTime = now.getTime() - due.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const dueAmount = inv.amountDue.toNumber();

      totalOutstanding += dueAmount;

      for (const bucket of buckets) {
        if (diffDays >= bucket.minDays && diffDays <= bucket.maxDays) {
          bucket.amount += dueAmount;
          bucket.count += 1;
          break;
        }
      }
    }

    const formattedBuckets = buckets.map((b) => ({
      range: b.range,
      amount: Math.round(b.amount * 100) / 100,
      count: b.count,
    }));

    return {
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      invoiceCount: openInvoices.length,
      hasData: openInvoices.length > 0 && totalOutstanding > 0,
      buckets: formattedBuckets,
    };
  }

  /**
   * 5. GET /api/dashboard/budget-utilization
   * Horizontal progress bars for budgets:
   * Colors:
   * - Below 70%: teal
   * - 70–90%: amber
   * - Above 90%: red
   * Also gives live synchronized counts (achievedCount, budgetCount, committedCount).
   */
  static async getBudgetUtilization() {
    const budgets = await prisma.budget.findMany({
      include: {
        analytic: true,
        responsible: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const items = await Promise.all(
      budgets.map(async (b) => {
        let achieved = new Prisma.Decimal(0);

        if (b.type === "INCOME") {
          const invLines = await prisma.customerInvoiceLine.findMany({
            where: {
              analyticId: b.analyticId,
              invoice: {
                status: "CONFIRMED",
                invoiceDate: { gte: b.startDate, lte: b.endDate },
              },
            },
          });
          achieved = invLines.reduce((acc, l) => acc.add(l.subtotal), new Prisma.Decimal(0));
        } else {
          const billLines = await prisma.vendorBillLine.findMany({
            where: {
              analyticId: b.analyticId,
              bill: {
                status: "CONFIRMED",
                billDate: { gte: b.startDate, lte: b.endDate },
              },
            },
          });
          achieved = billLines.reduce((acc, l) => acc.add(l.subtotal), new Prisma.Decimal(0));
        }

        const committed = b.committedAmount.toNumber();
        const achievedVal = achieved.toNumber();
        const percent = committed > 0 ? Math.round((achievedVal / committed) * 100) : 0;

        let color: "teal" | "amber" | "red" = "teal";
        if (percent > 90) {
          color = "red";
        } else if (percent >= 70) {
          color = "amber";
        }

        return {
          id: b.id,
          name: b.name,
          type: b.type,
          status: b.status,
          analyticName: b.analytic.name,
          responsibleName: b.responsible.name,
          committedAmount: committed,
          achievedAmount: achievedVal,
          utilizationPercent: percent,
          color,
        };
      })
    );

    const achievedCount = items.filter((b) => b.achievedAmount > 0).length;
    const budgetCount = items.length;
    const committedCount = items.filter((b) => b.committedAmount > 0).length;

    return {
      hasData: items.length > 0,
      achievedCount,
      budgetCount,
      committedCount,
      budgets: items,
    };
  }

  /**
   * 6. GET /api/dashboard/top-debtors?limit=5
   * Horizontal ranking bar graph showing top 5 largest unpaid balances.
   */
  static async getTopDebtors(limit: number = 5) {
    const debtors = await prisma.contact.findMany({
      where: {
        customerInvoices: {
          some: {
            status: "CONFIRMED",
            amountDue: { gt: 0 },
          },
        },
      },
      include: {
        customerInvoices: {
          where: {
            status: "CONFIRMED",
            amountDue: { gt: 0 },
          },
          select: {
            id: true,
            invoiceNo: true,
            dueDate: true,
            amountDue: true,
          },
        },
      },
    });

    const now = new Date();
    const ranked = debtors
      .map((c) => {
        const totalDue = c.customerInvoices.reduce(
          (sum, inv) => sum + inv.amountDue.toNumber(),
          0
        );
        const overdueCount = c.customerInvoices.filter(
          (inv) => new Date(inv.dueDate) < now
        ).length;

        return {
          customerId: c.id,
          customerName: c.name,
          customerEmail: c.email,
          outstandingAmount: Math.round(totalDue * 100) / 100,
          invoiceCount: c.customerInvoices.length,
          overdueCount,
        };
      })
      .filter((d) => d.outstandingAmount > 0)
      .sort((a, b) => b.outstandingAmount - a.outstandingAmount)
      .slice(0, limit);

    const totalDebtorsBalance = ranked.reduce((s, d) => s + d.outstandingAmount, 0);

    return {
      hasData: ranked.length > 0,
      totalOutstanding: totalDebtorsBalance,
      debtors: ranked,
    };
  }

  /**
   * 7. GET /api/dashboard/recent-activity?limit=10
   * Real-time stream of latest journal postings, invoices, bills, and payments
   */
  static async getRecentActivity(limit: number = 10) {
    // 1. Invoices
    const invoices = await prisma.customerInvoice.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
    });

    // 2. Bills
    const bills = await prisma.vendorBill.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { vendor: { select: { name: true } } },
    });

    // 3. Payments
    const payments = await prisma.payment.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { partner: { select: { name: true } } },
    });

    // 4. Journal Entries
    const entries = await prisma.journalEntry.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { journal: { select: { name: true } } },
    });

    const allEvents = [
      ...invoices.map((inv) => ({
        id: `inv-${inv.id}`,
        type: "INVOICE" as const,
        reference: inv.invoiceNo,
        partnerName: inv.customer.name,
        amount: inv.totalAmount.toNumber(),
        date: inv.invoiceDate,
        createdAt: inv.createdAt,
        status: inv.status,
        paymentState: inv.paymentState,
        description: `Customer Invoice ${inv.invoiceNo} • ${inv.customer.name}`,
      })),
      ...bills.map((bill) => ({
        id: `bill-${bill.id}`,
        type: "BILL" as const,
        reference: bill.billNo,
        partnerName: bill.vendor.name,
        amount: bill.totalAmount.toNumber(),
        date: bill.billDate,
        createdAt: bill.createdAt,
        status: bill.status,
        paymentState: bill.paymentState,
        description: `Vendor Bill ${bill.billNo} • ${bill.vendor.name}`,
      })),
      ...payments.map((pay) => ({
        id: `pay-${pay.id}`,
        type: "PAYMENT" as const,
        reference: pay.paymentType === PaymentType.RECEIVE ? "Payment In" : "Payment Out",
        partnerName: pay.partner.name,
        amount: pay.amount.toNumber(),
        date: pay.date,
        createdAt: pay.createdAt,
        status: "POSTED",
        paymentState: pay.paymentType,
        description: `${pay.paymentType === PaymentType.RECEIVE ? "Collection from" : "Disbursement to"} ${pay.partner.name}`,
      })),
      ...entries.map((je) => ({
        id: `je-${je.id}`,
        type: "JOURNAL_ENTRY" as const,
        reference: je.entryNo,
        partnerName: je.journal.name,
        amount: je.totalDebit.toNumber(),
        date: je.accountingDate,
        createdAt: je.createdAt,
        status: je.status,
        paymentState: "BALANCED",
        description: `Ledger Entry ${je.entryNo} (${je.journal.name})`,
      })),
    ];

    allEvents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const activities = allEvents.slice(0, limit);

    return {
      hasData: activities.length > 0,
      activities,
    };
  }
}
