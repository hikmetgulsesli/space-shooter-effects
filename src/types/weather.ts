/**
 * Weather types for the weather application
 */

export type ErrorType = 'api' | 'network';

export interface ErrorMessageProps {
  /** Type of error - affects styling and message */
  type: ErrorType;
  /** Callback fired when retry button is clicked */
  onRetry: () => void;
  /** Optional custom test ID for testing */
  'data-testid'?: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

export interface UseWeatherReturn {
  data: WeatherData | null;
  loading: boolean;
  error: ErrorType | null;
  refetch: () => void;
}
