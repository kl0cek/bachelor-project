import type { Mission } from '../types/types';
import { crewMembers } from './data';

export const missions: Mission[] = [
  {
    id: 'mission-001',
    name: 'ISS Expedition 71',
    description:
      'Long-duration spaceflight mission to the International Space Station focusing on scientific research and station maintenance.',
    startDate: '2024-10-15',
    endDate: '2025-04-15',
    status: 'active',
    crewMembers: crewMembers,
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

export const getMissionById = (id: string): Mission | undefined => {
  return missions.find((mission) => mission.id === id);
};

export const getActiveMissions = (): Mission[] => {
  return missions.filter((mission) => mission.status === 'active');
};

export const getMissionsByStatus = (status: Mission['status']): Mission[] => {
  return missions.filter((mission) => mission.status === status);
};
