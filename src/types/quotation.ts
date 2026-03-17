/**
 * Quotation Types
 * 
 * Types for managing freight quotations in the CRM system
 */

import { FieldChange } from './audit';

/**
 * Transport mode for quotation
 */
export type TransportMode = 'air' | 'sea' | 'road' | 'rail';

/**
 * Service type for quotation
 */
export type ServiceType = 'ftl' | 'ltl' | 'fcl' | 'lcl' | 'express';

/**
 * Quotation status
 */
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

/**
 * Quote outcome
 */
export type QuoteOutcome = 'won' | 'lost' | 'pending';

/**
 * Pricing breakdown for a quotation
 */
export interface QuotationPricing {
  base_rate: number;
  fuel_surcharge?: number;
  security_fee?: number;
  documentation_fee?: number;
  customs_fee?: number;
  insurance_fee?: number;
  other_charges?: number;
  discount?: number;
  total: number;
  currency: string;
}

/**
 * Port/Airport location
 */
export interface Location {
  code: string;
  name: string;
  country: string;
}

/**
 * Quotation entity
 */
export interface Quotation {
  id: string;
  quote_number: string;
  customer_id: string;
  customer_name?: string;
  pol: Location; // Port of Loading
  pod: Location; // Port of Discharge
  transport_mode: TransportMode;
  service_type: ServiceType;
  incoterm: string;
  cargo_description: string;
  weight_kg?: number;
  volume_cbm?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  pricing: QuotationPricing;
  transit_time_days?: number;
  valid_until: string;
  status: QuotationStatus;
  outcome?: QuoteOutcome;
  loss_reason?: string;
  notes?: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  version: number;
}

/**
 * Input for creating/updating a quotation
 */
export interface QuotationInput {
  customer_id: string;
  pol: Location;
  pod: Location;
  transport_mode: TransportMode;
  service_type: ServiceType;
  incoterm: string;
  cargo_description: string;
  weight_kg?: number;
  volume_cbm?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  pricing: Omit<QuotationPricing, 'total'>;
  transit_time_days?: number;
  valid_until: string;
  notes?: string;
}

/**
 * Quotation revision history entry
 */
export interface QuotationRevision {
  id: string;
  quotation_id: string;
  version: number;
  changes: FieldChange[];
  created_by: string;
  created_by_name?: string;
  created_at: string;
}

/**
 * Filter options for quotation list
 */
export interface QuotationFilters {
  customer_id?: string;
  status?: QuotationStatus;
  transport_mode?: TransportMode;
  service_type?: ServiceType;
  date_from?: string;
  date_to?: string;
  search_query?: string;
}

/**
 * Sort options for quotation list
 */
export type QuotationSortField = 
  | 'quote_number' 
  | 'created_at' 
  | 'valid_until' 
  | 'status' 
  | 'customer_name';

export interface QuotationSort {
  field: QuotationSortField;
  direction: 'asc' | 'desc';
}

/**
 * Pagination options for quotation list
 */
export interface QuotationPagination {
  page: number;
  limit: number;
}

/**
 * Paginated quotation result
 */
export interface QuotationResult {
  quotations: Quotation[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

/**
 * Quotation statistics
 */
export interface QuotationStats {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  conversion_rate: number; // percentage
  total_value: number;
}
