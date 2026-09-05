import { prisma } from "../lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany({ include: { contact: true } });
  console.log("USERS:", JSON.stringify(users.map(u => ({ id: u.id, loginId: u.loginId, email: u.email, role: u.role, contact: u.contact?.name })), null, 2));

  const contacts = await prisma.contact.findMany();
  console.log("CONTACTS (" + contacts.length + "):", JSON.stringify(contacts.map(c => ({ id: c.id, name: c.name, type: c.type, email: c.email })), null, 2));

  const invoices = await prisma.customerInvoice.findMany({ include: { customer: true, payments: true } });
  console.log("INVOICES (" + invoices.length + "):", JSON.stringify(invoices.map(i => ({ no: i.invoiceNo, customer: i.customer.name, total: i.totalAmount, due: i.amountDue, status: i.status, paymentState: i.paymentState, payments: i.payments.length })), null, 2));

  const bills = await prisma.vendorBill.findMany({ include: { vendor: true, payments: true } });
  console.log("BILLS (" + bills.length + "):", JSON.stringify(bills.map(b => ({ no: b.billNo, vendor: b.vendor.name, total: b.totalAmount, due: b.amountDue, status: b.status, paymentState: b.paymentState, payments: b.payments.length })), null, 2));

  const payments = await prisma.payment.findMany({ include: { partner: true } });
  console.log("PAYMENTS (" + payments.length + "):", JSON.stringify(payments.map(p => ({ type: p.paymentType, partner: p.partner.name, amount: p.amount, via: p.paymentVia, note: p.note })), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
