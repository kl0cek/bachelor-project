import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { getActivityColor } from '../utils/activityUtils';
import type { Mission, Activity } from '../types/types';

interface TimelineDayProps {
  date: string;
  mission: Mission;
  activities: Activity[];
  loading: boolean;
  onAddTask: (crewMemberId: string, startTime: number) => void;
  onViewTask: (task: Activity) => void;
}

export const TimelineDay: React.FC<TimelineDayProps> = ({
  date,
  mission,
  activities,
  loading,
  onAddTask,
  onViewTask,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const crewMembers = mission.crewMembers || [];

  const getActivitiesForCrewMember = (crewMemberId: string) => {
    return activities.filter((activity) => activity.crewMemberId === crewMemberId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 min-w-full">
        <Loader2 className="h-8 w-8 animate-spin text-space-600" />
      </div>
    );
  }

  return (
    <div className="min-w-full shrink-0 snap-center">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700">
                  Crew Member
                </th>
                {hours.map((hour) => (
                  <th
                    key={hour}
                    className="px-2 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700"
                    style={{ minWidth: '60px' }}
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crewMembers.map((member) => {
                const memberActivities = getActivitiesForCrewMember(member.id);

                return (
                  <tr
                    key={member.id}
                    className="border-t border-slate-200 dark:border-slate-700"
                  >
                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {member.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {member.role}
                        </div>
                      </div>
                    </td>
                    {hours.map((hour) => {
                      const activityAtHour = memberActivities.find(
                        (activity) =>
                          activity.start <= hour && activity.start + activity.duration > hour
                      );

                      const isActivityStart = activityAtHour && activityAtHour.start === hour;

                      return (
                        <td
                          key={hour}
                          className="relative border-r border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                          style={{ height: '60px', minWidth: '60px' }}
                          onClick={() => {
                            if (!activityAtHour) {
                              onAddTask(member.id, hour);
                            }
                          }}
                        >
                          {isActivityStart && activityAtHour && (
                            <div
                              className={`absolute inset-0 ${getActivityColor(activityAtHour.type)} rounded px-2 py-1 text-xs font-medium text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}
                              style={{
                                width: `calc(${activityAtHour.duration * 100}% - 2px)`,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewTask(activityAtHour);
                              }}
                              title={activityAtHour.name}
                            >
                              <div className="truncate">{activityAtHour.name}</div>
                            </div>
                          )}

                          {!activityAtHour && (
                            <button
                              className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddTask(member.id, hour);
                              }}
                            >
                              <Plus className="h-4 w-4 text-slate-400" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
