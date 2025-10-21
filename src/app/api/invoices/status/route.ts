import { NextRequest, NextResponse } from 'next/server';

interface InvoiceStatusUpdate {
  invoiceId: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, status, notes }: InvoiceStatusUpdate = await request.json();

    if (!invoiceId || !status) {
      return NextResponse.json({ error: 'Invoice ID and status are required' }, { status: 400 });
    }

    // Mock status update - in real app, update database
    const updatedInvoice = {
      id: invoiceId,
      status,
      updated_at: new Date().toISOString(),
      notes,
    };

    // Trigger notifications based on status change
    await triggerStatusNotifications(invoiceId, status);

    console.log('Updated invoice status:', updatedInvoice);

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return NextResponse.json({ error: 'Failed to update invoice status' }, { status: 500 });
  }
}

async function triggerStatusNotifications(invoiceId: string, status: string) {
  try {
    // Mock notification logic
    switch (status) {
      case 'sent':
        console.log(`Invoice ${invoiceId} sent - notification triggered`);
        // Could send email notification to client
        break;
      case 'viewed':
        console.log(`Invoice ${invoiceId} viewed - tracking notification`);
        // Could log view analytics
        break;
      case 'paid':
        console.log(`Invoice ${invoiceId} paid - success notification`);
        // Could send payment confirmation
        break;
      case 'overdue':
        console.log(`Invoice ${invoiceId} overdue - reminder notification`);
        // Could trigger automated reminder system
        break;
      default:
        console.log(`Invoice ${invoiceId} status changed to ${status}`);
    }
  } catch (error) {
    console.error('Error triggering status notifications:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Mock status history - in real app, fetch from database
    const statusHistory = [
      {
        id: '1',
        invoice_id: invoiceId,
        status: 'draft',
        changed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        changed_by: 'user-1',
        notes: 'Invoice created',
      },
      {
        id: '2',
        invoice_id: invoiceId,
        status: 'sent',
        changed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        changed_by: 'user-1',
        notes: 'Invoice sent to client',
      },
      {
        id: '3',
        invoice_id: invoiceId,
        status: 'viewed',
        changed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        changed_by: 'system',
        notes: 'Client viewed invoice',
      },
    ];

    return NextResponse.json({ statusHistory });
  } catch (error) {
    console.error('Error fetching status history:', error);
    return NextResponse.json({ error: 'Failed to fetch status history' }, { status: 500 });
  }
}