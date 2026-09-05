import { apiPost, ApiResponse } from '../../lib/apiClient';

// --- Line Items ---
export interface OrderLineInput {
  productId: string;
  analyticId?: string;
  qty: number;
  unitPrice: number;
}

export interface InvoiceBillLineInput {
  productId: string;
  accountId: string;
  analyticId?: string;
  qty: number;
  unitPrice: number;
}

// --- Purchase Order Payloads ---
export interface CreatePOPayload {
  vendorId: string;
  poDate?: string | Date;
  paymentTerms?: string;
  lines: OrderLineInput[];
}

export interface ConfirmPOResponse {
  order: any;
  warnings?: string[];
}

// --- Vendor Bill Payloads ---
export interface CreateBillPayload {
  vendorId: string;
  billReference?: string;
  purchaseOrderId?: string;
  billDate?: string | Date;
  dueDate: string | Date;
  lines: InvoiceBillLineInput[];
}

// --- Sales Order Payloads ---
export interface CreateSOPayload {
  customerId: string;
  soDate?: string | Date;
  lines: OrderLineInput[];
}

// --- Customer Invoice Payloads ---
export interface CreateInvoicePayload {
  customerId: string;
  reference?: string;
  salesOrderId?: string;
  invoiceDate?: string | Date;
  dueDate: string | Date;
  lines: InvoiceBillLineInput[];
}

// --- API Methods ---
export async function createPurchaseOrderApi(payload: CreatePOPayload): Promise<ApiResponse<any>> {
  return apiPost('/purchase-orders', payload);
}

export async function confirmPurchaseOrderApi(id: string): Promise<ApiResponse<ConfirmPOResponse>> {
  return apiPost(`/purchase-orders/${id}/confirm`);
}

export async function createVendorBillApi(payload: CreateBillPayload): Promise<ApiResponse<any>> {
  return apiPost('/vendor-bills', payload);
}

export async function confirmVendorBillApi(id: string): Promise<ApiResponse<any>> {
  return apiPost(`/vendor-bills/${id}/confirm`);
}

export async function createSalesOrderApi(payload: CreateSOPayload): Promise<ApiResponse<any>> {
  return apiPost('/sales-orders', payload);
}

export async function createCustomerInvoiceApi(payload: CreateInvoicePayload): Promise<ApiResponse<any>> {
  return apiPost('/customer-invoices', payload);
}

export async function confirmCustomerInvoiceApi(id: string): Promise<ApiResponse<any>> {
  return apiPost(`/customer-invoices/${id}/confirm`);
}
