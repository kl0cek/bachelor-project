import { useState, useEffect } from 'react';
import { missionService } from '../services/missionService';
import { authService } from '../services/authService';
import type { Mission, MissionStatus } from '../types/types';

export const useMissions = (filters?: { status?: MissionStatus }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = async () => {
    // Don't fetch if user is not authenticated
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
    } catch (err: any) {
      // Only set error if it's not a 401 (which means user is logged out)
      if (err.response?.status !== 401) {
        setError(err.message || 'Failed to fetch missions');
        console.error('Error fetching missions:', err);
      } else {
        // Silent fail for 401 - user is not authenticated
        setMissions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, [filters?.status]);

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
    } catch (err: any) {
      setError(err.message || 'Failed to create mission');
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
    } catch (err: any) {
      setError(err.message || 'Failed to update mission');
      throw err;
    }
  };

  const deleteMission = async (missionId: string) => {
    try {
      await missionService.deleteMission(missionId);
      setMissions((prev) => prev.filter((m) => m.id !== missionId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete mission');
      throw err;
    }
  };

  const getMissionById = async (missionId: string) => {
    try {
      const mission = await missionService.getMissionById(missionId);
      return mission;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mission');
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
