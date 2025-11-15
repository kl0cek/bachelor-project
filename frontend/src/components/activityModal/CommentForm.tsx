import { Send } from 'lucide-react';
import { Button } from '../ui/index';

interface CommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export const CommentForm = ({ value, onChange, onSubmit, disabled }: CommentFormProps) => {
  return (
    <div className="pl-6 sm:pl-8 space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add a note or comment..."
        className="w-full min-h-20 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 resize-y"
        disabled={disabled}
      />
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={!value.trim() || disabled}
          className="flex items-center gap-2"
          size="sm"
        >
          <Send className="h-3.5 w-3.5" />
          {disabled ? 'Adding...' : 'Add Comment'}
        </Button>
      </div>
    </div>
  );
};
