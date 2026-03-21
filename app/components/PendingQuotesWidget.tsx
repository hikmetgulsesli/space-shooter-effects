import React from 'react';
import { FileText, DollarSign, Send, Clock } from 'lucide-react';
import { Quote } from '../types/dashboard';

interface PendingQuotesWidgetProps {
  quotes: Quote[];
}

const statusConfig = {
  draft: { color: 'text-gray-600 bg-gray-100 border-gray-200', label: 'Draft' },
  sent: { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Sent' },
  accepted: { color: 'text-green-600 bg-green-50 border-green-200', label: 'Accepted' },
  rejected: { color: 'text-red-600 bg-red-50 border-red-200', label: 'Rejected' },
};

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export function PendingQuotesWidget({ quotes }: PendingQuotesWidgetProps) {
  // Filter to only show draft and sent quotes as "pending"
  const pendingQuotes = quotes.filter(q => q.status === 'draft' || q.status === 'sent');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Pending Quotes</h3>
        </div>
        <span className="text-sm text-gray-500">{pendingQuotes.length} pending</span>
      </div>
      
      <div className="p-2">
        {pendingQuotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No pending quotes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingQuotes.slice(0, 5).map((quote) => (
              <div
                key={quote.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  {quote.status === 'draft' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-gray-900">{quote.customer_name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Created {formatDate(quote.created_at)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="font-semibold text-gray-900 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    {formatAmount(quote.amount)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusConfig[quote.status].color}`}>
                    {statusConfig[quote.status].label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
