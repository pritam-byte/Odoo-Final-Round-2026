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

// Helper to get active contacts from store/localStorage
function getStoredContacts(): any[] {
  try {
    const s = localStorage.getItem('odoo_contacts');
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

// Helper to get active invoices from store/localStorage
function getStoredInvoices(): any[] {
  try {
    const s = localStorage.getItem('odoo_invoices');
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

// Helper to get active bills from store/localStorage
function getStoredBills(): any[] {
  try {
    const s = localStorage.getItem('odoo_bills');
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

// Helper to get active payments from store/localStorage
function getStoredPayments(): any[] {
  try {
    const s = localStorage.getItem('odoo_payments');
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export const getMyScopedDocuments = (documentType?: DocumentType): PortalDocument[] => {
  const current = getStoredUser();
  const partnerType = current?.partnerType || 'Customer';
  const currentPartnerId = getScopedPartnerId();
  const contacts = getStoredContacts();
  const invoices = getStoredInvoices();
  const bills = getStoredBills();

  // Find linked contact for current user
  const matchedContact = contacts.find(
    (c) =>
      c.id === currentPartnerId ||
      (current?.email && c.email?.toLowerCase() === current.email.toLowerCase()) ||
      (current?.name && c.name?.toLowerCase().includes(current.name.toLowerCase()))
  );

  const effectivePartnerId = matchedContact?.id || currentPartnerId || 'c3';
  const effectivePartnerName = matchedContact?.name || current?.name || 'Valued Partner';

  const docs: PortalDocument[] = [];

  // Map Customer Invoices
  invoices.forEach((inv) => {
    const isOwner =
      inv.partnerId === effectivePartnerId ||
      inv.partnerName?.toLowerCase() === effectivePartnerName.toLowerCase() ||
      current?.role === 'Admin' ||
      current?.role === 'Accountant';

    if (isOwner) {
      docs.push({
        id: inv.id,
        number: inv.invoiceNumber,
        type: 'invoice',
        partnerId: inv.partnerId,
        partnerName: inv.partnerName || effectivePartnerName,
        date: inv.date,
        dueDate: inv.dueDate,
        total: inv.total,
        amountPaid: inv.amountPaid,
        amountDue: inv.amountDue,
        status: inv.amountDue <= 0.01 ? 'Paid' : 'Unpaid',
        lines: (inv.lines || []).map((l: any, idx: number) => ({
          id: l.id || `l_${idx}`,
          product: l.productName || 'Furniture Item',
          quantity: l.quantity || 1,
          unitPrice: l.unitPrice || 0,
          total: l.total || (l.quantity || 1) * (l.unitPrice || 0),
        })),
      });
    }
  });

  // Map Vendor Bills
  bills.forEach((bill) => {
    const isOwner =
      bill.partnerId === effectivePartnerId ||
      bill.partnerName?.toLowerCase() === effectivePartnerName.toLowerCase() ||
      current?.role === 'Admin' ||
      current?.role === 'Accountant';

    if (isOwner) {
      docs.push({
        id: bill.id,
        number: bill.billNumber,
        type: 'bill',
        partnerId: bill.partnerId,
        partnerName: bill.partnerName || effectivePartnerName,
        date: bill.date,
        dueDate: bill.dueDate,
        total: bill.total,
        amountPaid: bill.amountPaid,
        amountDue: bill.amountDue,
        status: bill.amountDue <= 0.01 ? 'Paid' : 'Unpaid',
        lines: (bill.lines || []).map((l: any, idx: number) => ({
          id: l.id || `l_${idx}`,
          product: l.productName || 'Supply / Hardware Item',
          quantity: l.quantity || 1,
          unitPrice: l.unitPrice || 0,
          total: l.total || (l.quantity || 1) * (l.unitPrice || 0),
        })),
      });
    }
  });

  let filtered = docs;

  // Strict persona isolation
  if (partnerType === 'Customer') {
    filtered = filtered.filter((d) => d.type === 'invoice');
  } else if (partnerType === 'Vendor') {
    filtered = filtered.filter((d) => d.type === 'bill');
  }

  // Filter by documentType parameter if requested
  if (documentType) {
    filtered = filtered.filter((d) => d.type === documentType);
  }

  return filtered;
};

export const getMyScopedDocumentById = (id: string): PortalDocument | null => {
  const docs = getMyScopedDocuments();
  return docs.find((d) => d.id === id) || null;
};

export const getMyPayments = (): PortalPayment[] => {
  const current = getStoredUser();
  const partnerType = current?.partnerType || 'Customer';
  const currentPartnerId = getScopedPartnerId();
  const contacts = getStoredContacts();
  const payments = getStoredPayments();

  const matchedContact = contacts.find(
    (c) =>
      c.id === currentPartnerId ||
      (current?.email && c.email?.toLowerCase() === current.email.toLowerCase()) ||
      (current?.name && c.name?.toLowerCase().includes(current.name.toLowerCase()))
  );

  const effectivePartnerId = matchedContact?.id || currentPartnerId;
  const effectivePartnerName = matchedContact?.name || current?.name;

  const mapped: PortalPayment[] = payments
    .filter((p) => {
      if (current?.role === 'Admin' || current?.role === 'Accountant') return true;
      return (
        p.partnerId === effectivePartnerId ||
        (effectivePartnerName && p.partnerName?.toLowerCase().includes(effectivePartnerName.toLowerCase()))
      );
    })
    .map((p) => ({
      id: p.id,
      documentId: p.sourceDocId || '',
      documentNumber: p.reference || 'PAYMENT',
      documentType: p.sourceDocType === 'Bill' ? 'bill' : 'invoice',
      amount: p.amount,
      date: p.date,
      paymentMethod: p.paymentVia || 'Bank',
      reference: p.reference || `PAY/${p.id.substring(0, 8)}`,
      partnerName: p.partnerName || effectivePartnerName || 'Partner',
      note: p.reference || 'Settlement Transaction Voucher',
      status: 'Confirm',
    }));

  let result = mapped;
  if (partnerType === 'Customer') {
    result = result.filter((p) => p.documentType === 'invoice');
  } else if (partnerType === 'Vendor') {
    result = result.filter((p) => p.documentType === 'bill');
  }

  return result;
};

export const processPortalPayment = (params: {
  documentId: string;
  amount: number;
  date: string;
  paymentMethod: 'Bank' | 'Cash';
  reference?: string;
}): { success: boolean; message: string; document?: PortalDocument; updatedDocument?: PortalDocument } => {
  const docs = getMyScopedDocuments();
  const doc = docs.find((d) => d.id === params.documentId);
  if (!doc) {
    return { success: false, message: 'Document not found for payment.' };
  }

  if (params.amount <= 0) {
    return { success: false, message: 'Payment amount must be greater than zero.' };
  }

  if (params.amount > doc.amountDue) {
    return { success: false, message: `Amount exceeds current dues of ₹${doc.amountDue.toFixed(2)}.` };
  }

  // Live backend payment submission
  apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify({
      paymentType: doc.type === 'invoice' ? 'RECEIVE' : 'SEND',
      partnerId: doc.partnerId,
      amount: params.amount,
      paymentVia: params.paymentMethod.toUpperCase(),
      note: params.reference || `Self-Service Portal settlement for ${doc.number}`,
      customerInvoiceId: doc.type === 'invoice' ? doc.id : undefined,
      vendorBillId: doc.type === 'bill' ? doc.id : undefined,
    }),
  }).catch((e) => console.warn('Backend payment sync error:', e));

  // Update local invoices or bills
  if (doc.type === 'invoice') {
    const invoices = getStoredInvoices();
    const updatedInvoices = invoices.map((inv) => {
      if (inv.id === doc.id) {
        const newPaid = (inv.amountPaid || 0) + params.amount;
        const newDue = Math.max(0, inv.total - newPaid);
        return {
          ...inv,
          amountPaid: newPaid,
          amountDue: newDue,
          status: newDue <= 0.01 ? 'Paid' : 'Confirmed',
        };
      }
      return inv;
    });
    localStorage.setItem('odoo_invoices', JSON.stringify(updatedInvoices));
  } else {
    const bills = getStoredBills();
    const updatedBills = bills.map((b) => {
      if (b.id === doc.id) {
        const newPaid = (b.amountPaid || 0) + params.amount;
        const newDue = Math.max(0, b.total - newPaid);
        return {
          ...b,
          amountPaid: newPaid,
          amountDue: newDue,
          status: newDue <= 0.01 ? 'Paid' : 'Confirmed',
        };
      }
      return b;
    });
    localStorage.setItem('odoo_bills', JSON.stringify(updatedBills));
  }

  // Create payment record in stored payments
  const payments = getStoredPayments();
  const newPayment = {
    id: `pay_${Date.now()}`,
    type: doc.type === 'invoice' ? 'Receive' : 'Send',
    date: params.date,
    partnerId: doc.partnerId,
    partnerName: doc.partnerName,
    paymentVia: params.paymentMethod,
    amount: params.amount,
    sourceDocType: doc.type === 'invoice' ? 'Invoice' : 'Bill',
    sourceDocId: doc.id,
    reference: params.reference || `PAY/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
  };
  payments.unshift(newPayment);
  localStorage.setItem('odoo_payments', JSON.stringify(payments));

  // Trigger custom events so reactive components re-render immediately
  window.dispatchEvent(new Event('portal:payment'));
  window.dispatchEvent(new Event('odoo:accounting_updated'));

  doc.amountPaid += params.amount;
  doc.amountDue = Math.max(0, doc.total - doc.amountPaid);
  if (doc.amountDue <= 0.01) {
    doc.status = 'Paid';
  }

  return {
    success: true,
    message: `Payment of ₹${params.amount.toFixed(2)} processed successfully via ${params.paymentMethod}.`,
    document: doc,
    updatedDocument: doc,
  };
};

export const updatePortalPaymentStatus = (paymentId: string, status: 'Draft' | 'Confirm' | 'Cancelled'): boolean => {
  const payments = getStoredPayments();
  const p = payments.find((pay) => pay.id === paymentId);
  if (p) {
    p.status = status;
    localStorage.setItem('odoo_payments', JSON.stringify(payments));
    window.dispatchEvent(new Event('portal:payment'));
    window.dispatchEvent(new Event('odoo:accounting_updated'));
    return true;
  }
  return false;
};
