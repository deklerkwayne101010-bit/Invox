'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle, Eye, Send, DollarSign } from 'lucide-react';

interface StatusHistory {
  id: string;
  invoice_id: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  changed_at: string;
  changed_by: string;
  notes?: string;
}

interface InvoiceStatusTrackerProps {
  invoiceId: string;
  currentStatus: string;
  onStatusChange?: (status: string) => void;
}

const statusConfig = {
  draft: { icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-100', label: 'Draft' },
  sent: { icon: Send, color: 'text-blue-500', bgColor: 'bg-blue-100', label: 'Sent' },
  viewed: { icon: Eye, color: 'text-purple-500', bgColor: 'bg-purple-100', label: 'Viewed' },
  paid: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100', label: 'Paid' },
  overdue: { icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-100', label: 'Overdue' },
  cancelled: { icon: XCircle, color: 'text-gray-500', bgColor: 'bg-gray-100', label: 'Cancelled' },
};

export default function InvoiceStatusTracker({ invoiceId, currentStatus, onStatusChange }: InvoiceStatusTrackerProps) {
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  useEffect(() => {
    fetchStatusHistory();
  }, [invoiceId]);

  const fetchStatusHistory = async () => {
    try {
      const response = await fetch(`/api/invoices/status?invoiceId=${invoiceId}`);
      const data = await response.json();
      setStatusHistory(data.statusHistory || []);
    } catch (error) {
      console.error('Failed to fetch status history:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/invoices/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId,
          status: selectedStatus,
          notes: `Status changed to ${selectedStatus}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onStatusChange?.(selectedStatus);
        await fetchStatusHistory(); // Refresh history
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatusConfig = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.draft;
  const CurrentIcon = currentStatusConfig.icon;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <CurrentIcon className={`h-5 w-5 ${currentStatusConfig.color}`} />
        <h3 className="text-lg font-semibold text-gray-900">Invoice Status</h3>
      </div>

      {/* Current Status Display */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${currentStatusConfig.bgColor}`}>
            <CurrentIcon className={`h-5 w-5 ${currentStatusConfig.color}`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{currentStatusConfig.label}</p>
            <p className="text-sm text-gray-600">Current status</p>
          </div>
        </div>
      </div>

      {/* Status Update */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Update Status
        </label>
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={isUpdating || selectedStatus === currentStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>

      {/* Status History */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Status History</h4>
        <div className="space-y-3">
          {statusHistory.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No status history available</p>
          ) : (
            statusHistory.map((entry, index) => {
              const config = statusConfig[entry.status as keyof typeof statusConfig] || statusConfig.draft;
              const Icon = config.icon;

              return (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-full ${config.bgColor} flex-shrink-0`}>
                    <Icon className={`h-3 w-3 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{config.label}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.changed_at).toLocaleDateString()}
                      </p>
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">by {entry.changed_by}</p>
                  </div>
                  {index < statusHistory.length - 1 && (
                    <div className="w-px h-6 bg-gray-200 ml-6 mt-2"></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedStatus('sent')}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
          >
            <Send className="h-3 w-3" />
            Mark as Sent
          </button>
          <button
            onClick={() => setSelectedStatus('paid')}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100"
          >
            <DollarSign className="h-3 w-3" />
            Mark as Paid
          </button>
        </div>
      </div>
    </div>
  );
}