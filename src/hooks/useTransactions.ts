'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import type {
  Transaction,
  TransactionType,
  TransactionFilters,
  TransactionStats,
} from '../types/transaction.js';
import { createTransaction, getMonthFromDate, getCurrentMonth } from '../types/transaction.js';

const TRANSACTIONS_STORAGE_KEY = 'transactions-data';

/**
 * Options for useTransactions hook
 */
export interface UseTransactionsOptions {
  initialTransactions?: Transaction[];
}

/**
 * Return type for useTransactions hook
 */
export interface UseTransactionsReturn {
  // Data
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  filters: TransactionFilters;
  
  // Stats
  stats: TransactionStats;
  
  // State
  isLoading: boolean;
  
  // Actions - CRUD
  addTransaction: (
    description: string,
    amount: number,
    type: TransactionType,
    category: string,
    date?: string
  ) => Transaction;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => boolean;
  deleteTransaction: (id: string) => boolean;
  getTransaction: (id: string) => Transaction | undefined;
  
  // Actions - Filters
  setMonthFilter: (month: string | undefined) => void;
  setTypeFilter: (type: TransactionType | undefined) => void;
  setCategoryFilter: (category: string | undefined) => void;
  clearFilters: () => void;
  
  // Actions - Batch
  clearAllTransactions: () => void;
}

/**
 * Custom hook for managing transactions with localStorage persistence
 * 
 * @example
 * ```tsx
 * const { 
 *   transactions, 
 *   addTransaction, 
 *   deleteTransaction,
 *   filteredTransactions,
 *   setMonthFilter 
 * } = useTransactions();
 * ```
 */
export function useTransactions(options: UseTransactionsOptions = {}): UseTransactionsReturn {
  const { initialTransactions = [] } = options;
  
  const { value: transactions, setValue: setTransactions, isLoading } = useLocalStorage<Transaction[]>({
    key: TRANSACTIONS_STORAGE_KEY,
    initialValue: initialTransactions,
  });

  // Local filter state
  const [filters, setFilters] = useState<TransactionFilters>({
    month: getCurrentMonth(),
  });

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Month filter
      if (filters.month) {
        const transactionMonth = getMonthFromDate(transaction.date);
        if (transactionMonth !== filters.month) {
          return false;
        }
      }

      // Type filter
      if (filters.type && transaction.type !== filters.type) {
        return false;
      }

      // Category filter
      if (filters.category && transaction.category !== filters.category) {
        return false;
      }

      // Date range filter
      if (filters.startDate && transaction.date < filters.startDate) {
        return false;
      }
      if (filters.endDate && transaction.date > filters.endDate) {
        return false;
      }

      return true;
    });
  }, [transactions, filters]);

  // Calculate stats
  const stats: TransactionStats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set(transactions.map((t) => t.category));
    return Array.from(categorySet).sort();
  }, [transactions]);

  // CRUD Operations

  /**
   * Add a new transaction
   */
  const addTransaction = useCallback(
    (
      description: string,
      amount: number,
      type: TransactionType,
      category: string,
      date?: string
    ): Transaction => {
      const newTransaction = createTransaction(description, amount, type, category, date);
      
      setTransactions((prev) => {
        const updated = [...prev, newTransaction];
        // Sort by date descending
        return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });

      return newTransaction;
    },
    [setTransactions]
  );

  /**
   * Update an existing transaction
   */
  const updateTransaction = useCallback(
    (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>): boolean => {
      // Check if transaction exists first
      const index = transactions.findIndex((t) => t.id === id);
      if (index === -1) return false;
      
      setTransactions((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        
        // Sort by date descending
        return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });

      return true;
    },
    [setTransactions, transactions]
  );

  /**
   * Delete a transaction
   */
  const deleteTransaction = useCallback(
    (id: string): boolean => {
      // Check if transaction exists first
      const exists = transactions.some((t) => t.id === id);
      if (!exists) return false;
      
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      return true;
    },
    [setTransactions, transactions]
  );

  /**
   * Get a single transaction by ID
   */
  const getTransaction = useCallback(
    (id: string): Transaction | undefined => {
      return transactions.find((t) => t.id === id);
    },
    [transactions]
  );

  // Filter Actions

  /**
   * Set month filter
   */
  const setMonthFilter = useCallback((month: string | undefined) => {
    setFilters((prev) => ({ ...prev, month }));
  }, []);

  /**
   * Set type filter
   */
  const setTypeFilter = useCallback((type: TransactionType | undefined) => {
    setFilters((prev) => ({ ...prev, type }));
  }, []);

  /**
   * Set category filter
   */
  const setCategoryFilter = useCallback((category: string | undefined) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Batch Actions

  /**
   * Clear all transactions
   */
  const clearAllTransactions = useCallback(() => {
    setTransactions([]);
    setFilters({});
  }, [setTransactions]);

  return {
    transactions,
    filteredTransactions,
    filters,
    stats,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    setMonthFilter,
    setTypeFilter,
    setCategoryFilter,
    clearFilters,
    clearAllTransactions,
  };
}

export default useTransactions;
