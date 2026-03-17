'use client';

import React from 'react';
import { useAuditLog } from '../../hooks/useAuditLog.js';
import type { UserRole } from '../../types/dashboard.ts';
import type { AuditAction, AuditRecordType } from '../../types/audit.js';
import { 
  Shield, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowRightLeft,
  User,
  Calendar,
  FileText,
} from 'lucide-react';

interface AuditLogViewerProps {
  userRole: UserRole;
}

const actionIcons: Record<AuditAction, React.ReactNode> = {
  create: <Plus className="w-4 h-4 text-green-600" />,
  update: <Edit className="w-4 h-4 text-blue-600" />,
  delete: <Trash2 className="w-4 h-4 text-red-600" />,
  transfer: <ArrowRightLeft className="w-4 h-4 text-purple-600" />,
};

const actionLabels: Record<AuditAction, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  transfer: 'Transferred',
};

export function AuditLogViewer({ userRole }: AuditLogViewerProps) {
  const {
    logs,
    total,
    page,
    limit,
    hasMore,
    isLoading,
    error,
    isAdmin,
    refresh,
    nextPage,
    prevPage,
    setFilters,
    clearFilters,
    getStats,
  } = useAuditLog({ role: userRole });

  // Stats
  const [stats, setStats] = React.useState<ReturnType<typeof getStats> | null>(null);
  
  React.useEffect(() => {
    if (isAdmin) {
      setStats(getStats());
    }
  }, [isAdmin, getStats, logs]);

  // Filter state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedAction, setSelectedAction] = React.useState<AuditAction | ''>('');
  const [selectedRecordType, setSelectedRecordType] = React.useState<AuditRecordType | ''>('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);

  // Apply filters
  const handleApplyFilters = () => {
    setFilters({
      search_query: searchQuery || undefined,
      action: selectedAction || undefined,
      record_type: selectedRecordType || undefined,
      from_date: dateFrom || undefined,
      to_date: dateTo || undefined,
    });
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedAction('');
    setSelectedRecordType('');
    setDateFrom('');
    setDateTo('');
    clearFilters();
  };

  // Format timestamp
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format field change
  const formatChange = (change: { field: string; oldValue: unknown; newValue: unknown }) => {
    if (change.oldValue === null && change.newValue !== null) {
      return `Added ${change.field}: ${JSON.stringify(change.newValue)}`;
    }
    if (change.oldValue !== null && change.newValue === null) {
      return `Removed ${change.field}: ${JSON.stringify(change.oldValue)}`;
    }
    return `Changed ${change.field}: ${JSON.stringify(change.oldValue)} → ${JSON.stringify(change.newValue)}`;
  };

  // Non-admin access denied
  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Access Denied</h3>
            <p className="text-red-700">You need admin privileges to view the audit log.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
          <p className="text-gray-500">Track all changes across the system</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium flex items-center gap-1">
            <Shield className="w-4 h-4" />
            Admin Only
          </span>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Entries</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.by_action.create}</div>
            <div className="text-sm text-gray-500">Created</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.by_action.update}</div>
            <div className="text-sm text-gray-500">Updated</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">{stats.by_action.delete}</div>
            <div className="text-sm text-gray-500">Deleted</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Action */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value as AuditAction | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              {/* Record Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
                <select
                  value={selectedRecordType}
                  onChange={(e) => setSelectedRecordType(e.target.value as AuditRecordType | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All Types</option>
                  <option value="customer">Customer</option>
                  <option value="activity">Activity</option>
                  <option value="quote">Quote</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="user">User</option>
                  <option value="board">Board</option>
                  <option value="card">Card</option>
                  <option value="column">Column</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading audit logs...</p>
        </div>
      )}

      {/* Logs Table */}
      {!isLoading && logs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {actionIcons[log.action]}
                        <span className="text-sm font-medium text-gray-900">
                          {actionLabels[log.action]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {log.record_type.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-gray-500">{log.record_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {log.user_name || log.user_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 max-w-md">
                        {log.changes.length === 0 ? (
                          <span className="text-gray-400 italic">No field changes</span>
                        ) : log.changes.length === 1 ? (
                          formatChange(log.changes[0])
                        ) : (
                          <details className="cursor-pointer">
                            <summary className="text-purple-600 hover:text-purple-700">
                              {log.changes.length} field changes
                            </summary>
                            <ul className="mt-2 space-y-1 text-xs">
                              {log.changes.map((change, idx) => (
                                <li key={idx}>{formatChange(change)}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Page {page}
              </span>
              <button
                onClick={nextPage}
                disabled={!hasMore}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && logs.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No audit logs found</h3>
          <p className="text-gray-500">
            {total === 0 
              ? "No audit logs have been recorded yet."
              : "No logs match your current filters."}
          </p>
        </div>
      )}
    </div>
  );
}

export default AuditLogViewer;
