import { useState, useEffect } from 'react';
import { activityService, type CreateActivityRequest } from '../services/activityService';
import type { Activity } from '../types/types';

export const useActivities = (missionId?: string, date?: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    if (!missionId || !date) {
      console.log('Missing missionId or date:', { missionId, date });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching activities for:', { missionId, date });
      
      const data = await activityService.getActivitiesForMission(missionId, date);
      console.log('Received activities from service:', data);
      
      setActivities(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch activities';
      setError(errorMessage);
      console.error('Error fetching activities:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
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
      console.log('Creating activity:', activityData);
      const newActivity = await activityService.createActivity(activityData);
      console.log('Created activity:', newActivity);
      setActivities((prev) => [...prev, newActivity]);
      return newActivity;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create activity';
      setError(errorMessage);
      console.error('Error creating activity:', err);
      throw err;
    }
  };

  const updateActivity = async (activityId: string, updates: Partial<CreateActivityRequest>) => {
    try {
      console.log('Updating activity:', { activityId, updates });
      const updatedActivity = await activityService.updateActivity(activityId, updates);
      console.log('Updated activity:', updatedActivity);
      setActivities((prev) => prev.map((a) => (a.id === activityId ? updatedActivity : a)));
      return updatedActivity;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update activity';
      setError(errorMessage);
      console.error('Error updating activity:', err);
      throw err;
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      console.log('Deleting activity:', activityId);
      await activityService.deleteActivity(activityId);
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
      console.log('Deleted activity successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete activity';
      setError(errorMessage);
      console.error('Error deleting activity:', err);
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
