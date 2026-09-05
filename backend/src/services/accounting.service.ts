import { Prisma, PrismaClient } from "@prisma/client";

export class AccountingEngine {
  /**
   * Automatically creates and posts a balanced Journal Entry for Vendor Bills or Customer Invoices.
   * Hard Rule: Total Debit MUST equal Total Credit.
   */
  static async postAutomatedJournalEntry(
    tx: Prisma.TransactionClient,
    params: {
      journalName: "Purchase" | "Sales" | "Bank" | "Cash";
      partnerId: string;
      reference: string;
      items: Array<{
        accountName: string;
        debit: number;
        credit: number;
      }>;
    }
  ) {
    const journal = await tx.journal.findUnique({
      where: { name: params.journalName },
    });

    if (!journal) {
      throw new Error(`Journal '${params.journalName}' not found.`);
    }

    // Resolve Account IDs from Account Names
    const resolvedItems = await Promise.all(
      params.items.map(async (item) => {
        const acc = await tx.chartOfAccount.findUnique({
          where: { name: item.accountName },
        });
        if (!acc) {
          throw new Error(`Account '${item.accountName}' not found in Chart of Accounts.`);
        }
        return {
          accountId: acc.id,
          debit: new Prisma.Decimal(item.debit),
          credit: new Prisma.Decimal(item.credit),
        };
      })
    );

    const totalDebit = resolvedItems.reduce(
      (sum, item) => sum.add(item.debit),
      new Prisma.Decimal(0)
    );
    const totalCredit = resolvedItems.reduce(
      (sum, item) => sum.add(item.credit),
      new Prisma.Decimal(0)
    );

    // Rule: Total Debit must equal Total Credit
    if (!totalDebit.equals(totalCredit)) {
      throw new Error(
        `Journal entry out of balance! Total Debit (${totalDebit}) must equal Total Credit (${totalCredit}).`
      );
    }

    // Auto-generate entry sequence number
    const count = await tx.journalEntry.count();
    const entryNo = `JE/${new Date().getFullYear()}/${(count + 1).toString().padStart(5, "0")}`;

    return tx.journalEntry.create({
      data: {
        entryNo,
        journalId: journal.id,
        reference: params.reference,
        status: "POSTED",
        totalDebit,
        totalCredit,
        items: {
          create: resolvedItems.map((ri) => ({
            accountId: ri.accountId,
            partnerId: params.partnerId,
            debit: ri.debit,
            credit: ri.credit,
          })),
        },
      },
    });
  }
}