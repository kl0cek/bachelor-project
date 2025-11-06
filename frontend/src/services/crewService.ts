import { apiClient } from '../api/client';
import type { BackendCrewMember } from '../types/apiTypes';
import type { CrewMember } from '../types/types';

export interface CreateCrewMemberRequest {
  mission_id: string;
  name: string;
  role?: string;
  email?: string;
  user_id?: string;
}

class CrewService {
  async getCrewByMission(missionId: string): Promise<CrewMember[]> {
    const response = await apiClient.get(`/crew/missions/${missionId}/crew`);
    return response.data.data.map(this.mapCrewMemberToFrontend);
  }

  async getCrewMemberById(crewId: string): Promise<CrewMember> {
    const response = await apiClient.get(`/crew/${crewId}`);
    return this.mapCrewMemberToFrontend(response.data.data);
  }

  async createCrewMember(data: CreateCrewMemberRequest): Promise<CrewMember> {
    const response = await apiClient.post(`/crew/missions/${data.mission_id}/crew`, data);
    return this.mapCrewMemberToFrontend(response.data.data);
  }

  async updateCrewMember(
    crewId: string,
    data: Partial<CreateCrewMemberRequest>
  ): Promise<CrewMember> {
    const response = await apiClient.patch(`/crew/${crewId}`, data);
    return this.mapCrewMemberToFrontend(response.data.data);
  }

  async deleteCrewMember(crewId: string): Promise<void> {
    await apiClient.delete(`/crew/${crewId}`);
  }

  private mapCrewMemberToFrontend(member: BackendCrewMember): CrewMember {
    return {
      id: member.id,
      name: member.name,
      role: member.role || '',
      email: member.email || '',
      missionId: member.mission_id,
      userId: member.user_id,
      activities: [],
      createdAt: member.created_at,
      updatedAt: member.updated_at,
    };
  }
}

export const crewService = new CrewService();
