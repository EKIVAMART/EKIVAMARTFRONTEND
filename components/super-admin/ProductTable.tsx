import React, { useState, useMemo } from 'react';
import Image, { StaticImageData } from 'next/image';
import { Edit3, Trash2, ChevronLeft, ChevronRight, Eye, MessageSquare, Loader2, Reply, Send, Star, User } from 'lucide-react';
import { reviewsApi } from '@/lib/api';
import toast from 'react-hot-toast';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string | StaticImageData;
  category?: string;
  subCategory?: string;
  status?:
    | 'draft'
    | 'active'
    | 'published'
    | 'inactive'
    | 'out_of_stock'
    | 'discontinued';
  createdAt?: string;
  updatedAt?: string;
}

interface ProductReviewReply {
  id: string;
  responderId: string;
  responderName?: string;
  responderRole: 'vendor' | 'admin';
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductReview {
  id: string;
  productId: string;
  customerName?: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
  replies: ProductReviewReply[];
}

interface ProductTableProps {
  data: Product[];
  onEdit: (item: Product) => void;
  onDelete: (id: string) => void;
  onView?: (item: Product) => void;
  onPublish?: (id: string) => void;
  publishingProductId?: string | null;
  searchQuery?: string;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  showReviewRepliesButton?: boolean;
}

const getStatusBadge = (status?: Product['status']) => {
  if (!status) return null;

  const isPublished = status === 'active' || status === 'published';

  if (isPublished) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Published
      </span>
    );
  }

  return (
    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">
      {status.replaceAll('_', ' ')}
    </span>
  );
};

/** Tooltip wrapper for desktop */
const Tooltip = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="relative group/tip">
    {children}
    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden md:group-hover/tip:flex whitespace-nowrap bg-white border border-gray-200/80 text-slate-700 text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg shadow-md z-50 transition-all">
      {label}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] -mt-px border-transparent border-t-gray-200/80 -z-10" />
    </div>
  </div>
);

export default function ProductTable({
  data,
  onEdit,
  onDelete,
  onView,
  onPublish,
  publishingProductId,
  searchQuery = '',
  currentPage: serverPage,
  totalPages: serverTotalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  isLoading = false,
  showReviewRepliesButton = false,
}: ProductTableProps) {
  const [localPage, setLocalPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('createdAt-desc');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [activeReviewProduct, setActiveReviewProduct] = useState<Product | null>(null);
  const isServerPaginated = Boolean(onPageChange);
  const currentPage = serverPage || localPage;

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );
    }

    // Sort options
    const [field, direction] = sortBy.split('-');
    result.sort((a, b) => {
      let comparison = 0;
      if (field === 'price') {
        comparison = a.price - b.price;
      } else if (field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (field === 'createdAt') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = dateA - dateB;
      } else if (field === 'updatedAt') {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        comparison = dateA - dateB;
      }
      return direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [data, searchQuery, sortBy]);

  const totalPages =
    serverTotalPages ||
    Math.ceil(filteredAndSortedData.length / itemsPerPage) ||
    1;
  const paginatedData = isServerPaginated
    ? filteredAndSortedData
    : filteredAndSortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );
  const displayTotal = totalItems ?? filteredAndSortedData.length;
  const showingFrom =
    displayTotal === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(
    (currentPage - 1) * itemsPerPage + paginatedData.length,
    displayTotal
  );

  React.useEffect(() => {
    if (isServerPaginated) {
      onPageChange?.(1);
      return;
    }

    setLocalPage(1);
  }, [isServerPaginated, onPageChange, searchQuery]);

  const goToPage = (page: number) => {
    const nextPage = Math.min(totalPages, Math.max(1, page));

    if (isServerPaginated) {
      onPageChange?.(nextPage);
      return;
    }

    setLocalPage(nextPage);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const fetchReviewsForProduct = async (product: Product) => {
    setExpandedProductId(product.id);
    setActiveReviewProduct(product);
    setReviewsLoading(true);
    setReviewsError(null);
    setReplyingReviewId(null);
    setReplyMessage('');

    try {
      const res = await reviewsApi.listByProduct(product.id);
      if (res?.success) {
        const payload = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];
        setReviews(payload);
      } else {
        setReviews([]);
        setReviewsError(res?.message || 'Unable to load product reviews.');
      }
    } catch (err: any) {
      setReviews([]);
      setReviewsError(err?.response?.data?.message || 'Unable to load product reviews.');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleToggleReviews = async (product: Product) => {
    if (expandedProductId === product.id) {
      setExpandedProductId(null);
      setActiveReviewProduct(null);
      setReviews([]);
      setReviewsError(null);
      setReplyingReviewId(null);
      setReplyMessage('');
      return;
    }

    await fetchReviewsForProduct(product);
  };

  const handleReplySubmit = async (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    if (!replyMessage.trim() || submittingReply) return;

    setSubmittingReply(true);
    try {
      const res = await reviewsApi.reply(reviewId, replyMessage.trim());
      if (res?.success) {
        toast.success('Reply submitted successfully');
        setReplyingReviewId(null);
        setReplyMessage('');
        if (activeReviewProduct) {
          await fetchReviewsForProduct(activeReviewProduct);
        }
      } else {
        toast.error(res?.message || 'Failed to send reply');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Desktop Action Bar */}
      <div className="hidden md:flex justify-between items-center p-4 border-b bg-white">
        <h2 className="text-lg font-bold text-slate-800">Products</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold">Sort By</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-sm font-medium text-slate-700 rounded-lg p-2 outline-none cursor-pointer focus:border-[#9d4ae3] focus:ring-1 focus:ring-[#9d4ae3]"
          >
            <option value="createdAt-desc">Newest Created</option>
            <option value="createdAt-asc">Oldest Created</option>
            <option value="updatedAt-desc">Recent Updated</option>
            <option value="updatedAt-asc">Oldest Updated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Mobile Action Bar */}
      <div className="md:hidden flex flex-col gap-2 p-4 border-b bg-gray-50/50">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Products</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold shrink-0">
            Sort By
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-white border text-sm font-medium text-slate-700 rounded-lg px-2 py-1.5 outline-none cursor-pointer"
          >
            <option value="createdAt-desc">Newest Created</option>
            <option value="createdAt-asc">Oldest Created</option>
            <option value="updatedAt-desc">Recent Updated</option>
            <option value="updatedAt-asc">Oldest Updated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-200">
          <thead className="bg-gray-50/50 border-b">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase w-12 text-center">
                #
              </th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">
                Product
              </th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">
                Price
              </th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">
                Stock
              </th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">
                Created At
              </th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">
                Last Updated
              </th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((p, idx) => {
                const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                return (
                  <React.Fragment key={p.id}>
                    <tr
                      onClick={() => onView?.(p)}
                      className="border-b last:border-0 hover:bg-gray-50/50 transition cursor-pointer"
                    >
                      <td className="p-4 text-xs font-bold text-slate-400 text-center">
                        {rowNumber}
                      </td>
                      <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border p-1 shrink-0 relative">
                      {p.image ? (
                        <Image
                          src={
                            typeof p.image === 'string' ? p.image : p.image.src
                          }
                          alt={p.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-400 rounded">
                          IMG
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm truncate max-w-50">
                        {p.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 w-fit">
                        {getStatusBadge(p.status)}
                        {(p.category || p.subCategory) && (
                          <span className="text-[10px] font-bold text-[#8236be] bg-[#f0e1f7] px-2 py-0.5 rounded uppercase tracking-wider">
                            {p.category}{' '}
                            {p.subCategory ? `› ${p.subCategory}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center text-sm font-bold text-slate-700">
                    NGN {p.price.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap">
                      {p.stock} In Stock
                    </span>
                  </td>
                  <td className="p-4 text-center text-xs font-medium text-slate-500">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="p-4 text-center text-xs font-medium text-slate-500">
                    {formatDate(p.updatedAt)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      {p.status === 'draft' && onPublish && (
                        <Tooltip label="Publish Product">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPublish(p.id);
                            }}
                            disabled={publishingProductId === p.id}
                            className="px-3 py-1.5 bg-linear-to-r from-[#9d4ae3] to-[#8236be] hover:from-[#8236be] hover:to-[#692a99] disabled:opacity-70 text-white text-xs font-bold rounded-lg transition shadow flex items-center gap-1.5"
                          >
                            {publishingProductId === p.id ? (
                              <>
                                <svg
                                  className="animate-spin h-3 w-3 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                  />
                                </svg>
                                Publishing…
                              </>
                            ) : (
                              'Publish'
                            )}
                          </button>
                        </Tooltip>
                      )}
                      {showReviewRepliesButton && (
                        <Tooltip label="View Replies">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleToggleReviews(p);
                            }}
                            className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition"
                          >
                            <MessageSquare size={16} />
                          </button>
                        </Tooltip>
                      )}
                      {onView && (
                        <Tooltip label="View Details">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(p);
                            }}
                            className="p-2 text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg transition"
                          >
                            <Eye size={16} />
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip label="Edit Product">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(p);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit3 size={16} />
                        </button>
                      </Tooltip>
                      <Tooltip label="Delete Product">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(p.id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
                {expandedProductId === p.id && (
                  <tr>
                    <td colSpan={7} className="px-4 pb-4">
                      <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-bold text-slate-800">Reviews for {p.name}</p>
                            <p className="text-xs text-slate-500">Reply to customer feedback directly from this product row.</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedProductId(null);
                              setActiveReviewProduct(null);
                              setReviews([]);
                              setReviewsError(null);
                              setReplyingReviewId(null);
                              setReplyMessage('');
                            }}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                          >
                            Close
                          </button>
                        </div>

                        {reviewsLoading ? (
                          <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                            <Loader2 size={16} className="animate-spin" />
                            Loading reviews...
                          </div>
                        ) : reviewsError ? (
                          <div className="text-sm text-rose-600 py-2">{reviewsError}</div>
                        ) : reviews.length === 0 ? (
                          <div className="text-sm text-slate-500 py-2">No reviews have been posted for this product yet.</div>
                        ) : (
                          <div className="space-y-3">
                            {reviews.map((review) => (
                              <div key={review.id} className="rounded-xl border border-white/70 bg-white p-3 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-violet-100 p-1.5 text-violet-700">
                                      <User size={13} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-800">{review.customerName || 'Verified buyer'}</p>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                          <Star
                                            key={index}
                                            size={12}
                                            className={index < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  {review.isVerifiedPurchase && (
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                      Verified Purchase
                                    </span>
                                  )}
                                </div>
                                {review.title && <p className="mt-2 text-sm font-semibold text-slate-700">{review.title}</p>}
                                {review.comment && <p className="mt-1 text-sm text-slate-600">{review.comment}</p>}

                                {review.replies && review.replies.length > 0 && (
                                  <div className="mt-3 space-y-2 border-l-2 border-violet-200 pl-3">
                                    {review.replies.map((reply) => (
                                      <div key={reply.id} className="rounded-lg border border-violet-100 bg-violet-50/50 p-2 text-sm text-slate-600">
                                        <p className="font-semibold text-violet-700">{reply.responderRole === 'admin' ? 'Store response' : 'Seller response'}</p>
                                        <p className="mt-1">{reply.message}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {!replyingReviewId && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReplyingReviewId(review.id);
                                      setReplyMessage('');
                                    }}
                                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-800"
                                  >
                                    <Reply size={14} /> Reply
                                  </button>
                                )}

                                {replyingReviewId === review.id && (
                                  <form
                                    onSubmit={(e) => void handleReplySubmit(e, review.id)}
                                    className="mt-3 flex flex-col gap-2 sm:flex-row"
                                  >
                                    <input
                                      type="text"
                                      value={replyMessage}
                                      onChange={(e) => setReplyMessage(e.target.value.substring(0, 3000))}
                                      placeholder="Write a response for this customer..."
                                      className="flex-1 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        type="submit"
                                        disabled={submittingReply || !replyMessage.trim()}
                                        className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                                      >
                                        {submittingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                        Submit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setReplyingReviewId(null);
                                          setReplyMessage('');
                                        }}
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            })
          ) : (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-gray-500 font-medium"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col p-4 space-y-4 bg-gray-50/50">
        {paginatedData.length > 0 ? (
          paginatedData.map((p, idx) => {
            const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
            return (
            <div
              key={p.id}
              onClick={() => onView?.(p)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 cursor-pointer hover:border-fuchsia-200 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border p-2 shrink-0 relative">
                  {p.image ? (
                    <Image
                      src={typeof p.image === 'string' ? p.image : p.image.src}
                      alt={p.name}
                      fill
                      className="object-contain mix-blend-multiply"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 rounded-lg">
                      IMG
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-black text-slate-400 shrink-0">#{rowNumber}</span>
                      <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">
                        {p.name}
                      </h3>
                    </div>
                    {getStatusBadge(p.status)}
                  </div>
                  {(p.category || p.subCategory) && (
                    <div className="mt-1">
                      <span className="text-[10px] font-bold text-[#8236be] bg-[#f0e1f7] px-2 py-0.5 rounded uppercase tracking-wider">
                        {p.category} {p.subCategory ? `› ${p.subCategory}` : ''}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <span className="text-sm font-black text-[#9d4ae3]">
                      NGN {p.price.toLocaleString()}
                    </span>
                    <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {p.stock} in stock
                    </span>
                  </div>
                  <div className="mt-2 space-y-0.5 border-t pt-2 border-gray-100 text-[10px] text-gray-400 font-medium">
                    <div>Created: {formatDate(p.createdAt)}</div>
                    <div>Updated: {formatDate(p.updatedAt)}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-50 pt-3 mt-1">
                {p.status === 'draft' && onPublish && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPublish(p.id);
                    }}
                    disabled={publishingProductId === p.id}
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-linear-to-r from-[#9d4ae3] to-[#8236be] text-white hover:from-[#8236be] hover:to-[#692a99] disabled:opacity-70 rounded-xl transition text-xs font-bold shadow"
                  >
                    {publishingProductId === p.id ? (
                      <>
                        <svg
                          className="animate-spin h-3 w-3 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Publishing…
                      </>
                    ) : (
                      'Publish'
                    )}
                  </button>
                )}
                {showReviewRepliesButton && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleToggleReviews(p);
                    }}
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-xl transition text-xs font-bold"
                  >
                    <MessageSquare size={16} /> Replies
                  </button>
                )}
                {onView && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(p);
                    }}
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition text-xs font-bold"
                  >
                    <Eye size={16} /> View
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(p);
                  }}
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition text-xs font-bold"
                >
                  <Edit3 size={16} /> Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(p.id);
                  }}
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition text-xs font-bold"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
              {expandedProductId === p.id && (
                <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Reviews for {p.name}</p>
                      <p className="text-xs text-slate-500">Reply to customer feedback directly from this product card.</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedProductId(null);
                        setActiveReviewProduct(null);
                        setReviews([]);
                        setReviewsError(null);
                        setReplyingReviewId(null);
                        setReplyMessage('');
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      Close
                    </button>
                  </div>

                  {reviewsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                      <Loader2 size={16} className="animate-spin" />
                      Loading reviews...
                    </div>
                  ) : reviewsError ? (
                    <div className="text-sm text-rose-600 py-2">{reviewsError}</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-sm text-slate-500 py-2">No reviews have been posted for this product yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((review) => (
                        <div key={review.id} className="rounded-xl border border-white/70 bg-white p-3 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="rounded-full bg-violet-100 p-1.5 text-violet-700">
                                <User size={13} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{review.customerName || 'Verified buyer'}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                      key={index}
                                      size={12}
                                      className={index < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            {review.isVerifiedPurchase && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          {review.title && <p className="mt-2 text-sm font-semibold text-slate-700">{review.title}</p>}
                          {review.comment && <p className="mt-1 text-sm text-slate-600">{review.comment}</p>}

                          {review.replies && review.replies.length > 0 && (
                            <div className="mt-3 space-y-2 border-l-2 border-violet-200 pl-3">
                              {review.replies.map((reply) => (
                                <div key={reply.id} className="rounded-lg border border-violet-100 bg-violet-50/50 p-2 text-sm text-slate-600">
                                  <p className="font-semibold text-violet-700">{reply.responderRole === 'admin' ? 'Store response' : 'Seller response'}</p>
                                  <p className="mt-1">{reply.message}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {!replyingReviewId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReplyingReviewId(review.id);
                                setReplyMessage('');
                              }}
                              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-800"
                            >
                              <Reply size={14} /> Reply
                            </button>
                          )}

                          {replyingReviewId === review.id && (
                            <form
                              onSubmit={(e) => void handleReplySubmit(e, review.id)}
                              className="mt-3 flex flex-col gap-2"
                            >
                              <input
                                type="text"
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value.substring(0, 3000))}
                                placeholder="Write a response for this customer..."
                                className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  disabled={submittingReply || !replyMessage.trim()}
                                  className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                                >
                                  {submittingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                  Submit
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReplyingReviewId(null);
                                    setReplyMessage('');
                                  }}
                                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500 font-medium">
            No products found.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {(totalPages > 1 || currentPage > 1) && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-sm text-gray-500 font-medium hidden sm:block">
            Showing {showingFrom} to {showingTo} of {displayTotal} products (Page {currentPage} of {totalPages})
          </span>
          <div className="flex items-center gap-1 mx-auto sm:mx-0">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 disabled:opacity-50 transition"
            >
              <ChevronLeft size={18} />
            </button>

            {(() => {
              const pages: (number | string)[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                if (currentPage <= 4) {
                  for (let i = 1; i <= 5; i++) pages.push(i);
                  pages.push('...');
                  pages.push(totalPages);
                } else if (currentPage >= totalPages - 3) {
                  pages.push(1);
                  pages.push('...');
                  for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  pages.push('...');
                  pages.push(currentPage - 1);
                  pages.push(currentPage);
                  pages.push(currentPage + 1);
                  pages.push('...');
                  pages.push(totalPages);
                }
              }

              return pages.map((page, index) => {
                if (typeof page === 'string') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold select-none text-sm"
                    >
                      …
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    disabled={isLoading}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition text-sm font-medium ${
                      currentPage === page
                        ? 'bg-[#9d4ae3] text-white font-bold shadow-xs'
                        : 'hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 disabled:opacity-50 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
