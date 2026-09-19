export type BlogPostStatus = 'draft' | 'published' | 'unpublished';
export type NotificationChannel = 'in_app' | 'push' | 'email';
export type BlogNotificationAudience = 'ALL_USERS';

/** Admin view: returned by every /admin/blog/posts/* endpoint */
export interface AdminBlogPost {
  id: string; // UUID
  title: string; // HTML-encoded from backend
  slug: string; // URL slug, e.g. "how-to-keep-your-roses-fresh"
  content: string; // Sanitized HTML
  excerpt: string | null; // Short summary
  featuredImage: { url: string; key: string | null } | null;
  author: { id: string; name: string } | null; // null if author account was deleted
  status: BlogPostStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  readingTime: number; // Whole minutes, minimum 1
  publishedAt: string | null; // ISO 8601, null if never published
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** Admin list rows are identical, except they have no `content` */
export type AdminBlogPostSummary = Omit<AdminBlogPost, 'content'>;

/** Public list card */
export interface PublicBlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: { url: string } | null;
  author: { name: string } | null;
  readingTime: number;
  publishedAt: string | null;
}

/** Public article page */
export interface PublicBlogPost extends PublicBlogPostSummary {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pages?: number;
}

export interface PaginatedPosts<T> {
  posts: T[];
  pagination: Pagination;
}

export interface UploadedBlogImage {
  url: string;
  key: string;
  size: number;
}

export interface PublishResult {
  post: AdminBlogPost;
  transitioned: boolean;
  notificationScheduled: boolean;
}

export interface PublishNotificationOptions {
  enabled?: boolean;
  channels?: NotificationChannel[];
  audience?: BlogNotificationAudience;
}

export interface PublishNotificationPayload {
  notification?: PublishNotificationOptions;
}

export interface CreateBlogPostDto {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  featuredImage?: { url: string; key?: string | null } | null;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateBlogPostDto {
  title?: string;
  content?: string;
  excerpt?: string | null;
  slug?: string;
  featuredImage?: { url: string; key?: string | null } | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface BlogFilterParams {
  status?: BlogPostStatus;
  search?: string;
  author?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  limit?: number;
}
