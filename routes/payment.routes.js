const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const paymentController = require('../controllers/payment.controller');

// Stripe routes
router.post('/stripe/create-checkout', verifyToken, paymentController.createStripeCheckout);
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

// PayPal routes
router.post('/paypal/create-order', verifyToken, paymentController.createPayPalOrder);
router.post('/paypal/capture/:orderId', verifyToken, paymentController.capturePayPalOrder);

// Evently routes
router.post('/evently/create-payment', verifyToken, paymentController.createEventlyPayment);
router.post('/evently/webhook', express.json(), paymentController.handleEventlyWebhook);

module.exports = router; 