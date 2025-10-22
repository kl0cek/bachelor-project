import { useState } from 'react';
import { Plus, Calendar, Users } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/utils';
import { useTaskContext } from '../context/TaskContext';

interface QuickActionsProps {
  onCreateTask: (crewMemberId: string) => void;
}

export const QuickActions = ({ onCreateTask }: QuickActionsProps) => {
  const { state } = useTaskContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="flex flex-col items-end gap-3">
        {isExpanded && (
          <>
            <div className="flex flex-col gap-2 mb-2">
              {state.crewMembers.map((member) => (
                <Button
                  key={member.id}
                  variant="default"
                  onClick={() => {
                    onCreateTask(member.id);
                    setIsExpanded(false);
                  }}
                  className={cn(
                    'h-12 px-4 rounded-xl shadow-lg transition-all duration-200 transform translate-x-0',
                    'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700',
                    'hover:shadow-xl hover:scale-105'
                  )}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add task for {member.name}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setIsExpanded(false)}
              className={cn(
                'h-12 px-4 rounded-xl shadow-lg transition-all duration-200',
                'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
                'hover:shadow-xl'
              )}
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </Button>
          </>
        )}

        <Button
          onClick={toggleExpanded}
          className={cn(
            'h-14 w-14 rounded-full shadow-lg transition-all duration-200',
            'bg-slate-600 hover:bg-slate-700 text-white',
            'hover:shadow-xl hover:scale-110',
            isExpanded ? 'rotate-45' : 'rotate-0'
          )}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
