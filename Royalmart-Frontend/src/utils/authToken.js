// Fallback auth for browsers that block third-party (cross-site) cookies.
// The backend also returns the JWT on login/register; we keep it here and send
// it as a Bearer header alongside the httpOnly cookie.
const KEY = 'royalmart_token';

export const getToken = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};
export const setToken = (t) => {
  try { localStorage.setItem(KEY, t); } catch { /* ignore */ }
};
export const clearToken = () => {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
};

export function attachTokenInterceptors(instance) {
  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  instance.interceptors.response.use(
    (response) => {
      const url = response.config?.url || '';
      if (response.data?.token && (url.includes('/auth/login') || url.includes('/auth/register'))) {
        setToken(response.data.token);
      }
      if (url.includes('/auth/logout')) clearToken();
      return response;
    },
    (error) => {
      const url = error.config?.url || '';
      if (error.response?.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
        clearToken();
      }
      return Promise.reject(error);
    }
  );
}
