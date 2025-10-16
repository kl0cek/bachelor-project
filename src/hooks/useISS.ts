import { useState, useEffect } from 'react';

export interface ISSData {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  footprint: number;
  timestamp: number;
  daynum: number;
  solar_lat: number;
  solar_lon: number;
  units: string;
}

export interface ISSState {
  data: ISSData | null;
  loading: boolean;
  error: string | null;
}

export const useISS = (refreshInterval: number = 10000) => {
  const [state, setState] = useState<ISSState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchISSData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
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