import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Satellite, User, LogIn, Menu, Home } from 'lucide-react';
import { Button } from './ui/index';
import { LoginModel } from './index';

export const MainHeader = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const location = useLocation();

  const handleLogin = (username: string, password: string) => {
    setUserName(username);
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
  };

  const isHomePage = location.pathname === '/';
  const isMissionPage = location.pathname.includes('/mission/');

  return (
    <>
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>

              <Link to="/" className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-space-100 dark:bg-space-900">
                  <Satellite className="h-6 w-6 text-space-600 dark:text-space-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Mission Control Platform
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Analog Mission Communication System
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {!isHomePage && (
                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className="hidden md:flex"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              )}

              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {userName}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <Button variant="default" size="sm" onClick={() => setIsLoginModalOpen(true)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginModel
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </>
  );
};
