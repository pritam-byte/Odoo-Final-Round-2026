import { prisma } from "../lib/prisma.js";
import { Prisma, BudgetStatus } from "@prisma/client";

export class BudgetService {
  static async createBudget(data: {
    name: string;
    startDate: Date;
    endDate: Date;
    analyticId: string;
    responsibleId: string;
    committedAmount: number;
  }) {
    const analytic = await prisma.analytic.findUnique({
      where: { id: data.analyticId },
    });
    if (!analytic) throw new Error("Analytic account not found");

    return prisma.budget.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        analyticId: data.analyticId,
        type: analytic.type,
        responsibleId: data.responsibleId,
        committedAmount: new Prisma.Decimal(data.committedAmount),
        status: "DRAFT",
      },
    });
  }

  static async confirmBudget(budgetId: string) {
    return prisma.budget.update({
      where: { id: budgetId },
      data: { status: "CONFIRMED" },
    });
  }

  static async cancelBudget(budgetId: string) {
    return prisma.budget.update({
      where: { id: budgetId },
      data: { status: "CANCELLED" },
    });
  }

  static async reviseBudget(budgetId: string, newCommittedAmount: number) {
    return prisma.$transaction(async (tx) => {
      const oldBudget = await tx.budget.findUnique({ where: { id: budgetId } });
      if (!oldBudget) throw new Error("Budget not found");

      // Mark old budget REVISED
      await tx.budget.update({
        where: { id: budgetId },
        data: { status: "REVISED" },
      });

      // Create revised child budget
      return tx.budget.create({
        data: {
          name: `${oldBudget.name} Revised`,
          startDate: oldBudget.startDate,
          endDate: oldBudget.endDate,
          analyticId: oldBudget.analyticId,
          type: oldBudget.type,
          responsibleId: oldBudget.responsibleId,
          committedAmount: new Prisma.Decimal(newCommittedAmount),
          status: "CONFIRMED",
          revisedFromId: oldBudget.id,
        },
      });
    });
  }

  static async getBudgetsWithProgress() {
    const budgets = await prisma.budget.findMany({
      include: {
        analytic: true,
        responsible: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = await Promise.all(
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

        const committedNum = b.committedAmount.toNumber();
        const achievedNum = achieved.toNumber();
        const achievedPct = committedNum > 0 ? (achievedNum / committedNum) * 100 : 0;
        const amountToAchieve = committedNum - achievedNum;

        return {
          ...b,
          achievedAmount: achievedNum,
          achievedPercentage: Number(achievedPct.toFixed(2)),
          amountToAchieve,
        };
      })
    );

    return enriched;
  }
}