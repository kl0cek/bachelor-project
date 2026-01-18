import { Fragment, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { TimeSlot } from './TimeSlot';
import type { CrewMember, Activity } from '../../types/types';

interface ScrollableTimelineTableProps {
  crewMembers: CrewMember[];
  allDates: string[];
  activities: Activity[];
  loading: boolean;
  onAddTask: (crewMemberId: string, hour: number) => void;
  onViewTask: (activity: Activity) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  currentDate: string;
  setCurrentDate: (date: string) => void;
  getDayNumber: (date: string) => number;
}

const hours = Array.from({ length: 24 }, (_, i) => i);

export const ScrollableTimelineTable = ({
  crewMembers,
  allDates,
  activities,
  loading,
  onAddTask,
  onViewTask,
  scrollContainerRef,
  currentDate,
  setCurrentDate,
  getDayNumber,
}: ScrollableTimelineTableProps) => {
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const today = new Date().toISOString().split('T')[0];
  const isTodayInMission = allDates.includes(today);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getActivitiesForCrewMemberAndDate = (crewMemberId: string, date: string) => {
    return activities.filter(
      (activity) => activity.crewMemberId === crewMemberId && activity.date === date
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-space-600" />
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="overflow-x-auto overflow-y-auto max-h-[600px] relative"
    >
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="sticky left-0 z-30 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 border-r-2 border-slate-300 dark:border-slate-600 min-w-[180px]">
              Crew Member
            </th>

            {allDates.map((date) => (
              <th
                key={`date-header-${date}`}
                colSpan={24}
                className={`px-2 py-3 text-center text-sm font-semibold border-r-2 border-slate-300 dark:border-slate-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  date === currentDate
                    ? 'bg-space-100 dark:bg-space-900 text-space-700 dark:text-space-300'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
                style={{ minWidth: '1440px' }}
                onClick={() => setCurrentDate(date)}
              >
                <div className="flex flex-col">
                  <span className="font-bold">Day {getDayNumber(date)}</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    {formatDateShort(date)}
                  </span>
                </div>
              </th>
            ))}
          </tr>

          <tr>
            <th className="sticky left-0 z-30 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-400 border-r-2 border-slate-300 dark:border-slate-600">
              UTC Time
            </th>

            {allDates.map((date) => (
              <Fragment key={`hours-header-${date}`}>
                {hours.map((hour) => (
                  <th
                    key={`${date}-hour-${hour}`}
                    className="px-2 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 relative"
                    style={{ minWidth: '60px' }}
                  >
                    {hour.toString().padStart(2, '0')}:00
                    {isTodayInMission && date === today && hour === currentHour && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-red-600 dark:bg-red-500 z-40" />
                    )}
                  </th>
                ))}
              </Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {crewMembers.map((member) => (
            <tr key={member.id} className="border-t border-slate-200 dark:border-slate-700">
              <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 px-4 py-3 border-r-2 border-slate-300 dark:border-slate-600">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {member.name}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{member.role}</div>
                </div>
              </td>

              {allDates.map((date) => {
                const memberActivities = getActivitiesForCrewMemberAndDate(member.id, date);

                return (
                  <Fragment key={`${member.id}-${date}`}>
                    {hours.map((hour) => {
                      const activityAtHour = memberActivities.find(
                        (activity) =>
                          activity.start <= hour && activity.start + activity.duration > hour
                      );

                      const isActivityStart = activityAtHour && activityAtHour.start === hour;
                      const showIndicator = isTodayInMission && date === today && hour === currentHour;

                      return (
                        <td
                          key={`${member.id}-${date}-${hour}`}
                          className="relative border-r border-slate-200 dark:border-slate-700 p-0"
                          style={{ height: '60px', minWidth: '60px' }}
                        >
                          <TimeSlot
                            hour={hour}
                            activity={activityAtHour}
                            isActivityStart={isActivityStart}
                            onAddTask={(h) => {
                              setCurrentDate(date);
                              onAddTask(member.id, h);
                            }}
                            onViewTask={onViewTask}
                            showCurrentHourIndicator={showIndicator}
                          />
                        </td>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
