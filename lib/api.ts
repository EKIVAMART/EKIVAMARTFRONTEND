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
  async verifyEmailOTP(data: { email: string; otpCode: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/verify-email-otp',
        { email: data.email, otpCode: data.otpCode }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async resetPassword(data: { otpCode: string; newPassword: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/reset-password',
        { otpCode: data.otpCode, newPassword: data.newPassword }
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

  async inviteOrPromoteAdmin(data: {
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
  }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/admin/invitations',
        data
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async completeAdminInvitation(data: {
    token: string;
    password: string;
  }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/auth/admin/invitations/complete',
        data
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async searchUsers(params: {
    searchQuery?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role?: 'customer' | 'vendor' | 'admin' | 'super-admin';
    isActive?: boolean | string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.set(key, String(value));
        }
      });
      const response = await axiosInstance.get<ApiResponse<any>>(
        `/auth/users?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getUserById(id: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/auth/users/${id}`);
      return response.data;
    } catch (error) {
      try {
        const searchRes = await axiosInstance.get<ApiResponse<any>>(`/auth/users?searchQuery=${id}`);
        return searchRes.data;
      } catch {
        return null;
      }
    }
  },

  async deleteUser(id: string) {
    try {
      const response = await axiosInstance.delete<ApiResponse<any>>(`/auth/users/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async blockUser(id: string) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>(`/auth/users/${id}/block`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async unblockUser(id: string) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>(`/auth/users/${id}/unblock`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
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
  /** Store profile ID used to filter product searches. */
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
  town?: string;      // Filter by town/city
  state?: string;     // Filter by state
  lga?: string;       // Filter by LGA
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
  skipAuth?: boolean;
}

/**
 * Matches the new CreateProductDto from the backend.
 * Extra fields (weight, dimensions, color, size, condition) must go under metadata.
 */
export interface CreateProductDto {
  /** Store ID (vendorProfileId). For vendors, omit entirely — backend auto-resolves.
   * For admin/super-admin, pass the store ID from GET /products/stores. */
  vendorProfileId?: string;
  categoryId: string;
  name: string;
  preview: string;
  description: string;
  origin: string;
  location: {
    town: string;   // REQUIRED
    state: string;  // REQUIRED
    lga: string;    // REQUIRED (Local Government Area)
  };
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
    if (key === 'skipAuth') return;
    queryParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
  });

  return queryParams;
};

export interface StoreOption {
  id: string;
  storeName: string;
  storeSlug: string;
  storeLogoUrl: string | null;
  applicationStatus: string;
  isEkivaMartOfficialStore: boolean;
}

export const productApi = {
  async getAllProducts(params: ProductSearchParams = {}) {
    try {
      const { skipAuth, q, inStockOnly, ...rest } = params as any;
      const normalized: Record<string, any> = { ...rest };
      delete normalized.vendorProfileId;

      if (q && !normalized.searchQuery) normalized.searchQuery = q;
      if (inStockOnly !== undefined && normalized.inStock === undefined) {
        normalized.inStock = inStockOnly ? true : undefined;
      }

      const resolvedSortBy = normalized.sortBy ?? (normalized.searchQuery ? 'relevance' : 'createdAt');
      const resolvedSortOrder = normalized.sortOrder ?? (resolvedSortBy === 'price' || resolvedSortBy === 'priceAmount' ? 'asc' : 'desc');

      const queryParams = toQueryParams({
        page: 1,
        limit: 20,
        sortBy: resolvedSortBy,
        sortOrder: resolvedSortOrder,
        ...normalized,
      });
      const config: any = skipAuth ? { skipAuth: true } : {};
      const response = await axiosInstance.get<ApiResponse<any>>(
        `/products?${queryParams.toString()}`,
        config
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

  async getVendorProducts(params: {
    page?: number;
    limit?: number;
    searchQuery?: string;
    categoryId?: string;
    status?: string;
    /** Store profile ID. */
    vendorId?: string;
  } = {}) {
    try {
      const { q, inStockOnly, ...rest } = params as any;
      const normalized: Record<string, any> = { ...rest };
      delete normalized.vendorProfileId;

      if (q && !normalized.searchQuery) normalized.searchQuery = q;
      if (inStockOnly !== undefined && normalized.inStock === undefined) {
        normalized.inStock = inStockOnly ? true : undefined;
      }

      const finalParams = {
        page: 1,
        limit: 20,
        sortBy: normalized.searchQuery ? 'relevance' : 'createdAt',
        sortOrder: normalized.sortBy === 'price' || normalized.sortBy === 'priceAmount' ? 'asc' : 'desc',
        ...normalized,
      };

      const queryParams = new URLSearchParams();
      Object.entries(finalParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const normalizedValue = Array.isArray(value) ? value.join(',') : String(value);
          queryParams.set(key, normalizedValue);
        }
      });
      const response = await axiosInstance.get<ApiResponse<any>>(
        `/products?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getVendorProductFull(id: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(
        `/vendor/products/${id}/full`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getVendorProductStats(id: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(
        `/vendor/products/${id}/stats`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * GET /api/v1/products/stores
   * Returns all approved stores for the store-picker dropdown on admin product creation.
   * Admin / Super-Admin only — vendors get a 403.
   */
  async getStores(): Promise<StoreOption[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<StoreOption[]>>('/products/stores');
      const data = response.data?.data;
      if (!Array.isArray(data)) return [];
      return data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Uploads product images via the signed-URL flow, then PATCHes the product
   * with the resulting image metadata.  Accepts either a FormData (multipart)
   * or a typed array of { file, altText } objects.
   *
   * @param productId  The product to attach images to.
   * @param payload    FormData or { file: File; alt: string }[] from ImageUploadModal.
   */
  async uploadProductImages(
    productId: string,
    payload: FormData | { file: File; alt: string }[]
  ) {
    try {
      // Normalise to an array of { file, altText } so we can use uploadImages()
      const items: { file: File; altText: string }[] = Array.isArray(payload)
        ? payload.map((p) => ({ file: p.file, altText: p.alt || '' }))
        : Array.from((payload as FormData).getAll('images') as File[]).map(
          (file, idx) => ({
            file,
            altText:
              ((payload as FormData).get(`altText[${idx}]`) as string) || '',
          })
        );

      const imageObjects = await uploadImages(items, 'products');

      const response = await axiosInstance.patch<ApiResponse<any>>(
        `/products/${productId}`,
        { images: imageObjects }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Enhanced Product Search Engine
   * GET /api/v1/products/search
   */
  async search(params: {
    q?: string;
    searchQuery?: string;
    categoryId?: string;
    vendorId?: string;
    status?: string;
    brand?: string;
    origin?: string;
    minPrice?: number;
    maxPrice?: number;
    minDiscount?: number;
    maxDiscount?: number;
    inStock?: boolean;
    inStockOnly?: boolean;
    tags?: string | string[];
    returnWindow?: number;
    returnShipping?: string;
    warrantyPeriod?: string;
    sortBy?: 'relevance' | 'createdAt' | 'updatedAt' | 'price' | 'name' | 'brand' | 'discount' | 'stock' | 'status' | 'condition' | 'origin' | 'sku' | 'description' | 'returnWindow' | 'returnShipping' | 'warrantyPeriod' | 'id';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}) {
    try {
      const { q, inStockOnly, ...rest } = params;
      const normalized: Record<string, any> = { ...rest };
      delete normalized.vendorProfileId;

      if (q && !normalized.searchQuery) normalized.searchQuery = q;
      if (inStockOnly !== undefined && normalized.inStock === undefined) {
        normalized.inStock = inStockOnly ? true : undefined;
      }

      const resolvedSortBy = normalized.sortBy ?? (normalized.searchQuery ? 'relevance' : 'createdAt');
      const resolvedSortOrder = normalized.sortOrder ?? (resolvedSortBy === 'price' || resolvedSortBy === 'priceAmount' ? 'asc' : 'desc');

      const queryParams = new URLSearchParams();
      Object.entries({
        ...normalized,
        sortBy: resolvedSortBy,
        sortOrder: resolvedSortOrder,
        page: normalized.page ?? 1,
        limit: normalized.limit ?? 20,
      }).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.set(key, Array.isArray(val) ? val.join(',') : String(val));
        }
      });

      const response = await axiosInstance.get<ApiResponse<any>>(
        `/products?${queryParams.toString()}`
      );
      return response.data;
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
};

// ─── Waitlist API ─────────────────────────────────────────────────────────────

export interface WaitlistStats {
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
  todaySignups: number;
  weekSignups: number;
  customers: number;
  vendors: number;
}

export interface WaitlistSubscriber {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string | null;
  role: 'customer' | 'vendor' | null;
  interestTags: string[];
  status: 'active' | 'unsubscribed' | 'bounced';
  referralSource: string | null;
  createdAt: string;
}

export interface LaunchConfig {
  launchDate: string;
  title: string;
  subtitle: string;
  isLaunched: boolean;
  updatedAt: string;
}

export interface UpdateLaunchConfigDto {
  launchDate: string;
  title?: string;
  subtitle?: string;
  sendBroadcast?: boolean;
  broadcastReason?: string;
}

export interface BroadcastUploadCredentials {
  uploadUrl: string;
  upload_url?: string;
  signature: string;
  timestamp: number;
  apiKey?: string;
  api_key?: string;
  cloudName?: string;
  cloud_name?: string;
  folder: string;
}

export interface SendBroadcastDto {
  targetRole?: 'customer' | 'vendor';
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  previewText?: string;
  attachedImageUrls?: string[];
  heroBannerUrl?: string;
}

export const waitlistApi = {
  async getStats(): Promise<ApiResponse<WaitlistStats>> {
    try {
      const response = await axiosInstance.get<ApiResponse<WaitlistStats>>('/waitlist/stats');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getSubscribers(params: {
    status?: string;
    role?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<{ subscribers: WaitlistSubscriber[]; total: number }>> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.set(key, String(value));
        }
      });
      const response = await axiosInstance.get<ApiResponse<{ subscribers: WaitlistSubscriber[]; total: number }>>(
        `/waitlist/subscribers?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getLaunchConfig(): Promise<ApiResponse<LaunchConfig>> {
    try {
      const response = await axiosInstance.get<ApiResponse<LaunchConfig>>('/waitlist/launch-config');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async updateLaunchConfig(data: UpdateLaunchConfigDto): Promise<ApiResponse<LaunchConfig>> {
    try {
      const response = await axiosInstance.put<ApiResponse<LaunchConfig>>('/waitlist/launch-config', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getBroadcastUploadUrl(payload?: {
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
  }): Promise<ApiResponse<BroadcastUploadCredentials>> {
    try {
      const response = await axiosInstance.post<ApiResponse<BroadcastUploadCredentials>>(
        '/waitlist/broadcast/upload-url',
        payload ?? {}
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async sendBroadcast(data: SendBroadcastDto): Promise<ApiResponse<{ sent: number; targetRole: string }>> {
    try {
      const response = await axiosInstance.post<ApiResponse<{ sent: number; targetRole: string }>>('/waitlist/broadcast', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// ─── Wishlist API ─────────────────────────────────────────────────────────────

export interface WishlistCheckResponseDto {
  productId: string;
  isSaved: boolean;
}

export interface WishlistCountResponseDto {
  count: number;
}

export const wishlistApi = {
  async getWishlist() {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>('/wishlist');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getWishlistCount() {
    try {
      const response = await axiosInstance.get<ApiResponse<WishlistCountResponseDto>>('/wishlist/count');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async saveWishlistItem(productId: string) {
    try {
      const response = await axiosInstance.post<ApiResponse<WishlistCheckResponseDto>>('/wishlist/items', { productId });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async removeWishlistItem(productId: string) {
    try {
      const response = await axiosInstance.delete<ApiResponse<null>>(`/wishlist/items/${productId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async checkWishlistItem(productId: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<WishlistCheckResponseDto>>(`/wishlist/items/${productId}/check`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async clearWishlist() {
    try {
      const response = await axiosInstance.delete<ApiResponse<null>>('/wishlist');
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },
};

// ─── Cart API ─────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  quantity: number;
  isSelected: boolean;
  isSavedForLater: boolean;
  notes?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    currency?: string;
    stock: number;
    isAvailable: boolean;
    imageUrl?: string;
  };
}

export interface CartData {
  userId: string;
  activeItems: CartItem[];
  savedItems: CartItem[];
  activeCount: number;
  savedCount: number;
}

export interface CartCountResponse {
  activeCount: number;
  savedCount: number;
  totalCount: number;
}

export interface ExpectedDelivery {
  processingStartDate: string; // "2026-10-05" YYYY-MM-DD, day processing starts
  expectedDeliveryDate: string; // "2026-10-12" YYYY-MM-DD, latest delivery day
  maxWorkingDays: number; // 2 (local) or 5 (inter-state)
  isInterState: boolean; // true if any item ships from another state
  expectedDeliveryLabel: string; // "Mon, 12 Oct 2026" ready to display
}

export interface DeliveryOriginCharge {
  state: string;
  quantity: number;
  routeFee: number;
  quantityCharge: number;
  fee: number;
}

export interface DeliveryBreakdown {
  customerState: string;
  originStates: string[];
  baseLastMileFee: number;
  primaryOrigin: DeliveryOriginCharge | null;
  secondaryOrigins: DeliveryOriginCharge[];
  localQuantity: number;
  totalDeliveryFee: number;
}

export interface CartSummaryResponse {
  subtotal: number;
  shipping: number;
  tax: number;
  taxRate?: number;
  taxPercentage?: number;
  commissionAmount?: number;
  region?: string | null;
  country?: string;
  total: number;
  currency: string;
  formattedRate?: string;
  deliveryFee?: number;
  deliveryFeeCalculated?: boolean;
  deliveryState?: string;
  deliveryError?: string;
  deliveryBreakdown?: DeliveryBreakdown;
  expectedDelivery?: ExpectedDelivery;
}

export type CartSummary = CartSummaryResponse;

export interface OrderQuote {
  currency: string;
  subtotal: number;
  shippingCost: number;
  deliveryFee: number;
  deliveryState: string;
  deliveryBreakdown: DeliveryBreakdown;
  taxRate: number;
  taxAmount: number;
  commissionAmount: number;
  discountAmount: number;
  total: number;
  items: {
    productId: string;
    productName: string;
    productImage?: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    commissionAmount: number;
  }[];
  expectedDelivery?: ExpectedDelivery;
}

export interface DeliveryRoute {
  id: string;
  originState: string;
  destinationState: string;
  isInternal: boolean;
  fee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableState {
  state: string;
  internalFee: number | null;
}

export interface CreateRouteDto {
  originState: string;
  destinationState: string;
  fee: number;
}

export interface PatchRouteDto {
  fee?: number;
  isActive?: boolean;
}

export interface CartValidationResponse {
  isValid: boolean;
  errors: Array<{
    productId: string;
    productName: string;
    errorType: 'unavailable' | 'insufficient_stock' | 'not_found';
    requestedQuantity: number;
    availableStock: number;
    message: string;
  }>;
}

export interface CartItemCheckResponse {
  productId: string;
  inCart: boolean;
  status: 'active' | 'saved_for_later' | 'not_in_cart';
  isActive: boolean;
  isSavedForLater: boolean;
  isSelected?: boolean;
  quantity?: number;
  notes?: string;
}

export const cartApi = {
  async getCart(): Promise<ApiResponse<CartData>> {
    try {
      const response = await axiosInstance.get<ApiResponse<CartData>>('/cart');
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  async getCartCount(): Promise<ApiResponse<CartCountResponse>> {
    try {
      const response = await axiosInstance.get<ApiResponse<CartCountResponse>>('/cart/count');
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  async getCartSummary(params: { country?: string; state?: string } = {}): Promise<ApiResponse<CartSummaryResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.country) queryParams.set('country', params.country);
      if (params.state) queryParams.set('state', params.state);
      const queryStr = queryParams.toString();
      const url = queryStr ? `/cart/summary?${queryStr}` : '/cart/summary';
      const response = await axiosInstance.get<ApiResponse<CartSummaryResponse>>(url);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  async validateCart(): Promise<ApiResponse<CartValidationResponse>> {
    try {
      const response = await axiosInstance.post<ApiResponse<CartValidationResponse>>('/cart/validate');
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  async addItemToCart(productId: string, quantity: number, notes?: string): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.post<ApiResponse<null>>('/cart/items', {
        productId,
        quantity,
        notes,
      });
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  async updateItemQuantity(productId: string, quantity: number): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<null>>(`/cart/items/${productId}/quantity`, {
        quantity,
      });
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  async removeItemFromCart(productId: string): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<null>>(`/cart/items/${productId}`);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  async selectOrUnselectItem(productId: string, isSelected: boolean): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<null>>(`/cart/items/${productId}/select`, {
        isSelected,
      });
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  async selectOrUnselectAllItems(isSelected: boolean): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<null>>('/cart/items/select-all', {
        isSelected,
      });
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  async saveItemForLater(productId: string): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<null>>(`/cart/items/${productId}/save-for-later`);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  async moveSavedItemBackToCart(productId: string): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<null>>(`/cart/items/${productId}/move-to-cart`);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  async clearCart(clearAll: boolean = false): Promise<ApiResponse<null>> {
    try {
      const config: any = { url: '/cart', method: 'DELETE', data: { clearAll } };
      const response = await axiosInstance.request<ApiResponse<null>>(config);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  async checkout(payload: {
    shippingAddress?: {
      fullName: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode?: string;
      country: string;
      phoneNumber: string;
    };
    savedAddressId?: string;
    notes?: string;
  } | {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
    phoneNumber: string;
  }, notes?: string): Promise<ApiResponse<any>> {
    try {
      // Support legacy (shippingAddress, notes) signature as well as payload object
      let body: any;
      if ('shippingAddress' in payload || 'savedAddressId' in payload) {
        body = payload;
      } else {
        body = { shippingAddress: payload, notes };
      }
      const response = await axiosInstance.post<ApiResponse<any>>('/cart/checkout', body);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  async checkCartItem(productId: string): Promise<ApiResponse<CartItemCheckResponse>> {
    try {
      const response = await axiosInstance.get<ApiResponse<CartItemCheckResponse>>(`/cart/items/${productId}/check`);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },
};

export const vendorDashboardApi = {
  /** B1 — Get vendor dashboard overview */
  async getDashboardOverview() {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>('/vendor/dashboard');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /** B2 — Get vendor's own store profile */
  async getStoreProfile() {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>('/vendor/store');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /** B2 — Update store branding (name, description, logo/banner URLs) */
  async updateStoreBranding(payload: {
    storeName?: string;
    storeDescription?: string;
    storeLogoUrl?: string;
    storeBannerUrl?: string;
  }) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>('/vendor/store/branding', payload);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /** B2 — Get signed upload URL for store logo or banner */
  async getStoreImageUploadUrl(payload: {
    imageType: 'logo' | 'banner';
    fileName: string;
    fileSize: number;
    mimeType: string;
  }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>('/vendor/store/upload-url', payload);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /** B2 — Update store policies (return, shipping) */
  async updateStorePolicies(payload: {
    returnPolicy?: string;
    shippingPolicy?: string;
  }) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>('/vendor/store/policies', payload);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /** B2 — Toggle vacation mode. Pass null/undefined to turn off, or a message string to enable */
  async toggleVacationMode(vacationMessage: string | null) {
    try {
      const payload = vacationMessage
        ? { isOnVacation: true, vacationMessage }
        : { isOnVacation: false };
      const response = await axiosInstance.patch<ApiResponse<any>>('/vendor/store/vacation-mode', payload);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /** Vendor stats — consolidated analytics with period filter (today, last_7_days, last_30_days, this_month, custom) */
  async getVendorStats(params?: {
    period?: 'today' | 'last_7_days' | 'last_30_days' | 'this_month' | 'custom';
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.period) queryParams.set('period', params.period);
      if (params?.startDate) queryParams.set('startDate', params.startDate);
      if (params?.endDate) queryParams.set('endDate', params.endDate);
      const qs = queryParams.toString();
      const response = await axiosInstance.get<ApiResponse<any>>(`/vendor/stats${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

export const vendorEarningsApi = {
  async getEarningsSummary() {
    try { const response = await axiosInstance.get<ApiResponse<any>>('/vendor/earnings/summary'); return response.data; } catch (error) { handleApiError(error); }
  },
  async getEarnings(params?: { page?: number; limit?: number; status?: string; startDate?: string; endDate?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
      if (params?.startDate) queryParams.set('startDate', params.startDate);
      if (params?.endDate) queryParams.set('endDate', params.endDate);
      const qs = queryParams.toString();
      const response = await axiosInstance.get<ApiResponse<any>>(`/vendor/earnings${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
  async requestWithdrawal(body: { amount: number; bankAccountId: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>('/vendor/earnings/withdraw', body);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
  async getWithdrawals(params?: { page?: number; limit?: number; status?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
      const qs = queryParams.toString();
      const response = await axiosInstance.get<ApiResponse<any>>(`/vendor/withdrawals${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
  async getBankAccounts() {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>('/vendor/application/bank-accounts');
      return response.data;
    } catch (error) { handleApiError(error); }
  },
  async addBankAccount(body: { accountName: string; accountNumber: string; bankName: string; bankCode: string; accountType: 'savings' | 'current' }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>('/vendor/application/bank-accounts', body);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
  async setPrimaryBankAccount(accountId: string) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>(`/vendor/application/bank-accounts/${accountId}/set-primary`);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
  async deleteBankAccount(accountId: string) {
    try {
      const response = await axiosInstance.delete<ApiResponse<any>>(`/vendor/application/bank-accounts/${accountId}`);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
};

export const superAdminPayoutsApi = {
  async getSummary() {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>('/super-admin/payouts/summary');
      return response.data;
    } catch (error) { handleApiError(error); }
  },
  async getVendors(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.set('search', params.search);
      if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      const qs = queryParams.toString();
      const response = await axiosInstance.get<ApiResponse<any>>(`/super-admin/payouts/vendors${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
  async getBreakdown(params?: { vendorId?: string; orderId?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.vendorId) queryParams.set('vendorId', params.vendorId);
      if (params?.orderId) queryParams.set('orderId', params.orderId);
      if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
      if (params?.startDate) queryParams.set('startDate', params.startDate);
      if (params?.endDate) queryParams.set('endDate', params.endDate);
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      const qs = queryParams.toString();
      const response = await axiosInstance.get<ApiResponse<any>>(`/super-admin/payouts/breakdown${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
  async getWithdrawals(params?: { status?: string; vendorId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
      if (params?.vendorId) queryParams.set('vendorId', params.vendorId);
      if (params?.startDate) queryParams.set('startDate', params.startDate);
      if (params?.endDate) queryParams.set('endDate', params.endDate);
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      const qs = queryParams.toString();
      const response = await axiosInstance.get<ApiResponse<any>>(`/super-admin/payouts/withdrawals${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
  async processWithdrawal(withdrawalId: string, data: { action: 'complete' | 'fail'; reason?: string }) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>(`/super-admin/payouts/withdrawals/${withdrawalId}/process`, data);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
  async overrideWithdrawal(withdrawalId: string, data: { action: 'complete' | 'fail'; reason: string }) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>(`/super-admin/vendors/withdrawals/${withdrawalId}/override`, data);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
};

export const adminWithdrawalsApi = {
  async getWithdrawals(params?: { status?: string; vendorId?: string; page?: number; limit?: number }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
      if (params?.vendorId) queryParams.set('vendorId', params.vendorId);
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      const qs = queryParams.toString();
      const response = await axiosInstance.get<ApiResponse<any>>(`/admin/vendors/withdrawals${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
  async processWithdrawal(withdrawalId: string, data: { action: 'complete' | 'fail'; reason?: string }) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>(`/admin/vendors/withdrawals/${withdrawalId}/process`, data);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
};

export interface CardMetric {
  filtered: number;
  totalAllTime: number;
}

export interface AdminDashboardStats {
  period: 'day' | 'week' | 'month' | 'all_time';
  startDate: string | null;
  endDate: string | null;
  orders: CardMetric;
  products: CardMetric;
  users: CardMetric;
  vendors: CardMetric;
}

export interface OrderStatusBreakdownItem {
  status: string;
  count: number;
  totalRevenue: number;
  percentage: number;
}

export interface DetailedOrderAnalytics {
  period: 'day' | 'week' | 'month' | 'all_time';
  startDate: string | null;
  endDate: string | null;
  totalOrdersCount: number;
  totalOrdersRevenue: number;
  breakdown: OrderStatusBreakdownItem[];
  dataPoints?: { date: string; orders: number; orderValue: number }[];
}

export interface AdminTopProductItem {
  productId: string;
  name: string;
  sku: string | null;
  categoryName: string | null;
  categoryId: string | null;
  vendorName: string | null;
  unitsSold: number;
  imageUrl: string | null;
}

// ─── Admin Dashboard API (ADMIN + SUPER_ADMIN) ───────────────────────────────
// Rule: ADMIN never sees vendor/store earnings, commissions, or payouts.
// Available endpoints: /admin/dashboard, /admin/dashboard/order-analytics, /admin/dashboard/top-products
export const adminDashboardApi = {
  /** GET /api/v1/admin/dashboard?period= */
  async getDashboard(params?: { period?: 'day' | 'week' | 'month' | 'all_time' }) {
    try {
      const q = new URLSearchParams();
      if (params?.period) q.set('period', params.period);
      const qs = q.toString();
      const res = await axiosInstance.get<ApiResponse<AdminDashboardStats>>(`/admin/dashboard${qs ? `?${qs}` : ''}`);
      return res.data;
    } catch (error) { handleApiError(error); }
  },

  /** Alias for getDashboard */
  async getDashboardStats(params?: { period?: 'day' | 'week' | 'month' | 'all_time' }) {
    return this.getDashboard(params);
  },

  /** GET /api/v1/admin/dashboard/order-analytics?period=&vendorId=&categoryId= */
  async getOrderAnalytics(params?: { period?: 'day' | 'week' | 'month' | 'all_time'; vendorId?: string; categoryId?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.period) q.set('period', params.period);
      if (params?.vendorId) q.set('vendorId', params.vendorId);
      if (params?.categoryId) q.set('categoryId', params.categoryId);
      const qs = q.toString();
      const res = await axiosInstance.get<ApiResponse<DetailedOrderAnalytics>>(`/admin/dashboard/order-analytics${qs ? `?${qs}` : ''}`);
      return res.data;
    } catch (error) { handleApiError(error); }
  },

  /** GET /api/v1/admin/dashboard/top-products?period=&categoryId= */
  async getTopProducts(params?: { period?: 'day' | 'week' | 'month' | 'all_time'; categoryId?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.period) q.set('period', params.period);
      if (params?.categoryId) q.set('categoryId', params.categoryId);
      const qs = q.toString();
      const res = await axiosInstance.get<ApiResponse<{ products: AdminTopProductItem[] }>>(`/admin/dashboard/top-products${qs ? `?${qs}` : ''}`);
      return res.data;
    } catch (error) { handleApiError(error); }
  },

};

export const superAdminDashboardApi = {
  // 1. KPI Overview Cards
  async getKpiOverview(params?: { period?: 'day' | 'week' | 'month' | 'all_time'; vendorId?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.period) q.set('period', params.period);
      if (params?.vendorId) q.set('vendorId', params.vendorId);
      const qs = q.toString();
      const res = await axiosInstance.get<ApiResponse<any>>(`/super-admin/dashboard${qs ? `?${qs}` : ''}`);
      return res.data;
    } catch (error) { handleApiError(error); }
  },

  // 2. Vendor Earnings Table
  async getVendorEarnings(params?: { search?: string; vendorId?: string; page?: number; limit?: number }) {
    try {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.vendorId) q.set('vendorId', params.vendorId);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      const res = await axiosInstance.get<ApiResponse<any>>(`/super-admin/dashboard/vendor-earnings${qs ? `?${qs}` : ''}`);
      return res.data;
    } catch (error) { handleApiError(error); }
  },

  // 3. Recent Activities
  async getRecentActivities(params?: { limit?: number; period?: 'day' | 'week' | 'month' | 'all_time'; vendorId?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.period) q.set('period', params.period);
      if (params?.vendorId) q.set('vendorId', params.vendorId);
      const qs = q.toString();
      const res = await axiosInstance.get<ApiResponse<any>>(`/super-admin/dashboard/recent-activities${qs ? `?${qs}` : ''}`);
      return res.data;
    } catch (error) { handleApiError(error); }
  },

  // 4. Top Products Pie Chart
  async getPieChart(params?: { period?: 'day' | 'week' | 'month' | 'all_time'; categoryId?: string; vendorId?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.period) q.set('period', params.period);
      if (params?.vendorId) q.set('vendorId', params.vendorId);
      if (params?.categoryId) q.set('categoryId', params.categoryId);
      const qs = q.toString();
      const res = await axiosInstance.get<ApiResponse<any>>(`/super-admin/dashboard/pie-chart${qs ? `?${qs}` : ''}`);
      return res.data;
    } catch (error) { handleApiError(error); }
  },

  // 5. Earnings Line Graph
  async getEarningsGraph(params?: { interval?: 'daily' | 'weekly' | 'monthly'; vendorId?: string; period?: 'day' | 'week' | 'month' | 'all_time' }) {
    try {
      const q = new URLSearchParams();
      if (params?.interval) q.set('interval', params.interval);
      if (params?.period) q.set('period', params.period);
      if (params?.vendorId) q.set('vendorId', params.vendorId);
      const qs = q.toString();
      const res = await axiosInstance.get<ApiResponse<any>>(`/super-admin/dashboard/earnings-graph${qs ? `?${qs}` : ''}`);
      return res.data;
    } catch (error) { handleApiError(error); }
  },

  // 6. Orders Bar Chart
  async getOrdersBarChart(params?: { period?: 'day' | 'week' | 'month' | 'all_time'; vendorId?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.period) q.set('period', params.period);
      if (params?.vendorId) q.set('vendorId', params.vendorId);
      const qs = q.toString();
      const res = await axiosInstance.get<ApiResponse<any>>(`/super-admin/dashboard/orders-bar-chart${qs ? `?${qs}` : ''}`);
      return res.data;
    } catch (error) { handleApiError(error); }
  },
};

export const vendorOrdersApi = {
  async getOrders(params?: { page?: number; limit?: number; status?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
      const qs = queryParams.toString();
      const response = await axiosInstance.get<ApiResponse<any>>(`/vendor/orders${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
  async getOrderById(orderId: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/vendor/orders/${orderId}`);
      return response.data;
    } catch (error) { handleApiError(error); }
  },
};

export const vendorApplicationApi = {
  async getDraft() {
    try { const response = await axiosInstance.get<ApiResponse<any>>('/vendor/application/draft'); return response.data; } catch (error) { handleApiError(error); }
  },
  async getStatus() {
    try { const response = await axiosInstance.get<ApiResponse<any>>('/vendor/application/status'); return response.data; } catch (error) { handleApiError(error); }
  },
};


export const storePublicApi = {
  async getStoreProfile(storeSlug: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/stores/${storeSlug}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getStoreProducts(
    storeSlug: string,
    params: {
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
      page?: number;
      limit?: number;
    } = {}
  ) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.set(key, String(val));
        }
      });
      const response = await axiosInstance.get<ApiResponse<any>>(
        `/stores/${storeSlug}/products?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getStoreReviews(
    storeSlug: string,
    params: { rating?: number; page?: number; limit?: number } = {}
  ) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          queryParams.set(key, String(val));
        }
      });
      const response = await axiosInstance.get<ApiResponse<any>>(
        `/stores/${storeSlug}/reviews?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getStoreShippingOptions(storeSlug: string, state: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(
        `/stores/${storeSlug}/shipping?state=${encodeURIComponent(state)}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

export const ordersApi = {
  async create(body: any) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>('/orders', body);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getMyOrders(params: { page?: number; limit?: number } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', String(params.page));
      if (params.limit) queryParams.set('limit', String(params.limit));
      const response = await axiosInstance.get<ApiResponse<any>>(`/orders/my-orders?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async search(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.set(key, String(val));
        }
      });
      const response = await axiosInstance.get<ApiResponse<any>>(`/orders/search?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getStatistics(params: { customerId?: string; startDate?: string; endDate?: string } = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.set(key, String(val));
        }
      });
      const response = await axiosInstance.get<ApiResponse<any>>(`/orders/statistics?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getById(id: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getByNumber(orderNumber: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/orders/number/${orderNumber}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async cancel(id: string, reason: string) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(`/orders/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async reorder(id: string) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(`/orders/${id}/reorder`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async refundRequest(id: string, payload: { reason: string; amount?: number }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(`/orders/${id}/refund-request`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async refundReview(id: string, payload: { action: 'approve' | 'reject' | 'process'; rejectionNote?: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(`/orders/${id}/refund-review`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async updateStatus(id: string, status: string) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getNotes(id: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/orders/${id}/notes`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async addNote(id: string, note: string) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(`/orders/${id}/notes`, { note });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async processPayment(id: string, payload: { paymentMethod: string; paymentIntentId?: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(`/orders/${id}/payment`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getQuote(body: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress?: any;
    savedAddressId?: string;
    notes?: string;
  }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>('/orders/quote', body);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async verifyPayment(id: string) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(`/orders/${id}/payment/verify`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

export const deliveryRoutesApi = {
  async getAvailableStates(): Promise<ApiResponse<AvailableState[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<AvailableState[]>>(
        '/delivery-routes/available',
        { skipAuth: true } as any
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getRoutes(params?: {
    originState?: string;
    destinationState?: string;
    activeOnly?: boolean;
  }): Promise<ApiResponse<DeliveryRoute[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.originState) queryParams.set('originState', params.originState);
      if (params?.destinationState) queryParams.set('destinationState', params.destinationState);
      if (params?.activeOnly !== undefined) queryParams.set('activeOnly', String(params.activeOnly));
      const qs = queryParams.toString();
      const response = await axiosInstance.get<ApiResponse<DeliveryRoute[]>>(
        `/delivery-routes${qs ? `?${qs}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getRouteById(id: string): Promise<ApiResponse<DeliveryRoute>> {
    try {
      const response = await axiosInstance.get<ApiResponse<DeliveryRoute>>(`/delivery-routes/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async createRoute(dto: CreateRouteDto): Promise<ApiResponse<DeliveryRoute>> {
    try {
      const response = await axiosInstance.post<ApiResponse<DeliveryRoute>>('/delivery-routes', dto);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async updateRoute(id: string, dto: PatchRouteDto): Promise<ApiResponse<DeliveryRoute>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<DeliveryRoute>>(`/delivery-routes/${id}`, dto);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async deleteRoute(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<null>>(`/delivery-routes/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

export const taxRulesApi = {
  async list() {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>('/tax-rules');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getApplicable(params: { country?: string; state?: string; region?: string; subtotal?: number } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.country) queryParams.set('country', params.country);
      const stateOrRegion = params.state || params.region;
      if (stateOrRegion) {
        queryParams.set('state', stateOrRegion);
        queryParams.set('region', stateOrRegion);
      }
      if (params.subtotal !== undefined) queryParams.set('subtotal', String(params.subtotal));

      const response = await axiosInstance.get<ApiResponse<any>>(`/tax-rules/applicable?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async create(body: { country: string; region?: string | null; ratePercentage: number }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>('/tax-rules', body);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async update(id: string, body: { ratePercentage?: number; isActive?: boolean }) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>(`/tax-rules/${id}`, body);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async delete(id: string) {
    try {
      const response = await axiosInstance.delete<ApiResponse<any>>(`/tax-rules/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

export interface SavedAddressPayload {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  phoneNumber: string;
}

export interface SavedAddressItem extends SavedAddressPayload {
  id: string;
  userId?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const userAddressApi = {
  async list(params: { page?: number; limit?: number } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', String(params.page));
      if (params.limit) queryParams.set('limit', String(params.limit));
      const response = await axiosInstance.get<ApiResponse<any>>(`/user/address?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getById(id: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<SavedAddressItem>>(`/user/address/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async create(body: SavedAddressPayload) {
    try {
      const response = await axiosInstance.post<ApiResponse<SavedAddressItem>>('/user/address', body);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async update(id: string, body: Partial<SavedAddressPayload>) {
    try {
      const response = await axiosInstance.patch<ApiResponse<SavedAddressItem>>(`/user/address/${id}`, body);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async delete(id: string) {
    try {
      const response = await axiosInstance.delete<ApiResponse<null>>(`/user/address/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

export const reviewsApi = {
  async listByProduct(productId: string, params: { rating?: number; page?: number; limit?: number } = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          queryParams.set(key, String(val));
        }
      });
      const response = await axiosInstance.get<ApiResponse<any>>(`/products/${productId}/reviews?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getSingle(id: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getEligible(params: { page?: number; limit?: number; includeReviewed?: boolean } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', String(params.page));
      if (params.limit) queryParams.set('limit', String(params.limit));
      if (params.includeReviewed !== undefined) queryParams.set('includeReviewed', String(params.includeReviewed));
      const response = await axiosInstance.get<ApiResponse<any>>(`/reviews/eligible-products?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async create(productId: string, body: { orderId: string; rating: number; title?: string; comment?: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(`/products/${productId}/reviews`, body);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async edit(id: string, body: { rating?: number; title?: string | null; comment?: string | null }) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>(`/reviews/${id}`, body);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async delete(id: string) {
    try {
      const response = await axiosInstance.delete<ApiResponse<any>>(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async reply(id: string, message: string) {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(`/reviews/${id}/replies`, { message });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async moderate(id: string, body: { action: 'hide' | 'restore' | 'flag' | 'unflag'; reason?: string }) {
    try {
      const response = await axiosInstance.patch<ApiResponse<any>>(`/reviews/${id}/moderate`, body);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// ─── Backward-compat types & aliases ─────────────────────────────────────────

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  productImage?: string;
  unitPrice: { amount: number; currency: string; formatted?: string };
  quantity: number;
  subtotal: { amount: number; currency: string; formatted?: string };
  commissionAmount?: { amount: number; currency: string; formatted?: string };
}

export interface OrderData {
  id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  itemCount: number;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
    phoneNumber: string;
    formatted?: string;
  };
  subtotal: { amount: number; currency: string; formatted?: string };
  shippingCost: { amount: number; currency: string; formatted?: string };
  taxAmount: { amount: number; currency: string; formatted?: string };
  commissionAmount?: { amount: number; currency: string; formatted?: string };
  discountAmount?: { amount: number; currency: string; formatted?: string };
  totalAmount: { amount: number; currency: string; formatted?: string };
  status: string;
  paymentMethod?: string;
  paymentStatus: string;
  notes?: string;
  expectedDelivery?: ExpectedDelivery;
  deliveredAt?: string;
  deliveryBreakdown?: DeliveryBreakdown;
  createdAt: string;
  updatedAt: string;
}

export interface OrderSearchResponse {
  data: OrderData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaxRuleData {
  id: string;
  country: string;
  region: string | null;
  ratePercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessPaymentData {
  order: OrderData;
  payment?: {
    paymentUrl: string;
    accessCode?: string;
    paymentReference: string;
  };
  checkoutUrl?: string;
}

/** Backward-compat alias — CartPage.tsx and PaymentCallback use orderApi */
export const orderApi = {
  processPayment: (orderId: string, paymentMethod: string, paymentIntentId?: string) =>
    ordersApi.processPayment(orderId, { paymentMethod, paymentIntentId }),
  getOrder: (id: string) => ordersApi.getById(id),
  getOrderByNumber: (orderNumber: string) => ordersApi.getByNumber(orderNumber),
  getMyOrders: (params?: { page?: number; limit?: number }) => ordersApi.getMyOrders(params),
  searchOrders: (params?: any) => ordersApi.search(params),
  getOrderStatistics: () => ordersApi.getStatistics(),
  updateOrderStatus: (id: string, status: string, reason?: string) => ordersApi.updateStatus(id, status),
  cancelOrder: (id: string, reason: string) => ordersApi.cancel(id, reason),
  getQuote: (body: any) => ordersApi.getQuote(body),
  verifyPayment: (id: string) => ordersApi.verifyPayment(id),
};

/** Backward-compat alias — TaxRulesView.tsx uses taxRuleApi */
export const taxRuleApi = {
  getTaxRules: () => taxRulesApi.list(),
  createTaxRule: (data: { country: string; region?: string | null; ratePercentage: number }) => taxRulesApi.create(data),
  updateTaxRule: (id: string, data: { ratePercentage?: number; isActive?: boolean }) => taxRulesApi.update(id, data),
  deleteTaxRule: (id: string) => taxRulesApi.delete(id),
};

export interface PublicStoreProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  trustLevel?: string;
  isOnVacation?: boolean;
  vacationMessage?: string | null;
  createdAt?: string;
  [key: string]: any;
}

/** Backward-compat alias — vendor page uses storeApi */
export const storeApi = storePublicApi;

// ─── Engagement Settings API ────────────────────────────────────────────────

export type EngagementEmailType = 'customer_inactivity' | 'vendor_incomplete_registration';

export interface EngagementSetting {
  type: EngagementEmailType;
  enabled: boolean;
  thresholdDays: number;
  subject: string;
  bodyHtml: string;
  updatedBy: string | null;
  updatedAt: string;
}

export interface UpdateEngagementSettingPayload {
  enabled?: boolean;
  thresholdDays?: number;
  subject?: string;
  bodyHtml?: string;
}

export interface SweepResult {
  enabled: boolean;
  eligible: number;
  sent: number;
  failed: number;
}

export interface RunNowResponse {
  customer_inactivity: SweepResult;
  vendorIncompleteRegistration: SweepResult;
  message: 'Engagement email sweep completed';
}

export const engagementApi = {
  /** GET /api/v1/admin/engagement-settings — returns both settings */
  async list(): Promise<ApiResponse<EngagementSetting[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<EngagementSetting[]>>('/admin/engagement-settings');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /** GET /api/v1/admin/engagement-settings/:type */
  async getByType(type: EngagementEmailType): Promise<ApiResponse<EngagementSetting>> {
    try {
      const response = await axiosInstance.get<ApiResponse<EngagementSetting>>(`/admin/engagement-settings/${type}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /** PUT /api/v1/admin/engagement-settings/:type — send only changed fields */
  async update(type: EngagementEmailType, payload: UpdateEngagementSettingPayload): Promise<ApiResponse<EngagementSetting>> {
    try {
      const response = await axiosInstance.put<ApiResponse<EngagementSetting>>(`/admin/engagement-settings/${type}`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /** POST /api/v1/admin/engagement-settings/run-now — runs both sweeps immediately */
  async runNow(): Promise<ApiResponse<RunNowResponse>> {
    try {
      const response = await axiosInstance.post<ApiResponse<RunNowResponse>>('/admin/engagement-settings/run-now');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// --- Vendor Specialist API ---
export const STATE_ENUM_VALUES = ['abia','adamawa','akwa ibom','anambra','bauchi','bayelsa','benue','borno','cross river','delta','ebonyi','edo','ekiti','enugu','fct','gombe','imo','jigawa','kaduna','kano','katsina','kebbi','kogi','kwara','lagos','nasarawa','niger','ogun','ondo','osun','oyo','plateau','rivers','sokoto','taraba','yobe','zamfara'] as const;
export type StateEnumValue = typeof STATE_ENUM_VALUES[number];
export interface VendorSpecialist { id: string; name: string; contactPhone: string; state: StateEnumValue; isActive: boolean; createdAt: string; updatedAt: string; }
export interface VendorSpecialistListResponse { items: VendorSpecialist[]; total: number; page: number; limit: number; totalPages: number; }
export interface CreateVendorSpecialistDto { name: string; contactPhone: string; state: StateEnumValue; }
export interface UpdateVendorSpecialistDto { name?: string; contactPhone?: string; state?: StateEnumValue; isActive?: boolean; }
export interface VendorSpecialistListParams {
  isActive?: 'true' | 'false';
  state?: StateEnumValue;
  page?: number;
  limit?: number;
}

export const vendorSpecialistApi = {
  async create(dto: CreateVendorSpecialistDto): Promise<ApiResponse<VendorSpecialist>> {
    try {
      const r = await axiosInstance.post<ApiResponse<VendorSpecialist>>('/admin/vendor-specialists', dto);
      return r.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async list(params: VendorSpecialistListParams = {}): Promise<ApiResponse<VendorSpecialistListResponse>> {
    try {
      const q = new URLSearchParams();
      if (params.isActive !== undefined) q.set('isActive', params.isActive);
      if (params.state) q.set('state', params.state);
      if (params.page) q.set('page', String(params.page));
      if (params.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      const r = await axiosInstance.get<ApiResponse<VendorSpecialistListResponse>>(
        '/admin/vendor-specialists' + (qs ? '?' + qs : '')
      );
      return r.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getById(id: string): Promise<ApiResponse<VendorSpecialist>> {
    try {
      const r = await axiosInstance.get<ApiResponse<VendorSpecialist>>('/admin/vendor-specialists/' + id);
      return r.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async update(id: string, dto: UpdateVendorSpecialistDto): Promise<ApiResponse<VendorSpecialist>> {
    try {
      const r = await axiosInstance.patch<ApiResponse<VendorSpecialist>>('/admin/vendor-specialists/' + id, dto);
      return r.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const r = await axiosInstance.delete<ApiResponse<void>>('/admin/vendor-specialists/' + id);
      return r.data;
    } catch (e) {
      handleApiError(e);
    }
  },
};
