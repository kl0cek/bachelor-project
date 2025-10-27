import { Link } from 'react-router';
import {
  Plus,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Activity,
  Shield,
  Eye,
  Lock,
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/index';
import { cn } from '../utils/utils';
import { missions } from '../mock/mission';
import { useAuth } from '../hooks/useAuth';
import type { MissionStatus } from '../types/types';

export const HomePage = () => {
  const { user, hasPermission, hasRole } = useAuth();

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

  const activeMissions = missions.filter((m) => m.status === 'active');
  const otherMissions = missions.filter((m) => m.status !== 'active');

  // If not logged in, show login prompt
  if (!user) {
    return (
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-space-100 dark:bg-space-900 mb-6">
              <Lock className="h-10 w-10 text-space-600 dark:text-space-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Welcome to Mission Control Platform
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Please login to access mission controls, schedules, and crew management
            </p>
          </div>

          <Card className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              About the Platform
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 mt-1">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Mission Scheduling
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Create and manage analog space mission schedules with detailed crew activities
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900 mt-1">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Crew Management
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Assign crew members, manage roles, and coordinate mission activities
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900 mt-1">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Real-time Tracking
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Monitor mission progress and crew activities in real-time
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Click the <strong>Login</strong> button in the header to get started
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Mission Control Home
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2">
              Welcome back, <span className="font-semibold text-slate-900 dark:text-slate-100">{user.fullName}</span>!{' '}
              <span className="text-xs sm:text-sm font-medium inline-block">
                ({user.role.charAt(0).toUpperCase() + user.role.slice(1)})
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {hasPermission('create_mission') && (
              <Link to="/create-mission" className="flex-1 sm:flex-initial">
                <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Create New Mission</span>
                  <span className="xs:hidden">New Mission</span>
                </Button>
              </Link>
            )}

            {hasRole('admin') && (
              <Link to="/admin/users" className="flex-1 sm:flex-initial">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Manage Users</span>
                  <span className="xs:hidden">Users</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-lg bg-green-100 dark:bg-green-900 shrink-0">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {activeMissions.length}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">Active Missions</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-lg bg-blue-100 dark:bg-blue-900 shrink-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {missions.filter((m) => m.status === 'planning').length}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">In Planning</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {missions.filter((m) => m.status === 'completed').length}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">Completed</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-lg bg-space-100 dark:bg-space-900 shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-space-600 dark:text-space-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {missions.length}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">Total Missions</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-linear-to-r from-space-50 to-blue-50 dark:from-space-950 dark:to-blue-950 border-space-200 dark:border-space-800">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Your Access Level
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
              {user.role === 'admin' &&
                'You have full administrative access to all system features.'}
              {user.role === 'operator' &&
                'You can create and manage missions, crews, and schedules.'}
              {user.role === 'astronaut' &&
                'You can view missions and manage your personal activities.'}
              {user.role === 'viewer' &&
                'You have read-only access to view missions and schedules.'}
            </p>

            <div className="flex flex-wrap gap-2">
              {user.role === 'admin' ? (
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  All Permissions
                </Badge>
              ) : (
                <>
                  {hasPermission('view_schedule') && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      View Schedules
                    </Badge>
                  )}
                  {hasPermission('create_mission') && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Create Missions
                    </Badge>
                  )}
                  {hasPermission('manage_crew') && (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      Manage Crew
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {activeMissions.length > 0 && hasPermission('view_schedule') && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
            Active Missions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {activeMissions.map((mission) => (
              <Card key={mission.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1 sm:mb-2 truncate">
                      {mission.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {mission.description}
                    </p>
                  </div>
                  <Badge className={cn('ml-2 shrink-0 text-xs', statusColors[mission.status])}>
                    {statusLabels[mission.status]}
                  </Badge>
                </div>

                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">
                      {formatDate(mission.startDate)} - {formatDate(mission.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span>{getDuration(mission.startDate, mission.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span>{mission.crewMembers.length} crew members</span>
                  </div>
                </div>

                <Link to={`/mission/${mission.id}/scheduler`}>
                  <Button variant="outline" className="w-full text-sm">
                    {hasPermission('edit_mission') ? 'Manage Mission' : 'View Mission'}
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {hasPermission('view_mission') && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
            All Missions
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {otherMissions.map((mission) => (
              <Card key={mission.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {mission.name}
                      </h3>
                      <Badge className={cn(statusColors[mission.status], 'text-xs shrink-0')}>
                        {statusLabels[mission.status]}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 sm:mb-3 line-clamp-2">
                      {mission.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span className="truncate">
                          {formatDate(mission.startDate)} - {formatDate(mission.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span>{mission.crewMembers.length} crew</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/mission/${mission.id}/scheduler`} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto text-sm">
                      View Details
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!hasPermission('view_mission') && (
        <Card className="p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-3 sm:mb-4">
            <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Limited Access
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Your current role has limited access. Contact an administrator for more permissions.
          </p>
        </Card>
      )}
    </div>
  );
};

export default HomePage;
