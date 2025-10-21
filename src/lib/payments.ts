import Stripe from 'stripe';
import paypal from 'paypal-rest-sdk';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

paypal.configure({
  mode: process.env.PAYPAL_MODE as 'sandbox' | 'live',
  client_id: process.env.PAYPAL_CLIENT_ID!,
  client_secret: process.env.PAYPAL_CLIENT_SECRET!,
});

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
}

export interface PayPalPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  approval_url?: string;
}

// Stripe Functions
export async function createStripePaymentIntent(amount: number, currency: string, metadata?: Record<string, string>): Promise<PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret || undefined,
    };
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
    throw new Error('Failed to create payment intent');
  }
}

export async function confirmStripePayment(paymentIntentId: string): Promise<PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error('Stripe payment confirmation failed:', error);
    throw new Error('Failed to confirm payment');
  }
}

export async function createStripeCheckoutSession(
  amount: number,
  currency: string,
  invoiceId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Invoice #${invoiceId}`,
              description: 'Payment for services',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        invoice_id: invoiceId,
      },
    });

    return {
      id: session.id,
      url: session.url,
      payment_status: session.payment_status,
    };
  } catch (error) {
    console.error('Stripe checkout session creation failed:', error);
    throw new Error('Failed to create checkout session');
  }
}

// PayPal Functions
export async function createPayPalPayment(amount: number, currency: string, invoiceId: string, returnUrl: string, cancelUrl: string): Promise<PayPalPayment> {
  return new Promise((resolve, reject) => {
    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
      transactions: [{
        item_list: {
          items: [{
            name: `Invoice #${invoiceId}`,
            sku: invoiceId,
            price: amount.toFixed(2),
            currency: currency,
            quantity: 1,
          }],
        },
        amount: {
          currency: currency,
          total: amount.toFixed(2),
        },
        description: `Payment for Invoice #${invoiceId}`,
      }],
    };

    paypal.payment.create(create_payment_json, (error: unknown, payment: any) => {
      if (error) {
        console.error('PayPal payment creation failed:', error);
        reject(new Error('Failed to create PayPal payment'));
      } else {
        const approvalUrl = payment.links.find((link: any) => link.rel === 'approval_url')?.href;

        resolve({
          id: payment.id,
          amount: parseFloat(payment.transactions[0].amount.total),
          currency: payment.transactions[0].amount.currency,
          status: payment.state,
          approval_url: approvalUrl,
        });
      }
    });
  });
}

export async function executePayPalPayment(paymentId: string, payerId: string): Promise<PayPalPayment> {
  return new Promise((resolve, reject) => {
    const execute_payment_json = {
      payer_id: payerId,
    };

    paypal.payment.execute(paymentId, execute_payment_json, (error: unknown, payment: any) => {
      if (error) {
        console.error('PayPal payment execution failed:', error);
        reject(new Error('Failed to execute PayPal payment'));
      } else {
        resolve({
          id: payment.id,
          amount: parseFloat(payment.transactions[0].amount.total),
          currency: payment.transactions[0].amount.currency,
          status: payment.state,
        });
      }
    });
  });
}

// Webhook verification
export async function verifyStripeWebhook(rawBody: Buffer, signature: string): Promise<boolean> {
  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    return !!event;
  } catch (error) {
    console.error('Stripe webhook verification failed:', error);
    return false;
  }
}