import React, { useState } from 'react';
import type {
  Quotation,
  QuotationRevision,
  QuotationStatus,
  QuoteOutcome,
} from '../../types/quotation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Clock,
  User,
  MapPin,
  Package,
  Weight,
  Ruler,
  History,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  RotateCcw,
} from 'lucide-react';

interface QuotationDetailProps {
  quotation: Quotation;
  revisions: QuotationRevision[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: QuotationStatus) => void;
  onSetOutcome: (outcome: QuoteOutcome, lossReason?: string) => void;
}

const statusConfig: Record<
  QuotationStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: <FileText className="w-4 h-4" />,
  },
  sent: {
    label: 'Sent',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: <Send className="w-4 h-4" />,
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: <XCircle className="w-4 h-4" />,
  },
  expired: {
    label: 'Expired',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: <AlertCircle className="w-4 h-4" />,
  },
};

const outcomeConfig: Record<
  QuoteOutcome,
  { label: string; color: string }
> = {
  won: { label: 'Won', color: 'bg-green-500 text-white' },
  lost: { label: 'Lost', color: 'bg-red-500 text-white' },
  pending: { label: 'Pending', color: 'bg-yellow-500 text-white' },
};

export function QuotationDetail({
  quotation,
  revisions,
  onBack,
  onEdit,
  onDelete,
  onStatusChange,
  onSetOutcome,
}: QuotationDetailProps) {
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<QuoteOutcome>('pending');
  const [lossReason, setLossReason] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isValid = new Date(quotation.valid_until) > new Date();
  const daysUntilExpiry = Math.ceil(
    (new Date(quotation.valid_until).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const handleOutcomeSubmit = () => {
    onSetOutcome(selectedOutcome, selectedOutcome === 'lost' ? lossReason : undefined);
    setShowOutcomeModal(false);
    setLossReason('');
  };

  const renderFieldChange = (field: string, oldValue: unknown, newValue: unknown) => {
    const formatValue = (val: unknown): string => {
      if (val === null || val === undefined) return 'None';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    };

    return (
      <div className="text-sm">
        <span className="font-medium text-gray-700">{field}:</span>{' '}
        <span className="text-red-600 line-through">{formatValue(oldValue)}</span>{' '}
        <span className="text-gray-400">→</span>{' '}
        <span className="text-green-600">{formatValue(newValue)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {quotation.quote_number}
            </h1>
            <p className="text-sm text-gray-500">
              Created {formatDateTime(quotation.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`p-4 rounded-lg border ${statusConfig[quotation.status].color}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusConfig[quotation.status].icon}
            <div>
              <span className="font-semibold">
                {statusConfig[quotation.status].label}
              </span>
              {quotation.outcome && (
                <span
                  className={`ml-3 px-2 py-0.5 text-xs rounded-full ${
                    outcomeConfig[quotation.outcome].color
                  }`}
                >
                  {outcomeConfig[quotation.outcome].label}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {quotation.status === 'draft' && (
              <button
                onClick={() => onStatusChange('sent')}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-white rounded-lg hover:bg-blue-50 transition-colors"
              >
                Mark as Sent
              </button>
            )}
            {quotation.status === 'sent' && (
              <>
                <button
                  onClick={() => onStatusChange('accepted')}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-white rounded-lg hover:bg-green-50 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => onStatusChange('rejected')}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-white rounded-lg hover:bg-red-50 transition-colors"
                >
                  Reject
                </button>
              </>
            )}
            {(quotation.status === 'accepted' || quotation.status === 'rejected') &&
              !quotation.outcome && (
                <button
                  onClick={() => setShowOutcomeModal(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Set Outcome
                </button>
              )}
            <button
              onClick={() => onStatusChange('draft')}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        {!isValid && quotation.status !== 'expired' && (
          <p className="mt-2 text-sm">
            This quotation has expired. Valid until: {formatDate(quotation.valid_until)}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
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
            onClick={() => setActiveTab('history')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="w-4 h-4" />
            Revision History
            {revisions.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                {revisions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'details' ? (
        <>
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {quotation.customer_name || 'Unknown Customer'}
                </p>
                <p className="text-sm text-gray-500">Customer ID: {quotation.customer_id}</p>
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Route</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Port of Loading</p>
                  <p className="text-lg font-semibold">{quotation.pol.code}</p>
                  <p className="text-gray-600">{quotation.pol.name}</p>
                  <p className="text-sm text-gray-500">{quotation.pol.country}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Port of Discharge</p>
                  <p className="text-lg font-semibold">{quotation.pod.code}</p>
                  <p className="text-gray-600">{quotation.pod.name}</p>
                  <p className="text-sm text-gray-500">{quotation.pod.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Transport Mode</p>
                <p className="font-medium text-gray-900 capitalize">
                  {quotation.transport_mode}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Service Type</p>
                <p className="font-medium text-gray-900 uppercase">
                  {quotation.service_type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Incoterm</p>
                <p className="font-medium text-gray-900 uppercase">
                  {quotation.incoterm}
                </p>
              </div>
              {quotation.transit_time_days && (
                <div>
                  <p className="text-sm text-gray-500">Transit Time</p>
                  <p className="font-medium text-gray-900">
                    {quotation.transit_time_days} days
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cargo Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cargo</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-900">{quotation.cargo_description}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {quotation.weight_kg && (
                  <div className="flex items-center gap-2">
                    <Weight className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">{quotation.weight_kg} kg</p>
                    </div>
                  </div>
                )}
                {quotation.volume_cbm && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Volume</p>
                      <p className="font-medium">{quotation.volume_cbm} CBM</p>
                    </div>
                  </div>
                )}
                {quotation.dimensions && (
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Dimensions</p>
                      <p className="font-medium">
                        {quotation.dimensions.length}×{quotation.dimensions.width}×
                        {quotation.dimensions.height}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Base Rate</span>
                <span>
                  {formatCurrency(
                    quotation.pricing.base_rate,
                    quotation.pricing.currency
                  )}
                </span>
              </div>
              {quotation.pricing.fuel_surcharge ? (
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Fuel Surcharge</span>
                  <span>
                    {formatCurrency(
                      quotation.pricing.fuel_surcharge,
                      quotation.pricing.currency
                    )}
                  </span>
                </div>
              ) : null}
              {quotation.pricing.security_fee ? (
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Security Fee</span>
                  <span>
                    {formatCurrency(
                      quotation.pricing.security_fee,
                      quotation.pricing.currency
                    )}
                  </span>
                </div>
              ) : null}
              {quotation.pricing.documentation_fee ? (
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Documentation Fee</span>
                  <span>
                    {formatCurrency(
                      quotation.pricing.documentation_fee,
                      quotation.pricing.currency
                    )}
                  </span>
                </div>
              ) : null}
              {quotation.pricing.customs_fee ? (
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Customs Fee</span>
                  <span>
                    {formatCurrency(
                      quotation.pricing.customs_fee,
                      quotation.pricing.currency
                    )}
                  </span>
                </div>
              ) : null}
              {quotation.pricing.insurance_fee ? (
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Insurance Fee</span>
                  <span>
                    {formatCurrency(
                      quotation.pricing.insurance_fee,
                      quotation.pricing.currency
                    )}
                  </span>
                </div>
              ) : null}
              {quotation.pricing.other_charges ? (
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Other Charges</span>
                  <span>
                    {formatCurrency(
                      quotation.pricing.other_charges,
                      quotation.pricing.currency
                    )}
                  </span>
                </div>
              ) : null}
              {quotation.pricing.discount ? (
                <div className="flex justify-between py-1 text-green-600">
                  <span>Discount</span>
                  <span>
                    -
                    {formatCurrency(
                      quotation.pricing.discount,
                      quotation.pricing.currency
                    )}
                  </span>
                </div>
              ) : null}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(
                      quotation.pricing.total,
                      quotation.pricing.currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Validity */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Validity</h3>
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Valid Until</p>
                <p className={`font-medium ${!isValid ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDate(quotation.valid_until)}
                  {isValid ? (
                    <span className="ml-2 text-sm text-green-600">
                      ({daysUntilExpiry} days remaining)
                    </span>
                  ) : (
                    <span className="ml-2 text-sm text-red-600">(Expired)</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{quotation.notes}</p>
            </div>
          )}

          {/* Meta Info */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                Created by {quotation.created_by_name || quotation.created_by} on{' '}
                {formatDateTime(quotation.created_at)}
              </span>
            </div>
            {quotation.updated_at !== quotation.created_at && (
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" />
                <span>
                  Last updated on {formatDateTime(quotation.updated_at)} (v
                  {quotation.version})
                </span>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Revision History Tab */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Revision History</h3>
            <p className="text-sm text-gray-500 mt-1">
              Track all changes made to this quotation
            </p>
          </div>

          {revisions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No revisions yet. Changes will be tracked here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {revisions.map((revision) => (
                <div key={revision.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900">
                            {revision.created_by_name || revision.created_by}
                          </span>
                          <span className="text-gray-500 mx-2">·</span>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(revision.created_at)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          Version {revision.version}
                        </span>
                      </div>

                      {revision.changes.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          Initial creation
                        </p>
                      ) : (
                        <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Changes
                          </p>
                          {revision.changes.map((change, changeIndex) => (
                            <div key={changeIndex}>
                              {renderFieldChange(
                                change.field,
                                change.oldValue,
                                change.newValue
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Outcome Modal */}
      {showOutcomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Outcome</h3>
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="outcome"
                  value="won"
                  checked={selectedOutcome === 'won'}
                  onChange={e => setSelectedOutcome(e.target.value as QuoteOutcome)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium text-green-700">Won</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="outcome"
                  value="lost"
                  checked={selectedOutcome === 'lost'}
                  onChange={e => setSelectedOutcome(e.target.value as QuoteOutcome)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium text-red-700">Lost</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="outcome"
                  value="pending"
                  checked={selectedOutcome === 'pending'}
                  onChange={e => setSelectedOutcome(e.target.value as QuoteOutcome)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium text-yellow-700">Pending</span>
              </label>
            </div>

            {selectedOutcome === 'lost' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loss Reason
                </label>
                <select
                  value={lossReason}
                  onChange={e => setLossReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a reason</option>
                  <option value="price">Price Too High</option>
                  <option value="service">Service Not Suitable</option>
                  <option value="competitor">Went to Competitor</option>
                  <option value="timing">Bad Timing</option>
                  <option value="no_response">No Response</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowOutcomeModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleOutcomeSubmit}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
