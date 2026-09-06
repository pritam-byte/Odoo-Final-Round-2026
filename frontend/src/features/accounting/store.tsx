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
  paymentVia: 'Bank' | 'Cash' | 'Razorpay';
  amount: number;
  sourceDocType: 'Invoice' | 'Bill';
  sourceDocId: string;
  reference: string;
}

const CACHE_VERSION = 'odoo_pg_v3';

// Helper to get cached data from localStorage while filtering out legacy mock IDs
const getCachedData = <T,>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  if (localStorage.getItem('odoo_cache_version') !== CACHE_VERSION) {
    return [];
  }
  try {
    const s = localStorage.getItem(key);
    if (!s) return [];
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) return [];
    // Ensure no legacy mock IDs ('c1', 'p1', 'acc1', etc.) exist
    const hasLegacyId = parsed.some((item: any) =>
      typeof item?.id === 'string' && /^(c\d+|p\d+|acc\d+|j\d+|an\d+|b\d+|inv\d+|bill\d+|pay\d+|je_)/.test(item.id)
    );
    if (hasLegacyId) return [];
    return parsed;
  } catch {
    return [];
  }
};

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
  payInvoice: (id: string, amount: number, paymentVia: 'Bank' | 'Cash' | 'Razorpay', date: string) => void;

  // Purchases & Bills
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'orderNumber'>) => PurchaseOrder;
  confirmPurchaseOrder: (id: string) => void;

  bills: VendorBill[];
  addBill: (b: Omit<VendorBill, 'id' | 'billNumber' | 'amountPaid' | 'amountDue'>) => VendorBill;
  confirmBill: (id: string) => void;
  payBill: (id: string, amount: number, paymentVia: 'Bank' | 'Cash' | 'Razorpay', date: string) => void;

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

const DEFAULT_PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'cat_living_room', name: 'Living Room Furniture' },
  { id: 'cat_bedroom', name: 'Bedroom Furniture' },
  { id: 'cat_office', name: 'Office & Workstation' },
  { id: 'cat_dining', name: 'Dining & Kitchen' },
  { id: 'cat_storage', name: 'Storage & Wardrobes' },
  { id: 'cat_lighting', name: 'Lighting & Fixtures' },
  { id: 'cat_decor', name: 'Decor & Accessories' },
  { id: 'cat_general', name: 'General Goods' },
];

export const AccountingStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge legacy mock storage on initialization
  useEffect(() => {
    if (localStorage.getItem('odoo_cache_version') !== CACHE_VERSION) {
      [
        'odoo_contacts',
        'odoo_categories',
        'odoo_products',
        'odoo_accounts',
        'odoo_journals',
        'odoo_journal_entries',
        'odoo_analytics',
        'odoo_budgets',
        'odoo_sales_orders',
        'odoo_invoices',
        'odoo_purchase_orders',
        'odoo_bills',
        'odoo_payments',
      ].forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('odoo_cache_version', CACHE_VERSION);
    }
  }, []);

  const [contacts, setContacts] = useState<Contact[]>(() => getCachedData<Contact>('odoo_contacts'));
  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const cached = getCachedData<ProductCategory>('odoo_categories');
    return cached && cached.length > 0 ? cached : DEFAULT_PRODUCT_CATEGORIES;
  });
  const [products, setProducts] = useState<Product[]>(() => getCachedData<Product>('odoo_products'));
  const [accounts, setAccounts] = useState<Account[]>(() => getCachedData<Account>('odoo_accounts'));
  const [journals, setJournals] = useState<Journal[]>(() => getCachedData<Journal>('odoo_journals'));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => getCachedData<JournalEntry>('odoo_journal_entries'));
  const [analytics, setAnalytics] = useState<AnalyticAccount[]>(() => getCachedData<AnalyticAccount>('odoo_analytics'));
  const [budgets, setBudgets] = useState<Budget[]>(() => getCachedData<Budget>('odoo_budgets'));
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => getCachedData<SalesOrder>('odoo_sales_orders'));
  const [invoices, setInvoices] = useState<CustomerInvoice[]>(() => getCachedData<CustomerInvoice>('odoo_invoices'));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => getCachedData<PurchaseOrder>('odoo_purchase_orders'));
  const [bills, setBills] = useState<VendorBill[]>(() => getCachedData<VendorBill>('odoo_bills'));
  const [payments, setPayments] = useState<PaymentRecord[]>(() => getCachedData<PaymentRecord>('odoo_payments'));

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
    type: c.type === 'CUSTOMER' ? 'customer' : c.type === 'VENDOR' ? 'vendor' : 'partner',
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

  const mapBackendAccount = (a: any): Account => {
    let cat: AccountCategory = 'Asset';
    const rawType = (a.type || '').toUpperCase();
    const nameLower = (a.name || '').toLowerCase();

    if (rawType === 'INCOME') cat = 'Income';
    else if (rawType === 'EXPENSE') cat = 'Expense';
    else if (rawType === 'LIABILITY') cat = 'Liability';
    else if (rawType === 'CAPITAL') cat = 'Capital';
    else if (nameLower.includes('bank')) cat = 'Bank';
    else if (nameLower.includes('cash')) cat = 'Cash';
    else cat = 'Asset';

    return {
      id: a.id,
      code: a.name.toLowerCase().replace(/\s+/g, '-'),
      name: a.name,
      type: cat,
      balance: 0,
    };
  };

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

      if (contactsRes.success && Array.isArray(contactsRes.data)) {
        setContacts(contactsRes.data.map(mapBackendContact));
      }
      if (productsRes.success && Array.isArray(productsRes.data)) {
        setProducts(productsRes.data.map(mapBackendProduct));
        const catMap = new Map<string, string>();
        productsRes.data.forEach((p: any) => {
          const cat = p.category || 'General';
          catMap.set(`cat_${cat.toLowerCase().replace(/\s+/g, '_')}`, cat);
        });
        if (catMap.size === 0) {
          catMap.set('cat_general', 'General');
        }
        setCategories(Array.from(catMap.entries()).map(([id, name]) => ({ id, name })));
      }
      let mappedEntries: JournalEntry[] = [];
      if (entriesRes.success && Array.isArray(entriesRes.data)) {
        mappedEntries = entriesRes.data.map(mapBackendJournalEntry);
        setJournalEntries(mappedEntries);
      }

      if (accountsRes.success && Array.isArray(accountsRes.data)) {
        const mappedAccounts = accountsRes.data.map(mapBackendAccount);
        const balanceMap = new Map<string, number>();
        mappedEntries
          .filter((je) => je.status === 'Posted')
          .forEach((je) => {
            je.lines.forEach((l) => {
              if (!l.accountId) return;
              const current = balanceMap.get(l.accountId) || 0;
              const acc = mappedAccounts.find((a) => a.id === l.accountId);
              const type = acc?.type;
              if (type === 'Liability' || type === 'Income' || type === 'Capital') {
                balanceMap.set(l.accountId, current + (l.credit - l.debit));
              } else {
                balanceMap.set(l.accountId, current + (l.debit - l.credit));
              }
            });
          });

        const accountsWithBalance = mappedAccounts.map((a) => ({
          ...a,
          balance: balanceMap.get(a.id) ?? 0,
        }));
        setAccounts(accountsWithBalance);
      }
      if (journalsRes.success && Array.isArray(journalsRes.data)) {
        setJournals(journalsRes.data.map(mapBackendJournal));
      }
      if (analyticsRes.success && Array.isArray(analyticsRes.data)) {
        setAnalytics(analyticsRes.data.map(mapBackendAnalytic));
      }
      if (budgetsRes.success && Array.isArray(budgetsRes.data)) {
        setBudgets(budgetsRes.data.map(mapBackendBudget));
      }
      if (posRes.success && Array.isArray(posRes.data)) {
        setPurchaseOrders(posRes.data.map(mapBackendPurchaseOrder));
      }
      if (billsRes.success && Array.isArray(billsRes.data)) {
        setBills(billsRes.data.map(mapBackendVendorBill));
      }
      if (sosRes.success && Array.isArray(sosRes.data)) {
        setSalesOrders(sosRes.data.map(mapBackendSalesOrder));
      }
      if (invoicesRes.success && Array.isArray(invoicesRes.data)) {
        setInvoices(invoicesRes.data.map(mapBackendCustomerInvoice));
      }
      if (paymentsRes.success && Array.isArray(paymentsRes.data)) {
        setPayments(paymentsRes.data.map(mapBackendPayment));
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
      responsibleId: b.responsibleId || contacts[0]?.id || '',
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

  const payInvoice = (id: string, amount: number, paymentVia: 'Bank' | 'Cash' | 'Razorpay', date: string) => {
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
              paymentVia: paymentVia === 'Cash' ? 'CASH' : 'BANK',
              customerInvoiceId: id,
              note: paymentVia === 'Razorpay' ? `Online Razorpay Payment for ${inv.invoiceNumber}` : `Payment for ${inv.invoiceNumber}`,
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

  const payBill = (id: string, amount: number, paymentVia: 'Bank' | 'Cash' | 'Razorpay', date: string) => {
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
              paymentVia: paymentVia === 'Cash' ? 'CASH' : 'BANK',
              vendorBillId: id,
              note: paymentVia === 'Razorpay' ? `Online Razorpay Payment for ${b.billNumber}` : `Payment for ${b.billNumber}`,
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
