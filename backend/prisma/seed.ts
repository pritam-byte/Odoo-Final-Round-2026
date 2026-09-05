import {
  PrismaClient,
  AccountType,
  JournalType,
  ContactType,
  ProductType,
  AnalyticType,
  OrderStatus,
  InvoiceBillStatus,
  PaymentState,
  PaymentType,
  PaymentMethod,
  JournalEntryStatus,
  BudgetStatus,
  Prisma,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting realistic database seed for Urban Furniture...");

  // =========================================================================
  // 1. CHART OF ACCOUNTS
  // =========================================================================
  console.log("📊 Seeding Chart of Accounts...");
  const accountsData = [
    { name: "Bank", type: AccountType.ASSET },
    { name: "Cash", type: AccountType.ASSET },
    { name: "Debtors", type: AccountType.ASSET },
    { name: "Inventory Asset", type: AccountType.ASSET },
    { name: "Creditors", type: AccountType.LIABILITY },
    { name: "Owner Capital", type: AccountType.CAPITAL },
    { name: "Sales Income", type: AccountType.INCOME },
    { name: "Service Revenue", type: AccountType.INCOME },
    { name: "Purchase Expense", type: AccountType.EXPENSE },
    { name: "Rent & Utilities", type: AccountType.EXPENSE },
    { name: "Marketing Expense", type: AccountType.EXPENSE },
    { name: "Other Expense", type: AccountType.EXPENSE },
  ];

  const accountsMap: Record<string, any> = {};
  for (const acc of accountsData) {
    const record = await prisma.chartOfAccount.upsert({
      where: { name: acc.name },
      update: {},
      create: acc,
    });
    accountsMap[acc.name] = record;
  }

  // =========================================================================
  // 2. JOURNALS
  // =========================================================================
  console.log("📑 Seeding Accounting Journals...");
  const journalsData = [
    { name: "Sales", type: JournalType.SALES, defaultAccountId: accountsMap["Sales Income"].id },
    { name: "Purchase", type: JournalType.PURCHASE, defaultAccountId: accountsMap["Purchase Expense"].id },
    { name: "Bank", type: JournalType.BANK, defaultAccountId: accountsMap["Bank"].id },
    { name: "Cash", type: JournalType.CASH, defaultAccountId: accountsMap["Cash"].id },
    { name: "General", type: JournalType.GENERAL, defaultAccountId: null },
  ];

  const journalsMap: Record<string, any> = {};
  for (const j of journalsData) {
    const record = await prisma.journal.upsert({
      where: { name: j.name },
      update: {},
      create: j,
    });
    journalsMap[j.name] = record;
  }

  // =========================================================================
  // 3. CONTACTS (Customers, Vendors, Both)
  // =========================================================================
  console.log("👥 Seeding Business Contacts...");
  const contactsData = [
    // Vendors
    {
      name: "Open Wood Corp",
      type: ContactType.VENDOR,
      email: "procurement@openwood.com",
      phone: "+91 98765 43210",
      address: "Plot 45, Timber Processing Zone",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Nordic Timber Suppliers",
      type: ContactType.VENDOR,
      email: "sales@nordictimber.in",
      phone: "+91 98234 56789",
      address: "Industrial Area 4, Phase 2",
      city: "Gandhinagar",
      state: "Gujarat",
      pincode: "382010",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Hardware Hub Ltd",
      type: ContactType.VENDOR,
      email: "orders@hardwarehub.com",
      phone: "+91 91122 33445",
      address: "Shop 102, Steel Complex",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    },
    // Customers
    {
      name: "Joey Wills & Co",
      type: ContactType.CUSTOMER,
      email: "joey@willsenterprise.com",
      phone: "+91 91234 56789",
      address: "Tower B, Cyber City Hub",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "John Doe",
      type: ContactType.CUSTOMER,
      email: "john.doe@urbanfurniture.com",
      phone: "+91 98980 12345",
      address: "Flat 402, Royal Palms Residency",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400076",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Luxe Living Interiors",
      type: ContactType.CUSTOMER,
      email: "design@luxeliving.co.in",
      phone: "+91 97766 55443",
      address: "Studio 8, High Street Avenue",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Nexus Tech Parks",
      type: ContactType.CUSTOMER,
      email: "facilities@nexustech.org",
      phone: "+91 96655 44332",
      address: "Campus 3, IT Corridor",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500081",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    },
    // Both
    {
      name: "Deco Addict Studio",
      type: ContactType.BOTH,
      email: "hello@decoaddict.in",
      phone: "+91 99887 76655",
      address: "Shop 12, Design Square Mall",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380015",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    },
  ];

  const contactsMap: Record<string, any> = {};
  for (const c of contactsData) {
    const record = await prisma.contact.upsert({
      where: { email: c.email },
      update: { image: c.image },
      create: c,
    });
    contactsMap[c.name] = record;
  }

  // =========================================================================
  // 4. USERS (Admin, Accountant, Portal Client)
  // =========================================================================
  console.log("🔐 Seeding User Accounts...");
  const adminPassword = await bcrypt.hash("Admin@1234", 10);
  const accountantPassword = await bcrypt.hash("Account@1234", 10);
  const portalPassword = await bcrypt.hash("Portal@1234", 10);

  // Admin User
  await prisma.user.upsert({
    where: { loginId: "admin01" },
    update: {},
    create: {
      loginId: "admin01",
      email: "admin@urbanfurniture.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Accountant User
  await prisma.user.upsert({
    where: { loginId: "accountant01" },
    update: {},
    create: {
      loginId: "accountant01",
      email: "accountant@urbanfurniture.com",
      password: accountantPassword,
      role: "ACCOUNTANT",
    },
  });

  // Portal User linked to John Doe Contact
  await prisma.user.upsert({
    where: { loginId: "john_client" },
    update: {},
    create: {
      loginId: "john_client",
      email: "john.doe@urbanfurniture.com",
      password: portalPassword,
      role: "PORTAL_USER",
      contactId: contactsMap["John Doe"].id,
    },
  });

  // Portal User linked to Joey Wills
  await prisma.user.upsert({
    where: { loginId: "joey_client" },
    update: {},
    create: {
      loginId: "joey_client",
      email: "joey@willsenterprise.com",
      password: portalPassword,
      role: "PORTAL_USER",
      contactId: contactsMap["Joey Wills & Co"].id,
    },
  });

  // =========================================================================
  // 5. PRODUCTS
  // =========================================================================
  console.log("🛋️ Seeding Products & Services...");
  const productsData = [
    {
      name: "Executive Solid Oak Desk",
      category: "Office Furniture",
      salesPrice: 28000,
      cost: 18000,
      type: ProductType.GOODS,
      image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Ergonomic High-Back Mesh Chair",
      category: "Office Furniture",
      salesPrice: 15000,
      cost: 9500,
      type: ProductType.GOODS,
      image: "https://images.unsplash.com/photo-1580481077197-76783d476686?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Solid Walnut Coffee Table",
      category: "Living Furniture",
      salesPrice: 22000,
      cost: 14000,
      type: ProductType.GOODS,
      image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Modular 3-Seater Velvet Sofa",
      category: "Living Furniture",
      salesPrice: 45000,
      cost: 29000,
      type: ProductType.GOODS,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Scandinavian 5-Tier Bookshelf",
      category: "Storage & Shelves",
      salesPrice: 18500,
      cost: 11000,
      type: ProductType.GOODS,
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Raw Timber Plank Lot (Grade A)",
      category: "Raw Materials",
      salesPrice: 6200,
      cost: 4500,
      type: ProductType.GOODS,
      image: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Metal Hardware Assembly Kit",
      category: "Hardware",
      salesPrice: 4900,
      cost: 3200,
      type: ProductType.GOODS,
      image: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Interior Architecture Consultation",
      category: "Professional Services",
      salesPrice: 12000,
      cost: 4000,
      type: ProductType.SERVICE,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Onsite Delivery & Custom Installation",
      category: "Professional Services",
      salesPrice: 5000,
      cost: 2000,
      type: ProductType.SERVICE,
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Full Executive Office Suite Combo",
      category: "Office Combos",
      salesPrice: 48000,
      cost: 31000,
      type: ProductType.COMBO,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&auto=format&fit=crop&q=80",
    },
  ];


  const productsMap: Record<string, any> = {};
  for (const p of productsData) {
    let record = await prisma.product.findFirst({ where: { name: p.name } });
    if (!record) {
      record = await prisma.product.create({
        data: {
          name: p.name,
          category: p.category,
          salesPrice: new Prisma.Decimal(p.salesPrice),
          cost: new Prisma.Decimal(p.cost),
          type: p.type,
          image: p.image,
        },
      });
    } else {
      record = await prisma.product.update({
        where: { id: record.id },
        data: {
          image: p.image,
        },
      });
    }
    productsMap[p.name] = record;
  }


  // =========================================================================
  // 6. ANALYTIC ACCOUNTS
  // =========================================================================
  console.log("📈 Seeding Analytic Accounts...");
  const analyticsData = [
    { name: "Enterprise Corporate Sales", type: AnalyticType.INCOME },
    { name: "Residential & Living Room Sales", type: AnalyticType.INCOME },
    { name: "Interior Consultation Revenue", type: AnalyticType.INCOME },
    { name: "Raw Material Sourcing & Procurement", type: AnalyticType.EXPENSE },
    { name: "Factory Manufacturing & Logistics", type: AnalyticType.EXPENSE },
    { name: "Marketing & Brand Advertising", type: AnalyticType.EXPENSE },
    { name: "Office Facilities & Administration", type: AnalyticType.EXPENSE },
  ];

  const analyticsMap: Record<string, any> = {};
  for (const a of analyticsData) {
    let record = await prisma.analytic.findFirst({ where: { name: a.name } });
    if (!record) {
      record = await prisma.analytic.create({ data: a });
    }
    analyticsMap[a.name] = record;
  }

  // =========================================================================
  // 7. INITIAL CAPITAL INJECTION JOURNAL ENTRY
  // =========================================================================
  console.log("🏦 Seeding Initial Balance Sheet Capital Entry...");
  const existingCapitalJE = await prisma.journalEntry.findUnique({ where: { entryNo: "JE/2026/0000" } });
  if (!existingCapitalJE) {
    await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0000",
        journalId: journalsMap["Bank"].id,
        reference: "CAPITAL-INJECTION-2026",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(500000),
        totalCredit: new Prisma.Decimal(500000),
        items: {
          create: [
            {
              accountId: accountsMap["Bank"].id,
              debit: new Prisma.Decimal(500000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Owner Capital"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(500000),
            },
          ],
        },
      },
    });
  }

  // =========================================================================
  // 8. PURCHASE TRANSACTIONS & BILLS
  // =========================================================================
  console.log("📦 Seeding Purchase Orders, Vendor Bills & Ledger Entries...");

  // PO-00001: Confirmed PO -> Confirmed Bill -> Paid
  const po1Exists = await prisma.purchaseOrder.findUnique({ where: { poNo: "P00001" } });
  if (!po1Exists) {
    const po1 = await prisma.purchaseOrder.create({
      data: {
        poNo: "P00001",
        vendorId: contactsMap["Open Wood Corp"].id,
        poDate: new Date("2026-08-01"),
        paymentTerms: "Net 30 Days",
        status: OrderStatus.CONFIRMED,
        totalAmount: new Prisma.Decimal(90000),
        lines: {
          create: [
            {
              productId: productsMap["Raw Timber Plank Lot (Grade A)"].id,
              analyticId: analyticsMap["Raw Material Sourcing & Procurement"].id,
              qty: 20,
              unitPrice: new Prisma.Decimal(4500),
              subtotal: new Prisma.Decimal(90000),
            },
          ],
        },
      },
    });

    // Journal Entry for Bill 1 (Dr Purchase Expense / Cr Creditors)
    const jeBill1 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0001",
        journalId: journalsMap["Purchase"].id,
        reference: "Bill/2026/0001",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(90000),
        totalCredit: new Prisma.Decimal(90000),
        items: {
          create: [
            {
              accountId: accountsMap["Purchase Expense"].id,
              partnerId: contactsMap["Open Wood Corp"].id,
              debit: new Prisma.Decimal(90000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Creditors"].id,
              partnerId: contactsMap["Open Wood Corp"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(90000),
            },
          ],
        },
      },
    });

    // Vendor Bill 1
    const bill1 = await prisma.vendorBill.create({
      data: {
        billNo: "Bill/2026/0001",
        billReference: "OWC-INV-8891",
        vendorId: contactsMap["Open Wood Corp"].id,
        purchaseOrderId: po1.id,
        billDate: new Date("2026-08-02"),
        dueDate: new Date("2026-09-02"),
        totalAmount: new Prisma.Decimal(90000),
        amountDue: new Prisma.Decimal(0),
        status: InvoiceBillStatus.CONFIRMED,
        paymentState: PaymentState.PAID,
        journalEntryId: jeBill1.id,
        lines: {
          create: [
            {
              productId: productsMap["Raw Timber Plank Lot (Grade A)"].id,
              accountId: accountsMap["Purchase Expense"].id,
              analyticId: analyticsMap["Raw Material Sourcing & Procurement"].id,
              qty: 20,
              unitPrice: new Prisma.Decimal(4500),
              subtotal: new Prisma.Decimal(90000),
            },
          ],
        },
      },
    });

    // Payment 1 for Bill 1 (Dr Creditors / Cr Bank)
    const jePay1 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0002",
        journalId: journalsMap["Bank"].id,
        reference: "PAY/OWC/0001",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(90000),
        totalCredit: new Prisma.Decimal(90000),
        items: {
          create: [
            {
              accountId: accountsMap["Creditors"].id,
              partnerId: contactsMap["Open Wood Corp"].id,
              debit: new Prisma.Decimal(90000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Bank"].id,
              partnerId: contactsMap["Open Wood Corp"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(90000),
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        paymentType: PaymentType.SEND,
        partnerId: contactsMap["Open Wood Corp"].id,
        amount: new Prisma.Decimal(90000),
        date: new Date("2026-08-10"),
        paymentVia: PaymentMethod.BANK,
        note: "Settlement for Bill/2026/0001",
        vendorBillId: bill1.id,
        journalEntryId: jePay1.id,
      },
    });
  }

  // PO-00002: Confirmed PO -> Confirmed Bill -> Partially Paid
  const po2Exists = await prisma.purchaseOrder.findUnique({ where: { poNo: "P00002" } });
  if (!po2Exists) {
    const po2 = await prisma.purchaseOrder.create({
      data: {
        poNo: "P00002",
        vendorId: contactsMap["Hardware Hub Ltd"].id,
        poDate: new Date("2026-08-15"),
        paymentTerms: "Immediate",
        status: OrderStatus.CONFIRMED,
        totalAmount: new Prisma.Decimal(64000),
        lines: {
          create: [
            {
              productId: productsMap["Metal Hardware Assembly Kit"].id,
              analyticId: analyticsMap["Factory Manufacturing & Logistics"].id,
              qty: 20,
              unitPrice: new Prisma.Decimal(3200),
              subtotal: new Prisma.Decimal(64000),
            },
          ],
        },
      },
    });

    const jeBill2 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0003",
        journalId: journalsMap["Purchase"].id,
        reference: "Bill/2026/0002",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(64000),
        totalCredit: new Prisma.Decimal(64000),
        items: {
          create: [
            {
              accountId: accountsMap["Purchase Expense"].id,
              partnerId: contactsMap["Hardware Hub Ltd"].id,
              debit: new Prisma.Decimal(64000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Creditors"].id,
              partnerId: contactsMap["Hardware Hub Ltd"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(64000),
            },
          ],
        },
      },
    });

    const bill2 = await prisma.vendorBill.create({
      data: {
        billNo: "Bill/2026/0002",
        billReference: "HH-9021",
        vendorId: contactsMap["Hardware Hub Ltd"].id,
        purchaseOrderId: po2.id,
        billDate: new Date("2026-08-16"),
        dueDate: new Date("2026-09-16"),
        totalAmount: new Prisma.Decimal(64000),
        amountDue: new Prisma.Decimal(34000),
        status: InvoiceBillStatus.CONFIRMED,
        paymentState: PaymentState.PARTIAL,
        journalEntryId: jeBill2.id,
        lines: {
          create: [
            {
              productId: productsMap["Metal Hardware Assembly Kit"].id,
              accountId: accountsMap["Purchase Expense"].id,
              analyticId: analyticsMap["Factory Manufacturing & Logistics"].id,
              qty: 20,
              unitPrice: new Prisma.Decimal(3200),
              subtotal: new Prisma.Decimal(64000),
            },
          ],
        },
      },
    });

    const jePay2 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0004",
        journalId: journalsMap["Bank"].id,
        reference: "PAY/HH/0001",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(30000),
        totalCredit: new Prisma.Decimal(30000),
        items: {
          create: [
            {
              accountId: accountsMap["Creditors"].id,
              partnerId: contactsMap["Hardware Hub Ltd"].id,
              debit: new Prisma.Decimal(30000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Bank"].id,
              partnerId: contactsMap["Hardware Hub Ltd"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(30000),
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        paymentType: PaymentType.SEND,
        partnerId: contactsMap["Hardware Hub Ltd"].id,
        amount: new Prisma.Decimal(30000),
        date: new Date("2026-08-20"),
        paymentVia: PaymentMethod.BANK,
        note: "Partial advance settlement",
        vendorBillId: bill2.id,
        journalEntryId: jePay2.id,
      },
    });
  }

  // PO-00003: Confirmed PO -> Confirmed Bill -> Unpaid / Due (Nordic Timber Suppliers)
  const po3Exists = await prisma.purchaseOrder.findUnique({ where: { poNo: "P00003" } });
  if (!po3Exists) {
    const po3 = await prisma.purchaseOrder.create({
      data: {
        poNo: "P00003",
        vendorId: contactsMap["Nordic Timber Suppliers"].id,
        poDate: new Date("2026-08-25"),
        paymentTerms: "Net 15 Days",
        status: OrderStatus.CONFIRMED,
        totalAmount: new Prisma.Decimal(45000),
        lines: {
          create: [
            {
              productId: productsMap["Raw Timber Plank Lot (Grade A)"].id,
              analyticId: analyticsMap["Raw Material Sourcing & Procurement"].id,
              qty: 10,
              unitPrice: new Prisma.Decimal(4500),
              subtotal: new Prisma.Decimal(45000),
            },
          ],
        },
      },
    });

    const jeBill3 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0008",
        journalId: journalsMap["Purchase"].id,
        reference: "Bill/2026/0003",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(45000),
        totalCredit: new Prisma.Decimal(45000),
        items: {
          create: [
            {
              accountId: accountsMap["Purchase Expense"].id,
              partnerId: contactsMap["Nordic Timber Suppliers"].id,
              debit: new Prisma.Decimal(45000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Creditors"].id,
              partnerId: contactsMap["Nordic Timber Suppliers"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(45000),
            },
          ],
        },
      },
    });

    await prisma.vendorBill.create({
      data: {
        billNo: "Bill/2026/0003",
        billReference: "NTS-2026-990",
        vendorId: contactsMap["Nordic Timber Suppliers"].id,
        purchaseOrderId: po3.id,
        billDate: new Date("2026-08-26"),
        dueDate: new Date("2026-09-10"),
        totalAmount: new Prisma.Decimal(45000),
        amountDue: new Prisma.Decimal(45000),
        status: InvoiceBillStatus.CONFIRMED,
        paymentState: PaymentState.NOT_PAID,
        journalEntryId: jeBill3.id,
        lines: {
          create: [
            {
              productId: productsMap["Raw Timber Plank Lot (Grade A)"].id,
              accountId: accountsMap["Purchase Expense"].id,
              analyticId: analyticsMap["Raw Material Sourcing & Procurement"].id,
              qty: 10,
              unitPrice: new Prisma.Decimal(4500),
              subtotal: new Prisma.Decimal(45000),
            },
          ],
        },
      },
    });
  }

  // PO-00004: Confirmed PO -> Bill 4 (Open Wood Corp) -> Partially Paid (₹20,000 paid, ₹28,000 due)
  const po4Exists = await prisma.purchaseOrder.findUnique({ where: { poNo: "P00004" } });
  if (!po4Exists) {
    const po4 = await prisma.purchaseOrder.create({
      data: {
        poNo: "P00004",
        vendorId: contactsMap["Open Wood Corp"].id,
        poDate: new Date("2026-08-28"),
        paymentTerms: "Net 30 Days",
        status: OrderStatus.CONFIRMED,
        totalAmount: new Prisma.Decimal(48000),
        lines: {
          create: [
            {
              productId: productsMap["Scandinavian 5-Tier Bookshelf"].id,
              analyticId: analyticsMap["Raw Material Sourcing & Procurement"].id,
              qty: 4,
              unitPrice: new Prisma.Decimal(12000),
              subtotal: new Prisma.Decimal(48000),
            },
          ],
        },
      },
    });

    const jeBill4 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0009",
        journalId: journalsMap["Purchase"].id,
        reference: "Bill/2026/0004",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(48000),
        totalCredit: new Prisma.Decimal(48000),
        items: {
          create: [
            {
              accountId: accountsMap["Purchase Expense"].id,
              partnerId: contactsMap["Open Wood Corp"].id,
              debit: new Prisma.Decimal(48000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Creditors"].id,
              partnerId: contactsMap["Open Wood Corp"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(48000),
            },
          ],
        },
      },
    });

    const bill4 = await prisma.vendorBill.create({
      data: {
        billNo: "Bill/2026/0004",
        billReference: "OWC-INV-9022",
        vendorId: contactsMap["Open Wood Corp"].id,
        purchaseOrderId: po4.id,
        billDate: new Date("2026-08-29"),
        dueDate: new Date("2026-09-28"),
        totalAmount: new Prisma.Decimal(48000),
        amountDue: new Prisma.Decimal(28000),
        status: InvoiceBillStatus.CONFIRMED,
        paymentState: PaymentState.PARTIAL,
        journalEntryId: jeBill4.id,
        lines: {
          create: [
            {
              productId: productsMap["Scandinavian 5-Tier Bookshelf"].id,
              accountId: accountsMap["Purchase Expense"].id,
              analyticId: analyticsMap["Raw Material Sourcing & Procurement"].id,
              qty: 4,
              unitPrice: new Prisma.Decimal(12000),
              subtotal: new Prisma.Decimal(48000),
            },
          ],
        },
      },
    });

    const jePay4 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0010",
        journalId: journalsMap["Bank"].id,
        reference: "PAY/OWC/0002",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(20000),
        totalCredit: new Prisma.Decimal(20000),
        items: {
          create: [
            {
              accountId: accountsMap["Creditors"].id,
              partnerId: contactsMap["Open Wood Corp"].id,
              debit: new Prisma.Decimal(20000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Bank"].id,
              partnerId: contactsMap["Open Wood Corp"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(20000),
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        paymentType: PaymentType.SEND,
        partnerId: contactsMap["Open Wood Corp"].id,
        amount: new Prisma.Decimal(20000),
        date: new Date("2026-09-02"),
        paymentVia: PaymentMethod.BANK,
        note: "Partial advance settlement for Bill/2026/0004",
        vendorBillId: bill4.id,
        journalEntryId: jePay4.id,
      },
    });
  }

  // Bill 5: Deco Addict Studio (Vendor side) -> Unpaid (₹24,000 due)
  const bill5Exists = await prisma.vendorBill.findUnique({ where: { billNo: "Bill/2026/0005" } });
  if (!bill5Exists) {
    const jeBill5 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0011",
        journalId: journalsMap["Purchase"].id,
        reference: "Bill/2026/0005",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(24000),
        totalCredit: new Prisma.Decimal(24000),
        items: {
          create: [
            {
              accountId: accountsMap["Purchase Expense"].id,
              partnerId: contactsMap["Deco Addict Studio"].id,
              debit: new Prisma.Decimal(24000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Creditors"].id,
              partnerId: contactsMap["Deco Addict Studio"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(24000),
            },
          ],
        },
      },
    });

    await prisma.vendorBill.create({
      data: {
        billNo: "Bill/2026/0005",
        billReference: "DAS-SUP-410",
        vendorId: contactsMap["Deco Addict Studio"].id,
        billDate: new Date("2026-08-30"),
        dueDate: new Date("2026-09-15"),
        totalAmount: new Prisma.Decimal(24000),
        amountDue: new Prisma.Decimal(24000),
        status: InvoiceBillStatus.CONFIRMED,
        paymentState: PaymentState.NOT_PAID,
        journalEntryId: jeBill5.id,
        lines: {
          create: [
            {
              productId: productsMap["Interior Architecture Consultation"].id,
              accountId: accountsMap["Purchase Expense"].id,
              analyticId: analyticsMap["Marketing & Brand Advertising"].id,
              qty: 2,
              unitPrice: new Prisma.Decimal(12000),
              subtotal: new Prisma.Decimal(24000),
            },
          ],
        },
      },
    });
  }

  // =========================================================================
  // 9. SALES TRANSACTIONS & INVOICES
  // =========================================================================
  console.log("🏷️ Seeding Sales Orders, Customer Invoices & Ledger Entries...");

  // SO-00001: Confirmed SO -> Confirmed Invoice -> Fully Paid (Joey Wills & Co)
  const so1Exists = await prisma.salesOrder.findUnique({ where: { soNo: "S00001" } });
  if (!so1Exists) {
    const so1 = await prisma.salesOrder.create({
      data: {
        soNo: "S00001",
        customerId: contactsMap["Joey Wills & Co"].id,
        soDate: new Date("2026-08-05"),
        status: OrderStatus.CONFIRMED,
        totalAmount: new Prisma.Decimal(190000),
        lines: {
          create: [
            {
              productId: productsMap["Executive Solid Oak Desk"].id,
              qty: 5,
              unitPrice: new Prisma.Decimal(28000),
              subtotal: new Prisma.Decimal(140000),
            },
            {
              productId: productsMap["Ergonomic High-Back Mesh Chair"].id,
              qty: 10,
              unitPrice: new Prisma.Decimal(5000),
              subtotal: new Prisma.Decimal(50000),
            },
          ],
        },
      },
    });

    const jeInv1 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0005",
        journalId: journalsMap["Sales"].id,
        reference: "INV/2026/0001",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(190000),
        totalCredit: new Prisma.Decimal(190000),
        items: {
          create: [
            {
              accountId: accountsMap["Debtors"].id,
              partnerId: contactsMap["Joey Wills & Co"].id,
              debit: new Prisma.Decimal(190000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Sales Income"].id,
              partnerId: contactsMap["Joey Wills & Co"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(190000),
            },
          ],
        },
      },
    });

    const inv1 = await prisma.customerInvoice.create({
      data: {
        invoiceNo: "INV/2026/0001",
        reference: "PO-JW-2026",
        customerId: contactsMap["Joey Wills & Co"].id,
        salesOrderId: so1.id,
        invoiceDate: new Date("2026-08-06"),
        dueDate: new Date("2026-09-06"),
        totalAmount: new Prisma.Decimal(190000),
        amountDue: new Prisma.Decimal(0),
        status: InvoiceBillStatus.CONFIRMED,
        paymentState: PaymentState.PAID,
        journalEntryId: jeInv1.id,
        lines: {
          create: [
            {
              productId: productsMap["Executive Solid Oak Desk"].id,
              accountId: accountsMap["Sales Income"].id,
              analyticId: analyticsMap["Enterprise Corporate Sales"].id,
              qty: 5,
              unitPrice: new Prisma.Decimal(28000),
              subtotal: new Prisma.Decimal(140000),
            },
            {
              productId: productsMap["Ergonomic High-Back Mesh Chair"].id,
              accountId: accountsMap["Sales Income"].id,
              analyticId: analyticsMap["Enterprise Corporate Sales"].id,
              qty: 10,
              unitPrice: new Prisma.Decimal(5000),
              subtotal: new Prisma.Decimal(50000),
            },
          ],
        },
      },
    });

    const jePay3 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0006",
        journalId: journalsMap["Bank"].id,
        reference: "PAY/INV/0001",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(190000),
        totalCredit: new Prisma.Decimal(190000),
        items: {
          create: [
            {
              accountId: accountsMap["Bank"].id,
              partnerId: contactsMap["Joey Wills & Co"].id,
              debit: new Prisma.Decimal(190000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Debtors"].id,
              partnerId: contactsMap["Joey Wills & Co"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(190000),
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        paymentType: PaymentType.RECEIVE,
        partnerId: contactsMap["Joey Wills & Co"].id,
        amount: new Prisma.Decimal(190000),
        date: new Date("2026-08-15"),
        paymentVia: PaymentMethod.BANK,
        note: "Full wire transfer payment for INV/2026/0001",
        customerInvoiceId: inv1.id,
        journalEntryId: jePay3.id,
      },
    });
  }

  // SO-00002: Customer John Doe -> Confirmed Invoice -> Unpaid Due (₹67,000)
  const so2Exists = await prisma.salesOrder.findUnique({ where: { soNo: "S00002" } });
  if (!so2Exists) {
    const so2 = await prisma.salesOrder.create({
      data: {
        soNo: "S00002",
        customerId: contactsMap["John Doe"].id,
        soDate: new Date("2026-08-20"),
        status: OrderStatus.CONFIRMED,
        totalAmount: new Prisma.Decimal(67000),
        lines: {
          create: [
            {
              productId: productsMap["Solid Walnut Coffee Table"].id,
              qty: 1,
              unitPrice: new Prisma.Decimal(22000),
              subtotal: new Prisma.Decimal(22000),
            },
            {
              productId: productsMap["Modular 3-Seater Velvet Sofa"].id,
              qty: 1,
              unitPrice: new Prisma.Decimal(45000),
              subtotal: new Prisma.Decimal(45000),
            },
          ],
        },
      },
    });

    const jeInv2 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0007",
        journalId: journalsMap["Sales"].id,
        reference: "INV/2026/0002",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(67000),
        totalCredit: new Prisma.Decimal(67000),
        items: {
          create: [
            {
              accountId: accountsMap["Debtors"].id,
              partnerId: contactsMap["John Doe"].id,
              debit: new Prisma.Decimal(67000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Sales Income"].id,
              partnerId: contactsMap["John Doe"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(67000),
            },
          ],
        },
      },
    });

    await prisma.customerInvoice.create({
      data: {
        invoiceNo: "INV/2026/0002",
        reference: "PORTAL-DIRECT-ORDER",
        customerId: contactsMap["John Doe"].id,
        salesOrderId: so2.id,
        invoiceDate: new Date("2026-08-21"),
        dueDate: new Date("2026-09-21"),
        totalAmount: new Prisma.Decimal(67000),
        amountDue: new Prisma.Decimal(67000),
        status: InvoiceBillStatus.CONFIRMED,
        paymentState: PaymentState.NOT_PAID,
        journalEntryId: jeInv2.id,
        lines: {
          create: [
            {
              productId: productsMap["Solid Walnut Coffee Table"].id,
              accountId: accountsMap["Sales Income"].id,
              analyticId: analyticsMap["Residential & Living Room Sales"].id,
              qty: 1,
              unitPrice: new Prisma.Decimal(22000),
              subtotal: new Prisma.Decimal(22000),
            },
            {
              productId: productsMap["Modular 3-Seater Velvet Sofa"].id,
              accountId: accountsMap["Sales Income"].id,
              analyticId: analyticsMap["Residential & Living Room Sales"].id,
              qty: 1,
              unitPrice: new Prisma.Decimal(45000),
              subtotal: new Prisma.Decimal(45000),
            },
          ],
        },
      },
    });
  }

  // INV/2026/0003: Nexus Tech Parks -> Confirmed Invoice -> Overdue (₹192,000 due, Due: 2026-08-30)
  const inv3Exists = await prisma.customerInvoice.findUnique({ where: { invoiceNo: "INV/2026/0003" } });
  if (!inv3Exists) {
    const jeInv3 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0012",
        journalId: journalsMap["Sales"].id,
        reference: "INV/2026/0003",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(192000),
        totalCredit: new Prisma.Decimal(192000),
        items: {
          create: [
            {
              accountId: accountsMap["Debtors"].id,
              partnerId: contactsMap["Nexus Tech Parks"].id,
              debit: new Prisma.Decimal(192000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Sales Income"].id,
              partnerId: contactsMap["Nexus Tech Parks"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(192000),
            },
          ],
        },
      },
    });

    await prisma.customerInvoice.create({
      data: {
        invoiceNo: "INV/2026/0003",
        reference: "NTP-BULK-2026",
        customerId: contactsMap["Nexus Tech Parks"].id,
        invoiceDate: new Date("2026-08-10"),
        dueDate: new Date("2026-08-30"),
        totalAmount: new Prisma.Decimal(192000),
        amountDue: new Prisma.Decimal(192000),
        status: InvoiceBillStatus.CONFIRMED,
        paymentState: PaymentState.NOT_PAID,
        journalEntryId: jeInv3.id,
        lines: {
          create: [
            {
              productId: productsMap["Full Executive Office Suite Combo"].id,
              accountId: accountsMap["Sales Income"].id,
              analyticId: analyticsMap["Enterprise Corporate Sales"].id,
              qty: 4,
              unitPrice: new Prisma.Decimal(48000),
              subtotal: new Prisma.Decimal(192000),
            },
          ],
        },
      },
    });
  }

  // INV/2026/0004: Joey Wills & Co -> Partial (₹56,000 total, ₹30,000 paid, ₹26,000 due)
  const inv4Exists = await prisma.customerInvoice.findUnique({ where: { invoiceNo: "INV/2026/0004" } });
  if (!inv4Exists) {
    const jeInv4 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0013",
        journalId: journalsMap["Sales"].id,
        reference: "INV/2026/0004",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(56000),
        totalCredit: new Prisma.Decimal(56000),
        items: {
          create: [
            {
              accountId: accountsMap["Debtors"].id,
              partnerId: contactsMap["Joey Wills & Co"].id,
              debit: new Prisma.Decimal(56000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Sales Income"].id,
              partnerId: contactsMap["Joey Wills & Co"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(56000),
            },
          ],
        },
      },
    });

    const inv4 = await prisma.customerInvoice.create({
      data: {
        invoiceNo: "INV/2026/0004",
        reference: "JW-ADDON-99",
        customerId: contactsMap["Joey Wills & Co"].id,
        invoiceDate: new Date("2026-08-28"),
        dueDate: new Date("2026-09-28"),
        totalAmount: new Prisma.Decimal(56000),
        amountDue: new Prisma.Decimal(26000),
        status: InvoiceBillStatus.CONFIRMED,
        paymentState: PaymentState.PARTIAL,
        journalEntryId: jeInv4.id,
        lines: {
          create: [
            {
              productId: productsMap["Executive Solid Oak Desk"].id,
              accountId: accountsMap["Sales Income"].id,
              analyticId: analyticsMap["Enterprise Corporate Sales"].id,
              qty: 2,
              unitPrice: new Prisma.Decimal(28000),
              subtotal: new Prisma.Decimal(56000),
            },
          ],
        },
      },
    });

    const jePay4 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0014",
        journalId: journalsMap["Bank"].id,
        reference: "PAY/JW/0002",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(30000),
        totalCredit: new Prisma.Decimal(30000),
        items: {
          create: [
            {
              accountId: accountsMap["Bank"].id,
              partnerId: contactsMap["Joey Wills & Co"].id,
              debit: new Prisma.Decimal(30000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Debtors"].id,
              partnerId: contactsMap["Joey Wills & Co"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(30000),
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        paymentType: PaymentType.RECEIVE,
        partnerId: contactsMap["Joey Wills & Co"].id,
        amount: new Prisma.Decimal(30000),
        date: new Date("2026-09-01"),
        paymentVia: PaymentMethod.BANK,
        note: "Partial payment for INV/2026/0004",
        customerInvoiceId: inv4.id,
        journalEntryId: jePay4.id,
      },
    });
  }

  // INV/2026/0005: John Doe -> Fully Paid (₹38,000)
  const inv5Exists = await prisma.customerInvoice.findUnique({ where: { invoiceNo: "INV/2026/0005" } });
  if (!inv5Exists) {
    const jeInv5 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0015",
        journalId: journalsMap["Sales"].id,
        reference: "INV/2026/0005",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(38000),
        totalCredit: new Prisma.Decimal(38000),
        items: {
          create: [
            {
              accountId: accountsMap["Debtors"].id,
              partnerId: contactsMap["John Doe"].id,
              debit: new Prisma.Decimal(38000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Sales Income"].id,
              partnerId: contactsMap["John Doe"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(38000),
            },
          ],
        },
      },
    });

    const inv5 = await prisma.customerInvoice.create({
      data: {
        invoiceNo: "INV/2026/0005",
        reference: "JD-PORTAL-01",
        customerId: contactsMap["John Doe"].id,
        invoiceDate: new Date("2026-08-01"),
        dueDate: new Date("2026-08-15"),
        totalAmount: new Prisma.Decimal(38000),
        amountDue: new Prisma.Decimal(0),
        status: InvoiceBillStatus.CONFIRMED,
        paymentState: PaymentState.PAID,
        journalEntryId: jeInv5.id,
        lines: {
          create: [
            {
              productId: productsMap["Scandinavian 5-Tier Bookshelf"].id,
              accountId: accountsMap["Sales Income"].id,
              analyticId: analyticsMap["Residential & Living Room Sales"].id,
              qty: 2,
              unitPrice: new Prisma.Decimal(19000),
              subtotal: new Prisma.Decimal(38000),
            },
          ],
        },
      },
    });

    const jePay5 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0016",
        journalId: journalsMap["Bank"].id,
        reference: "PAY/JD/0001",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(38000),
        totalCredit: new Prisma.Decimal(38000),
        items: {
          create: [
            {
              accountId: accountsMap["Bank"].id,
              partnerId: contactsMap["John Doe"].id,
              debit: new Prisma.Decimal(38000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Debtors"].id,
              partnerId: contactsMap["John Doe"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(38000),
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        paymentType: PaymentType.RECEIVE,
        partnerId: contactsMap["John Doe"].id,
        amount: new Prisma.Decimal(38000),
        date: new Date("2026-08-05"),
        paymentVia: PaymentMethod.BANK,
        note: "Settled via Net Banking for INV/2026/0005",
        customerInvoiceId: inv5.id,
        journalEntryId: jePay5.id,
      },
    });
  }

  // INV/2026/0006: Luxe Living Interiors -> Partial (₹82,000 total, ₹40,000 paid via Cash, ₹42,000 due)
  const inv6Exists = await prisma.customerInvoice.findUnique({ where: { invoiceNo: "INV/2026/0006" } });
  if (!inv6Exists) {
    const jeInv6 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0017",
        journalId: journalsMap["Sales"].id,
        reference: "INV/2026/0006",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(82000),
        totalCredit: new Prisma.Decimal(82000),
        items: {
          create: [
            {
              accountId: accountsMap["Debtors"].id,
              partnerId: contactsMap["Luxe Living Interiors"].id,
              debit: new Prisma.Decimal(82000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Sales Income"].id,
              partnerId: contactsMap["Luxe Living Interiors"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(82000),
            },
          ],
        },
      },
    });

    const inv6 = await prisma.customerInvoice.create({
      data: {
        invoiceNo: "INV/2026/0006",
        reference: "LLI-DELHI-004",
        customerId: contactsMap["Luxe Living Interiors"].id,
        invoiceDate: new Date("2026-08-25"),
        dueDate: new Date("2026-09-18"),
        totalAmount: new Prisma.Decimal(82000),
        amountDue: new Prisma.Decimal(42000),
        status: InvoiceBillStatus.CONFIRMED,
        paymentState: PaymentState.PARTIAL,
        journalEntryId: jeInv6.id,
        lines: {
          create: [
            {
              productId: productsMap["Solid Walnut Coffee Table"].id,
              accountId: accountsMap["Sales Income"].id,
              analyticId: analyticsMap["Residential & Living Room Sales"].id,
              qty: 2,
              unitPrice: new Prisma.Decimal(22000),
              subtotal: new Prisma.Decimal(44000),
            },
            {
              productId: productsMap["Scandinavian 5-Tier Bookshelf"].id,
              accountId: accountsMap["Sales Income"].id,
              analyticId: analyticsMap["Residential & Living Room Sales"].id,
              qty: 2,
              unitPrice: new Prisma.Decimal(19000),
              subtotal: new Prisma.Decimal(38000),
            },
          ],
        },
      },
    });

    const jePay6 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0018",
        journalId: journalsMap["Cash"].id,
        reference: "PAY/LLI/0001",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(40000),
        totalCredit: new Prisma.Decimal(40000),
        items: {
          create: [
            {
              accountId: accountsMap["Cash"].id,
              partnerId: contactsMap["Luxe Living Interiors"].id,
              debit: new Prisma.Decimal(40000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Debtors"].id,
              partnerId: contactsMap["Luxe Living Interiors"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(40000),
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        paymentType: PaymentType.RECEIVE,
        partnerId: contactsMap["Luxe Living Interiors"].id,
        amount: new Prisma.Decimal(40000),
        date: new Date("2026-08-27"),
        paymentVia: PaymentMethod.CASH,
        note: "Cash payment at showroom counter for INV/2026/0006",
        customerInvoiceId: inv6.id,
        journalEntryId: jePay6.id,
      },
    });
  }

  // INV/2026/0007: Deco Addict Studio (Customer side) -> Fully Paid (₹48,000)
  const inv7Exists = await prisma.customerInvoice.findUnique({ where: { invoiceNo: "INV/2026/0007" } });
  if (!inv7Exists) {
    const jeInv7 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0019",
        journalId: journalsMap["Sales"].id,
        reference: "INV/2026/0007",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(48000),
        totalCredit: new Prisma.Decimal(48000),
        items: {
          create: [
            {
              accountId: accountsMap["Debtors"].id,
              partnerId: contactsMap["Deco Addict Studio"].id,
              debit: new Prisma.Decimal(48000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Sales Income"].id,
              partnerId: contactsMap["Deco Addict Studio"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(48000),
            },
          ],
        },
      },
    });

    const inv7 = await prisma.customerInvoice.create({
      data: {
        invoiceNo: "INV/2026/0007",
        reference: "DAS-DESIGN-09",
        customerId: contactsMap["Deco Addict Studio"].id,
        invoiceDate: new Date("2026-08-12"),
        dueDate: new Date("2026-09-12"),
        totalAmount: new Prisma.Decimal(48000),
        amountDue: new Prisma.Decimal(0),
        status: InvoiceBillStatus.CONFIRMED,
        paymentState: PaymentState.PAID,
        journalEntryId: jeInv7.id,
        lines: {
          create: [
            {
              productId: productsMap["Full Executive Office Suite Combo"].id,
              accountId: accountsMap["Sales Income"].id,
              analyticId: analyticsMap["Enterprise Corporate Sales"].id,
              qty: 1,
              unitPrice: new Prisma.Decimal(48000),
              subtotal: new Prisma.Decimal(48000),
            },
          ],
        },
      },
    });

    const jePay7 = await prisma.journalEntry.create({
      data: {
        entryNo: "JE/2026/0020",
        journalId: journalsMap["Bank"].id,
        reference: "PAY/DAS/0001",
        status: JournalEntryStatus.POSTED,
        totalDebit: new Prisma.Decimal(48000),
        totalCredit: new Prisma.Decimal(48000),
        items: {
          create: [
            {
              accountId: accountsMap["Bank"].id,
              partnerId: contactsMap["Deco Addict Studio"].id,
              debit: new Prisma.Decimal(48000),
              credit: new Prisma.Decimal(0),
            },
            {
              accountId: accountsMap["Debtors"].id,
              partnerId: contactsMap["Deco Addict Studio"].id,
              debit: new Prisma.Decimal(0),
              credit: new Prisma.Decimal(48000),
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        paymentType: PaymentType.RECEIVE,
        partnerId: contactsMap["Deco Addict Studio"].id,
        amount: new Prisma.Decimal(48000),
        date: new Date("2026-08-18"),
        paymentVia: PaymentMethod.BANK,
        note: "Settled via IMPS for INV/2026/0007",
        customerInvoiceId: inv7.id,
        journalEntryId: jePay7.id,
      },
    });
  }

  // =========================================================================
  // 10. BUDGETS
  // =========================================================================
  console.log("📊 Seeding Departmental Budgets...");
  const budgetsData = [
    {
      name: "Q3 Corporate Enterprise Target",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-09-30"),
      analyticId: analyticsMap["Enterprise Corporate Sales"].id,
      type: AnalyticType.INCOME,
      responsibleId: contactsMap["Joey Wills & Co"].id,
      committedAmount: new Prisma.Decimal(300000),
      status: BudgetStatus.CONFIRMED,
    },
    {
      name: "Q3 Raw Material Procurement Budget",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-09-30"),
      analyticId: analyticsMap["Raw Material Sourcing & Procurement"].id,
      type: AnalyticType.EXPENSE,
      responsibleId: contactsMap["Open Wood Corp"].id,
      committedAmount: new Prisma.Decimal(150000),
      status: BudgetStatus.CONFIRMED,
    },
    {
      name: "Factory Logistics & Assembly Cap",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-09-30"),
      analyticId: analyticsMap["Factory Manufacturing & Logistics"].id,
      type: AnalyticType.EXPENSE,
      responsibleId: contactsMap["Hardware Hub Ltd"].id,
      committedAmount: new Prisma.Decimal(100000),
      status: BudgetStatus.CONFIRMED,
    },
    {
      name: "Digital Brand Launch Budget",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-10-31"),
      analyticId: analyticsMap["Marketing & Brand Advertising"].id,
      type: AnalyticType.EXPENSE,
      responsibleId: contactsMap["Deco Addict Studio"].id,
      committedAmount: new Prisma.Decimal(80000),
      status: BudgetStatus.DRAFT,
    },
  ];

  for (const b of budgetsData) {
    const existing = await prisma.budget.findFirst({ where: { name: b.name } });
    if (!existing) {
      await prisma.budget.create({ data: b });
    }
  }

  console.log("✅ Seed completed successfully! All tables populated with balanced, realistic data.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });