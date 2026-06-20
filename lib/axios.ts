/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

import { setCredentials, logout, setTokens } from '@/lib/features/auth/authSlice';

let storeInstance: any = null;

export const injectStore = (s: any) => {
  storeInstance = s;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  //'http://localhost:5000/api/v1'
  'https://fafloriesbackend-5.onrender.com/api/v1';

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config: any) => {
    try {
      // Primary: read from localStorage — shared across all store instances
      let token: string | null = null;

      if (typeof window !== 'undefined') {
        token = localStorage.getItem('accessToken');
      }

      // Fallback: read from the module-level store singleton
      if (!token && storeInstance) {
        const state = storeInstance.getState();
        token = state?.auth?.accessToken ?? null;
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // If store isn't ready, try localStorage directly
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }

    // For FormData requests, remove Content-Type so browser sets it with boundary
    if (
      typeof FormData !== 'undefined' &&
      config.data instanceof FormData &&
      config.headers
    ) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config as any;

    // If error is 401 and we haven't retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      error.response
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const state = storeInstance?.getState();
      const refreshToken =
        state?.auth?.refreshToken ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('refreshToken')
          : null);

      if (!refreshToken) {
        if (storeInstance) {
          storeInstance.dispatch(logout());
        }
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const tokenData = response.data as {
          data: { accessToken: string; refreshToken: string };
        };
        const { accessToken, refreshToken: newRefreshToken } = tokenData.data;

        // Update tokens in store
        if (storeInstance) {
          storeInstance.dispatch(
            setTokens({
              accessToken,
              refreshToken: newRefreshToken,
            })
          );
        }

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);

        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (storeInstance) {
          storeInstance.dispatch(logout());
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
