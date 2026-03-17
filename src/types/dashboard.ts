/**
 * Dashboard Types
 * 
 * User roles and dashboard-related type definitions
 */

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

// Permission check
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    manager: 2,
    sales_rep: 1,
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
