"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function PaymentForm({ amount, currency = 'USD', onSuccess, onError }: PaymentFormProps) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'evently'>('stripe');
  const [loading, setLoading] = useState(false);

  const handleStripePayment = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/payment/stripe/create-checkout', {
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      });

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Stripe payment error:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async (data: any, actions: any) => {
    try {
      const response = await axios.post('/api/payment/paypal/create-order', {
        amount,
        currency
      });

      return actions.order.create({
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toString()
          }
        }]
      });
    } catch (error) {
      console.error('PayPal order creation error:', error);
      onError?.(error);
      return null;
    }
  };

  const handleEventlyPayment = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/payment/evently/create-payment', {
        amount,
        currency
      });

      // Redirect to Evently checkout page
      window.location.href = response.data.checkoutUrl;
    } catch (error) {
      console.error('Evently payment error:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value: any) => setPaymentMethod(value)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="stripe" id="stripe" />
              <Label htmlFor="stripe" className="flex items-center space-x-2">
                <img src="/stripe-logo.svg" alt="Stripe" className="h-6" />
                <span>Credit Card (Stripe)</span>
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal" className="flex items-center space-x-2">
                <img src="/paypal-logo.svg" alt="PayPal" className="h-6" />
                <span>PayPal</span>
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <RadioGroupItem value="evently" id="evently" />
              <Label htmlFor="evently" className="flex items-center space-x-2">
                <img src="/evently-logo.svg" alt="Evently" className="h-6" />
                <span>Evently</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="pt-4">
          <div className="text-lg font-medium mb-2">
            Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}
          </div>

          {paymentMethod === 'stripe' && (
            <Button
              onClick={handleStripePayment}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Pay with Stripe'}
            </Button>
          )}

          {paymentMethod === 'paypal' && (
            <PayPalButtons
              createOrder={handlePayPalPayment}
              onApprove={async (data, actions) => {
                try {
                  const response = await axios.post(`/api/payment/paypal/capture/${data.orderID}`);
                  onSuccess?.();
                } catch (error) {
                  console.error('PayPal capture error:', error);
                  onError?.(error);
                }
              }}
              onError={(error) => {
                console.error('PayPal error:', error);
                onError?.(error);
              }}
              style={{ layout: 'horizontal' }}
            />
          )}

          {paymentMethod === 'evently' && (
            <Button
              onClick={handleEventlyPayment}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Pay with Evently'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
} 