'use client';

import React from 'react';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  BarChart3,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { MetricCard } from '../components/MetricCard';
import { UpcomingFollowUpsWidget } from '../components/UpcomingFollowUpsWidget';
import { CustomersToCallWidget } from '../components/CustomersToCallWidget';
import { PendingQuotesWidget } from '../components/PendingQuotesWidget';
import { RecentActivitiesWidget } from '../components/RecentActivitiesWidget';
import { RoleSwitcher } from '../components/RoleSwitcher';

export default function DashboardPage() {
  const {
    user,
    metrics,
    upcomingFollowUps,
    customersToCall,
    pendingQuotes,
    recentActivities,
    isLoading,
    error,
    refreshData,
    completeFollowUp,
    switchRole,
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dashboard</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sales Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 capitalize">
                Role: <span className="font-medium text-gray-900">{user?.role.replace('_', ' ')}</span>
              </span>
              <button
                onClick={refreshData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Personal Metrics</h2>
          </div>
          
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <MetricCard
                title="Weekly Quotes"
                value={metrics.weeklyQuotes}
                subtitle="This week"
                trend="up"
                trendValue="+12% vs last week"
                icon={<FileText className="w-5 h-5" />}
                color="blue"
              />
              <MetricCard
                title="Monthly Quotes"
                value={metrics.monthlyQuotes}
                subtitle="This month"
                trend="up"
                trendValue="+8% vs last month"
                icon={<FileText className="w-5 h-5" />}
                color="purple"
              />
              <MetricCard
                title="Win Rate"
                value={`${metrics.winRate}%`}
                subtitle="Quote acceptance rate"
                trend="neutral"
                trendValue="Same as last month"
                icon={<TrendingUp className="w-5 h-5" />}
                color="green"
              />
              <MetricCard
                title="Customers"
                value={metrics.contactedCustomers}
                subtitle="Contacted this month"
                trend="up"
                trendValue="+5 new"
                icon={<Users className="w-5 h-5" />}
                color="yellow"
              />
              <MetricCard
                title="Pending Quotes"
                value={metrics.pendingQuotes}
                subtitle="Awaiting response"
                trend="down"
                trendValue="-2 this week"
                icon={<FileText className="w-5 h-5" />}
                color="red"
              />
              <MetricCard
                title="Activities"
                value={metrics.completedActivities}
                subtitle="Completed this month"
                trend="up"
                trendValue="+15% vs last month"
                icon={<CheckCircle className="w-5 h-5" />}
                color="blue"
              />
            </div>
          )}
        </section>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Upcoming Follow-ups */}
          <UpcomingFollowUpsWidget
            followUps={upcomingFollowUps}
            onComplete={completeFollowUp}
          />

          {/* Customers to Call */}
          <CustomersToCallWidget
            customers={customersToCall}
          />

          {/* Pending Quotes */}
          <PendingQuotesWidget
            quotes={pendingQuotes}
          />

          {/* Recent Activities - spans full width on mobile, 2 cols on lg */}
          <div className="lg:col-span-2 xl:col-span-2">
            <RecentActivitiesWidget
              activities={recentActivities}
            />
          </div>

          {/* Role Switcher - Demo Feature */}
          <div className="xl:col-span-1">
            <RoleSwitcher
              currentRole={user?.role || 'sales_rep'}
              onRoleChange={switchRole}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
