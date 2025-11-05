import { apiClient } from '../api/client';
import type { Activity, ActivityType, Priority } from '../types/types';

export interface CreateActivityRequest {
  crew_member_id: string;
  mission_id: string;
  name: string;
  date: string;
  start_hour: number;
  duration: number;
  type: ActivityType;
  priority?: Priority;
  mission?: string;
  description?: string;
  equipment?: string[];
}

class ActivityService {
  async getActivitiesForMission(missionId: string, date: string): Promise<Activity[]> {
    try {
      console.log('API Request - getActivitiesForMission:', { missionId, date });

      const response = await apiClient.get(`/activities/missions/${missionId}/activities`, {
        params: { date },
      });

      console.log('API Response - raw:', response.data);

      // Handle different response structures
      const rawActivities = response.data.data || response.data || [];
      console.log('Raw activities before mapping:', rawActivities);

      const mappedActivities = this.mapActivitiesToFrontend(rawActivities);
      console.log('Mapped activities:', mappedActivities);

      return mappedActivities;
    } catch (error: any) {
      console.error('Error in getActivitiesForMission:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async getActivitiesForCrewMember(crewMemberId: string, date: string): Promise<Activity[]> {
    try {
      console.log('API Request - getActivitiesForCrewMember:', { crewMemberId, date });

      const response = await apiClient.get(`/activities/crew/${crewMemberId}/activities`, {
        params: { date },
      });

      console.log('API Response - raw:', response.data);

      const rawActivities = response.data.data || response.data || [];
      return this.mapActivitiesToFrontend(rawActivities);
    } catch (error: any) {
      console.error('Error in getActivitiesForCrewMember:', error);
      throw error;
    }
  }

  async createActivity(data: CreateActivityRequest): Promise<Activity> {
    try {
      console.log('API Request - createActivity:', data);

      const response = await apiClient.post(
        `/activities/missions/${data.mission_id}/activities`,
        data
      );

      console.log('API Response - createActivity:', response.data);

      const rawActivity = response.data.data || response.data;
      return this.mapActivityToFrontend(rawActivity);
    } catch (error: any) {
      console.error('Error in createActivity:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async updateActivity(
    activityId: string,
    data: Partial<CreateActivityRequest>
  ): Promise<Activity> {
    try {
      console.log('API Request - updateActivity:', { activityId, data });

      const response = await apiClient.patch(`/activities/${activityId}`, data);

      console.log('API Response - updateActivity:', response.data);

      const rawActivity = response.data.data || response.data;
      return this.mapActivityToFrontend(rawActivity);
    } catch (error: any) {
      console.error('Error in updateActivity:', error);
      throw error;
    }
  }

  async deleteActivity(activityId: string): Promise<void> {
    try {
      console.log('API Request - deleteActivity:', activityId);
      await apiClient.delete(`/activities/${activityId}`);
      console.log('Activity deleted successfully');
    } catch (error: any) {
      console.error('Error in deleteActivity:', error);
      throw error;
    }
  }

  private mapActivityToFrontend(activity: any): Activity {
    if (!activity) {
      console.warn('Attempted to map null/undefined activity');
      throw new Error('Invalid activity data');
    }

    console.log('Mapping activity to frontend:', activity);

    const mapped: Activity = {
      id: activity.id,
      name: activity.name,
      start: parseFloat(activity.start_hour ?? activity.start),
      duration: parseFloat(activity.duration),
      type: activity.type,
      priority: activity.priority,
      mission: activity.mission,
      description: activity.description,
      equipment: Array.isArray(activity.equipment) ? activity.equipment : [],
      crewMemberId: activity.crew_member_id ?? activity.crewMemberId,
      missionId: activity.mission_id ?? activity.missionId,
      date: activity.date,
      createdAt: activity.created_at ?? activity.createdAt,
      updatedAt: activity.updated_at ?? activity.updatedAt,
    };

    console.log('Mapped activity result:', mapped);
    return mapped;
  }

  private mapActivitiesToFrontend(activities: any[]): Activity[] {
    if (!Array.isArray(activities)) {
      console.error('Expected array of activities, got:', typeof activities, activities);
      return [];
    }

    console.log(`Mapping ${activities.length} activities to frontend`);
    return activities.map((activity) => this.mapActivityToFrontend(activity));
  }
}

export const activityService = new ActivityService();
