import { useState, useEffect } from 'react';
import type { ISSData, ISSState } from '../types/types';

export const useISS = (refreshInterval: number = 10000) => {
  const [state, setState] = useState<ISSState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchISSData = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ISSData = await response.json();

      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ISS data',
      });
    }
  };

  useEffect(() => {
    fetchISSData();

    const interval = setInterval(fetchISSData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    ...state,
    refetch: fetchISSData,
  };
};
