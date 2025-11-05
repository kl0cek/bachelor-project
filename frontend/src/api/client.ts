import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;

// Helper function to check if user is logged in
const isUserLoggedIn = (): boolean => {
  const currentUser = localStorage.getItem('currentUser');
  return !!currentUser;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // List of endpoints that should NOT trigger token refresh
    const excludedEndpoints = [
      '/auth/logout',
      '/auth/refresh',
      '/auth/login',
      '/auth/me', // Add this to prevent initialization loops
    ];

    // Check if the request URL matches any excluded endpoint
    const isExcludedEndpoint = excludedEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing &&
      !isExcludedEndpoint &&
      isUserLoggedIn() // Only try to refresh if user was logged in
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post('/auth/refresh', {});
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (err) {
        isRefreshing = false;
        console.error('Refresh failed', err);
        
        // Clear auth and redirect to login
        localStorage.removeItem('currentUser');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(err);
      }
    }

    // For 401 errors on excluded endpoints or when not logged in, just reject
    if (error.response?.status === 401 && !isUserLoggedIn()) {
      // Silently fail - user is not logged in, no need to redirect
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
