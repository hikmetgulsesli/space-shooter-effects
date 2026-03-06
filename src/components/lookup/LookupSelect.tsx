import React, { useMemo } from 'react';
import type { LookupCategory, LookupValue } from '../../types/lookup.js';
import { lookupService } from '../../services/lookupService.js';
import { ChevronDown } from 'lucide-react';

interface LookupSelectProps {
  category: LookupCategory;
  value?: string;
  onChange: (value: string, lookup: LookupValue | null) => void;
  placeholder?: string;
  disabled?: boolean;
  includeInactive?: boolean;
  className?: string;
}

/**
 * Select component that uses lookup values from the lookup service.
 * Automatically updates when lookup values change.
 */
export function LookupSelect({
  category,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  includeInactive = false,
  className = '',
}: LookupSelectProps) {
  const options = useMemo(() => {
    const values = includeInactive
      ? lookupService.getByCategory(category)
      : lookupService.getActiveByCategory(category);
    return values;
  }, [category, includeInactive]);

  const selectedLookup = useMemo(() => {
    return options.find((o) => o.value === value) || null;
  }, [options, value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const lookup = options.find((o) => o.value === selectedValue) || null;
    onChange(selectedValue, lookup);
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((lookup) => (
          <option key={lookup.id} value={lookup.value}>
            {lookup.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      
      {selectedLookup && (
        <input type="hidden" name={`${category}_id`} value={selectedLookup.id} />
      )}
    </div>
  );
}

interface LookupMultiSelectProps {
  category: LookupCategory;
  values: string[];
  onChange: (values: string[], lookups: LookupValue[]) => void;
  placeholder?: string;
  disabled?: boolean;
  includeInactive?: boolean;
  className?: string;
}

/**
 * Multi-select component for lookup values
 */
export function LookupMultiSelect({
  category,
  values,
  onChange,
  placeholder = 'Select options...',
  disabled = false,
  includeInactive = false,
  className = '',
}: LookupMultiSelectProps) {
  const options = useMemo(() => {
    const allValues = includeInactive
      ? lookupService.getByCategory(category)
      : lookupService.getActiveByCategory(category);
    return allValues;
  }, [category, includeInactive]);

  const selectedLookups = useMemo(() => {
    return options.filter((o) => values.includes(o.value));
  }, [options, values]);

  const toggleValue = (value: string) => {
    const newValues = values.includes(value)
      ? values.filter((v) => v !== value)
      : [...values, value];
    const lookups = options.filter((o) => newValues.includes(o.value));
    onChange(newValues, lookups);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2 min-h-[38px] p-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
        {selectedLookups.length === 0 && (
          <span className="text-gray-400 text-sm py-1">{placeholder}</span>
        )}
        {selectedLookups.map((lookup) => (
          <span
            key={lookup.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
          >
            {lookup.label}
            {!disabled && (
              <button
                type="button"
                onClick={() => toggleValue(lookup.value)}
                className="hover:text-blue-600"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      
      {!disabled && (
        <div className="flex flex-wrap gap-2">
          {options
            .filter((o) => !values.includes(o.value))
            .map((lookup) => (
              <button
                key={lookup.id}
                type="button"
                onClick={() => toggleValue(lookup.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                + {lookup.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default LookupSelect;
