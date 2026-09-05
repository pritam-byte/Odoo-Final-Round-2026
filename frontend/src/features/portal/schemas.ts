export interface DocumentLineItem {
  id: string;
  product: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type DocumentType = 'invoice' | 'bill';
export type UserDocumentStatus = 'Paid' | 'Unpaid';

export interface PortalDocument {
  id: string;
  type: DocumentType;
  number: string;
  partnerId: string;
  partnerName: string;
  date: string;
  dueDate: string;
  status: UserDocumentStatus;
  total: number;
  amountPaid: number;
  amountDue: number;
  lines: DocumentLineItem[];
}

export interface PortalPayment {
  id: string;
  documentId: string;
  documentNumber: string;
  documentType: DocumentType;
  amount: number;
  date: string;
  paymentMethod: 'Bank' | 'Cash';
  reference: string;
  partnerName?: string;
  note?: string;
  status?: 'Draft' | 'Confirm' | 'Cancelled';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  loginId: string;
  partnerId: string;
  role: 'user' | 'admin';
}
