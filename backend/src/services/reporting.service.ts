import { prisma } from "../lib/prisma.js";
import { AccountType, Prisma } from "@prisma/client";

export class ReportingService {
  /**
   * Profit & Loss = Income Accounts Total - Expense Accounts Total
   * Optionally filtered by date range.
   */
  static async getProfitAndLoss(startDate?: Date, endDate?: Date) {
    const dateFilter: Prisma.JournalEntryWhereInput = {
      status: "POSTED",
      ...(startDate || endDate
        ? {
            accountingDate: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    // Aggregate journal items linked to posted entries
    const items = await prisma.journalItem.findMany({
      where: {
        journalEntry: dateFilter,
        account: {
          type: { in: [AccountType.INCOME, AccountType.EXPENSE] },
        },
      },
      include: {
        account: true,
      },
    });

    const incomeBreakdown: Record<string, number> = {};
    const expenseBreakdown: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const item of items) {
      const debit = item.debit.toNumber();
      const credit = item.credit.toNumber();
      const accName = item.account.name;

      if (item.account.type === AccountType.INCOME) {
        // Income is credited: net = credit - debit
        const netIncome = credit - debit;
        incomeBreakdown[accName] = (incomeBreakdown[accName] || 0) + netIncome;
        totalIncome += netIncome;
      } else {
        // Expense is debited: net = debit - credit
        const netExpense = debit - credit;
        expenseBreakdown[accName] = (expenseBreakdown[accName] || 0) + netExpense;
        totalExpenses += netExpense;
      }
    }

    const netProfit = totalIncome - totalExpenses;

    return {
      period: { startDate, endDate },
      income: {
        accounts: incomeBreakdown,
        total: totalIncome,
      },
      expenses: {
        accounts: expenseBreakdown,
        total: totalExpenses,
      },
      netProfit,
    };
  }

  /**
   * Balance Sheet = Assets vs Liabilities + Capital
   * Calculated up to a target date (or all-time up to today).
   */
  static async getBalanceSheet(asOfDate: Date = new Date()) {
    const items = await prisma.journalItem.findMany({
      where: {
        journalEntry: {
          status: "POSTED",
          accountingDate: { lte: asOfDate },
        },
        account: {
          type: { in: [AccountType.ASSET, AccountType.LIABILITY, AccountType.CAPITAL] },
        },
      },
      include: {
        account: true,
      },
    });

    const assetsBreakdown: Record<string, number> = {};
    const liabilitiesBreakdown: Record<string, number> = {};
    const capitalBreakdown: Record<string, number> = {};

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalCapital = 0;

    for (const item of items) {
      const debit = item.debit.toNumber();
      const credit = item.credit.toNumber();
      const accName = item.account.name;

      if (item.account.type === AccountType.ASSET) {
        // Assets are debited: net = debit - credit
        const netAsset = debit - credit;
        assetsBreakdown[accName] = (assetsBreakdown[accName] || 0) + netAsset;
        totalAssets += netAsset;
      } else if (item.account.type === AccountType.LIABILITY) {
        // Liabilities are credited: net = credit - debit
        const netLiability = credit - debit;
        liabilitiesBreakdown[accName] = (liabilitiesBreakdown[accName] || 0) + netLiability;
        totalLiabilities += netLiability;
      } else {
        // Capital is credited: net = credit - debit
        const netCap = credit - debit;
        capitalBreakdown[accName] = (capitalBreakdown[accName] || 0) + netCap;
        totalCapital += netCap;
      }
    }

    return {
      asOfDate,
      assets: {
        accounts: assetsBreakdown,
        total: totalAssets,
      },
      liabilities: {
        accounts: liabilitiesBreakdown,
        total: totalLiabilities,
      },
      capital: {
        accounts: capitalBreakdown,
        total: totalCapital,
      },
      totalLiabilitiesAndCapital: totalLiabilities + totalCapital,
    };
  }
}