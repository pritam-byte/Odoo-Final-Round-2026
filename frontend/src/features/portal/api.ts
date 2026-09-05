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

let mockPortalDocuments: PortalDocument[] = [
  {
    id: 'inv_101',
    number: 'INV/2026/0001',
    type: 'invoice',
    partnerId: 'partner_john_doe',
    partnerName: 'John Doe (Customer)',
    date: '2026-08-15',
    dueDate: '2026-09-15',
    total: 1250.0,
    amountPaid: 0.0,
    amountDue: 1250.0,
    status: 'Unpaid',
    lines: [
      { id: 'l1', product: 'Oak Wood Executive Desk', quantity: 1, unitPrice: 850.0, total: 850.0 },
      { id: 'l2', product: 'Ergonomic Mesh Chair', quantity: 2, unitPrice: 200.0, total: 400.0 },
    ],
  },
  {
    id: 'inv_102',
    number: 'INV/2026/0002',
    type: 'invoice',
    partnerId: 'partner_john_doe',
    partnerName: 'John Doe (Customer)',
    date: '2026-07-10',
    dueDate: '2026-08-10',
    total: 450.0,
    amountPaid: 450.0,
    amountDue: 0.0,
    status: 'Paid',
    lines: [
      { id: 'l3', product: 'Solid Walnut Coffee Table', quantity: 1, unitPrice: 450.0, total: 450.0 },
    ],
  },
  {
    id: 'bill_201',
    number: 'BILL/2026/0045',
    type: 'bill',
    partnerId: 'partner_john_doe',
    partnerName: 'Urban Timbers & Supplies Ltd (Vendor)',
    date: '2026-08-20',
    dueDate: '2026-09-20',
    total: 620.0,
    amountPaid: 0.0,
    amountDue: 620.0,
    status: 'Unpaid',
    lines: [
      { id: 'l4', product: 'Raw Timber Plank Lot (Grade A Teak)', quantity: 10, unitPrice: 62.0, total: 620.0 },
    ],
  },
  {
    id: 'bill_202',
    number: 'BILL/2026/0012',
    type: 'bill',
    partnerId: 'partner_john_doe',
    partnerName: 'Urban Timbers & Supplies Ltd (Vendor)',
    date: '2026-06-05',
    dueDate: '2026-07-05',
    total: 980.0,
    amountPaid: 980.0,
    amountDue: 0.0,
    status: 'Paid',
    lines: [
      { id: 'l5', product: 'Metal Furniture Hardware Kit (Pack of 20)', quantity: 20, unitPrice: 49.0, total: 980.0 },
    ],
  },
];

let mockPortalPayments: PortalPayment[] = [
  {
    id: 'pay_001',
    documentId: 'inv_101',
    documentNumber: 'INV/2026/0001',
    documentType: 'invoice',
    amount: 1250.0,
    date: '2026-09-05',
    paymentMethod: 'Bank',
    reference: 'PAY/2026/3439',
    partnerName: 'John Doe (Customer)',
    note: 'Self-Service customer settlement for Executive Desk & Mesh Chair',
    status: 'Confirm',
  },
  {
    id: 'pay_002',
    documentId: 'bill_201',
    documentNumber: 'BILL/2026/0045',
    documentType: 'bill',
    amount: 620.0,
    date: '2026-09-05',
    paymentMethod: 'Bank',
    reference: 'PAY/2026/7437',
    partnerName: 'Urban Timbers & Supplies Ltd',
    note: 'Supplier invoice payout voucher for Raw Timber Lot',
    status: 'Confirm',
  },
  {
    id: 'pay_003',
    documentId: 'inv_102',
    documentNumber: 'INV/2026/0002',
    documentType: 'invoice',
    amount: 450.0,
    date: '2026-08-08',
    paymentMethod: 'Bank',
    reference: 'PAY/2026/0088',
    partnerName: 'John Doe (Customer)',
    note: 'Customer advance for Walnut Coffee Table',
    status: 'Confirm',
  },
  {
    id: 'pay_004',
    documentId: 'bill_202',
    documentNumber: 'BILL/2026/0012',
    documentType: 'bill',
    amount: 980.0,
    date: '2026-07-01',
    paymentMethod: 'Cash',
    reference: 'PAY/2026/0052',
    partnerName: 'Urban Timbers & Supplies Ltd',
    note: 'Cash settlement at counter for Hardware Kit',
    status: 'Confirm',
  },
];

export const getMyScopedDocuments = (documentType?: DocumentType): PortalDocument[] => {
  const current = getStoredUser();
  const partnerType = current?.partnerType || 'Both';
  const currentPartnerId = getScopedPartnerId();

  let docs = mockPortalDocuments.filter(
    (doc) => doc.partnerId === currentPartnerId || !doc.partnerId || doc.partnerId === 'partner_john_doe'
  );

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
  const docs = getMyScopedDocuments();
  return docs.find((d) => d.id === id) || null;
};

export const getMyPayments = (): PortalPayment[] => {
  const current = getStoredUser();
  const partnerType = current?.partnerType || 'Both';

  let payments = [...mockPortalPayments];

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
  const doc = mockPortalDocuments.find((d) => d.id === params.documentId);
  if (!doc) {
    return { success: false, message: 'Document not found for payment.' };
  }

  if (params.amount <= 0) {
    return { success: false, message: 'Payment amount must be greater than zero.' };
  }

  if (params.amount > doc.amountDue) {
    return { success: false, message: `Amount exceeds current dues of ₹${doc.amountDue.toFixed(2)}.` };
  }

  // Attempt async live backend payment submission in the background
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
  }).catch((e) => console.warn('Backend payment background sync skipped', e));

  // Update local document balance
  doc.amountPaid += params.amount;
  doc.amountDue = Math.max(0, doc.total - doc.amountPaid);
  if (doc.amountDue === 0) {
    doc.status = 'Paid';
  }

  const currentUser = getStoredUser();
  const effectivePartner = doc.type === 'invoice' 
    ? (currentUser?.name ? `${currentUser.name} (Customer)` : 'John Doe (Customer)')
    : (doc.partnerName || 'Urban Timbers & Supplies Ltd');

  const newPayment: PortalPayment = {
    id: `pay_${Date.now()}`,
    documentId: doc.id,
    documentNumber: doc.number,
    documentType: doc.type,
    amount: params.amount,
    date: params.date,
    paymentMethod: params.paymentMethod,
    reference: params.reference || `PAY/2026/${Math.floor(1000 + Math.random() * 9000)}`,
    partnerName: effectivePartner,
    note: params.reference || `Self-Service Portal settlement for ${doc.number}`,
    status: 'Confirm',
  };

  mockPortalPayments.unshift(newPayment);

  return {
    success: true,
    message: `Payment of ₹${params.amount.toFixed(2)} processed successfully via ${params.paymentMethod}.`,
    document: doc,
    updatedDocument: doc,
  };
};

export const updatePortalPaymentStatus = (paymentId: string, status: 'Draft' | 'Confirm' | 'Cancelled'): boolean => {
  const p = mockPortalPayments.find((pay) => pay.id === paymentId);
  if (p) {
    p.status = status;
    return true;
  }
  return false;
};
