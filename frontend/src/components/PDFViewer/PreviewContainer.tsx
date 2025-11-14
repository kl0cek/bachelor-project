

export const PreviewContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
    {children}
  </div>
);