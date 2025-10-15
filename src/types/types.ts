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

export type ActivityType = Activity['type'];
export type Priority = Activity['priority'];

export interface ActivityModalProps {
  activity: Activity | null;
  onClose: () => void;
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
