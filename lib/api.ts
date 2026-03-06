/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from './axios';

export interface ApiError {
  message: string;
  statusCode?: number;
  retryAfter?: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Handle API errors
const handleApiError = (error: unknown): never => {
  // Check if this is an axios error by checking for response property
  if (error && typeof error === 'object' && 'response' in error) {
    const axiError = error as any;
    const apiError: ApiError = {
      message:
        axiError.response?.data?.message ||
        axiError.message ||
        'An error occurred',
      statusCode: axiError.response?.status,
    };

    // Handle rate limiting
    if (axiError.response?.status === 429) {
      const retryAfter = axiError.response.headers['retry-after'];
      apiError.retryAfter = retryAfter ? parseInt(retryAfter as string) : 900;
    }

    // Handle validation errors
    if (axiError.response?.data?.errors) {
      apiError.errors = axiError.response?.data?.errors;
    }

    throw apiError;
  }

  throw {
    message: 'An unexpected error occurred',
    statusCode: 500,
  } as ApiError;
};

// Auth API
export const authApi = {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/register',
        data
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async login(data: { email: string; password: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/login',
        data
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async logout() {
    try {
      const response =
        await axiosInstance.post<ApiResponse<any>>('/auth/logout');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getProfile() {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>('/auth/me');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async updateProfile(data: { firstName?: string; lastName?: string }) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>(
        '/auth/me',
        data
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/change-password',
        data
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getSessions() {
    try {
      const response =
        await axiosInstance.get<ApiResponse<any>>('/auth/sessions');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async logoutAllSessions() {
    try {
      const response =
        await axiosInstance.delete<ApiResponse<any>>('/auth/sessions');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async verifyEmail(token: string) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/verify-email',
        {
          token,
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async resendVerificationEmail(email: string) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/resend-verification',
        { email }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async forgotPassword(email: string) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/forgot-password',
        {
          email,
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // OTP Verification Endpoints
  async verifyEmailOTP(data: { email: string; otp: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/verify-email-otp',
        data
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async resetPassword(data: { token: string; newPassword: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/reset-password',
        data
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async resendEmailOTP(email: string) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/resend-email-otp',
        { email }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};
