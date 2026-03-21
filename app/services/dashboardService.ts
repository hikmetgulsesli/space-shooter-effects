import { DashboardData, DashboardMetrics, FollowUp, CustomerToCall, Quote, RecentActivity, User, UserRole } from '../types/dashboard';

const STORAGE_KEYS = {
  USER: 'crm_user',
  DASHBOARD_DATA: 'crm_dashboard_data',
  QUOTES: 'crm_quotes',
  FOLLOW_UPS: 'crm_follow_ups',
  ACTIVITIES: 'crm_activities',
  CUSTOMERS: 'crm_customers',
};

// Default mock user
const DEFAULT_USER: User = {
  id: 'user-001',
  name: 'John Salesman',
  email: 'john@company.com',
  role: 'sales_rep',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Generate mock data for development
function generateMockDashboardData(user: User): DashboardData {
  const now = new Date();
  
  // Mock upcoming follow-ups
  const upcomingFollowUps: FollowUp[] = [
    {
      id: 'fu-001',
      customer_id: 'cust-001',
      customer_name: 'Acme Corporation',
      due_date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      type: 'call',
      notes: 'Follow up on proposal',
      completed: false,
    },
    {
      id: 'fu-002',
      customer_id: 'cust-002',
      customer_name: 'TechStart Inc',
      due_date: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      type: 'email',
      completed: false,
    },
    {
      id: 'fu-003',
      customer_id: 'cust-003',
      customer_name: 'Global Solutions',
      due_date: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
      type: 'meeting',
      notes: 'Quarterly review',
      completed: false,
    },
  ];

  // Mock customers to call
  const customersToCall: CustomerToCall[] = [
    {
      id: 'cust-004',
      name: 'Sarah Johnson',
      company: 'Johnson Consulting',
      phone: '+1 (555) 123-4567',
      last_contact_date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
    },
    {
      id: 'cust-005',
      name: 'Mike Chen',
      company: 'Chen Enterprises',
      phone: '+1 (555) 987-6543',
      last_contact_date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
    },
    {
      id: 'cust-006',
      name: 'Emily Davis',
      company: 'Davis & Co',
      priority: 'low',
    },
  ];

  // Mock pending quotes
  const pendingQuotes: Quote[] = [
    {
      id: 'quote-001',
      customer_id: 'cust-001',
      customer_name: 'Acme Corporation',
      amount: 15000,
      status: 'sent',
      created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: user.id,
    },
    {
      id: 'quote-002',
      customer_id: 'cust-007',
      customer_name: 'Bright Future LLC',
      amount: 8500,
      status: 'draft',
      created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: user.id,
    },
    {
      id: 'quote-003',
      customer_id: 'cust-002',
      customer_name: 'TechStart Inc',
      amount: 23000,
      status: 'sent',
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: user.id,
    },
  ];

  // Mock recent activities
  const recentActivities: RecentActivity[] = [
    {
      id: 'act-001',
      type: 'phone',
      customer_name: 'Acme Corporation',
      description: 'Discussed proposal details',
      date: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      outcome: 'positive',
    },
    {
      id: 'act-002',
      type: 'quote_sent',
      customer_name: 'TechStart Inc',
      description: 'Sent quote for $23,000',
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-003',
      type: 'email',
      customer_name: 'Sarah Johnson',
      description: 'Follow-up on previous meeting',
      date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      outcome: 'neutral',
    },
    {
      id: 'act-004',
      type: 'meeting',
      customer_name: 'Global Solutions',
      description: 'Quarterly business review',
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      outcome: 'positive',
    },
    {
      id: 'act-005',
      type: 'quote_accepted',
      customer_name: 'Bright Future LLC',
      description: 'Quote accepted for $12,000',
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Calculate metrics
  const metrics: DashboardMetrics = {
    weeklyQuotes: 8,
    monthlyQuotes: 32,
    winRate: 65,
    contactedCustomers: 24,
    pendingQuotes: pendingQuotes.length,
    completedActivities: 47,
  };

  return {
    user,
    metrics,
    upcomingFollowUps,
    customersToCall,
    pendingQuotes,
    recentActivities,
  };
}

export class DashboardService {
  // Get current user
  static getUser(): User {
    if (typeof window === 'undefined') return DEFAULT_USER;
    
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (data) {
      return JSON.parse(data);
    }
    
    // Initialize with default user
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  }

  // Set current user (for role switching)
  static setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  // Get dashboard data
  static getDashboardData(): DashboardData {
    if (typeof window === 'undefined') {
      return generateMockDashboardData(DEFAULT_USER);
    }

    const user = this.getUser();
    const data = localStorage.getItem(STORAGE_KEYS.DASHBOARD_DATA);
    
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure user matches
      return { ...parsed, user };
    }

    // Generate mock data
    const mockData = generateMockDashboardData(user);
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_DATA, JSON.stringify(mockData));
    return mockData;
  }

  // Update dashboard data
  static updateDashboardData(data: Partial<DashboardData>): DashboardData {
    if (typeof window === 'undefined') {
      return generateMockDashboardData(DEFAULT_USER);
    }

    const current = this.getDashboardData();
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_DATA, JSON.stringify(updated));
    return updated;
  }

  // Get metrics
  static getMetrics(): DashboardMetrics {
    return this.getDashboardData().metrics;
  }

  // Get upcoming follow-ups
  static getUpcomingFollowUps(): FollowUp[] {
    return this.getDashboardData().upcomingFollowUps;
  }

  // Get customers to call
  static getCustomersToCall(): CustomerToCall[] {
    return this.getDashboardData().customersToCall;
  }

  // Get pending quotes
  static getPendingQuotes(): Quote[] {
    return this.getDashboardData().pendingQuotes;
  }

  // Get recent activities
  static getRecentActivities(): RecentActivity[] {
    return this.getDashboardData().recentActivities;
  }

  // Mark follow-up as complete
  static completeFollowUp(followUpId: string): boolean {
    const data = this.getDashboardData();
    const updated = data.upcomingFollowUps.map(fu =>
      fu.id === followUpId ? { ...fu, completed: true } : fu
    );
    this.updateDashboardData({ upcomingFollowUps: updated });
    return true;
  }

  // Add custom activity
  static addActivity(activity: RecentActivity): void {
    const data = this.getDashboardData();
    const updated = [activity, ...data.recentActivities];
    this.updateDashboardData({ recentActivities: updated });
  }

  // Refresh data (clear cache and regenerate)
  static refreshData(): DashboardData {
    if (typeof window === 'undefined') {
      return generateMockDashboardData(DEFAULT_USER);
    }

    const user = this.getUser();
    const freshData = generateMockDashboardData(user);
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_DATA, JSON.stringify(freshData));
    return freshData;
  }
}
