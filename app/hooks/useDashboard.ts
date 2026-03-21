'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardData, DashboardMetrics, FollowUp, CustomerToCall, Quote, RecentActivity, User, UserRole, hasPermission } from '../types/dashboard';
import { DashboardService } from '../services/dashboardService';

interface UseDashboardReturn {
  // Data
  user: User | null;
  metrics: DashboardMetrics | null;
  upcomingFollowUps: FollowUp[];
  customersToCall: CustomerToCall[];
  pendingQuotes: Quote[];
  recentActivities: RecentActivity[];
  
  // Loading state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshData: () => void;
  completeFollowUp: (id: string) => void;
  switchRole: (role: UserRole) => void;
  
  // Permission check
  canAccess: (requiredRole: UserRole) => boolean;
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      const dashboardData = DashboardService.getDashboardData();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = useCallback(() => {
    try {
      setIsLoading(true);
      const freshData = DashboardService.refreshData();
      setData(freshData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeFollowUp = useCallback((id: string) => {
    try {
      DashboardService.completeFollowUp(id);
      // Reload data
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete follow-up');
    }
  }, [loadData]);

  const switchRole = useCallback((role: UserRole) => {
    try {
      const currentUser = DashboardService.getUser();
      const updatedUser = { ...currentUser, role };
      DashboardService.setUser(updatedUser);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch role');
    }
  }, [loadData]);

  const canAccess = useCallback((requiredRole: UserRole): boolean => {
    if (!data?.user) return false;
    return hasPermission(data.user.role, requiredRole);
  }, [data?.user]);

  return {
    user: data?.user ?? null,
    metrics: data?.metrics ?? null,
    upcomingFollowUps: data?.upcomingFollowUps ?? [],
    customersToCall: data?.customersToCall ?? [],
    pendingQuotes: data?.pendingQuotes ?? [],
    recentActivities: data?.recentActivities ?? [],
    isLoading,
    error,
    refreshData,
    completeFollowUp,
    switchRole,
    canAccess,
  };
}
