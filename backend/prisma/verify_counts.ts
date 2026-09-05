import { prisma } from "../src/lib/prisma.js";

async function verify() {
  const counts = {
    ChartOfAccount: await prisma.chartOfAccount.count(),
    Journal: await prisma.journal.count(),
    Contact: await prisma.contact.count(),
    User: await prisma.user.count(),
    Product: await prisma.product.count(),
    Analytic: await prisma.analytic.count(),
    PurchaseOrder: await prisma.purchaseOrder.count(),
    PurchaseOrderLine: await prisma.purchaseOrderLine.count(),
    VendorBill: await prisma.vendorBill.count(),
    VendorBillLine: await prisma.vendorBillLine.count(),
    SalesOrder: await prisma.salesOrder.count(),
    SalesOrderLine: await prisma.salesOrderLine.count(),
    CustomerInvoice: await prisma.customerInvoice.count(),
    CustomerInvoiceLine: await prisma.customerInvoiceLine.count(),
    Payment: await prisma.payment.count(),
    JournalEntry: await prisma.journalEntry.count(),
    JournalItem: await prisma.journalItem.count(),
    Budget: await prisma.budget.count(),
  };

  console.log("=========================================");
  console.log("📦 DATABASE RECORD COUNTS PER TABLE:");
  console.log("=========================================");
  console.table(counts);
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
