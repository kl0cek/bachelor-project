export interface Activity {
  id: string;
  name: string;
  start: number;
  duration: number;
  type: 'exercise' | 'meal' | 'sleep' | 'work' | 'eva' | 'optional';
  mission?: string;
  description?: string;
  equipment?: string[];
  priority?: 'high' | 'medium' | 'low';
}

export interface CrewMember {
  id: string;
  name: string;
  activities: Activity[];
}

export interface ActivityCategory {
  name: string;
  color: string;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  crewMembers: CrewMember[];
  createdAt: string;
  updatedAt: string;
}

export interface MissionFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
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

export type ActivityType = Activity['type'];
export type Priority = Activity['priority'];
export type MissionStatus = Mission['status'];

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

export interface TaskState {
  crewMembers: CrewMember[];
}

export interface TaskContextType {
  state: TaskState;
  addTask: (crewMemberId: string, task: Activity) => void;
  updateTask: (crewMemberId: string, task: Activity) => void;
  deleteTask: (crewMemberId: string, taskId: string) => void;
  getTaskById: (taskId: string) => { task: Activity; crewMemberId: string } | null;
}
