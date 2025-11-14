import { TimeSlot } from './TimeSlot';
import type { CrewMember, Activity } from '../../types/types';

interface CrewMemberRowProps {
  member: CrewMember;
  activities: Activity[];
  hours: number[];
  onAddTask: (crewMemberId: string, hour: number) => void;
  onViewTask: (activity: Activity) => void;
}

export const CrewMemberRow = ({
  member,
  activities,
  hours,
  onAddTask,
  onViewTask,
}: CrewMemberRowProps) => {
  return (
    <tr className="border-t border-slate-200 dark:border-slate-700">
      <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 px-4 py-3 border-r border-slate-200 dark:border-slate-700">
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">{member.name}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{member.role}</div>
        </div>
      </td>
      {hours.map((hour) => {
        const activityAtHour = activities.find(
          (activity) => activity.start <= hour && activity.start + activity.duration > hour
        );

        const isActivityStart = activityAtHour && activityAtHour.start === hour;

        return (
          <TimeSlot
            key={hour}
            hour={hour}
            activity={activityAtHour}
            isActivityStart={isActivityStart}
            onAddTask={(h) => onAddTask(member.id, h)}
            onViewTask={onViewTask}
          />
        );
      })}
    </tr>
  );
};
