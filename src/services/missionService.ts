import type { Mission, MissionStatus, CrewMember } from '../types/types';

export interface CreateMissionRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: MissionStatus;
}

export interface UpdateMissionRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: MissionStatus;
}

export interface MissionFilters {
  status?: MissionStatus;
  startDate?: string;
  endDate?: string;
  crewMemberId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class MissionService {
  private missions: Mission[] = [
    {
      id: 'mission-001',
      name: 'ISS Expedition 71',
      description:
        'Long-duration spaceflight mission to the International Space Station focusing on scientific research and station maintenance.',
      startDate: '2025-10-15',
      endDate: '2025-11-07',
      status: 'active',
      crewMembers: [],
      createdAt: '2024-09-01T08:00:00Z',
      updatedAt: '2024-10-22T14:30:00Z',
    },
    {
      id: 'mission-002',
      name: 'Mars Analog Simulation',
      description:
        'Ground-based analog mission simulating Mars surface operations for psychological and operational research.',
      startDate: '2024-11-01',
      endDate: '2025-02-01',
      status: 'planning',
      crewMembers: [],
      createdAt: '2024-10-01T10:15:00Z',
      updatedAt: '2024-10-20T16:45:00Z',
    },
    {
      id: 'mission-003',
      name: 'Lunar Gateway Simulation',
      description:
        'Simulation of lunar orbital operations and surface missions for Artemis program preparation.',
      startDate: '2024-08-01',
      endDate: '2024-09-30',
      status: 'completed',
      crewMembers: [],
      createdAt: '2024-07-15T12:00:00Z',
      updatedAt: '2024-09-30T18:00:00Z',
    },
    {
      id: 'mission-004',
      name: 'Deep Space Habitat Test',
      description:
        'Extended isolation mission testing life support systems and crew psychology for deep space exploration.',
      startDate: '2025-01-15',
      endDate: '2025-07-15',
      status: 'planning',
      crewMembers: [],
      createdAt: '2024-10-10T09:30:00Z',
      updatedAt: '2024-10-22T11:20:00Z',
    },
  ];

  async getAllMissions(filters?: MissionFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Mission>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredMissions = [...this.missions];

        if (filters?.status) {
          filteredMissions = filteredMissions.filter(m => m.status === filters.status);
        }

        if (filters?.startDate) {
          filteredMissions = filteredMissions.filter(m => 
            new Date(m.startDate) >= new Date(filters.startDate!)
          );
        }

        if (filters?.endDate) {
          filteredMissions = filteredMissions.filter(m => 
            new Date(m.endDate) <= new Date(filters.endDate!)
          );
        }

        if (filters?.crewMemberId) {
          filteredMissions = filteredMissions.filter(m => 
            m.crewMembers.some(crew => crew.id === filters.crewMemberId)
          );
        }

        const total = filteredMissions.length;
        
        if (pagination) {
          const start = (pagination.page - 1) * pagination.limit;
          const end = start + pagination.limit;
          filteredMissions = filteredMissions.slice(start, end);
        }

        resolve({
          data: filteredMissions,
          total,
          page: pagination?.page || 1,
          limit: pagination?.limit || total,
          totalPages: pagination ? Math.ceil(total / pagination.limit) : 1
        });
      }, 300);
    });
  }

  async getMissionById(id: string): Promise<Mission | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mission = this.missions.find(m => m.id === id);
        resolve(mission || null);
      }, 200);
    });
  }

  async createMission(missionData: CreateMissionRequest): Promise<Mission> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMission: Mission = {
          id: `mission-${Date.now()}`,
          ...missionData,
          status: missionData.status || 'planning',
          crewMembers: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        this.missions.push(newMission);
        resolve(newMission);
      }, 500);
    });
  }

  async updateMission(id: string, updates: UpdateMissionRequest): Promise<Mission | null> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.missions.findIndex(m => m.id === id);
        
        if (index === -1) {
          reject(new Error('Mission not found'));
          return;
        }

        this.missions[index] = {
          ...this.missions[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        resolve(this.missions[index]);
      }, 400);
    });
  }

  async deleteMission(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.missions.findIndex(m => m.id === id);
        
        if (index === -1) {
          reject(new Error('Mission not found'));
          return;
        }

        this.missions.splice(index, 1);
        resolve();
      }, 300);
    });
  }

  async addCrewMember(missionId: string, crewMember: Omit<CrewMember, 'id'>): Promise<CrewMember> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mission = this.missions.find(m => m.id === missionId);
        
        if (!mission) {
          reject(new Error('Mission not found'));
          return;
        }

        const newCrewMember: CrewMember = {
          id: `crew-${Date.now()}`,
          ...crewMember,
        };

        mission.crewMembers.push(newCrewMember);
        mission.updatedAt = new Date().toISOString();

        resolve(newCrewMember);
      }, 300);
    });
  }

  async updateCrewMember(missionId: string, crewMemberId: string, updates: Partial<CrewMember>): Promise<CrewMember | null> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mission = this.missions.find(m => m.id === missionId);
        
        if (!mission) {
          reject(new Error('Mission not found'));
          return;
        }

        const crewIndex = mission.crewMembers.findIndex(c => c.id === crewMemberId);
        
        if (crewIndex === -1) {
          reject(new Error('Crew member not found'));
          return;
        }

        mission.crewMembers[crewIndex] = {
          ...mission.crewMembers[crewIndex],
          ...updates,
        };
        mission.updatedAt = new Date().toISOString();

        resolve(mission.crewMembers[crewIndex]);
      }, 300);
    });
  }

  async removeCrewMember(missionId: string, crewMemberId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mission = this.missions.find(m => m.id === missionId);
        
        if (!mission) {
          reject(new Error('Mission not found'));
          return;
        }

        const crewIndex = mission.crewMembers.findIndex(c => c.id === crewMemberId);
        
        if (crewIndex === -1) {
          reject(new Error('Crew member not found'));
          return;
        }

        mission.crewMembers.splice(crewIndex, 1);
        mission.updatedAt = new Date().toISOString();

        resolve();
      }, 300);
    });
  }

  async getActiveMissions(): Promise<Mission[]> {
    const result = await this.getAllMissions({ status: 'active' });
    return result.data;
  }

  async getMissionsByStatus(status: MissionStatus): Promise<Mission[]> {
    const result = await this.getAllMissions({ status });
    return result.data;
  }

  calculateMissionDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getMissionDay(missionStartDate: string, currentDate: Date = new Date()): number {
    const start = new Date(missionStartDate);
    const diffTime = currentDate.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }

  isMissionActive(mission: Mission, currentDate: Date = new Date()): boolean {
    const start = new Date(mission.startDate);
    const end = new Date(mission.endDate);
    return currentDate >= start && currentDate <= end && mission.status === 'active';
  }
}

export const missionService = new MissionService();
