const express = require('express');
const stripe = require('stripe');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Initialize Stripe (Global)
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Helper to get client URL for redirects
const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:3000';

// @desc    Create Stripe payment intent
// @route   POST /api/payment/create-stripe-intent
// @access  Private
router.post('/create-stripe-intent', protect, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency,
      metadata: { integration_check: 'accept_a_payment' }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ message: 'Error creating payment intent' });
  }
});

// @desc    Create Stripe Checkout Session
// @route   POST /api/payment/create-stripe-session
// @access  Private
router.post('/create-stripe-session', protect, async (req, res) => {
  try {
    const { amount, currency = 'inr' } = req.body; // Always use INR for Indian users

    const session = await stripeClient.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: [
        'card' // Start with just cards to ensure it works
      ],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Multi Vendor Shop Order',
              description: 'Secure payment via Credit/Debit Cards'
            },
            unit_amount: Math.round(amount * 100)
          },
          quantity: 1
        }
      ],
      // Optimized for digital payments
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic'
        }
      },
      customer_email: req.user.email,
      billing_address_collection: 'required',
      // Remove locale to avoid module loading errors
      // Add metadata for Indian e-commerce
      metadata: {
        payment_type: 'indian_ecommerce',
        currency: 'inr',
        country: 'IN',
        region: 'India'
      },
      success_url: `${getClientUrl()}/order-confirmation/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getClientUrl()}/checkout`
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ message: 'Error creating Stripe session' });
  }
});

// @desc    Get payment methods
// @route   GET /api/payment/methods
// @access  Public
router.get('/methods', (req, res) => {
  res.json({
    methods: [
      {
        id: 'COD',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order'
      },
      {
        id: 'Stripe',
        name: 'Online Payment (Credit/Debit Cards)',
        description: 'Pay securely with Visa, Mastercard, American Express, and RuPay cards',
        supportedMethods: [
          'Credit Cards (Visa, Mastercard, American Express)',
          'Debit Cards (Visa, Mastercard, RuPay)',
          'International Cards (Visa, Mastercard, Amex)'
        ],
        note: 'Secure payment processing via Stripe. Google Pay will appear automatically if enabled in your Stripe dashboard and supported by your device.'
      }
    ]
  });
});

module.exports = router;
