'use client';

import { useState } from 'react';
import { Send, Mail, AlertCircle, CheckCircle } from 'lucide-react';

interface EmailIntegrationProps {
  invoiceId: string;
  clientEmail: string;
  onEmailSent?: () => void;
}

export default function EmailIntegration({ invoiceId, clientEmail, onEmailSent }: EmailIntegrationProps) {
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSendEmail = async () => {
    setIsSending(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId,
          pdfUrl: `${window.location.origin}/api/invoice/${invoiceId}/pdf`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Invoice sent successfully!');
        onEmailSent?.();
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send invoice');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Email Integration</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Email
          </label>
          <input
            type="email"
            value={clientEmail}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
          />
        </div>

        <button
          onClick={handleSendEmail}
          disabled={isSending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Invoice
            </>
          )}
        </button>

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
      </div>
    </div>
  );
}