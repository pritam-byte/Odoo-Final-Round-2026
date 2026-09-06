import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getGatewayConfig,
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
} from '../controllers/payment-gateway.controller.js';

const router = Router();

// Public / Gateway Webhook (no session auth required)
router.get('/config', getGatewayConfig);
router.post('/webhook', razorpayWebhook);

// Authenticated Endpoints for Portal Customers and Staff
router.use(authenticate);
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyRazorpayPayment);

export default router;
