import axios from 'axios';

/**
 * Central Axios instance.
 * ‑ baseURL comes from NEXT_PUBLIC_API_URL (falls back to http://localhost:5000)
 * ‑ withCredentials = false (tokens travel via Authorization header)
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return api(originalRequest);
    }

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    console.error('API Error:', {
      status: error.response?.status,
      message: errorMessage,
      endpoint: originalRequest.url,
    });

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

// Retry logic for failed requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const withRetry = async (fn: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error.status !== 401 && error.status !== 403) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
};

// Enhanced API methods with retry logic
export const enhancedApi = {
  get: (url: string, config = {}) => withRetry(() => api.get(url, config)),
  post: (url: string, data = {}, config = {}) => withRetry(() => api.post(url, data, config)),
  put: (url: string, data = {}, config = {}) => withRetry(() => api.put(url, data, config)),
  delete: (url: string, config = {}) => withRetry(() => api.delete(url, config)),
};

export default enhancedApi;
