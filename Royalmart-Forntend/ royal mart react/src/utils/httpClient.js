import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Storefront axios instance. JWT travels in an httpOnly cookie so we just
 * need to opt in with `withCredentials`. The response interceptor catches
 * expired sessions (401) on protected endpoints and notifies any subscriber
 * (e.g. StoreContext) so it can clear local user state and redirect.
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

const unauthorizedListeners = new Set();

export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    // Don't fire the 401 handler for the login/register endpoint itself —
    // wrong password should just bubble up as a normal error.
    const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isAuthAttempt) {
      for (const listener of unauthorizedListeners) {
        try {
          listener();
        } catch {
          /* ignore listener errors */
        }
      }
    }
    return Promise.reject(error);
  }
);

export function getApiError(error, fallback = 'Something went wrong') {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}
