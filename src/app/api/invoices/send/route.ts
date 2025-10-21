import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateInvoiceEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, pdfUrl } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Mock invoice data - in real app, fetch from database
    const mockInvoice = {
      id: invoiceId,
      client_name: 'ABC Corp',
      client_email: 'billing@abc.com',
      total: 1500.00,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      business_name: 'Invox',
    };

    const emailData = generateInvoiceEmail(mockInvoice, pdfUrl);

    const result = await sendEmail(emailData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Invoice sent successfully'
      });
    } else {
      return NextResponse.json({
        error: 'Failed to send invoice',
        details: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending invoice:', error);
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
  }
}