import { apiClient } from '../api/client';
import type { Mission, MissionStatus } from '../types/types';

interface MissionFilters {
  status?: MissionStatus;
  startDate?: string;
  endDate?: string;
}

class MissionService {
  async getAllMissions(filters?: MissionFilters): Promise<Mission[]> {
    const response = await apiClient.get('/missions', {
      params: filters,
    });
    return response.data.data.map(this.mapMissionToFrontend);
  }

  async getMissionById(uuid: string): Promise<Mission> {
    const response = await apiClient.get(`/missions/${uuid}`);
    return this.mapMissionToFrontend(response.data.data);
  }

  async getActiveMissions(): Promise<Mission[]> {
    const response = await apiClient.get('/missions', {
      params: { status: 'active' },
    });
    return response.data.data.map(this.mapMissionToFrontend);
  }

  async createMission(data: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status?: MissionStatus;
  }): Promise<Mission> {
    const response = await apiClient.post('/missions', {
      name: data.name,
      description: data.description,
      start_date: data.startDate,
      end_date: data.endDate,
      status: data.status || 'planning',
    });
    return this.mapMissionToFrontend(response.data.data);
  }

  async updateMission(
    uuid: string,
    data: Partial<{
      name: string;
      description: string;
      startDate: string;
      endDate: string;
      status: MissionStatus;
    }>
  ): Promise<Mission> {
    const payload: any = {};
    if (data.name) payload.name = data.name;
    if (data.description) payload.description = data.description;
    if (data.startDate) payload.start_date = data.startDate;
    if (data.endDate) payload.end_date = data.endDate;
    if (data.status) payload.status = data.status;

    const response = await apiClient.patch(`/missions/${uuid}`, payload);
    return this.mapMissionToFrontend(response.data.data);
  }

  async deleteMission(uuid: string): Promise<void> {
    await apiClient.delete(`/missions/${uuid}`);
  }

  private mapMissionToFrontend(mission: any): Mission {
    return {
      id: mission.id,
      name: mission.name,
      description: mission.description,
      startDate: mission.start_date,
      endDate: mission.end_date,
      status: mission.status,
      crewMembers: mission.crew_members
        ? mission.crew_members.map((member: any) => ({
            id: member.id,
            name: member.name,
            role: member.role || '',
            email: member.email || '',
            missionId: member.mission_id,
            userId: member.user_id,
            activities: [],
            createdAt: member.created_at,
            updatedAt: member.updated_at,
          }))
        : [],
      createdAt: mission.created_at,
      updatedAt: mission.updated_at,
      createdBy: mission.created_by,
    };
  }
}

export const missionService = new MissionService();
