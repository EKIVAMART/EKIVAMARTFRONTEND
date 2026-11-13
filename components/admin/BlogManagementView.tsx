'use client';
import RecordStatus from "@/components/admin/RecordStatus";
import RecordActions from "@/components/admin/RecordActions";


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  EyeOff,
  Trash2,
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Loader2,
  X,
  ArrowRight,
} from '@/components/ui/platform-icons';
import {
  AdminBlogPost,
  AdminBlogPostSummary,
  BlogPostStatus,
  Pagination,
  PublishResult,
} from '@/types/blog';
import { blogApi, decodeHtmlEntities } from '@/lib/api-blog';
import BlogPublishModal from '@/components/blog/BlogPublishModal';
import BlogViewModal from '@/components/blog/BlogViewModal';
import { toast } from 'react-hot-toast';

interface BlogManagementViewProps {
  /** Optional search query driven by the parent dashboard's global search bar */
  globalSearchQuery?: string;
}

export default function BlogManagementView({ globalSearchQuery }: BlogManagementViewProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const editorBase = pathname.startsWith('/super-admin') ? '/super-admin/blog/editor' : '/admin/blog/editor';
  const [posts, setPosts] = useState<AdminBlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Filtering state
  const [activeStatusTab, setActiveStatusTab] = useState<
    'all' | BlogPostStatus
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Dashboard counters
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    unpublished: 0,
  });

  // Modal controls
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [postToPublish, setPostToPublish] = useState<AdminBlogPost | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [postToView, setPostToView] = useState<AdminBlogPost | null>(null);

  // Custom Confirmation Modals State
  const [postToDelete, setPostToDelete] = useState<AdminBlogPostSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [postToUnpublish, setPostToUnpublish] = useState<AdminBlogPostSummary | null>(null);
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  // Search state & refs
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 text-slate-950 rounded px-0.5 font-extrabold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Sync global search query from parent dashboard into local state
  useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setSearchQuery(globalSearchQuery);
      setCurrentPage(1);
    }
  }, [globalSearchQuery]);

  // Debounce search input (local typing or global injection)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch stats counters (calling endpoint once per status with limit=1)
  const fetchStats = useCallback(async () => {
    try {
      const [allRes, pubRes, draftRes, unpubRes] = await Promise.all([
        blogApi.getAdminPosts({ limit: 1 }),
        blogApi.getAdminPosts({ status: 'published', limit: 1 }),
        blogApi.getAdminPosts({ status: 'draft', limit: 1 }),
        blogApi.getAdminPosts({ status: 'unpublished', limit: 1 }),
      ]);

      setStats({
        total: allRes.pagination.total,
        published: pubRes.pagination.total,
        draft: draftRes.pagination.total,
        unpublished: unpubRes.pagination.total,
      });
    } catch {
      // Ignore stats fetch error silently
    }
  }, []);

  // Fetch posts list
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await blogApi.getAdminPosts({
        status: activeStatusTab === 'all' ? undefined : activeStatusTab,
        search: debouncedSearch,
        page: currentPage,
        limit: 10,
      });

      setPosts(res.posts);
      setPagination({
        ...res.pagination,
        page: Number(res.pagination.page) || currentPage,
        limit: Number(res.pagination.limit) || 10,
        total: Number(res.pagination.total) || res.posts.length,
        totalPages: Number(res.pagination.totalPages) || 1,
      });
    } catch (err: any) {
      console.error('Failed to fetch admin blog posts:', err);
      setError(err?.message || 'Failed to load blog posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeStatusTab, debouncedSearch, currentPage]);

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [fetchPosts, fetchStats]);

  // Handlers for modal actions
  const handleOpenCreate = () => router.push(editorBase);
  const handleOpenEdit = (summary: AdminBlogPostSummary) => router.push(`${editorBase}?id=${encodeURIComponent(summary.id)}`);

  const handleOpenView = async (summary: AdminBlogPostSummary) => {
    try {
      toast.loading('Loading article preview...', { id: 'loadPostView' });
      const fullPost = await blogApi.getAdminPostById(summary.id);
      toast.dismiss('loadPostView');
      setPostToView(fullPost);
      setIsViewModalOpen(true);
    } catch (err: any) {
      toast.dismiss('loadPostView');
      toast.error(err?.message || 'Failed to load article preview');
    }
  };

  const handleOpenPublish = async (summary: AdminBlogPostSummary) => {
    try {
      const fullPost = await blogApi.getAdminPostById(summary.id);
      setPostToPublish(fullPost);
      setIsPublishModalOpen(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to open publish settings');
    }
  };

  const confirmUnpublish = async () => {
    if (!postToUnpublish) return;
    try {
      setIsUnpublishing(true);
      await blogApi.unpublishPost(postToUnpublish.id);
      toast.success('Article unpublished successfully');
      setPostToUnpublish(null);
      fetchPosts();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to unpublish article');
    } finally {
      setIsUnpublishing(false);
    }
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      setIsDeleting(true);
      await blogApi.deletePost(postToDelete.id);
      toast.success('Article deleted successfully');
      setPostToDelete(null);
      fetchPosts();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete article');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: BlogPostStatus) => <RecordStatus value={status} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Blog</h1>
          <p className="mt-1 text-xs text-slate-600">{stats.published} published · {stats.draft} drafts</p>
        </div>
        <button type="button" onClick={handleOpenCreate}
          className="inline-flex min-h-10 items-center gap-2 bg-[#176a35] px-4 text-sm font-medium text-white hover:bg-[#12582b]">
          <Plus size={16} aria-hidden="true" /> New article
        </button>
      </div>

            {/* Filters & Search Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div ref={searchWrapperRef} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder={globalSearchQuery !== undefined && globalSearchQuery.trim()
              ? `Filtering by top bar: "${globalSearchQuery}"…`
              : 'Search by title, excerpt, author…'}
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-neutral-200 rounded-md pl-11 pr-9 py-2.5 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}

          {/* Live Search Titles Dropdown */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white border border-neutral-200 rounded-md shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2.5 bg-neutral-50/90 border-b border-neutral-100 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                  Matching Blog Titles ({posts.filter(p => decodeHtmlEntities(p.title).toLowerCase().includes(searchQuery.toLowerCase().trim())).length})
                </span>
                <span className="text-[10px] font-semibold text-neutral-400">Click title to edit</span>
              </div>

              {posts.filter(p => decodeHtmlEntities(p.title).toLowerCase().includes(searchQuery.toLowerCase().trim())).length === 0 ? (
                <div className="p-4 text-center text-xs font-semibold text-neutral-400">
                  No blog titles match &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <ul className="max-h-64 overflow-y-auto divide-y divide-neutral-100">
                  {posts
                    .filter(p => decodeHtmlEntities(p.title).toLowerCase().includes(searchQuery.toLowerCase().trim()))
                    .slice(0, 5)
                    .map((post) => (
                      <li key={post.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSearchFocused(false);
                            handleOpenEdit(post);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-brand-50/60 transition flex items-center gap-3 group cursor-pointer"
                        >
                          {post.featuredImage?.url ? (
                            <img
                              src={post.featuredImage.url}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-neutral-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 shrink-0">
                              <BookOpen size={14} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-brand-700 truncate">
                              {highlightMatch(decodeHtmlEntities(post.title), searchQuery)}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-medium truncate">
                              By {post.author?.name || 'EkivaMart'} · /blog/{post.slug}
                            </p>
                          </div>
                          <ArrowRight size={13} className="text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Status Filter Tabs & Refresh */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex items-center gap-2" role="group" aria-label="Filter articles by status">
            <Filter className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <button
              onClick={() => {
                setActiveStatusTab('all');
                setCurrentPage(1);
              }}
              aria-pressed={activeStatusTab === 'all'}
              className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeStatusTab === 'all'
                  ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setActiveStatusTab('published');
                setCurrentPage(1);
              }}
              aria-pressed={activeStatusTab === 'published'}
              className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeStatusTab === 'published'
                  ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => {
                setActiveStatusTab('draft');
                setCurrentPage(1);
              }}
              aria-pressed={activeStatusTab === 'draft'}
              className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeStatusTab === 'draft'
                  ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => {
                setActiveStatusTab('unpublished');
                setCurrentPage(1);
              }}
              aria-pressed={activeStatusTab === 'unpublished'}
              className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeStatusTab === 'unpublished'
                  ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              Unpublished
            </button>
          </div>

          <button
            onClick={() => {
              fetchPosts();
              fetchStats();
            }}
            className="p-2.5 rounded-md bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition cursor-pointer shadow-xs"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-md border border-neutral-100 shadow-sm overflow-hidden">
        {loading && posts.length === 0 ? (
          <div className="py-24 text-center text-xs font-semibold text-neutral-400">
            Loading articles...
          </div>
        ) : error ? (
          <div className="py-20 text-center text-xs font-semibold text-slate-600">
            {error}
          </div>
        ) : posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[11px] font-black uppercase text-neutral-400 tracking-wider">
                  <th className="py-4 px-4 w-12 text-center">#</th>
                  <th className="py-4 px-6">Article</th>
                  <th className="py-4 px-4">Author</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Read Time</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs font-semibold text-neutral-800">
                {posts.map((post, idx) => (
                  <tr
                    key={post.id}
                    tabIndex={0}
                    aria-label={`Preview ${decodeHtmlEntities(post.title)}`}
                    onClick={() => void handleOpenView(post)}
                    onKeyDown={(event) => {
                      if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        void handleOpenView(post);
                      }
                    }}
                    className="cursor-pointer transition-colors hover:bg-emerald-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700"
                  >
                    {/* Index numbering */}
                    <td className="py-4 px-4 text-center font-extrabold text-neutral-400">
                      {(currentPage - 1) * 10 + idx + 1}
                    </td>

                    {/* Article info */}
                    <td className="py-4 px-6 max-w-sm">
                      <div className="flex items-start gap-3">
                        {post.featuredImage?.url ? (
                          <img
                            src={post.featuredImage.url}
                            alt=""
                            className="w-12 h-12 rounded-md object-cover shrink-0 border border-neutral-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 shrink-0">
                            <BookOpen size={20} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-800 truncate text-sm">
                            {highlightMatch(decodeHtmlEntities(post.title), searchQuery)}
                          </h4>
                          <p className="text-[11px] text-neutral-400 font-medium truncate mt-0.5">
                            /blog/{post.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-neutral-700 font-bold">
                        <User size={13} className="text-neutral-400" />
                        <span>{post.author?.name || 'Unknown Author'}</span>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(post.status)}
                    </td>

                    {/* Reading time */}
                    <td className="py-4 px-4 whitespace-nowrap text-neutral-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock size={13} />
                        <span>{post.readingTime} min</span>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-4 whitespace-nowrap text-neutral-500 font-medium">
                      {post.publishedAt ? (
                        <div>
                          <p className="text-slate-800 font-bold">
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-slate-600">Published</p>
                        </div>
                      ) : (
                        <div>
                          <p>{new Date(post.createdAt).toLocaleDateString()}</p>
                          <p className="text-[10px] text-neutral-400">Created</p>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <RecordActions name={decodeHtmlEntities(post.title)} actions={[
                        { label: 'Preview article', onSelect: () => void handleOpenView(post) },
                        { label: 'Edit article', onSelect: () => handleOpenEdit(post) },
                        post.status === 'published'
                          ? { label: 'Unpublish article', onSelect: () => setPostToUnpublish(post) }
                          : { label: 'Publish article', onSelect: () => void handleOpenPublish(post) },
                        { label: 'Delete article', onSelect: () => setPostToDelete(post), destructive: true },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-md bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
              <BookOpen size={28} />
            </div>
            <h3 className="text-sm font-extrabold text-neutral-800">
              No blog posts found
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? 'No articles matched your search filter.'
                : 'Click "Create New Article" to write your first story.'}
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-neutral-100 bg-neutral-50/50">
            <span className="text-xs font-bold text-neutral-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total}{' '}
              articles total)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 px-3 py-2 rounded-md border border-neutral-200 text-xs font-bold text-neutral-700 disabled:opacity-40 hover:bg-neutral-100 transition cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      pageNum === currentPage
                        ? 'bg-brand-600 text-white'
                        : 'text-neutral-600 hover:bg-neutral-200/60'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(pagination.totalPages, p + 1)
                  )
                }
                disabled={currentPage >= pagination.totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-md border border-neutral-200 text-xs font-bold text-neutral-700 disabled:opacity-40 hover:bg-neutral-100 transition cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-[3px] flex items-center justify-center p-4 animate-in fade-in duration-200 dashboard-dialog-overlay">
          <div className="bg-white w-full overflow-hidden p-6 space-y-6 text-center dashboard-dialog dashboard-dialog--form dashboard-dialog--padded" role="dialog" aria-modal="true" aria-labelledby="BlogManagementView-dialog-0-title">
            <div className="w-14 h-14 rounded-md bg-rose-50 text-slate-600 flex items-center justify-center font-bold mx-auto border border-rose-100 dashboard-dialog-icon">
              <Trash2 size={28} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800" id="BlogManagementView-dialog-0-title">
                Delete Article?
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-900">"{decodeHtmlEntities(postToDelete.title)}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-3 border border-neutral-200 rounded-md text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-extrabold transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                <span>Yes, Delete Article</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Unpublish Confirmation Modal */}
      {postToUnpublish && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-[3px] flex items-center justify-center p-4 animate-in fade-in duration-200 dashboard-dialog-overlay">
          <div className="bg-white w-full overflow-hidden p-6 space-y-6 text-center dashboard-dialog dashboard-dialog--form dashboard-dialog--padded" role="dialog" aria-modal="true" aria-labelledby="BlogManagementView-dialog-1-title">
            <div className="w-14 h-14 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold mx-auto border border-slate-200 dashboard-dialog-icon">
              <EyeOff size={28} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800" id="BlogManagementView-dialog-1-title">
                Unpublish Article?
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                Are you sure you want to unpublish <span className="font-bold text-slate-900">"{decodeHtmlEntities(postToUnpublish.title)}"</span>? It will no longer be visible on the public website.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPostToUnpublish(null)}
                disabled={isUnpublishing}
                className="px-5 py-3 border border-neutral-200 rounded-md text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUnpublish}
                disabled={isUnpublishing}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-extrabold transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {isUnpublishing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <EyeOff size={16} />
                )}
                <span>Confirm &amp; Unpublish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <BlogPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onSuccess={() => {
          fetchPosts();
          fetchStats();
        }}
        post={postToPublish}
      />

      <BlogViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        post={postToView}
      />
    </div>
  );
}
