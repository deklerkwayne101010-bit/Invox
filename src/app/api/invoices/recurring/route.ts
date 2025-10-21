import { NextRequest, NextResponse } from 'next/server';

interface RecurringInvoice {
  id: string;
  template_id: string;
  client_id: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_due_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  last_generated?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Mock recurring invoices data
    const mockRecurringInvoices: RecurringInvoice[] = [
      {
        id: 'rec-1',
        template_id: 'inv-template-1',
        client_id: 'client-1',
        frequency: 'monthly',
        next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        last_generated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'rec-2',
        template_id: 'inv-template-2',
        client_id: 'client-2',
        frequency: 'quarterly',
        next_due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ recurringInvoices: mockRecurringInvoices });
  } catch (error) {
    console.error('Error fetching recurring invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch recurring invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templateId, clientId, frequency, startDate, endDate } = await request.json();

    if (!templateId || !clientId || !frequency) {
      return NextResponse.json({ error: 'Template ID, client ID, and frequency are required' }, { status: 400 });
    }

    // Calculate next due date based on frequency
    const nextDueDate = calculateNextDueDate(new Date(startDate || Date.now()), frequency);

    const recurringInvoice: RecurringInvoice = {
      id: `rec-${Date.now()}`,
      template_id: templateId,
      client_id: clientId,
      frequency,
      next_due_date: nextDueDate.toISOString(),
      end_date: endDate,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    // In a real app, save to database
    console.log('Created recurring invoice:', recurringInvoice);

    return NextResponse.json({
      success: true,
      recurringInvoice,
    });
  } catch (error) {
    console.error('Error creating recurring invoice:', error);
    return NextResponse.json({ error: 'Failed to create recurring invoice' }, { status: 500 });
  }
}

function calculateNextDueDate(startDate: Date, frequency: string): Date {
  const date = new Date(startDate);

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1); // Default to monthly
  }

  return date;
}