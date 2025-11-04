import { apiClient } from '../api/client';
import type { CrewMember } from '../types/types';

export interface CreateCrewMemberRequest {
  mission_id: string;
  name: string;
  role?: string;
  email?: string;
  user_id?: string;
}

export interface UpdateCrewMemberRequest {
  name?: string;
  role?: string;
  email?: string;
}

class CrewService {
  async getCrewByMission(missionId: string): Promise<CrewMember[]> {
    const response = await apiClient.get(`/missions/${missionId}/crew`);
    return this.mapCrewMembersToFrontend(response.data.data);
  }

  async getCrewMemberById(id: string): Promise<CrewMember> {
    const response = await apiClient.get(`/crew/${id}`);
    return this.mapCrewMemberToFrontend(response.data.data);
  }

  async createCrewMember(data: CreateCrewMemberRequest): Promise<CrewMember> {
    const response = await apiClient.post(
      `/missions/${data.mission_id}/crew`,
      data
    );
    return this.mapCrewMemberToFrontend(response.data.data);
  }

  async updateCrewMember(
    id: string,
    data: UpdateCrewMemberRequest
  ): Promise<CrewMember> {
    const response = await apiClient.patch(`/crew/${id}`, data);
    return this.mapCrewMemberToFrontend(response.data.data);
  }

  async deleteCrewMember(id: string): Promise<void> {
    await apiClient.delete(`/crew/${id}`);
  }

  private mapCrewMemberToFrontend(member: any): CrewMember {
    return {
      id: member.id,
      name: member.name,
      role: member.role,
      email: member.email,
      missionId: member.mission_id,
      userId: member.user_id,
      activities: [],
      createdAt: member.created_at,
      updatedAt: member.updated_at,
    };
  }

  private mapCrewMembersToFrontend(members: any[]): CrewMember[] {
    return members.map((member) => this.mapCrewMemberToFrontend(member));
  }
}

export const crewService = new CrewService();
