export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-space-500 border-t-transparent mb-4"></div>
      <p className="text-slate-600 dark:text-slate-400">Loading...</p>
    </div>
  </div>
);

export default PageLoader;
