import { Link } from 'react-router';
import { Plus, Calendar, Users, Clock, ArrowRight, Activity } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/utils';
import { missions } from '../mock/mission';
import type { MissionStatus } from '../types/types';

export const HomePage = () => {
  const statusColors: Record<MissionStatus, string> = {
    planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    completed: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const statusLabels: Record<MissionStatus, string> = {
    planning: 'Planning',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const activeMissions = missions.filter(m => m.status === 'active');
  const otherMissions = missions.filter(m => m.status !== 'active');

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Mission Control Home
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage and monitor analog space missions
            </p>
          </div>
          <Link to="/create-mission">
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="h-5 w-5 mr-2" />
              Create New Mission
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {activeMissions.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Missions</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {missions.filter(m => m.status === 'planning').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">In Planning</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Users className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {missions.filter(m => m.status === 'completed').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-space-100 dark:bg-space-900">
              <Clock className="h-6 w-6 text-space-600 dark:text-space-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {missions.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Missions</p>
            </div>
          </div>
        </Card>
      </div>

      {activeMissions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Active Missions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeMissions.map((mission) => (
              <Card key={mission.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {mission.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {mission.description}
                    </p>
                  </div>
                  <Badge className={cn('ml-4', statusColors[mission.status])}>
                    {statusLabels[mission.status]}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(mission.startDate)} - {formatDate(mission.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>{getDuration(mission.startDate, mission.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>{mission.crewMembers.length} crew members</span>
                  </div>
                </div>

                <Link to={`/mission/${mission.id}/scheduler`}>
                  <Button variant="outline" className="w-full">
                    Open Mission Scheduler
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          All Missions
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {otherMissions.map((mission) => (
            <Card key={mission.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {mission.name}
                    </h3>
                    <Badge className={cn(statusColors[mission.status])}>
                      {statusLabels[mission.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {mission.description}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(mission.startDate)} - {formatDate(mission.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{mission.crewMembers.length} crew</span>
                    </div>
                  </div>
                </div>
                <Link to={`/mission/${mission.id}/scheduler`}>
                  <Button variant="outline">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};