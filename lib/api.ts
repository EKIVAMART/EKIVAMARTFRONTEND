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

interface AuthSessionRecord {
  id?: string;
  _id?: string;
  sessionId?: string;
  isCurrent?: boolean;
  isCurrentSession?: boolean;
  current?: boolean;
}

const getAuthRedirectUrl = (path: string) => {
  const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, '');

  return baseUrl ? `${baseUrl}${path}` : path;
};

const redirectToAuthProvider = (path: string) => {
  if (typeof window === 'undefined') {
    throw new Error('Social login is only available in the browser');
  }

  window.location.assign(getAuthRedirectUrl(path));
};

const getSessionIdentifier = (session?: AuthSessionRecord) =>
  session?.id || session?._id || session?.sessionId;

const isCurrentSession = (session?: AuthSessionRecord) =>
  Boolean(
    session?.isCurrent || session?.isCurrentSession || session?.current
  );

const findCurrentSessionId = (sessions: AuthSessionRecord[] = []) => {
  const currentSession = sessions.find(
    (session) => getSessionIdentifier(session) && isCurrentSession(session)
  );

  if (currentSession) {
    return getSessionIdentifier(currentSession);
  }

  return getSessionIdentifier(
    sessions.find((session) => getSessionIdentifier(session))
  );
};

const extractSessions = (payload: unknown): AuthSessionRecord[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as {
    data?: unknown;
    sessions?: unknown;
  };

  if (Array.isArray(record.data)) {
    return record.data as AuthSessionRecord[];
  }

  if (
    record.data &&
    typeof record.data === 'object' &&
    Array.isArray((record.data as { sessions?: unknown }).sessions)
  ) {
    return (record.data as { sessions: AuthSessionRecord[] }).sessions;
  }

  if (Array.isArray(record.sessions)) {
    return record.sessions as AuthSessionRecord[];
  }

  return [];
};

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
    phoneNumber: string;
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

  async logout(sessionId?: string) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/logout',
        { sessionId: sessionId ?? null }
      );
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

  async getCurrentSessionId() {
    try {
      const response = await axiosInstance.get<ApiResponse<AuthSessionRecord[]>>(
        '/auth/sessions'
      );
      return findCurrentSessionId(extractSessions(response.data));
    } catch (error) {
      handleApiError(error);
    }
  },

  async logoutCurrentSession() {
    try {
      const sessionsResponse =
        await axiosInstance.get<ApiResponse<AuthSessionRecord[]>>(
          '/auth/sessions'
        );
      const sessionId = findCurrentSessionId(
        extractSessions(sessionsResponse.data)
      );

      if (!sessionId) {
        throw {
          message: 'Could not determine the current session id for logout.',
          statusCode: 400,
        } as ApiError;
      }

      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/logout',
        { sessionId }
      );
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

  async googleLogin() {
    redirectToAuthProvider('/auth/google');
  },

  async facebookLogin() {
    redirectToAuthProvider('/auth/facebook');
  }
};

//Product API
export const productApi = {
  async getAllProducts(params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(
        `/products?page=${params.page || 1}&limit=${params.limit || 20}&sortBy=${params.sortBy || 'createdAt'}&sortOrder=${params.sortOrder || 'desc'}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getProductById(id: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getProductsByCategory(category: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/products/category/${category}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getProductsBySubCategory(subCategory: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/products/sub-category/${subCategory}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getProductsByBrand(brand: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/products/brand/${brand}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getProductsByPrice(price: number) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/products/price/${price}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getProductsByRating(rating: number) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/products/rating/${rating}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getProductsByPriceRange(minPrice: number, maxPrice: number) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/products/price-range/${minPrice}/${maxPrice}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async createProducts (body: any) {
    try {
       const response = await axiosInstance.post<ApiResponse<any>>(`/products`, body);
      return response.data;
      /**
       * Use this body as guide for the form
       * 
       * '{
          "name": "iPhone 15 Pro",
          "preview": "Summary of product to user",
          "description": "Latest Apple smartphone with titanium design",
          "sku": "IPHONE-15-PRO-25626" (optional),
          "price": 850000,
          "compareAtPrice": 200 (optional),
          "costPerItem": 1000 (optional),
          "currency": "NGN",
          "condition": ["new", "used", "refurbished"] (optional)
          "stock": 50,
          "categoryId": "8220892a-50af-4aaf-a020-de5cd33749e6",
          "metadata": {
            "storage": "256GB",
            "color": "Natural Titanium",
            "brand": "Apple"
          } (optional),
          "weight": 0.187 (optional),
          "dimensions": {
            "unit": "cm",
            "length": 14.67,
            "width": 7.09,
            "height": 0.83
          } (optional),
          "tags": ["iphone", "15", "pro", "phone]
        }'
       */
    } catch (error) {
      handleApiError(error);
    }
  }
};

export const categoryApi = {
  async getCategories(params: {
    page?: number; 
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/categories?page=${params.page || 1}&limit=${params.limit || 20}&sortBy=${params.sortBy || 'name'}&sortOrder=${params.sortOrder || 'asc'}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

}
