import { useState } from 'react';

interface UseLoadingErrorReturn {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: Error | null;
  setError: (error: Error | null) => void;
  startLoading: () => void;
  stopLoading: (error?: Error | null) => void;
}

export function useLoadingError(): UseLoadingErrorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = (error: Error | null = null) => {
    setIsLoading(false);
    setError(error);
  };

  return {
    isLoading,
    setIsLoading,
    error,
    setError,
    startLoading,
    stopLoading
  };
} 
