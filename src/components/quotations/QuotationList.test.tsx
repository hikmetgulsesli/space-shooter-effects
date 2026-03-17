import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QuotationList } from './QuotationList';
import { QuotationForm } from './QuotationForm';
import { QuotationDetail } from './QuotationDetail';
import type { Quotation, QuotationFilters } from '../../types/quotation';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => React.createElement('span', null, '🔍'),
  Filter: () => React.createElement('span', null, '🔧'),
  FileText: () => React.createElement('span', null, '📄'),
  Calendar: () => React.createElement('span', null, '📅'),
  Ship: () => React.createElement('span', null, '🚢'),
  Plane: () => React.createElement('span', null, '✈️'),
  Truck: () => React.createElement('span', null, '🚛'),
  Train: () => React.createElement('span', null, '🚂'),
  MoreHorizontal: () => React.createElement('span', null, '⋯'),
  ChevronLeft: () => React.createElement('span', null, '←'),
  ChevronRight: () => React.createElement('span', null, '→'),
  ArrowLeft: () => React.createElement('span', null, '←'),
  Edit: () => React.createElement('span', null, '✏️'),
  Trash2: () => React.createElement('span', null, '🗑️'),
  Clock: () => React.createElement('span', null, '🕐'),
  User: () => React.createElement('span', null, '👤'),
  MapPin: () => React.createElement('span', null, '📍'),
  Package: () => React.createElement('span', null, '📦'),
  DollarSign: () => React.createElement('span', null, '$'),
  Weight: () => React.createElement('span', null, '⚖️'),
  Ruler: () => React.createElement('span', null, '📏'),
  History: () => React.createElement('span', null, '📜'),
  CheckCircle: () => React.createElement('span', null, '✅'),
  XCircle: () => React.createElement('span', null, '❌'),
  AlertCircle: () => React.createElement('span', null, '⚠️'),
  Send: () => React.createElement('span', null, '📤'),
  RotateCcw: () => React.createElement('span', null, '↩️'),
  X: () => React.createElement('span', null, '✕'),
}));

describe('QuotationList', () => {
  const mockQuotations: Quotation[] = [
    {
      id: '1',
      quote_number: 'Q-2024-0001',
      customer_id: 'cust-1',
      customer_name: 'Test Customer',
      pol: { code: 'NYC', name: 'New York', country: 'USA' },
      pod: { code: 'LON', name: 'London', country: 'UK' },
      transport_mode: 'sea',
      service_type: 'fcl',
      incoterm: 'fob',
      cargo_description: 'Electronics',
      pricing: {
        base_rate: 1000,
        currency: 'usd',
        total: 1000,
      },
      valid_until: '2024-12-31',
      status: 'draft',
      created_by: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      version: 1,
    },
  ];

  const defaultProps = {
    quotations: mockQuotations,
    total: 1,
    page: 1,
    limit: 20,
    hasMore: false,
    filters: {} as QuotationFilters,
    onFilterChange: vi.fn(),
    onPageChange: vi.fn(),
    onSelectQuotation: vi.fn(),
    onCreateQuotation: vi.fn(),
    customers: [{ id: 'cust-1', name: 'Test Customer' }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the quotation list', () => {
    render(React.createElement(QuotationList, defaultProps));
    expect(screen.getByText('Quotations')).toBeInTheDocument();
    expect(screen.getByText('Q-2024-0001')).toBeInTheDocument();
  });

  it('filters work correctly', async () => {
    render(React.createElement(QuotationList, defaultProps));
    
    // Open filters
    const filterButton = screen.getByText('🔧 Filters');
    fireEvent.click(filterButton);
    
    // Change status filter
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'sent' } });
    
    await waitFor(() => {
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'sent' })
      );
    });
  });

  it('search query works', async () => {
    render(React.createElement(QuotationList, defaultProps));
    
    const searchInput = screen.getByPlaceholderText('Search by quote number, customer, cargo...');
    fireEvent.change(searchInput, { target: { value: 'electronics' } });
    
    await waitFor(() => {
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ search_query: 'electronics' })
      );
    });
  });

  it('calls onCreateQuotation when new quotation button clicked', () => {
    render(React.createElement(QuotationList, defaultProps));
    
    const createButton = screen.getByText('📄 New Quotation');
    fireEvent.click(createButton);
    
    expect(defaultProps.onCreateQuotation).toHaveBeenCalled();
  });

  it('calls onSelectQuotation when row clicked', () => {
    render(React.createElement(QuotationList, defaultProps));
    
    const row = screen.getByText('Q-2024-0001');
    fireEvent.click(row);
    
    expect(defaultProps.onSelectQuotation).toHaveBeenCalledWith(mockQuotations[0]);
  });
});

describe('QuotationForm', () => {
  const defaultProps = {
    customers: [{ id: 'cust-1', name: 'Test Customer' }],
    lookupValues: {
      transportModes: [
        { id: '1', category: 'transport_modes', value: 'sea', label: 'Sea', sort_order: 1, is_active: true, created_at: '', updated_at: '' },
      ],
      serviceTypes: [
        { id: '1', category: 'service_types', value: 'fcl', label: 'FCL', sort_order: 1, is_active: true, created_at: '', updated_at: '' },
      ],
      incoterms: [
        { id: '1', category: 'incoterms', value: 'fob', label: 'FOB', sort_order: 1, is_active: true, created_at: '', updated_at: '' },
      ],
      currencies: [
        { id: '1', category: 'currencies', value: 'usd', label: 'USD', sort_order: 1, is_active: true, created_at: '', updated_at: '' },
      ],
    },
    currentUser: { id: 'user-1', name: 'Test User' },
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the quotation form', () => {
    render(React.createElement(QuotationForm, defaultProps));
    expect(screen.getByText('New Quotation')).toBeInTheDocument();
    expect(screen.getByText('Customer *')).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    render(React.createElement(QuotationForm, defaultProps));
    
    // Try to submit without filling required fields
    const submitButton = screen.getByText('Create Quotation');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Customer is required')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    render(React.createElement(QuotationForm, defaultProps));
    
    // Fill in required fields
    const customerSelect = screen.getByLabelText('Customer *');
    fireEvent.change(customerSelect, { target: { value: 'cust-1' } });
    
    // Fill in location fields
    const polCodeInput = screen.getByPlaceholderText('Port Code (e.g., NYC)');
    fireEvent.change(polCodeInput, { target: { value: 'NYC' } });
    
    const polNameInput = screen.getAllByPlaceholderText('Port Name')[0];
    fireEvent.change(polNameInput, { target: { value: 'New York' } });
    
    const podCodeInput = screen.getByPlaceholderText('Port Code (e.g., LON)');
    fireEvent.change(podCodeInput, { target: { value: 'LON' } });
    
    const podNameInput = screen.getAllByPlaceholderText('Port Name')[1];
    fireEvent.change(podNameInput, { target: { value: 'London' } });
    
    // Fill in incoterm
    const incotermSelect = screen.getByLabelText('Incoterm *');
    fireEvent.change(incotermSelect, { target: { value: 'fob' } });
    
    // Fill in cargo description
    const cargoInput = screen.getByPlaceholderText('Describe the cargo...');
    fireEvent.change(cargoInput, { target: { value: 'Test cargo' } });
    
    // Switch to pricing tab and fill base rate
    const pricingTab = screen.getByText('Pricing');
    fireEvent.click(pricingTab);
    
    const baseRateInput = screen.getByLabelText(/Base Rate/i);
    fireEvent.change(baseRateInput, { target: { value: '1000' } });
    
    // Submit form
    const submitButton = screen.getByText('Create Quotation');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button clicked', () => {
    render(React.createElement(QuotationForm, defaultProps));
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });
});

describe('QuotationDetail', () => {
  const mockQuotation: Quotation = {
    id: '1',
    quote_number: 'Q-2024-0001',
    customer_id: 'cust-1',
    customer_name: 'Test Customer',
    pol: { code: 'NYC', name: 'New York', country: 'USA' },
    pod: { code: 'LON', name: 'London', country: 'UK' },
    transport_mode: 'sea',
    service_type: 'fcl',
    incoterm: 'fob',
    cargo_description: 'Electronics',
    pricing: {
      base_rate: 1000,
      fuel_surcharge: 100,
      total: 1100,
      currency: 'usd',
    },
    valid_until: '2024-12-31',
    status: 'draft',
    created_by: 'user-1',
    created_by_name: 'Test User',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    version: 1,
  };

  const mockRevisions = [
    {
      id: 'rev-1',
      quotation_id: '1',
      version: 1,
      changes: [],
      created_by: 'user-1',
      created_by_name: 'Test User',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'rev-2',
      quotation_id: '1',
      version: 2,
      changes: [
        { field: 'pricing.base_rate', oldValue: 900, newValue: 1000 },
      ],
      created_by: 'user-1',
      created_by_name: 'Test User',
      created_at: '2024-01-02T00:00:00Z',
    },
  ];

  const defaultProps = {
    quotation: mockQuotation,
    revisions: mockRevisions,
    onBack: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onStatusChange: vi.fn(),
    onSetOutcome: vi.fn(),
    currentUser: { id: 'user-1', name: 'Test User' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders quotation details', () => {
    render(React.createElement(QuotationDetail, defaultProps));
    
    expect(screen.getByText('Q-2024-0001')).toBeInTheDocument();
    expect(screen.getByText('Test Customer')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('displays revision history', () => {
    render(React.createElement(QuotationDetail, defaultProps));
    
    const historyTab = screen.getByText('📜 Revision History');
    fireEvent.click(historyTab);
    
    expect(screen.getByText('Initial creation')).toBeInTheDocument();
  });

  it('calls onBack when back button clicked', () => {
    render(React.createElement(QuotationDetail, defaultProps));
    
    const backButton = screen.getAllByText('←')[0];
    fireEvent.click(backButton);
    
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('calls onEdit when edit button clicked', () => {
    render(React.createElement(QuotationDetail, defaultProps));
    
    const editButton = screen.getByText('✏️ Edit');
    fireEvent.click(editButton);
    
    expect(defaultProps.onEdit).toHaveBeenCalled();
  });

  it('calls onStatusChange when status buttons clicked', async () => {
    render(React.createElement(QuotationDetail, defaultProps));
    
    const markAsSentButton = screen.getByText('Mark as Sent');
    fireEvent.click(markAsSentButton);
    
    await waitFor(() => {
      expect(defaultProps.onStatusChange).toHaveBeenCalledWith('sent');
    });
  });

  it('displays pricing breakdown correctly', () => {
    render(React.createElement(QuotationDetail, defaultProps));
    
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Base Rate')).toBeInTheDocument();
  });
});
