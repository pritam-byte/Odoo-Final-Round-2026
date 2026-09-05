import { apiPost, ApiResponse } from '../../lib/apiClient';

export interface RegisterPaymentPayload {
  paymentType: 'SEND' | 'RECEIVE';
  partnerId: string;
  amount: number;
  paymentVia: 'BANK' | 'CASH';
  note?: string;
  vendorBillId?: string;
  customerInvoiceId?: string;
}

export async function registerPaymentApi(payload: RegisterPaymentPayload): Promise<ApiResponse<any>> {
  return apiPost('/payments', payload);
}
