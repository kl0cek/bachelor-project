import { Between, IsNull, Not } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Activity, ActivityType, Priority, RecurrenceType } from '../entities/Activity.entity';
import { CrewMember } from '../entities/CrewMember.entity';
import { Mission } from '../entities/Mission.entity';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';
import { auditService } from './audit.service';

export interface RecurrenceConfig {
  type: RecurrenceType;
  interval?: number;
  daysOfWeek?: number[];
  endDate?: string;
}

export interface CreateActivityDto {
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
  recurrence?: RecurrenceConfig;
}

export interface UpdateActivityDto {
  name?: string;
  date?: string;
  start_hour?: number;
  duration?: number;
  type?: ActivityType;
  priority?: Priority;
  mission?: string;
  description?: string;
  equipment?: string[];
  pdf_url?: string | null;
  is_recurring?: boolean;
  recurrence?: RecurrenceConfig;
}

class ActivityService {
  private activityRepository = AppDataSource.getRepository(Activity);
  private crewRepository = AppDataSource.getRepository(CrewMember);
  private missionRepository = AppDataSource.getRepository(Mission);

  async getActivitiesByMissionAndDate(missionId: string, date: string): Promise<Activity[]> {
    const activities = await this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.crew_member', 'crew_member')
      .leftJoinAndSelect('crew_member.user', 'user')
      .where('activity.mission_id = :missionId', { missionId })
      .andWhere('activity.date = :date', { date: new Date(date) })
      .andWhere('NOT (activity.is_recurring = true AND activity.parent_activity_id IS NULL)')
      .orderBy('activity.crew_member_id', 'ASC')
      .addOrderBy('activity.start_hour', 'ASC')
      .getMany();

    return activities;
  }

  async getActivitiesByCrewAndDate(crewMemberId: string, date: string): Promise<Activity[]> {
    const activities = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.crew_member_id = :crewMemberId', { crewMemberId })
      .andWhere('activity.date = :date', { date: new Date(date) })
      .andWhere('NOT (activity.is_recurring = true AND activity.parent_activity_id IS NULL)')
      .orderBy('activity.start_hour', 'ASC')
      .getMany();

    return activities;
  }

  async createActivity(data: CreateActivityDto, userId: string): Promise<Activity | Activity[]> {
    const crewMember = await this.crewRepository.findOne({
      where: { id: data.crew_member_id },
      relations: ['mission'],
    });

    if (!crewMember) {
      throw new NotFoundError('Crew member not found');
    }

    if (crewMember.mission_id !== data.mission_id) {
      throw new BadRequestError('Crew member does not belong to this mission');
    }

    const mission = await this.missionRepository.findOne({
      where: { id: data.mission_id },
    });

    if (!mission) {
      throw new NotFoundError('Mission not found');
    }

    if (data.start_hour < 0 || data.start_hour >= 24) {
      throw new BadRequestError('Start hour must be between 0 and 24');
    }

    if (data.duration <= 0 || data.start_hour + data.duration > 24) {
      throw new BadRequestError('Invalid activity duration');
    }

    if (!data.is_recurring) {
      return await this.createSingleActivity(data, userId);
    }

    return await this.createRecurringActivities(data, mission, userId);
  }

  private async createSingleActivity(data: CreateActivityDto, userId: string): Promise<Activity> {
    const hasConflict = await this.checkTimeConflict(
      data.crew_member_id,
      data.date,
      data.start_hour,
      data.duration
    );

    if (hasConflict) {
      throw new ConflictError('Activity conflicts with existing schedule');
    }

    const activity = this.activityRepository.create({
      ...data,
      date: new Date(data.date),
      created_by: userId,
      is_recurring: false,
    });

    const saved = await this.activityRepository.save(activity);

    await auditService.log({
      userId,
      action: 'create_activity',
      resourceType: 'activity',
      resourceId: saved.id,
      changes: data,
    });

    return saved;
  }

  private async createRecurringActivities(
    data: CreateActivityDto,
    mission: Mission,
    userId: string
  ): Promise<Activity[]> {
    if (!data.recurrence) {
      throw new BadRequestError('Recurrence configuration required for recurring activities');
    }

    const { type, interval, daysOfWeek, endDate } = data.recurrence;

    const recurEndDate = endDate ? new Date(endDate) : new Date(mission.end_date);
    const startDate = new Date(data.date);

    if (recurEndDate <= startDate) {
      throw new BadRequestError('Recurrence end date must be after start date');
    }

    const dates = this.generateRecurringDates(startDate, recurEndDate, type, interval, daysOfWeek);

    if (dates.length === 0) {
      throw new BadRequestError('No valid dates generated for recurrence pattern');
    }

    if (dates.length > 365) {
      throw new BadRequestError('Too many recurrence instances (max 365)');
    }

    const parentActivity = this.activityRepository.create({
      crew_member_id: data.crew_member_id,
      mission_id: data.mission_id,
      name: data.name,
      date: startDate,
      start_hour: data.start_hour,
      duration: data.duration,
      type: data.type,
      priority: data.priority,
      mission: data.mission,
      description: data.description,
      equipment: data.equipment,
      created_by: userId,
      is_recurring: true,
      recurrence_type: type,
      recurrence_interval: interval,
      recurrence_days_of_week: daysOfWeek,
      recurrence_end_date: recurEndDate,
    });

    const savedParent = await this.activityRepository.save(parentActivity);

    const instances: Activity[] = [];
    const conflictDates: string[] = [];

    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];

      const hasConflict = await this.checkTimeConflict(
        data.crew_member_id,
        dateStr,
        data.start_hour,
        data.duration
      );

      if (hasConflict) {
        conflictDates.push(dateStr);
        continue;
      }

      const instance = this.activityRepository.create({
        crew_member_id: data.crew_member_id,
        mission_id: data.mission_id,
        name: data.name,
        date: date,
        start_hour: data.start_hour,
        duration: data.duration,
        type: data.type,
        priority: data.priority,
        mission: data.mission,
        description: data.description,
        equipment: data.equipment,
        created_by: userId,
        is_recurring: false,
        parent_activity_id: savedParent.id,
      });

      instances.push(instance);
    }

    const savedInstances = await this.activityRepository.save(instances);

    await auditService.log({
      userId,
      action: 'create_recurring_activity',
      resourceType: 'activity',
      resourceId: savedParent.id,
      changes: {
        ...data,
        instancesCreated: savedInstances.length,
        conflictsSkipped: conflictDates.length,
        conflictDates,
      },
    });

    return [savedParent, ...savedInstances];
  }

  private generateRecurringDates(
    startDate: Date,
    endDate: Date,
    type: RecurrenceType,
    interval?: number,
    daysOfWeek?: number[]
  ): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);

    switch (type) {
      case RecurrenceType.DAILY:
        const dailyInterval = interval || 1;
        while (current <= endDate) {
          dates.push(new Date(current));
          current.setDate(current.getDate() + dailyInterval);
        }
        break;

      case RecurrenceType.WEEKLY:
        if (!daysOfWeek || daysOfWeek.length === 0) {
          throw new BadRequestError('Days of week required for weekly recurrence');
        }

        while (current <= endDate) {
          const dayOfWeek = current.getDay();
          if (daysOfWeek.includes(dayOfWeek)) {
            dates.push(new Date(current));
          }
          current.setDate(current.getDate() + 1);
        }
        break;

      case RecurrenceType.CUSTOM:
        if (!interval || interval < 1) {
          throw new BadRequestError('Interval required for custom recurrence');
        }
        while (current <= endDate) {
          dates.push(new Date(current));
          current.setDate(current.getDate() + interval);
        }
        break;
    }

    return dates;
  }

  async updateActivity(id: string, data: UpdateActivityDto, userId: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundError('Activity not found');
    }

    if (activity.isRecurringParent()) {
      throw new BadRequestError(
        'Cannot update recurring parent activity directly. Use updateRecurringActivities instead.'
      );
    }

    if (!activity.is_recurring && data.is_recurring && data.recurrence) {
      return await this.convertToRecurring(
        activity,
        data as UpdateActivityDto & { recurrence: RecurrenceConfig },
        userId
      );
    }

    const originalData = { ...activity };

    if (data.start_hour !== undefined || data.duration !== undefined) {
      const newStartHour = data.start_hour ?? activity.start_hour;
      const newDuration = data.duration ?? activity.duration;

      if (newStartHour < 0 || newStartHour >= 24) {
        throw new BadRequestError('Start hour must be between 0 and 24');
      }

      if (newDuration <= 0 || newStartHour + newDuration > 24) {
        throw new BadRequestError('Invalid activity duration');
      }

      const dateToCheck = data.date
        ? new Date(data.date).toISOString().split('T')[0]
        : activity.date.toISOString().split('T')[0];

      const hasConflict = await this.checkTimeConflict(
        activity.crew_member_id,
        dateToCheck,
        newStartHour,
        newDuration,
        id
      );

      if (hasConflict) {
        throw new ConflictError('Updated time conflicts with existing schedule');
      }
    }

    const { date: newDate, is_recurring, recurrence, ...safeData } = data;

    Object.assign(activity, safeData);

    if (newDate) {
      activity.date = new Date(newDate);
    }

    const updated = await this.activityRepository.save(activity);

    await auditService.log({
      userId,
      action: 'update_activity',
      resourceType: 'activity',
      resourceId: id,
      changes: { before: originalData, after: data },
    });

    return updated;
  }

  async updateRecurringActivities(
    parentId: string,
    data: UpdateActivityDto,
    userId: string
  ): Promise<{ updated: number; skipped: number }> {
    const parent = await this.activityRepository.findOne({
      where: { id: parentId },
    });

    if (!parent || !parent.isRecurringParent()) {
      throw new NotFoundError('Recurring parent activity not found');
    }

    const instances = await this.activityRepository.find({
      where: { parent_activity_id: parentId },
    });

    const { date, is_recurring, recurrence, ...updateData } = data;

    let updated = 0;
    let skipped = 0;

    for (const instance of instances) {
      try {
        const instanceUpdate = { ...updateData };

        if (updateData.start_hour !== undefined || updateData.duration !== undefined) {
          const newStartHour = updateData.start_hour ?? instance.start_hour;
          const newDuration = updateData.duration ?? instance.duration;

          const instanceDateStr =
            instance.date instanceof Date
              ? instance.date.toISOString().split('T')[0]
              : String(instance.date).split('T')[0];

          const hasConflict = await this.checkTimeConflict(
            instance.crew_member_id,
            instanceDateStr,
            newStartHour,
            newDuration,
            instance.id
          );

          if (hasConflict) {
            skipped++;
            console.log(`Skipping instance ${instance.id} due to time conflict`);
            continue;
          }
        }

        Object.assign(instance, instanceUpdate);
        await this.activityRepository.save(instance);
        updated++;
      } catch (error) {
        skipped++;
        console.error(`Failed to update instance ${instance.id}:`, error);
      }
    }

    const { date: _, is_recurring: __, recurrence: ___, ...parentUpdateData } = data;
    Object.assign(parent, parentUpdateData);
    await this.activityRepository.save(parent);

    await auditService.log({
      userId,
      action: 'update_recurring_activities',
      resourceType: 'activity',
      resourceId: parentId,
      changes: { updated, skipped, data: updateData },
    });

    return { updated, skipped };
  }

  async deleteActivity(id: string, userId: string): Promise<void> {
    const activity = await this.activityRepository.findOne({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundError('Activity not found');
    }

    if (activity.isRecurringParent()) {
      throw new BadRequestError(
        'Cannot delete recurring parent directly. Use deleteRecurringActivities instead.'
      );
    }

    await this.activityRepository.remove(activity);

    await auditService.log({
      userId,
      action: 'delete_activity',
      resourceType: 'activity',
      resourceId: id,
      changes: activity,
    });
  }

  async deleteRecurringActivities(parentId: string, userId: string): Promise<number> {
    const parent = await this.activityRepository.findOne({
      where: { id: parentId },
    });

    if (!parent || !parent.isRecurringParent()) {
      throw new NotFoundError('Recurring parent activity not found');
    }

    const result = await this.activityRepository.delete({
      parent_activity_id: parentId,
    });

    await this.activityRepository.remove(parent);

    const deletedCount = (result.affected || 0) + 1;

    await auditService.log({
      userId,
      action: 'delete_recurring_activities',
      resourceType: 'activity',
      resourceId: parentId,
      changes: { deletedCount },
    });

    return deletedCount;
  }

  async getActivityById(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['crew_member', 'mission_ref', 'created_by_user', 'parent_activity'],
    });

    if (!activity) {
      throw new NotFoundError('Activity not found');
    }

    return activity;
  }

  async getRecurringParent(childId: string): Promise<Activity | null> {
    const child = await this.activityRepository.findOne({
      where: { id: childId },
    });

    if (!child || !child.parent_activity_id) {
      return null;
    }

    return await this.activityRepository.findOne({
      where: { id: child.parent_activity_id },
    });
  }

  private async checkTimeConflict(
    crewMemberId: string,
    date: string,
    startHour: number,
    duration: number,
    excludeActivityId?: string
  ): Promise<boolean> {
    const endHour = startHour + duration;
    const normalizedDate = date.split('T')[0];

    const query = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.crew_member_id = :crewMemberId', { crewMemberId })
      .andWhere('activity.date = :date', { date: normalizedDate })
      .andWhere(
        '(activity.start_hour < :endHour AND (activity.start_hour + activity.duration) > :startHour)',
        { startHour, endHour }
      )
      .andWhere('NOT (activity.is_recurring = true AND activity.parent_activity_id IS NULL)');

    if (excludeActivityId) {
      query.andWhere('activity.id != :excludeActivityId', { excludeActivityId });
    }

    const conflictCount = await query.getCount();
    return conflictCount > 0;
  }

  async getAvailableTimeSlots(
    crewMemberId: string,
    date: string,
    duration: number,
    minHour: number = 6,
    maxHour: number = 22
  ): Promise<Array<{ start: number; end: number }>> {
    const activities = await this.getActivitiesByCrewAndDate(crewMemberId, date);

    const slots: Array<{ start: number; end: number }> = [];
    let currentHour = minHour;

    const sortedActivities = activities.sort((a, b) => a.start_hour - b.start_hour);

    for (const activity of sortedActivities) {
      const activityStart = activity.start_hour;

      if (currentHour + duration <= activityStart) {
        slots.push({
          start: currentHour,
          end: activityStart,
        });
      }

      currentHour = Math.max(currentHour, activity.start_hour + activity.duration);
    }

    if (currentHour + duration <= maxHour) {
      slots.push({
        start: currentHour,
        end: maxHour,
      });
    }

    return slots;
  }

  private async convertToRecurring(
    activity: Activity,
    data: UpdateActivityDto & { recurrence: RecurrenceConfig },
    userId: string
  ): Promise<Activity> {
    const mission = await this.missionRepository.findOne({
      where: { id: activity.mission_id },
    });

    if (!mission) {
      throw new NotFoundError('Mission not found');
    }

    activity.is_recurring = true;
    activity.recurrence_type = data.recurrence.type;
    activity.recurrence_interval = data.recurrence.interval;
    activity.recurrence_days_of_week = data.recurrence.daysOfWeek;
    activity.recurrence_end_date = data.recurrence.endDate
      ? new Date(data.recurrence.endDate)
      : new Date(mission.end_date);

    const parent = await this.activityRepository.save(activity);

    const endDate = data.recurrence.endDate
      ? new Date(data.recurrence.endDate)
      : new Date(mission.end_date);

    const startDate = new Date(activity.date);

    const dates = this.generateRecurringDates(
      startDate,
      endDate,
      data.recurrence.type,
      data.recurrence.interval,
      data.recurrence.daysOfWeek
    );

    if (dates.length === 0) {
      throw new BadRequestError('No valid dates generated for recurrence pattern');
    }

    const instances: Activity[] = [];
    const conflictDates: string[] = [];

    const startDateStr = startDate.toISOString().split('T')[0];
    const datesToCreate = dates.filter((date) => date.toISOString().split('T')[0] !== startDateStr);

    for (const date of datesToCreate) {
      const dateStr = date.toISOString().split('T')[0];

      const hasConflict = await this.checkTimeConflict(
        activity.crew_member_id,
        dateStr,
        activity.start_hour,
        activity.duration
      );

      if (hasConflict) {
        conflictDates.push(dateStr);
        continue;
      }

      const instance = this.activityRepository.create({
        crew_member_id: activity.crew_member_id,
        mission_id: activity.mission_id,
        name: activity.name,
        date: date,
        start_hour: activity.start_hour,
        duration: activity.duration,
        type: activity.type,
        priority: activity.priority,
        mission: activity.mission,
        description: activity.description,
        equipment: activity.equipment,
        created_by: userId,
        is_recurring: false,
        parent_activity_id: parent.id,
      });

      instances.push(instance);
    }

    await this.activityRepository.save(instances);

    await auditService.log({
      userId,
      action: 'convert_to_recurring',
      resourceType: 'activity',
      resourceId: parent.id,
      changes: {
        instancesCreated: instances.length,
        conflictsSkipped: conflictDates.length,
        conflictDates,
      },
    });

    return parent;
  }
}

export const activityService = new ActivityService();
