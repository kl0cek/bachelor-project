import { useState, useEffect } from 'react';
import { activityService, type CreateActivityRequest } from '../services/activityService';
import type { Activity } from '../types/types';

export const useActivities = (missionId?: string, date?: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    if (!missionId || !date) return;

    try {
      setLoading(true);
      setError(null);
      const data = await activityService.getActivitiesForMission(missionId, date);
      setActivities(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (missionId && date) {
      fetchActivities();
    }
  }, [missionId, date]);

  const createActivity = async (activityData: CreateActivityRequest) => {
    try {
      const newActivity = await activityService.createActivity(activityData);
      setActivities((prev) => [...prev, newActivity]);
      return newActivity;
    } catch (err: any) {
      setError(err.message || 'Failed to create activity');
      throw err;
    }
  };

  const updateActivity = async (
    activityId: string,
    updates: Partial<CreateActivityRequest>
  ) => {
    try {
      const updatedActivity = await activityService.updateActivity(activityId, updates);
      setActivities((prev) =>
        prev.map((a) => (a.id === activityId ? updatedActivity : a))
      );
      return updatedActivity;
    } catch (err: any) {
      setError(err.message || 'Failed to update activity');
      throw err;
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      await activityService.deleteActivity(activityId);
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete activity');
      throw err;
    }
  };

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
  };
};
