import type { ActivityType, Priority, MissionStatus, UserRole } from './types';

export interface BackendActivity {
  id: string;
  name: string;
  start_hour: number;
  duration: number;
  type: ActivityType;
  priority?: Priority;
  mission?: string;
  description?: string;
  equipment?: string[];
  crew_member_id: string;
  mission_id: string;
  date: string;
  pdf_url: string;
  created_at: string;
  updated_at: string;
}

export interface BackendCrewMember {
  id: string;
  name: string;
  role?: string;
  email?: string;
  mission_id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BackendMission {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: MissionStatus;
  crew_members?: BackendCrewMember[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface BackendUser {
  id: string;
  username: string;
  role: UserRole;
  full_name: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface BackendLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: BackendUser;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateActivityBackendRequest {
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
  is_recurring?: boolean;
  recurrence?: {
    type: 'daily' | 'weekly' | 'custom';
    interval?: number;
    daysOfWeek?: number[];
    endDate?: string;
  };
}

export interface UpdateActivityBackendRequest {
  name?: string;
  start_hour?: number;
  duration?: number;
  type?: ActivityType;
  priority?: Priority;
  mission?: string;
  description?: string;
  equipment?: string[];
  date?: string;
  crew_member_id?: string;
  mission_id?: string;
}

export interface CreateCrewMemberBackendRequest {
  mission_id: string;
  name: string;
  role?: string;
  email?: string;
  user_id?: string;
}

export interface UpdateCrewMemberBackendRequest {
  name?: string;
  role?: string;
  email?: string;
}

export interface CreateMissionBackendRequest {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status?: MissionStatus;
}

export interface UpdateMissionBackendRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: MissionStatus;
}

export interface CreateUserBackendRequest {
  username: string;
  password: string;
  full_name: string;
  email?: string;
  role: UserRole;
  is_active: boolean;
}

export interface UpdateUserBackendRequest {
  username?: string;
  password?: string;
  full_name?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface LoginBackendRequest {
  username: string;
  password: string;
}

export interface MissionFiltersBackend {
  status?: MissionStatus;
  start_date?: string;
  end_date?: string;
}

export interface UserFiltersBackend {
  role?: UserRole;
  is_active?: boolean;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BackendActivityComment {
  id: string;
  activity_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  username?: string;
  full_name?: string;
  role?: string;
}

export interface CreateCommentBackendRequest {
  activity_id: string;
  comment: string;
}

export interface UpdateCommentBackendRequest {
  comment: string;
}
