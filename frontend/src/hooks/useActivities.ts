import { useState, useCallback } from 'react';
import { activityService, type CreateActivityRequest } from '../services/activityService';

export const useActivities = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createActivity = useCallback(async (data: CreateActivityRequest) => {
    setLoading(true);
    setError(null);

    try {
      const newActivity = await activityService.createActivity(data);
      return newActivity;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create activity';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateActivity = useCallback(async (activityId: string, data: Partial<CreateActivityRequest>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedActivity = await activityService.updateActivity(activityId, data);
      return updatedActivity;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update activity';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteActivity = useCallback(async (activityId: string) => {
    setLoading(true);
    setError(null);

    try {
      await activityService.deleteActivity(activityId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete activity';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvailableTimeSlots = useCallback(async (
    crewMemberId: string,
    date: string,
    duration: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      const slots = await activityService.getAvailableTimeSlots(crewMemberId, date, duration);
      return slots;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get available time slots';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
    getAvailableTimeSlots,
  };
};
