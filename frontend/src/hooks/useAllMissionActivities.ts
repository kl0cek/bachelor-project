import { useState, useEffect, useCallback } from 'react';
import { activityService, type CreateActivityRequest } from '../services/activityService';
import type { Activity } from '../types/types';
import type { UpdateActivityBackendRequest } from '../types/apiTypes';

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

  const createActivity = async (data: CreateActivityRequest): Promise<Activity> => {
    const result = await activityService.createActivity(data);

    if (data.is_recurring) {
      await fetchAllActivities(true);
      return result;
    }

    setActivities((prev) => {
      const updated = [...prev, result];
      activityCache.set(cacheKey, updated);
      return updated;
    });

    return result;
  };

  const updateActivity = async (
    id: string,
    updates: UpdateActivityBackendRequest
  ): Promise<Activity> => {
    const updated = await activityService.updateActivity(id, updates);

    setActivities((prev) => {
      const newActivities = prev.map((a) => (a.id === id ? updated : a));
      activityCache.set(cacheKey, newActivities);
      return newActivities;
    });

    return updated;
  };

  const deleteActivity = async (id: string): Promise<void> => {
    await activityService.deleteActivity(id);

    setActivities((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      activityCache.set(cacheKey, filtered);
      return filtered;
    });
  };

  const refetch = useCallback(() => {
    return fetchAllActivities(true);
  }, [fetchAllActivities]);

  const clearCache = useCallback(() => {
    activityCache.delete(cacheKey);
  }, [cacheKey]);

  return {
    activities,
    setActivities,
    loading,
    error,
    refetch,
    createActivity,
    updateActivity,
    deleteActivity,
    clearCache,
  };
};
