// User roles for role-based access control
export type UserRole = 'admin' | 'sales_rep' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard metrics
export interface DashboardMetrics {
  weeklyQuotes: number;
  monthlyQuotes: number;
  winRate: number; // percentage
  contactedCustomers: number;
  pendingQuotes: number;
  completedActivities: number;
}

// Quote status
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface Quote {
  id: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Follow-up item
export interface FollowUp {
  id: string;
  customer_id: string;
  customer_name: string;
  due_date: string;
  type: 'call' | 'email' | 'meeting';
  notes?: string;
  completed: boolean;
}

// Customer to call
export interface CustomerToCall {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  last_contact_date?: string;
  priority: 'high' | 'medium' | 'low';
}

// Recent activity summary
export interface RecentActivity {
  id: string;
  type: 'phone' | 'email' | 'meeting' | 'video' | 'quote_sent' | 'quote_accepted';
  customer_name: string;
  description: string;
  date: string;
  outcome?: 'positive' | 'neutral' | 'negative';
}

// Dashboard data
export interface DashboardData {
  user: User;
  metrics: DashboardMetrics;
  upcomingFollowUps: FollowUp[];
  customersToCall: CustomerToCall[];
  pendingQuotes: Quote[];
  recentActivities: RecentActivity[];
}

// Widget visibility based on role
export interface WidgetVisibility {
  metrics: boolean;
  upcomingFollowUps: boolean;
  customersToCall: boolean;
  pendingQuotes: boolean;
  recentActivities: boolean;
}

// Permission check
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    manager: 2,
    sales_rep: 1,
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
