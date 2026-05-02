/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

import { store } from '@/lib/store';
import { setCredentials, logout } from '@/lib/features/auth/authSlice';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
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
    const state = store.getState();
    const token =
      state.auth.accessToken ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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

      const state = store.getState();
      const refreshToken =
        state.auth.refreshToken ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('refreshToken')
          : null);

      if (!refreshToken) {
        store.dispatch(logout());
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
        store.dispatch(
          setCredentials({
            user: state.auth.user!,
            accessToken,
            refreshToken: newRefreshToken,
          })
        );

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);

        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
