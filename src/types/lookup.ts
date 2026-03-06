/**
 * Lookup value categories
 */
export type LookupCategory =
  | 'transport_modes'
  | 'service_types'
  | 'incoterms'
  | 'sources'
  | 'potentials'
  | 'statuses'
  | 'quote_outcomes'
  | 'loss_reasons'
  | 'currencies';

/**
 * Individual lookup value
 */
export interface LookupValue {
  id: string;
  category: LookupCategory;
  value: string;
  label: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating/updating a lookup value
 */
export interface LookupValueInput {
  category: LookupCategory;
  value: string;
  label: string;
  sort_order?: number;
  is_active?: boolean;
}

/**
 * Usage count for a lookup value
 */
export interface LookupUsageCount {
  lookupId: string;
  count: number;
  entities: string[]; // e.g., ['customers', 'quotes']
}

/**
 * Grouped lookup values by category
 */
export interface GroupedLookupValues {
  category: LookupCategory;
  label: string;
  values: LookupValue[];
}

/**
 * Category metadata for display
 */
export interface LookupCategoryMeta {
  key: LookupCategory;
  label: string;
  description: string;
  icon?: string;
}

/**
 * Category definitions with metadata
 */
export const LOOKUP_CATEGORIES: LookupCategoryMeta[] = [
  {
    key: 'transport_modes',
    label: 'Transport Modes',
    description: 'Methods of transportation (Air, Sea, Road, Rail)',
  },
  {
    key: 'service_types',
    label: 'Service Types',
    description: 'Types of services offered',
  },
  {
    key: 'incoterms',
    label: 'Incoterms',
    description: 'International commercial terms (EXW, FOB, CIF, etc.)',
  },
  {
    key: 'sources',
    label: 'Lead Sources',
    description: 'Where leads originated from',
  },
  {
    key: 'potentials',
    label: 'Potentials',
    description: 'Deal potential ratings',
  },
  {
    key: 'statuses',
    label: 'Statuses',
    description: 'Quote and deal statuses',
  },
  {
    key: 'quote_outcomes',
    label: 'Quote Outcomes',
    description: 'Results of quote submissions',
  },
  {
    key: 'loss_reasons',
    label: 'Loss Reasons',
    description: 'Reasons for lost deals',
  },
  {
    key: 'currencies',
    label: 'Currencies',
    description: 'Supported currencies',
  },
];

/**
 * Default lookup values for initial setup
 */
export const DEFAULT_LOOKUP_VALUES: Omit<LookupValue, 'id' | 'created_at' | 'updated_at'>[] = [
  // Transport Modes
  { category: 'transport_modes', value: 'air', label: 'Air', sort_order: 1, is_active: true },
  { category: 'transport_modes', value: 'sea', label: 'Sea', sort_order: 2, is_active: true },
  { category: 'transport_modes', value: 'road', label: 'Road', sort_order: 3, is_active: true },
  { category: 'transport_modes', value: 'rail', label: 'Rail', sort_order: 4, is_active: true },
  
  // Service Types
  { category: 'service_types', value: 'ftl', label: 'FTL (Full Truck Load)', sort_order: 1, is_active: true },
  { category: 'service_types', value: 'ltl', label: 'LTL (Less Than Truck Load)', sort_order: 2, is_active: true },
  { category: 'service_types', value: 'fcl', label: 'FCL (Full Container Load)', sort_order: 3, is_active: true },
  { category: 'service_types', value: 'lcl', label: 'LCL (Less Than Container Load)', sort_order: 4, is_active: true },
  { category: 'service_types', value: 'express', label: 'Express', sort_order: 5, is_active: true },
  
  // Incoterms
  { category: 'incoterms', value: 'exw', label: 'EXW - Ex Works', sort_order: 1, is_active: true },
  { category: 'incoterms', value: 'fob', label: 'FOB - Free On Board', sort_order: 2, is_active: true },
  { category: 'incoterms', value: 'cif', label: 'CIF - Cost, Insurance & Freight', sort_order: 3, is_active: true },
  { category: 'incoterms', value: 'ddp', label: 'DDP - Delivered Duty Paid', sort_order: 4, is_active: true },
  
  // Sources
  { category: 'sources', value: 'website', label: 'Website', sort_order: 1, is_active: true },
  { category: 'sources', value: 'referral', label: 'Referral', sort_order: 2, is_active: true },
  { category: 'sources', value: 'social_media', label: 'Social Media', sort_order: 3, is_active: true },
  { category: 'sources', value: 'trade_show', label: 'Trade Show', sort_order: 4, is_active: true },
  { category: 'sources', value: 'cold_call', label: 'Cold Call', sort_order: 5, is_active: true },
  
  // Potentials
  { category: 'potentials', value: 'hot', label: 'Hot', sort_order: 1, is_active: true },
  { category: 'potentials', value: 'warm', label: 'Warm', sort_order: 2, is_active: true },
  { category: 'potentials', value: 'cold', label: 'Cold', sort_order: 3, is_active: true },
  
  // Statuses
  { category: 'statuses', value: 'draft', label: 'Draft', sort_order: 1, is_active: true },
  { category: 'statuses', value: 'sent', label: 'Sent', sort_order: 2, is_active: true },
  { category: 'statuses', value: 'accepted', label: 'Accepted', sort_order: 3, is_active: true },
  { category: 'statuses', value: 'rejected', label: 'Rejected', sort_order: 4, is_active: true },
  { category: 'statuses', value: 'expired', label: 'Expired', sort_order: 5, is_active: true },
  
  // Quote Outcomes
  { category: 'quote_outcomes', value: 'won', label: 'Won', sort_order: 1, is_active: true },
  { category: 'quote_outcomes', value: 'lost', label: 'Lost', sort_order: 2, is_active: true },
  { category: 'quote_outcomes', value: 'pending', label: 'Pending', sort_order: 3, is_active: true },
  
  // Loss Reasons
  { category: 'loss_reasons', value: 'price', label: 'Price Too High', sort_order: 1, is_active: true },
  { category: 'loss_reasons', value: 'service', label: 'Service Not Suitable', sort_order: 2, is_active: true },
  { category: 'loss_reasons', value: 'competitor', label: 'Went to Competitor', sort_order: 3, is_active: true },
  { category: 'loss_reasons', value: 'timing', label: 'Bad Timing', sort_order: 4, is_active: true },
  { category: 'loss_reasons', value: 'no_response', label: 'No Response', sort_order: 5, is_active: true },
  
  // Currencies
  { category: 'currencies', value: 'usd', label: 'USD ($)', sort_order: 1, is_active: true },
  { category: 'currencies', value: 'eur', label: 'EUR (€)', sort_order: 2, is_active: true },
  { category: 'currencies', value: 'gbp', label: 'GBP (£)', sort_order: 3, is_active: true },
];
