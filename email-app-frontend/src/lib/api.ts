import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

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

interface ApiError {
    error: string;
    details?: string;
}

interface ApiResponse<T> {
    data: T;
    error?: ApiError;
}

interface RefreshTokenResponse {
    accessToken: string;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add request interceptor for auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'] || 60;
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return api(originalRequest);
        }

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post<RefreshTokenResponse>('/api/auth/refresh-token');
                const { accessToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
                processQueue(null, accessToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as Error, null);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
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
