import { useState, useEffect, useCallback } from 'react';
import { missionService } from '../services/missionService';
import type { Mission, MissionStatus } from '../types/types';

interface UseMissionsOptions {
  status?: MissionStatus;
  autoLoad?: boolean;
}

export const useMissions = (options: UseMissionsOptions = {}) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = options.status ? { status: options.status } : undefined;
      const data = await missionService.getAllMissions(filters);
      setMissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load missions');
    } finally {
      setLoading(false);
    }
  }, [options.status]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      loadMissions();
    }
  }, [loadMissions, options.autoLoad]);

  const createMission = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const newMission = await missionService.createMission(data);
      setMissions((prev) => [...prev, newMission]);
      return newMission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create mission';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMission = useCallback(async (id: string, data: any) => {
    setLoading(true);
    setError(null);

    try {
      const updatedMission = await missionService.updateMission(id, data);
      setMissions((prev) =>
        prev.map((mission) => (mission.id === id ? updatedMission : mission))
      );
      return updatedMission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update mission';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMission = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await missionService.deleteMission(id);
      setMissions((prev) => prev.filter((mission) => mission.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete mission';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    missions,
    loading,
    error,
    loadMissions,
    createMission,
    updateMission,
    deleteMission,
  };
};

export const useMission = (missionId: string | null) => {
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMission = useCallback(async () => {
    if (!missionId) {
      setMission(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await missionService.getMissionById(missionId);
      setMission(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mission');
    } finally {
      setLoading(false);
    }
  }, [missionId]);

  useEffect(() => {
    loadMission();
  }, [loadMission]);

  return {
    mission,
    loading,
    error,
    reload: loadMission,
  };
};