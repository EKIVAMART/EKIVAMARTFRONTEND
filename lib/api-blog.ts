import {
  AdminBlogPost,
  AdminBlogPostSummary,
  BlogFilterParams,
  CreateBlogPostDto,
  PaginatedPosts,
  PublicBlogPost,
  PublicBlogPostSummary,
  PublishNotificationPayload,
  PublishResult,
  UpdateBlogPostDto,
  UploadedBlogImage,
} from '@/types/blog';

export type {
  AdminBlogPost,
  AdminBlogPostSummary,
  PublicBlogPost,
  PublicBlogPostSummary,
  PaginatedPosts,
};

import { API_BASE_URL } from './axios';

/**
 * Decodes HTML-encoded entities returned by the backend (Section 5.5 of API docs).
 */
export function decodeHtmlEntities(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  let data: any;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `HTTP error ${response.status}`);
    }
    return text as unknown as T;
  }

  if (!response.ok || data?.success === false) {
    const message = data?.message || `Request failed with status ${response.status}`;
    const errors = Array.isArray(data?.errors) ? data.errors : [];
    const err = new Error(message) as Error & { errors?: any[] };
    err.errors = errors;
    throw err;
  }

  return data.data !== undefined ? data.data : data;
}

export const blogApi = {
  // Public Endpoints
  /**
   * GET /api/v1/blog/posts
   * Returns list of published articles
   */
  async getPublicPosts(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedPosts<PublicBlogPostSummary>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search && params.search.trim())
      query.append('search', params.search.trim());

    const url = `${API_BASE_URL}/blog/posts${
      query.toString() ? `?${query.toString()}` : ''
    }`;
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    return handleResponse<PaginatedPosts<PublicBlogPostSummary>>(res);
  },

  /**
   * GET /api/v1/blog/posts/:slug
   * Returns one published article by slug
   */
  async getPublicPostBySlug(slug: string): Promise<PublicBlogPost> {
    const url = `${API_BASE_URL}/blog/posts/${encodeURIComponent(slug)}`;
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    return handleResponse<PublicBlogPost>(res);
  },

  // Admin & Super-Admin Endpoints
  /**
   * POST /api/v1/admin/blog/posts
   * Creates a draft blog post
   */
  async createPost(dto: CreateBlogPostDto): Promise<AdminBlogPost> {
    const url = `${API_BASE_URL}/admin/blog/posts`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(dto),
    });
    return handleResponse<AdminBlogPost>(res);
  },

  /**
   * GET /api/v1/admin/blog/posts
   * Lists all posts (drafts, published, unpublished) with optional filters
   */
  async getAdminPosts(
    params?: BlogFilterParams
  ): Promise<PaginatedPosts<AdminBlogPostSummary>> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search && params.search.trim())
      query.append('search', params.search.trim());
    if (params?.author) query.append('author', params.author);
    if (params?.createdFrom) query.append('createdFrom', params.createdFrom);
    if (params?.createdTo) query.append('createdTo', params.createdTo);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const url = `${API_BASE_URL}/admin/blog/posts${
      query.toString() ? `?${query.toString()}` : ''
    }`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
      cache: 'no-store',
    });
    return handleResponse<PaginatedPosts<AdminBlogPostSummary>>(res);
  },

  /**
   * GET /api/v1/admin/blog/posts/:id
   * Retrieves single blog post by ID
   */
  async getAdminPostById(id: string): Promise<AdminBlogPost> {
    const url = `${API_BASE_URL}/admin/blog/posts/${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
      cache: 'no-store',
    });
    return handleResponse<AdminBlogPost>(res);
  },

  /**
   * PATCH /api/v1/admin/blog/posts/:id
   * Updates fields of a blog post
   */
  async updatePost(id: string, dto: UpdateBlogPostDto): Promise<AdminBlogPost> {
    const url = `${API_BASE_URL}/admin/blog/posts/${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(dto),
    });
    return handleResponse<AdminBlogPost>(res);
  },

  /**
   * DELETE /api/v1/admin/blog/posts/:id
   * Soft deletes a blog post
   */
  async deletePost(id: string): Promise<{ success: boolean; message: string }> {
    const url = `${API_BASE_URL}/admin/blog/posts/${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || 'Failed to delete blog post');
      }
      return data;
    }
    if (!res.ok) {
      throw new Error(`Failed to delete blog post (${res.status})`);
    }
    return { success: true, message: 'Blog post deleted successfully' };
  },

  /**
   * POST /api/v1/admin/blog/posts/:id/publish
   * Publishes post and optionally schedules notification announcements
   */
  async publishPost(
    id: string,
    payload?: PublishNotificationPayload
  ): Promise<PublishResult> {
    const url = `${API_BASE_URL}/admin/blog/posts/${encodeURIComponent(
      id
    )}/publish`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload || {}),
    });
    return handleResponse<PublishResult>(res);
  },

  /**
   * POST /api/v1/admin/blog/posts/:id/unpublish
   * Unpublishes a published post
   */
  async unpublishPost(id: string): Promise<AdminBlogPost> {
    const url = `${API_BASE_URL}/admin/blog/posts/${encodeURIComponent(
      id
    )}/unpublish`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse<AdminBlogPost>(res);
  },

  /**
   * POST /api/v1/admin/blog/uploads/image
   * Uploads an image file (JPEG, PNG, WebP <= 10MB)
   */
  async uploadImage(file: File): Promise<UploadedBlogImage> {
    const url = `${API_BASE_URL}/admin/blog/uploads/image`;
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    return handleResponse<UploadedBlogImage>(res);
  },
};
