/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from './axios';

export interface ApiError {
  message: string;
  statusCode?: number;
  retryAfter?: number;
  errors?: Record<string, string[]> | Array<{ field: string; message: string }>;
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

// ─── Image Upload Types ───────────────────────────────────────────────────────

export interface UploadRequest {
  fileName: string;
  mimeType: 'image/jpeg' | 'image/jpg' | 'image/png' | 'image/gif' | 'image/webp';
  folder: 'products' | 'categories';
  expiresIn?: number;
  isPublic?: boolean;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  url: string;
  method: 'PUT' | 'POST';
  expiresIn: number;
  expiresAt: string;
  headers?: Record<string, string>;
  fields?: Record<string, string>;
}

/**
 * Request signed upload URLs from the backend.
 * Returns one UploadUrlResponse per requested file.
 */
export async function requestUploadUrls(
  files: UploadRequest[]
): Promise<UploadUrlResponse[]> {
  try {
    const response = await axiosInstance.post<ApiResponse<UploadUrlResponse[]>>(
      '/products/upload-url',
      files
    );
    const data = response.data?.data;
    if (!Array.isArray(data)) {
      throw { message: 'Unexpected response from upload URL endpoint', statusCode: 500 } as ApiError;
    }
    return data;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Upload a single file directly to the storage provider (S3 or Cloudinary)
 * based on the method returned in the UploadUrlResponse.
 */
export async function uploadFileToStorage(
  item: UploadUrlResponse,
  file: File
): Promise<void> {
  if (item.method === 'PUT') {
    // S3-style: PUT with raw body
    await fetch(item.uploadUrl, {
      method: 'PUT',
      headers: item.headers ?? { 'Content-Type': file.type },
      body: file,
    });
  } else {
    // Cloudinary-style: POST with multipart FormData
    const formData = new FormData();
    for (const [key, value] of Object.entries(item.fields ?? {})) {
      formData.append(key, String(value));
    }
    formData.append('file', file);
    await fetch(item.uploadUrl, {
      method: 'POST',
      body: formData,
    });
  }
}

/**
 * Convenience helper — takes an array of { file, altText } pairs,
 * requests upload URLs, uploads to storage, and returns the image
 * objects ready to send to product/category create or update endpoints.
 */
export async function uploadImages(
  images: { file: File; altText: string }[],
  folder: 'products' | 'categories'
): Promise<{ url: string; altText: string; isPrimary: boolean; order: number }[]> {
  if (!images.length) return [];

  const requests: UploadRequest[] = images.map(({ file }) => ({
    fileName: file.name,
    mimeType: file.type as UploadRequest['mimeType'],
    folder,
    expiresIn: 3600,
    isPublic: true,
  }));

  const uploadItems = await requestUploadUrls(requests);

  await Promise.all(
    uploadItems.map((item, idx) => uploadFileToStorage(item, images[idx].file))
  );

  return uploadItems.map((item, idx) => ({
    url: item.url,
    altText: images[idx].altText,
    isPrimary: idx === 0,
    order: idx,
  }));
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

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
function handleApiError(error: unknown): never {
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

// ─── Product API ──────────────────────────────────────────────────────────────

export type ProductStatus =
  | 'draft'
  | 'active'
  | 'published'
  | 'inactive'
  | 'out_of_stock'
  | 'discontinued';
export type ReturnShipping = 'store' | 'vendor' | 'customer';
export type WarrantyPeriod =
  | 'none'
  | '3 months'
  | '6 months'
  | '1 year'
  | '2 years';
export type ProductCondition = 'new' | 'refurbished' | 'used';
export type ReturnWindow = 3 | 7 | 14 | 30;

export interface ProductSearchParams {
  categoryId?: string;
  vendorId?: string;
  status?: ProductStatus;
  condition?: ProductCondition;
  brand?: string;
  color?: string;
  size?: string;
  returnWindow?: ReturnWindow;
  returnShipping?: ReturnShipping;
  warrantyPeriod?: WarrantyPeriod;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  maxDiscount?: number;
  inStock?: boolean;
  tags?: string | string[];
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortBy?:
    | 'id'
    | 'name'
    | 'description'
    | 'sku'
    | 'price'
    | 'priceAmount'
    | 'stock'
    | 'stockQuantity'
    | 'status'
    | 'condition'
    | 'brand'
    | 'discount'
    | 'returnWindow'
    | 'returnShipping'
    | 'warrantyPeriod'
    | 'createdAt'
    | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Matches the new CreateProductDto from the backend.
 * Extra fields (weight, dimensions, color, size, condition) must go under metadata.
 */
export interface CreateProductDto {
  vendorId: string;
  categoryId: string;
  name: string;
  preview: string;
  description: string;
  origin: string;
  brand?: string;
  returnWindow?: ReturnWindow;
  returnShipping?: ReturnShipping;
  warrantyPeriod?: WarrantyPeriod;
  images?: Array<{
    url: string;
    altText: string;
    isPrimary: boolean;
    order: number;
  }>;
  sku?: string;
  discount?: number;
  currency?: string;
  compareAtPrice: number;
  costPerItem?: number;
  stock: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export type UpdateProductDto = Partial<CreateProductDto>;

const toQueryParams = (params: ProductSearchParams = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    queryParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
  });

  return queryParams;
};

export const productApi = {
  async getAllProducts(params: ProductSearchParams = {}) {
    try {
      const queryParams = toQueryParams({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...params,
      });
      const response = await axiosInstance.get<ApiResponse<any>>(
        `/products?${queryParams.toString()}`
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

  async createProduct(body: CreateProductDto) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(`/products`, body);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async updateProduct(id: string, body: UpdateProductDto) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>(
        `/products/${id}`,
        body
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async deleteProductImage(id: string, imageUrl: string) {
    try {
      const response = await axiosInstance.delete<ApiResponse<any>>(
        `/products/${id}/images`,
        { data: { imageUrl } } as any
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async publishProduct(id: string) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        `/products/${id}/publish`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async deleteProduct(id: string) {
    try {
      await axiosInstance.delete(`/products/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
};

// ─── Category API ─────────────────────────────────────────────────────────────

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
  displayOrder?: number;
  /** Public URL from the storage provider — obtained via requestUploadUrls + uploadFileToStorage */
  imageUrl?: string;
}

export const categoryApi = {
  async getCategories(params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: String(params.page || 1),
        limit: String(params.limit || 100),
        sortBy: params.sortBy || 'name',
        sortOrder: params.sortOrder || 'asc',
      });
      const response = await axiosInstance.get<ApiResponse<any>>(
        `/categories?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getCategoryById(id: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/categories/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Create a new category.
   * imageUrl should be the public URL returned from storage upload.
   */
  async createCategory(data: CreateCategoryDto) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>('/categories', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update a category (draft or published).
   * Pass image.url + image.altText when updating the category image.
   */
  async updateCategory(id: string, data: {
    name?: string;
    description?: string;
    image?: { url: string; altText: string };
  }) {
    try {
      // PATCH /categories — id goes in the body, not the URL path
      const response = await axiosInstance.patch<ApiResponse<any>>('/categories', { id, ...data });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async deleteCategory(id: string) {
    try {
      await axiosInstance.delete(`/categories/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },

  async publishCategory(id: string) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(`/categories/${id}/publish`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async deleteCategoryImage(id: string, imageUrl: string) {
    try {
      const response = await axiosInstance.delete<ApiResponse<any>>(
        `/categories/${id}/images`,
        { data: { imageUrl } } as any
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getSubcategories(id: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/categories/${id}/children`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
}
