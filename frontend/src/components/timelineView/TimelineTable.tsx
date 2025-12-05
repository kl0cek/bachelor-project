import { Loader2 } from 'lucide-react';
import { CrewMemberRow } from './CrewMemberRow';
import type { CrewMember, Activity } from '../../types/types';

interface TimelineTableProps {
  crewMembers: CrewMember[];
  activities: Activity[];
  loading: boolean;
  onAddTask: (crewMemberId: string, hour: number) => void;
  onViewTask: (activity: Activity) => void;
}

const hours = Array.from({ length: 24 }, (_, i) => i);

export const TimelineTable = ({
  crewMembers,
  activities,
  loading,
  onAddTask,
  onViewTask,
}: TimelineTableProps) => {
  const getActivitiesForCrewMember = (crewMemberId: string) => {
    return activities.filter((activity) => activity.crewMemberId === crewMemberId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-space-600" />
      </div>
    );
  }

  return (
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
                <CrewMemberRow
                  key={member.id}
                  member={member}
                  activities={memberActivities}
                  hours={hours}
                  onAddTask={onAddTask}
                  onViewTask={onViewTask}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
