import { PortalDocument, PortalPayment, DocumentLineItem, DocumentType, UserDocumentStatus } from './schemas';
import { getScopedPartnerId } from '../../lib/auth';

export type { PortalDocument, PortalPayment, DocumentLineItem, DocumentType, UserDocumentStatus };

let mockDocuments: PortalDocument[] = [
  {
    id: 'doc_1',
    type: 'invoice',
    number: 'INV/2026/0001',
    partnerId: 'partner_john_doe',
    partnerName: 'John Doe (Client Corp)',
    date: '2026-09-01',
    dueDate: '2026-09-15',
    status: 'Unpaid',
    total: 2450.00,
    amountPaid: 0,
    amountDue: 2450.00,
    lines: [
      { id: 'l1', product: 'Cloud Hosting Services - Annual', quantity: 1, unitPrice: 1200.00, total: 1200.00 },
      { id: 'l2', product: 'Software Customization Support (Hours)', quantity: 10, unitPrice: 125.00, total: 1250.00 }
    ]
  },
  {
    id: 'doc_2',
    type: 'invoice',
    number: 'INV/2026/0002',
    partnerId: 'partner_john_doe',
    partnerName: 'John Doe (Client Corp)',
    date: '2026-08-10',
    dueDate: '2026-08-25',
    status: 'Paid',
    total: 850.00,
    amountPaid: 850.00,
    amountDue: 0.00,
    lines: [
      { id: 'l3', product: 'Domain Renewal & SSL Certificate', quantity: 1, unitPrice: 350.00, total: 350.00 },
      { id: 'l4', product: 'Monthly Maintenance Plan', quantity: 1, unitPrice: 500.00, total: 500.00 }
    ]
  },
  {
    id: 'doc_3',
    type: 'bill',
    number: 'BILL/2026/0014',
    partnerId: 'partner_john_doe',
    partnerName: 'John Doe (Vendor Supplier)',
    date: '2026-09-03',
    dueDate: '2026-09-18',
    status: 'Unpaid',
    total: 1320.00,
    amountPaid: 0,
    amountDue: 1320.00,
    lines: [
      { id: 'l5', product: 'Office Hardware Components', quantity: 4, unitPrice: 330.00, total: 1320.00 }
    ]
  },
  {
    id: 'doc_4',
    type: 'bill',
    number: 'BILL/2026/0008',
    partnerId: 'partner_john_doe',
    partnerName: 'John Doe (Vendor Supplier)',
    date: '2026-07-20',
    dueDate: '2026-08-05',
    status: 'Paid',
    total: 450.00,
    amountPaid: 450.00,
    amountDue: 0.00,
    lines: [
      { id: 'l6', product: 'Stationery & Printing Supplies', quantity: 1, unitPrice: 450.00, total: 450.00 }
    ]
  },
  // Document belonging to another partner (Must NEVER be returned to John Doe)
  {
    id: 'doc_other',
    type: 'invoice',
    number: 'INV/2026/9999',
    partnerId: 'partner_other_person',
    partnerName: 'Acme Corp',
    date: '2026-09-01',
    dueDate: '2026-09-15',
    status: 'Unpaid',
    total: 15000.00,
    amountPaid: 0,
    amountDue: 15000.00,
    lines: []
  }
];

let mockPayments: PortalPayment[] = [
  {
    id: 'pay_1',
    documentId: 'doc_2',
    documentNumber: 'INV/2026/0002',
    documentType: 'invoice',
    amount: 850.00,
    date: '2026-08-20',
    paymentMethod: 'Bank',
    reference: 'BNK-TXN-98421'
  },
  {
    id: 'pay_2',
    documentId: 'doc_4',
    documentNumber: 'BILL/2026/0008',
    documentType: 'bill',
    amount: 450.00,
    date: '2026-08-01',
    paymentMethod: 'Cash',
    reference: 'CSH-REC-1102'
  }
];

// Strictly scoped query: only returns documents where partnerId === self
export const getMyScopedDocuments = (filterType?: 'invoice' | 'bill'): PortalDocument[] => {
  const myPartnerId = getScopedPartnerId();
  let list = mockDocuments.filter(doc => doc.partnerId === myPartnerId);
  if (filterType) {
    list = list.filter(doc => doc.type === filterType);
  }
  return list;
};

// Strictly scoped query for detail view
export const getMyScopedDocumentById = (id: string): PortalDocument | null => {
  const myPartnerId = getScopedPartnerId();
  const doc = mockDocuments.find(d => d.id === id && d.partnerId === myPartnerId);
  return doc || null;
};

export const getMyPayments = (): PortalPayment[] => {
  const myDocIds = getMyScopedDocuments().map(d => d.id);
  return mockPayments.filter(p => myDocIds.includes(p.documentId));
};

export interface ProcessPaymentPayload {
  documentId: string;
  amount: number;
  date: string;
  paymentMethod: 'Bank' | 'Cash';
  reference?: string;
}

export const processPortalPayment = (payload: ProcessPaymentPayload): { success: boolean; message: string; document?: PortalDocument } => {
  const myPartnerId = getScopedPartnerId();
  const docIndex = mockDocuments.findIndex(d => d.id === payload.documentId && d.partnerId === myPartnerId);
  
  if (docIndex === -1) {
    return { success: false, message: 'Document not found or access denied.' };
  }

  const doc = mockDocuments[docIndex];
  if (payload.amount <= 0 || payload.amount > doc.amountDue) {
    return { success: false, message: 'Payment amount must be greater than 0 and cannot exceed the Amount Due.' };
  }

  // Update document financial balances
  const newAmountPaid = doc.amountPaid + payload.amount;
  const newAmountDue = Math.max(0, doc.total - newAmountPaid);
  const newStatus: 'Paid' | 'Unpaid' = newAmountDue === 0 ? 'Paid' : 'Unpaid';

  mockDocuments[docIndex] = {
    ...doc,
    amountPaid: newAmountPaid,
    amountDue: newAmountDue,
    status: newStatus
  };

  // Record payment receipt
  const paymentRecord: PortalPayment = {
    id: 'pay_' + Date.now(),
    documentId: doc.id,
    documentNumber: doc.number,
    documentType: doc.type,
    amount: payload.amount,
    date: payload.date || new Date().toISOString().split('T')[0],
    paymentMethod: payload.paymentMethod,
    reference: payload.reference || ('PAY-' + Math.floor(100000 + Math.random() * 900000))
  };

  mockPayments.unshift(paymentRecord);

  return {
    success: true,
    message: 'Payment processed successfully.',
    document: mockDocuments[docIndex]
  };
};
