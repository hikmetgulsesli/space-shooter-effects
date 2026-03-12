import { describe, it, expect } from 'vitest';
import { hasPermission, UserRole } from '../types/dashboard';

describe('hasPermission', () => {
  it('should allow admin to access everything', () => {
    expect(hasPermission('admin', 'sales_rep')).toBe(true);
    expect(hasPermission('admin', 'manager')).toBe(true);
    expect(hasPermission('admin', 'admin')).toBe(true);
  });

  it('should allow manager to access manager and sales_rep resources', () => {
    expect(hasPermission('manager', 'sales_rep')).toBe(true);
    expect(hasPermission('manager', 'manager')).toBe(true);
    expect(hasPermission('manager', 'admin')).toBe(false);
  });

  it('should only allow sales_rep to access sales_rep resources', () => {
    expect(hasPermission('sales_rep', 'sales_rep')).toBe(true);
    expect(hasPermission('sales_rep', 'manager')).toBe(false);
    expect(hasPermission('sales_rep', 'admin')).toBe(false);
  });
});
