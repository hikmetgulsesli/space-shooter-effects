import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders API error with correct message and styling', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage type="api" onRetry={onRetry} />);
    
    // Check container exists
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    
    // Check icon is rendered
    expect(screen.getByTestId('error-message-icon')).toBeInTheDocument();
    
    // Check API error message in Turkish
    expect(screen.getByTestId('error-message-text')).toHaveTextContent(
      'Hava durumu yüklenemedi. Lütfen tekrar deneyin.'
    );
    
    // Check retry button
    expect(screen.getByTestId('error-message-retry-button')).toHaveTextContent('Tekrar Dene');
  });
  
  it('renders network error with correct message', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage type="network" onRetry={onRetry} />);
    
    // Check network error message in Turkish
    expect(screen.getByTestId('error-message-text')).toHaveTextContent(
      'İnternet bağlantınızı kontrol edin.'
    );
  });
  
  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage type="api" onRetry={onRetry} />);
    
    const retryButton = screen.getByTestId('error-message-retry-button');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
  
  it('accepts custom test ID', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage type="api" onRetry={onRetry} data-testid="custom-error" />);
    
    expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    expect(screen.getByTestId('custom-error-icon')).toBeInTheDocument();
    expect(screen.getByTestId('custom-error-text')).toBeInTheDocument();
    expect(screen.getByTestId('custom-error-retry-button')).toBeInTheDocument();
  });
  
  it('has correct accessibility attributes', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage type="api" onRetry={onRetry} />);
    
    const container = screen.getByTestId('error-message');
    expect(container).toHaveAttribute('role', 'alert');
    expect(container).toHaveAttribute('aria-live', 'assertive');
    
    const retryButton = screen.getByTestId('error-message-retry-button');
    expect(retryButton).toHaveAttribute('aria-label', 'Tekrar dene');
  });
  
  it('retry button has correct styling', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage type="api" onRetry={onRetry} />);
    
    const retryButton = screen.getByTestId('error-message-retry-button');
    // Check button is visible and clickable
    expect(retryButton).toBeVisible();
    expect(retryButton).toBeEnabled();
  });
  
  it('calls onRetry multiple times when clicked multiple times', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage type="network" onRetry={onRetry} />);
    
    const retryButton = screen.getByTestId('error-message-retry-button');
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(3);
  });
});
