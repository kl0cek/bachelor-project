import { apiClient } from '../api/client';
import type { Mission } from '../types/types';

class MissionService {
  async getAllMissions(filters?: any): Promise<Mission[]> {
    const response = await apiClient.get('/missions', {
      params: filters,
    });
    return response.data.data.map(this.mapMissionToFrontend);
  }

  async getMissionById(id: string): Promise<Mission> {
    const response = await apiClient.get(`/missions/${id}`);
    return this.mapMissionToFrontend(response.data.data);
  }

  async getActiveMissions(): Promise<Mission[]> {
    const response = await apiClient.get('/missions', {
      params: { status: 'active' },
    });
    return response.data.data.map(this.mapMissionToFrontend);
  }

  async createMission(data: any): Promise<Mission> {
    const response = await apiClient.post('/missions', {
      name: data.name,
      description: data.description,
      start_date: data.startDate,
      end_date: data.endDate,
      status: data.status || 'planning',
    });
    return this.mapMissionToFrontend(response.data.data);
  }

  async updateMission(id: string, data: any): Promise<Mission> {
    const response = await apiClient.patch(`/missions/${id}`, {
      name: data.name,
      description: data.description,
      start_date: data.startDate,
      end_date: data.endDate,
      status: data.status,
    });
    return this.mapMissionToFrontend(response.data.data);
  }

  async deleteMission(id: string): Promise<void> {
    await apiClient.delete(`/missions/${id}`);
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
            role: member.role,
            email: member.email,
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
