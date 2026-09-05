// Accounting Enterprise In-Memory Reactive Store
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest, checkBackendHealth } from '../../lib/apiClient';
import { createAnalyticApi } from '../analytics/api';
import { createBudgetApi, confirmBudgetApi, cancelBudgetApi, reviseBudgetApi } from '../budgets/api';



export type ContactType = 'customer' | 'vendor' | 'partner' | 'other';
export type ProductType = 'Goods' | 'Service' | 'Combo';
export type AccountCategory = 'Asset' | 'Liability' | 'Bank' | 'Capital' | 'Cash' | 'Income' | 'Expense';
export type JournalType = 'Sales' | 'Purchase' | 'Bank' | 'Cash';
export type EntryStatus = 'Draft' | 'Posted' | 'Cancelled';
export type TransactionStatus = 'Draft' | 'Confirmed' | 'Paid' | 'Cancelled';
export type BudgetState = 'Draft' | 'Confirmed' | 'Revised' | 'Cancelled';

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  imageUrl?: string;
  address: Address;
  type: ContactType;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  categoryId: string;
  categoryName: string;
  salesPrice: number;
  cost: number;
  imageUrl?: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountCategory;
  balance: number;
}

export interface Journal {
  id: string;
  code: string;
  name: string;
  type: JournalType;
  defaultAccountId: string;
  defaultAccountName: string;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountName: string;
  partnerId?: string;
  partnerName?: string;
  analyticId?: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; // e.g. JE/2026/0001
  date: string;
  journalId: string;
  journalName: string;
  status: EntryStatus;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  reference?: string;
}

export interface OrderLine {
  id: string;
  productId: string;
  productName: string;
  accountId: string;
  accountName: string;
  analyticId?: string;
  analyticName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string; // SO/2026/0001
  partnerId: string;
  partnerName: string;
  date: string;
  lines: OrderLine[];
  total: number;
  status: TransactionStatus;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string; // INV/2026/0001
  reference: string;
  partnerId: string;
  partnerName: string;
  date: string;
  dueDate: string;
  lines: OrderLine[];
  total: number;
  amountPaid: number;
  amountDue: number;
  status: TransactionStatus;
  journalEntryId?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string; // PO0001
  partnerId: string;
  partnerName: string;
  date: string;
  lines: OrderLine[];
  total: number;
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  billId?: string;
  billNumber?: string;
}

export interface VendorBill {
  id: string;
  billNumber: string; // BILL/2026/0001
  reference: string;
  partnerId: string;
  partnerName: string;
  date: string;
  dueDate: string;
  lines: OrderLine[];
  total: number;
  amountPaid: number;
  amountDue: number;
  paidViaCash?: number;
  paidViaBank?: number;
  purchaseOrderId?: string;
  poNumber?: string;
  status: TransactionStatus;
  journalEntryId?: string;
}

export interface AnalyticAccount {
  id: string;
  code?: string;
  name: string;
  type: 'Income' | 'Expense';
}

export interface Budget {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  responsible: string;
  responsibleId?: string;
  analyticId: string;
  analyticName: string;
  type: 'Income' | 'Expense';
  committedAmount: number;
  state: BudgetState;
  originalBudgetId?: string;
  originalBudgetName?: string;
  revisedBudgetId?: string;
  revisedBudgetName?: string;
}

export interface PaymentRecord {
  id: string;
  type: 'Send' | 'Receive';
  date: string;
  partnerId: string;
  partnerName: string;
  paymentVia: 'Bank' | 'Cash';
  amount: number;
  sourceDocType: 'Invoice' | 'Bill';
  sourceDocId: string;
  reference: string;
}

// Initial Seed Data
const initialContacts: Contact[] = [
  {
    id: 'c1',
    name: 'Open Wood Corp',
    email: 'procurement@openwood.com',
    phone: '+91 98765 43210',
    imageUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=60',
    type: 'vendor',
    address: {
      street: 'Plot 45, Timber Processing Zone',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
    },
  },
  {
    id: 'c2',
    name: 'Joey Wills & Co',
    email: 'joey@willsenterprise.com',
    phone: '+91 91234 56789',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60',
    type: 'customer',
    address: {
      street: 'Tower B, Cyber City Hub',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001',
    },
  },
  {
    id: 'c3',
    name: 'John Doe',
    email: 'john.doe@urbanfurniture.com',
    phone: '+91 98980 12345',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=60',
    type: 'customer',
    address: {
      street: 'Flat 402, Royal Palms Residency',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400076',
    },
  },
  {
    id: 'c4',
    name: 'Nordic Timber Suppliers',
    email: 'sales@nordictimber.in',
    phone: '+91 98234 56789',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=60',
    type: 'vendor',
    address: {
      street: 'Industrial Area 4, Phase 2',
      city: 'Gandhinagar',
      state: 'Gujarat',
      country: 'India',
      pincode: '382010',
    },
  },
  {
    id: 'c5',
    name: 'Hardware Hub Ltd',
    email: 'orders@hardwarehub.com',
    phone: '+91 91122 33445',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=60',
    type: 'vendor',
    address: {
      street: 'Shop 102, Steel Complex',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      pincode: '411001',
    },
  },
  {
    id: 'c6',
    name: 'Luxe Living Interiors',
    email: 'design@luxeliving.co.in',
    phone: '+91 97766 55443',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=60',
    type: 'customer',
    address: {
      street: 'Studio 8, High Street Avenue',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110001',
    },
  },
  {
    id: 'c7',
    name: 'Nexus Tech Parks',
    email: 'facilities@nexustech.org',
    phone: '+91 96655 44332',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=60',
    type: 'customer',
    address: {
      street: 'Campus 3, IT Corridor',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      pincode: '500081',
    },
  },
  {
    id: 'c8',
    name: 'Deco Addict Studio',
    email: 'hello@decoaddict.in',
    phone: '+91 99887 76655',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=60',
    type: 'partner',
    address: {
      street: 'Shop 12, Design Square Mall',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pincode: '380015',
    },
  },
];

const initialCategories: ProductCategory[] = [
  { id: 'cat1', name: 'Office Furniture' },
  { id: 'cat2', name: 'Living Furniture' },
  { id: 'cat3', name: 'Raw Materials & Hardware' },
  { id: 'cat4', name: 'Professional Services' },
];

const initialProducts: Product[] = [
  {
    id: 'p1',
    name: 'Executive Solid Oak Desk',
    type: 'Goods',
    categoryId: 'cat1',
    categoryName: 'Office Furniture',
    salesPrice: 28000,
    cost: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=120&auto=format&fit=crop&q=60',
  },
  {
    id: 'p2',
    name: 'Ergonomic High-Back Mesh Chair',
    type: 'Goods',
    categoryId: 'cat1',
    categoryName: 'Office Furniture',
    salesPrice: 15000,
    cost: 9500,
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-2c8eb1642ca8?w=120&auto=format&fit=crop&q=60',
  },
  {
    id: 'p3',
    name: 'Solid Walnut Coffee Table',
    type: 'Goods',
    categoryId: 'cat2',
    categoryName: 'Living Furniture',
    salesPrice: 22000,
    cost: 14000,
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=120&auto=format&fit=crop&q=60',
  },
  {
    id: 'p4',
    name: 'Modular 3-Seater Velvet Sofa',
    type: 'Goods',
    categoryId: 'cat2',
    categoryName: 'Living Furniture',
    salesPrice: 45000,
    cost: 29000,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&auto=format&fit=crop&q=60',
  },
  {
    id: 'p5',
    name: 'Raw Timber Plank Lot (Grade A)',
    type: 'Goods',
    categoryId: 'cat3',
    categoryName: 'Raw Materials & Hardware',
    salesPrice: 6200,
    cost: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=120&auto=format&fit=crop&q=60',
  },
  {
    id: 'p6',
    name: 'Metal Hardware Assembly Kit',
    type: 'Goods',
    categoryId: 'cat3',
    categoryName: 'Raw Materials & Hardware',
    salesPrice: 4900,
    cost: 3200,
    imageUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=120&auto=format&fit=crop&q=60',
  },
  {
    id: 'p7',
    name: 'Interior Architecture Consultation',
    type: 'Service',
    categoryId: 'cat4',
    categoryName: 'Professional Services',
    salesPrice: 12000,
    cost: 4000,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120&auto=format&fit=crop&q=60',
  },
];

const initialAccounts: Account[] = [
  { id: 'acc1', code: '4000', name: 'Sales Income', type: 'Income', balance: 673000 },
  { id: 'acc2', code: '5000', name: 'Purchase Expense', type: 'Expense', balance: 271000 },
  { id: 'acc3', code: '1010', name: 'Bank', type: 'Bank', balance: 678000 },
  { id: 'acc4', code: '1020', name: 'Cash', type: 'Cash', balance: 65000 },
  { id: 'acc5', code: '3000', name: 'Owner Capital', type: 'Capital', balance: 500000 },
  { id: 'acc6', code: '2010', name: 'Creditors', type: 'Liability', balance: 131000 },
  { id: 'acc7', code: '1050', name: 'Debtors', type: 'Asset', balance: 327000 },
];

const initialJournals: Journal[] = [
  { id: 'j1', code: 'SAL', name: 'Sales', type: 'Sales', defaultAccountId: 'acc1', defaultAccountName: 'Sales Income' },
  { id: 'j2', code: 'PUR', name: 'Purchase', type: 'Purchase', defaultAccountId: 'acc2', defaultAccountName: 'Purchase Expense' },
  { id: 'j3', code: 'BNK', name: 'Bank', type: 'Bank', defaultAccountId: 'acc3', defaultAccountName: 'Bank' },
  { id: 'j4', code: 'CSH', name: 'Cash', type: 'Cash', defaultAccountId: 'acc4', defaultAccountName: 'Cash' },
];

const initialAnalytics: AnalyticAccount[] = [
  { id: 'an1', code: 'AN-CORP', name: 'Enterprise Corporate Sales', type: 'Income' },
  { id: 'an2', code: 'AN-LIV', name: 'Residential & Living Room Sales', type: 'Income' },
  { id: 'an3', code: 'AN-RAW', name: 'Raw Material Sourcing & Procurement', type: 'Expense' },
  { id: 'an4', code: 'AN-LOG', name: 'Factory Manufacturing & Logistics', type: 'Expense' },
  { id: 'an5', code: 'AN-MKT', name: 'Marketing & Brand Advertising', type: 'Expense' },
];

const initialBudgets: Budget[] = [
  {
    id: 'b1',
    name: 'Q3 Corporate Enterprise Target',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    responsible: 'Joey Wills & Co',
    analyticId: 'an1',
    analyticName: 'Enterprise Corporate Sales',
    type: 'Income',
    committedAmount: 300000,
    state: 'Confirmed',
  },
  {
    id: 'b2',
    name: 'Q3 Raw Material Procurement Budget',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    responsible: 'Open Wood Corp',
    analyticId: 'an3',
    analyticName: 'Raw Material Sourcing & Procurement',
    type: 'Expense',
    committedAmount: 150000,
    state: 'Confirmed',
  },
];

const initialInvoices: CustomerInvoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV/2026/0001',
    reference: 'PO-JW-2026',
    partnerId: 'c2',
    partnerName: 'Joey Wills & Co',
    date: '2026-08-06',
    dueDate: '2026-09-06',
    lines: [
      {
        id: 'l1',
        productId: 'p1',
        productName: 'Executive Solid Oak Desk',
        accountId: 'acc1',
        accountName: 'Sales Income',
        analyticId: 'an1',
        analyticName: 'Enterprise Corporate Sales',
        quantity: 5,
        unitPrice: 28000,
        total: 140000,
      },
      {
        id: 'l2',
        productId: 'p2',
        productName: 'Ergonomic High-Back Mesh Chair',
        accountId: 'acc1',
        accountName: 'Sales Income',
        analyticId: 'an1',
        analyticName: 'Enterprise Corporate Sales',
        quantity: 10,
        unitPrice: 5000,
        total: 50000,
      },
    ],
    total: 190000,
    amountPaid: 190000,
    amountDue: 0,
    status: 'Paid',
    journalEntryId: 'je_inv1',
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV/2026/0002',
    reference: 'PORTAL-DIRECT-ORDER',
    partnerId: 'c3',
    partnerName: 'John Doe',
    date: '2026-08-21',
    dueDate: '2026-09-21',
    lines: [
      {
        id: 'l3',
        productId: 'p3',
        productName: 'Solid Walnut Coffee Table',
        accountId: 'acc1',
        accountName: 'Sales Income',
        analyticId: 'an2',
        analyticName: 'Residential & Living Room Sales',
        quantity: 1,
        unitPrice: 22000,
        total: 22000,
      },
      {
        id: 'l4',
        productId: 'p4',
        productName: 'Modular 3-Seater Velvet Sofa',
        accountId: 'acc1',
        accountName: 'Sales Income',
        analyticId: 'an2',
        analyticName: 'Residential & Living Room Sales',
        quantity: 1,
        unitPrice: 45000,
        total: 45000,
      },
    ],
    total: 67000,
    amountPaid: 0,
    amountDue: 67000,
    status: 'Confirmed',
    journalEntryId: 'je_inv2',
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV/2026/0003',
    reference: 'NTP-BULK-2026',
    partnerId: 'c7',
    partnerName: 'Nexus Tech Parks',
    date: '2026-08-10',
    dueDate: '2026-08-30',
    lines: [
      {
        id: 'l5',
        productId: 'p1',
        productName: 'Full Executive Office Suite Combo',
        accountId: 'acc1',
        accountName: 'Sales Income',
        analyticId: 'an1',
        analyticName: 'Enterprise Corporate Sales',
        quantity: 4,
        unitPrice: 48000,
        total: 192000,
      },
    ],
    total: 192000,
    amountPaid: 0,
    amountDue: 192000,
    status: 'Confirmed',
    journalEntryId: 'je_inv3',
  },
  {
    id: 'inv4',
    invoiceNumber: 'INV/2026/0004',
    reference: 'JW-ADDON-99',
    partnerId: 'c2',
    partnerName: 'Joey Wills & Co',
    date: '2026-08-28',
    dueDate: '2026-09-28',
    lines: [
      {
        id: 'l6',
        productId: 'p1',
        productName: 'Executive Solid Oak Desk',
        accountId: 'acc1',
        accountName: 'Sales Income',
        analyticId: 'an1',
        analyticName: 'Enterprise Corporate Sales',
        quantity: 2,
        unitPrice: 28000,
        total: 56000,
      },
    ],
    total: 56000,
    amountPaid: 30000,
    amountDue: 26000,
    status: 'Confirmed',
    journalEntryId: 'je_inv4',
  },
  {
    id: 'inv5',
    invoiceNumber: 'INV/2026/0005',
    reference: 'JD-PORTAL-01',
    partnerId: 'c3',
    partnerName: 'John Doe',
    date: '2026-08-01',
    dueDate: '2026-08-15',
    lines: [
      {
        id: 'l7',
        productId: 'p3',
        productName: 'Scandinavian 5-Tier Bookshelf',
        accountId: 'acc1',
        accountName: 'Sales Income',
        analyticId: 'an2',
        analyticName: 'Residential & Living Room Sales',
        quantity: 2,
        unitPrice: 19000,
        total: 38000,
      },
    ],
    total: 38000,
    amountPaid: 38000,
    amountDue: 0,
    status: 'Paid',
    journalEntryId: 'je_inv5',
  },
  {
    id: 'inv6',
    invoiceNumber: 'INV/2026/0006',
    reference: 'LLI-DELHI-004',
    partnerId: 'c6',
    partnerName: 'Luxe Living Interiors',
    date: '2026-08-25',
    dueDate: '2026-09-18',
    lines: [
      {
        id: 'l8',
        productId: 'p3',
        productName: 'Solid Walnut Coffee Table',
        accountId: 'acc1',
        accountName: 'Sales Income',
        analyticId: 'an2',
        analyticName: 'Residential & Living Room Sales',
        quantity: 2,
        unitPrice: 22000,
        total: 44000,
      },
      {
        id: 'l9',
        productId: 'p1',
        productName: 'Scandinavian 5-Tier Bookshelf',
        accountId: 'acc1',
        accountName: 'Sales Income',
        analyticId: 'an2',
        analyticName: 'Residential & Living Room Sales',
        quantity: 2,
        unitPrice: 19000,
        total: 38000,
      },
    ],
    total: 82000,
    amountPaid: 40000,
    amountDue: 42000,
    status: 'Confirmed',
    journalEntryId: 'je_inv6',
  },
  {
    id: 'inv7',
    invoiceNumber: 'INV/2026/0007',
    reference: 'DAS-DESIGN-09',
    partnerId: 'c8',
    partnerName: 'Deco Addict Studio',
    date: '2026-08-12',
    dueDate: '2026-09-12',
    lines: [
      {
        id: 'l10',
        productId: 'p1',
        productName: 'Full Executive Office Suite Combo',
        accountId: 'acc1',
        accountName: 'Sales Income',
        analyticId: 'an1',
        analyticName: 'Enterprise Corporate Sales',
        quantity: 1,
        unitPrice: 48000,
        total: 48000,
      },
    ],
    total: 48000,
    amountPaid: 48000,
    amountDue: 0,
    status: 'Paid',
    journalEntryId: 'je_inv7',
  },
];

const initialBills: VendorBill[] = [
  {
    id: 'bill1',
    billNumber: 'Bill/2026/0001',
    reference: 'OWC-INV-8891',
    partnerId: 'c1',
    partnerName: 'Open Wood Corp',
    date: '2026-08-02',
    dueDate: '2026-09-02',
    lines: [
      {
        id: 'bl1',
        productId: 'p5',
        productName: 'Raw Timber Plank Lot (Grade A)',
        accountId: 'acc2',
        accountName: 'Purchase Expense',
        analyticId: 'an3',
        analyticName: 'Raw Material Sourcing & Procurement',
        quantity: 20,
        unitPrice: 4500,
        total: 90000,
      },
    ],
    total: 90000,
    amountPaid: 90000,
    amountDue: 0,
    paidViaBank: 90000,
    status: 'Paid',
    journalEntryId: 'je_bill1',
  },
  {
    id: 'bill2',
    billNumber: 'Bill/2026/0002',
    reference: 'HH-9021',
    partnerId: 'c5',
    partnerName: 'Hardware Hub Ltd',
    date: '2026-08-16',
    dueDate: '2026-09-16',
    lines: [
      {
        id: 'bl2',
        productId: 'p6',
        productName: 'Metal Hardware Assembly Kit',
        accountId: 'acc2',
        accountName: 'Purchase Expense',
        analyticId: 'an4',
        analyticName: 'Factory Manufacturing & Logistics',
        quantity: 20,
        unitPrice: 3200,
        total: 64000,
      },
    ],
    total: 64000,
    amountPaid: 30000,
    amountDue: 34000,
    paidViaBank: 30000,
    status: 'Confirmed',
    journalEntryId: 'je_bill2',
  },
  {
    id: 'bill3',
    billNumber: 'Bill/2026/0003',
    reference: 'NTS-2026-990',
    partnerId: 'c4',
    partnerName: 'Nordic Timber Suppliers',
    date: '2026-08-26',
    dueDate: '2026-09-10',
    lines: [
      {
        id: 'bl3',
        productId: 'p5',
        productName: 'Raw Timber Plank Lot (Grade A)',
        accountId: 'acc2',
        accountName: 'Purchase Expense',
        analyticId: 'an3',
        analyticName: 'Raw Material Sourcing & Procurement',
        quantity: 10,
        unitPrice: 4500,
        total: 45000,
      },
    ],
    total: 45000,
    amountPaid: 0,
    amountDue: 45000,
    status: 'Confirmed',
    journalEntryId: 'je_bill3',
  },
  {
    id: 'bill4',
    billNumber: 'Bill/2026/0004',
    reference: 'OWC-INV-9022',
    partnerId: 'c1',
    partnerName: 'Open Wood Corp',
    date: '2026-08-29',
    dueDate: '2026-09-28',
    lines: [
      {
        id: 'bl4',
        productId: 'p3',
        productName: 'Scandinavian 5-Tier Bookshelf',
        accountId: 'acc2',
        accountName: 'Purchase Expense',
        analyticId: 'an3',
        analyticName: 'Raw Material Sourcing & Procurement',
        quantity: 4,
        unitPrice: 12000,
        total: 48000,
      },
    ],
    total: 48000,
    amountPaid: 20000,
    amountDue: 28000,
    paidViaBank: 20000,
    status: 'Confirmed',
    journalEntryId: 'je_bill4',
  },
  {
    id: 'bill5',
    billNumber: 'Bill/2026/0005',
    reference: 'DAS-SUP-410',
    partnerId: 'c8',
    partnerName: 'Deco Addict Studio',
    date: '2026-08-30',
    dueDate: '2026-09-15',
    lines: [
      {
        id: 'bl5',
        productId: 'p7',
        productName: 'Interior Architecture Consultation',
        accountId: 'acc2',
        accountName: 'Purchase Expense',
        analyticId: 'an5',
        analyticName: 'Marketing & Brand Advertising',
        quantity: 2,
        unitPrice: 12000,
        total: 24000,
      },
    ],
    total: 24000,
    amountPaid: 0,
    amountDue: 24000,
    status: 'Confirmed',
    journalEntryId: 'je_bill5',
  },
];

const initialPayments: PaymentRecord[] = [
  {
    id: 'pay1',
    type: 'Receive',
    date: '2026-08-15',
    partnerId: 'c2',
    partnerName: 'Joey Wills & Co',
    paymentVia: 'Bank',
    amount: 190000,
    sourceDocType: 'Invoice',
    sourceDocId: 'inv1',
    reference: 'PAY/INV/0001',
  },
  {
    id: 'pay2',
    type: 'Send',
    date: '2026-08-10',
    partnerId: 'c1',
    partnerName: 'Open Wood Corp',
    paymentVia: 'Bank',
    amount: 90000,
    sourceDocType: 'Bill',
    sourceDocId: 'bill1',
    reference: 'PAY/OWC/0001',
  },
  {
    id: 'pay3',
    type: 'Send',
    date: '2026-08-20',
    partnerId: 'c5',
    partnerName: 'Hardware Hub Ltd',
    paymentVia: 'Bank',
    amount: 30000,
    sourceDocType: 'Bill',
    sourceDocId: 'bill2',
    reference: 'PAY/HH/0001',
  },
  {
    id: 'pay4',
    type: 'Send',
    date: '2026-09-02',
    partnerId: 'c1',
    partnerName: 'Open Wood Corp',
    paymentVia: 'Bank',
    amount: 20000,
    sourceDocType: 'Bill',
    sourceDocId: 'bill4',
    reference: 'PAY/OWC/0002',
  },
  {
    id: 'pay5',
    type: 'Receive',
    date: '2026-09-01',
    partnerId: 'c2',
    partnerName: 'Joey Wills & Co',
    paymentVia: 'Bank',
    amount: 30000,
    sourceDocType: 'Invoice',
    sourceDocId: 'inv4',
    reference: 'PAY/JW/0002',
  },
  {
    id: 'pay6',
    type: 'Receive',
    date: '2026-08-05',
    partnerId: 'c3',
    partnerName: 'John Doe',
    paymentVia: 'Bank',
    amount: 38000,
    sourceDocType: 'Invoice',
    sourceDocId: 'inv5',
    reference: 'PAY/JD/0001',
  },
  {
    id: 'pay7',
    type: 'Receive',
    date: '2026-08-27',
    partnerId: 'c6',
    partnerName: 'Luxe Living Interiors',
    paymentVia: 'Cash',
    amount: 40000,
    sourceDocType: 'Invoice',
    sourceDocId: 'inv6',
    reference: 'PAY/LLI/0001',
  },
  {
    id: 'pay8',
    type: 'Receive',
    date: '2026-08-18',
    partnerId: 'c8',
    partnerName: 'Deco Addict Studio',
    paymentVia: 'Bank',
    amount: 48000,
    sourceDocType: 'Invoice',
    sourceDocId: 'inv7',
    reference: 'PAY/DAS/0001',
  },
];

const initialJournalEntries: JournalEntry[] = [
  {
    id: 'je_cap',
    entryNumber: 'JE/2026/0000',
    date: '2026-08-01',
    journalId: 'j3',
    journalName: 'Bank',
    status: 'Posted',
    reference: 'CAPITAL-INJECTION-2026',
    totalDebit: 500000,
    totalCredit: 500000,
    lines: [
      { id: 'jel_c1', accountId: 'acc3', accountName: 'Bank', debit: 500000, credit: 0 },
      { id: 'jel_c2', accountId: 'acc5', accountName: 'Owner Capital', debit: 0, credit: 500000 },
    ],
  },
  {
    id: 'je_bill1',
    entryNumber: 'JE/2026/0001',
    date: '2026-08-02',
    journalId: 'j2',
    journalName: 'Purchase',
    status: 'Posted',
    reference: 'Bill/2026/0001',
    totalDebit: 90000,
    totalCredit: 90000,
    lines: [
      { id: 'jel1', accountId: 'acc2', accountName: 'Purchase Expense', partnerId: 'c1', partnerName: 'Open Wood Corp', debit: 90000, credit: 0 },
      { id: 'jel2', accountId: 'acc6', accountName: 'Creditors', partnerId: 'c1', partnerName: 'Open Wood Corp', debit: 0, credit: 90000 },
    ],
  },
  {
    id: 'je_pay1',
    entryNumber: 'JE/2026/0002',
    date: '2026-08-10',
    journalId: 'j3',
    journalName: 'Bank',
    status: 'Posted',
    reference: 'PAY/OWC/0001',
    totalDebit: 90000,
    totalCredit: 90000,
    lines: [
      { id: 'jel3', accountId: 'acc6', accountName: 'Creditors', partnerId: 'c1', partnerName: 'Open Wood Corp', debit: 90000, credit: 0 },
      { id: 'jel4', accountId: 'acc3', accountName: 'Bank', partnerId: 'c1', partnerName: 'Open Wood Corp', debit: 0, credit: 90000 },
    ],
  },
  {
    id: 'je_inv1',
    entryNumber: 'JE/2026/0005',
    date: '2026-08-06',
    journalId: 'j1',
    journalName: 'Sales',
    status: 'Posted',
    reference: 'INV/2026/0001',
    totalDebit: 190000,
    totalCredit: 190000,
    lines: [
      { id: 'jel5', accountId: 'acc7', accountName: 'Debtors', partnerId: 'c2', partnerName: 'Joey Wills & Co', debit: 190000, credit: 0 },
      { id: 'jel6', accountId: 'acc1', accountName: 'Sales Income', partnerId: 'c2', partnerName: 'Joey Wills & Co', debit: 0, credit: 190000 },
    ],
  },
  {
    id: 'je_pay3',
    entryNumber: 'JE/2026/0006',
    date: '2026-08-15',
    journalId: 'j3',
    journalName: 'Bank',
    status: 'Posted',
    reference: 'PAY/INV/0001',
    totalDebit: 190000,
    totalCredit: 190000,
    lines: [
      { id: 'jel7', accountId: 'acc3', accountName: 'Bank', partnerId: 'c2', partnerName: 'Joey Wills & Co', debit: 190000, credit: 0 },
      { id: 'jel8', accountId: 'acc7', accountName: 'Debtors', partnerId: 'c2', partnerName: 'Joey Wills & Co', debit: 0, credit: 190000 },
    ],
  },
];

export interface AccountingStoreContextType {
  // Master data
  contacts: Contact[];
  addContact: (c: Omit<Contact, 'id'>) => Contact;
  updateContact: (id: string, c: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  categories: ProductCategory[];
  addCategory: (name: string) => ProductCategory;

  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, p: Partial<Product>) => void;

  accounts: Account[];
  addAccount: (acc: Omit<Account, 'id'>) => Account;

  journals: Journal[];
  addJournal: (j: Omit<Journal, 'id'>) => Journal;

  journalEntries: JournalEntry[];
  addJournalEntry: (je: Omit<JournalEntry, 'id' | 'entryNumber' | 'totalDebit' | 'totalCredit'> & { totalDebit?: number; totalCredit?: number }) => { success: boolean; message?: string; entry?: JournalEntry };
  postJournalEntry: (id: string) => void;
  cancelJournalEntry: (id: string) => void;

  // Analyticals & Budgets
  analytics: AnalyticAccount[];
  addAnalytic: (a: Omit<AnalyticAccount, 'id'>) => AnalyticAccount;

  budgets: Budget[];
  addBudget: (b: Omit<Budget, 'id'>) => Budget;
  updateBudgetState: (id: string, state: BudgetState) => void;
  reviseBudget: (id: string, newCommittedAmount: number) => Budget | undefined;
  getBudgetAchievedAmount: (budget: Budget) => number;
  getBudgetMatchedTransactions: (budget: Budget) => Array<{ id: string; type: 'Invoice' | 'Bill'; number: string; partner: string; date: string; amount: number }>;

  // Sales & Invoices
  salesOrders: SalesOrder[];
  addSalesOrder: (so: Omit<SalesOrder, 'id' | 'orderNumber'>) => SalesOrder;
  confirmSalesOrder: (id: string) => void;

  invoices: CustomerInvoice[];
  addInvoice: (inv: Omit<CustomerInvoice, 'id' | 'invoiceNumber' | 'amountPaid' | 'amountDue'>) => CustomerInvoice;
  confirmInvoice: (id: string) => void;
  payInvoice: (id: string, amount: number, paymentVia: 'Bank' | 'Cash', date: string) => void;

  // Purchases & Bills
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'orderNumber'>) => PurchaseOrder;
  confirmPurchaseOrder: (id: string) => void;

  bills: VendorBill[];
  addBill: (b: Omit<VendorBill, 'id' | 'billNumber' | 'amountPaid' | 'amountDue'>) => VendorBill;
  confirmBill: (id: string) => void;
  payBill: (id: string, amount: number, paymentVia: 'Bank' | 'Cash', date: string) => void;

  // Payments
  payments: PaymentRecord[];

  // Backend Integration & Synchronization
  isBackendConnected: boolean;
  isSyncing: boolean;
  refreshFromBackend: () => Promise<void>;

  // Helpers
  nextSeq: (prefix: string) => string;
}

const AccountingStoreContext = createContext<AccountingStoreContextType | undefined>(undefined);

export const AccountingStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const s = localStorage.getItem('odoo_contacts');
    return s ? JSON.parse(s) : initialContacts;
  });

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const s = localStorage.getItem('odoo_categories');
    return s ? JSON.parse(s) : initialCategories;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const s = localStorage.getItem('odoo_products');
    return s ? JSON.parse(s) : initialProducts;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const s = localStorage.getItem('odoo_accounts');
    return s ? JSON.parse(s) : initialAccounts;
  });

  const [journals, setJournals] = useState<Journal[]>(() => {
    const s = localStorage.getItem('odoo_journals');
    return s ? JSON.parse(s) : initialJournals;
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const s = localStorage.getItem('odoo_journal_entries');
    return s ? JSON.parse(s) : initialJournalEntries;
  });

  const [analytics, setAnalytics] = useState<AnalyticAccount[]>(() => {
    const s = localStorage.getItem('odoo_analytics');
    return s ? JSON.parse(s) : initialAnalytics;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const s = localStorage.getItem('odoo_budgets');
    return s ? JSON.parse(s) : initialBudgets;
  });

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    const s = localStorage.getItem('odoo_sales_orders');
    return s ? JSON.parse(s) : [];
  });

  const [invoices, setInvoices] = useState<CustomerInvoice[]>(() => {
    const s = localStorage.getItem('odoo_invoices');
    return s ? JSON.parse(s) : initialInvoices;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const s = localStorage.getItem('odoo_purchase_orders');
    return s ? JSON.parse(s) : [];
  });

  const [bills, setBills] = useState<VendorBill[]>(() => {
    const s = localStorage.getItem('odoo_bills');
    return s ? JSON.parse(s) : initialBills;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const s = localStorage.getItem('odoo_payments');
    return s ? JSON.parse(s) : initialPayments;
  });

  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Helper mappers between Backend DB and Frontend Store
  const mapBackendContact = (c: any): Contact => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone || '',
    imageUrl: c.image || undefined,
    address: {
      street: c.address || '',
      city: c.city || '',
      state: c.state || '',
      country: 'India',
      pincode: c.pincode || '',
    },
    type: (c.type?.toLowerCase() as ContactType) || 'partner',
  });

  const mapBackendProduct = (p: any): Product => ({
    id: p.id,
    name: p.name,
    type: p.type === 'SERVICE' ? 'Service' : p.type === 'COMBO' ? 'Combo' : 'Goods',
    categoryId: `cat_${p.category || 'general'}`,
    categoryName: p.category || 'General',
    salesPrice: Number(p.salesPrice) || 0,
    cost: Number(p.cost) || 0,
    imageUrl: p.image || undefined,
  });

  const mapBackendAccount = (a: any): Account => ({
    id: a.id,
    code: a.name.toLowerCase().replace(/\s+/g, '-'),
    name: a.name,
    type: (a.type.charAt(0) + a.type.slice(1).toLowerCase()) as AccountCategory,
    balance: 0,
  });

  const mapBackendJournal = (j: any): Journal => ({
    id: j.id,
    code: j.name.substring(0, 3).toUpperCase(),
    name: j.name,
    type: (j.type.charAt(0) + j.type.slice(1).toLowerCase()) as JournalType,
    defaultAccountId: j.defaultAccountId || '',
    defaultAccountName: j.defaultAccount?.name || '',
  });

  const mapBackendAnalytic = (a: any): AnalyticAccount => ({
    id: a.id,
    name: a.name,
    type: (a.type.charAt(0) + a.type.slice(1).toLowerCase()) as 'Income' | 'Expense',
  });

  const mapBackendBudget = (b: any): Budget => ({
    id: b.id,
    name: b.name,
    startDate: typeof b.startDate === 'string' ? b.startDate.split('T')[0] : new Date(b.startDate).toISOString().split('T')[0],
    endDate: typeof b.endDate === 'string' ? b.endDate.split('T')[0] : new Date(b.endDate).toISOString().split('T')[0],
    responsible: b.responsible?.name || 'Admin',
    responsibleId: b.responsibleId,
    analyticId: b.analyticId,
    analyticName: b.analytic?.name || 'General',
    type: b.type === 'INCOME' ? 'Income' : 'Expense',
    committedAmount: Number(b.committedAmount) || 0,
    state: b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'REVISED' ? 'Revised' : b.status === 'CANCELLED' ? 'Cancelled' : 'Draft',
  });

  const mapBackendPurchaseOrder = (po: any): PurchaseOrder => ({
    id: po.id,
    orderNumber: po.poNo,
    date: typeof po.poDate === 'string' ? po.poDate.split('T')[0] : new Date(po.poDate).toISOString().split('T')[0],
    partnerId: po.vendorId,
    partnerName: po.vendor?.name || 'Vendor',
    status: po.status === 'CONFIRMED' ? 'Confirmed' : po.status === 'CANCELLED' ? 'Cancelled' : 'Draft',
    lines: (po.lines || []).map((l: any) => ({
      id: l.id,
      productId: l.productId,
      productName: l.product?.name || 'Product',
      accountId: '',
      accountName: '',
      analyticId: l.analyticId,
      analyticName: l.analytic?.name,
      quantity: l.qty,
      unitPrice: Number(l.unitPrice) || 0,
      total: Number(l.subtotal) || ((l.qty || 1) * (Number(l.unitPrice) || 0)),
    })),
    total: Number(po.totalAmount) || 0,
  });

  const mapBackendVendorBill = (b: any): VendorBill => ({
    id: b.id,
    billNumber: b.billNo,
    reference: b.billReference || '',
    partnerId: b.vendorId,
    partnerName: b.vendor?.name || 'Vendor',
    date: typeof b.billDate === 'string' ? b.billDate.split('T')[0] : new Date(b.billDate).toISOString().split('T')[0],
    dueDate: typeof b.dueDate === 'string' ? b.dueDate.split('T')[0] : new Date(b.dueDate).toISOString().split('T')[0],
    lines: (b.lines || []).map((l: any) => ({
      id: l.id,
      productId: l.productId,
      productName: l.product?.name || 'Product',
      accountId: l.accountId,
      accountName: l.account?.name || 'Purchase Account',
      analyticId: l.analyticId,
      analyticName: l.analytic?.name,
      quantity: l.qty,
      unitPrice: Number(l.unitPrice) || 0,
      total: Number(l.subtotal) || ((l.qty || 1) * (Number(l.unitPrice) || 0)),
    })),
    total: Number(b.totalAmount) || 0,
    amountPaid: (Number(b.totalAmount) || 0) - (Number(b.amountDue) || 0),
    amountDue: Number(b.amountDue) || 0,
    status: b.status === 'CONFIRMED' ? (Number(b.amountDue) <= 0.01 ? 'Paid' : 'Confirmed') : b.status === 'CANCELLED' ? 'Cancelled' : 'Draft',
    journalEntryId: b.journalEntryId || undefined,
  });

  const mapBackendSalesOrder = (so: any): SalesOrder => ({
    id: so.id,
    orderNumber: so.soNo,
    date: typeof so.soDate === 'string' ? so.soDate.split('T')[0] : new Date(so.soDate).toISOString().split('T')[0],
    partnerId: so.customerId,
    partnerName: so.customer?.name || 'Customer',
    status: so.status === 'CONFIRMED' ? 'Confirmed' : so.status === 'CANCELLED' ? 'Cancelled' : 'Draft',
    lines: (so.lines || []).map((l: any) => ({
      id: l.id,
      productId: l.productId,
      productName: l.product?.name || 'Product',
      accountId: '',
      accountName: '',
      quantity: l.qty,
      unitPrice: Number(l.unitPrice) || 0,
      total: Number(l.subtotal) || ((l.qty || 1) * (Number(l.unitPrice) || 0)),
    })),
    total: Number(so.totalAmount) || 0,
  });

  const mapBackendCustomerInvoice = (inv: any): CustomerInvoice => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNo,
    reference: inv.reference || '',
    partnerId: inv.customerId,
    partnerName: inv.customer?.name || 'Customer',
    date: typeof inv.invoiceDate === 'string' ? inv.invoiceDate.split('T')[0] : new Date(inv.invoiceDate).toISOString().split('T')[0],
    dueDate: typeof inv.dueDate === 'string' ? inv.dueDate.split('T')[0] : new Date(inv.dueDate).toISOString().split('T')[0],
    lines: (inv.lines || []).map((l: any) => ({
      id: l.id,
      productId: l.productId,
      productName: l.product?.name || 'Product',
      accountId: l.accountId,
      accountName: l.account?.name || 'Sales Account',
      analyticId: l.analyticId,
      analyticName: l.analytic?.name,
      quantity: l.qty,
      unitPrice: Number(l.unitPrice) || 0,
      total: Number(l.subtotal) || ((l.qty || 1) * (Number(l.unitPrice) || 0)),
    })),
    total: Number(inv.totalAmount) || 0,
    amountPaid: (Number(inv.totalAmount) || 0) - (Number(inv.amountDue) || 0),
    amountDue: Number(inv.amountDue) || 0,
    status: inv.status === 'CONFIRMED' ? (Number(inv.amountDue) <= 0.01 ? 'Paid' : 'Confirmed') : inv.status === 'CANCELLED' ? 'Cancelled' : 'Draft',
    journalEntryId: inv.journalEntryId || undefined,
  });

  const mapBackendPayment = (p: any): PaymentRecord => ({
    id: p.id,
    type: p.paymentType === 'RECEIVE' ? 'Receive' : 'Send',
    date: typeof p.date === 'string' ? p.date.split('T')[0] : new Date(p.date).toISOString().split('T')[0],
    partnerId: p.partnerId,
    partnerName: p.partner?.name || 'Partner',
    paymentVia: p.paymentVia === 'CASH' ? 'Cash' : 'Bank',
    amount: Number(p.amount) || 0,
    sourceDocType: p.customerInvoiceId ? 'Invoice' : 'Bill',
    sourceDocId: p.customerInvoiceId || p.vendorBillId || '',
    reference: p.note || (p.customerInvoice?.invoiceNo ? `Payment for ${p.customerInvoice.invoiceNo}` : p.vendorBill?.billNo ? `Payment for ${p.vendorBill.billNo}` : 'Payment'),
  });

  const mapBackendJournalEntry = (je: any): JournalEntry => ({
    id: je.id,
    entryNumber: je.entryNo,
    date: typeof je.accountingDate === 'string' ? je.accountingDate.split('T')[0] : new Date(je.accountingDate).toISOString().split('T')[0],
    journalId: je.journalId,
    journalName: je.journal?.name || 'General Journal',
    status: je.status === 'POSTED' ? 'Posted' : je.status === 'CANCELLED' ? 'Cancelled' : 'Draft',
    reference: je.reference || '',
    totalDebit: Number(je.totalDebit) || 0,
    totalCredit: Number(je.totalCredit) || 0,
    lines: (je.items || []).map((it: any) => ({
      id: it.id,
      accountId: it.accountId,
      accountName: it.account?.name || 'Account',
      partnerId: it.partnerId,
      partnerName: it.partner?.name,
      label: it.description || '',
      debit: Number(it.debit) || 0,
      credit: Number(it.credit) || 0,
    })),
  });

  // Load all existing backend data once on mount or when token is present
  // Unified Live Backend Hydration
  const loadBackendData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const health = await checkBackendHealth();
      setIsBackendConnected(health.isOnline);

      if (!health.isOnline) {
        setIsSyncing(false);
        return;
      }

      const [
        contactsRes,
        productsRes,
        accountsRes,
        journalsRes,
        analyticsRes,
        budgetsRes,
        posRes,
        billsRes,
        sosRes,
        invoicesRes,
        paymentsRes,
        entriesRes
      ] = await Promise.all([
        apiRequest<any[]>('/contacts').catch(() => ({ success: false, data: [] })),
        apiRequest<any[]>('/products').catch(() => ({ success: false, data: [] })),
        apiRequest<any[]>('/accounts').catch(() => ({ success: false, data: [] })),
        apiRequest<any[]>('/journals').catch(() => ({ success: false, data: [] })),
        apiRequest<any[]>('/analytics').catch(() => ({ success: false, data: [] })),
        apiRequest<any[]>('/budgets').catch(() => ({ success: false, data: [] })),
        apiRequest<any[]>('/purchase-orders').catch(() => ({ success: false, data: [] })),
        apiRequest<any[]>('/vendor-bills').catch(() => ({ success: false, data: [] })),
        apiRequest<any[]>('/sales-orders').catch(() => ({ success: false, data: [] })),
        apiRequest<any[]>('/customer-invoices').catch(() => ({ success: false, data: [] })),
        apiRequest<any[]>('/payments').catch(() => ({ success: false, data: [] })),
        apiRequest<any[]>('/journal-entries').catch(() => ({ success: false, data: [] })),
      ]);

      if (contactsRes.success && Array.isArray(contactsRes.data) && contactsRes.data.length > 0) {
        setContacts(contactsRes.data.map(mapBackendContact));
      }
      if (productsRes.success && Array.isArray(productsRes.data) && productsRes.data.length > 0) {
        setProducts(productsRes.data.map(mapBackendProduct));
      }
      if (accountsRes.success && Array.isArray(accountsRes.data) && accountsRes.data.length > 0) {
        setAccounts(accountsRes.data.map(mapBackendAccount));
      }
      if (journalsRes.success && Array.isArray(journalsRes.data) && journalsRes.data.length > 0) {
        setJournals(journalsRes.data.map(mapBackendJournal));
      }
      if (analyticsRes.success && Array.isArray(analyticsRes.data) && analyticsRes.data.length > 0) {
        setAnalytics(analyticsRes.data.map(mapBackendAnalytic));
      }
      if (budgetsRes.success && Array.isArray(budgetsRes.data) && budgetsRes.data.length > 0) {
        setBudgets(budgetsRes.data.map(mapBackendBudget));
      }
      if (posRes.success && Array.isArray(posRes.data) && posRes.data.length > 0) {
        setPurchaseOrders(posRes.data.map(mapBackendPurchaseOrder));
      }
      if (billsRes.success && Array.isArray(billsRes.data) && billsRes.data.length > 0) {
        setBills(billsRes.data.map(mapBackendVendorBill));
      }
      if (sosRes.success && Array.isArray(sosRes.data) && sosRes.data.length > 0) {
        setSalesOrders(sosRes.data.map(mapBackendSalesOrder));
      }
      if (invoicesRes.success && Array.isArray(invoicesRes.data) && invoicesRes.data.length > 0) {
        setInvoices(invoicesRes.data.map(mapBackendCustomerInvoice));
      }
      if (paymentsRes.success && Array.isArray(paymentsRes.data) && paymentsRes.data.length > 0) {
        setPayments(paymentsRes.data.map(mapBackendPayment));
      }
      if (entriesRes.success && Array.isArray(entriesRes.data) && entriesRes.data.length > 0) {
        setJournalEntries(entriesRes.data.map(mapBackendJournalEntry));
      }
    } catch (e) {
      console.warn('Backend data sync encountered an issue, continuing:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const refreshFromBackend = useCallback(async () => {
    await loadBackendData();
  }, [loadBackendData]);

  useEffect(() => {
    loadBackendData();

    const handleLogin = () => {
      loadBackendData();
    };

    const handleAccountingUpdated = () => {
      try {
        const invStr = localStorage.getItem('odoo_invoices');
        if (invStr) setInvoices(JSON.parse(invStr));
        const billsStr = localStorage.getItem('odoo_bills');
        if (billsStr) setBills(JSON.parse(billsStr));
        const payStr = localStorage.getItem('odoo_payments');
        if (payStr) setPayments(JSON.parse(payStr));
      } catch (e) {
        console.error('Error reloading data on accounting update event:', e);
      }
    };

    window.addEventListener('auth:login', handleLogin);
    window.addEventListener('odoo:accounting_updated', handleAccountingUpdated);
    window.addEventListener('storage', handleAccountingUpdated);

    return () => {
      window.removeEventListener('auth:login', handleLogin);
      window.removeEventListener('odoo:accounting_updated', handleAccountingUpdated);
      window.removeEventListener('storage', handleAccountingUpdated);
    };
  }, [loadBackendData]);

  // Sync to local storage
  useEffect(() => { localStorage.setItem('odoo_contacts', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem('odoo_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('odoo_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('odoo_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('odoo_journals', JSON.stringify(journals)); }, [journals]);
  useEffect(() => { localStorage.setItem('odoo_journal_entries', JSON.stringify(journalEntries)); }, [journalEntries]);
  useEffect(() => { localStorage.setItem('odoo_analytics', JSON.stringify(analytics)); }, [analytics]);
  useEffect(() => { localStorage.setItem('odoo_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('odoo_sales_orders', JSON.stringify(salesOrders)); }, [salesOrders]);
  useEffect(() => { localStorage.setItem('odoo_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('odoo_purchase_orders', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('odoo_bills', JSON.stringify(bills)); }, [bills]);
  useEffect(() => { localStorage.setItem('odoo_payments', JSON.stringify(payments)); }, [payments]);

  const nextSeq = (prefix: string) => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}/${year}/${rand}`;
  };

  // Helper to ensure valid DB UUID reference
  const resolveUUID = (id: string, list: Array<{ id: string }>, fallback?: string) => {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) return id;
    const found = list.find((item) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id));
    return found ? found.id : fallback || id;
  };

  // Contact operations
  const addContact = (c: Omit<Contact, 'id'>) => {
    const tempId = `c_${Date.now()}`;
    const newC: Contact = { ...c, id: tempId };
    setContacts((prev) => [newC, ...prev]);

    apiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        name: c.name,
        type: (c.type === 'customer' ? 'CUSTOMER' : c.type === 'vendor' ? 'VENDOR' : 'BOTH'),
        email: c.email || `contact_${Date.now()}@company.com`,
        phone: c.phone || '',
        address: c.address?.street || '',
        city: c.address?.city || '',
        state: c.address?.state || '',
        pincode: c.address?.pincode || '',
        image: c.imageUrl || '',
      }),
    }).then((res) => {
      if (res.success && res.data) {
        const serverC = mapBackendContact(res.data);
        setContacts((prev) => prev.map((item) => (item.id === tempId ? serverC : item)));
      }
    }).catch((e) => console.warn('Backend contact create sync error:', e));

    return newC;
  };

  const updateContact = (id: string, patch: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Category
  const addCategory = (name: string) => {
    const existing = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const newCat: ProductCategory = { id: `cat_${Date.now()}`, name };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  // Products
  const addProduct = (p: Omit<Product, 'id'>) => {
    const tempId = `p_${Date.now()}`;
    const newP: Product = { ...p, id: tempId };
    setProducts((prev) => [newP, ...prev]);

    apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify({
        name: p.name,
        category: p.categoryName || 'General',
        salesPrice: p.salesPrice,
        cost: p.cost,
        type: (p.type?.toUpperCase() || 'GOODS'),
        image: p.imageUrl || '',
      }),
    }).then((res) => {
      if (res.success && res.data) {
        const serverP = mapBackendProduct(res.data);
        setProducts((prev) => prev.map((item) => (item.id === tempId ? serverP : item)));
      }
    }).catch((e) => console.warn('Backend product create sync error:', e));

    return newP;
  };

  const updateProduct = (id: string, patch: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  // Accounts
  const addAccount = (acc: Omit<Account, 'id'>) => {
    const newAcc: Account = { ...acc, id: `acc_${Date.now()}` };
    setAccounts((prev) => [...prev, newAcc]);
    return newAcc;
  };

  // Journals
  const addJournal = (j: Omit<Journal, 'id'>) => {
    const newJ: Journal = { ...j, id: `j_${Date.now()}` };
    setJournals((prev) => [...prev, newJ]);
    return newJ;
  };

  // Analytics & Budgets
  const addAnalytic = (a: Omit<AnalyticAccount, 'id'>) => {
    const newA: AnalyticAccount = { ...a, id: `an_${Date.now()}` };
    setAnalytics((prev) => [...prev, newA]);

    createAnalyticApi({
      name: a.name,
      type: a.type === 'Income' ? 'INCOME' : 'EXPENSE',
    }).then((res) => {
      if (res.success && res.data) {
        setAnalytics((prev) => prev.map((item) => (item.id === newA.id ? { ...item, id: res.data!.id } : item)));
      }
    }).catch((e) => console.warn('Backend analytic create sync error:', e));

    return newA;
  };

  const addBudget = (b: Omit<Budget, 'id'>) => {
    const newB: Budget = { ...b, id: `b_${Date.now()}` };
    setBudgets((prev) => [newB, ...prev]);

    // Backend Sync
    createBudgetApi({
      name: b.name,
      startDate: b.startDate,
      endDate: b.endDate,
      analyticId: b.analyticId,
      responsibleId: contacts[0]?.id || 'c1',
      committedAmount: b.committedAmount,
    }).then((res) => {
      if (res.success && res.data) {
        setBudgets((prev) => prev.map((item) => (item.id === newB.id ? { ...item, id: res.data!.id } : item)));
      }
    }).catch((e) => console.warn('Backend budget create sync error:', e));

    return newB;
  };

  const updateBudgetState = (id: string, state: BudgetState) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, state } : b)));

    if (state === 'Confirmed') {
      confirmBudgetApi(id).catch((e) => console.warn('Backend confirm budget error:', e));
    } else if (state === 'Cancelled') {
      cancelBudgetApi(id).catch((e) => console.warn('Backend cancel budget error:', e));
    }
  };

  const reviseBudget = (id: string, newCommittedAmount: number) => {
    const old = budgets.find((b) => b.id === id);
    if (!old) return;

    const childId = `b_rev_${Date.now()}`;
    const childName = old.name.includes('(Rev')
      ? old.name.replace(/\(Rev \d+\)/, `(Rev ${parseInt(old.name.match(/\(Rev (\d+)\)/)?.[1] || '1') + 1})`)
      : `${old.name} (Rev 1)`;

    const revisedChild: Budget = {
      ...old,
      id: childId,
      name: childName,
      committedAmount: newCommittedAmount,
      state: 'Confirmed',
      originalBudgetId: old.id,
      originalBudgetName: old.name,
    };

    setBudgets((prev) => [
      revisedChild,
      ...prev.map((b) =>
        b.id === id
          ? {
              ...b,
              state: 'Revised' as BudgetState,
              revisedBudgetId: childId,
              revisedBudgetName: childName,
            }
          : b
      ),
    ]);

    reviseBudgetApi(id, newCommittedAmount).catch((e) => console.warn('Backend revise budget error:', e));
    return revisedChild;
  };

  // Journal Entries with strict Debit == Credit Rule
  const addJournalEntry = (je: Omit<JournalEntry, 'id' | 'entryNumber' | 'totalDebit' | 'totalCredit'> & { totalDebit?: number; totalCredit?: number }) => {
    const totalDr = je.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const totalCr = je.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);

    if (Math.abs(totalDr - totalCr) > 0.01) {
      return {
        success: false,
        message: `Debit and Credit totals must balance! (Debit: ₹${totalDr.toFixed(2)}, Credit: ₹${totalCr.toFixed(2)})`,
      };
    }

    const newEntry: JournalEntry = {
      ...je,
      id: `je_${Date.now()}`,
      entryNumber: nextSeq('JE'),
      totalDebit: totalDr,
      totalCredit: totalCr,
    };
    setJournalEntries((prev) => [newEntry, ...prev]);
    return { success: true, entry: newEntry };
  };

  const postJournalEntry = (id: string) => {
    setJournalEntries((prev) =>
      prev.map((je) => (je.id === id ? { ...je, status: 'Posted' } : je))
    );
  };

  const cancelJournalEntry = (id: string) => {
    setJournalEntries((prev) =>
      prev.map((je) => (je.id === id ? { ...je, status: 'Cancelled' } : je))
    );
  };

  const getBudgetAchievedAmount = (budget: Budget): number => {
    let sum = 0;
    const start = new Date(budget.startDate).getTime();
    const end = new Date(budget.endDate).getTime();

    if (budget.type === 'Income') {
      invoices.forEach((inv) => {
        const invDate = new Date(inv.date).getTime();
        if (invDate >= start && invDate <= end && inv.status !== 'Cancelled') {
          inv.lines.forEach((l) => {
            const matches =
              l.analyticId === budget.analyticId ||
              (l.analyticName && budget.analyticName && l.analyticName.toLowerCase() === budget.analyticName.toLowerCase());
            if (matches) {
              sum += l.total;
            }
          });
        }
      });
    } else {
      bills.forEach((bill) => {
        const billDate = new Date(bill.date).getTime();
        if (billDate >= start && billDate <= end && bill.status !== 'Cancelled') {
          bill.lines.forEach((l) => {
            const matches =
              l.analyticId === budget.analyticId ||
              (l.analyticName && budget.analyticName && l.analyticName.toLowerCase() === budget.analyticName.toLowerCase());
            if (matches) {
              sum += l.total;
            }
          });
        }
      });
    }
    return sum;
  };

  const getBudgetMatchedTransactions = (budget: Budget) => {
    const list: Array<{ id: string; type: 'Invoice' | 'Bill'; number: string; partner: string; date: string; amount: number }> = [];
    const start = new Date(budget.startDate).getTime();
    const end = new Date(budget.endDate).getTime();

    if (budget.type === 'Income') {
      invoices.forEach((inv) => {
        const invDate = new Date(inv.date).getTime();
        if (invDate >= start && invDate <= end && inv.status !== 'Cancelled') {
          const matchedAmount = inv.lines.reduce((s, l) => {
            const matches =
              l.analyticId === budget.analyticId ||
              (l.analyticName && budget.analyticName && l.analyticName.toLowerCase() === budget.analyticName.toLowerCase());
            return matches ? s + l.total : s;
          }, 0);
          if (matchedAmount > 0) {
            list.push({ id: inv.id, type: 'Invoice', number: inv.invoiceNumber, partner: inv.partnerName, date: inv.date, amount: matchedAmount });
          }
        }
      });
    } else {
      bills.forEach((bill) => {
        const billDate = new Date(bill.date).getTime();
        if (billDate >= start && billDate <= end && bill.status !== 'Cancelled') {
          const matchedAmount = bill.lines.reduce((s, l) => {
            const matches =
              l.analyticId === budget.analyticId ||
              (l.analyticName && budget.analyticName && l.analyticName.toLowerCase() === budget.analyticName.toLowerCase());
            return matches ? s + l.total : s;
          }, 0);
          if (matchedAmount > 0) {
            list.push({ id: bill.id, type: 'Bill', number: bill.billNumber, partner: bill.partnerName, date: bill.date, amount: matchedAmount });
          }
        }
      });
    }
    return list;
  };

  // Sales Orders & Invoices
  const addSalesOrder = (so: Omit<SalesOrder, 'id' | 'orderNumber'>) => {
    const tempId = `so_${Date.now()}`;
    const newSO: SalesOrder = { ...so, id: tempId, orderNumber: nextSeq('SO') };
    setSalesOrders((prev) => [newSO, ...prev]);

    const customerId = resolveUUID(so.partnerId, contacts);
    const validLines = so.lines.map((l) => ({
      productId: resolveUUID(l.productId, products),
      qty: l.quantity,
      unitPrice: l.unitPrice,
    }));

    apiRequest('/sales-orders', {
      method: 'POST',
      body: JSON.stringify({
        customerId,
        soDate: so.date || new Date().toISOString(),
        lines: validLines,
      }),
    }).then((res) => {
      if (res.success && res.data) {
        const serverSO = mapBackendSalesOrder(res.data);
        setSalesOrders((prev) => prev.map((item) => (item.id === tempId ? serverSO : item)));
      }
    });

    return newSO;
  };

  const confirmSalesOrder = (id: string) => {
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id === id && so.status === 'Draft') {
          return { ...so, status: 'Confirmed' };
        }
        return so;
      })
    );
  };

  const addInvoice = (inv: Omit<CustomerInvoice, 'id' | 'invoiceNumber' | 'amountPaid' | 'amountDue'>) => {
    const tempId = `inv_${Date.now()}`;
    const newInv: CustomerInvoice = {
      ...inv,
      id: tempId,
      invoiceNumber: nextSeq('INV'),
      amountPaid: 0,
      amountDue: inv.total,
    };
    setInvoices((prev) => [newInv, ...prev]);

    const customerId = resolveUUID(inv.partnerId, contacts);
    const defaultIncomeAcc = accounts.find((a) => a.type === 'Income') || accounts[0];
    const validLines = inv.lines.map((l) => ({
      productId: resolveUUID(l.productId, products),
      accountId: resolveUUID(l.accountId || defaultIncomeAcc?.id || '', accounts),
      analyticId: l.analyticId ? resolveUUID(l.analyticId, analytics) : undefined,
      qty: l.quantity,
      unitPrice: l.unitPrice,
    }));

    apiRequest('/customer-invoices', {
      method: 'POST',
      body: JSON.stringify({
        customerId,
        reference: inv.reference || '',
        invoiceDate: inv.date || new Date().toISOString(),
        dueDate: inv.dueDate || inv.date || new Date().toISOString(),
        lines: validLines,
      }),
    }).then((res) => {
      if (res.success && res.data) {
        const serverInv = mapBackendCustomerInvoice(res.data);
        setInvoices((prev) => prev.map((item) => (item.id === tempId ? serverInv : item)));
      }
    });

    return newInv;
  };

  const confirmInvoice = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: 'Confirmed' } : inv))
    );

    apiRequest(`/customer-invoices/${id}/confirm`, { method: 'POST' }).then((res) => {
      if (res.success) {
        apiRequest('/journal-entries').then((jeRes) => {
          if (jeRes.success && Array.isArray(jeRes.data)) {
            setJournalEntries(jeRes.data.map(mapBackendJournalEntry));
          }
        });
      }
    });
  };

  const payInvoice = (id: string, amount: number, paymentVia: 'Bank' | 'Cash', date: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const newPaid = inv.amountPaid + amount;
          const newDue = Math.max(0, inv.total - newPaid);
          const newStatus = newDue <= 0.01 ? 'Paid' : 'Confirmed';

          const paymentRec: PaymentRecord = {
            id: `pay_${Date.now()}`,
            type: 'Receive',
            date,
            partnerId: inv.partnerId,
            partnerName: inv.partnerName,
            paymentVia,
            amount,
            sourceDocType: 'Invoice',
            sourceDocId: inv.id,
            reference: `Payment for ${inv.invoiceNumber}`,
          };
          setPayments((p) => [paymentRec, ...p]);

          const partnerId = resolveUUID(inv.partnerId, contacts);
          apiRequest('/payments', {
            method: 'POST',
            body: JSON.stringify({
              paymentType: 'RECEIVE',
              partnerId,
              amount,
              paymentVia: paymentVia.toUpperCase(),
              customerInvoiceId: id,
              note: `Payment for ${inv.invoiceNumber}`,
            }),
          }).then((res) => {
            if (res.success) {
              apiRequest('/journal-entries').then((jeRes) => {
                if (jeRes.success && Array.isArray(jeRes.data)) {
                  setJournalEntries(jeRes.data.map(mapBackendJournalEntry));
                }
              });
            }
          });

          return {
            ...inv,
            amountPaid: newPaid,
            amountDue: newDue,
            status: newStatus,
          };
        }
        return inv;
      })
    );
  };

  // Purchases & Bills
  const addPurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'orderNumber'>) => {
    const tempId = `po_${Date.now()}`;
    const newPO: PurchaseOrder = { ...po, id: tempId, orderNumber: nextSeq('PO') };
    setPurchaseOrders((prev) => [newPO, ...prev]);

    const vendorId = resolveUUID(po.partnerId, contacts);
    const validLines = po.lines.map((l) => ({
      productId: resolveUUID(l.productId, products),
      analyticId: l.analyticId ? resolveUUID(l.analyticId, analytics) : undefined,
      qty: l.quantity,
      unitPrice: l.unitPrice,
    }));

    apiRequest('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify({
        vendorId,
        poDate: po.date || new Date().toISOString(),
        lines: validLines,
      }),
    }).then((res) => {
      if (res.success && res.data) {
        const serverPO = mapBackendPurchaseOrder(res.data);
        setPurchaseOrders((prev) => prev.map((item) => (item.id === tempId ? serverPO : item)));
      }
    });

    return newPO;
  };

  const confirmPurchaseOrder = (id: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === id ? { ...po, status: 'Confirmed' } : po))
    );
    apiRequest(`/purchase-orders/${id}/confirm`, { method: 'POST' });
  };

  const addBill = (b: Omit<VendorBill, 'id' | 'billNumber' | 'amountPaid' | 'amountDue'>) => {
    const tempId = `bill_${Date.now()}`;
    const newBill: VendorBill = {
      ...b,
      id: tempId,
      billNumber: nextSeq('BILL'),
      amountPaid: 0,
      amountDue: b.total,
    };
    setBills((prev) => [newBill, ...prev]);

    const vendorId = resolveUUID(b.partnerId, contacts);
    const defaultExpenseAcc = accounts.find((a) => a.type === 'Expense') || accounts[0];
    const validLines = b.lines.map((l) => ({
      productId: resolveUUID(l.productId, products),
      accountId: resolveUUID(l.accountId || defaultExpenseAcc?.id || '', accounts),
      analyticId: l.analyticId ? resolveUUID(l.analyticId, analytics) : undefined,
      qty: l.quantity,
      unitPrice: l.unitPrice,
    }));

    apiRequest('/vendor-bills', {
      method: 'POST',
      body: JSON.stringify({
        vendorId,
        billReference: b.reference || '',
        billDate: b.date || new Date().toISOString(),
        dueDate: b.dueDate || b.date || new Date().toISOString(),
        lines: validLines,
      }),
    }).then((res) => {
      if (res.success && res.data) {
        const serverBill = mapBackendVendorBill(res.data);
        setBills((prev) => prev.map((item) => (item.id === tempId ? serverBill : item)));
      }
    });

    return newBill;
  };

  const confirmBill = (id: string) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'Confirmed' } : b))
    );

    apiRequest(`/vendor-bills/${id}/confirm`, { method: 'POST' }).then((res) => {
      if (res.success) {
        apiRequest('/journal-entries').then((jeRes) => {
          if (jeRes.success && Array.isArray(jeRes.data)) {
            setJournalEntries(jeRes.data.map(mapBackendJournalEntry));
          }
        });
      }
    });
  };

  const payBill = (id: string, amount: number, paymentVia: 'Bank' | 'Cash', date: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newPaid = b.amountPaid + amount;
          const newDue = Math.max(0, b.total - newPaid);
          const newStatus = newDue <= 0.01 ? 'Paid' : 'Confirmed';

          const paymentRec: PaymentRecord = {
            id: `pay_${Date.now()}`,
            type: 'Send',
            date,
            partnerId: b.partnerId,
            partnerName: b.partnerName,
            paymentVia,
            amount,
            sourceDocType: 'Bill',
            sourceDocId: b.id,
            reference: `Payment for ${b.billNumber}`,
          };
          setPayments((p) => [paymentRec, ...p]);

          const partnerId = resolveUUID(b.partnerId, contacts);
          apiRequest('/payments', {
            method: 'POST',
            body: JSON.stringify({
              paymentType: 'SEND',
              partnerId,
              amount,
              paymentVia: paymentVia.toUpperCase(),
              vendorBillId: id,
              note: `Payment for ${b.billNumber}`,
            }),
          }).then((res) => {
            if (res.success) {
              apiRequest('/journal-entries').then((jeRes) => {
                if (jeRes.success && Array.isArray(jeRes.data)) {
                  setJournalEntries(jeRes.data.map(mapBackendJournalEntry));
                }
              });
            }
          });

          const paidBank = (b.paidViaBank || 0) + (paymentVia === 'Bank' ? amount : 0);
          const paidCash = (b.paidViaCash || 0) + (paymentVia === 'Cash' ? amount : 0);

          return {
            ...b,
            amountPaid: newPaid,
            amountDue: newDue,
            paidViaBank: paidBank,
            paidViaCash: paidCash,
            status: newStatus,
          };
        }
        return b;
      })
    );
  };

  return (
    <AccountingStoreContext.Provider
      value={{
        contacts,
        addContact,
        updateContact,
        deleteContact,
        categories,
        addCategory,
        products,
        addProduct,
        updateProduct,
        accounts,
        addAccount,
        journals,
        addJournal,
        journalEntries,
        addJournalEntry,
        postJournalEntry,
        cancelJournalEntry,
        analytics,
        addAnalytic,
        budgets,
        addBudget,
        updateBudgetState,
        reviseBudget,
        getBudgetAchievedAmount,
        getBudgetMatchedTransactions,
        salesOrders,
        addSalesOrder,
        confirmSalesOrder,
        invoices,
        addInvoice,
        confirmInvoice,
        payInvoice,
        purchaseOrders,
        addPurchaseOrder,
        confirmPurchaseOrder,
        bills,
        addBill,
        confirmBill,
        payBill,
        payments,
        isBackendConnected,
        isSyncing,
        refreshFromBackend,
        nextSeq,
      }}
    >
      {children}
    </AccountingStoreContext.Provider>
  );
};

export const useAccountingStore = () => {
  const context = useContext(AccountingStoreContext);
  if (!context) {
    throw new Error('useAccountingStore must be used within an AccountingStoreProvider');
  }
  return context;
};
