import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data for testing
    const mockExpenses = [
      {
        id: '1',
        user_id: 'test-user',
        vendor: 'Office Depot',
        description: 'Office supplies',
        amount: 150.00,
        category: 'Office Supplies',
        date: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        user_id: 'test-user',
        vendor: 'Uber',
        description: 'Client meeting transportation',
        amount: 45.00,
        category: 'Transportation',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        user_id: 'test-user',
        vendor: 'Starbucks',
        description: 'Coffee and snacks for team meeting',
        amount: 25.00,
        category: 'Meals & Entertainment',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return NextResponse.json({ expenses: mockExpenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendor, description, amount, category, date } = body;

    // Validate required fields
    if (!vendor || !amount || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mock response for testing
    const mockExpense = {
      id: Date.now().toString(),
      user_id: 'test-user',
      vendor,
      description: description || '',
      amount: parseFloat(amount),
      category,
      date: new Date(date).toISOString(),
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(mockExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}