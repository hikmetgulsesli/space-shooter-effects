import React from 'react';
import { Phone, Building2, Clock } from 'lucide-react';
import { CustomerToCall } from '../types/dashboard';

interface CustomersToCallWidgetProps {
  customers: CustomerToCall[];
}

const priorityConfig = {
  high: { color: 'text-red-600 bg-red-50 border-red-200', label: 'High' },
  medium: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Medium' },
  low: { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Low' },
};

function formatLastContact(dateString?: string): string {
  if (!dateString) return 'Never contacted';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export function CustomersToCallWidget({ customers }: CustomersToCallWidgetProps) {
  // Sort by priority
  const sortedCustomers = [...customers].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Customers to Call</h3>
        </div>
        <span className="text-sm text-gray-500">{customers.length} pending</span>
      </div>
      
      <div className="p-2">
        {sortedCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No customers to call</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedCustomers.slice(0, 5).map((customer) => (
              <div
                key={customer.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {customer.company && (
                      <>
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">{customer.company}</span>
                      </>
                    )}
                  </div>
                  {customer.phone && (
                    <p className="text-sm text-blue-600 mt-0.5">{customer.phone}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${priorityConfig[customer.priority].color}`}>
                    {priorityConfig[customer.priority].label}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatLastContact(customer.last_contact_date)}
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
