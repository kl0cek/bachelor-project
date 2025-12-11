import { apiClient } from '../api/client';
import type { Activity, RecurrenceConfig } from '../types/types';
import type {
  BackendActivity,
  ApiResponse,
  CreateActivityBackendRequest,
  UpdateActivityBackendRequest,
} from '../types/apiTypes';

export type CreateActivityRequest = CreateActivityBackendRequest;

class ActivityService {
  async getActivitiesForMission(missionId: string, date: string): Promise<Activity[]> {
    try {
      const response = await apiClient.get<ApiResponse<BackendActivity[]>>(
        `/activities/missions/${missionId}/activities`,
        { params: { date } }
      );

      const rawActivities = response.data.data || [];

      const mappedActivities = this.mapActivitiesToFrontend(rawActivities);

      return mappedActivities;
    } catch (error) {
      console.error('Error in getActivitiesForMission:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error(
          'Error response:',
          (error as { response?: { data?: unknown } }).response?.data
        );
      }
      throw error;
    }
  }

  async getActivitiesForCrewMember(crewMemberId: string, date: string): Promise<Activity[]> {
    try {
      const response = await apiClient.get<ApiResponse<BackendActivity[]>>(
        `/activities/crew/${crewMemberId}/activities`,
        { params: { date } }
      );

      const rawActivities = response.data.data || [];
      return this.mapActivitiesToFrontend(rawActivities);
    } catch (error) {
      console.error('Error in getActivitiesForCrewMember:', error);
      throw error;
    }
  }

  async createActivity(data: CreateActivityBackendRequest): Promise<Activity> {
    try {
      const response = await apiClient.post<ApiResponse<BackendActivity | BackendActivity[]>>(
        `/activities/missions/${data.mission_id}/activities`,
        data
      );

      const rawActivity = response.data.data;

      if (Array.isArray(rawActivity)) {
        return this.mapActivityToFrontend(rawActivity[0]);
      }

      return this.mapActivityToFrontend(rawActivity);
    } catch (error) {
      console.error('Error in createActivity:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error(
          'Error response:',
          (error as { response?: { data?: unknown } }).response?.data
        );
      }
      throw error;
    }
  }

  async updateActivity(activityId: string, data: UpdateActivityBackendRequest): Promise<Activity> {
    try {
      console.log('Sending update request:', { activityId, data });

      const response = await apiClient.patch<ApiResponse<BackendActivity>>(
        `/activities/${activityId}`,
        data
      );

      const rawActivity = response.data.data;
      return this.mapActivityToFrontend(rawActivity);
    } catch (error: unknown) {
      console.error('Error in updateActivity:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } };
        console.error('Error response data:', axiosError.response?.data);
        console.error('Error status:', axiosError.response?.status);
      }
      throw error;
    }
  }

  async deleteActivity(activityId: string): Promise<void> {
    try {
      await apiClient.delete(`/activities/${activityId}`);
    } catch (error) {
      console.error('Error in deleteActivity:', error);
      throw error;
    }
  }

  async uploadPDF(activityId: string, file: File): Promise<Activity> {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await apiClient.post<ApiResponse<BackendActivity>>(
        `/activities/${activityId}/upload-pdf`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const rawActivity = response.data.data;
      return this.mapActivityToFrontend(rawActivity);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  }

  async deletePDF(activityId: string): Promise<Activity> {
    try {
      const response = await apiClient.delete<ApiResponse<BackendActivity>>(
        `/activities/${activityId}/pdf`
      );

      const rawActivity = response.data.data;
      return this.mapActivityToFrontend(rawActivity);
    } catch (error) {
      console.error('Error deleting PDF:', error);
      throw error;
    }
  }

  async updateRecurringActivities(
    parentId: string,
    data: UpdateActivityBackendRequest
  ): Promise<{ updated: number; skipped: number }> {
    try {
      const cleanData: UpdateActivityBackendRequest = {
        name: data.name,
        start_hour: data.start_hour,
        duration: data.duration,
        type: data.type,
        priority: data.priority,
        mission: data.mission,
        description: data.description,
        equipment: data.equipment,
      };

      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key as keyof UpdateActivityBackendRequest] === undefined) {
          delete cleanData[key as keyof UpdateActivityBackendRequest];
        }
      });

      console.log('Sending recurring update request:', { parentId, data: cleanData });

      const response = await apiClient.patch<ApiResponse<{ updated: number; skipped: number }>>(
        `/activities/recurring/${parentId}/all`,
        cleanData
      );

      return response.data.data;
    } catch (error) {
      console.error('Error in updateRecurringActivities:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } };
        console.error('Error response:', axiosError.response?.data);
      }
      throw error;
    }
  }

  async deleteRecurringActivities(parentId: string): Promise<{ deleted: number }> {
    try {
      const response = await apiClient.delete<ApiResponse<{ deleted: number }>>(
        `/activities/recurring/${parentId}/all`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error in deleteRecurringActivities:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } };
        console.error('Error response:', axiosError.response?.data);
      }
      throw error;
    }
  }

  private mapActivityToFrontend(activity: BackendActivity): Activity {
    if (!activity) {
      console.warn('Attempted to map null/undefined activity');
      throw new Error('Invalid activity data');
    }

    let recurrence: RecurrenceConfig | undefined;

    if (activity.is_recurring && activity.recurrence_type) {
      recurrence = {
        type: activity.recurrence_type,
        interval: activity.recurrence_interval,
        daysOfWeek: activity.recurrence_days_of_week,
        endDate: activity.recurrence_end_date,
      };
    }

    const mapped: Activity = {
      id: activity.id,
      name: activity.name,
      start: parseFloat(String(activity.start_hour)),
      duration: parseFloat(String(activity.duration)),
      type: activity.type,
      priority: activity.priority,
      mission: activity.mission,
      description: activity.description,
      equipment: Array.isArray(activity.equipment) ? activity.equipment : [],
      crewMemberId: activity.crew_member_id,
      missionId: activity.mission_id,
      date: activity.date,
      pdfUrl: activity.pdf_url,
      createdAt: activity.created_at,
      updatedAt: activity.updated_at,
      isRecurring: activity.is_recurring,
      parentActivityId: activity.parent_activity_id || undefined,
      recurrence,
    };

    return mapped;
  }

  private mapActivitiesToFrontend(activities: BackendActivity[]): Activity[] {
    if (!Array.isArray(activities)) {
      console.error('Expected array of activities, got:', typeof activities, activities);
      return [];
    }

    return activities.map((activity) => this.mapActivityToFrontend(activity));
  }
}

export const activityService = new ActivityService();
