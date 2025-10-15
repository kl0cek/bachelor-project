import { Menu, Satellite } from "lucide-react";
import { Button } from "./ui/Button";

export const PlaybookHeader = () => {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
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
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  ISS Mission Playbook
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Analog Mission Communication Platform
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
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