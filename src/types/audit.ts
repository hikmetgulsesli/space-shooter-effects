/**
 * Audit Log Types
 * 
 * Field-level diff logging for all changes (create/update/delete/transfer)
 */

export type AuditAction = 'create' | 'update' | 'delete' | 'transfer';

export type AuditRecordType = 'customer' | 'activity' | 'quote' | 'follow_up' | 'user' | 'board' | 'card' | 'column';

/**
 * Field-level change representation
 */
export interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string;
  user_id: string;
  user_name?: string;
  record_type: AuditRecordType;
  record_id: string;
  action: AuditAction;
  changes: FieldChange[];
  timestamp: string;
  ip_address?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Filter options for audit log queries
 */
export interface AuditLogFilters {
  user_id?: string;
  record_type?: AuditRecordType;
  record_id?: string;
  action?: AuditAction;
  from_date?: string;
  to_date?: string;
  search_query?: string;
}

/**
 * Pagination options for audit log queries
 */
export interface AuditLogPagination {
  page: number;
  limit: number;
}

/**
 * Paginated audit log result
 */
export interface AuditLogResult {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

/**
 * Input for creating an audit log entry
 */
export interface AuditLogInput {
  user_id: string;
  user_name?: string;
  record_type: AuditRecordType;
  record_id: string;
  action: AuditAction;
  changes: FieldChange[];
  ip_address?: string;
  metadata?: Record<string, unknown>;
}
