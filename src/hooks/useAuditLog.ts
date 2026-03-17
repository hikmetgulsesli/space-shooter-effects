'use client';

import { useState, useCallback, useEffect } from 'react';
import { AuditLogAdminAPI } from '../services/auditLogService.js';
import type {
  AuditLog,
  AuditLogFilters,
  AuditLogPagination,
  AuditRecordType,
} from '../types/audit.js';
import type { UserRole } from '../types/dashboard.ts';

/**
 * Hook for accessing audit logs with admin-only enforcement
 * Returns null/error if user is not an admin
 */
export interface UseAuditLogOptions {
  role: UserRole;
  initialFilters?: AuditLogFilters;
  initialPagination?: AuditLogPagination;
  autoLoad?: boolean;
}

export interface UseAuditLogReturn {
  // Data
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  
  // State
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  
  // Actions
  loadLogs: () => void;
  refresh: () => void;
  nextPage: () => void;
  prevPage: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: AuditLogFilters) => void;
  clearFilters: () => void;
  getRecordHistory: (recordType: AuditRecordType, recordId: string) => AuditLog[];
  getUserHistory: (userId: string) => AuditLog[];
  getStats: () => ReturnType<typeof AuditLogAdminAPI.getStats>;
}

const DEFAULT_PAGINATION: AuditLogPagination = { page: 1, limit: 50 };

export function useAuditLog(options: UseAuditLogOptions): UseAuditLogReturn {
  const { role, initialFilters = {}, initialPagination, autoLoad = true } = options;
  
  // Admin check
  const isAdmin = role === 'admin';
  
  // State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPageState] = useState(initialPagination?.page || DEFAULT_PAGINATION.page);
  const [limit, setLimitState] = useState(initialPagination?.limit || DEFAULT_PAGINATION.limit);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AuditLogFilters>(initialFilters);

  // Load logs function
  const loadLogs = useCallback(() => {
    if (!isAdmin) {
      setError('Access denied: Admin role required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = AuditLogAdminAPI.query(filters, { page, limit });
      setLogs(result.logs);
      setTotal(result.total);
      setHasMore(result.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, filters, page, limit]);

  // Initial load
  useEffect(() => {
    if (autoLoad && isAdmin) {
      loadLogs();
    }
  }, [autoLoad, isAdmin, loadLogs]);

  // Refresh (reload current page)
  const refresh = useCallback(() => {
    loadLogs();
  }, [loadLogs]);

  // Pagination handlers
  const nextPage = useCallback(() => {
    if (hasMore) {
      setPageState(p => p + 1);
    }
  }, [hasMore]);

  const prevPage = useCallback(() => {
    setPageState(p => Math.max(1, p - 1));
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, newPage));
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(Math.max(1, newLimit));
    setPageState(1); // Reset to first page when changing limit
  }, []);

  // Filter handlers
  const setFilters = useCallback((newFilters: AuditLogFilters) => {
    setFiltersState(newFilters);
    setPageState(1); // Reset to first page when changing filters
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setPageState(1);
  }, []);

  // Additional query methods (admin-only)
  const getRecordHistory = useCallback((recordType: AuditRecordType, recordId: string): AuditLog[] => {
    if (!isAdmin) {
      setError('Access denied: Admin role required');
      return [];
    }
    return AuditLogAdminAPI.getRecordHistory(recordType, recordId);
  }, [isAdmin]);

  const getUserHistory = useCallback((userId: string): AuditLog[] => {
    if (!isAdmin) {
      setError('Access denied: Admin role required');
      return [];
    }
    return AuditLogAdminAPI.getUserHistory(userId);
  }, [isAdmin]);

  const getStats = useCallback((): ReturnType<typeof AuditLogAdminAPI.getStats> => {
    if (!isAdmin) {
      setError('Access denied: Admin role required');
      return { total: 0, by_action: { create: 0, update: 0, delete: 0, transfer: 0 }, by_record_type: {} };
    }
    return AuditLogAdminAPI.getStats();
  }, [isAdmin]);

  // Reload when pagination changes
  useEffect(() => {
    if (isAdmin && autoLoad) {
      loadLogs();
    }
  }, [page, limit, filters, isAdmin, autoLoad, loadLogs]);

  return {
    logs,
    total,
    page,
    limit,
    hasMore,
    isLoading,
    error,
    isAdmin,
    loadLogs,
    refresh,
    nextPage,
    prevPage,
    setPage,
    setLimit,
    setFilters,
    clearFilters,
    getRecordHistory,
    getUserHistory,
    getStats,
  };
}

export default useAuditLog;
