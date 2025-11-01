import { apiClient } from '../api/client';
import type { Activity } from '../types/types';

export interface CreateActivityRequest {
  crew_member_id: string;
  mission_id: string;
  name: string;
  date: string;
  start_hour: number;
  duration: number;
  type: string;
  priority?: string;
  mission?: string;
  description?: string;
  equipment?: string[];
}

class ActivityService {
  async getActivitiesForMission(
    missionId: string,
    date: string
  ): Promise<Activity[]> {
    const response = await apiClient.get(
      `/missions/${missionId}/activities`,
      {
        params: { date },
      }
    );
    return this.mapActivitiesToFrontend(response.data.data);
  }

  async getActivitiesForCrewMember(
    crewMemberId: string,
    date: string
  ): Promise<Activity[]> {
    const response = await apiClient.get(`/crew/${crewMemberId}/activities`, {
      params: { date },
    });
    return this.mapActivitiesToFrontend(response.data.data);
  }

  async createActivity(data: CreateActivityRequest): Promise<Activity> {
    const response = await apiClient.post(
      `/missions/${data.mission_id}/activities`,
      {
        ...data,
        start_hour: data.start_hour,
        duration: data.duration,
      }
    );
    return this.mapActivityToFrontend(response.data.data);
  }

  async updateActivity(
    activityId: string,
    data: Partial<CreateActivityRequest>
  ): Promise<Activity> {
    const response = await apiClient.patch(`/activities/${activityId}`, data);
    return this.mapActivityToFrontend(response.data.data);
  }

  async deleteActivity(activityId: string): Promise<void> {
    await apiClient.delete(`/activities/${activityId}`);
  }

  async getAvailableTimeSlots(
    crewMemberId: string,
    date: string,
    duration: number
  ): Promise<Array<{ start: number; end: number }>> {
    const response = await apiClient.get(`/crew/${crewMemberId}/available-slots`, {
      params: { date, duration },
    });
    return response.data.data;
  }

  private mapActivityToFrontend(activity: any): Activity {
    return {
      id: activity.id,
      name: activity.name,
      start: activity.start_hour,
      duration: activity.duration,
      type: activity.type,
      priority: activity.priority,
      mission: activity.mission,
      description: activity.description,
      equipment: activity.equipment,
      crewMemberId: activity.crew_member_id,
      missionId: activity.mission_id,
      date: activity.date,
    };
  }

  private mapActivitiesToFrontend(activities: any[]): Activity[] {
    return activities.map((activity) => this.mapActivityToFrontend(activity));
  }
}

export const activityService = new ActivityService();
