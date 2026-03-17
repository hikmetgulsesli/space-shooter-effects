import React, { useState, useCallback, useMemo } from 'react';
import type {
  Quotation,
  QuotationFilters,
  QuotationStatus,
  TransportMode,
  ServiceType,
} from '../../types/quotation';
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Ship,
  Plane,
  Truck,
  Train,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface QuotationListProps {
  quotations: Quotation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters: QuotationFilters;
  onFilterChange: (filters: QuotationFilters) => void;
  onPageChange: (page: number) => void;
  onSelectQuotation: (quotation: Quotation) => void;
  onCreateQuotation: () => void;
  customers?: { id: string; name: string }[];
}

const statusColors: Record<QuotationStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
  sent: { bg: 'bg-blue-100', text: 'text-blue-700' },
  accepted: { bg: 'bg-green-100', text: 'text-green-700' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700' },
  expired: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
};

const transportIcons: Record<TransportMode, React.ReactNode> = {
  air: <Plane className="w-4 h-4" />,
  sea: <Ship className="w-4 h-4" />,
  road: <Truck className="w-4 h-4" />,
  rail: <Train className="w-4 h-4" />,
};

const transportLabels: Record<TransportMode, string> = {
  air: 'Air',
  sea: 'Sea',
  road: 'Road',
  rail: 'Rail',
};

const serviceLabels: Record<ServiceType, string> = {
  ftl: 'FTL',
  ltl: 'LTL',
  fcl: 'FCL',
  lcl: 'LCL',
  express: 'Express',
};

export function QuotationList({
  quotations,
  total,
  page,
  limit,
  hasMore,
  filters,
  onFilterChange,
  onPageChange,
  onSelectQuotation,
  onCreateQuotation,
  customers = [],
}: QuotationListProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = useCallback(
    (value: string) => {
      onFilterChange({ ...filters, search_query: value || undefined });
    },
    [filters, onFilterChange]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...filters,
        status: (value as QuotationStatus) || undefined,
      });
    },
    [filters, onFilterChange]
  );

  const handleTransportModeChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...filters,
        transport_mode: (value as TransportMode) || undefined,
      });
    },
    [filters, onFilterChange]
  );

  const handleServiceTypeChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...filters,
        service_type: (value as ServiceType) || undefined,
      });
    },
    [filters, onFilterChange]
  );

  const handleCustomerChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...filters,
        customer_id: value || undefined,
      });
    },
    [filters, onFilterChange]
  );

  const clearFilters = useCallback(() => {
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(v => v !== undefined && v !== '');
  }, [filters]);

  const totalPages = Math.ceil(total / limit);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quotations</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage freight quotations and track their status
          </p>
        </div>
        <button
          onClick={onCreateQuotation}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FileText className="w-4 h-4" />
          New Quotation
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by quote number, customer, cargo..."
              value={filters.search_query || ''}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {Object.values(filters).filter(v => v !== undefined && v !== '').length}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={e => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transport Mode
              </label>
              <select
                value={filters.transport_mode || ''}
                onChange={e => handleTransportModeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Modes</option>
                <option value="air">Air</option>
                <option value="sea">Sea</option>
                <option value="road">Road</option>
                <option value="rail">Rail</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type
              </label>
              <select
                value={filters.service_type || ''}
                onChange={e => handleServiceTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Services</option>
                <option value="ftl">FTL</option>
                <option value="ltl">LTL</option>
                <option value="fcl">FCL</option>
                <option value="lcl">LCL</option>
                <option value="express">Express</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <select
                value={filters.customer_id || ''}
                onChange={e => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Customers</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {quotations.length} of {total} quotations
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quote Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Until
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No quotations found. Create your first quotation to get started.
                  </td>
                </tr>
              ) : (
                quotations.map(quotation => (
                  <tr
                    key={quotation.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelectQuotation(quotation)}
                  >
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900">
                        {quotation.quote_number}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {quotation.customer_name || 'Unknown Customer'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {quotation.pol.code} → {quotation.pod.code}
                      </div>
                      <div className="text-xs text-gray-500">
                        {quotation.pol.name} → {quotation.pod.name}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">
                          {transportIcons[quotation.transport_mode]}
                        </span>
                        <span className="text-sm text-gray-700">
                          {transportLabels[quotation.transport_mode]}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({serviceLabels[quotation.service_type]})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(
                          quotation.pricing.total,
                          quotation.pricing.currency
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(quotation.valid_until)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[quotation.status].bg
                        } ${statusColors[quotation.status].text}`}
                      >
                        {quotation.status.charAt(0).toUpperCase() +
                          quotation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectQuotation(quotation);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={!hasMore}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
