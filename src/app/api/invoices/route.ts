import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data for testing
    const mockInvoices = [
      {
        id: '1',
        user_id: 'test-user',
        client_name: 'ABC Corp',
        client_email: 'billing@abc.com',
        items: [
          { description: 'Web development services', quantity: 1, price: 1500.00 }
        ],
        total: 1500.00,
        status: 'pending',
        created_at: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        user_id: 'test-user',
        client_name: 'XYZ Ltd',
        client_email: 'accounts@xyz.com',
        items: [
          { description: 'Consulting services - Phase 1', quantity: 1, price: 1500.00 },
          { description: 'Consulting services - Phase 2', quantity: 1, price: 1000.00 }
        ],
        total: 2500.00,
        status: 'paid',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return NextResponse.json({ invoices: mockInvoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}