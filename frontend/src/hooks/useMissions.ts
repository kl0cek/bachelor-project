import { useState, useEffect, useCallback } from 'react';
import { missionService } from '../services/missionService';
import { authService } from '../services/authService';
import type { Mission, MissionStatus } from '../types/types';

export const useMissions = (filters?: { status?: MissionStatus }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      setMissions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await missionService.getAllMissions(filters);
      setMissions(data);
    } catch (err) {
      const isUnauthorized =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { status?: number } }).response?.status === 401;

      if (!isUnauthorized) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch missions';
        setError(errorMessage);
        console.error('Error fetching missions:', err);
      } else {
        setMissions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filters?.status]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const createMission = async (missionData: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status?: MissionStatus;
  }) => {
    try {
      const newMission = await missionService.createMission(missionData);
      setMissions((prev) => [...prev, newMission]);
      return newMission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create mission';
      setError(errorMessage);
      throw err;
    }
  };

  const updateMission = async (
    missionId: string,
    updates: Partial<{
      name: string;
      description: string;
      startDate: string;
      endDate: string;
      status: MissionStatus;
    }>
  ) => {
    try {
      const updatedMission = await missionService.updateMission(missionId, updates);
      setMissions((prev) => prev.map((m) => (m.id === missionId ? updatedMission : m)));
      return updatedMission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update mission';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteMission = async (missionId: string) => {
    try {
      await missionService.deleteMission(missionId);
      setMissions((prev) => prev.filter((m) => m.id !== missionId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete mission';
      setError(errorMessage);
      throw err;
    }
  };

  const getMissionById = async (missionId: string) => {
    try {
      const mission = await missionService.getMissionById(missionId);
      return mission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch mission';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    missions,
    loading,
    error,
    refetch: fetchMissions,
    createMission,
    updateMission,
    deleteMission,
    getMissionById,
  };
};
