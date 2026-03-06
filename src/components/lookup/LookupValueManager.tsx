import React, { useState, useCallback, useMemo } from 'react';
import type {
  LookupValue,
  LookupCategory,
  LookupValueInput,
} from '../../types/lookup.js';
import { LOOKUP_CATEGORIES } from '../../types/lookup.js';
import { lookupService } from '../../services/lookupService.js';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Search,
} from 'lucide-react';

interface LookupValueManagerProps {
  onValuesChange?: () => void;
}

interface EditingValue {
  id: string;
  label: string;
  value: string;
}

interface DragState {
  category: LookupCategory | null;
  draggedId: string | null;
  targetId: string | null;
}

export function LookupValueManager({ onValuesChange }: LookupValueManagerProps) {
  const [groupedValues, setGroupedValues] = useState(() =>
    lookupService.getGrouped()
  );
  const [expandedCategories, setExpandedCategories] = useState<
    Set<LookupCategory>
  >(new Set());
  const [editingValue, setEditingValue] = useState<EditingValue | null>(null);
  const [addingCategory, setAddingCategory] = useState<LookupCategory | null>(
    null
  );
  const [newValueLabel, setNewValueLabel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragState, setDragState] = useState<DragState>({
    category: null,
    draggedId: null,
    targetId: null,
  });
  const [showWarning, setShowWarning] = useState<{
    lookupId: string;
    action: 'edit' | 'deactivate';
  } | null>(null);

  const refreshValues = useCallback(() => {
    setGroupedValues(lookupService.getGrouped());
    onValuesChange?.();
  }, [onValuesChange]);

  const toggleCategory = useCallback((category: LookupCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handleStartAdd = useCallback((category: LookupCategory) => {
    setAddingCategory(category);
    setNewValueLabel('');
    setExpandedCategories((prev) => new Set([...prev, category]));
  }, []);

  const handleCancelAdd = useCallback(() => {
    setAddingCategory(null);
    setNewValueLabel('');
  }, []);

  const handleSaveNew = useCallback(() => {
    if (!addingCategory || !newValueLabel.trim()) return;

    const input: LookupValueInput = {
      category: addingCategory,
      value: newValueLabel.toLowerCase().replace(/\s+/g, '_'),
      label: newValueLabel.trim(),
    };

    lookupService.create(input);
    refreshValues();
    setAddingCategory(null);
    setNewValueLabel('');
  }, [addingCategory, newValueLabel, refreshValues]);

  const handleStartEdit = useCallback((value: LookupValue) => {
    const warning = lookupService.getUsageWarning(value.id);
    if (warning.show) {
      setShowWarning({ lookupId: value.id, action: 'edit' });
    }
    setEditingValue({
      id: value.id,
      label: value.label,
      value: value.value,
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingValue(null);
    setShowWarning(null);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingValue || !editingValue.label.trim()) return;

    lookupService.update(editingValue.id, {
      label: editingValue.label.trim(),
    });
    refreshValues();
    setEditingValue(null);
    setShowWarning(null);
  }, [editingValue, refreshValues]);

  const handleDeactivate = useCallback((id: string) => {
    const warning = lookupService.getUsageWarning(id);
    if (warning.show) {
      setShowWarning({ lookupId: id, action: 'deactivate' });
      return;
    }
    lookupService.deactivate(id);
    refreshValues();
  }, [refreshValues]);

  const handleReactivate = useCallback((id: string) => {
    lookupService.reactivate(id);
    refreshValues();
  }, [refreshValues]);

  const confirmWarningAction = useCallback(() => {
    if (!showWarning) return;

    if (showWarning.action === 'deactivate') {
      lookupService.deactivate(showWarning.lookupId);
    }
    // For edit, we already opened the edit form

    setShowWarning(null);
    refreshValues();
  }, [showWarning, refreshValues]);

  const handleDragStart = useCallback(
    (e: React.DragEvent, category: LookupCategory, id: string) => {
      setDragState({ category, draggedId: id, targetId: null });
      e.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, category: LookupCategory, targetId: string) => {
      e.preventDefault();
      if (dragState.category !== category) return;
      setDragState((prev) => ({ ...prev, targetId }));
    },
    [dragState.category]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, category: LookupCategory, targetId: string) => {
      e.preventDefault();
      if (!dragState.draggedId || dragState.category !== category) return;

      const group = groupedValues.find((g) => g.category === category);
      if (!group) return;

      const reorderedIds = group.values.map((v) => v.id);
      const fromIndex = reorderedIds.indexOf(dragState.draggedId);
      const toIndex = reorderedIds.indexOf(targetId);

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        setDragState({ category: null, draggedId: null, targetId: null });
        return;
      }

      reorderedIds.splice(fromIndex, 1);
      reorderedIds.splice(toIndex, 0, dragState.draggedId);

      lookupService.reorder(category, reorderedIds);
      refreshValues();
      setDragState({ category: null, draggedId: null, targetId: null });
    },
    [dragState, groupedValues, refreshValues]
  );

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedValues;

    const query = searchQuery.toLowerCase();
    return groupedValues
      .map((group) => ({
        ...group,
        values: group.values.filter(
          (v) =>
            v.label.toLowerCase().includes(query) ||
            v.value.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.values.length > 0);
  }, [groupedValues, searchQuery]);

  const getCategoryMeta = (category: LookupCategory) =>
    LOOKUP_CATEGORIES.find((c) => c.key === category);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Lookup Values Management
          </h2>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search lookup values..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Warning</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This lookup value is used in{' '}
              {lookupService.getUsageCount(showWarning.lookupId).count} records.
              {showWarning.action === 'deactivate'
                ? ' Deactivating it will hide it from new records but preserve existing data.'
                : ' Editing it will affect all existing records.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWarning(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmWarningAction}
                className="px-4 py-2 text-white bg-amber-600 rounded-md hover:bg-amber-700"
              >
                {showWarning.action === 'deactivate'
                  ? 'Deactivate Anyway'
                  : 'Continue Editing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="divide-y divide-gray-200">
        {filteredGroups.map((group) => {
          const meta = getCategoryMeta(group.category);
          const isExpanded = expandedCategories.has(group.category);
          const activeCount = group.values.filter((v) => v.is_active).length;

          return (
            <div key={group.category} className="p-4">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(group.category)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">
                      {group.label}
                    </h3>
                    {meta && (
                      <p className="text-sm text-gray-500">
                        {meta.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {activeCount} active / {group.values.length} total
                  </span>
                </div>
              </button>

              {/* Values List */}
              {isExpanded && (
                <div className="mt-3 ml-8 space-y-2">
                  {group.values.map((value) => {
                    const isEditing = editingValue?.id === value.id;
                    const isDragging = dragState.draggedId === value.id;
                    const isTarget = dragState.targetId === value.id;
                    const usage = lookupService.getUsageCount(value.id);

                    return (
                      <div
                        key={value.id}
                        draggable={!isEditing}
                        onDragStart={(e) =>
                          handleDragStart(e, group.category, value.id)
                        }
                        onDragOver={(e) =>
                          handleDragOver(e, group.category, value.id)
                        }
                        onDrop={(e) =>
                          handleDrop(e, group.category, value.id)
                        }
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border
                          ${isDragging ? 'opacity-50' : ''}
                          ${isTarget ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}
                          ${!value.is_active ? 'bg-gray-50 opacity-60' : 'bg-white'}
                          ${!isEditing ? 'cursor-move' : ''}
                          transition-all
                        `}
                      >
                        {!isEditing && (
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        )}

                        <div className="flex-1">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingValue.label}
                                onChange={(e) =>
                                  setEditingValue({
                                    ...editingValue,
                                    label: e.target.value,
                                  })
                                }
                                className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                              <button
                                onClick={handleSaveEdit}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-medium ${
                                  !value.is_active
                                    ? 'text-gray-500 line-through'
                                    : 'text-gray-900'
                                }`}
                              >
                                {value.label}
                              </span>
                              <span className="text-sm text-gray-400">
                                ({value.value})
                              </span>
                              {usage.count > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  {usage.count} uses
                                </span>
                              )}
                              {!value.is_active && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(value)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {value.is_active ? (
                              <button
                                onClick={() => handleDeactivate(value.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Deactivate"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(value.id)}
                                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                title="Reactivate"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add New Value */}
                  {addingCategory === group.category ? (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <input
                        type="text"
                        value={newValueLabel}
                        onChange={(e) => setNewValueLabel(e.target.value)}
                        placeholder="Enter new value label..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveNew();
                          if (e.key === 'Escape') handleCancelAdd();
                        }}
                      />
                      <button
                        onClick={handleSaveNew}
                        disabled={!newValueLabel.trim()}
                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                      <button
                        onClick={handleCancelAdd}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartAdd(group.category)}
                      className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Value</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No lookup values found matching &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
}

export default LookupValueManager;
