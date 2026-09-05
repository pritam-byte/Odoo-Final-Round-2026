import {
  PortalDocument,
  DocumentLineItem,
  PortalPayment,
  DocumentType,
  UserDocumentStatus,
} from './schemas';
import { getScopedPartnerId, getStoredUser } from '../../lib/auth';
import { apiRequest } from '../../lib/apiClient';

export type { PortalDocument, DocumentLineItem, PortalPayment, DocumentType, UserDocumentStatus };

// Initial Fallback Seed Data (Urban Furniture Accounting Standards)
const defaultPortalInvoices: PortalDocument[] = [
  {
    id: 'inv_101',
    number: 'INV/2026/0001',
    type: 'invoice',
    partnerId: 'c2',
    partnerName: 'Joey Wills & Co (Customer)',
    date: '2026-09-01',
    dueDate: '2026-09-15',
    total: 90000.0,
    amountPaid: 45000.0,
    amountDue: 45000.0,
    status: 'Unpaid',
    lines: [
      { id: 'l1', product: 'Oak Wood Executive Desk', quantity: 2, unitPrice: 35000.0, total: 70000.0 },
      { id: 'l2', product: 'Ergonomic Mesh Chair Pro', quantity: 2, unitPrice: 10000.0, total: 20000.0 },
    ],
  },
  {
    id: 'inv_102',
    number: 'INV/2026/0002',
    type: 'invoice',
    partnerId: 'partner_john_doe',
    partnerName: 'John Doe (Customer)',
    date: '2026-08-10',
    dueDate: '2026-08-25',
    total: 45000.0,
    amountPaid: 45000.0,
    amountDue: 0.0,
    status: 'Paid',
    lines: [
      { id: 'l3', product: 'Solid Walnut Coffee Table', quantity: 1, unitPrice: 45000.0, total: 45000.0 },
    ],
  },
];

const defaultPortalBills: PortalDocument[] = [
  {
    id: 'bill_201',
    number: 'BILL/2026/0001',
    type: 'bill',
    partnerId: 'c1',
    partnerName: 'Open Wood Corp (Vendor)',
    date: '2026-09-02',
    dueDate: '2026-09-20',
    total: 32000.0,
    amountPaid: 0.0,
    amountDue: 32000.0,
    status: 'Unpaid',
    lines: [
      { id: 'l4', product: 'Raw Timber Plank Lot (Grade A Teak)', quantity: 10, unitPrice: 2800.0, total: 28000.0 },
      { id: 'l5', product: 'Metal Furniture Hardware Kit', quantity: 4, unitPrice: 1000.0, total: 4000.0 },
    ],
  },
  {
    id: 'bill_202',
    number: 'BILL/2026/0012',
    type: 'bill',
    partnerId: 'partner_john_doe',
    partnerName: 'Urban Timbers & Supplies Ltd (Vendor)',
    date: '2026-07-05',
    dueDate: '2026-08-05',
    total: 18500.0,
    amountPaid: 18500.0,
    amountDue: 0.0,
    status: 'Paid',
    lines: [
      { id: 'l6', product: 'Industrial Steel Desk Frame Assembly', quantity: 5, unitPrice: 3700.0, total: 18500.0 },
    ],
  },
];

const defaultPortalPayments: PortalPayment[] = [
  {
    id: 'pay_001',
    documentId: 'inv_101',
    documentNumber: 'INV/2026/0001',
    documentType: 'invoice',
    amount: 45000.0,
    date: '2026-09-02',
    paymentMethod: 'Bank',
    reference: 'PAY/2026/3439',
    partnerName: 'Joey Wills & Co (Customer)',
    note: 'Customer advance for Executive Desk & Mesh Chairs',
    status: 'Confirm',
  },
  {
    id: 'pay_002',
    documentId: 'bill_202',
    documentNumber: 'BILL/2026/0012',
    documentType: 'bill',
    amount: 18500.0,
    date: '2026-08-05',
    paymentMethod: 'Bank',
    reference: 'PAY/2026/7437',
    partnerName: 'Urban Timbers & Supplies Ltd',
    note: 'Supplier disbursement voucher for Steel Frames',
    status: 'Confirm',
  },
  {
    id: 'pay_003',
    documentId: 'inv_102',
    documentNumber: 'INV/2026/0002',
    documentType: 'invoice',
    amount: 45000.0,
    date: '2026-08-20',
    paymentMethod: 'Bank',
    reference: 'PAY/2026/0088',
    partnerName: 'John Doe (Customer)',
    note: 'Full settlement for Walnut Coffee Table',
    status: 'Confirm',
  },
];

// Local Storage Helper Functions
function getInvoicesFromStorage(): any[] {
  try {
    const s = localStorage.getItem('odoo_invoices');
    if (s) {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse odoo_invoices from localStorage', e);
  }
  return [];
}

function getBillsFromStorage(): any[] {
  try {
    const s = localStorage.getItem('odoo_bills');
    if (s) {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse odoo_bills from localStorage', e);
  }
  return [];
}

function getPaymentsFromStorage(): any[] {
  try {
    const s = localStorage.getItem('odoo_payments');
    if (s) {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse odoo_payments from localStorage', e);
  }
  return [];
}

function getPortalPaymentsFromStorage(): PortalPayment[] {
  try {
    const s = localStorage.getItem('odoo_portal_payments');
    if (s) {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse odoo_portal_payments from localStorage', e);
  }
  return [];
}

// Convert accounting store invoices into portal document schema
function invoiceToPortalDoc(inv: any): PortalDocument {
  const amountPaid = Number(inv.amountPaid) || 0;
  const total = Number(inv.total) || 0;
  const amountDue = inv.amountDue !== undefined ? Number(inv.amountDue) : Math.max(0, total - amountPaid);
  const status: UserDocumentStatus = (inv.status === 'Paid' || amountDue <= 0.01) ? 'Paid' : 'Unpaid';

  const lines: DocumentLineItem[] = Array.isArray(inv.lines) && inv.lines.length > 0
    ? inv.lines.map((l: any, idx: number) => ({
        id: l.id || `inv_line_${idx}`,
        product: l.productName || l.product || 'Solid Wood Furniture Item',
        quantity: Number(l.quantity || l.qty) || 1,
        unitPrice: Number(l.unitPrice || l.price) || (total / (Number(l.quantity || l.qty) || 1)),
        total: Number(l.total) || ((Number(l.quantity || l.qty) || 1) * (Number(l.unitPrice || l.price) || 0)),
      }))
    : [
        {
          id: `line_${inv.id}`,
          product: inv.reference ? `Furniture Order (${inv.reference})` : 'Executive Urban Furniture Set',
          quantity: 1,
          unitPrice: total,
          total: total,
        },
      ];

  return {
    id: inv.id,
    type: 'invoice',
    number: inv.invoiceNumber || inv.number || `INV/${inv.id}`,
    partnerId: inv.partnerId || 'c2',
    partnerName: inv.partnerName || 'Customer',
    date: typeof inv.date === 'string' ? inv.date.split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: typeof inv.dueDate === 'string' ? inv.dueDate.split('T')[0] : (typeof inv.date === 'string' ? inv.date.split('T')[0] : new Date().toISOString().split('T')[0]),
    total,
    amountPaid,
    amountDue,
    status,
    lines,
  };
}

// Convert accounting store bills into portal document schema
function billToPortalDoc(bill: any): PortalDocument {
  const amountPaid = Number(bill.amountPaid) || 0;
  const total = Number(bill.total) || 0;
  const amountDue = bill.amountDue !== undefined ? Number(bill.amountDue) : Math.max(0, total - amountPaid);
  const status: UserDocumentStatus = (bill.status === 'Paid' || amountDue <= 0.01) ? 'Paid' : 'Unpaid';

  const lines: DocumentLineItem[] = Array.isArray(bill.lines) && bill.lines.length > 0
    ? bill.lines.map((l: any, idx: number) => ({
        id: l.id || `bill_line_${idx}`,
        product: l.productName || l.product || 'Raw Timber & Hardware Supplies',
        quantity: Number(l.quantity || l.qty) || 1,
        unitPrice: Number(l.unitPrice || l.price) || (total / (Number(l.quantity || l.qty) || 1)),
        total: Number(l.total) || ((Number(l.quantity || l.qty) || 1) * (Number(l.unitPrice || l.price) || 0)),
      }))
    : [
        {
          id: `line_${bill.id}`,
          product: bill.reference ? `Vendor Supply (${bill.reference})` : 'Raw Timber Plank Lot & Materials',
          quantity: 1,
          unitPrice: total,
          total: total,
        },
      ];

  return {
    id: bill.id,
    type: 'bill',
    number: bill.billNumber || bill.number || `BILL/${bill.id}`,
    partnerId: bill.partnerId || 'c1',
    partnerName: bill.partnerName || 'Vendor',
    date: typeof bill.date === 'string' ? bill.date.split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: typeof bill.dueDate === 'string' ? bill.dueDate.split('T')[0] : (typeof bill.date === 'string' ? bill.date.split('T')[0] : new Date().toISOString().split('T')[0]),
    total,
    amountPaid,
    amountDue,
    status,
    lines,
  };
}

// Get all documents aggregated from Store & Seeds
export const getAllDocuments = (): PortalDocument[] => {
  const storedInvoices = getInvoicesFromStorage();
  const storedBills = getBillsFromStorage();

  const invoiceDocs: PortalDocument[] = storedInvoices.length > 0
    ? storedInvoices.map(invoiceToPortalDoc)
    : defaultPortalInvoices;

  const billDocs: PortalDocument[] = storedBills.length > 0
    ? storedBills.map(billToPortalDoc)
    : defaultPortalBills;

  return [...invoiceDocs, ...billDocs];
};

// Retrieve scoped documents according to current user persona
export const getMyScopedDocuments = (documentType?: DocumentType): PortalDocument[] => {
  const current = getStoredUser();
  const partnerType = current?.partnerType || 'Both';
  const role = current?.role;
  const currentPartnerId = getScopedPartnerId();
  const currentUserName = (current?.name || '').toLowerCase().trim();

  const allDocs = getAllDocuments();
  let docs = allDocs;

  // If user role is Client/User (Persona filtering)
  if (role === 'User') {
    const hasSpecificMatch = allDocs.some(
      (d) =>
        d.partnerId === currentPartnerId ||
        (currentUserName && d.partnerName.toLowerCase().includes(currentUserName))
    );

    if (hasSpecificMatch) {
      docs = allDocs.filter(
        (doc) =>
          doc.partnerId === currentPartnerId ||
          (currentUserName && doc.partnerName.toLowerCase().includes(currentUserName)) ||
          doc.partnerId === 'partner_john_doe'
      );
    }
  }

  // Strict persona isolation
  if (partnerType === 'Customer') {
    docs = docs.filter((d) => d.type === 'invoice');
  } else if (partnerType === 'Vendor') {
    docs = docs.filter((d) => d.type === 'bill');
  }

  // Filter by documentType parameter if requested
  if (documentType) {
    docs = docs.filter((d) => d.type === documentType);
  }

  return docs;
};

export const getMyScopedDocumentById = (id: string): PortalDocument | null => {
  const allDocs = getAllDocuments();
  return allDocs.find((d) => d.id === id || d.number === id) || null;
};

// Retrieve payments aggregated from Accounting store & Portal payments
export const getAllPayments = (): PortalPayment[] => {
  const storedPayments = getPaymentsFromStorage();
  const portalPayments = getPortalPaymentsFromStorage();
  const allDocs = getAllDocuments();

  const mappedStorePayments: PortalPayment[] = storedPayments.map((p) => {
    const matchedDoc = allDocs.find((d) => d.id === p.sourceDocId || d.number === p.sourceDocId);
    const docType: DocumentType = (
      p.sourceDocType ? p.sourceDocType.toLowerCase() : (p.type === 'Receive' ? 'invoice' : 'bill')
    ) as DocumentType;

    return {
      id: p.id,
      documentId: p.sourceDocId || '',
      documentNumber: matchedDoc?.number || p.reference?.replace(/^Payment for /i, '') || p.sourceDocId || 'DOC/2026/001',
      documentType: docType,
      amount: Number(p.amount) || 0,
      date: typeof p.date === 'string' ? p.date.split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMethod: p.paymentVia || 'Bank',
      reference: p.reference || `PAY/${p.id.slice(-4)}`,
      partnerName: p.partnerName || (docType === 'invoice' ? 'Customer' : 'Vendor'),
      note: p.reference || `Settlement for ${matchedDoc?.number || 'document'}`,
      status: 'Confirm',
    };
  });

  const combinedMap = new Map<string, PortalPayment>();

  // Add default seeds first
  defaultPortalPayments.forEach((p) => combinedMap.set(p.id, p));

  // Add store payments
  mappedStorePayments.forEach((p) => combinedMap.set(p.id, p));

  // Add portal payments
  portalPayments.forEach((p) => combinedMap.set(p.id, p));

  return Array.from(combinedMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getMyPayments = (): PortalPayment[] => {
  const current = getStoredUser();
  const partnerType = current?.partnerType || 'Both';
  const currentUserName = (current?.name || '').toLowerCase().trim();

  const allPayments = getAllPayments();
  let payments = allPayments;

  if (current?.role === 'User') {
    const hasSpecificMatch = allPayments.some(
      (p) =>
        (currentUserName && p.partnerName?.toLowerCase().includes(currentUserName)) ||
        p.partnerName?.includes('John Doe')
    );

    if (hasSpecificMatch) {
      payments = allPayments.filter(
        (p) =>
          (currentUserName && p.partnerName?.toLowerCase().includes(currentUserName)) ||
          p.partnerName?.includes('John Doe') ||
          p.partnerName?.includes('Joey Wills') ||
          p.partnerName?.includes('Open Wood') ||
          p.partnerName?.includes('Urban Timbers')
      );
    }
  }

  // Strict persona isolation
  if (partnerType === 'Customer') {
    payments = payments.filter((p) => p.documentType === 'invoice');
  } else if (partnerType === 'Vendor') {
    payments = payments.filter((p) => p.documentType === 'bill');
  }

  return payments;
};

export const processPortalPayment = (params: {
  documentId: string;
  amount: number;
  date: string;
  paymentMethod: 'Bank' | 'Cash';
  reference?: string;
}): { success: boolean; message: string; document?: PortalDocument; updatedDocument?: PortalDocument } => {
  const allDocs = getAllDocuments();
  const targetDoc = allDocs.find((d) => d.id === params.documentId || d.number === params.documentId);

  if (!targetDoc) {
    return { success: false, message: 'Document not found for payment.' };
  }

  if (params.amount <= 0) {
    return { success: false, message: 'Payment amount must be greater than zero.' };
  }

  if (params.amount > targetDoc.amountDue + 0.01) {
    return { success: false, message: `Amount exceeds current dues of ₹${targetDoc.amountDue.toFixed(2)}.` };
  }

  const newAmountPaid = targetDoc.amountPaid + params.amount;
  const newAmountDue = Math.max(0, targetDoc.total - newAmountPaid);
  const newStatus: UserDocumentStatus = newAmountDue <= 0.01 ? 'Paid' : 'Unpaid';

  // 1. Update Invoices or Bills in Local Storage
  if (targetDoc.type === 'invoice') {
    const storedInvoices = getInvoicesFromStorage();
    const listToUpdate = storedInvoices.length > 0 ? storedInvoices : defaultPortalInvoices;
    const updatedInvoices = listToUpdate.map((inv) => {
      if (inv.id === targetDoc.id || inv.invoiceNumber === targetDoc.number || inv.number === targetDoc.number) {
        return {
          ...inv,
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          status: newStatus === 'Paid' ? 'Paid' : 'Confirmed',
        };
      }
      return inv;
    });
    localStorage.setItem('odoo_invoices', JSON.stringify(updatedInvoices));
  } else {
    const storedBills = getBillsFromStorage();
    const listToUpdate = storedBills.length > 0 ? storedBills : defaultPortalBills;
    const updatedBills = listToUpdate.map((bill) => {
      if (bill.id === targetDoc.id || bill.billNumber === targetDoc.number || bill.number === targetDoc.number) {
        return {
          ...bill,
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          status: newStatus === 'Paid' ? 'Paid' : 'Confirmed',
        };
      }
      return bill;
    });
    localStorage.setItem('odoo_bills', JSON.stringify(updatedBills));
  }

  // 2. Create Payment Record and add to odoo_payments and odoo_portal_payments
  const currentUser = getStoredUser();
  const effectivePartner = targetDoc.type === 'invoice'
    ? (currentUser?.name ? `${currentUser.name} (Customer)` : targetDoc.partnerName || 'Customer')
    : (targetDoc.partnerName || 'Vendor');

  const refNumber = params.reference || `PAY/2026/${Math.floor(1000 + Math.random() * 9000)}`;

  const paymentRec = {
    id: `pay_${Date.now()}`,
    type: targetDoc.type === 'invoice' ? 'Receive' : 'Send',
    date: params.date,
    partnerId: targetDoc.partnerId,
    partnerName: effectivePartner,
    paymentVia: params.paymentMethod,
    amount: params.amount,
    sourceDocType: targetDoc.type === 'invoice' ? 'Invoice' : 'Bill',
    sourceDocId: targetDoc.id,
    reference: refNumber,
  };

  const currentPayments = getPaymentsFromStorage();
  localStorage.setItem('odoo_payments', JSON.stringify([paymentRec, ...currentPayments]));

  const portalPay: PortalPayment = {
    id: paymentRec.id,
    documentId: targetDoc.id,
    documentNumber: targetDoc.number,
    documentType: targetDoc.type,
    amount: params.amount,
    date: params.date,
    paymentMethod: params.paymentMethod,
    reference: refNumber,
    partnerName: effectivePartner,
    note: `Self-Service Portal settlement for ${targetDoc.number}`,
    status: 'Confirm',
  };

  const portalPayments = getPortalPaymentsFromStorage();
  localStorage.setItem('odoo_portal_payments', JSON.stringify([portalPay, ...portalPayments]));

  // 3. Dispatch global sync event so accounting store and UI immediately refresh
  window.dispatchEvent(new CustomEvent('odoo:accounting_updated', { detail: { type: 'payment', payment: portalPay } }));
  window.dispatchEvent(new CustomEvent('storage'));

  // 4. Background backend live sync
  apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify({
      paymentType: targetDoc.type === 'invoice' ? 'RECEIVE' : 'SEND',
      partnerId: targetDoc.partnerId,
      amount: params.amount,
      paymentVia: params.paymentMethod.toUpperCase(),
      note: refNumber,
      customerInvoiceId: targetDoc.type === 'invoice' ? targetDoc.id : undefined,
      vendorBillId: targetDoc.type === 'bill' ? targetDoc.id : undefined,
    }),
  }).catch((e) => console.warn('Backend payment background sync skipped', e));

  const updatedDoc: PortalDocument = {
    ...targetDoc,
    amountPaid: newAmountPaid,
    amountDue: newAmountDue,
    status: newStatus,
  };

  return {
    success: true,
    message: `Payment of ₹${params.amount.toFixed(2)} processed successfully via ${params.paymentMethod}.`,
    document: updatedDoc,
    updatedDocument: updatedDoc,
  };
};

export const updatePortalPaymentStatus = (paymentId: string, status: 'Draft' | 'Confirm' | 'Cancelled'): boolean => {
  const portalPayments = getPortalPaymentsFromStorage();
  const target = portalPayments.find((p) => p.id === paymentId);
  if (target) {
    target.status = status;
    localStorage.setItem('odoo_portal_payments', JSON.stringify(portalPayments));
    window.dispatchEvent(new CustomEvent('odoo:accounting_updated'));
    return true;
  }
  return false;
};
