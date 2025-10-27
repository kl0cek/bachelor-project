import { useState } from 'react';
import { Link } from 'react-router';
import {
  Plus,
  Calendar,
  Users,
  Activity,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/index';
import { authenticateUser, ROLE_PERMISSIONS } from '../utils/auth';
import { missions } from '../mock/mission';
import { useAuth } from '../hooks/useAuth';
import type { MissionStatus } from '../types/types';

export const HomePage = () => {
  const { user } = useAuth();

  // --- Login form state ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- local handler for login ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      const loggedUser = authenticateUser(username.trim(), password);

      if (loggedUser) {
        // persist user for useAuth to pick up
        localStorage.setItem('currentUser', JSON.stringify(loggedUser));
        window.location.reload(); // reload so useAuth picks it up
      } else {
        setError('Invalid username or password');
      }

      setIsLoading(false);
    }, 800);
  };

  type Role = 'admin' | 'operator' | 'astronaut' | 'viewer';
  const getRoleBadgeColor = (role: Role) => {
    const colors: Record<Role, string> = {
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

  const activeMissions = missions.filter((m) => m.status === 'active');
  const otherMissions = missions.filter((m) => m.status !== 'active');

  // --- If not logged in: show inline login + info ---
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Demo Credentials:
              </p>
              <div className="space-y-2">
                {Object.entries(ROLE_PERMISSIONS).map(([role, info]) => (
                  <div key={role} className="flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-1 rounded font-medium ${getRoleBadgeColor(role as Role)}`}
                    >
                      {info.label}
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {role === 'admin'
                        ? 'admin/admin123'
                        : role === 'operator'
                        ? 'operator1/operator123'
                        : role === 'astronaut'
                        ? 'astronaut1/astronaut123'
                        : 'viewer1/viewer123'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!username.trim() || !password.trim() || isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </Card>

        {/* About Section */}
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
                  Create and manage analog space mission schedules with detailed crew activities.
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
                  Assign crew members, manage roles, and coordinate mission activities.
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
                  Monitor mission progress and crew activities in real-time.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Mission Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Overview of all missions and crew activities
          </p>
        </div>

        <Link to="/create-mission">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Mission
          </Button>
        </Link>
      </div>

      {activeMissions.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Active Missions
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeMissions.map((mission) => (
              <Card key={mission.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {mission.name}
                  </h3>
                  <Badge className={statusColors[mission.status]}>
                    {statusLabels[mission.status]}
                  </Badge>
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
                    <span>{mission.crewMembers.length} Crew Members</span>
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
          <p className="text-slate-600 dark:text-slate-400">No missions available.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherMissions.map((mission) => (
              <Card key={mission.id} className="p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {mission.name}
                  </h3>
                  <Badge className={statusColors[mission.status]}>
                    {statusLabels[mission.status]}
                  </Badge>
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
                    <span>{mission.crewMembers.length} Crew Members</span>
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
    </div>
  );
};


export default HomePage;
