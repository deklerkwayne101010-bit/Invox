import { NextRequest, NextResponse } from 'next/server';
import { createStripePaymentIntent, createStripeCheckoutSession } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, invoiceId, type } = await request.json();

    if (!amount || !currency) {
      return NextResponse.json({ error: 'Amount and currency are required' }, { status: 400 });
    }

    if (type === 'checkout') {
      // Create checkout session
      const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payments/cancel`;

      const session = await createStripeCheckoutSession(
        amount,
        currency,
        invoiceId || 'invoice-123',
        successUrl,
        cancelUrl
      );

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
      });
    } else {
      // Create payment intent
      const paymentIntent = await createStripePaymentIntent(amount, currency, {
        invoice_id: invoiceId,
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    }
  } catch (error) {
    console.error('Stripe payment creation failed:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}