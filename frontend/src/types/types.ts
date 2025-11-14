export type UserRole = 'astronaut' | 'operator' | 'viewer' | 'admin';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  email?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type ActivityType = 'exercise' | 'meal' | 'sleep' | 'work' | 'eva' | 'optional';
export type Priority = 'high' | 'medium' | 'low';
export type MissionStatus = 'planning' | 'active' | 'completed' | 'cancelled';

export interface Activity {
  id: string;
  name: string;
  start: number;
  duration: number;
  type: ActivityType;
  mission?: string;
  description?: string;
  equipment?: string[];
  priority?: Priority;
  crewMemberId?: string;
  missionId?: string;
  date?: string;
  pdfUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role?: string;
  email?: string;
  activities: Activity[];
  missionId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: MissionStatus;
  crewMembers: CrewMember[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface ActivityCategory {
  name: string;
  color: string;
  type: ActivityType;
}

export interface ISSData {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  footprint: number;
  timestamp: number;
  daynum: number;
  solar_lat: number;
  solar_lon: number;
  units: string;
}

export interface ISSState {
  data: ISSData | null;
  loading: boolean;
  error: string | null;
}

export interface MissionFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface TaskState {
  crewMembers: CrewMember[];
  loading: boolean;
  error: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
}

export interface TaskContextType {
  state: TaskState;
  addTask: (crewMemberId: string, task: Activity) => void;
  updateTask: (crewMemberId: string, task: Activity) => void;
  deleteTask: (crewMemberId: string, taskId: string) => void;
  getTaskById: (taskId: string) => { task: Activity; crewMemberId: string } | null;
  loadCrewMemberActivities: (crewMemberId: string, date?: string) => Promise<void>;
  loadMissionActivities: (missionId: string, date?: string) => Promise<void>;
}

export interface ActivityModalProps {
  activity: Activity | null;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
}

export interface BadgeProps {
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
  children: React.ReactNode;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'icon' | 'sm' | 'lg';
  className?: string;
}

export interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

export interface DialogHeaderProps {
  children: React.ReactNode;
}

export interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

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

export interface CreateActivityRequest {
  name: string;
  start: number;
  duration: number;
  type: ActivityType;
  mission?: string;
  description?: string;
  equipment?: string[];
  priority?: Priority;
  crewMemberId: string;
  missionId: string;
  date: string;
}

export interface UpdateActivityRequest {
  name?: string;
  start?: number;
  duration?: number;
  type?: ActivityType;
  mission?: string;
  description?: string;
  equipment?: string[];
  priority?: Priority;
}

export interface CreateCrewMemberRequest {
  name: string;
  role?: string;
  email?: string;
  userId?: string;
  missionId: string;
}

export interface UpdateCrewMemberRequest {
  name?: string;
  role?: string;
  email?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  fullName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface MissionFilters {
  status?: MissionStatus;
  startDate?: string;
  endDate?: string;
  crewMemberId?: string;
  createdBy?: string;
}

export interface ActivityFilters {
  type?: ActivityType;
  priority?: Priority;
  mission?: string;
  startTime?: number;
  endTime?: number;
  equipment?: string;
  crewMemberId?: string;
  missionId?: string;
  date?: string;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export interface TimeSlot {
  start: number;
  end: number;
  isAvailable: boolean;
  conflictingActivity?: Activity;
}

export interface DaySchedule {
  date: string;
  crewMemberId: string;
  activities: Activity[];
}

export interface MissionDay {
  date: string;
  missionDay: number;
  schedules: DaySchedule[];
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface AppConfig {
  database: DatabaseConfig;
  jwt: JWTConfig;
  cors: {
    origin: string[];
    credentials: boolean;
  };
  uploads: {
    maxSize: number;
    allowedTypes: string[];
    destination: string;
  };
}

export interface WebSocketMessage {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  missionId?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId: string;
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  granted: boolean;
}

export interface SystemStats {
  totalUsers: number;
  totalMissions: number;
  activeMissions: number;
  totalActivities: number;
  systemUptime: string;
  lastBackup?: string;
}

export interface ActivityComment {
  id: string;
  activityId: string;
  userId: string;
  username: string;
  fullName: string;
  role: UserRole;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  activityId: string;
  comment: string;
}

export interface UpdateCommentRequest {
  comment: string;
}
