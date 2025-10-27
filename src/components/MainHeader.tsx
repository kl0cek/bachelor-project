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
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 max-w-[120px] truncate">
                        {user.fullName}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${getRoleBadgeColor(user.role)}`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {user.role === 'admin' && (
                    <Link to="/admin/users" className="hidden sm:block">
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Admin Panel</span>
                      </Button>
                    </Link>
                  )}

                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden">Out</span>
                  </Button>
                </div>
              ) : (
                <Button variant="default" size="sm" onClick={() => setIsLoginModalOpen(true)}>
                  <LogIn className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Login</span>
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
