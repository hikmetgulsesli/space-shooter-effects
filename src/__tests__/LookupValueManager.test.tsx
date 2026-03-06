import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { LookupValueManager } from '../components/lookup/LookupValueManager';
import { lookupService } from '../services/lookupService';
import type { GroupedLookupValues } from '../types/lookup';

// Mock the lookup service
vi.mock('../services/lookupService', () => ({
  lookupService: {
    getGrouped: vi.fn(),
    getByCategory: vi.fn(),
    getActiveByCategory: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    reactivate: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
    getUsageCount: vi.fn(),
    recordUsage: vi.fn(),
    isInUse: vi.fn(),
    getUsageWarning: vi.fn(),
    resetToDefaults: vi.fn(),
  },
}));

const mockGroupedValues: GroupedLookupValues[] = [
  {
    category: 'transport_modes',
    label: 'Transport Modes',
    values: [
      {
        id: '1',
        category: 'transport_modes',
        value: 'air',
        label: 'Air',
        sort_order: 1,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: '2',
        category: 'transport_modes',
        value: 'sea',
        label: 'Sea',
        sort_order: 2,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ],
  },
  {
    category: 'statuses',
    label: 'Statuses',
    values: [
      {
        id: '3',
        category: 'statuses',
        value: 'draft',
        label: 'Draft',
        sort_order: 1,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: '4',
        category: 'statuses',
        value: 'archived',
        label: 'Archived',
        sort_order: 2,
        is_active: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ],
  },
];

describe('LookupValueManager', () => {
  const mockOnValuesChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (lookupService.getGrouped as ReturnType<typeof vi.fn>).mockReturnValue(
      mockGroupedValues
    );
    (lookupService.getUsageCount as ReturnType<typeof vi.fn>).mockReturnValue({
      lookupId: '1',
      count: 0,
      entities: [],
    });
    (lookupService.getUsageWarning as ReturnType<typeof vi.fn>).mockReturnValue(
      {
        show: false,
        count: 0,
      }
    );
  });

  it('should render the component with title', () => {
    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    expect(
      screen.getByText('Lookup Values Management')
    ).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    expect(
      screen.getByPlaceholderText('Search lookup values...')
    ).toBeInTheDocument();
  });

  it('should render category groups', () => {
    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    expect(screen.getByText('Transport Modes')).toBeInTheDocument();
    expect(screen.getByText('Statuses')).toBeInTheDocument();
  });

  it('should show active/total counts for each category', () => {
    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    expect(screen.getByText('2 active / 2 total')).toBeInTheDocument(); // Transport Modes
    expect(screen.getByText('1 active / 2 total')).toBeInTheDocument(); // Statuses
  });

  it('should expand category when clicked', () => {
    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    const transportModesHeader = screen
      .getByText('Transport Modes')
      .closest('button');
    fireEvent.click(transportModesHeader!);

    expect(screen.getByText('Air')).toBeInTheDocument();
    expect(screen.getByText('Sea')).toBeInTheDocument();
  });

  it('should show add value button when category is expanded', () => {
    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    const transportModesHeader = screen
      .getByText('Transport Modes')
      .closest('button');
    fireEvent.click(transportModesHeader!);

    expect(screen.getByText('Add Value')).toBeInTheDocument();
  });

  it('should show add value form when add button is clicked', () => {
    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    const transportModesHeader = screen
      .getByText('Transport Modes')
      .closest('button');
    fireEvent.click(transportModesHeader!);
    fireEvent.click(screen.getByText('Add Value'));

    expect(
      screen.getByPlaceholderText('Enter new value label...')
    ).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should create new lookup value when add form is submitted', async () => {
    (lookupService.create as ReturnType<typeof vi.fn>).mockReturnValue({
      id: 'new-id',
      category: 'transport_modes',
      value: 'rail',
      label: 'Rail',
      sort_order: 3,
      is_active: true,
    });

    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    const transportModesHeader = screen
      .getByText('Transport Modes')
      .closest('button');
    fireEvent.click(transportModesHeader!);
    fireEvent.click(screen.getByText('Add Value'));

    const input = screen.getByPlaceholderText('Enter new value label...');
    fireEvent.change(input, { target: { value: 'Rail' } });
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(lookupService.create).toHaveBeenCalledWith({
        category: 'transport_modes',
        value: 'rail',
        label: 'Rail',
      });
    });
    expect(mockOnValuesChange).toHaveBeenCalled();
  });

  it('should cancel adding when cancel button is clicked', () => {
    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    const transportModesHeader = screen
      .getByText('Transport Modes')
      .closest('button');
    fireEvent.click(transportModesHeader!);
    fireEvent.click(screen.getByText('Add Value'));
    fireEvent.click(screen.getByText('Cancel'));

    expect(
      screen.queryByPlaceholderText('Enter new value label...')
    ).not.toBeInTheDocument();
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    const transportModesHeader = screen
      .getByText('Transport Modes')
      .closest('button');
    fireEvent.click(transportModesHeader!);

    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByDisplayValue('Air')).toBeInTheDocument();
  });

  it('should update lookup value when edit is saved', async () => {
    (lookupService.update as ReturnType<typeof vi.fn>).mockReturnValue({
      id: '1',
      category: 'transport_modes',
      value: 'air',
      label: 'Air Freight',
      sort_order: 1,
      is_active: true,
    });

    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    const transportModesHeader = screen
      .getByText('Transport Modes')
      .closest('button');
    fireEvent.click(transportModesHeader!);

    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]);

    const input = screen.getByDisplayValue('Air');
    fireEvent.change(input, { target: { value: 'Air Freight' } });

    // Find the save button (Check icon)
    const saveButton = screen.getAllByRole('button').find(
      btn => btn.querySelector('svg')?.classList?.contains('lucide-check')
    );
    if (saveButton) {
      fireEvent.click(saveButton);
    }

    await waitFor(() => {
      expect(lookupService.update).toHaveBeenCalledWith('1', {
        label: 'Air Freight',
      });
    });
  });

  it('should deactivate a lookup value', async () => {
    (lookupService.deactivate as ReturnType<typeof vi.fn>).mockReturnValue({
      id: '1',
      is_active: false,
    });

    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    const transportModesHeader = screen
      .getByText('Transport Modes')
      .closest('button');
    fireEvent.click(transportModesHeader!);

    const deleteButtons = screen.getAllByTitle('Deactivate');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(lookupService.deactivate).toHaveBeenCalledWith('1');
    });
  });

  it('should show inactive styling for deactivated values', () => {
    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    const statusesHeader = screen.getByText('Statuses').closest('button');
    fireEvent.click(statusesHeader!);

    // Archived should be inactive
    const archivedLabel = screen.getByText('Archived');
    expect(archivedLabel).toHaveClass('line-through');
  });

  it('should filter values based on search query', () => {
    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    const searchInput = screen.getByPlaceholderText('Search lookup values...');
    fireEvent.change(searchInput, { target: { value: 'Air' } });

    // Should show only matching categories
    expect(screen.getByText('Transport Modes')).toBeInTheDocument();
    expect(screen.queryByText('Statuses')).not.toBeInTheDocument();
  });

  it('should show usage count badges', () => {
    (lookupService.getUsageCount as ReturnType<typeof vi.fn>).mockReturnValue({
      lookupId: '1',
      count: 12,
      entities: ['customers', 'quotes'],
    });

    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    const transportModesHeader = screen
      .getByText('Transport Modes')
      .closest('button');
    fireEvent.click(transportModesHeader!);

    expect(screen.getByText('12 uses')).toBeInTheDocument();
  });

  it('should show warning modal for widely used values', () => {
    (lookupService.getUsageWarning as ReturnType<typeof vi.fn>).mockReturnValue(
      {
        show: true,
        count: 10,
      }
    );

    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    const transportModesHeader = screen
      .getByText('Transport Modes')
      .closest('button');
    fireEvent.click(transportModesHeader!);

    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(
      screen.getByText(/This lookup value is used in 10 records/)
    ).toBeInTheDocument();
  });

  it('should show empty state when no search results', () => {
    render(<LookupValueManager onValuesChange={mockOnValuesChange} />);

    const searchInput = screen.getByPlaceholderText('Search lookup values...');
    fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });

    expect(
      screen.getByText(/No lookup values found matching/)
    ).toBeInTheDocument();
  });
});
