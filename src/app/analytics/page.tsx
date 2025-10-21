'use client';

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Target, BarChart3, PieChart as PieChartIcon, Calendar, Download, Filter } from "lucide-react";

interface Invoice {
  id: string;
  client_name: string;
  total: number;
  status: 'draft' | 'sent' | 'paid';
  created_at: string;
}

interface Expense {
  id: string;
  vendor: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface TaxCalculation {
  vat: number;
  incomeTax: number;
  totalTax: number;
}

interface ForecastData {
  month: string;
  predicted: number;
  actual: number;
  confidence: number;
}

const COLORS = ['#71C8C9', '#669EC9', '#5778AC', '#5E558D', '#544268', '#71C8C9', '#669EC9'];

export default function Analytics() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '1y' | 'all'>('6m');
  const [selectedReport, setSelectedReport] = useState<'overview' | 'profit-loss' | 'cash-flow' | 'tax' | 'forecast'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const analyticsRes = await fetch(`/api/analytics?period=${selectedPeriod}&type=${selectedReport}`);

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          // Transform API data to match component expectations
          setInvoices([]); // We'll use the analytics data directly
          setExpenses([]);
        } else {
          // Fallback to original method
          const [invoicesRes, expensesRes] = await Promise.all([
            fetch('/api/invoices'),
            fetch('/api/expenses')
          ]);

          if (invoicesRes.ok) {
            const invoicesData = await invoicesRes.json();
            setInvoices(invoicesData.invoices || []);
          }

          if (expensesRes.ok) {
            const expensesData = await expensesRes.json();
            setExpenses(expensesData.expenses || []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod, selectedReport]);

  // Calculate tax obligations (South African tax rates)
  const calculateTax = (revenue: number, expenses: number): TaxCalculation => {
    const profit = revenue - expenses;
    const vat = revenue * 0.15; // 15% VAT
    const incomeTax = profit > 0 ? profit * 0.28 : 0; // 28% corporate tax rate
    return {
      vat,
      incomeTax,
      totalTax: vat + incomeTax
    };
  };

  // Generate forecast data using simple linear regression
  const generateForecast = (data: any[], months: number = 6): ForecastData[] => {
    if (data.length < 3) return [];

    const recentData = data.slice(-12); // Use last 12 months for trend
    const slope = recentData.reduce((acc, item, index) => {
      return acc + (item.value - recentData[0].value) / (index + 1);
    }, 0) / recentData.length;

    const lastValue = recentData[recentData.length - 1].value;

    return Array.from({ length: months }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      const predicted = lastValue + (slope * (i + 1));
      return {
        month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        predicted: Math.max(0, predicted),
        actual: i === 0 ? lastValue : undefined,
        confidence: Math.max(0.6, 1 - (i * 0.1)) // Decreasing confidence over time
      };
    });
  };

  // Prepare comprehensive analytics data
  const getAnalyticsData = () => {
    const now = new Date();
    const monthsBack = selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : selectedPeriod === '1y' ? 12 : 24;

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

      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const expense = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
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

    return monthlyData;
  };

  const analyticsData = getAnalyticsData();

  // Calculate KPIs
  const totalRevenue = analyticsData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = analyticsData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const avgMonthlyRevenue = totalRevenue / analyticsData.length;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Growth rates
  const currentMonth = analyticsData[analyticsData.length - 1];
  const previousMonth = analyticsData[analyticsData.length - 2];
  const revenueGrowth = previousMonth?.revenue ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 : 0;

  // Tax calculations
  const taxData = calculateTax(totalRevenue, totalExpenses);

  // Expense categories analysis
  const expenseCategories = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const expensePieData = Object.entries(expenseCategories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Cash flow data
  const cashFlowData = analyticsData.map(d => ({
    month: d.month,
    inflow: d.revenue,
    outflow: d.expenses,
    net: d.profit
  }));

  // Forecast data
  const revenueForecast = generateForecast(analyticsData.map(d => ({ value: d.revenue })), 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <BarChart3 className="text-primary" size={40} />
                Business Intelligence Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Advanced analytics and actionable business insights</p>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>

          {/* Report Type Selector */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'profit-loss', label: 'Profit & Loss', icon: TrendingUp },
              { id: 'cash-flow', label: 'Cash Flow', icon: DollarSign },
              { id: 'tax', label: 'Tax Report', icon: CreditCard },
              { id: 'forecast', label: 'Forecasting', icon: Target }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedReport(id as any)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  selectedReport === id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
                <p className="text-3xl font-bold text-primary">R{totalRevenue.toFixed(2)}</p>
                <div className="flex items-center mt-2">
                  {revenueGrowth >= 0 ? (
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                  ) : (
                    <TrendingDown className="text-red-500 mr-1" size={16} />
                  )}
                  <span className={`text-sm ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="text-primary" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-accent">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Expenses</h3>
                <p className="text-3xl font-bold text-accent">R{totalExpenses.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-2">Avg: R{(totalExpenses / analyticsData.length).toFixed(2)}/month</p>
              </div>
              <CreditCard className="text-accent" size={32} />
            </div>
          </div>

          <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${totalProfit >= 0 ? 'border-green-500' : 'border-red-500'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Net Profit</h3>
                <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R{totalProfit.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-2">Margin: {profitMargin.toFixed(1)}%</p>
              </div>
              <TrendingUp className={totalProfit >= 0 ? 'text-green-500' : 'text-red-500'} size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-accent-dark">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tax Obligation</h3>
                <p className="text-3xl font-bold text-accent-dark">R{taxData.totalTax.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-2">VAT: R{taxData.vat.toFixed(2)}</p>
              </div>
              <Target className="text-accent-dark" size={32} />
            </div>
          </div>
        </div>

        {/* Main Content Based on Selected Report */}
        {selectedReport === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue vs Expenses Trend */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Revenue vs Expenses Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R${value}`, '']} />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#71C8C9" fill="#71C8C9" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="expenses" stackId="2" stroke="#5E558D" fill="#5E558D" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Expense Categories */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expense Categories</h3>
              {expensePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`R${value}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No expense data available
                </div>
              )}
            </div>
          </div>
        )}

        {selectedReport === 'profit-loss' && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Profit & Loss Statement</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Month</th>
                    <th className="text-right py-2">Revenue</th>
                    <th className="text-right py-2">Expenses</th>
                    <th className="text-right py-2">Profit/Loss</th>
                    <th className="text-right py-2">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.map((data, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{data.month}</td>
                      <td className="text-right py-2">R{data.revenue.toFixed(2)}</td>
                      <td className="text-right py-2">R{data.expenses.toFixed(2)}</td>
                      <td className={`text-right py-2 ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R{data.profit.toFixed(2)}
                      </td>
                      <td className="text-right py-2">
                        {data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 font-semibold">
                    <td className="py-2">Total</td>
                    <td className="text-right py-2">R{totalRevenue.toFixed(2)}</td>
                    <td className="text-right py-2">R{totalExpenses.toFixed(2)}</td>
                    <td className={`text-right py-2 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R{totalProfit.toFixed(2)}
                    </td>
                    <td className="text-right py-2">{profitMargin.toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'cash-flow' && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Cash Flow Analysis</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R${value}`, '']} />
                <Bar dataKey="inflow" fill="#71C8C9" name="Cash Inflow" />
                <Bar dataKey="outflow" fill="#5E558D" name="Cash Outflow" />
                <Bar dataKey="net" fill="#5778AC" name="Net Cash Flow" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedReport === 'tax' && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Tax Report & Calculations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">VAT (15%)</h4>
                <p className="text-2xl font-bold text-blue-600">R{taxData.vat.toFixed(2)}</p>
                <p className="text-sm text-blue-700">Based on total revenue</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Income Tax (28%)</h4>
                <p className="text-2xl font-bold text-green-600">R{taxData.incomeTax.toFixed(2)}</p>
                <p className="text-sm text-green-700">Corporate tax on profit</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Total Tax</h4>
                <p className="text-2xl font-bold text-purple-600">R{taxData.totalTax.toFixed(2)}</p>
                <p className="text-sm text-purple-700">Combined tax obligation</p>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Tax Planning Insights</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Consider expense optimization to reduce taxable income</li>
                <li>• VAT is calculated on all revenue - ensure proper invoicing</li>
                <li>• Keep detailed records for tax audits</li>
                <li>• Consult with a tax professional for personalized advice</li>
              </ul>
            </div>
          </div>
        )}

        {selectedReport === 'forecast' && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Revenue Forecasting</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={revenueForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  `R${value}`,
                  name === 'predicted' ? 'Forecast' : 'Actual'
                ]} />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#71C8C9"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="predicted"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#5778AC"
                  strokeWidth={3}
                  name="actual"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600">
              <p>Forecast based on historical trends. Confidence decreases over time.</p>
              <p>Next month prediction: R{revenueForecast[0]?.predicted.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* Actionable Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="text-blue-600" size={24} />
            Actionable Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-green-600 mb-2">Revenue Growth</h4>
              <p className="text-sm text-gray-600">
                {revenueGrowth >= 0
                  ? `Strong growth of ${revenueGrowth.toFixed(1)}% this month. Keep up the momentum!`
                  : `Revenue declined by ${Math.abs(revenueGrowth).toFixed(1)}%. Focus on client acquisition and upselling.`
                }
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-2">Expense Management</h4>
              <p className="text-sm text-gray-600">
                {expensePieData.length > 0
                  ? `Largest expense category: ${expensePieData[0].name} (${((expensePieData[0].value / totalExpenses) * 100).toFixed(1)}%). Consider optimization opportunities.`
                  : 'Track expenses to identify optimization opportunities.'
                }
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-purple-600 mb-2">Tax Planning</h4>
              <p className="text-sm text-gray-600">
                Current tax obligation: R{taxData.totalTax.toFixed(2)}.
                {totalProfit > 0 ? ' Plan ahead for tax payments.' : ' Consider tax loss harvesting opportunities.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}