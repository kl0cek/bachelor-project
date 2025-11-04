import { useState, useCallback } from 'react';
import { crewService, type CreateCrewMemberRequest, type UpdateCrewMemberRequest } from '../services/crewService';
import type { CrewMember } from '../types/types';

export const useCrew = (missionId?: string) => {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCrewMembers = useCallback(async (targetMissionId?: string) => {
    const id = targetMissionId || missionId;
    if (!id) {
      setError('Mission ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await crewService.getCrewByMission(id);
      setCrewMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load crew members');
    } finally {
      setLoading(false);
    }
  }, [missionId]);

  const createCrewMember = useCallback(async (data: CreateCrewMemberRequest) => {
    setLoading(true);
    setError(null);

    try {
      const newMember = await crewService.createCrewMember(data);
      setCrewMembers((prev) => [...prev, newMember]);
      return newMember;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create crew member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCrewMember = useCallback(async (id: string, data: UpdateCrewMemberRequest) => {
    setLoading(true);
    setError(null);

    try {
      const updatedMember = await crewService.updateCrewMember(id, data);
      setCrewMembers((prev) =>
        prev.map((member) => (member.id === id ? updatedMember : member))
      );
      return updatedMember;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update crew member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCrewMember = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await crewService.deleteCrewMember(id);
      setCrewMembers((prev) => prev.filter((member) => member.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete crew member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    crewMembers,
    loading,
    error,
    loadCrewMembers,
    createCrewMember,
    updateCrewMember,
    deleteCrewMember,
  };
};

export const useCrewMember = (memberId: string | null) => {
  const [crewMember, setCrewMember] = useState<CrewMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCrewMember = useCallback(async () => {
    if (!memberId) {
      setCrewMember(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await crewService.getCrewMemberById(memberId);
      setCrewMember(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load crew member');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  return {
    crewMember,
    loading,
    error,
    reload: loadCrewMember,
  };
};
