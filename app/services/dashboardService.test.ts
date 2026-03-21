import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardService } from '../services/dashboardService';
import { User, DashboardData } from '../types/dashboard';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return default user when no user is stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const user = DashboardService.getUser();
      
      expect(user.role).toBe('sales_rep');
      expect(user.name).toBe('John Salesman');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should return stored user when available', () => {
      const mockUser: User = {
        id: 'test-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'manager',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      
      const user = DashboardService.getUser();
      
      expect(user.id).toBe('test-123');
      expect(user.role).toBe('manager');
    });
  });

  describe('setUser', () => {
    it('should store user in localStorage', () => {
      const mockUser: User = {
        id: 'test-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      DashboardService.setUser(mockUser);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'crm_user',
        JSON.stringify(mockUser)
      );
    });
  });

  describe('getDashboardData', () => {
    it('should return mock data structure with required fields', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const data = DashboardService.getDashboardData();
      
      expect(data.user).toBeDefined();
      expect(data.metrics).toBeDefined();
      expect(data.upcomingFollowUps).toBeInstanceOf(Array);
      expect(data.customersToCall).toBeInstanceOf(Array);
      expect(data.pendingQuotes).toBeInstanceOf(Array);
      expect(data.recentActivities).toBeInstanceOf(Array);
    });

    it('should have valid metrics', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const data = DashboardService.getDashboardData();
      
      expect(data.metrics.weeklyQuotes).toBeGreaterThanOrEqual(0);
      expect(data.metrics.monthlyQuotes).toBeGreaterThanOrEqual(0);
      expect(data.metrics.winRate).toBeGreaterThanOrEqual(0);
      expect(data.metrics.winRate).toBeLessThanOrEqual(100);
      expect(data.metrics.contactedCustomers).toBeGreaterThanOrEqual(0);
      expect(data.metrics.pendingQuotes).toBeGreaterThanOrEqual(0);
      expect(data.metrics.completedActivities).toBeGreaterThanOrEqual(0);
    });
  });

  describe('completeFollowUp', () => {
    it('should mark follow-up as complete', () => {
      const mockData: DashboardData = {
        user: {
          id: 'user-001',
          name: 'Test User',
          email: 'test@example.com',
          role: 'sales_rep',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        metrics: {
          weeklyQuotes: 5,
          monthlyQuotes: 20,
          winRate: 60,
          contactedCustomers: 10,
          pendingQuotes: 3,
          completedActivities: 15,
        },
        upcomingFollowUps: [
          {
            id: 'fu-001',
            customer_id: 'cust-001',
            customer_name: 'Test Customer',
            due_date: new Date().toISOString(),
            type: 'call',
            completed: false,
          },
        ],
        customersToCall: [],
        pendingQuotes: [],
        recentActivities: [],
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
      
      const result = DashboardService.completeFollowUp('fu-001');
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});
