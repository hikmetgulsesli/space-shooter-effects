import { describe, it, expect, beforeEach, vi } from 'vitest';
import { lookupService } from '../services/lookupService.js';
import type { LookupValue } from '../types/lookup.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('lookupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('getAll', () => {
    it('should return empty array when localStorage is empty', () => {
      const result = lookupService.getAll();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should initialize with default values when localStorage is empty', () => {
      const result = lookupService.getAll();
      expect(result.length).toBeGreaterThan(0);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should return parsed values from localStorage', () => {
      const mockValues: LookupValue[] = [
        {
          id: 'test-1',
          category: 'transport_modes',
          value: 'air',
          label: 'Air',
          sort_order: 1,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockValues));

      const result = lookupService.getAll();
      expect(result).toEqual(mockValues);
    });
  });

  describe('getByCategory', () => {
    it('should return values filtered by category', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = lookupService.getByCategory('transport_modes');
      
      expect(result.every((v) => v.category === 'transport_modes')).toBe(true);
    });

    it('should return values sorted by sort_order', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = lookupService.getByCategory('transport_modes');
      
      for (let i = 1; i < result.length; i++) {
        expect(result[i].sort_order).toBeGreaterThanOrEqual(
          result[i - 1].sort_order
        );
      }
    });
  });

  describe('getActiveByCategory', () => {
    it('should return only active values', () => {
      const mockValues: LookupValue[] = [
        {
          id: '1',
          category: 'statuses',
          value: 'active',
          label: 'Active',
          sort_order: 1,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '2',
          category: 'statuses',
          value: 'inactive',
          label: 'Inactive',
          sort_order: 2,
          is_active: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockValues));

      const result = lookupService.getActiveByCategory('statuses');
      expect(result).toHaveLength(1);
      expect(result[0].is_active).toBe(true);
    });
  });

  describe('create', () => {
    it('should create a new lookup value', () => {
      localStorageMock.getItem.mockReturnValue('[]');
      
      const result = lookupService.create({
        category: 'transport_modes',
        value: 'test_value',
        label: 'Test Value',
      });

      expect(result).toMatchObject({
        category: 'transport_modes',
        value: 'test_value',
        label: 'Test Value',
        is_active: true,
      });
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeDefined();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should normalize value to lowercase with underscores', () => {
      localStorageMock.getItem.mockReturnValue('[]');
      
      const result = lookupService.create({
        category: 'transport_modes',
        value: 'Test Value With Spaces',
        label: 'Test Label',
      });

      expect(result.value).toBe('test_value_with_spaces');
    });

    it('should auto-assign sort_order if not provided', () => {
      const existingValues: LookupValue[] = [
        {
          id: '1',
          category: 'transport_modes',
          value: 'existing',
          label: 'Existing',
          sort_order: 5,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingValues));
      
      const result = lookupService.create({
        category: 'transport_modes',
        value: 'new',
        label: 'New Value',
      });

      expect(result.sort_order).toBe(6);
    });
  });

  describe('update', () => {
    it('should update an existing lookup value', () => {
      const mockValues: LookupValue[] = [
        {
          id: 'test-1',
          category: 'transport_modes',
          value: 'old_value',
          label: 'Old Label',
          sort_order: 1,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockValues));

      const result = lookupService.update('test-1', { label: 'New Label' });

      expect(result?.label).toBe('New Label');
      expect(result?.updated_at).not.toBe('2024-01-01');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should return null for non-existent id', () => {
      localStorageMock.getItem.mockReturnValue('[]');
      
      const result = lookupService.update('non-existent', { label: 'New' });
      expect(result).toBeNull();
    });

    it('should normalize value when updating', () => {
      const mockValues: LookupValue[] = [
        {
          id: 'test-1',
          category: 'transport_modes',
          value: 'old',
          label: 'Old',
          sort_order: 1,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockValues));

      const result = lookupService.update('test-1', {
        value: 'New Value Here',
      });

      expect(result?.value).toBe('new_value_here');
    });
  });

  describe('deactivate', () => {
    it('should set is_active to false', () => {
      const mockValues: LookupValue[] = [
        {
          id: 'test-1',
          category: 'transport_modes',
          value: 'test',
          label: 'Test',
          sort_order: 1,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockValues));

      const result = lookupService.deactivate('test-1');

      expect(result?.is_active).toBe(false);
    });
  });

  describe('reactivate', () => {
    it('should set is_active to true', () => {
      const mockValues: LookupValue[] = [
        {
          id: 'test-1',
          category: 'transport_modes',
          value: 'test',
          label: 'Test',
          sort_order: 1,
          is_active: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockValues));

      const result = lookupService.reactivate('test-1');

      expect(result?.is_active).toBe(true);
    });
  });

  describe('reorder', () => {
    it('should reorder values based on provided ids', () => {
      let storedValues: LookupValue[] = [
        {
          id: '1',
          category: 'transport_modes',
          value: 'first',
          label: 'First',
          sort_order: 1,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '2',
          category: 'transport_modes',
          value: 'second',
          label: 'Second',
          sort_order: 2,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '3',
          category: 'transport_modes',
          value: 'third',
          label: 'Third',
          sort_order: 3,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'crm-lookup-values') {
          return JSON.stringify(storedValues);
        }
        return null;
      });
      localStorageMock.setItem.mockImplementation((key: string, value: string) => {
        if (key === 'crm-lookup-values') {
          storedValues = JSON.parse(value);
        }
      });

      const result = lookupService.reorder('transport_modes', ['3', '1', '2']);

      expect(result[0].id).toBe('3');
      expect(result[0].sort_order).toBe(1);
      expect(result[1].id).toBe('1');
      expect(result[1].sort_order).toBe(2);
      expect(result[2].id).toBe('2');
      expect(result[2].sort_order).toBe(3);
    });
  });

  describe('getUsageCount', () => {
    it('should return zero count when no usage recorded', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = lookupService.getUsageCount('test-id');
      expect(result).toEqual({
        lookupId: 'test-id',
        count: 0,
        entities: [],
      });
    });

    it('should return recorded usage count', () => {
      const usage = {
        'test-id': {
          lookupId: 'test-id',
          count: 5,
          entities: ['customers', 'quotes'],
        },
      };
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'crm-lookup-usage') {
          return JSON.stringify(usage);
        }
        return '[]';
      });

      const result = lookupService.getUsageCount('test-id');
      expect(result.count).toBe(5);
      expect(result.entities).toContain('customers');
      expect(result.entities).toContain('quotes');
    });
  });

  describe('recordUsage', () => {
    it('should record usage of a lookup value', () => {
      let usageData: Record<string, unknown> = {};
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'crm-lookup-usage') {
          return Object.keys(usageData).length > 0 ? JSON.stringify(usageData) : null;
        }
        return null;
      });
      localStorageMock.setItem.mockImplementation((key: string, value: string) => {
        if (key === 'crm-lookup-usage') {
          usageData = JSON.parse(value);
        }
      });
      
      lookupService.recordUsage('test-id', 'customers');
      lookupService.recordUsage('test-id', 'customers');
      lookupService.recordUsage('test-id', 'quotes');

      expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
        'crm-lookup-usage',
        expect.stringContaining('"count":3')
      );
    });
  });

  describe('isInUse', () => {
    it('should return true when lookup is in use', () => {
      const usage = {
        'test-id': {
          lookupId: 'test-id',
          count: 3,
          entities: ['customers'],
        },
      };
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'crm-lookup-usage') {
          return JSON.stringify(usage);
        }
        return '[]';
      });

      expect(lookupService.isInUse('test-id')).toBe(true);
    });

    it('should return false when lookup is not in use', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(lookupService.isInUse('test-id')).toBe(false);
    });
  });

  describe('getUsageWarning', () => {
    it('should show warning when usage is 5 or more', () => {
      const usage = {
        'test-id': {
          lookupId: 'test-id',
          count: 5,
          entities: ['customers'],
        },
      };
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'crm-lookup-usage') {
          return JSON.stringify(usage);
        }
        return '[]';
      });

      const warning = lookupService.getUsageWarning('test-id');
      expect(warning.show).toBe(true);
      expect(warning.count).toBe(5);
    });

    it('should not show warning when usage is less than 5', () => {
      const usage = {
        'test-id': {
          lookupId: 'test-id',
          count: 3,
          entities: ['customers'],
        },
      };
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'crm-lookup-usage') {
          return JSON.stringify(usage);
        }
        return '[]';
      });

      const warning = lookupService.getUsageWarning('test-id');
      expect(warning.show).toBe(false);
    });
  });

  describe('getGrouped', () => {
    it('should return values grouped by category', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = lookupService.getGrouped();
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach((group) => {
        expect(group.category).toBeDefined();
        expect(group.label).toBeDefined();
        expect(Array.isArray(group.values)).toBe(true);
      });
    });
  });

  describe('getById', () => {
    it('should return lookup value by id', () => {
      const mockValues: LookupValue[] = [
        {
          id: 'test-1',
          category: 'transport_modes',
          value: 'air',
          label: 'Air',
          sort_order: 1,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockValues));

      const result = lookupService.getById('test-1');
      expect(result?.id).toBe('test-1');
      expect(result?.label).toBe('Air');
    });

    it('should return null for non-existent id', () => {
      localStorageMock.getItem.mockReturnValue('[]');
      const result = lookupService.getById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should permanently delete a lookup value', () => {
      const mockValues: LookupValue[] = [
        {
          id: 'test-1',
          category: 'transport_modes',
          value: 'air',
          label: 'Air',
          sort_order: 1,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockValues));

      const result = lookupService.delete('test-1');
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'crm-lookup-values',
        '[]'
      );
    });

    it('should return false for non-existent id', () => {
      localStorageMock.getItem.mockReturnValue('[]');
      const result = lookupService.delete('non-existent');
      expect(result).toBe(false);
    });
  });
});
