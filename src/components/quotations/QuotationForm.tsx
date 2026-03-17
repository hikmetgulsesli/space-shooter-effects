import React, { useState, useCallback } from 'react';
import type {
  QuotationInput,
  TransportMode,
  ServiceType,
  Quotation,
} from '../../types/quotation';
import type { LookupValue } from '../../types/lookup';
import {
  Plane,
  Ship,
  Truck,
  Train,
  Calendar,
  DollarSign,
  Package,
  MapPin,
  Weight,
  Ruler,
  FileText,
  X,
} from 'lucide-react';

interface QuotationFormProps {
  quotation?: Quotation | null;
  customers: { id: string; name: string }[];
  lookupValues: {
    transportModes: LookupValue[];
    serviceTypes: LookupValue[];
    incoterms: LookupValue[];
    currencies: LookupValue[];
  };
  currentUser: { id: string; name?: string };
  onSubmit: (data: QuotationInput) => void;
  onCancel: () => void;
}

const transportOptions: { value: TransportMode; label: string; icon: React.ReactNode }[] = [
  { value: 'air', label: 'Air', icon: <Plane className="w-5 h-5" /> },
  { value: 'sea', label: 'Sea', icon: <Ship className="w-5 h-5" /> },
  { value: 'road', label: 'Road', icon: <Truck className="w-5 h-5" /> },
  { value: 'rail', label: 'Rail', icon: <Train className="w-5 h-5" /> },
];

const serviceOptions: { value: ServiceType; label: string }[] = [
  { value: 'ftl', label: 'FTL (Full Truck Load)' },
  { value: 'ltl', label: 'LTL (Less Than Truck Load)' },
  { value: 'fcl', label: 'FCL (Full Container Load)' },
  { value: 'lcl', label: 'LCL (Less Than Container Load)' },
  { value: 'express', label: 'Express' },
];

const defaultPricing = {
  base_rate: 0,
  fuel_surcharge: 0,
  security_fee: 0,
  documentation_fee: 0,
  customs_fee: 0,
  insurance_fee: 0,
  other_charges: 0,
  discount: 0,
  currency: 'usd',
};

const defaultLocation = {
  code: '',
  name: '',
  country: '',
};

export function QuotationForm({
  quotation,
  customers,
  lookupValues,
  currentUser,
  onSubmit,
  onCancel,
}: QuotationFormProps) {
  const [formData, setFormData] = useState<QuotationInput>({
    customer_id: quotation?.customer_id || '',
    pol: quotation?.pol || { ...defaultLocation },
    pod: quotation?.pod || { ...defaultLocation },
    transport_mode: quotation?.transport_mode || 'sea',
    service_type: quotation?.service_type || 'fcl',
    incoterm: quotation?.incoterm || '',
    cargo_description: quotation?.cargo_description || '',
    weight_kg: quotation?.weight_kg,
    volume_cbm: quotation?.volume_cbm,
    dimensions: quotation?.dimensions,
    pricing: quotation
      ? {
          base_rate: quotation.pricing.base_rate,
          fuel_surcharge: quotation.pricing.fuel_surcharge || 0,
          security_fee: quotation.pricing.security_fee || 0,
          documentation_fee: quotation.pricing.documentation_fee || 0,
          customs_fee: quotation.pricing.customs_fee || 0,
          insurance_fee: quotation.pricing.insurance_fee || 0,
          other_charges: quotation.pricing.other_charges || 0,
          discount: quotation.pricing.discount || 0,
          currency: quotation.pricing.currency,
        }
      : { ...defaultPricing },
    transit_time_days: quotation?.transit_time_days,
    valid_until:
      quotation?.valid_until ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: quotation?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'details' | 'pricing'>('details');

  const isEditing = !!quotation;

  const calculateTotal = useCallback(() => {
    const p = formData.pricing;
    return (
      (p.base_rate || 0) +
      (p.fuel_surcharge || 0) +
      (p.security_fee || 0) +
      (p.documentation_fee || 0) +
      (p.customs_fee || 0) +
      (p.insurance_fee || 0) +
      (p.other_charges || 0) -
      (p.discount || 0)
    );
  }, [formData.pricing]);

  const handleChange = useCallback(
    <K extends keyof QuotationInput>(field: K, value: QuotationInput[K]) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    },
    [errors]
  );

  const handleLocationChange = useCallback(
    (field: 'pol' | 'pod', subfield: keyof QuotationInput['pol'], value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: { ...prev[field], [subfield]: value },
      }));
      if (errors[`${field}.${subfield}`]) {
        setErrors(prev => ({ ...prev, [`${field}.${subfield}`]: '' }));
      }
    },
    [errors]
  );

  const handlePricingChange = useCallback(
    (field: keyof QuotationInput['pricing'], value: number | string) => {
      setFormData(prev => ({
        ...prev,
        pricing: { ...prev.pricing, [field]: value },
      }));
    },
    []
  );

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }

    if (!formData.pol.code || !formData.pol.name) {
      newErrors['pol.code'] = 'Port of Loading is required';
    }

    if (!formData.pod.code || !formData.pod.name) {
      newErrors['pod.code'] = 'Port of Discharge is required';
    }

    if (!formData.incoterm) {
      newErrors.incoterm = 'Incoterm is required';
    }

    if (!formData.cargo_description.trim()) {
      newErrors.cargo_description = 'Cargo description is required';
    }

    if (!formData.valid_until) {
      newErrors.valid_until = 'Valid until date is required';
    }

    if (formData.pricing.base_rate <= 0) {
      newErrors.base_rate = 'Base rate must be greater than 0';
    }

    if (!formData.pricing.currency) {
      newErrors.currency = 'Currency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (validate()) {
        onSubmit(formData);
      }
    },
    [formData, onSubmit, validate]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.pricing.currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Quotation' : 'New Quotation'}
          </h2>
          <p className="text-sm text-gray-500">
            {isEditing
              ? `Quote #${quotation?.quote_number}`
              : 'Create a new freight quotation'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-gray-200">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pricing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pricing
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'details' ? (
          <div className="space-y-6">
            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer *
              </label>
              <select
                value={formData.customer_id}
                onChange={e => handleChange('customer_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customer_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {errors.customer_id && (
                <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>
              )}
            </div>

            {/* Transport Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport Mode *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {transportOptions.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange('transport_mode', value)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      formData.transport_mode === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {icon}
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {serviceOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange('service_type', value)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.service_type === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Route - POL/POD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* POL */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Port of Loading (POL) *
                </label>
                <input
                  type="text"
                  placeholder="Port Code (e.g., NYC)"
                  value={formData.pol.code}
                  onChange={e =>
                    handleLocationChange('pol', 'code', e.target.value.toUpperCase())
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['pol.code'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Port Name"
                  value={formData.pol.name}
                  onChange={e => handleLocationChange('pol', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.pol.country}
                  onChange={e =>
                    handleLocationChange('pol', 'country', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors['pol.code'] && (
                  <p className="text-sm text-red-600">{errors['pol.code']}</p>
                )}
              </div>

              {/* POD */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Port of Discharge (POD) *
                </label>
                <input
                  type="text"
                  placeholder="Port Code (e.g., LON)"
                  value={formData.pod.code}
                  onChange={e =>
                    handleLocationChange('pod', 'code', e.target.value.toUpperCase())
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['pod.code'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Port Name"
                  value={formData.pod.name}
                  onChange={e => handleLocationChange('pod', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.pod.country}
                  onChange={e =>
                    handleLocationChange('pod', 'country', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors['pod.code'] && (
                  <p className="text-sm text-red-600">{errors['pod.code']}</p>
                )}
              </div>
            </div>

            {/* Incoterm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incoterm *
              </label>
              <select
                value={formData.incoterm}
                onChange={e => handleChange('incoterm', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.incoterm ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select an incoterm</option>
                {lookupValues.incoterms.map(incoterm => (
                  <option key={incoterm.id} value={incoterm.value}>
                    {incoterm.label}
                  </option>
                ))}
              </select>
              {errors.incoterm && (
                <p className="mt-1 text-sm text-red-600">{errors.incoterm}</p>
              )}
            </div>

            {/* Cargo Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Package className="inline w-4 h-4 mr-1" />
                Cargo Description *
              </label>
              <textarea
                value={formData.cargo_description}
                onChange={e => handleChange('cargo_description', e.target.value)}
                placeholder="Describe the cargo..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cargo_description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cargo_description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.cargo_description}
                </p>
              )}
            </div>

            {/* Weight and Volume */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Weight className="inline w-4 h-4 mr-1" />
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.weight_kg || ''}
                  onChange={e =>
                    handleChange(
                      'weight_kg',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume (CBM)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.volume_cbm || ''}
                  onChange={e =>
                    handleChange(
                      'volume_cbm',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Ruler className="inline w-4 h-4 mr-1" />
                  Transit Time (days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.transit_time_days || ''}
                  onChange={e =>
                    handleChange(
                      'transit_time_days',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline w-4 h-4 mr-1" />
                Valid Until *
              </label>
              <input
                type="date"
                value={formData.valid_until}
                onChange={e => handleChange('valid_until', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.valid_until ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.valid_until && (
                <p className="mt-1 text-sm text-red-600">{errors.valid_until}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="inline w-4 h-4 mr-1" />
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="Additional notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          /* Pricing Tab */
          <div className="space-y-6">
            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                value={formData.pricing.currency}
                onChange={e => handlePricingChange('currency', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.currency ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {lookupValues.currencies.map(currency => (
                  <option key={currency.id} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
              )}
            </div>

            {/* Base Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Base Rate *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.pricing.base_rate || ''}
                onChange={e =>
                  handlePricingChange('base_rate', parseFloat(e.target.value) || 0)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.base_rate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.base_rate && (
                <p className="mt-1 text-sm text-red-600">{errors.base_rate}</p>
              )}
            </div>

            {/* Additional Charges */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">
                Additional Charges
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fuel Surcharge
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricing.fuel_surcharge || ''}
                    onChange={e =>
                      handlePricingChange(
                        'fuel_surcharge',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Security Fee
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricing.security_fee || ''}
                    onChange={e =>
                      handlePricingChange(
                        'security_fee',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Documentation Fee
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricing.documentation_fee || ''}
                    onChange={e =>
                      handlePricingChange(
                        'documentation_fee',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Customs Fee
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricing.customs_fee || ''}
                    onChange={e =>
                      handlePricingChange(
                        'customs_fee',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Insurance Fee
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricing.insurance_fee || ''}
                    onChange={e =>
                      handlePricingChange(
                        'insurance_fee',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Other Charges
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricing.other_charges || ''}
                    onChange={e =>
                      handlePricingChange(
                        'other_charges',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.pricing.discount || ''}
                onChange={e =>
                  handlePricingChange('discount', parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Created by {currentUser.name || currentUser.id}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? 'Update Quotation' : 'Create Quotation'}
          </button>
        </div>
      </div>
    </form>
  );
}
