/**
 * Transaction types for financial tracking
 */

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  month?: string; // Format: "YYYY-MM"
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  count: number;
}

/**
 * Generate a unique ID for transactions
 */
export function generateTransactionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new transaction
 */
export function createTransaction(
  description: string,
  amount: number,
  type: TransactionType,
  category: string,
  date?: string
): Transaction {
  const now = new Date().toISOString();
  return {
    id: generateTransactionId(),
    description,
    amount,
    type,
    category,
    date: date || now.split('T')[0],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get month string from date (YYYY-MM format)
 */
export function getMonthFromDate(date: string): string {
  return date.substring(0, 7);
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  return new Date().toISOString().substring(0, 7);
}
