import { Link } from 'react-router';
import { User, LogIn, Shield, LogOut } from 'lucide-react';
import { Button } from '../ui';
import { LoginModal } from './LoginModal';
import { getRoleBadgeColor } from '../../utils/auth';
import { useAuthHeader } from '../../hooks/useAuthHeader';

export const MainHeader = () => {
  const { user, isLoginModalOpen, setIsLoginModalOpen, isLoggingOut, handleLogin, handleLogout } =
    useAuthHeader();

  return (
    <>
      <header className="border-b bg-white dark:bg-slate-800 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-4 -ml-2">
              <div className="h-24 w-24 rounded-xl bg-space-100 dark:bg-space-900 flex items-center justify-center">
                <img src="/WTK_light.png" className="dark:hidden object-contain" />
                <img src="/WTK_dark.png" className="hidden dark:block object-contain" />
              </div>
              <h1 className="text-xl font-light text-slate-900 dark:text-slate-100 truncate">
                Mission Control Platform
              </h1>
            </Link>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <User className="h-4 w-4" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate max-w-[120px]">
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
                    <Link to="/admin/users">
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4" />
                        <span className="ml-2 hidden md:inline">Admin Panel</span>
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </span>
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsLoginModalOpen(true)}>
                  <LogIn className="h-4 w-4" />
                  <span className="ml-2 hidden xs:inline">Login</span>
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
