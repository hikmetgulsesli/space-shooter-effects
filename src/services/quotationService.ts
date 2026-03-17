import type {
  Quotation,
  QuotationInput,
  QuotationFilters,
  QuotationPagination,
  QuotationResult,
  QuotationRevision,
  QuotationStats,
  QuotationStatus,
  QuoteOutcome,
} from '../types/quotation.js';
import type { FieldChange } from '../types/audit.js';

const STORAGE_KEY = 'crm-quotations';
const REVISIONS_STORAGE_KEY = 'crm-quotation-revisions';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a quote number (e.g., Q-2024-0001)
 */
function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const quotations = quotationService.getAll();
  const yearQuotes = quotations.filter(q => q.quote_number.startsWith(`Q-${year}`));
  const nextNumber = yearQuotes.length + 1;
  return `Q-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Calculate total from pricing breakdown
 */
function calculateTotal(pricing: QuotationInput['pricing']): number {
  const base = pricing.base_rate || 0;
  const fuel = pricing.fuel_surcharge || 0;
  const security = pricing.security_fee || 0;
  const docs = pricing.documentation_fee || 0;
  const customs = pricing.customs_fee || 0;
  const insurance = pricing.insurance_fee || 0;
  const other = pricing.other_charges || 0;
  const discount = pricing.discount || 0;
  
  return base + fuel + security + docs + customs + insurance + other - discount;
}

/**
 * Service for managing quotations
 */
export const quotationService = {
  /**
   * Get all quotations
   */
  getAll(): Quotation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? (JSON.parse(data) as Quotation[]) : [];
    } catch (error) {
      console.error('Failed to load quotations:', error);
      return [];
    }
  },

  /**
   * Get quotations with filters and pagination
   */
  getFiltered(
    filters: QuotationFilters = {},
    pagination: QuotationPagination = { page: 1, limit: 20 }
  ): QuotationResult {
    let quotations = this.getAll();

    // Apply filters
    if (filters.customer_id) {
      quotations = quotations.filter(q => q.customer_id === filters.customer_id);
    }
    if (filters.status) {
      quotations = quotations.filter(q => q.status === filters.status);
    }
    if (filters.transport_mode) {
      quotations = quotations.filter(q => q.transport_mode === filters.transport_mode);
    }
    if (filters.service_type) {
      quotations = quotations.filter(q => q.service_type === filters.service_type);
    }
    if (filters.date_from) {
      quotations = quotations.filter(q => q.created_at >= filters.date_from!);
    }
    if (filters.date_to) {
      quotations = quotations.filter(q => q.created_at <= filters.date_to!);
    }
    if (filters.search_query) {
      const query = filters.search_query.toLowerCase();
      quotations = quotations.filter(
        q =>
          q.quote_number.toLowerCase().includes(query) ||
          q.customer_name?.toLowerCase().includes(query) ||
          q.cargo_description.toLowerCase().includes(query) ||
          q.pol.name.toLowerCase().includes(query) ||
          q.pod.name.toLowerCase().includes(query)
      );
    }

    // Sort by created_at desc by default
    quotations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = quotations.length;
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    const paginatedQuotations = quotations.slice(start, end);

    return {
      quotations: paginatedQuotations,
      total,
      page: pagination.page,
      limit: pagination.limit,
      has_more: end < total,
    };
  },

  /**
   * Get a single quotation by ID
   */
  getById(id: string): Quotation | null {
    return this.getAll().find(q => q.id === id) || null;
  },

  /**
   * Get quotation by quote number
   */
  getByQuoteNumber(quoteNumber: string): Quotation | null {
    return this.getAll().find(q => q.quote_number === quoteNumber) || null;
  },

  /**
   * Create a new quotation
   */
  create(input: QuotationInput, userId: string, userName?: string): Quotation {
    const all = this.getAll();
    const now = new Date().toISOString();

    const quotation: Quotation = {
      id: generateId(),
      quote_number: generateQuoteNumber(),
      customer_id: input.customer_id,
      pol: input.pol,
      pod: input.pod,
      transport_mode: input.transport_mode,
      service_type: input.service_type,
      incoterm: input.incoterm,
      cargo_description: input.cargo_description,
      weight_kg: input.weight_kg,
      volume_cbm: input.volume_cbm,
      dimensions: input.dimensions,
      pricing: {
        ...input.pricing,
        total: calculateTotal(input.pricing),
      },
      transit_time_days: input.transit_time_days,
      valid_until: input.valid_until,
      status: 'draft',
      notes: input.notes,
      created_by: userId,
      created_by_name: userName,
      created_at: now,
      updated_at: now,
      version: 1,
    };

    all.push(quotation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    // Record initial revision
    this.recordRevision(quotation.id, [], userId, userName);

    return quotation;
  },

  /**
   * Update an existing quotation
   */
  update(
    id: string,
    input: Partial<QuotationInput>,
    userId: string,
    userName?: string
  ): Quotation | null {
    const all = this.getAll();
    const index = all.findIndex(q => q.id === id);

    if (index === -1) return null;

    const existing = all[index];
    const changes: FieldChange[] = [];

    // Track changes for revision history
    const trackChange = (field: string, oldValue: unknown, newValue: unknown) => {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field, oldValue, newValue });
      }
    };

    // Build updated quotation
    const updated: Quotation = { ...existing };

    if (input.customer_id !== undefined) {
      trackChange('customer_id', existing.customer_id, input.customer_id);
      updated.customer_id = input.customer_id;
    }

    if (input.pol !== undefined) {
      trackChange('pol', existing.pol, input.pol);
      updated.pol = input.pol;
    }

    if (input.pod !== undefined) {
      trackChange('pod', existing.pod, input.pod);
      updated.pod = input.pod;
    }

    if (input.transport_mode !== undefined) {
      trackChange('transport_mode', existing.transport_mode, input.transport_mode);
      updated.transport_mode = input.transport_mode;
    }

    if (input.service_type !== undefined) {
      trackChange('service_type', existing.service_type, input.service_type);
      updated.service_type = input.service_type;
    }

    if (input.incoterm !== undefined) {
      trackChange('incoterm', existing.incoterm, input.incoterm);
      updated.incoterm = input.incoterm;
    }

    if (input.cargo_description !== undefined) {
      trackChange('cargo_description', existing.cargo_description, input.cargo_description);
      updated.cargo_description = input.cargo_description;
    }

    if (input.weight_kg !== undefined) {
      trackChange('weight_kg', existing.weight_kg, input.weight_kg);
      updated.weight_kg = input.weight_kg;
    }

    if (input.volume_cbm !== undefined) {
      trackChange('volume_cbm', existing.volume_cbm, input.volume_cbm);
      updated.volume_cbm = input.volume_cbm;
    }

    if (input.dimensions !== undefined) {
      trackChange('dimensions', existing.dimensions, input.dimensions);
      updated.dimensions = input.dimensions;
    }

    if (input.pricing !== undefined) {
      trackChange('pricing', existing.pricing, input.pricing);
      updated.pricing = {
        ...input.pricing,
        total: calculateTotal(input.pricing),
      };
    }

    if (input.transit_time_days !== undefined) {
      trackChange('transit_time_days', existing.transit_time_days, input.transit_time_days);
      updated.transit_time_days = input.transit_time_days;
    }

    if (input.valid_until !== undefined) {
      trackChange('valid_until', existing.valid_until, input.valid_until);
      updated.valid_until = input.valid_until;
    }

    if (input.notes !== undefined) {
      trackChange('notes', existing.notes, input.notes);
      updated.notes = input.notes;
    }

    updated.updated_at = new Date().toISOString();
    updated.version = existing.version + 1;

    all[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    // Record revision
    if (changes.length > 0) {
      this.recordRevision(id, changes, userId, userName);
    }

    return updated;
  },

  /**
   * Update quotation status
   */
  updateStatus(
    id: string,
    status: QuotationStatus,
    userId: string,
    userName?: string
  ): Quotation | null {
    const all = this.getAll();
    const index = all.findIndex(q => q.id === id);

    if (index === -1) return null;

    const existing = all[index];
    const changes: FieldChange[] = [];

    if (existing.status !== status) {
      changes.push({
        field: 'status',
        oldValue: existing.status,
        newValue: status,
      });
    }

    const updated: Quotation = {
      ...existing,
      status,
      updated_at: new Date().toISOString(),
      version: existing.version + 1,
    };

    all[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    if (changes.length > 0) {
      this.recordRevision(id, changes, userId, userName);
    }

    return updated;
  },

  /**
   * Set quotation outcome
   */
  setOutcome(
    id: string,
    outcome: QuoteOutcome,
    lossReason?: string,
    userId?: string,
    userName?: string
  ): Quotation | null {
    const all = this.getAll();
    const index = all.findIndex(q => q.id === id);

    if (index === -1) return null;

    const existing = all[index];
    const changes: FieldChange[] = [];

    if (existing.outcome !== outcome) {
      changes.push({
        field: 'outcome',
        oldValue: existing.outcome,
        newValue: outcome,
      });
    }

    if (lossReason !== undefined && existing.loss_reason !== lossReason) {
      changes.push({
        field: 'loss_reason',
        oldValue: existing.loss_reason,
        newValue: lossReason,
      });
    }

    const updated: Quotation = {
      ...existing,
      outcome,
      ...(lossReason !== undefined && { loss_reason: lossReason }),
      updated_at: new Date().toISOString(),
      version: existing.version + 1,
    };

    all[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    if (changes.length > 0 && userId) {
      this.recordRevision(id, changes, userId, userName);
    }

    return updated;
  },

  /**
   * Delete a quotation
   */
  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter(q => q.id !== id);

    if (filtered.length === all.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Also delete revisions
    const allRevisions = this.getAllRevisions();
    const remainingRevisions = allRevisions.filter(r => r.quotation_id !== id);
    localStorage.setItem(REVISIONS_STORAGE_KEY, JSON.stringify(remainingRevisions));

    return true;
  },

  /**
   * Get quotation statistics
   */
  getStats(): QuotationStats {
    const quotations = this.getAll();
    const total = quotations.length;
    
    const draft = quotations.filter(q => q.status === 'draft').length;
    const sent = quotations.filter(q => q.status === 'sent').length;
    const accepted = quotations.filter(q => q.status === 'accepted').length;
    const rejected = quotations.filter(q => q.status === 'rejected').length;
    const expired = quotations.filter(q => q.status === 'expired').length;

    const won = quotations.filter(q => q.outcome === 'won').length;
    const withOutcome = quotations.filter(q => q.outcome).length;
    const conversionRate = withOutcome > 0 ? (won / withOutcome) * 100 : 0;

    const totalValue = quotations
      .filter(q => q.status === 'accepted' || q.outcome === 'won')
      .reduce((sum, q) => sum + q.pricing.total, 0);

    return {
      total,
      draft,
      sent,
      accepted,
      rejected,
      expired,
      conversion_rate: parseFloat(conversionRate.toFixed(2)),
      total_value: totalValue,
    };
  },

  /**
   * Get revision history for a quotation
   */
  getRevisions(quotationId: string): QuotationRevision[] {
    return this.getAllRevisions()
      .filter(r => r.quotation_id === quotationId)
      .sort((a, b) => b.version - a.version);
  },

  /**
   * Get all revisions
   */
  getAllRevisions(): QuotationRevision[] {
    try {
      const data = localStorage.getItem(REVISIONS_STORAGE_KEY);
      return data ? (JSON.parse(data) as QuotationRevision[]) : [];
    } catch (error) {
      console.error('Failed to load revisions:', error);
      return [];
    }
  },

  /**
   * Record a revision
   */
  recordRevision(
    quotationId: string,
    changes: FieldChange[],
    userId: string,
    userName?: string
  ): QuotationRevision {
    const revisions = this.getAllRevisions();
    const quotation = this.getById(quotationId);
    
    const revision: QuotationRevision = {
      id: generateId(),
      quotation_id: quotationId,
      version: quotation?.version || 1,
      changes,
      created_by: userId,
      created_by_name: userName,
      created_at: new Date().toISOString(),
    };

    revisions.push(revision);
    localStorage.setItem(REVISIONS_STORAGE_KEY, JSON.stringify(revisions));

    return revision;
  },

  /**
   * Clear all data (for testing)
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REVISIONS_STORAGE_KEY);
  },
};

export default quotationService;
