import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Satellite, User, LogIn, Menu, Home, Shield } from 'lucide-react';
import { Button } from './ui/index';
import { LoginModal } from './LoginModal';
import type { User as UserType } from '../types/auth';

export const MainHeader = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLogin = (authenticatedUser: UserType) => {
    setUser(authenticatedUser);
    localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
    setIsLoginModalOpen(false);

    window.location.reload();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');

    window.location.reload();
  };

  const isHomePage = location.pathname === '/';

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
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                <Menu className="h-5 w-5" />
              </Button>

              <Link to="/" className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="p-2 sm:p-3 rounded-xl bg-space-100 dark:bg-space-900 shrink-0">
                  <Satellite className="h-5 w-5 sm:h-6 sm:w-6 text-space-600 dark:text-space-400" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                    Mission Control Platform
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate hidden sm:block">
                    Analog Mission Communication System
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {!isHomePage && (
                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className="hidden md:flex"
                  size="sm"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              )}

              {user ? (
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
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

                  <Button variant="outline" size="sm" onClick={handleLogout} className="px-2 sm:px-3">
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden text-xs">Out</span>
                  </Button>
                </div>
              ) : (
                <Button variant="default" size="sm" onClick={() => setIsLoginModalOpen(true)} className="px-2 sm:px-3">
                  <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
