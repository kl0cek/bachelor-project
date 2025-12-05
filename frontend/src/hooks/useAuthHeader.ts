import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types/types';
import { useNavigate } from 'react-router';

export const useAuthHeader = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const init = async () => {
      await authService.initialize();
      setUser(authService.getCurrentUser());
    };
    init();
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setIsLoginModalOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      setUser(null);
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    user,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isLoggingOut,
    handleLogin,
    handleLogout,
  };
};
