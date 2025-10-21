import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateReminderEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Mock overdue invoice data - in real app, fetch from database
    const mockInvoice = {
      id: invoiceId,
      client_name: 'ABC Corp',
      client_email: 'billing@abc.com',
      total: 1500.00,
      due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      business_name: 'Invox',
    };

    const dueDate = new Date(mockInvoice.due_date);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    const emailData = generateReminderEmail(mockInvoice, daysOverdue);

    const result = await sendEmail(emailData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Payment reminder sent successfully'
      });
    } else {
      return NextResponse.json({
        error: 'Failed to send reminder',
        details: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}