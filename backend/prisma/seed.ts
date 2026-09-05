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
  UserRole,
  Prisma,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initializing full database reset and seed for Urban Furniture Enterprise...");

  // =========================================================================
  // 0. CLEAN SLATE: Delete in reverse dependency order
  // =========================================================================
  console.log("🧹 Cleaning existing table data...");
  await prisma.payment.deleteMany();
  await prisma.customerInvoiceLine.deleteMany();
  await prisma.customerInvoice.deleteMany();
  await prisma.vendorBillLine.deleteMany();
  await prisma.vendorBill.deleteMany();
  await prisma.salesOrderLine.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.purchaseOrderLine.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.journalItem.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.analytic.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.chartOfAccount.deleteMany();
  await prisma.contact.deleteMany();

  // =========================================================================
  // 1. CHART OF ACCOUNTS (12 Core Accounts)
  // =========================================================================
  console.log("📊 1/13 Seeding Chart of Accounts...");
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
    const record = await prisma.chartOfAccount.create({ data: acc });
    accountsMap[acc.name] = record;
  }

  // =========================================================================
  // 2. JOURNALS (5 Core Financial Journals)
  // =========================================================================
  console.log("📑 2/13 Seeding Accounting Journals...");
  const journalsData = [
    { name: "Sales", type: JournalType.SALES, defaultAccountId: accountsMap["Sales Income"].id },
    { name: "Purchase", type: JournalType.PURCHASE, defaultAccountId: accountsMap["Purchase Expense"].id },
    { name: "Bank", type: JournalType.BANK, defaultAccountId: accountsMap["Bank"].id },
    { name: "Cash", type: JournalType.CASH, defaultAccountId: accountsMap["Cash"].id },
    { name: "General", type: JournalType.GENERAL, defaultAccountId: null },
  ];

  const journalsMap: Record<string, any> = {};
  for (const j of journalsData) {
    const record = await prisma.journal.create({ data: j });
    journalsMap[j.name] = record;
  }

  // =========================================================================
  // 3. CONTACTS (Customers, Vendors, Partners)
  // =========================================================================
  console.log("👥 3/13 Seeding Business Contacts...");
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
    {
      name: "Regal Woods & Furnishings",
      type: ContactType.VENDOR,
      email: "supply@regalwoods.co.in",
      phone: "+91 94455 66778",
      address: "Timber Market Road, Sector 8",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440008",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    },
    // Customers
    {
      name: "Deco Addict Studio",
      type: ContactType.CUSTOMER,
      email: "info@decoaddict.design",
      phone: "+91 99887 76655",
      address: "Studio 12, Design Street, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Urban Design House",
      type: ContactType.CUSTOMER,
      email: "contact@urbandesign.com",
      phone: "+91 97766 55443",
      address: "Floor 3, Brigade Gateway",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560055",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Joey Wills & Co",
      type: ContactType.CUSTOMER,
      email: "joey@willsenterprise.com",
      phone: "+91 91234 56789",
      address: "Tower B, Cyber City Hub",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122002",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Apex Workspaces & Hub",
      type: ContactType.CUSTOMER,
      email: "facilities@apexworkspaces.in",
      phone: "+91 98900 12345",
      address: "Tech Park 4, Whitefield",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560066",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    },
    // Both / Partners
    {
      name: "Pinnacle Architecture & Build",
      type: ContactType.BOTH,
      email: "admin@pinnaclebuild.com",
      phone: "+91 96677 88990",
      address: "Skyline Towers, FC Road",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411016",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Urban Loft Designs",
      type: ContactType.BOTH,
      email: "projects@urbanloft.org",
      phone: "+91 98490 11223",
      address: "Hitech City, Mindspace Phase 3",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500081",
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
    },
  ];

  const contactsMap: Record<string, any> = {};
  for (const c of contactsData) {
    const record = await prisma.contact.create({ data: c });
    contactsMap[c.name] = record;
  }

  // =========================================================================
  // 4. USERS (Admin, Accountant, Portal Clients)
  // =========================================================================
  console.log("🔐 4/13 Seeding User Accounts...");
  const adminPassword = await bcrypt.hash("Admin@1234", 10);
  const accountantPassword = await bcrypt.hash("Account@1234", 10);
  const portalPassword = await bcrypt.hash("Portal@1234", 10);

  // System Admin
  await prisma.user.create({
    data: {
      loginId: "admin01",
      email: "admin@urbanfurniture.com",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  // Chief Accountant
  await prisma.user.create({
    data: {
      loginId: "accountant01",
      email: "accountant@urbanfurniture.com",
      password: accountantPassword,
      role: UserRole.ACCOUNTANT,
    },
  });

  // Portal Users linked to registered contacts
  await prisma.user.create({
    data: {
      loginId: "openwood_user",
      email: "procurement@openwood.com",
      password: portalPassword,
      role: UserRole.PORTAL_USER,
      contactId: contactsMap["Open Wood Corp"].id,
    },
  });

  await prisma.user.create({
    data: {
      loginId: "decoaddict_user",
      email: "info@decoaddict.design",
      password: portalPassword,
      role: UserRole.PORTAL_USER,
      contactId: contactsMap["Deco Addict Studio"].id,
    },
  });

  await prisma.user.create({
    data: {
      loginId: "joey_client",
      email: "joey@willsenterprise.com",
      password: portalPassword,
      role: UserRole.PORTAL_USER,
      contactId: contactsMap["Joey Wills & Co"].id,
    },
  });

  await prisma.user.create({
    data: {
      loginId: "apex_user",
      email: "facilities@apexworkspaces.in",
      password: portalPassword,
      role: UserRole.PORTAL_USER,
      contactId: contactsMap["Apex Workspaces & Hub"].id,
    },
  });

  // =========================================================================
  // 5. PRODUCTS & SERVICES
  // =========================================================================
  console.log("🛋️ 5/13 Seeding Products, Services & Combos...");
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
      name: "Nordic Oak Bed Frame",
      category: "Living Furniture",
      salesPrice: 36000,
      cost: 22000,
      type: ProductType.GOODS,
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Acoustic Wall Panel Set",
      category: "Office Furniture",
      salesPrice: 8500,
      cost: 4200,
      type: ProductType.GOODS,
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80",
    },
    // Services
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
      name: "Ergonomic Space Planning Assessment",
      category: "Professional Services",
      salesPrice: 10000,
      cost: 3500,
      type: ProductType.SERVICE,
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80",
    },
    // Combos
    {
      name: "Full Executive Office Suite Combo",
      category: "Office Combos",
      salesPrice: 48000,
      cost: 31000,
      type: ProductType.COMBO,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Bespoke Dining Ensemble Set",
      category: "Living Furniture",
      salesPrice: 65000,
      cost: 41000,
      type: ProductType.COMBO,
      image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Custom Wood Carving & Finish",
      category: "Professional Services",
      salesPrice: 9500,
      cost: 3000,
      type: ProductType.SERVICE,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Nordic Minimalist Dining Table",
      category: "Living Furniture",
      salesPrice: 32000,
      cost: 20000,
      type: ProductType.GOODS,
      image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Velvet Recliner Lounge Chair",
      category: "Living Furniture",
      salesPrice: 24000,
      cost: 15000,
      type: ProductType.GOODS,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&auto=format&fit=crop&q=80",
    },
  ];

  const productsMap: Record<string, any> = {};
  for (const p of productsData) {
    const record = await prisma.product.create({
      data: {
        name: p.name,
        category: p.category,
        salesPrice: new Prisma.Decimal(p.salesPrice),
        cost: new Prisma.Decimal(p.cost),
        type: p.type,
        image: p.image,
      },
    });
    productsMap[p.name] = record;
  }

  // =========================================================================
  // 6. ANALYTIC ACCOUNTS (Cost Centers & Revenue Streams)
  // =========================================================================
  console.log("📈 6/13 Seeding Analytic Accounts...");
  const analyticsData = [
    { name: "Enterprise Corporate Sales", type: AnalyticType.INCOME },
    { name: "Residential & Living Room Sales", type: AnalyticType.INCOME },
    { name: "Interior Consultation Revenue", type: AnalyticType.INCOME },
    { name: "Hospitality & Restaurant Projects", type: AnalyticType.INCOME },
    { name: "Raw Material Sourcing & Procurement", type: AnalyticType.EXPENSE },
    { name: "Factory Manufacturing & Logistics", type: AnalyticType.EXPENSE },
    { name: "Marketing & Brand Advertising", type: AnalyticType.EXPENSE },
    { name: "Office Facilities & Administration", type: AnalyticType.EXPENSE },
    { name: "Packaging & Delivery Fleet", type: AnalyticType.EXPENSE },
  ];

  const analyticsMap: Record<string, any> = {};
  for (const a of analyticsData) {
    const record = await prisma.analytic.create({ data: a });
    analyticsMap[a.name] = record;
  }

  // =========================================================================
  // 7. INITIAL BALANCE SHEET CAPITAL JOURNAL ENTRY
  // =========================================================================
  console.log("🏦 7/13 Seeding Initial Capital Ledger Entry...");
  await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2026/0001",
      journalId: journalsMap["Bank"].id,
      accountingDate: new Date("2026-07-01"),
      reference: "OPENING-CAPITAL-2026",
      status: JournalEntryStatus.POSTED,
      totalDebit: new Prisma.Decimal(600000),
      totalCredit: new Prisma.Decimal(600000),
      items: {
        create: [
          {
            accountId: accountsMap["Bank"].id,
            debit: new Prisma.Decimal(550000),
            credit: new Prisma.Decimal(0),
          },
          {
            accountId: accountsMap["Cash"].id,
            debit: new Prisma.Decimal(50000),
            credit: new Prisma.Decimal(0),
          },
          {
            accountId: accountsMap["Owner Capital"].id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(600000),
          },
        ],
      },
    },
  });

  // =========================================================================
  // 8. PURCHASE PIPELINE (Purchase Orders, Vendor Bills, Double-Entry JEs)
  // =========================================================================
  console.log("📦 8/13 Seeding Purchase Orders & Vendor Bills...");

  // PO-1 / Bill-1: Open Wood Corp (Raw Timber Planks) -> Total 90,000 -> Paid Full via Bank
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNo: "PO/2026/0001",
      vendorId: contactsMap["Open Wood Corp"].id,
      poDate: new Date("2026-07-10"),
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

  const jeBill1 = await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2026/0002",
      journalId: journalsMap["Purchase"].id,
      accountingDate: new Date("2026-07-12"),
      reference: "BILL/2026/0001",
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

  const bill1 = await prisma.vendorBill.create({
    data: {
      billNo: "BILL/2026/0001",
      billReference: "OWC-INV-8891",
      vendorId: contactsMap["Open Wood Corp"].id,
      purchaseOrderId: po1.id,
      billDate: new Date("2026-07-12"),
      dueDate: new Date("2026-08-12"),
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

  // PO-2 / Bill-2: Hardware Hub Ltd (Hardware Kits) -> Total 32,000 -> Partial Paid (16,000 Paid, 16,000 Due)
  const po2 = await prisma.purchaseOrder.create({
    data: {
      poNo: "PO/2026/0002",
      vendorId: contactsMap["Hardware Hub Ltd"].id,
      poDate: new Date("2026-07-20"),
      paymentTerms: "Net 15 Days",
      status: OrderStatus.CONFIRMED,
      totalAmount: new Prisma.Decimal(32000),
      lines: {
        create: [
          {
            productId: productsMap["Metal Hardware Assembly Kit"].id,
            analyticId: analyticsMap["Factory Manufacturing & Logistics"].id,
            qty: 10,
            unitPrice: new Prisma.Decimal(3200),
            subtotal: new Prisma.Decimal(32000),
          },
        ],
      },
    },
  });

  const jeBill2 = await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2026/0003",
      journalId: journalsMap["Purchase"].id,
      accountingDate: new Date("2026-07-22"),
      reference: "BILL/2026/0002",
      status: JournalEntryStatus.POSTED,
      totalDebit: new Prisma.Decimal(32000),
      totalCredit: new Prisma.Decimal(32000),
      items: {
        create: [
          {
            accountId: accountsMap["Purchase Expense"].id,
            partnerId: contactsMap["Hardware Hub Ltd"].id,
            debit: new Prisma.Decimal(32000),
            credit: new Prisma.Decimal(0),
          },
          {
            accountId: accountsMap["Creditors"].id,
            partnerId: contactsMap["Hardware Hub Ltd"].id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(32000),
          },
        ],
      },
    },
  });

  const bill2 = await prisma.vendorBill.create({
    data: {
      billNo: "BILL/2026/0002",
      billReference: "HHL-PO-209",
      vendorId: contactsMap["Hardware Hub Ltd"].id,
      purchaseOrderId: po2.id,
      billDate: new Date("2026-07-22"),
      dueDate: new Date("2026-08-06"),
      totalAmount: new Prisma.Decimal(32000),
      amountDue: new Prisma.Decimal(16000),
      status: InvoiceBillStatus.CONFIRMED,
      paymentState: PaymentState.PARTIAL,
      journalEntryId: jeBill2.id,
      lines: {
        create: [
          {
            productId: productsMap["Metal Hardware Assembly Kit"].id,
            accountId: accountsMap["Purchase Expense"].id,
            analyticId: analyticsMap["Factory Manufacturing & Logistics"].id,
            qty: 10,
            unitPrice: new Prisma.Decimal(3200),
            subtotal: new Prisma.Decimal(32000),
          },
        ],
      },
    },
  });

  // PO-3 / Bill-3: Nordic Timber Suppliers -> Total 67,500 -> Confirmed (Unpaid)
  const po3 = await prisma.purchaseOrder.create({
    data: {
      poNo: "PO/2026/0003",
      vendorId: contactsMap["Nordic Timber Suppliers"].id,
      poDate: new Date("2026-08-05"),
      paymentTerms: "Net 30 Days",
      status: OrderStatus.CONFIRMED,
      totalAmount: new Prisma.Decimal(67500),
      lines: {
        create: [
          {
            productId: productsMap["Raw Timber Plank Lot (Grade A)"].id,
            analyticId: analyticsMap["Raw Material Sourcing & Procurement"].id,
            qty: 15,
            unitPrice: new Prisma.Decimal(4500),
            subtotal: new Prisma.Decimal(67500),
          },
        ],
      },
    },
  });

  const jeBill3 = await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2026/0004",
      journalId: journalsMap["Purchase"].id,
      accountingDate: new Date("2026-08-07"),
      reference: "BILL/2026/0003",
      status: JournalEntryStatus.POSTED,
      totalDebit: new Prisma.Decimal(67500),
      totalCredit: new Prisma.Decimal(67500),
      items: {
        create: [
          {
            accountId: accountsMap["Purchase Expense"].id,
            partnerId: contactsMap["Nordic Timber Suppliers"].id,
            debit: new Prisma.Decimal(67500),
            credit: new Prisma.Decimal(0),
          },
          {
            accountId: accountsMap["Creditors"].id,
            partnerId: contactsMap["Nordic Timber Suppliers"].id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(67500),
          },
        ],
      },
    },
  });

  await prisma.vendorBill.create({
    data: {
      billNo: "BILL/2026/0003",
      billReference: "NTS-9912",
      vendorId: contactsMap["Nordic Timber Suppliers"].id,
      purchaseOrderId: po3.id,
      billDate: new Date("2026-08-07"),
      dueDate: new Date("2026-09-07"),
      totalAmount: new Prisma.Decimal(67500),
      amountDue: new Prisma.Decimal(67500),
      status: InvoiceBillStatus.CONFIRMED,
      paymentState: PaymentState.NOT_PAID,
      journalEntryId: jeBill3.id,
      lines: {
        create: [
          {
            productId: productsMap["Raw Timber Plank Lot (Grade A)"].id,
            accountId: accountsMap["Purchase Expense"].id,
            analyticId: analyticsMap["Raw Material Sourcing & Procurement"].id,
            qty: 15,
            unitPrice: new Prisma.Decimal(4500),
            subtotal: new Prisma.Decimal(67500),
          },
        ],
      },
    },
  });

  // PO-4: Regal Woods & Furnishings -> Draft PO (Total 44,000)
  await prisma.purchaseOrder.create({
    data: {
      poNo: "PO/2026/0004",
      vendorId: contactsMap["Regal Woods & Furnishings"].id,
      poDate: new Date("2026-08-25"),
      paymentTerms: "Immediate",
      status: OrderStatus.DRAFT,
      totalAmount: new Prisma.Decimal(44000),
      lines: {
        create: [
          {
            productId: productsMap["Nordic Oak Bed Frame"].id,
            analyticId: analyticsMap["Packaging & Delivery Fleet"].id,
            qty: 2,
            unitPrice: new Prisma.Decimal(22000),
            subtotal: new Prisma.Decimal(44000),
          },
        ],
      },
    },
  });

  // =========================================================================
  // 9. SALES PIPELINE (Sales Orders, Customer Invoices, Double-Entry JEs)
  // =========================================================================
  console.log("🏷️ 9/13 Seeding Sales Orders & Customer Invoices...");

  // SO-1 / INV-1: Deco Addict Studio -> 1 Desk + 2 Chairs + 1 Consult -> Total 70,000 -> Paid Full via Bank
  const so1 = await prisma.salesOrder.create({
    data: {
      soNo: "SO/2026/0001",
      customerId: contactsMap["Deco Addict Studio"].id,
      soDate: new Date("2026-07-15"),
      status: OrderStatus.CONFIRMED,
      totalAmount: new Prisma.Decimal(70000),
      lines: {
        create: [
          {
            productId: productsMap["Executive Solid Oak Desk"].id,
            qty: 1,
            unitPrice: new Prisma.Decimal(28000),
            subtotal: new Prisma.Decimal(28000),
          },
          {
            productId: productsMap["Ergonomic High-Back Mesh Chair"].id,
            qty: 2,
            unitPrice: new Prisma.Decimal(15000),
            subtotal: new Prisma.Decimal(30000),
          },
          {
            productId: productsMap["Interior Architecture Consultation"].id,
            qty: 1,
            unitPrice: new Prisma.Decimal(12000),
            subtotal: new Prisma.Decimal(12000),
          },
        ],
      },
    },
  });

  const jeInv1 = await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2026/0005",
      journalId: journalsMap["Sales"].id,
      accountingDate: new Date("2026-07-16"),
      reference: "INV/2026/0001",
      status: JournalEntryStatus.POSTED,
      totalDebit: new Prisma.Decimal(70000),
      totalCredit: new Prisma.Decimal(70000),
      items: {
        create: [
          {
            accountId: accountsMap["Debtors"].id,
            partnerId: contactsMap["Deco Addict Studio"].id,
            debit: new Prisma.Decimal(70000),
            credit: new Prisma.Decimal(0),
          },
          {
            accountId: accountsMap["Sales Income"].id,
            partnerId: contactsMap["Deco Addict Studio"].id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(58000),
          },
          {
            accountId: accountsMap["Service Revenue"].id,
            partnerId: contactsMap["Deco Addict Studio"].id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(12000),
          },
        ],
      },
    },
  });

  const inv1 = await prisma.customerInvoice.create({
    data: {
      invoiceNo: "INV/2026/0001",
      reference: "SO/2026/0001",
      customerId: contactsMap["Deco Addict Studio"].id,
      salesOrderId: so1.id,
      invoiceDate: new Date("2026-07-16"),
      dueDate: new Date("2026-08-16"),
      totalAmount: new Prisma.Decimal(70000),
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
            qty: 1,
            unitPrice: new Prisma.Decimal(28000),
            subtotal: new Prisma.Decimal(28000),
          },
          {
            productId: productsMap["Ergonomic High-Back Mesh Chair"].id,
            accountId: accountsMap["Sales Income"].id,
            analyticId: analyticsMap["Enterprise Corporate Sales"].id,
            qty: 2,
            unitPrice: new Prisma.Decimal(15000),
            subtotal: new Prisma.Decimal(30000),
          },
          {
            productId: productsMap["Interior Architecture Consultation"].id,
            accountId: accountsMap["Service Revenue"].id,
            analyticId: analyticsMap["Interior Consultation Revenue"].id,
            qty: 1,
            unitPrice: new Prisma.Decimal(12000),
            subtotal: new Prisma.Decimal(12000),
          },
        ],
      },
    },
  });

  // SO-2 / INV-2: Urban Design House -> 1 Velvet Sofa + 1 Walnut Coffee Table -> Total 67,000 -> Partial Paid (33,500 Paid, 33,500 Due)
  const so2 = await prisma.salesOrder.create({
    data: {
      soNo: "SO/2026/0002",
      customerId: contactsMap["Urban Design House"].id,
      soDate: new Date("2026-07-28"),
      status: OrderStatus.CONFIRMED,
      totalAmount: new Prisma.Decimal(67000),
      lines: {
        create: [
          {
            productId: productsMap["Modular 3-Seater Velvet Sofa"].id,
            qty: 1,
            unitPrice: new Prisma.Decimal(45000),
            subtotal: new Prisma.Decimal(45000),
          },
          {
            productId: productsMap["Solid Walnut Coffee Table"].id,
            qty: 1,
            unitPrice: new Prisma.Decimal(22000),
            subtotal: new Prisma.Decimal(22000),
          },
        ],
      },
    },
  });

  const jeInv2 = await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2026/0006",
      journalId: journalsMap["Sales"].id,
      accountingDate: new Date("2026-07-29"),
      reference: "INV/2026/0002",
      status: JournalEntryStatus.POSTED,
      totalDebit: new Prisma.Decimal(67000),
      totalCredit: new Prisma.Decimal(67000),
      items: {
        create: [
          {
            accountId: accountsMap["Debtors"].id,
            partnerId: contactsMap["Urban Design House"].id,
            debit: new Prisma.Decimal(67000),
            credit: new Prisma.Decimal(0),
          },
          {
            accountId: accountsMap["Sales Income"].id,
            partnerId: contactsMap["Urban Design House"].id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(67000),
          },
        ],
      },
    },
  });

  const inv2 = await prisma.customerInvoice.create({
    data: {
      invoiceNo: "INV/2026/0002",
      reference: "SO/2026/0002",
      customerId: contactsMap["Urban Design House"].id,
      salesOrderId: so2.id,
      invoiceDate: new Date("2026-07-29"),
      dueDate: new Date("2026-08-29"),
      totalAmount: new Prisma.Decimal(67000),
      amountDue: new Prisma.Decimal(33500),
      status: InvoiceBillStatus.CONFIRMED,
      paymentState: PaymentState.PARTIAL,
      journalEntryId: jeInv2.id,
      lines: {
        create: [
          {
            productId: productsMap["Modular 3-Seater Velvet Sofa"].id,
            accountId: accountsMap["Sales Income"].id,
            analyticId: analyticsMap["Residential & Living Room Sales"].id,
            qty: 1,
            unitPrice: new Prisma.Decimal(45000),
            subtotal: new Prisma.Decimal(45000),
          },
          {
            productId: productsMap["Solid Walnut Coffee Table"].id,
            accountId: accountsMap["Sales Income"].id,
            analyticId: analyticsMap["Residential & Living Room Sales"].id,
            qty: 1,
            unitPrice: new Prisma.Decimal(22000),
            subtotal: new Prisma.Decimal(22000),
          },
        ],
      },
    },
  });

  // SO-3 / INV-3: Joey Wills & Co -> 2 Executive Office Suite Combos -> Total 96,000 -> Confirmed (Unpaid)
  const so3 = await prisma.salesOrder.create({
    data: {
      soNo: "SO/2026/0003",
      customerId: contactsMap["Joey Wills & Co"].id,
      soDate: new Date("2026-08-10"),
      status: OrderStatus.CONFIRMED,
      totalAmount: new Prisma.Decimal(96000),
      lines: {
        create: [
          {
            productId: productsMap["Full Executive Office Suite Combo"].id,
            qty: 2,
            unitPrice: new Prisma.Decimal(48000),
            subtotal: new Prisma.Decimal(96000),
          },
        ],
      },
    },
  });

  const jeInv3 = await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2026/0007",
      journalId: journalsMap["Sales"].id,
      accountingDate: new Date("2026-08-11"),
      reference: "INV/2026/0003",
      status: JournalEntryStatus.POSTED,
      totalDebit: new Prisma.Decimal(96000),
      totalCredit: new Prisma.Decimal(96000),
      items: {
        create: [
          {
            accountId: accountsMap["Debtors"].id,
            partnerId: contactsMap["Joey Wills & Co"].id,
            debit: new Prisma.Decimal(96000),
            credit: new Prisma.Decimal(0),
          },
          {
            accountId: accountsMap["Sales Income"].id,
            partnerId: contactsMap["Joey Wills & Co"].id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(96000),
          },
        ],
      },
    },
  });

  await prisma.customerInvoice.create({
    data: {
      invoiceNo: "INV/2026/0003",
      reference: "SO/2026/0003",
      customerId: contactsMap["Joey Wills & Co"].id,
      salesOrderId: so3.id,
      invoiceDate: new Date("2026-08-11"),
      dueDate: new Date("2026-09-11"),
      totalAmount: new Prisma.Decimal(96000),
      amountDue: new Prisma.Decimal(96000),
      status: InvoiceBillStatus.CONFIRMED,
      paymentState: PaymentState.NOT_PAID,
      journalEntryId: jeInv3.id,
      lines: {
        create: [
          {
            productId: productsMap["Full Executive Office Suite Combo"].id,
            accountId: accountsMap["Sales Income"].id,
            analyticId: analyticsMap["Enterprise Corporate Sales"].id,
            qty: 2,
            unitPrice: new Prisma.Decimal(48000),
            subtotal: new Prisma.Decimal(96000),
          },
        ],
      },
    },
  });

  // SO-4 / INV-4: Apex Workspaces & Hub -> Bespoke Dining Ensemble + Space Assessment -> Total 75,000 -> Paid Full via Bank
  const so4 = await prisma.salesOrder.create({
    data: {
      soNo: "SO/2026/0004",
      customerId: contactsMap["Apex Workspaces & Hub"].id,
      soDate: new Date("2026-08-15"),
      status: OrderStatus.CONFIRMED,
      totalAmount: new Prisma.Decimal(75000),
      lines: {
        create: [
          {
            productId: productsMap["Bespoke Dining Ensemble Set"].id,
            qty: 1,
            unitPrice: new Prisma.Decimal(65000),
            subtotal: new Prisma.Decimal(65000),
          },
          {
            productId: productsMap["Ergonomic Space Planning Assessment"].id,
            qty: 1,
            unitPrice: new Prisma.Decimal(10000),
            subtotal: new Prisma.Decimal(10000),
          },
        ],
      },
    },
  });

  const jeInv4 = await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2026/0008",
      journalId: journalsMap["Sales"].id,
      accountingDate: new Date("2026-08-16"),
      reference: "INV/2026/0004",
      status: JournalEntryStatus.POSTED,
      totalDebit: new Prisma.Decimal(75000),
      totalCredit: new Prisma.Decimal(75000),
      items: {
        create: [
          {
            accountId: accountsMap["Debtors"].id,
            partnerId: contactsMap["Apex Workspaces & Hub"].id,
            debit: new Prisma.Decimal(75000),
            credit: new Prisma.Decimal(0),
          },
          {
            accountId: accountsMap["Sales Income"].id,
            partnerId: contactsMap["Apex Workspaces & Hub"].id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(65000),
          },
          {
            accountId: accountsMap["Service Revenue"].id,
            partnerId: contactsMap["Apex Workspaces & Hub"].id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(10000),
          },
        ],
      },
    },
  });

  const inv4 = await prisma.customerInvoice.create({
    data: {
      invoiceNo: "INV/2026/0004",
      reference: "SO/2026/0004",
      customerId: contactsMap["Apex Workspaces & Hub"].id,
      salesOrderId: so4.id,
      invoiceDate: new Date("2026-08-16"),
      dueDate: new Date("2026-09-16"),
      totalAmount: new Prisma.Decimal(75000),
      amountDue: new Prisma.Decimal(0),
      status: InvoiceBillStatus.CONFIRMED,
      paymentState: PaymentState.PAID,
      journalEntryId: jeInv4.id,
      lines: {
        create: [
          {
            productId: productsMap["Bespoke Dining Ensemble Set"].id,
            accountId: accountsMap["Sales Income"].id,
            analyticId: analyticsMap["Hospitality & Restaurant Projects"].id,
            qty: 1,
            unitPrice: new Prisma.Decimal(65000),
            subtotal: new Prisma.Decimal(65000),
          },
          {
            productId: productsMap["Ergonomic Space Planning Assessment"].id,
            accountId: accountsMap["Service Revenue"].id,
            analyticId: analyticsMap["Interior Consultation Revenue"].id,
            qty: 1,
            unitPrice: new Prisma.Decimal(10000),
            subtotal: new Prisma.Decimal(10000),
          },
        ],
      },
    },
  });

  // SO-5: Pinnacle Architecture -> Draft Sales Order (Total 54,500)
  await prisma.salesOrder.create({
    data: {
      soNo: "SO/2026/0005",
      customerId: contactsMap["Pinnacle Architecture & Build"].id,
      soDate: new Date("2026-08-28"),
      status: OrderStatus.DRAFT,
      totalAmount: new Prisma.Decimal(54500),
      lines: {
        create: [
          {
            productId: productsMap["Scandinavian 5-Tier Bookshelf"].id,
            qty: 2,
            unitPrice: new Prisma.Decimal(18500),
            subtotal: new Prisma.Decimal(37000),
          },
          {
            productId: productsMap["Acoustic Wall Panel Set"].id,
            qty: 1,
            unitPrice: new Prisma.Decimal(8500),
            subtotal: new Prisma.Decimal(8500),
          },
          {
            productId: productsMap["Custom Wood Carving & Finish"].id,
            qty: 1,
            unitPrice: new Prisma.Decimal(9500),
            subtotal: new Prisma.Decimal(9500),
          },
        ],
      },
    },
  });

  // =========================================================================
  // 10. PAYMENTS (Bank & Cash Receipts and Disbursements)
  // =========================================================================
  console.log("💳 10/13 Seeding Payments & Matching Ledger Entries...");

  // 1. Payment for Bill 1 (Open Wood Corp) -> 90,000 via Bank
  const jePay1 = await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2026/0009",
      journalId: journalsMap["Bank"].id,
      accountingDate: new Date("2026-07-15"),
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
      date: new Date("2026-07-15"),
      paymentVia: PaymentMethod.BANK,
      note: "Full settlement for Bill/2026/0001",
      vendorBillId: bill1.id,
      journalEntryId: jePay1.id,
    },
  });

  // 2. Partial Payment for Bill 2 (Hardware Hub Ltd) -> 16,000 via Cash
  const jePay2 = await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2026/0010",
      journalId: journalsMap["Cash"].id,
      accountingDate: new Date("2026-07-25"),
      reference: "PAY/HHL/0001",
      status: JournalEntryStatus.POSTED,
      totalDebit: new Prisma.Decimal(16000),
      totalCredit: new Prisma.Decimal(16000),
      items: {
        create: [
          {
            accountId: accountsMap["Creditors"].id,
            partnerId: contactsMap["Hardware Hub Ltd"].id,
            debit: new Prisma.Decimal(16000),
            credit: new Prisma.Decimal(0),
          },
          {
            accountId: accountsMap["Cash"].id,
            partnerId: contactsMap["Hardware Hub Ltd"].id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(16000),
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentType: PaymentType.SEND,
      partnerId: contactsMap["Hardware Hub Ltd"].id,
      amount: new Prisma.Decimal(16000),
      date: new Date("2026-07-25"),
      paymentVia: PaymentMethod.CASH,
      note: "50% Advance settlement for Bill/2026/0002",
      vendorBillId: bill2.id,
      journalEntryId: jePay2.id,
    },
  });

  // 3. Receipt for Invoice 1 (Deco Addict Studio) -> 70,000 via Bank
  const jePay3 = await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2026/0011",
      journalId: journalsMap["Bank"].id,
      accountingDate: new Date("2026-07-20"),
      reference: "REC/DAS/0001",
      status: JournalEntryStatus.POSTED,
      totalDebit: new Prisma.Decimal(70000),
      totalCredit: new Prisma.Decimal(70000),
      items: {
        create: [
          {
            accountId: accountsMap["Bank"].id,
            partnerId: contactsMap["Deco Addict Studio"].id,
            debit: new Prisma.Decimal(70000),
            credit: new Prisma.Decimal(0),
          },
          {
            accountId: accountsMap["Debtors"].id,
            partnerId: contactsMap["Deco Addict Studio"].id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(70000),
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentType: PaymentType.RECEIVE,
      partnerId: contactsMap["Deco Addict Studio"].id,
      amount: new Prisma.Decimal(70000),
      date: new Date("2026-07-20"),
      paymentVia: PaymentMethod.BANK,
      note: "Full collection for INV/2026/0001",
      customerInvoiceId: inv1.id,
      journalEntryId: jePay3.id,
    },
  });

  // 4. Partial Receipt for Invoice 2 (Urban Design House) -> 33,500 via Bank
  const jePay4 = await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2026/0012",
      journalId: journalsMap["Bank"].id,
      accountingDate: new Date("2026-08-05"),
      reference: "REC/UDH/0001",
      status: JournalEntryStatus.POSTED,
      totalDebit: new Prisma.Decimal(33500),
      totalCredit: new Prisma.Decimal(33500),
      items: {
        create: [
          {
            accountId: accountsMap["Bank"].id,
            partnerId: contactsMap["Urban Design House"].id,
            debit: new Prisma.Decimal(33500),
            credit: new Prisma.Decimal(0),
          },
          {
            accountId: accountsMap["Debtors"].id,
            partnerId: contactsMap["Urban Design House"].id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(33500),
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentType: PaymentType.RECEIVE,
      partnerId: contactsMap["Urban Design House"].id,
      amount: new Prisma.Decimal(33500),
      date: new Date("2026-08-05"),
      paymentVia: PaymentMethod.BANK,
      note: "50% Part collection for INV/2026/0002",
      customerInvoiceId: inv2.id,
      journalEntryId: jePay4.id,
    },
  });

  // 5. Full Receipt for Invoice 4 (Apex Workspaces & Hub) -> 75,000 via Bank
  const jePay5 = await prisma.journalEntry.create({
    data: {
      entryNo: "JE/2026/0013",
      journalId: journalsMap["Bank"].id,
      accountingDate: new Date("2026-08-20"),
      reference: "REC/APX/0001",
      status: JournalEntryStatus.POSTED,
      totalDebit: new Prisma.Decimal(75000),
      totalCredit: new Prisma.Decimal(75000),
      items: {
        create: [
          {
            accountId: accountsMap["Bank"].id,
            partnerId: contactsMap["Apex Workspaces & Hub"].id,
            debit: new Prisma.Decimal(75000),
            credit: new Prisma.Decimal(0),
          },
          {
            accountId: accountsMap["Debtors"].id,
            partnerId: contactsMap["Apex Workspaces & Hub"].id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(75000),
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentType: PaymentType.RECEIVE,
      partnerId: contactsMap["Apex Workspaces & Hub"].id,
      amount: new Prisma.Decimal(75000),
      date: new Date("2026-08-20"),
      paymentVia: PaymentMethod.BANK,
      note: "Full collection for INV/2026/0004",
      customerInvoiceId: inv4.id,
      journalEntryId: jePay5.id,
    },
  });

  // =========================================================================
  // 11. BUDGETS (Departmental & Project Performance Targets)
  // =========================================================================
  console.log("📊 11/13 Seeding Departmental Budgets...");
  const budgetsData = [
    {
      name: "Q3 Residential Furnishing Revenue",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-09-30"),
      analyticId: analyticsMap["Residential & Living Room Sales"].id,
      type: AnalyticType.INCOME,
      responsibleId: contactsMap["Urban Design House"].id,
      committedAmount: new Prisma.Decimal(250000),
      status: BudgetStatus.CONFIRMED,
    },
    {
      name: "Q3 Enterprise Corporate Target",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-09-30"),
      analyticId: analyticsMap["Enterprise Corporate Sales"].id,
      type: AnalyticType.INCOME,
      responsibleId: contactsMap["Joey Wills & Co"].id,
      committedAmount: new Prisma.Decimal(300000),
      status: BudgetStatus.CONFIRMED,
    },
    {
      name: "Q3 Raw Material Sourcing Budget",
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
      name: "Hospitality Furnishing Target",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-09-30"),
      analyticId: analyticsMap["Hospitality & Restaurant Projects"].id,
      type: AnalyticType.INCOME,
      responsibleId: contactsMap["Apex Workspaces & Hub"].id,
      committedAmount: new Prisma.Decimal(400000),
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
    {
      name: "Packaging & Delivery Fleet Budget",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-10-31"),
      analyticId: analyticsMap["Packaging & Delivery Fleet"].id,
      type: AnalyticType.EXPENSE,
      responsibleId: contactsMap["Regal Woods & Furnishings"].id,
      committedAmount: new Prisma.Decimal(120000),
      status: BudgetStatus.CONFIRMED,
    },
  ];

  for (const b of budgetsData) {
    await prisma.budget.create({ data: b });
  }

  console.log("✅ 13/13 All tables initialized and seeded with 100% relational integrity!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });