import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=================================================");
  console.log("📊 PostgreSQL Database: urban_furniture");
  console.log("=================================================\n");

  // 1. Users
  const users = await prisma.user.findMany({
    select: { loginId: true, email: true, role: true, createdAt: true },
  });
  console.log("👤 USERS (Account Access):");
  console.table(users);

  // 2. Contacts / Partners
  const contacts = await prisma.contact.findMany({
    select: { name: true, type: true, email: true, city: true, phone: true },
  });
  console.log("\n👥 CONTACTS & PARTNERS:");
  console.table(contacts);

  // 3. Customer Invoices
  const invoices = await prisma.customerInvoice.findMany({
    select: {
      invoiceNo: true,
      customer: { select: { name: true } },
      invoiceDate: true,
      dueDate: true,
      totalAmount: true,
      amountDue: true,
      status: true,
      paymentState: true,
    },
    orderBy: { invoiceDate: "desc" },
  });
  console.log("\n📄 CUSTOMER INVOICES:");
  console.table(
    invoices.map((i) => ({
      invoiceNo: i.invoiceNo,
      customer: i.customer.name,
      date: i.invoiceDate.toISOString().split("T")[0],
      dueDate: i.dueDate.toISOString().split("T")[0],
      total: Number(i.totalAmount),
      due: Number(i.amountDue),
      status: i.status,
      paymentState: i.paymentState,
    }))
  );

  // 4. Vendor Bills
  const bills = await prisma.vendorBill.findMany({
    select: {
      billNo: true,
      vendor: { select: { name: true } },
      billDate: true,
      dueDate: true,
      totalAmount: true,
      amountDue: true,
      status: true,
      paymentState: true,
    },
    orderBy: { billDate: "desc" },
  });
  console.log("\n🧾 VENDOR BILLS (Payables):");
  console.table(
    bills.map((b) => ({
      billNo: b.billNo,
      vendor: b.vendor.name,
      date: b.billDate.toISOString().split("T")[0],
      dueDate: b.dueDate.toISOString().split("T")[0],
      total: Number(b.totalAmount),
      due: Number(b.amountDue),
      status: b.status,
      paymentState: b.paymentState,
    }))
  );

  // 5. Payments
  const payments = await prisma.payment.findMany({
    select: {
      paymentType: true,
      partner: { select: { name: true } },
      amount: true,
      paymentVia: true,
      date: true,
      note: true,
      customerInvoice: { select: { invoiceNo: true } },
      vendorBill: { select: { billNo: true } },
    },
    orderBy: { date: "desc" },
  });
  console.log("\n💳 PAYMENTS & SETTLEMENTS LEDGER:");
  console.table(
    payments.map((p) => ({
      type: p.paymentType,
      partner: p.partner.name,
      amount: Number(p.amount),
      method: p.paymentVia,
      date: p.date.toISOString().split("T")[0],
      linkedDoc: p.customerInvoice?.invoiceNo || p.vendorBill?.billNo || "Direct",
      note: p.note,
    }))
  );

  // 6. Chart of Accounts & Balances
  const accounts = await prisma.chartOfAccount.findMany({
    select: { name: true, type: true },
  });
  console.log("\n🏦 CHART OF ACCOUNTS:");
  console.table(accounts);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
