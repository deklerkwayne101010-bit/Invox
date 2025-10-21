import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '6m';
    const reportType = searchParams.get('type') || 'overview';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1); // Far back date for all data
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }

    // Fetch invoices
    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('created_at', '>=', startDate.toISOString()),
      orderBy('created_at', 'desc')
    );
    const invoicesSnapshot = await getDocs(invoicesQuery);
    const invoices = invoicesSnapshot.docs.map(doc => ({
      id: doc.id,
      created_at: doc.data().created_at || '',
      total: doc.data().total || 0,
      client_name: doc.data().client_name || '',
      ...doc.data()
    }));

    // Fetch expenses
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('date', '>=', startDate.toISOString()),
      orderBy('date', 'desc')
    );
    const expensesSnapshot = await getDocs(expensesQuery);
    const expenses = expensesSnapshot.docs.map(doc => ({
      id: doc.id,
      date: doc.data().date || '',
      amount: doc.data().amount || 0,
      category: doc.data().category || '',
      ...doc.data()
    }));

    // Calculate analytics based on report type
    let analytics = {};

    switch (reportType) {
      case 'overview':
        analytics = calculateOverviewAnalytics(invoices, expenses, period);
        break;
      case 'profit-loss':
        analytics = calculateProfitLossAnalytics(invoices, expenses, period);
        break;
      case 'cash-flow':
        analytics = calculateCashFlowAnalytics(invoices, expenses, period);
        break;
      case 'tax':
        analytics = calculateTaxAnalytics(invoices, expenses);
        break;
      case 'forecast':
        analytics = calculateForecastAnalytics(invoices, expenses);
        break;
      default:
        analytics = calculateOverviewAnalytics(invoices, expenses, period);
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      period,
      reportType
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

function calculateOverviewAnalytics(invoices: { id: string; created_at: string; total?: number; client_name: string }[], expenses: { id: string; date: string; amount?: number; category: string }[], period: string) {
  const now = new Date();
  const monthsBack = period === '3m' ? 3 : period === '6m' ? 6 : period === '1y' ? 12 : 24;

  const monthlyData = Array.from({ length: monthsBack }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1);
    const monthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.created_at);
      return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear();
    });
    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
    });

    const revenue = monthInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const expense = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const profit = revenue - expense;

    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue,
      expenses: expense,
      profit,
      invoices: monthInvoices.length,
      clients: new Set(monthInvoices.map(inv => inv.client_name)).size
    };
  });

  const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = monthlyData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;

  // Expense categories
  const expenseCategories = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + (expense.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  return {
    monthlyData,
    totals: {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalProfit,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    },
    expenseCategories: Object.entries(expenseCategories).map(([name, value]) => ({ name, value })),
    kpis: {
      avgMonthlyRevenue: totalRevenue / monthlyData.length,
      totalInvoices: invoices.length,
      totalExpenses: expenses.length,
      uniqueClients: new Set(invoices.map(inv => inv.client_name)).size
    }
  };
}

function calculateProfitLossAnalytics(invoices: { id: string; created_at: string; total?: number; client_name: string }[], expenses: { id: string; date: string; amount?: number; category: string }[], period: string) {
  const data = calculateOverviewAnalytics(invoices, expenses, period);
  return {
    profitLossStatement: data.monthlyData.map(d => ({
      month: d.month,
      revenue: d.revenue,
      expenses: d.expenses,
      profit: d.profit,
      margin: d.revenue > 0 ? (d.profit / d.revenue) * 100 : 0
    })),
    totals: data.totals
  };
}

function calculateCashFlowAnalytics(invoices: { id: string; created_at: string; total?: number; client_name: string }[], expenses: { id: string; date: string; amount?: number; category: string }[], period: string) {
  const data = calculateOverviewAnalytics(invoices, expenses, period);
  return {
    cashFlow: data.monthlyData.map(d => ({
      month: d.month,
      inflow: d.revenue,
      outflow: d.expenses,
      net: d.profit
    })),
    summary: {
      totalInflow: data.totals.revenue,
      totalOutflow: data.totals.expenses,
      netCashFlow: data.totals.profit
    }
  };
}

function calculateTaxAnalytics(invoices: { id: string; created_at: string; total?: number; client_name: string }[], expenses: { id: string; date: string; amount?: number; category: string }[]) {
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const profit = totalRevenue - totalExpenses;

  // South African tax rates
  const vat = totalRevenue * 0.15; // 15% VAT
  const incomeTax = profit > 0 ? profit * 0.28 : 0; // 28% corporate tax rate
  const totalTax = vat + incomeTax;

  return {
    taxCalculations: {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit,
      vat,
      incomeTax,
      totalTax
    },
    taxRates: {
      vatRate: 0.15,
      corporateTaxRate: 0.28
    },
    insights: [
      'VAT is calculated on all revenue - ensure proper invoicing',
      'Corporate tax applies to taxable profit after expenses',
      'Keep detailed records for tax audits',
      'Consider quarterly tax payments to avoid penalties'
    ]
  };
}

function calculateForecastAnalytics(invoices: { id: string; created_at: string; total?: number; client_name: string }[], expenses: { id: string; date: string; amount?: number; category: string }[]) {
  if (invoices.length < 3) {
    return { forecast: [], message: 'Need at least 3 months of data for forecasting' };
  }

  // Simple linear regression for revenue forecasting
  const monthlyRevenue = invoices.reduce((acc, inv) => {
    const date = new Date(inv.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    acc[key] = (acc[key] || 0) + (inv.total || 0);
    return acc;
  }, {} as Record<string, number>);

  const revenueData = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, value: revenue }));

  if (revenueData.length < 3) {
    return { forecast: [], message: 'Need more historical data for accurate forecasting' };
  }

  // Calculate trend
  const recentData = revenueData.slice(-6); // Use last 6 months
  const slope = recentData.reduce((acc, item, index) => {
    if (index === 0) return acc;
    return acc + (((item.value as number) || 0) - ((recentData[0].value as number) || 0)) / index;
  }, 0) / (recentData.length - 1);

  const lastValue = recentData[recentData.length - 1].value as number || 0;

  // Generate 6-month forecast
  const forecast = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() + i);
    const predicted = lastValue + (slope * (i + 1));
    return {
      month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      predicted: Math.max(0, predicted),
      actual: i === 0 ? lastValue : undefined,
      confidence: Math.max(0.6, 1 - (i * 0.1))
    };
  });

  return {
    forecast,
    trend: slope >= 0 ? 'increasing' : 'decreasing',
    confidence: 'medium',
    basedOnMonths: recentData.length
  };
}