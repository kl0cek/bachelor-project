import { useState, useEffect, useCallback } from 'react';
import { crewService, type CreateCrewMemberRequest } from '../services/crewService';
import type { CrewMember } from '../types/types';

export const useCrew = (missionId?: string) => {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCrew = useCallback(async () => {
    if (!missionId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await crewService.getCrewByMission(missionId);
      setCrew(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch crew members';
      setError(errorMessage);
      console.error('Error fetching crew:', err);
    } finally {
      setLoading(false);
    }
  }, [missionId]);

  useEffect(() => {
    if (missionId) {
      fetchCrew();
    }
  }, [missionId, fetchCrew]);

  const createCrewMember = async (memberData: CreateCrewMemberRequest) => {
    try {
      const newMember = await crewService.createCrewMember(memberData);
      setCrew((prev) => [...prev, newMember]);
      return newMember;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create crew member';
      setError(errorMessage);
      throw err;
    }
  };

  const updateCrewMember = async (crewId: string, updates: Partial<CreateCrewMemberRequest>) => {
    try {
      const updatedMember = await crewService.updateCrewMember(crewId, updates);
      setCrew((prev) => prev.map((m) => (m.id === crewId ? updatedMember : m)));
      return updatedMember;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update crew member';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteCrewMember = async (crewId: string) => {
    try {
      await crewService.deleteCrewMember(crewId);
      setCrew((prev) => prev.filter((m) => m.id !== crewId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete crew member';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    crew,
    loading,
    error,
    refetch: fetchCrew,
    createCrewMember,
    updateCrewMember,
    deleteCrewMember,
  };
};
