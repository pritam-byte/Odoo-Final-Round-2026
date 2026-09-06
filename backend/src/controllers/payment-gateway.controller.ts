import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { RazorpayService } from '../services/razorpay.service.js';
import { TransactionService } from '../services/transaction.service.js';

/**
 * GET /api/payments/razorpay/config
 * Returns public configuration and test mode status for the frontend
 */
export async function getGatewayConfig(_req: Request, res: Response) {
  try {
    const isConfigured = RazorpayService.isConfigured();
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_sandbox';

    return res.json({
      provider: 'RAZORPAY',
      isConfigured,
      keyId,
      currency: 'INR',
      sandboxMode: !isConfigured,
      companyName: 'Urban Furniture ERP',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch gateway configuration' });
  }
}

/**
 * POST /api/payments/razorpay/create-order
 * Creates a Razorpay Order for an invoice settlement
 */
export async function createRazorpayOrder(req: Request, res: Response) {
  try {
    const { invoiceId, billId, amount, partnerId } = req.body;

    let targetInvoice = null;
    let targetBill = null;
    let payAmount = Number(amount);
    let receiptNumber = `RCPT_${Date.now()}`;
    let contactInfo: { name: string; email?: string | null; phone?: string | null; id: string } | null = null;

    if (invoiceId) {
      targetInvoice = await prisma.customerInvoice.findUnique({
        where: { id: invoiceId },
        include: { customer: true },
      });

      if (!targetInvoice) {
        return res.status(404).json({ error: 'Customer invoice not found' });
      }

      if (Number(targetInvoice.amountDue) <= 0) {
        return res.status(400).json({ error: 'Invoice has already been paid in full' });
      }

      payAmount = payAmount > 0 ? payAmount : Number(targetInvoice.amountDue);
      if (payAmount > Number(targetInvoice.amountDue)) {
        return res.status(400).json({
          error: `Payment amount ₹${payAmount} exceeds remaining invoice dues of ₹${targetInvoice.amountDue}`,
        });
      }

      receiptNumber = targetInvoice.invoiceNo;
      contactInfo = {
        id: targetInvoice.customer.id,
        name: targetInvoice.customer.name,
        email: targetInvoice.customer.email,
        phone: targetInvoice.customer.phone,
      };
    } else if (billId) {
      targetBill = await prisma.vendorBill.findUnique({
        where: { id: billId },
        include: { vendor: true },
      });

      if (!targetBill) {
        return res.status(404).json({ error: 'Vendor bill not found' });
      }

      payAmount = payAmount > 0 ? payAmount : Number(targetBill.amountDue);
      receiptNumber = targetBill.billNo;
      contactInfo = {
        id: targetBill.vendor.id,
        name: targetBill.vendor.name,
        email: targetBill.vendor.email,
        phone: targetBill.vendor.phone,
      };
    } else if (partnerId) {
      const contact = await prisma.contact.findUnique({ where: { id: partnerId } });
      if (!contact) {
        return res.status(404).json({ error: 'Partner contact not found' });
      }
      if (!payAmount || payAmount <= 0) {
        return res.status(400).json({ error: 'Payment amount must be greater than zero' });
      }
      contactInfo = {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
      };
    } else {
      if (!payAmount || payAmount <= 0) {
        return res.status(400).json({ error: 'Invalid payment parameters. Invoice ID or Amount is required.' });
      }
    }

    const order = await RazorpayService.createOrder({
      amountInRupees: payAmount,
      receipt: receiptNumber,
      notes: {
        invoiceId: invoiceId || '',
        billId: billId || '',
        partnerId: contactInfo?.id || '',
        customerName: contactInfo?.name || '',
      },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount, // in paise
      amountInRupees: payAmount,
      currency: order.currency,
      receipt: order.receipt,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_sandbox',
      isMock: Boolean(order.isMock),
      customer: {
        name: contactInfo?.name || 'Valued Customer',
        email: contactInfo?.email || 'customer@urbanfurniture.com',
        contact: contactInfo?.phone || '+919876543210',
      },
    });
  } catch (error: any) {
    console.error('[GATEWAY CONTROLLER] Error creating Razorpay order:', error);
    return res.status(500).json({ error: error.message || 'Failed to initialize payment gateway order' });
  }
}

/**
 * POST /api/payments/razorpay/verify
 * Verifies Razorpay payment signature and records transaction into Double-Entry Accounting ledger
 */
export async function verifyRazorpayPayment(req: Request, res: Response) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      invoiceId,
      billId,
      partnerId,
      amount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing gateway signature tokens (order_id, payment_id, signature)' });
    }

    // 1. Verify cryptographic HMAC SHA-256 signature
    const isValid = RazorpayService.verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Payment signature verification failed. Tampered payload detected.' });
    }

    let targetPartnerId = partnerId;
    let payAmount = Number(amount);

    if (invoiceId) {
      const invoice = await prisma.customerInvoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) return res.status(404).json({ error: 'Associated invoice not found' });
      targetPartnerId = invoice.customerId;
      payAmount = payAmount > 0 ? payAmount : Number(invoice.amountDue);
    } else if (billId) {
      const bill = await prisma.vendorBill.findUnique({ where: { id: billId } });
      if (!bill) return res.status(404).json({ error: 'Associated bill not found' });
      targetPartnerId = bill.vendorId;
      payAmount = payAmount > 0 ? payAmount : Number(bill.amountDue);
    }

    if (!targetPartnerId) {
      return res.status(400).json({ error: 'Partner ID could not be determined for payment registration' });
    }

    // 2. Register into double-entry accounting ledger via TransactionService
    const payment = await TransactionService.registerPayment({
      paymentType: invoiceId ? 'RECEIVE' : billId ? 'SEND' : 'RECEIVE',
      partnerId: targetPartnerId,
      amount: payAmount,
      paymentVia: 'BANK',
      note: `Online Payment via Razorpay (Payment ID: ${razorpay_payment_id}, Order ID: ${razorpay_order_id})`,
      customerInvoiceId: invoiceId || undefined,
      vendorBillId: billId || undefined,
    });

    console.log(
      `[GATEWAY CONTROLLER] ✅ Successfully verified Razorpay payment ${razorpay_payment_id} (₹${payAmount}) for partner ${targetPartnerId}`
    );

    return res.status(200).json({
      success: true,
      message: `Payment of ₹${payAmount.toFixed(2)} verified successfully and posted to accounting ledger!`,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      payment,
    });
  } catch (error: any) {
    console.error('[GATEWAY CONTROLLER] Error verifying payment:', error);
    return res.status(500).json({ error: error.message || 'Payment verification and ledger posting failed' });
  }
}

/**
 * POST /api/payments/razorpay/webhook
 * Handles asynchronous server-to-server notifications from Razorpay
 */
export async function razorpayWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const bodyString = JSON.stringify(req.body);

    if (signature) {
      const isValid = RazorpayService.verifyWebhookSignature(bodyString, signature);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body?.event;
    console.log(`[RAZORPAY WEBHOOK] Received event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body?.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const notes = paymentEntity?.notes || {};

      if (notes.invoiceId && paymentEntity?.amount) {
        const invoice = await prisma.customerInvoice.findUnique({ where: { id: notes.invoiceId } });
        if (invoice && Number(invoice.amountDue) > 0) {
          await TransactionService.registerPayment({
            paymentType: 'RECEIVE',
            partnerId: invoice.customerId,
            amount: Number(paymentEntity.amount) / 100,
            paymentVia: 'BANK',
            note: `Webhook Captured Razorpay Payment (ID: ${paymentId}, Order: ${orderId})`,
            customerInvoiceId: invoice.id,
          });
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('[RAZORPAY WEBHOOK] Error processing webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}
