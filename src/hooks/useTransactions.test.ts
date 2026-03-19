import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTransactions } from './useTransactions.js';
import type { Transaction, TransactionType } from '../types/transaction.js';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useTransactions', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset the getItem mock implementation to return null by default
    localStorageMock.getItem.mockImplementation(() => null);
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty transactions', () => {
      const { result } = renderHook(() => useTransactions());

      expect(result.current.transactions).toEqual([]);
      expect(result.current.filteredTransactions).toEqual([]);
    });

    it('should initialize with provided initial transactions', () => {
      const initial: Transaction[] = [
        {
          id: '1',
          description: 'Test Income',
          amount: 1000,
          type: 'income',
          category: 'Salary',
          date: '2024-03-15',
          createdAt: '2024-03-15T10:00:00Z',
          updatedAt: '2024-03-15T10:00:00Z',
        },
      ];

      const { result } = renderHook(() => useTransactions({ initialTransactions: initial }));

      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0].description).toBe('Test Income');
    });

    it('should load transactions from localStorage', () => {
      const stored: Transaction[] = [
        {
          id: 'stored-1',
          description: 'Stored Expense',
          amount: 50,
          type: 'expense',
          category: 'Food',
          date: '2024-03-10',
          createdAt: '2024-03-10T10:00:00Z',
          updatedAt: '2024-03-10T10:00:00Z',
        },
      ];

      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'transactions-data') return JSON.stringify(stored);
        return null;
      });

      const { result } = renderHook(() => useTransactions());

      // Verify localStorage was queried
      expect(localStorageMock.getItem).toHaveBeenCalledWith('transactions-data');
    });
  });

  describe('addTransaction', () => {
    it('should add a new income transaction', () => {
      const { result } = renderHook(() => useTransactions());

      let newTransaction: Transaction;

      act(() => {
        newTransaction = result.current.addTransaction('Salary', 5000, 'income', 'Work', '2024-03-15');
      });

      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0].description).toBe('Salary');
      expect(result.current.transactions[0].amount).toBe(5000);
      expect(result.current.transactions[0].type).toBe('income');
      expect(result.current.transactions[0].category).toBe('Work');
      expect(result.current.transactions[0].date).toBe('2024-03-15');
      expect(result.current.transactions[0].id).toBeDefined();
      expect(newTransaction!.id).toBeDefined();
    });

    it('should add a new expense transaction', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addTransaction('Groceries', 150.5, 'expense', 'Food');
      });

      expect(result.current.transactions[0].type).toBe('expense');
      expect(result.current.transactions[0].amount).toBe(150.5);
    });

    it('should sort transactions by date descending', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addTransaction('Old', 100, 'income', 'Test', '2024-01-01');
        result.current.addTransaction('New', 200, 'income', 'Test', '2024-03-01');
        result.current.addTransaction('Middle', 150, 'income', 'Test', '2024-02-01');
      });

      expect(result.current.transactions[0].description).toBe('New');
      expect(result.current.transactions[1].description).toBe('Middle');
      expect(result.current.transactions[2].description).toBe('Old');
    });

    it('should persist to localStorage', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addTransaction('Test', 100, 'income', 'Test', '2024-03-15');
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const lastCall = localStorageMock.setItem.mock.calls.find(
        (call: string[]) => call[0] === 'transactions-data'
      );
      expect(lastCall).toBeDefined();
      const stored = JSON.parse(lastCall![1]);
      expect(stored).toHaveLength(1);
      expect(stored[0].description).toBe('Test');
    });
  });

  describe('updateTransaction', () => {
    it('should update an existing transaction', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addTransaction('Original', 100, 'income', 'Test', '2024-03-15');
      });

      const id = result.current.transactions[0].id;

      act(() => {
        const success = result.current.updateTransaction(id, { description: 'Updated', amount: 200 });
        expect(success).toBe(true);
      });

      expect(result.current.transactions[0].description).toBe('Updated');
      expect(result.current.transactions[0].amount).toBe(200);
      expect(result.current.transactions[0].type).toBe('income'); // Unchanged
    });

    it('should update timestamp when updating', async () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addTransaction('Original', 100, 'income', 'Test', '2024-03-15');
      });

      const originalUpdatedAt = result.current.transactions[0].updatedAt;
      const id = result.current.transactions[0].id;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      act(() => {
        result.current.updateTransaction(id, { description: 'Updated' });
      });

      expect(result.current.transactions[0].updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should return false for non-existent transaction', () => {
      const { result } = renderHook(() => useTransactions());

      let success: boolean;

      act(() => {
        success = result.current.updateTransaction('non-existent-id', { description: 'Updated' });
      });

      expect(success!).toBe(false);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete an existing transaction', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addTransaction('To Delete', 100, 'income', 'Test', '2024-03-15');
      });

      const id = result.current.transactions[0].id;

      act(() => {
        const success = result.current.deleteTransaction(id);
        expect(success).toBe(true);
      });

      expect(result.current.transactions).toHaveLength(0);
    });

    it('should return false for non-existent transaction', () => {
      const { result } = renderHook(() => useTransactions());

      let success: boolean;

      act(() => {
        success = result.current.deleteTransaction('non-existent-id');
      });

      expect(success!).toBe(false);
    });

    it('should persist deletion to localStorage', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addTransaction('To Delete', 100, 'income', 'Test', '2024-03-15');
      });

      const id = result.current.transactions[0].id;
      
      // Clear mocks to track only the delete operation
      localStorageMock.setItem.mockClear();

      act(() => {
        result.current.deleteTransaction(id);
      });

      // Verify setItem was called to persist the deletion
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'transactions-data',
        '[]'
      );
    });
  });

  describe('getTransaction', () => {
    it('should return a transaction by id', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addTransaction('Find Me', 100, 'income', 'Test', '2024-03-15');
      });

      const id = result.current.transactions[0].id;

      const found = result.current.getTransaction(id);

      expect(found).toBeDefined();
      expect(found?.description).toBe('Find Me');
    });

    it('should return undefined for non-existent id', () => {
      const { result } = renderHook(() => useTransactions());

      const found = result.current.getTransaction('non-existent');

      expect(found).toBeUndefined();
    });
  });

  describe('filtering by month', () => {
    it('should filter transactions by current month by default', () => {
      const currentMonth = new Date().toISOString().substring(0, 7);

      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addTransaction('Current', 100, 'income', 'Test', `${currentMonth}-15`);
        result.current.addTransaction('Old', 200, 'income', 'Test', '2023-01-15');
      });

      expect(result.current.filters.month).toBe(currentMonth);
      expect(result.current.filteredTransactions).toHaveLength(1);
      expect(result.current.filteredTransactions[0].description).toBe('Current');
    });

    it('should change month filter', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addTransaction('March', 100, 'income', 'Test', '2024-03-15');
        result.current.addTransaction('February', 200, 'income', 'Test', '2024-02-15');
      });

      act(() => {
        result.current.setMonthFilter('2024-02');
      });

      expect(result.current.filters.month).toBe('2024-02');
      expect(result.current.filteredTransactions).toHaveLength(1);
      expect(result.current.filteredTransactions[0].description).toBe('February');
    });

    it('should clear month filter', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addTransaction('March', 100, 'income', 'Test', '2024-03-15');
        result.current.addTransaction('February', 200, 'income', 'Test', '2024-02-15');
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters.month).toBeUndefined();
      expect(result.current.filteredTransactions).toHaveLength(2);
    });
  });

  describe('filtering by type', () => {
    it('should filter by income type', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.clearFilters(); // Clear default month filter
        result.current.addTransaction('Income 1', 100, 'income', 'Test', '2024-03-15');
        result.current.addTransaction('Expense 1', 50, 'expense', 'Test', '2024-03-15');
        result.current.addTransaction('Income 2', 200, 'income', 'Test', '2024-03-15');
      });

      act(() => {
        result.current.setTypeFilter('income');
      });

      expect(result.current.filteredTransactions).toHaveLength(2);
      expect(result.current.filteredTransactions.every((t) => t.type === 'income')).toBe(true);
    });

    it('should filter by expense type', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.clearFilters();
        result.current.addTransaction('Income 1', 100, 'income', 'Test', '2024-03-15');
        result.current.addTransaction('Expense 1', 50, 'expense', 'Test', '2024-03-15');
      });

      act(() => {
        result.current.setTypeFilter('expense');
      });

      expect(result.current.filteredTransactions).toHaveLength(1);
      expect(result.current.filteredTransactions[0].type).toBe('expense');
    });
  });

  describe('filtering by category', () => {
    it('should filter by category', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.clearFilters();
        result.current.addTransaction('Food 1', 50, 'expense', 'Food', '2024-03-15');
        result.current.addTransaction('Transport 1', 30, 'expense', 'Transport', '2024-03-15');
        result.current.addTransaction('Food 2', 40, 'expense', 'Food', '2024-03-15');
      });

      act(() => {
        result.current.setCategoryFilter('Food');
      });

      expect(result.current.filteredTransactions).toHaveLength(2);
      expect(result.current.filteredTransactions.every((t) => t.category === 'Food')).toBe(true);
    });
  });

  describe('combined filters', () => {
    it('should apply multiple filters', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.clearFilters();
        result.current.addTransaction('Food Income', 100, 'income', 'Food', '2024-03-15');
        result.current.addTransaction('Food Expense', 50, 'expense', 'Food', '2024-03-15');
        result.current.addTransaction('Transport Expense', 30, 'expense', 'Transport', '2024-03-15');
        result.current.addTransaction('Food Expense Feb', 40, 'expense', 'Food', '2024-02-15');
      });

      act(() => {
        result.current.setMonthFilter('2024-03');
        result.current.setTypeFilter('expense');
        result.current.setCategoryFilter('Food');
      });

      expect(result.current.filteredTransactions).toHaveLength(1);
      expect(result.current.filteredTransactions[0].description).toBe('Food Expense');
    });
  });

  describe('stats calculation', () => {
    it('should calculate correct stats for filtered transactions', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.clearFilters();
        result.current.addTransaction('Salary', 5000, 'income', 'Work', '2024-03-15');
        result.current.addTransaction('Bonus', 1000, 'income', 'Work', '2024-03-15');
        result.current.addTransaction('Rent', 1500, 'expense', 'Housing', '2024-03-15');
        result.current.addTransaction('Food', 500, 'expense', 'Food', '2024-03-15');
      });

      expect(result.current.stats.totalIncome).toBe(6000);
      expect(result.current.stats.totalExpense).toBe(2000);
      expect(result.current.stats.balance).toBe(4000);
      expect(result.current.stats.count).toBe(4);
    });

    it('should recalculate stats when filters change', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.clearFilters();
        result.current.addTransaction('Income March', 5000, 'income', 'Work', '2024-03-15');
        result.current.addTransaction('Expense March', 1000, 'expense', 'Food', '2024-03-15');
        result.current.addTransaction('Income Feb', 3000, 'income', 'Work', '2024-02-15');
        result.current.addTransaction('Expense Feb', 800, 'expense', 'Food', '2024-02-15');
      });

      // Initial stats (all transactions)
      expect(result.current.stats.totalIncome).toBe(8000);
      expect(result.current.stats.totalExpense).toBe(1800);

      // Filter to March only
      act(() => {
        result.current.setMonthFilter('2024-03');
      });

      expect(result.current.stats.totalIncome).toBe(5000);
      expect(result.current.stats.totalExpense).toBe(1000);
      expect(result.current.stats.balance).toBe(4000);
    });
  });

  describe('clearAllTransactions', () => {
    it('should remove all transactions', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addTransaction('T1', 100, 'income', 'Test', '2024-03-15');
        result.current.addTransaction('T2', 200, 'income', 'Test', '2024-03-15');
      });

      act(() => {
        result.current.clearAllTransactions();
      });

      expect(result.current.transactions).toHaveLength(0);
      expect(result.current.filteredTransactions).toHaveLength(0);
    });

    it('should clear filters when clearing all', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addTransaction('T1', 100, 'income', 'Test', '2024-03-15');
        result.current.setMonthFilter('2024-02');
        result.current.setTypeFilter('expense');
      });

      act(() => {
        result.current.clearAllTransactions();
      });

      expect(result.current.filters).toEqual({});
    });
  });

  describe('isLoading', () => {
    it('should indicate loading state', async () => {
      const { result } = renderHook(() => useTransactions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
