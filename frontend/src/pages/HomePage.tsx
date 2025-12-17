import { useState } from 'react';
import { Link } from 'react-router';
import {
  Plus,
  Calendar,
  Users,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Clock,
  User as UserIcon,
  Loader2,
  Edit,
  UsersIcon,
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/index';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useMissions } from '../hooks/useMissions';
import type { MissionStatus, UserRole } from '../types/types';

export const HomePage = () => {
  const { user } = useAuth();
  const { missions: allMissions, loading: missionsLoading } = useMissions();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      await authService.login({ username: username.trim(), password });
      window.location.reload();
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        setError(response?.data?.message || 'Invalid username or password');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      operator: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      astronaut: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[role];
  };

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

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Welcome to Mission Control Platform
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Login to access mission controls, schedules, and crew management.
          </p>
        </div>

        <Card className="p-8 mb-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-space-600 dark:text-space-400" />
            Mission Control Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500"
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const activeMissions = allMissions.filter((m) => m.status === 'active');
  const otherMissions = allMissions.filter((m) => m.status !== 'active');

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Mission Control
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back, {user.fullName}
            <Badge className={`ml-3 ${getRoleBadgeColor(user.role)}`}>{user.role}</Badge>
          </p>
        </div>

        {authService.hasPermission('create_mission') && (
          <Link to="/create-mission">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Mission
            </Button>
          </Link>
        )}
      </div>

      {missionsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-space-600" />
        </div>
      ) : (
        <>
          {activeMissions.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Active Missions
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeMissions.map((mission) => (
                  <Card
                    key={mission.id}
                    className="p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Link to={`/mission/${mission.id}/scheduler`}>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {mission.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[mission.status]}>
                          {statusLabels[mission.status]}
                        </Badge>
                        {authService.hasPermission('edit_mission') && (
                          <>
                            <Link to={`/mission/${mission.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Edit mission"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to={`/mission/${mission.id}/crew`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Manage crew"
                              >
                                <UsersIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {mission.description}
                    </p>

                    <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(mission.startDate)} → {formatDate(mission.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{getDuration(mission.startDate, mission.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{mission.crewMembers?.length || 0} Crew Members</span>
                      </div>
                    </div>

                    <Link
                      to={`/mission/${mission.id}/scheduler`}
                      className="flex items-center text-space-600 dark:text-space-400 hover:underline"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Other Missions
            </h2>
            {otherMissions.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400">No other missions available.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {otherMissions.map((mission) => (
                  <Card
                    key={mission.id}
                    className="p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Link to={`/mission/${mission.id}/scheduler`}>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {mission.name}
                        </h3>
                      </Link>
                      <Badge className={statusColors[mission.status]}>
                        {statusLabels[mission.status]}
                      </Badge>
                      {authService.hasPermission('edit_mission') && (
                        <>
                          <Link to={`/mission/${mission.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Edit mission"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/mission/${mission.id}/crew`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Manage crew"
                            >
                              <UsersIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {mission.description}
                    </p>

                    <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(mission.startDate)} → {formatDate(mission.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{getDuration(mission.startDate, mission.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{mission.crewMembers?.length || 0} Crew Members</span>
                      </div>
                    </div>

                    <Link
                      to={`/mission/${mission.id}/scheduler`}
                      className="flex items-center text-space-600 dark:text-space-400 hover:underline"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
