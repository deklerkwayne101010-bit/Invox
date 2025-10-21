'use client';

import { useState } from 'react';
import { CreditCard, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentGatewayProps {
  amount: number;
  currency: string;
  invoiceId: string;
  onPaymentSuccess?: (paymentData: { id: string; amount: number; currency: string; status: string }) => void;
}

export default function PaymentGateway({ amount, currency, invoiceId, onPaymentSuccess }: PaymentGatewayProps) {
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'paypal'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleStripePayment = async () => {
    setIsProcessing(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/payments/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          invoiceId,
          type: 'checkout',
        }),
      });

      const data = await response.json();

      if (data.sessionId) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setStatus('error');
        setMessage('Failed to create payment session');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    setIsProcessing(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/payments/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          invoiceId,
        }),
      });

      const data = await response.json();

      if (data.approvalUrl) {
        // Redirect to PayPal approval
        window.location.href = data.approvalUrl;
      } else {
        setStatus('error');
        setMessage('Failed to create PayPal payment');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (selectedGateway === 'stripe') {
      handleStripePayment();
    } else {
      handlePayPalPayment();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Payment Gateway</h3>
      </div>

      <div className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount Due:</span>
            <span className="text-lg font-semibold text-gray-900">
              {currency} {amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-600">Invoice:</span>
            <span className="text-sm text-gray-900">#{invoiceId}</span>
          </div>
        </div>

        {/* Gateway Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Payment Method
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="stripe"
                checked={selectedGateway === 'stripe'}
                onChange={(e) => setSelectedGateway(e.target.value as 'stripe')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Credit/Debit Card (Stripe)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="paypal"
                checked={selectedGateway === 'paypal'}
                onChange={(e) => setSelectedGateway(e.target.value as 'paypal')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">PayPal</span>
            </label>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="h-4 w-4" />
              Pay {currency} {amount.toFixed(2)}
            </>
          )}
        </button>

        {/* Status Messages */}
        {status !== 'idle' && (
          <div className={`flex items-center gap-2 p-3 rounded-md ${
            status === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {status === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{message}</span>
          </div>
        )}

        {/* Security Notice */}
        <div className="text-xs text-gray-500 text-center">
          🔒 Your payment information is secure and encrypted
        </div>
      </div>
    </div>
  );
}