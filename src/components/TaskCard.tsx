import type { Task } from '../types/types';

type Props = {
  task: Task;
  onClick?: (t: Task) => void;
};

export const TaskCard = ({ task, onClick }: Props) => {
  return (
    <div
      role="button"
      onClick={() => onClick?.(task)}
      className={`rounded px-2 py-1 text-xs border select-none cursor-pointer bg-gray-200 dark:bg-gray-700`}
    >
      <div className="font-medium truncate">{task.title}</div>
      <div className="text-[10px] opacity-70 truncate">{task.details}</div>
    </div>
  );
};

export default TaskCard;
