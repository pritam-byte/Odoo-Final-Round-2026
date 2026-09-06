import { apiRequest } from './apiClient';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface GatewayConfig {
  provider: string;
  isConfigured: boolean;
  keyId: string;
  currency: string;
  sandboxMode: boolean;
  companyName: string;
}

export interface InitiatePaymentOptions {
  invoiceId?: string;
  billId?: string;
  partnerId?: string;
  invoiceNumber?: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (result: { paymentId: string; orderId: string; message: string; payment?: any }) => void;
  onError?: (errorMsg: string) => void;
  onCancel?: () => void;
}

/**
 * Fetch public payment gateway configuration
 */
export async function getGatewayConfig(): Promise<GatewayConfig> {
  try {
    const res = await apiRequest<GatewayConfig>('/payments/razorpay/config');
    return res.data || {
      provider: 'RAZORPAY',
      isConfigured: false,
      keyId: 'rzp_test_sandbox',
      currency: 'INR',
      sandboxMode: true,
      companyName: 'Urban Furniture ERP',
    };
  } catch {
    return {
      provider: 'RAZORPAY',
      isConfigured: false,
      keyId: 'rzp_test_sandbox',
      currency: 'INR',
      sandboxMode: true,
      companyName: 'Urban Furniture ERP',
    };
  }
}

/**
 * Dynamically load Razorpay SDK if not already available
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initiate Razorpay checkout flow
 */
export async function initiateRazorpayPayment(opts: InitiatePaymentOptions): Promise<void> {
  try {
    // 1. Create order on backend
    const orderRes = await apiRequest<{
      orderId: string;
      amount: number;
      amountInRupees: number;
      currency: string;
      keyId: string;
      receipt: string;
      isMock?: boolean;
      customer?: { name: string; email: string; contact: string };
    }>('/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: opts.invoiceId,
        billId: opts.billId,
        partnerId: opts.partnerId,
        amount: opts.amount,
      }),
    });

    if (!orderRes.success || !orderRes.data) {
      throw new Error(orderRes.error || 'Failed to initialize payment gateway order');
    }

    const orderData = orderRes.data;
    const isScriptLoaded = await loadRazorpayScript();

    // 2. If Real Razorpay SDK is available and not purely mock
    if (isScriptLoaded && window.Razorpay && !orderData.isMock && orderData.keyId && !orderData.keyId.includes('sandbox')) {
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Urban Furniture ERP',
        description: opts.invoiceNumber
          ? `Settlement for Invoice #${opts.invoiceNumber}`
          : `Online Payment Settlement`,
        image: '/urban-furniture-logo.png',
        order_id: orderData.orderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Verify payment on backend
            const verifyRes = await apiRequest<{
              success: boolean;
              message: string;
              paymentId: string;
              orderId: string;
              payment?: any;
            }>('/payments/razorpay/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                invoiceId: opts.invoiceId,
                billId: opts.billId,
                partnerId: opts.partnerId,
                amount: opts.amount,
              }),
            });

            if (verifyRes.success) {
              // Trigger reactive events
              window.dispatchEvent(new Event('portal:payment'));
              window.dispatchEvent(new Event('odoo:accounting_updated'));

              opts.onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                message: verifyRes.data?.message || 'Payment successfully processed!',
                payment: verifyRes.data?.payment,
              });
            } else {
              opts.onError?.(verifyRes.error || 'Payment verification failed on server');
            }
          } catch (vErr: any) {
            opts.onError?.(vErr.message || 'Error communicating with verification service');
          }
        },
        prefill: {
          name: opts.customerName || orderData.customer?.name || '',
          email: opts.customerEmail || orderData.customer?.email || '',
          contact: opts.customerPhone || orderData.customer?.contact || '',
        },
        theme: {
          color: '#0f766e',
        },
        modal: {
          ondismiss: () => {
            opts.onCancel?.();
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (failResp: any) => {
        opts.onError?.(failResp.error?.description || 'Payment was declined or cancelled');
      });
      rzp.open();
    } else {
      // 3. Built-in Interactive Sandbox Mode
      // Execute verified mock payment for testing without real gateway keys
      const mockPaymentId = `pay_sim_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
      const mockSignature = `sig_sim_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      const verifyRes = await apiRequest<{
        success: boolean;
        message: string;
        paymentId: string;
        orderId: string;
        payment?: any;
      }>('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: mockSignature,
          invoiceId: opts.invoiceId,
          billId: opts.billId,
          partnerId: opts.partnerId,
          amount: opts.amount,
        }),
      });

      if (verifyRes.success) {
        window.dispatchEvent(new Event('portal:payment'));
        window.dispatchEvent(new Event('odoo:accounting_updated'));

        opts.onSuccess({
          paymentId: mockPaymentId,
          orderId: orderData.orderId,
          message: `Sandbox Test Payment Verified! (₹${opts.amount.toFixed(2)})`,
          payment: verifyRes.data?.payment,
        });
      } else {
        opts.onError?.(verifyRes.error || 'Sandbox payment simulation failed');
      }
    }
  } catch (err: any) {
    opts.onError?.(err.message || 'Payment initiation failed');
  }
}
