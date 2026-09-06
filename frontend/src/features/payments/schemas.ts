export type PaymentDirection = 'Receive' | 'Send' | 'RECEIVE' | 'SEND';
export type PaymentMethodType = 'Bank' | 'Cash' | 'BANK' | 'CASH' | 'Razorpay' | 'RAZORPAY';

export interface PaymentRecordDTO {
  id: string;
  type: 'Receive' | 'Send';
  date: string;
  partnerId: string;
  partnerName: string;
  paymentVia: 'Bank' | 'Cash' | 'Razorpay';
  amount: number;
  sourceDocType?: 'Invoice' | 'Bill';
  sourceDocId?: string;
  reference: string;
  note?: string;
}

export interface PartnerDueSummary {
  contactId: string;
  contactName: string;
  contactType: string;
  totalInvoiced: number;
  totalCollected: number;
  receivablesDue: number;
  totalBilled: number;
  totalPaid: number;
  payablesDue: number;
  netDue: number;
}
