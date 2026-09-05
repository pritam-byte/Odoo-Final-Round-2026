// Accounting Enterprise In-Memory Reactive Store
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../lib/apiClient';

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
  orderNumber: string; // PO/2026/0001
  partnerId: string;
  partnerName: string;
  date: string;
  lines: OrderLine[];
  total: number;
  status: TransactionStatus;
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
    email: 'openwood21@example.com',
    phone: '+91 9090090909',
    imageUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=60',
    type: 'vendor',
    address: {
      street: '42 Timberland Ave',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
    },
  },
  {
    id: 'c2',
    name: 'Joey Wills & Co',
    email: 'joey.wills@example.com',
    phone: '+91 8080080808',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60',
    type: 'customer',
    address: {
      street: '15 Sunset Boulevard',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001',
    },
  },
  {
    id: 'c3',
    name: 'Apex Global Logistics',
    email: 'finance@apexlogistics.com',
    phone: '+91 9123456780',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=60',
    type: 'customer',
    address: {
      street: '88 Cyber Gateway',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      pincode: '500081',
    },
  },
];

const initialCategories: ProductCategory[] = [
  { id: 'cat1', name: 'Electronics & Appliances' },
  { id: 'cat2', name: 'Raw Materials & Hardware' },
  { id: 'cat3', name: 'Professional Services' },
];

const initialProducts: Product[] = [
  {
    id: 'p1',
    name: 'Air Conditioner Pro 2.5T',
    type: 'Goods',
    categoryId: 'cat1',
    categoryName: 'Electronics & Appliances',
    salesPrice: 45000,
    cost: 32000,
    imageUrl: 'https://images.unsplash.com/photo-1614633837774-c2c31e9c20a4?w=120&auto=format&fit=crop&q=60',
  },
  {
    id: 'p2',
    name: 'Inverter Refrigerator 450L',
    type: 'Goods',
    categoryId: 'cat1',
    categoryName: 'Electronics & Appliances',
    salesPrice: 38000,
    cost: 26000,
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=120&auto=format&fit=crop&q=60',
  },
  {
    id: 'p3',
    name: 'HVAC Maintenance & Audit',
    type: 'Service',
    categoryId: 'cat3',
    categoryName: 'Professional Services',
    salesPrice: 12500,
    cost: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120&auto=format&fit=crop&q=60',
  },
];

const initialAccounts: Account[] = [
  { id: 'acc1', code: '4000', name: 'Sales Account', type: 'Income', balance: 145000 },
  { id: 'acc2', code: '5000', name: 'Purchase Account', type: 'Expense', balance: 78000 },
  { id: 'acc3', code: '1010', name: 'Bank of India Current A/c', type: 'Bank', balance: 350000 },
  { id: 'acc4', code: '1020', name: 'Petty Cash A/c', type: 'Cash', balance: 25000 },
  { id: 'acc5', code: '3000', name: 'Capital Account', type: 'Capital', balance: 400000 },
  { id: 'acc6', code: '2010', name: 'Creditor Accounts (Payables)', type: 'Liability', balance: 48000 },
  { id: 'acc7', code: '1050', name: 'Debtor Accounts (Receivables)', type: 'Asset', balance: 96000 },
  { id: 'acc8', code: '5100', name: 'Office Operational Expenses', type: 'Expense', balance: 12000 },
];

const initialJournals: Journal[] = [
  { id: 'j1', code: 'INV', name: 'Customer Invoices Journal', type: 'Sales', defaultAccountId: 'acc1', defaultAccountName: 'Sales Account' },
  { id: 'j2', code: 'BILL', name: 'Vendor Bills Journal', type: 'Purchase', defaultAccountId: 'acc2', defaultAccountName: 'Purchase Account' },
  { id: 'j3', code: 'BNK1', name: 'Bank Account Journal', type: 'Bank', defaultAccountId: 'acc3', defaultAccountName: 'Bank of India Current A/c' },
  { id: 'j4', code: 'CSH1', name: 'Cash Register Journal', type: 'Cash', defaultAccountId: 'acc4', defaultAccountName: 'Petty Cash A/c' },
];

const initialAnalytics: AnalyticAccount[] = [
  { id: 'an1', code: 'AN-MKT', name: 'Marketing & Outreach', type: 'Expense' },
  { id: 'an2', code: 'AN-PROD', name: 'Product Manufacturing & Logistics', type: 'Expense' },
  { id: 'an3', code: 'AN-ENT', name: 'Enterprise Corporate Sales', type: 'Income' },
];

const initialBudgets: Budget[] = [
  {
    id: 'b1',
    name: 'Q3 Enterprise Sales Growth',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    responsible: 'Pritam Admin',
    analyticId: 'an3',
    analyticName: 'Enterprise Corporate Sales',
    type: 'Income',
    committedAmount: 200000,
    state: 'Confirmed',
  },
  {
    id: 'b2',
    name: 'Q3 Product Sourcing Budget',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    responsible: 'Farish Accountant',
    analyticId: 'an2',
    analyticName: 'Product Manufacturing & Logistics',
    type: 'Expense',
    committedAmount: 100000,
    state: 'Confirmed',
  },
];

const initialInvoices: CustomerInvoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV/2026/0001',
    reference: 'PO-CLIENT-882',
    partnerId: 'c2',
    partnerName: 'Joey Wills & Co',
    date: '2026-09-01',
    dueDate: '2026-09-15',
    lines: [
      {
        id: 'l1',
        productId: 'p1',
        productName: 'Air Conditioner Pro 2.5T',
        accountId: 'acc1',
        accountName: 'Sales Account',
        analyticId: 'an3',
        analyticName: 'Enterprise Corporate Sales',
        quantity: 2,
        unitPrice: 45000,
        total: 90000,
      },
    ],
    total: 90000,
    amountPaid: 45000,
    amountDue: 45000,
    status: 'Confirmed',
    journalEntryId: 'je1',
  },
];

const initialBills: VendorBill[] = [
  {
    id: 'bill1',
    billNumber: 'BILL/2026/0001',
    reference: 'SUPPLIER-INV-9901',
    partnerId: 'c1',
    partnerName: 'Open Wood Corp',
    date: '2026-09-02',
    dueDate: '2026-09-20',
    lines: [
      {
        id: 'bl1',
        productId: 'p1',
        productName: 'Air Conditioner Pro 2.5T',
        accountId: 'acc2',
        accountName: 'Purchase Account',
        analyticId: 'an2',
        analyticName: 'Product Manufacturing & Logistics',
        quantity: 1,
        unitPrice: 32000,
        total: 32000,
      },
    ],
    total: 32000,
    amountPaid: 0,
    amountDue: 32000,
    status: 'Confirmed',
    journalEntryId: 'je2',
  },
];

const initialJournalEntries: JournalEntry[] = [
  {
    id: 'je1',
    entryNumber: 'JE/2026/0001',
    date: '2026-09-01',
    journalId: 'j1',
    journalName: 'Customer Invoices Journal',
    status: 'Posted',
    reference: 'INV/2026/0001',
    totalDebit: 90000,
    totalCredit: 90000,
    lines: [
      { id: 'jel1', accountId: 'acc7', accountName: 'Debtor Accounts (Receivables)', partnerId: 'c2', partnerName: 'Joey Wills & Co', debit: 90000, credit: 0 },
      { id: 'jel2', accountId: 'acc1', accountName: 'Sales Account', partnerId: 'c2', partnerName: 'Joey Wills & Co', debit: 0, credit: 90000 },
    ],
  },
  {
    id: 'je2',
    entryNumber: 'JE/2026/0002',
    date: '2026-09-02',
    journalId: 'j2',
    journalName: 'Vendor Bills Journal',
    status: 'Posted',
    reference: 'BILL/2026/0001',
    totalDebit: 32000,
    totalCredit: 32000,
    lines: [
      { id: 'jel3', accountId: 'acc2', accountName: 'Purchase Account', partnerId: 'c1', partnerName: 'Open Wood Corp', debit: 32000, credit: 0 },
      { id: 'jel4', accountId: 'acc6', accountName: 'Creditor Accounts (Payables)', partnerId: 'c1', partnerName: 'Open Wood Corp', debit: 0, credit: 32000 },
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
    return s ? JSON.parse(s) : [];
  });

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
      debit: Number(it.debit) || 0,
      credit: Number(it.credit) || 0,
    })),
  });

  // Initial Backend Data Loader
  const loadBackendData = useCallback(async () => {
    try {
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
        entriesRes,
      ] = await Promise.all([
        apiRequest('/contacts'),
        apiRequest('/products'),
        apiRequest('/accounts'),
        apiRequest('/journals'),
        apiRequest('/analytics'),
        apiRequest('/budgets'),
        apiRequest('/purchase-orders'),
        apiRequest('/vendor-bills'),
        apiRequest('/sales-orders'),
        apiRequest('/customer-invoices'),
        apiRequest('/payments'),
        apiRequest('/journal-entries'),
      ]);

      if (contactsRes.success && Array.isArray(contactsRes.data) && contactsRes.data.length > 0) {
        setContacts(contactsRes.data.map(mapBackendContact));
      }
      if (productsRes.success && Array.isArray(productsRes.data) && productsRes.data.length > 0) {
        const mappedProducts = productsRes.data.map(mapBackendProduct);
        setProducts(mappedProducts);
        const uniqueCats = Array.from(new Set(mappedProducts.map((p) => p.categoryName))).map((name, idx) => ({
          id: `cat_${idx + 1}`,
          name,
        }));
        if (uniqueCats.length > 0) setCategories(uniqueCats);
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
      console.warn('Backend data sync encountered an issue, using local storage fallback:', e);
    }
  }, []);

  useEffect(() => {
    loadBackendData();
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
    });

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
    });

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

  // Analytics & Budgets
  const addAnalytic = (a: Omit<AnalyticAccount, 'id'>) => {
    const tempId = `an_${Date.now()}`;
    const newA: AnalyticAccount = { ...a, id: tempId };
    setAnalytics((prev) => [...prev, newA]);

    apiRequest('/analytics', {
      method: 'POST',
      body: JSON.stringify({
        name: a.name,
        type: (a.type?.toUpperCase() || 'EXPENSE'),
      }),
    }).then((res) => {
      if (res.success && res.data) {
        const serverA = mapBackendAnalytic(res.data);
        setAnalytics((prev) => prev.map((item) => (item.id === tempId ? serverA : item)));
      }
    });

    return newA;
  };

  const addBudget = (b: Omit<Budget, 'id'>) => {
    const tempId = `b_${Date.now()}`;
    const newB: Budget = { ...b, id: tempId };
    setBudgets((prev) => [newB, ...prev]);

    const analyticId = resolveUUID(b.analyticId, analytics);
    const responsibleId = resolveUUID(b.responsibleId || '', contacts);

    apiRequest('/budgets', {
      method: 'POST',
      body: JSON.stringify({
        name: b.name,
        startDate: b.startDate,
        endDate: b.endDate,
        analyticId,
        responsibleId,
        committedAmount: b.committedAmount,
      }),
    }).then((res) => {
      if (res.success && res.data) {
        const serverB = mapBackendBudget(res.data);
        setBudgets((prev) => prev.map((item) => (item.id === tempId ? serverB : item)));
      }
    });

    return newB;
  };

  const updateBudgetState = (id: string, state: BudgetState) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, state } : b)));
    if (state === 'Confirmed') {
      apiRequest(`/budgets/${id}/confirm`, { method: 'POST' });
    } else if (state === 'Cancelled') {
      apiRequest(`/budgets/${id}/cancel`, { method: 'POST' });
    }
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
            if (l.analyticId === budget.analyticId) {
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
            if (l.analyticId === budget.analyticId) {
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
          const matchedAmount = inv.lines.reduce((s, l) => (l.analyticId === budget.analyticId ? s + l.total : s), 0);
          if (matchedAmount > 0) {
            list.push({ id: inv.id, type: 'Invoice', number: inv.invoiceNumber, partner: inv.partnerName, date: inv.date, amount: matchedAmount });
          }
        }
      });
    } else {
      bills.forEach((bill) => {
        const billDate = new Date(bill.date).getTime();
        if (billDate >= start && billDate <= end && bill.status !== 'Cancelled') {
          const matchedAmount = bill.lines.reduce((s, l) => (l.analyticId === budget.analyticId ? s + l.total : s), 0);
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

          return {
            ...b,
            amountPaid: newPaid,
            amountDue: newDue,
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
