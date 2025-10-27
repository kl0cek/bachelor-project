{
  /* 
import type { Activity, ActivityType, Priority } from '../types/types';

export interface CreateActivityRequest {
  name: string;
  start: number;
  duration: number;
  type: ActivityType;
  mission?: string;
  description?: string;
  equipment?: string[];
  priority?: Priority;
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

export interface ActivityFilters {
  type?: ActivityType;
  priority?: Priority;
  mission?: string;
  startTime?: number;
  endTime?: number;
  equipment?: string;
}

export interface DaySchedule {
  crewMemberId: string;
  activities: Activity[];
}

export interface TimeSlot {
  start: number;
  end: number;
  isAvailable: boolean;
  conflictingActivity?: Activity;
}

class ActivityService {
  async getActivitiesForCrewMember(crewMemberId: string, date?: string): Promise<Activity[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockActivities = this.getMockActivitiesForDay(crewMemberId, 1);
        resolve(mockActivities);
      }, 200);
    });
  }

  async getActivitiesForMission(missionId: string, date?: string): Promise<DaySchedule[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const crewIds = ['fe-1', 'fe-2', 'fe-4', 'fe-5'];
        const schedules: DaySchedule[] = crewIds.map((crewId) => ({
          crewMemberId: crewId,
          activities: this.getMockActivitiesForDay(crewId, 1),
        }));
        resolve(schedules);
      }, 300);
    });
  }

  async createActivity(
    crewMemberId: string,
    activityData: CreateActivityRequest
  ): Promise<Activity> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newActivity: Activity = {
          id: `activity-${Date.now()}`,
          ...activityData,
          priority: activityData.priority || 'medium',
        };
        resolve(newActivity);
      }, 300);
    });
  }

  async updateActivity(
    activityId: string,
    updates: UpdateActivityRequest
  ): Promise<Activity | null> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          id: activityId,
          name: updates.name || 'Updated Activity',
          start: updates.start || 8,
          duration: updates.duration || 1,
          type: updates.type || 'work',
          mission: updates.mission,
          description: updates.description,
          equipment: updates.equipment,
          priority: updates.priority || 'medium',
        });
      }, 300);
    });
  }

  async deleteActivity(activityId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  }

  async getAvailableTimeSlots(
    crewMemberId: string,
    date: string,
    duration: number
  ): Promise<TimeSlot[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activities = this.getMockActivitiesForDay(crewMemberId, 1);
        const timeSlots: TimeSlot[] = [];

        for (let hour = 6; hour <= 22; hour += 0.5) {
          const slotEnd = hour + duration;
          const hasConflict = activities.some((activity) => {
            const activityEnd = activity.start + activity.duration;
            return hour < activityEnd && slotEnd > activity.start;
          });

          timeSlots.push({
            start: hour,
            end: slotEnd,
            isAvailable: !hasConflict && slotEnd <= 24,
            conflictingActivity: hasConflict
              ? activities.find((a) => hour < a.start + a.duration && slotEnd > a.start)
              : undefined,
          });
        }

        resolve(timeSlots.filter((slot) => slot.isAvailable));
      }, 200);
    });
  }

  async validateActivityTime(
    crewMemberId: string,
    start: number,
    duration: number,
    excludeActivityId?: string
  ): Promise<boolean> {
    const activities = await this.getActivitiesForCrewMember(crewMemberId);
    const filteredActivities = excludeActivityId
      ? activities.filter((a) => a.id !== excludeActivityId)
      : activities;

    const activityEnd = start + duration;

    return !filteredActivities.some((activity) => {
      const existingEnd = activity.start + activity.duration;
      return start < existingEnd && activityEnd > activity.start;
    });
  }

  async duplicateActivity(activityId: string, newStart?: number): Promise<Activity> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const duplicatedActivity: Activity = {
          id: `activity-${Date.now()}`,
          name: 'Duplicated Activity',
          start: newStart || 8,
          duration: 1,
          type: 'work',
          priority: 'medium',
        };
        resolve(duplicatedActivity);
      }, 200);
    });
  }

  filterActivities(activities: Activity[], filters: ActivityFilters): Activity[] {
    return activities.filter((activity) => {
      if (filters.type && activity.type !== filters.type) return false;
      if (filters.priority && activity.priority !== filters.priority) return false;
      if (filters.mission && activity.mission !== filters.mission) return false;
      if (filters.startTime !== undefined && activity.start < filters.startTime) return false;
      if (filters.endTime !== undefined && activity.start + activity.duration > filters.endTime)
        return false;
      if (
        filters.equipment &&
        activity.equipment &&
        !activity.equipment.some((eq) => eq.includes(filters.equipment!))
      )
        return false;

      return true;
    });
  }

  calculateActivityPosition(
    start: number,
    duration: number,
    minHour: number = 0,
    maxHour: number = 24
  ) {
    const totalHours = maxHour - minHour;
    const left = ((start - minHour) / totalHours) * 100;
    const width = (duration / totalHours) * 100;
    return { left, width };
  }

  formatActivityTime(hour: number): string {
    const hours = Math.floor(hour);
    const minutes = Math.round((hour % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  getActivityColor(type: ActivityType): string {
    const colors = {
      exercise: 'bg-space-600 text-gray-200 shadow-space border-space-700',
      meal: 'bg-slate-400 text-gray-200 dark:bg-slate-600 border-slate-500',
      sleep: 'bg-slate-400 text-gray-200 dark:bg-slate-600 border-slate-500',
      work: 'bg-space-600 text-gray-200 shadow-space border-space-700',
      eva: 'bg-orange-500 text-gray-200 shadow-orange border-orange-600',
      optional:
        'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    };
    return colors[type];
  }

  getPriorityColor(priority: Priority): string {
    if (!priority) return 'bg-slate-400 text-gray-200 dark:bg-slate-600';

    const colors = {
      high: 'bg-orange-500 text-gray-200 shadow-orange',
      medium: 'bg-space-600 text-gray-200 shadow-space',
      low: 'bg-slate-400 text-gray-200 dark:bg-slate-600',
    };
    return colors[priority];
  }

  private getMockActivitiesForDay(crewMemberId: string, day: number): Activity[] {
    const mockActivities: Record<string, Activity[]> = {
      'fe-1': [
        {
          id: '1',
          name: 'Sleep',
          start: 0,
          duration: 6,
          type: 'sleep',
          mission: 'Daily Operations',
          description: 'Night sleep period',
          priority: 'high',
        },
        {
          id: '2',
          name: 'Post-sleep',
          start: 7,
          duration: 1,
          type: 'sleep',
          mission: 'Daily Operations',
          description: 'Morning routine and preparation',
          priority: 'medium',
        },
        {
          id: '3',
          name: 'Exercise',
          start: 11,
          duration: 1.5,
          type: 'exercise',
          mission: 'Health & Fitness',
          description: 'Cardiovascular training',
          priority: 'high',
        },
        {
          id: '4',
          name: 'Lunch',
          start: 12.5,
          duration: 0.5,
          type: 'meal',
          mission: 'Nutrition Program',
          description: 'Midday meal',
          priority: 'medium',
        },
      ],
      'fe-2': [
        {
          id: '5',
          name: 'Sleep',
          start: 0,
          duration: 6,
          type: 'sleep',
          mission: 'Daily Operations',
          description: 'Night sleep period',
          priority: 'high',
        },
        {
          id: '6',
          name: 'Post-sleep',
          start: 6,
          duration: 1,
          type: 'sleep',
          mission: 'Daily Operations',
          description: 'Morning routine',
          priority: 'medium',
        },
      ],
      'fe-4': [
        {
          id: '7',
          name: 'Sleep',
          start: 0,
          duration: 6,
          type: 'sleep',
          mission: 'Daily Operations',
          description: 'Night sleep period',
          priority: 'high',
        },
        {
          id: '8',
          name: 'EVA Preparation',
          start: 8,
          duration: 2,
          type: 'eva',
          mission: 'EVA-47',
          description: 'Spacewalk prep and suit check',
          priority: 'high',
        },
      ],
      'fe-5': [
        {
          id: '9',
          name: 'Sleep',
          start: 0,
          duration: 6,
          type: 'sleep',
          mission: 'Daily Operations',
          description: 'Night sleep period',
          priority: 'high',
        },
        {
          id: '10',
          name: 'Optional Research',
          start: 9,
          duration: 2,
          type: 'optional',
          mission: 'Science',
          description: 'Additional experiments',
          priority: 'low',
        },
      ],
    };

    return mockActivities[crewMemberId] || [];
  }
}

export const activityService = new ActivityService();
*/
}
