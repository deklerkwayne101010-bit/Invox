import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRates, convertCurrency } from '@/lib/currency';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get('base') || 'USD';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amount = searchParams.get('amount');

    if (from && to && amount) {
      // Convert specific amount
      const rates = await getExchangeRates(base);
      const convertedAmount = convertCurrency(parseFloat(amount), from, to, rates.rates);

      return NextResponse.json({
        from,
        to,
        amount: parseFloat(amount),
        convertedAmount,
        rate: rates.rates[to] / rates.rates[from],
        base: rates.base,
        timestamp: rates.timestamp,
      });
    } else {
      // Return all rates
      const rates = await getExchangeRates(base);
      return NextResponse.json(rates);
    }
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    return NextResponse.json({ error: 'Failed to fetch currency rates' }, { status: 500 });
  }
}