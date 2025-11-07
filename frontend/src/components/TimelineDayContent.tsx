import React, { useRef, useLayoutEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { getActivityColor } from '../utils/activityUtils';
import type { Mission, Activity } from '../types/types';

interface TimelineDayContentProps {
  date: string;
  mission: Mission;
  activities: Activity[];
  loading: boolean;
  onAddTask: (crewMemberId: string, startTime: number) => void;
  onViewTask: (task: Activity) => void;
  rowHeights: number[];
  onMeasureRow?: (index: number, height: number) => void;
}

export const TimelineDayContent = ({
  date,
  mission,
  activities,
  loading,
  onAddTask,
  onViewTask,
  rowHeights,
  onMeasureRow,
}: TimelineDayContentProps) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const crewMembers = mission.crewMembers || [];
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  const getActivitiesForCrewMember = (crewMemberId: string) => {
    return activities.filter((activity) => activity.crewMemberId === crewMemberId);
  };

  useLayoutEffect(() => {
    if (onMeasureRow) {
      rowRefs.current.forEach((row, index) => {
        if (row) {
          const height = row.getBoundingClientRect().height;
          onMeasureRow(index, height);
        }
      });
    }
  }, [onMeasureRow, activities]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 min-w-full">
        <Loader2 className="h-8 w-8 animate-spin text-space-600" />
      </div>
    );
  }

 return (
  <div className="min-w-full shrink-0 snap-center">
    <div className="overflow-x-auto overflow-visible">
      <div className="inline-block min-w-full align-middle overflow-visible">
        <table className="min-w-full overflow-visible">
          <thead>
            <tr>
              {hours.map((hour) => (
                <th
                  key={hour}
                  className="px-2 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  style={{ minWidth: '60px' }}
                >
                  {hour.toString().padStart(2, '0')}:00
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {crewMembers.map((member, memberIndex) => {
              const memberActivities = getActivitiesForCrewMember(member.id);
              const appliedHeight = rowHeights[memberIndex] || 60;

              return (
                <tr
                  key={member.id}
                  ref={(el) => void (rowRefs.current[memberIndex] = el)}
                  className="border-t border-slate-200 dark:border-slate-700 overflow-visible"
                  style={{ height: `${appliedHeight}px` }}
                >
                  {hours.map((hour) => {
                    const activityAtHour = memberActivities.find(
                      (activity) =>
                        activity.start <= hour && activity.start + activity.duration > hour
                    );

                    const isActivityStart =
                      activityAtHour && activityAtHour.start === hour;

                    return (
                      <td
                        key={hour}
                        className="relative border-r border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                        style={{ height: '60px', minWidth: '60px' }}
                        onClick={() => {
                          if (!activityAtHour) onAddTask(member.id, hour);
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
}