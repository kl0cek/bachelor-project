import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { authService, type LoginCredentials } from '../services/authService';
import type { User, AuthState, UserRole } from '../types/types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  updateUser: (updates: Partial<User>) => void;
}

type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: true,
      };

    case 'AUTH_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'AUTH_LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case 'AUTH_ERROR':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'AUTH_LOADING' });

      try {
        await authService.initialize();
        const currentUser = authService.getCurrentUser();

        if (currentUser) {
          dispatch({ type: 'AUTH_SUCCESS', payload: currentUser });
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        dispatch({ type: 'AUTH_ERROR', payload: 'Failed to initialize authentication' });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'AUTH_LOADING' });

    try {
      const user = await authService.login(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    return authService.hasRole(role);
  };

  const updateUser = (updates: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    hasPermission,
    hasRole,
    updateUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const usePermissions = () => {
  const { hasPermission, hasRole, user } = useAuth();

  return {
    hasPermission,
    hasRole,
    canCreateMission: hasPermission('create_mission'),
    canEditMission: hasPermission('edit_mission'),
    canManageCrew: hasPermission('manage_crew'),
    canViewSchedule: hasPermission('view_schedule'),
    canManageActivities: hasPermission('manage_activities'),
    isAdmin: hasRole('admin'),
    isOperator: hasRole('operator'),
    isAstronaut: hasRole('astronaut'),
    isViewer: hasRole('viewer'),
    userRole: user?.role,
  };
};

export const AuthGuard: React.FC<{
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}> = ({ children, requiredPermission, requiredRole, fallback }) => {
  const { user, isLoading, hasPermission, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-space-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      fallback || (
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Authentication Required
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Please login to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      fallback || (
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Access Denied
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You don't have the required role to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      fallback || (
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Access Denied
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You don't have the required permission to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};
