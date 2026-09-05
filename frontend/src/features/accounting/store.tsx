// Accounting Enterprise In-Memory Reactive Store
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  code: string;
  name: string;
  type: 'Income' | 'Expense';
}

export interface Budget {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  responsible: string;
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

  // Contact operations
  const addContact = (c: Omit<Contact, 'id'>) => {
    const newC: Contact = { ...c, id: `c_${Date.now()}` };
    setContacts((prev) => [newC, ...prev]);
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
    const newP: Product = { ...p, id: `p_${Date.now()}` };
    setProducts((prev) => [newP, ...prev]);
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
        message: `Debit and Credit totals must balance! (Debit: $${totalDr.toFixed(2)}, Credit: $${totalCr.toFixed(2)})`,
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
    const newA: AnalyticAccount = { ...a, id: `an_${Date.now()}` };
    setAnalytics((prev) => [...prev, newA]);
    return newA;
  };

  const addBudget = (b: Omit<Budget, 'id'>) => {
    const newB: Budget = { ...b, id: `b_${Date.now()}` };
    setBudgets((prev) => [newB, ...prev]);
    return newB;
  };

  const updateBudgetState = (id: string, state: BudgetState) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, state } : b)));
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
    const newSO: SalesOrder = { ...so, id: `so_${Date.now()}`, orderNumber: nextSeq('SO') };
    setSalesOrders((prev) => [newSO, ...prev]);
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
    const newInv: CustomerInvoice = {
      ...inv,
      id: `inv_${Date.now()}`,
      invoiceNumber: nextSeq('INV'),
      amountPaid: 0,
      amountDue: inv.total,
    };
    setInvoices((prev) => [newInv, ...prev]);
    return newInv;
  };

  // On Confirm Customer Invoice -> Auto-create Journal Entry (Sales A/c Cr, Debtor A/c Dr)
  const confirmInvoice = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id && inv.status === 'Draft') {
          const salesAcc = accounts.find((a) => a.code === '4000') || accounts.find((a) => a.type === 'Income') || accounts[0];
          const debtorAcc = accounts.find((a) => a.code === '1050') || accounts.find((a) => a.type === 'Asset') || accounts[0];

          const autoEntryResult = addJournalEntry({
            date: inv.date,
            journalId: journals.find((j) => j.type === 'Sales')?.id || 'j1',
            journalName: 'Customer Invoices Journal',
            status: 'Posted',
            reference: inv.invoiceNumber,
            lines: [
              {
                id: `jel_${Date.now()}_1`,
                accountId: debtorAcc.id,
                accountName: debtorAcc.name,
                partnerId: inv.partnerId,
                partnerName: inv.partnerName,
                debit: inv.total,
                credit: 0,
              },
              {
                id: `jel_${Date.now()}_2`,
                accountId: salesAcc.id,
                accountName: salesAcc.name,
                partnerId: inv.partnerId,
                partnerName: inv.partnerName,
                debit: 0,
                credit: inv.total,
              },
            ],
          });

          return { ...inv, status: 'Confirmed', journalEntryId: autoEntryResult.entry?.id };
        }
        return inv;
      })
    );
  };

  const payInvoice = (id: string, amount: number, paymentVia: 'Bank' | 'Cash', date: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const newPaid = inv.amountPaid + amount;
          const newDue = Math.max(0, inv.total - newPaid);
          const newStatus = newDue <= 0.01 ? 'Paid' : 'Confirmed';

          // Record payment transaction
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

          // Auto-record Bank/Cash Journal Entry
          const bankCashAcc = accounts.find((a) => a.type === paymentVia) || accounts.find((a) => a.type === 'Bank') || accounts[0];
          const debtorAcc = accounts.find((a) => a.code === '1050') || accounts.find((a) => a.type === 'Asset') || accounts[0];

          addJournalEntry({
            date,
            journalId: journals.find((j) => j.type === paymentVia)?.id || 'j3',
            journalName: `${paymentVia} Register Journal`,
            status: 'Posted',
            reference: `Payment for ${inv.invoiceNumber}`,
            lines: [
              { id: `jel_p1_${Date.now()}`, accountId: bankCashAcc.id, accountName: bankCashAcc.name, partnerId: inv.partnerId, partnerName: inv.partnerName, debit: amount, credit: 0 },
              { id: `jel_p2_${Date.now()}`, accountId: debtorAcc.id, accountName: debtorAcc.name, partnerId: inv.partnerId, partnerName: inv.partnerName, debit: 0, credit: amount },
            ],
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
    const newPO: PurchaseOrder = { ...po, id: `po_${Date.now()}`, orderNumber: nextSeq('PO') };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    return newPO;
  };

  const confirmPurchaseOrder = (id: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === id && po.status === 'Draft') {
          return { ...po, status: 'Confirmed' };
        }
        return po;
      })
    );
  };

  const addBill = (b: Omit<VendorBill, 'id' | 'billNumber' | 'amountPaid' | 'amountDue'>) => {
    const newBill: VendorBill = {
      ...b,
      id: `bill_${Date.now()}`,
      billNumber: nextSeq('BILL'),
      amountPaid: 0,
      amountDue: b.total,
    };
    setBills((prev) => [newBill, ...prev]);
    return newBill;
  };

  // On Confirm Vendor Bill -> Auto-create Journal Entry (Purchase A/c Dr, Creditor A/c Cr)
  const confirmBill = (id: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === id && b.status === 'Draft') {
          const purchaseAcc = accounts.find((a) => a.code === '5000') || accounts.find((a) => a.type === 'Expense') || accounts[0];
          const creditorAcc = accounts.find((a) => a.code === '2010') || accounts.find((a) => a.type === 'Liability') || accounts[0];

          const autoEntryResult = addJournalEntry({
            date: b.date,
            journalId: journals.find((j) => j.type === 'Purchase')?.id || 'j2',
            journalName: 'Vendor Bills Journal',
            status: 'Posted',
            reference: b.billNumber,
            lines: [
              {
                id: `jel_${Date.now()}_b1`,
                accountId: purchaseAcc.id,
                accountName: purchaseAcc.name,
                partnerId: b.partnerId,
                partnerName: b.partnerName,
                debit: b.total,
                credit: 0,
              },
              {
                id: `jel_${Date.now()}_b2`,
                accountId: creditorAcc.id,
                accountName: creditorAcc.name,
                partnerId: b.partnerId,
                partnerName: b.partnerName,
                debit: 0,
                credit: b.total,
              },
            ],
          });

          return { ...b, status: 'Confirmed', journalEntryId: autoEntryResult.entry?.id };
        }
        return b;
      })
    );
  };

  const payBill = (id: string, amount: number, paymentVia: 'Bank' | 'Cash', date: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newPaid = b.amountPaid + amount;
          const newDue = Math.max(0, b.total - newPaid);
          const newStatus = newDue <= 0.01 ? 'Paid' : 'Confirmed';

          // Record payment transaction
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

          // Auto-record Bank/Cash Journal Entry (Creditor Dr, Bank/Cash Cr)
          const bankCashAcc = accounts.find((a) => a.type === paymentVia) || accounts.find((a) => a.type === 'Bank') || accounts[0];
          const creditorAcc = accounts.find((a) => a.code === '2010') || accounts.find((a) => a.type === 'Liability') || accounts[0];

          addJournalEntry({
            date,
            journalId: journals.find((j) => j.type === paymentVia)?.id || 'j3',
            journalName: `${paymentVia} Register Journal`,
            status: 'Posted',
            reference: `Payment for ${b.billNumber}`,
            lines: [
              { id: `jel_pb1_${Date.now()}`, accountId: creditorAcc.id, accountName: creditorAcc.name, partnerId: b.partnerId, partnerName: b.partnerName, debit: amount, credit: 0 },
              { id: `jel_pb2_${Date.now()}`, accountId: bankCashAcc.id, accountName: bankCashAcc.name, partnerId: b.partnerId, partnerName: b.partnerName, debit: 0, credit: amount },
            ],
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
