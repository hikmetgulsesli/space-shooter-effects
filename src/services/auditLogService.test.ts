import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditLogService, AuditLogAdminAPI } from '../services/auditLogService.js';
import type { AuditLog, AuditLogInput } from '../types/audit.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock crypto.randomUUID
const mockUUIDs = ['log-1', 'log-2', 'log-3', 'log-4', 'log-5'];
let uuidIndex = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => mockUUIDs[uuidIndex++] || `log-${uuidIndex}`,
  },
});

describe('AuditLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uuidIndex = 0;
  });

  describe('create', () => {
    it('should create an audit log entry', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const input: AuditLogInput = {
        user_id: 'user-1',
        user_name: 'John Doe',
        record_type: 'customer',
        record_id: 'cust-1',
        action: 'create',
        changes: [{ field: 'name', oldValue: null, newValue: 'Acme Corp' }],
      };

      const result = AuditLogService.create(input);

      expect(result.id).toBe('log-1');
      expect(result.user_id).toBe('user-1');
      expect(result.record_type).toBe('customer');
      expect(result.action).toBe('create');
      expect(result.changes).toHaveLength(1);
      expect(result.timestamp).toBeDefined();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should append to existing logs', () => {
      const existingLog: AuditLog = {
        id: 'existing-1',
        user_id: 'user-1',
        record_type: 'customer',
        record_id: 'cust-1',
        action: 'create',
        changes: [],
        timestamp: '2024-01-01T00:00:00Z',
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify([existingLog]));

      const input: AuditLogInput = {
        user_id: 'user-2',
        user_name: 'Jane Doe',
        record_type: 'quote',
        record_id: 'quote-1',
        action: 'update',
        changes: [{ field: 'amount', oldValue: 100, newValue: 200 }],
      };

      AuditLogService.create(input);

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(2);
      expect(savedData[0].id).toBe('existing-1');
      expect(savedData[1].id).toBe('log-1');
    });
  });

  describe('getById', () => {
    it('should return null when log not found', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
      const result = AuditLogService.getById('nonexistent');
      expect(result).toBeNull();
    });

    it('should return the correct log', () => {
      const logs: AuditLog[] = [
        { id: 'log-1', user_id: 'user-1', record_type: 'customer', record_id: 'cust-1', action: 'create', changes: [], timestamp: '2024-01-01T00:00:00Z' },
        { id: 'log-2', user_id: 'user-2', record_type: 'quote', record_id: 'quote-1', action: 'update', changes: [], timestamp: '2024-01-02T00:00:00Z' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(logs));

      const result = AuditLogService.getById('log-2');

      expect(result).not.toBeNull();
      expect(result?.record_type).toBe('quote');
    });
  });

  describe('query', () => {
    const mockLogs: AuditLog[] = [
      { id: '1', user_id: 'user-1', user_name: 'John', record_type: 'customer', record_id: 'cust-1', action: 'create', changes: [], timestamp: '2024-03-01T10:00:00Z' },
      { id: '2', user_id: 'user-2', user_name: 'Jane', record_type: 'quote', record_id: 'quote-1', action: 'update', changes: [], timestamp: '2024-03-02T10:00:00Z' },
      { id: '3', user_id: 'user-1', user_name: 'John', record_type: 'customer', record_id: 'cust-2', action: 'delete', changes: [], timestamp: '2024-03-03T10:00:00Z' },
      { id: '4', user_id: 'user-3', user_name: 'Bob', record_type: 'activity', record_id: 'act-1', action: 'create', changes: [], timestamp: '2024-03-04T10:00:00Z' },
      { id: '5', user_id: 'user-1', user_name: 'John', record_type: 'customer', record_id: 'cust-1', action: 'update', changes: [], timestamp: '2024-03-05T10:00:00Z' },
    ];

    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLogs));
    });

    it('should return all logs with default pagination', () => {
      const result = AuditLogService.query();

      expect(result.logs).toHaveLength(5);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.has_more).toBe(false);
    });

    it('should filter by user_id', () => {
      const result = AuditLogService.query({ user_id: 'user-1' });

      expect(result.logs).toHaveLength(3);
      expect(result.logs.every(log => log.user_id === 'user-1')).toBe(true);
    });

    it('should filter by record_type', () => {
      const result = AuditLogService.query({ record_type: 'customer' });

      expect(result.logs).toHaveLength(3);
      expect(result.logs.every(log => log.record_type === 'customer')).toBe(true);
    });

    it('should filter by record_id', () => {
      const result = AuditLogService.query({ record_id: 'cust-1' });

      expect(result.logs).toHaveLength(2);
      expect(result.logs.every(log => log.record_id === 'cust-1')).toBe(true);
    });

    it('should filter by action', () => {
      const result = AuditLogService.query({ action: 'create' });

      expect(result.logs).toHaveLength(2);
      expect(result.logs.every(log => log.action === 'create')).toBe(true);
    });

    it('should filter by date range', () => {
      const result = AuditLogService.query({
        from_date: '2024-03-02T00:00:00Z',
        to_date: '2024-03-04T00:00:00Z',
      });

      expect(result.logs).toHaveLength(2);
    });

    it('should filter by search query', () => {
      const result = AuditLogService.query({ search_query: 'John' });

      expect(result.logs).toHaveLength(3);
    });

    it('should paginate results', () => {
      const result = AuditLogService.query({}, { page: 1, limit: 2 });

      expect(result.logs).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.has_more).toBe(true);
    });

    it('should sort by timestamp descending', () => {
      const result = AuditLogService.query();

      expect(result.logs[0].timestamp).toBe('2024-03-05T10:00:00Z');
      expect(result.logs[4].timestamp).toBe('2024-03-01T10:00:00Z');
    });
  });

  describe('getRecordHistory', () => {
    it('should return all logs for a specific record', () => {
      const logs: AuditLog[] = [
        { id: '1', user_id: 'user-1', record_type: 'customer', record_id: 'cust-1', action: 'create', changes: [], timestamp: '2024-03-01T00:00:00Z' },
        { id: '2', user_id: 'user-1', record_type: 'customer', record_id: 'cust-1', action: 'update', changes: [], timestamp: '2024-03-02T00:00:00Z' },
        { id: '3', user_id: 'user-2', record_type: 'quote', record_id: 'quote-1', action: 'create', changes: [], timestamp: '2024-03-03T00:00:00Z' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(logs));

      const result = AuditLogService.getRecordHistory('customer', 'cust-1');

      expect(result).toHaveLength(2);
      expect(result[0].action).toBe('update'); // Most recent first
      expect(result[1].action).toBe('create');
    });
  });

  describe('getUserHistory', () => {
    it('should return all logs for a specific user', () => {
      const logs: AuditLog[] = [
        { id: '1', user_id: 'user-1', record_type: 'customer', record_id: 'cust-1', action: 'create', changes: [], timestamp: '2024-03-01T00:00:00Z' },
        { id: '2', user_id: 'user-2', record_type: 'customer', record_id: 'cust-2', action: 'create', changes: [], timestamp: '2024-03-02T00:00:00Z' },
        { id: '3', user_id: 'user-1', record_type: 'quote', record_id: 'quote-1', action: 'update', changes: [], timestamp: '2024-03-03T00:00:00Z' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(logs));

      const result = AuditLogService.getUserHistory('user-1');

      expect(result).toHaveLength(2);
    });
  });

  describe('clearAll', () => {
    it('should remove all audit logs', () => {
      AuditLogService.clearAll();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('crm_audit_logs');
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const logs: AuditLog[] = [
        { id: '1', user_id: 'user-1', record_type: 'customer', record_id: 'cust-1', action: 'create', changes: [], timestamp: '2024-03-01T00:00:00Z' },
        { id: '2', user_id: 'user-1', record_type: 'customer', record_id: 'cust-2', action: 'update', changes: [], timestamp: '2024-03-02T00:00:00Z' },
        { id: '3', user_id: 'user-1', record_type: 'quote', record_id: 'quote-1', action: 'delete', changes: [], timestamp: '2024-03-03T00:00:00Z' },
        { id: '4', user_id: 'user-1', record_type: 'quote', record_id: 'quote-2', action: 'create', changes: [], timestamp: '2024-03-04T00:00:00Z' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(logs));

      const stats = AuditLogService.getStats();

      expect(stats.total).toBe(4);
      expect(stats.by_action.create).toBe(2);
      expect(stats.by_action.update).toBe(1);
      expect(stats.by_action.delete).toBe(1);
      expect(stats.by_action.transfer).toBe(0);
      expect(stats.by_record_type.customer).toBe(2);
      expect(stats.by_record_type.quote).toBe(2);
    });
  });

  describe('computeDiff', () => {
    it('should return empty array for identical objects', () => {
      const oldObj = { name: 'John', age: 30 };
      const newObj = { name: 'John', age: 30 };

      const result = AuditLogService.computeDiff(oldObj, newObj);

      expect(result).toHaveLength(0);
    });

    it('should detect changed fields', () => {
      const oldObj = { name: 'John', age: 30 };
      const newObj = { name: 'Jane', age: 30 };

      const result = AuditLogService.computeDiff(oldObj, newObj);

      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('name');
      expect(result[0].oldValue).toBe('John');
      expect(result[0].newValue).toBe('Jane');
    });

    it('should detect added fields', () => {
      const oldObj = { name: 'John' };
      const newObj = { name: 'John', age: 30 };

      const result = AuditLogService.computeDiff(oldObj, newObj);

      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('age');
      expect(result[0].oldValue).toBeUndefined();
      expect(result[0].newValue).toBe(30);
    });

    it('should detect removed fields', () => {
      const oldObj = { name: 'John', age: 30 };
      const newObj = { name: 'John' };

      const result = AuditLogService.computeDiff(oldObj, newObj);

      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('age');
      expect(result[0].oldValue).toBe(30);
      expect(result[0].newValue).toBeUndefined();
    });

    it('should handle null objects', () => {
      const result1 = AuditLogService.computeDiff(null, { name: 'John' });
      expect(result1).toHaveLength(1);
      expect(result1[0].field).toBe('name');

      const result2 = AuditLogService.computeDiff({ name: 'John' }, null);
      expect(result2).toHaveLength(1);
      expect(result2[0].field).toBe('name');
    });

    it('should deep compare arrays', () => {
      const oldObj = { tags: ['a', 'b'] };
      const newObj = { tags: ['a', 'c'] };

      const result = AuditLogService.computeDiff(oldObj, newObj);

      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('tags');
    });

    it('should deep compare nested objects', () => {
      const oldObj = { address: { city: 'NYC', zip: '10001' } };
      const newObj = { address: { city: 'LA', zip: '10001' } };

      const result = AuditLogService.computeDiff(oldObj, newObj);

      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('address');
    });
  });

  describe('logCreate', () => {
    it('should log create action with all fields', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const newData = { id: 'cust-1', name: 'Acme', email: 'test@example.com' };

      const result = AuditLogService.logCreate(
        'user-1',
        'John Doe',
        'customer',
        'cust-1',
        newData
      );

      expect(result.action).toBe('create');
      expect(result.changes).toHaveLength(3);
      expect(result.changes.every(c => c.oldValue === null)).toBe(true);
    });
  });

  describe('logUpdate', () => {
    it('should log update action with only changed fields', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const oldData = { id: 'cust-1', name: 'Acme', email: 'old@example.com' };
      const newData = { id: 'cust-1', name: 'Acme Corp', email: 'old@example.com' };

      const result = AuditLogService.logUpdate(
        'user-1',
        'John Doe',
        'customer',
        'cust-1',
        oldData,
        newData
      );

      expect(result).not.toBeNull();
      expect(result?.action).toBe('update');
      expect(result?.changes).toHaveLength(1);
      expect(result?.changes[0].field).toBe('name');
    });

    it('should return null if no changes', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const data = { id: 'cust-1', name: 'Acme' };

      const result = AuditLogService.logUpdate(
        'user-1',
        'John Doe',
        'customer',
        'cust-1',
        data,
        data
      );

      expect(result).toBeNull();
    });
  });

  describe('logDelete', () => {
    it('should log delete action with all fields', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const deletedData = { id: 'cust-1', name: 'Acme', email: 'test@example.com' };

      const result = AuditLogService.logDelete(
        'user-1',
        'John Doe',
        'customer',
        'cust-1',
        deletedData
      );

      expect(result.action).toBe('delete');
      expect(result.changes).toHaveLength(3);
      expect(result.changes.every(c => c.newValue === null)).toBe(true);
    });
  });

  describe('logTransfer', () => {
    it('should log transfer action with from/to info', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const result = AuditLogService.logTransfer(
        'user-1',
        'John Doe',
        'card',
        'card-1',
        'col-1',
        'col-2'
      );

      expect(result.action).toBe('transfer');
      expect(result.changes).toHaveLength(2);
      expect(result.metadata).toEqual({ from_id: 'col-1', to_id: 'col-2' });
    });
  });
});

describe('AuditLogAdminAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should proxy query to AuditLogService', () => {
    const logs: AuditLog[] = [
      { id: '1', user_id: 'user-1', record_type: 'customer', record_id: 'cust-1', action: 'create', changes: [], timestamp: '2024-03-01T00:00:00Z' },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(logs));

    const result = AuditLogAdminAPI.query();

    expect(result.logs).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should proxy getRecordHistory to AuditLogService', () => {
    const logs: AuditLog[] = [
      { id: '1', user_id: 'user-1', record_type: 'customer', record_id: 'cust-1', action: 'create', changes: [], timestamp: '2024-03-01T00:00:00Z' },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(logs));

    const result = AuditLogAdminAPI.getRecordHistory('customer', 'cust-1');

    expect(result).toHaveLength(1);
  });

  it('should proxy getUserHistory to AuditLogService', () => {
    const logs: AuditLog[] = [
      { id: '1', user_id: 'user-1', record_type: 'customer', record_id: 'cust-1', action: 'create', changes: [], timestamp: '2024-03-01T00:00:00Z' },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(logs));

    const result = AuditLogAdminAPI.getUserHistory('user-1');

    expect(result).toHaveLength(1);
  });

  it('should proxy getStats to AuditLogService', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

    const result = AuditLogAdminAPI.getStats();

    expect(result.total).toBe(0);
    expect(result.by_action.create).toBe(0);
  });

  it('should proxy clearAll to AuditLogService', () => {
    AuditLogAdminAPI.clearAll();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('crm_audit_logs');
  });
});
