'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Options for useLocalStorage hook
 */
export interface UseLocalStorageOptions<T> {
  key: string;
  initialValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

/**
 * Return type for useLocalStorage hook
 */
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  isLoading: boolean;
}

// Simple identity serialization for strings
const defaultSerialize = <T>(value: T): string => JSON.stringify(value);
const defaultDeserialize = <T>(value: string): T => JSON.parse(value);

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Custom hook for persisting state to localStorage
 * 
 * @example
 * ```tsx
 * const { value: name, setValue: setName } = useLocalStorage({ key: 'username', initialValue: '' });
 * ```
 */
export function useLocalStorage<T>(options: UseLocalStorageOptions<T>): UseLocalStorageReturn<T> {
  const { 
    key, 
    initialValue, 
    serialize = defaultSerialize, 
    deserialize = defaultDeserialize 
  } = options;

  // State to hold the current value
  const [value, setValueState] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial value from localStorage on mount
  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      setIsLoading(false);
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setValueState(deserialize(item));
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key, deserialize]);

  // Set value function
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    if (!isLocalStorageAvailable()) return;

    try {
      setValueState((prev) => {
        const valueToStore = newValue instanceof Function ? newValue(prev) : newValue;
        const serialized = serialize(valueToStore);
        window.localStorage.setItem(key, serialized);
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize]);

  // Remove value function
  const removeValue = useCallback(() => {
    if (!isLocalStorageAvailable()) return;

    try {
      window.localStorage.removeItem(key);
      setValueState(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for storage events from other tabs
  useEffect(() => {
    if (!isLocalStorageAvailable()) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setValueState(deserialize(event.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key, deserialize]);

  return {
    value,
    setValue,
    removeValue,
    isLoading,
  };
}

export default useLocalStorage;
