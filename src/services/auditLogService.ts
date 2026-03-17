import type {
  AuditLog,
  AuditLogInput,
  AuditLogFilters,
  AuditLogPagination,
  AuditLogResult,
  AuditAction,
  AuditRecordType,
  FieldChange,
} from '../types/audit.js';

const STORAGE_KEY = 'crm_audit_logs';
const MAX_LOGS = 10000; // Keep last 10k logs to prevent storage bloat

/**
 * Service for managing audit logs with field-level diff tracking
 */
export class AuditLogService {
  /**
   * Get all audit logs from storage
   */
  private static getAllLogs(): AuditLog[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Save audit logs to storage
   */
  private static saveLogs(logs: AuditLog[]): void {
    if (typeof window === 'undefined') return;
    // Keep only the most recent MAX_LOGS
    const trimmed = logs.slice(-MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }

  /**
   * Create a new audit log entry
   */
  static create(input: AuditLogInput): AuditLog {
    const logs = this.getAllLogs();
    
    const now = new Date().toISOString();
    const auditLog: AuditLog = {
      ...input,
      id: crypto.randomUUID(),
      timestamp: now,
    };

    logs.push(auditLog);
    this.saveLogs(logs);

    return auditLog;
  }

  /**
   * Get a single audit log by ID
   */
  static getById(id: string): AuditLog | null {
    const logs = this.getAllLogs();
    return logs.find(log => log.id === id) || null;
  }

  /**
   * Query audit logs with filters and pagination
   * Admin-only access should be enforced at the API/UI layer
   */
  static query(
    filters: AuditLogFilters = {},
    pagination: AuditLogPagination = { page: 1, limit: 50 }
  ): AuditLogResult {
    let logs = this.getAllLogs();

    // Apply filters
    if (filters.user_id) {
      logs = logs.filter(log => log.user_id === filters.user_id);
    }

    if (filters.record_type) {
      logs = logs.filter(log => log.record_type === filters.record_type);
    }

    if (filters.record_id) {
      logs = logs.filter(log => log.record_id === filters.record_id);
    }

    if (filters.action) {
      logs = logs.filter(log => log.action === filters.action);
    }

    if (filters.from_date) {
      const fromDate = new Date(filters.from_date);
      logs = logs.filter(log => new Date(log.timestamp) >= fromDate);
    }

    if (filters.to_date) {
      const toDate = new Date(filters.to_date);
      logs = logs.filter(log => new Date(log.timestamp) <= toDate);
    }

    if (filters.search_query) {
      const query = filters.search_query.toLowerCase();
      logs = logs.filter(log =>
        log.user_name?.toLowerCase().includes(query) ||
        log.record_type.toLowerCase().includes(query) ||
        log.record_id.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        JSON.stringify(log.changes).toLowerCase().includes(query)
      );
    }

    // Sort by timestamp descending (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = logs.length;
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    const paginated = logs.slice(start, end);

    return {
      logs: paginated,
      total,
      page: pagination.page,
      limit: pagination.limit,
      has_more: end < total,
    };
  }

  /**
   * Get all logs for a specific record
   */
  static getRecordHistory(recordType: AuditRecordType, recordId: string): AuditLog[] {
    const logs = this.getAllLogs();
    return logs
      .filter(log => log.record_type === recordType && log.record_id === recordId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get all logs for a specific user
   */
  static getUserHistory(userId: string): AuditLog[] {
    const logs = this.getAllLogs();
    return logs
      .filter(log => log.user_id === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Clear all audit logs (admin only)
   */
  static clearAll(): boolean {
    if (typeof window === 'undefined') return false;
    localStorage.removeItem(STORAGE_KEY);
    return true;
  }

  /**
   * Get audit log statistics
   */
  static getStats(): {
    total: number;
    by_action: Record<AuditAction, number>;
    by_record_type: Record<string, number>;
  } {
    const logs = this.getAllLogs();
    
    const byAction: Record<AuditAction, number> = {
      create: 0,
      update: 0,
      delete: 0,
      transfer: 0,
    };

    const byRecordType: Record<string, number> = {};

    logs.forEach(log => {
      byAction[log.action]++;
      byRecordType[log.record_type] = (byRecordType[log.record_type] || 0) + 1;
    });

    return {
      total: logs.length,
      by_action: byAction,
      by_record_type: byRecordType,
    };
  }

  /**
   * Compute field-level diff between two objects
   */
  static computeDiff<T extends Record<string, unknown>>(
    oldObj: T | null,
    newObj: T | null
  ): FieldChange[] {
    const changes: FieldChange[] = [];
    
    if (!oldObj && !newObj) return changes;
    
    // All keys from both objects
    const allKeys = new Set([
      ...(oldObj ? Object.keys(oldObj) : []),
      ...(newObj ? Object.keys(newObj) : []),
    ]);

    for (const key of allKeys) {
      const oldValue = oldObj === null ? null : oldObj?.[key];
      const newValue = newObj === null ? null : newObj?.[key];

      // Deep compare for objects/arrays
      if (!this.isEqual(oldValue, newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue,
        });
      }
    }

    return changes;
  }

  /**
   * Deep equality check
   */
  private static isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    
    if (typeof a !== typeof b) return false;
    
    if (a === null || b === null) return a === b;
    
    if (typeof a !== 'object') return false;
    
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => this.isEqual(item, b[index]));
    }
    
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);
    
    if (aKeys.length !== bKeys.length) return false;
    
    return aKeys.every(key => this.isEqual(aObj[key], bObj[key]));
  }

  /**
   * Log a create action with full object snapshot
   */
  static logCreate<T extends Record<string, unknown>>(
    userId: string,
    userName: string,
    recordType: AuditRecordType,
    recordId: string,
    newData: T,
    metadata?: Record<string, unknown>
  ): AuditLog {
    const changes = this.computeDiff(null, newData);
    
    return this.create({
      user_id: userId,
      user_name: userName,
      record_type: recordType,
      record_id: recordId,
      action: 'create',
      changes,
      metadata,
    });
  }

  /**
   * Log an update action with field-level diffs
   */
  static logUpdate<T extends Record<string, unknown>>(
    userId: string,
    userName: string,
    recordType: AuditRecordType,
    recordId: string,
    oldData: T,
    newData: T,
    metadata?: Record<string, unknown>
  ): AuditLog | null {
    const changes = this.computeDiff(oldData, newData);
    
    // Don't log if no actual changes
    if (changes.length === 0) return null;
    
    return this.create({
      user_id: userId,
      user_name: userName,
      record_type: recordType,
      record_id: recordId,
      action: 'update',
      changes,
      metadata,
    });
  }

  /**
   * Log a delete action with full object snapshot
   */
  static logDelete<T extends Record<string, unknown>>(
    userId: string,
    userName: string,
    recordType: AuditRecordType,
    recordId: string,
    deletedData: T,
    metadata?: Record<string, unknown>
  ): AuditLog {
    const changes = this.computeDiff(deletedData, null);
    
    return this.create({
      user_id: userId,
      user_name: userName,
      record_type: recordType,
      record_id: recordId,
      action: 'delete',
      changes,
      metadata,
    });
  }

  /**
   * Log a transfer action (for card moves, ownership changes, etc.)
   */
  static logTransfer(
    userId: string,
    userName: string,
    recordType: AuditRecordType,
    recordId: string,
    fromId: string,
    toId: string,
    metadata?: Record<string, unknown>
  ): AuditLog {
    return this.create({
      user_id: userId,
      user_name: userName,
      record_type: recordType,
      record_id: recordId,
      action: 'transfer',
      changes: [
        { field: 'from', oldValue: fromId, newValue: toId },
        { field: 'to', oldValue: null, newValue: toId },
      ],
      metadata: {
        ...metadata,
        from_id: fromId,
        to_id: toId,
      },
    });
  }
}

/**
 * Admin-only API for audit log access
 * All methods should be wrapped with admin permission checks at the UI/API layer
 */
export class AuditLogAdminAPI {
  /**
   * Query audit logs (admin only)
   */
  static query(
    filters: AuditLogFilters = {},
    pagination: AuditLogPagination = { page: 1, limit: 50 }
  ): AuditLogResult {
    return AuditLogService.query(filters, pagination);
  }

  /**
   * Get record history (admin only)
   */
  static getRecordHistory(recordType: AuditRecordType, recordId: string): AuditLog[] {
    return AuditLogService.getRecordHistory(recordType, recordId);
  }

  /**
   * Get user history (admin only)
   */
  static getUserHistory(userId: string): AuditLog[] {
    return AuditLogService.getUserHistory(userId);
  }

  /**
   * Get statistics (admin only)
   */
  static getStats(): ReturnType<typeof AuditLogService.getStats> {
    return AuditLogService.getStats();
  }

  /**
   * Clear all logs (admin only - dangerous!)
   */
  static clearAll(): boolean {
    return AuditLogService.clearAll();
  }
}

export default AuditLogService;
