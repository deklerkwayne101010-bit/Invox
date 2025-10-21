'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, Calendar, Filter } from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Invoice {
  id: string;
  client_name: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: any;
  due_date: any;
}

interface PaymentStats {
  totalOutstanding: number;
  totalPaid: number;
  overdueAmount: number;
  pendingCount: number;
  paidCount: number;
  overdueCount: number;
}

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [stats, setStats] = useState<PaymentStats>({
    totalOutstanding: 0,
    totalPaid: 0,
    overdueAmount: 0,
    pendingCount: 0,
    paidCount: 0,
    overdueCount: 0,
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const invoicesRef = collection(db, 'invoices');
      const q = query(invoicesRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const invoicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Invoice[];

      // Calculate payment statistics
      const now = new Date();
      let totalOutstanding = 0;
      let totalPaid = 0;
      let overdueAmount = 0;
      let pendingCount = 0;
      let paidCount = 0;
      let overdueCount = 0;

      invoicesData.forEach(invoice => {
        const dueDate = invoice.due_date?.toDate();
        const isOverdue = dueDate && dueDate < now && invoice.status !== 'paid';

        if (invoice.status === 'paid') {
          totalPaid += invoice.total;
          paidCount++;
        } else if (isOverdue) {
          totalOutstanding += invoice.total;
          overdueAmount += invoice.total;
          overdueCount++;
        } else if (invoice.status === 'sent') {
          totalOutstanding += invoice.total;
          pendingCount++;
        }
      });

      setStats({
        totalOutstanding,
        totalPaid,
        overdueAmount,
        pendingCount,
        paidCount,
        overdueCount,
      });

      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string, dueDate?: any) => {
    const now = new Date();
    const isOverdue = dueDate && dueDate.toDate() < now && status !== 'paid';

    if (isOverdue) return 'text-red-600 bg-red-100';
    if (status === 'paid') return 'text-green-600 bg-green-100';
    if (status === 'sent') return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: string, dueDate?: any) => {
    const now = new Date();
    const isOverdue = dueDate && dueDate.toDate() < now && status !== 'paid';

    if (isOverdue) return <AlertTriangle size={16} />;
    if (status === 'paid') return <CheckCircle size={16} />;
    if (status === 'sent') return <Clock size={16} />;
    return <Clock size={16} />;
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'all') return true;
    if (filter === 'paid') return invoice.status === 'paid';
    if (filter === 'pending') return invoice.status === 'sent';
    if (filter === 'overdue') {
      const now = new Date();
      return invoice.due_date && invoice.due_date.toDate() < now && invoice.status !== 'paid';
    }
    return true;
  });

  const formatCurrency = (amount: number) => `R${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-primary hover:text-primary-dark mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <CreditCard className="text-primary" size={40} />
                Payment Tracking
              </h1>
              <p className="text-gray-600 text-lg">Monitor your cash flow and payment status across all invoices.</p>
            </div>
          </div>
        </div>

        {/* Payment Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Outstanding</h3>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.totalOutstanding)}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.pendingCount + stats.overdueCount} invoices</p>
              </div>
              <TrendingUp className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Paid</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.paidCount} invoices</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Overdue Amount</h3>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.overdueCount} invoices</p>
              </div>
              <AlertTriangle className="text-red-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Payments</h3>
                <p className="text-3xl font-bold text-yellow-600">{formatCurrency(stats.totalOutstanding - stats.overdueAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.pendingCount} invoices</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Filter size={20} className="text-gray-500" />
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All Invoices', count: invoices.length },
                  { key: 'pending', label: 'Pending', count: stats.pendingCount },
                  { key: 'paid', label: 'Paid', count: stats.paidCount },
                  { key: 'overdue', label: 'Overdue', count: stats.overdueCount },
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === key
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {filter === 'all' ? 'All Invoices' :
               filter === 'pending' ? 'Pending Payments' :
               filter === 'paid' ? 'Paid Invoices' :
               'Overdue Invoices'}
            </h2>
          </div>

          {filteredInvoices.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => {
                const dueDate = invoice.due_date?.toDate();
                const createdDate = invoice.created_at?.toDate();
                const isOverdue = dueDate && dueDate < new Date() && invoice.status !== 'paid';

                return (
                  <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{invoice.client_name}</h3>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status, invoice.due_date)}`}>
                            {getStatusIcon(invoice.status, invoice.due_date)}
                            {isOverdue ? 'Overdue' : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>Created: {createdDate ? createdDate.toLocaleDateString() : 'N/A'}</span>
                          </div>
                          {dueDate && (
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span>Due: {dueDate.toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {formatCurrency(invoice.total)}
                        </div>
                        <Link
                          href={`/invoice/${invoice.id}`}
                          className="text-primary hover:text-primary-dark text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {filter === 'paid' ? '✅' : filter === 'overdue' ? '⚠️' : '📄'}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'paid' ? 'No paid invoices yet' :
                 filter === 'overdue' ? 'No overdue invoices' :
                 filter === 'pending' ? 'No pending payments' :
                 'No invoices found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === 'paid' ? 'Paid invoices will appear here once clients make payments.' :
                 filter === 'overdue' ? 'Great job! No overdue invoices at the moment.' :
                 filter === 'pending' ? 'All invoices are either paid or not yet sent.' :
                 'Create your first invoice to start tracking payments.'}
              </p>
              {filter === 'all' && (
                <Link
                  href="/invoice/new"
                  className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3 rounded-lg hover:from-primary-dark hover:to-primary transition-all inline-flex items-center gap-2 shadow-lg"
                >
                  <DollarSign size={20} />
                  Create Invoice
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}