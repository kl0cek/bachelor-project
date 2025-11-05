import { useState, useEffect } from 'react';
import { crewService, type CreateCrewMemberRequest } from '../services/crewService';
import type { CrewMember } from '../types/types';

export const useCrew = (missionId?: string) => {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCrew = async () => {
    if (!missionId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await crewService.getCrewByMission(missionId);
      setCrew(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch crew members');
      console.error('Error fetching crew:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (missionId) {
      fetchCrew();
    }
  }, [missionId]);

  const createCrewMember = async (memberData: CreateCrewMemberRequest) => {
    try {
      const newMember = await crewService.createCrewMember(memberData);
      setCrew((prev) => [...prev, newMember]);
      return newMember;
    } catch (err: any) {
      setError(err.message || 'Failed to create crew member');
      throw err;
    }
  };

  const updateCrewMember = async (crewId: string, updates: Partial<CreateCrewMemberRequest>) => {
    try {
      const updatedMember = await crewService.updateCrewMember(crewId, updates);
      setCrew((prev) => prev.map((m) => (m.id === crewId ? updatedMember : m)));
      return updatedMember;
    } catch (err: any) {
      setError(err.message || 'Failed to update crew member');
      throw err;
    }
  };

  const deleteCrewMember = async (crewId: string) => {
    try {
      await crewService.deleteCrewMember(crewId);
      setCrew((prev) => prev.filter((m) => m.id !== crewId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete crew member');
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
