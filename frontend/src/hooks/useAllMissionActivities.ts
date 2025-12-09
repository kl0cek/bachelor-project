import { useState, useEffect, useCallback } from 'react';
import { activityService, type CreateActivityRequest } from '../services/activityService';
import type { Activity } from '../types/types';

const activityCache = new Map<string, Activity[]>();

export const useAllMissionActivities = (missionId: string, startDate: string, endDate: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `mission-${missionId}-${startDate}-${endDate}`;

  const generateDateRange = useCallback(() => {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [startDate, endDate]);

  const fetchAllActivities = useCallback(
    async (force = false) => {
      if (!missionId) return;

      if (!force && activityCache.has(cacheKey)) {
        setActivities(activityCache.get(cacheKey)!);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const dates = generateDateRange();

        const promises = dates.map((date) =>
          activityService.getActivitiesForMission(missionId, date)
        );

        const results = await Promise.all(promises);

        const allActivities = results.flat();

        activityCache.set(cacheKey, allActivities);
        setActivities(allActivities);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activities';
        console.error('Error fetching all mission activities:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [missionId, cacheKey, generateDateRange]
  );

  useEffect(() => {
    fetchAllActivities();
  }, [fetchAllActivities]);

  const createActivity = async (data: CreateActivityRequest) => {
    const newActivity = await activityService.createActivity(data);

    setActivities((prev) => [...prev, newActivity]);
    activityCache.set(cacheKey, [...activities, newActivity]);

    return newActivity;
  };

  const updateActivity = async (id: string, updates: Partial<CreateActivityRequest>) => {
    const updated = await activityService.updateActivity(id, updates);

    setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
    activityCache.set(
      cacheKey,
      activities.map((a) => (a.id === id ? updated : a))
    );

    return updated;
  };

  const deleteActivity = async (id: string) => {
    await activityService.deleteActivity(id);

    setActivities((prev) => prev.filter((a) => a.id !== id));
    activityCache.set(
      cacheKey,
      activities.filter((a) => a.id !== id)
    );
  };

  return {
    activities,
    setActivities,
    loading,
    error,
    refetch: () => fetchAllActivities(true),
    createActivity,
    updateActivity,
    deleteActivity,
  };
};
