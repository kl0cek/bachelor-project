import { useState, useEffect, useRef, useCallback } from 'react';
import { activityService, type CreateActivityRequest } from '../services/activityService';
import type { Activity } from '../types/types';

const activityCache = new Map<string, Activity[]>();

export const useActivities = (missionId?: string, date?: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeout = useRef<NodeJS.Timeout | null>(null);

  const cacheKey = missionId && date ? `${missionId}|${date}` : null;

  const fetchActivities = useCallback(
    async (force = false) => {
      if (!missionId || !date) return;

      if (!force && activityCache.has(cacheKey!)) {
        setActivities(activityCache.get(cacheKey!)!);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await activityService.getActivitiesForMission(missionId, date);

        activityCache.set(cacheKey!, data);
        setActivities(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activities';
        console.error('Error fetching activities:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [missionId, date, cacheKey]
  );

  useEffect(() => {
    if (!cacheKey) return;

    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);

    fetchTimeout.current = setTimeout(() => {
      fetchActivities();
    }, 120);

    return () => {
      if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    };
  }, [cacheKey, fetchActivities]);

  const createActivity = async (data: CreateActivityRequest) => {
    const newActivity = await activityService.createActivity(data);

    setActivities((prev) => [...prev, newActivity]);
    if (cacheKey) activityCache.set(cacheKey, [...activities, newActivity]);

    return newActivity;
  };

  const updateActivity = async (id: string, updates: Partial<CreateActivityRequest>) => {
    const updated = await activityService.updateActivity(id, updates);

    setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
    if (cacheKey)
      activityCache.set(
        cacheKey,
        activities.map((a) => (a.id === id ? updated : a))
      );

    return updated;
  };

  const deleteActivity = async (id: string) => {
    await activityService.deleteActivity(id);

    setActivities((prev) => prev.filter((a) => a.id !== id));
    if (cacheKey)
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
    refetch: () => fetchActivities(true),
    createActivity,
    updateActivity,
    deleteActivity,
  };
};
