import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ErrorMessageProps } from '../../types/weather';

/**
 * ErrorMessage Component
 * 
 * Displays error states for API and network errors in the weather application.
 * Shows an alert icon, appropriate message based on error type, and a retry button.
 * 
 * @example
 * ```tsx
 * // API Error
 * <ErrorMessage type="api" onRetry={() => refetch()} />
 * 
 * // Network Error
 * <ErrorMessage type="network" onRetry={() => refetch()} />
 * ```
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type,
  onRetry,
  'data-testid': testId = 'error-message',
}) => {
  const isApiError = type === 'api';
  
  // Error messages in Turkish as per design spec
  const message = isApiError
    ? 'Hava durumu yüklenemedi. Lütfen tekrar deneyin.'
    : 'İnternet bağlantınızı kontrol edin.';
  
  // Color configurations based on error type
  const accentColor = isApiError ? 'rgb(239, 68, 68)' : 'rgb(249, 115, 22)'; // red-500 : orange-500
  const borderColor = isApiError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(249, 115, 22, 0.3)';
  const glowColor = isApiError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(249, 115, 22, 0.4)';
  
  return (
    <div
      data-testid={testId}
      className="error-message-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        borderRadius: '0.75rem',
        border: `1px solid ${borderColor}`,
        backgroundColor: 'rgba(26, 38, 50, 0.8)',
        maxWidth: '400px',
        margin: '0 auto',
      }}
      role="alert"
      aria-live="assertive"
    >
      {/* Alert Triangle Icon - 48px as per design spec */}
      <div
        data-testid={`${testId}-icon`}
        style={{
          marginBottom: '1rem',
          color: accentColor,
        }}
      >
        <AlertTriangle size={48} strokeWidth={2} />
      </div>
      
      {/* Error Message */}
      <p
        data-testid={`${testId}-text`}
        style={{
          color: '#f8fafc',
          fontSize: '1rem',
          fontWeight: 500,
          textAlign: 'center',
          marginBottom: '1.5rem',
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
      
      {/* Retry Button - Cyan accent with hover glow */}
      <button
        type="button"
        data-testid={`${testId}-retry-button`}
        onClick={onRetry}
        style={{
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          backgroundColor: 'rgb(6, 182, 212)', // cyan-500
          color: '#ffffff',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 0 0 rgba(6, 182, 212, 0)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 20px ${glowColor}`;
          e.currentTarget.style.backgroundColor = 'rgb(8, 145, 178)'; // cyan-600
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 0 0 rgba(6, 182, 212, 0)';
          e.currentTarget.style.backgroundColor = 'rgb(6, 182, 212)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.98)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Tekrar dene"
      >
        Tekrar Dene
      </button>
    </div>
  );
};

export default ErrorMessage;
