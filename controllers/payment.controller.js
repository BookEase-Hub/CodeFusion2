const paymentService = require('../services/payment.service');
const User = require('../models/user.model');
const paymentConfig = require('../backend.configuration/payment.config');

exports.createStripeCheckout = async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    const userId = req.user.id;

    const session = await paymentService.createStripeCheckoutSession(
      userId,
      priceId,
      successUrl,
      cancelUrl
    );

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Create Stripe checkout error:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
};

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      paymentConfig.stripe.webhookSecret
    );

    await paymentService.handleStripeWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ message: 'Webhook error' });
  }
};

exports.createPayPalOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const userId = req.user.id;

    const order = await paymentService.createPayPalOrder(userId, amount, currency);
    res.json(order);
  } catch (error) {
    console.error('Create PayPal order error:', error);
    res.status(500).json({ message: 'Error creating PayPal order' });
  }
};

exports.capturePayPalOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const capture = await paymentService.capturePayPalOrder(orderId);
    res.json(capture);
  } catch (error) {
    console.error('Capture PayPal order error:', error);
    res.status(500).json({ message: 'Error capturing PayPal order' });
  }
};

exports.createEventlyPayment = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const userId = req.user.id;

    const payment = await paymentService.createEventlyPayment(userId, amount, currency);
    res.json(payment);
  } catch (error) {
    console.error('Create Evently payment error:', error);
    res.status(500).json({ message: 'Error creating Evently payment' });
  }
};

exports.handleEventlyWebhook = async (req, res) => {
  const signature = req.headers['evently-signature'];

  try {
    // Verify Evently webhook signature
    if (!verifyEventlySignature(req.body, signature, paymentConfig.evently.webhookSecret)) {
      throw new Error('Invalid signature');
    }

    await paymentService.handleEventlyWebhook(req.body);
    res.json({ received: true });
  } catch (error) {
    console.error('Evently webhook error:', error);
    res.status(400).json({ message: 'Webhook error' });
  }
};

function verifyEventlySignature(payload, signature, secret) {
  // Implement Evently signature verification
  // This will depend on Evently's specific signature verification method
  return true; // Placeholder
} 