/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { logout, setTokens } from '@/lib/features/auth/authSlice';

declare module 'axios' {
  interface AxiosRequestConfig {
    requireAuth?: boolean;
  }
}

let storeInstance: any = null;

export const injectStore = (s: any) => {
  storeInstance = s;
};

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://faflora-staging.onrender.com/api/v1').replace(/\/$/, '');

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const getToken = (key: 'accessToken' | 'refreshToken'): string | null =>
  (typeof window !== 'undefined' ? localStorage.getItem(key) : null) ||
  storeInstance?.getState()?.auth?.[key] ||
  null;

interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

let pendingRefresh: Promise<SessionTokens> | undefined;

export async function refreshSession(): Promise<SessionTokens> {
  if (pendingRefresh) return pendingRefresh;

  const refreshToken = getToken('refreshToken');
  if (!refreshToken) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  pendingRefresh = axios
    .post<{ data: SessionTokens }>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { timeout: axiosInstance.defaults.timeout }
    )
    .then(({ data }) => {
      if (!data?.data?.accessToken || !data.data.refreshToken) {
        throw new Error('The server did not return refreshed session tokens.');
      }
      if (getToken('refreshToken') !== refreshToken) {
        throw new Error('The session changed while refreshing.');
      }
      storeInstance?.dispatch(setTokens(data.data));
      return data.data;
    })
    .catch((error: unknown) => {
      if (getToken('refreshToken') === refreshToken) {
        storeInstance?.dispatch(logout());
      }
      throw error;
    })
    .finally(() => {
      pendingRefresh = undefined;
    });

  return pendingRefresh;
}

export async function getRefreshTokenForLogout(): Promise<string | null> {
  await pendingRefresh?.catch(() => undefined);
  return getToken('refreshToken');
}

axiosInstance.interceptors.request.use(async (config: any) => {
  if (config.skipAuth || config.headers?.skipAuth || config.headers?.noAuth) {
    if (config.headers?.skipAuth) delete config.headers.skipAuth;
    if (config.headers?.noAuth) delete config.headers.noAuth;
    return config;
  }

  let token = getToken('accessToken');
  if (!token && config.requireAuth) {
    token = (await refreshSession()).accessToken;
    config._retry = true;
  }

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const request = error.config;
    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'].includes(request.url)
    ) {
      throw error;
    }

    request._retry = true;
    if (!getToken('refreshToken')) {
      storeInstance?.dispatch(logout());
      throw error;
    }

    const { accessToken } = await refreshSession();
    request.headers.Authorization = `Bearer ${accessToken}`;

    return axiosInstance(request);
  }
);

export default axiosInstance;
