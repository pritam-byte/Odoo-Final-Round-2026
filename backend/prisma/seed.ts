import { PrismaClient, AccountType, JournalType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const accountsData = [
    { name: "Bank", type: AccountType.ASSET },
    { name: "Cash", type: AccountType.ASSET },
    { name: "Debtors", type: AccountType.ASSET },
    { name: "Creditors", type: AccountType.LIABILITY },
    { name: "Sales Income", type: AccountType.INCOME },
    { name: "Purchase Expense", type: AccountType.EXPENSE },
    { name: "Other Expense", type: AccountType.EXPENSE },
  ];

  for (const acc of accountsData) {
    await prisma.chartOfAccount.upsert({
      where: { name: acc.name },
      update: {},
      create: acc,
    });
  }

  const bankAcc = await prisma.chartOfAccount.findUnique({ where: { name: "Bank" } });
  const cashAcc = await prisma.chartOfAccount.findUnique({ where: { name: "Cash" } });

  const journalsData = [
    { name: "Sales", type: JournalType.SALES },
    { name: "Purchase", type: JournalType.PURCHASE },
    { name: "Bank", type: JournalType.BANK, defaultAccountId: bankAcc?.id },
    { name: "Cash", type: JournalType.CASH, defaultAccountId: cashAcc?.id },
  ];

  for (const j of journalsData) {
    await prisma.journal.upsert({
      where: { name: j.name },
      update: {},
      create: j,
    });
  }

  const hashedPassword = await bcrypt.hash("Admin@1234", 10);
  await prisma.user.upsert({
    where: { loginId: "admin01" },
    update: {},
    create: {
      loginId: "admin01",
      email: "admin@urbanfurniture.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Seeding complete: Master Chart of Accounts, Journals, and Admin created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });