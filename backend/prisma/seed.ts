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

  // Seed Initial Contacts
  const contactsData = [
    { name: "Open Wood Corp", type: "VENDOR" as const, email: "vendor@openwood.com", phone: "+91 98765 43210", address: "Plot 45, Timber Market", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    { name: "Joey Wills & Co", type: "CUSTOMER" as const, email: "joey@willsenterprise.com", phone: "+91 91234 56789", address: "Tower B, Cyber City", city: "Bengaluru", state: "Karnataka", pincode: "560001" },
    { name: "Deco Addict", type: "BOTH" as const, email: "hello@decoaddict.in", phone: "+91 99887 76655", address: "Shop 12, Design Mall", city: "Delhi", state: "Delhi", pincode: "110001" },
  ];

  for (const c of contactsData) {
    await prisma.contact.upsert({
      where: { email: c.email },
      update: {},
      create: c,
    });
  }

  // Seed Initial Analytics
  const analyticsData = [
    { name: "Enterprise Corporate Sales", type: "INCOME" as const },
    { name: "Product Manufacturing & Logistics", type: "EXPENSE" as const },
    { name: "Marketing & Campaigns", type: "EXPENSE" as const },
  ];

  for (const a of analyticsData) {
    const existing = await prisma.analytic.findFirst({ where: { name: a.name } });
    if (!existing) {
      await prisma.analytic.create({ data: a });
    }
  }

  // Seed Initial Products
  const productsData = [
    { name: "Air Conditioner Pro 2.5T", category: "Appliances", salesPrice: 45000, cost: 32000, type: "GOODS" as const },
    { name: "Executive Wooden Desk", category: "Office Furniture", salesPrice: 28000, cost: 18000, type: "GOODS" as const },
    { name: "Ergonomic Mesh Chair", category: "Office Furniture", salesPrice: 15000, cost: 9500, type: "GOODS" as const },
    { name: "Interior Installation Service", category: "Services", salesPrice: 8000, cost: 3000, type: "SERVICE" as const },
  ];

  for (const p of productsData) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          category: p.category,
          salesPrice: p.salesPrice,
          cost: p.cost,
          type: p.type,
        },
      });
    }
  }

  console.log("Seeding complete: Master Chart of Accounts, Journals, Admin, Contacts, Products, and Analytics created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });