import { Menu, Satellite } from "lucide-react";
import { Button } from "./ui/Button";
import { ISSStatus } from "./ISSStatus";

export const PlaybookHeader = () => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-space-100 dark:bg-space-900">
                <Satellite className="h-6 w-6 text-space-600 dark:text-space-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  ISS Mission Playbook
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Analog Mission Communication Platform
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <ISSStatus />
            </div>
            <div className="hidden md:flex lg:hidden items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Mission Active
              </span>
            </div>
          </div>
        </div>
        <div className="lg:hidden mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <ISSStatus />
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Mission Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};