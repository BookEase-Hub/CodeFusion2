const stripe = require('stripe');
const paypal = require('@paypal/checkout-server-sdk');
const axios = require('axios');
const paymentConfig = require('../backend.configuration/payment.config');

class PaymentService {
  constructor() {
    this.stripe = stripe(paymentConfig.stripe.secretKey);
    
    // PayPal client setup
    const environment = paymentConfig.paypal.mode === 'live'
      ? new paypal.core.LiveEnvironment(paymentConfig.paypal.clientId, paymentConfig.paypal.clientSecret)
      : new paypal.core.SandboxEnvironment(paymentConfig.paypal.clientId, paymentConfig.paypal.clientSecret);
    this.paypalClient = new paypal.core.PayPalHttpClient(environment);
    
    // Evently setup
    this.eventlyClient = axios.create({
      baseURL: 'https://api.evently.com/v1',
      headers: {
        'Authorization': `Bearer ${paymentConfig.evently.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Stripe Methods
  async createStripeCheckoutSession(userId, priceId, successUrl, cancelUrl) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer_email: userId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId
        }
      });
      return session;
    } catch (error) {
      console.error('Stripe checkout session error:', error);
      throw error;
    }
  }

  async handleStripeWebhook(event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleStripeCheckoutComplete(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleStripeSubscriptionUpdate(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleStripeSubscriptionCanceled(event.data.object);
          break;
      }
    } catch (error) {
      console.error('Stripe webhook error:', error);
      throw error;
    }
  }

  // PayPal Methods
  async createPayPalOrder(userId, amount, currency = 'USD') {
    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount
          }
        }],
        application_context: {
          user_id: userId
        }
      });

      const order = await this.paypalClient.execute(request);
      return order.result;
    } catch (error) {
      console.error('PayPal order creation error:', error);
      throw error;
    }
  }

  async capturePayPalOrder(orderId) {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      const capture = await this.paypalClient.execute(request);
      return capture.result;
    } catch (error) {
      console.error('PayPal capture error:', error);
      throw error;
    }
  }

  // Evently Methods
  async createEventlyPayment(userId, amount, currency = 'USD') {
    try {
      const response = await this.eventlyClient.post('/payments', {
        merchant_id: paymentConfig.evently.merchantId,
        amount,
        currency,
        metadata: {
          userId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Evently payment creation error:', error);
      throw error;
    }
  }

  async handleEventlyWebhook(event) {
    try {
      switch (event.type) {
        case 'payment.succeeded':
          await this.handleEventlyPaymentSuccess(event.data);
          break;
        case 'payment.failed':
          await this.handleEventlyPaymentFailure(event.data);
          break;
      }
    } catch (error) {
      console.error('Evently webhook error:', error);
      throw error;
    }
  }

  // Helper methods for subscription status updates
  async handleStripeCheckoutComplete(session) {
    // Update user subscription status
  }

  async handleStripeSubscriptionUpdate(subscription) {
    // Handle subscription updates
  }

  async handleStripeSubscriptionCanceled(subscription) {
    // Handle subscription cancellation
  }

  async handleEventlyPaymentSuccess(payment) {
    // Handle successful Evently payment
  }

  async handleEventlyPaymentFailure(payment) {
    // Handle failed Evently payment
  }
}

module.exports = new PaymentService(); 