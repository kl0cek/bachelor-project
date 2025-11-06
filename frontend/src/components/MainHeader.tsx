import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Satellite, User, LogIn, Shield, LogOut } from 'lucide-react';
import { Button } from './ui/index';
import { LoginModal } from './LoginModal';
import { authService } from '../services/authService';
import type { User as UserType } from '../types/types';

export const MainHeader = () => {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await authService.initialize();
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    };

    initAuth();
  }, []);

  const handleLogin = (authenticatedUser: UserType) => {
    setUser(authenticatedUser);
    setIsLoginModalOpen(false);

    window.location.reload();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await authService.logout();
      setUser(null);

      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      navigate('/');
      window.location.reload();
    } finally {
      setIsLoggingOut(false);
    }
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

  return (
    <>
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
              <Link to="/" className="flex items-center sm:gap-4 min-w-0 -ml-2">
                <div className="h-24 w-24 sm:h-20 sm:w-20 rounded-xl bg-space-100 dark:bg-space-900 flex items-center justify-center">
                  <img
                    src="/WTK_light.png"
                    alt="Space Technology Centre AGH University"
                    className="h-full w-full block dark:hidden object-contain"
                  />
                  <img
                    src="/WTK_dark.png"
                    alt="Space Technology Centre AGH University"
                    className="h-full w-full hidden dark:block object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-light tracking-tight text-slate-900 dark:text-slate-100 truncate">
                    Mission Control Platform
                  </h1>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
              {user ? (
                <>
                  <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 max-w-20 sm:max-w-[120px] md:max-w-[150px] truncate">
                        {user.fullName}
                      </span>
                      <span
                        className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap ${getRoleBadgeColor(user.role)}`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {user.role === 'admin' && (
                    <Link to="/admin/users">
                      <Button variant="outline" size="sm" className="px-2 sm:px-3">
                        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden md:inline ml-2">Admin Panel</span>
                        <span className="md:hidden ml-1.5 text-xs">Admin</span>
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-2 sm:px-3"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-slate-400 border-t-transparent rounded-full" />
                        <span className="hidden sm:inline ml-2">Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline ml-2">Logout</span>
                        <span className="sm:hidden ml-1.5 text-xs">Out</span>
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-2 sm:px-3"
                >
                  <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 dark:text-white text-sky-950" />
                  <span className="hidden xs:inline ml-1.5 sm:ml-2">Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </>
  );
};
