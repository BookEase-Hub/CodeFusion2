const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// Create Stripe customer and subscription
exports.createSubscription = async (req, res) => {
  try {
    const { paymentMethodId, plan } = req.body;
    const user = await User.findById(req.user.id);

    // Create or retrieve Stripe customer
    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
      
      // Save customer ID to user
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env[STRIPE_${plan.toUpperCase()}_PRICE_ID] }],
      expand: ['latest_invoice.payment_intent']
    });

    // Save subscription to database
    const newSubscription = new Subscription({
      userId: req.user.id,
      plan,
      status: 'active',
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });
    await newSubscription.save();

    res.json({
      status: subscription.status,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });
  } catch (err) {
    console.error('Subscription Error:', err);
    res.status(500).send('Subscription creation failed');
  }
};

// Handle Stripe webhooks
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook Error:', err);
    return res.status(400).send(Webhook Error: ${err.message});
  }

  switch (event.type) {
    case 'invoice.payment_succeeded':
      const subscription = event.data.object;
      await Subscription.updateOne(
        { stripeSubscriptionId: subscription.subscription },
        { 
          currentPeriodEnd: new Date(subscription.period_end * 1000),
          updatedAt: Date.now()
        }
      );
      break;
    
    case 'customer.subscription.deleted':
      const deletedSub = event.data.object;
      await Subscription.updateOne(
        { stripeSubscriptionId: deletedSub.id },
        { 
          status: 'canceled',
          updatedAt: Date.now()
        }
      );
      break;
    
    // Handle other events as needed
  }

  res.json({ received: true });
};

// Check trial status and downgrade if needed
exports.checkTrialStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.subscriptionStatus === 'trial' && new Date() > user.trialEndsAt) {
      user.subscriptionStatus = 'inactive';
      user.subscriptionPlan = 'free';
      await user.save();
    }
    next();
  } catch (err) {
    console.error('Trial Check Error:', err);
    next();
  }
};