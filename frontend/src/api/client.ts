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

const isUserLoggedIn = (): boolean => {
  const currentUser = localStorage.getItem('currentUser');
  return !!currentUser;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const excludedEndpoints = ['/auth/logout', '/auth/refresh', '/auth/login', '/auth/me'];

    const isExcludedEndpoint = excludedEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing &&
      !isExcludedEndpoint &&
      isUserLoggedIn()
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post('/auth/refresh', {});
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (err) {
        isRefreshing = false;
        console.error('Refresh failed - token expired, redirecting to home');

        localStorage.removeItem('currentUser');

        window.location.href = '/';

        return Promise.reject(err);
      }
    }

    if (error.response?.status === 401 && !isUserLoggedIn()) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
