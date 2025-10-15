import { useState } from "react";
import { Card } from "./ui/Card";
import { cn, calculateActivityPosition } from "../utils";
import { ActivityModal } from "./ActivityModel";
import type { Activity, ActivityType } from "../types/types";
import { crewMembers } from "../mock/data";

const hours = Array.from({ length: 8 }, (_, i) => i + 6);

const activityColors: Record<ActivityType, string> = {
  exercise: "bg-space-600 text-white shadow-space border-space-700",
  meal: "bg-neutral-400 text-white dark:bg-neutral-600 border-neutral-500",
  sleep: "bg-neutral-400 text-white dark:bg-neutral-600 border-neutral-500",
  work: "bg-space-600 text-white shadow-space border-space-700",
  eva: "bg-orange-500 text-white shadow-orange border-orange-600",
  optional: "bg-neutral-200 text-neutral-800 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
};

export const TimelineView = () => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  return (
    <>
      <Card className="overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <div className="min-w-[900px] lg:min-w-0">
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="w-32 md:w-40 shrink-0 px-6 py-6">
                <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                  Crew Member
                </p>
              </div>
              <div className="flex flex-1">
                {hours.map((hour) => (
                  <div key={hour} className="flex-1 border-l border-neutral-200 dark:border-neutral-800 px-4 py-6 text-center">
                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {hour.toString().padStart(2, "0")}:00
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      GMT
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {crewMembers.map((member, idx) => (
              <div
                key={member.id}
                className={cn(
                  "flex border-b border-neutral-200 dark:border-neutral-800 transition-colors hover:bg-neutral-25 dark:hover:bg-neutral-900/30",
                  idx % 2 === 0 ? "bg-white dark:bg-neutral-900" : "bg-neutral-25 dark:bg-neutral-900/20"
                )}
              >
                <div className="w-32 md:w-40 shrink-0 px-6 py-10 flex items-center">
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {member.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Flight Engineer
                    </p>
                  </div>
                </div>
                <div className="relative flex flex-1">
                  {hours.map((hour) => (
                    <div key={hour} className="flex-1 border-l border-neutral-200 dark:border-neutral-800" />
                  ))}
                  {member.activities.map((activity) => {
                    const { left, width } = calculateActivityPosition(activity.start, activity.duration);
                    return (
                      <button
                        key={activity.id}
                        onClick={() => setSelectedActivity(activity)}
                        className={cn(
                          "absolute top-6 bottom-6 rounded-xl px-4 py-3 transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer border-2 group",
                          activityColors[activity.type],
                        )}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                        }}
                      >
                        <div className="text-left">
                          <p className="text-xs font-bold leading-tight truncate group-hover:text-clip">
                            {activity.name}
                          </p>
                          {activity.mission && (
                            <p className="text-xs opacity-80 leading-tight truncate mt-1">
                              {activity.mission}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <ActivityModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </>
  );
};