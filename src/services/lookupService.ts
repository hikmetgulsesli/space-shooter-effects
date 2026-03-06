import type {
  LookupValue,
  LookupValueInput,
  LookupCategory,
  GroupedLookupValues,
  LookupUsageCount,
} from '../types/lookup.js';
import { DEFAULT_LOOKUP_VALUES, LOOKUP_CATEGORIES } from '../types/lookup.js';

const STORAGE_KEY = 'crm-lookup-values';
const USAGE_STORAGE_KEY = 'crm-lookup-usage';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Service for managing lookup values
 */
export const lookupService = {
  /**
   * Get all lookup values
   */
  getAll(): LookupValue[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Initialize with defaults
        const defaults = DEFAULT_LOOKUP_VALUES.map((item) => ({
          ...item,
          id: generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        return defaults;
      }
      return JSON.parse(data) as LookupValue[];
    } catch (error) {
      console.error('Failed to load lookup values:', error);
      return [];
    }
  },

  /**
   * Get lookup values grouped by category
   */
  getGrouped(): GroupedLookupValues[] {
    const all = this.getAll();
    return LOOKUP_CATEGORIES.map((cat) => ({
      category: cat.key,
      label: cat.label,
      values: all
        .filter((v) => v.category === cat.key)
        .sort((a, b) => a.sort_order - b.sort_order),
    }));
  },

  /**
   * Get lookup values by category
   */
  getByCategory(category: LookupCategory): LookupValue[] {
    return this.getAll()
      .filter((v) => v.category === category)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  /**
   * Get only active lookup values by category
   */
  getActiveByCategory(category: LookupCategory): LookupValue[] {
    return this.getByCategory(category).filter((v) => v.is_active);
  },

  /**
   * Get a single lookup value by ID
   */
  getById(id: string): LookupValue | null {
    return this.getAll().find((v) => v.id === id) || null;
  },

  /**
   * Create a new lookup value
   */
  create(input: LookupValueInput): LookupValue {
    const all = this.getAll();
    const now = new Date().toISOString();

    // Calculate next sort order if not provided
    const maxOrder = all
      .filter((v) => v.category === input.category)
      .reduce((max, v) => Math.max(max, v.sort_order), 0);

    const newValue: LookupValue = {
      id: generateId(),
      category: input.category,
      value: input.value.toLowerCase().replace(/\s+/g, '_'),
      label: input.label,
      sort_order: input.sort_order ?? maxOrder + 1,
      is_active: input.is_active ?? true,
      created_at: now,
      updated_at: now,
    };

    all.push(newValue);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    return newValue;
  },

  /**
   * Update an existing lookup value
   */
  update(id: string, input: Partial<LookupValueInput>): LookupValue | null {
    const all = this.getAll();
    const index = all.findIndex((v) => v.id === id);

    if (index === -1) return null;

    const updated: LookupValue = {
      ...all[index],
      ...(input.value && {
        value: input.value.toLowerCase().replace(/\s+/g, '_'),
      }),
      ...(input.label && { label: input.label }),
      ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
      updated_at: new Date().toISOString(),
    };

    all[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    return updated;
  },

  /**
   * Soft delete (deactivate) a lookup value
   */
  deactivate(id: string): LookupValue | null {
    return this.update(id, { is_active: false });
  },

  /**
   * Reactivate a lookup value
   */
  reactivate(id: string): LookupValue | null {
    return this.update(id, { is_active: true });
  },

  /**
   * Permanently delete a lookup value (use with caution)
   */
  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((v) => v.id !== id);

    if (filtered.length === all.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  /**
   * Reorder lookup values within a category
   */
  reorder(category: LookupCategory, orderedIds: string[]): LookupValue[] {
    const all = this.getAll();

    orderedIds.forEach((id, index) => {
      const item = all.find((v) => v.id === id && v.category === category);
      if (item) {
        item.sort_order = index + 1;
        item.updated_at = new Date().toISOString();
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return this.getByCategory(category);
  },

  /**
   * Get usage count for a lookup value
   */
  getUsageCount(lookupId: string): LookupUsageCount {
    try {
      const data = localStorage.getItem(USAGE_STORAGE_KEY);
      const usage = data ? JSON.parse(data) : {};
      return (
        usage[lookupId] || {
          lookupId,
          count: 0,
          entities: [],
        }
      );
    } catch {
      return { lookupId, count: 0, entities: [] };
    }
  },

  /**
   * Record usage of a lookup value
   */
  recordUsage(lookupId: string, entity: string): void {
    try {
      const data = localStorage.getItem(USAGE_STORAGE_KEY);
      const usage: Record<string, LookupUsageCount> = data
        ? JSON.parse(data)
        : {};

      if (!usage[lookupId]) {
        usage[lookupId] = { lookupId, count: 0, entities: [] };
      }

      usage[lookupId].count += 1;
      if (!usage[lookupId].entities.includes(entity)) {
        usage[lookupId].entities.push(entity);
      }

      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
    } catch (error) {
      console.error('Failed to record usage:', error);
    }
  },

  /**
   * Check if a lookup value is being used
   */
  isInUse(lookupId: string): boolean {
    const usage = this.getUsageCount(lookupId);
    return usage.count > 0;
  },

  /**
   * Get warning threshold for editing
   */
  getUsageWarning(lookupId: string): { show: boolean; count: number } {
    const usage = this.getUsageCount(lookupId);
    return {
      show: usage.count >= 5,
      count: usage.count,
    };
  },

  /**
   * Reset to default values (for testing/development)
   */
  resetToDefaults(): LookupValue[] {
    const defaults = DEFAULT_LOOKUP_VALUES.map((item) => ({
      ...item,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    localStorage.removeItem(USAGE_STORAGE_KEY);
    return defaults;
  },
};

export default lookupService;
