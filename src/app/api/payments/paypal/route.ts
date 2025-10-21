import { NextRequest, NextResponse } from 'next/server';
import { createPayPalPayment, executePayPalPayment } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, invoiceId, payerId, paymentId } = await request.json();

    if (!amount || !currency) {
      return NextResponse.json({ error: 'Amount and currency are required' }, { status: 400 });
    }

    if (payerId && paymentId) {
      // Execute payment
      const payment = await executePayPalPayment(paymentId, payerId);
      return NextResponse.json({
        success: true,
        payment,
      });
    } else {
      // Create payment
      const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payments/paypal/success`;
      const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payments/paypal/cancel`;

      const payment = await createPayPalPayment(
        amount,
        currency,
        invoiceId || 'invoice-123',
        returnUrl,
        cancelUrl
      );

      return NextResponse.json({
        paymentId: payment.id,
        approvalUrl: payment.approval_url,
      });
    }
  } catch (error) {
    console.error('PayPal payment failed:', error);
    return NextResponse.json({ error: 'Failed to process PayPal payment' }, { status: 500 });
  }
}