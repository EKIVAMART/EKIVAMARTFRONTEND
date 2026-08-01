'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import {
  Star, MapPin, Phone, Mail, Globe,
  ChevronRight, Package, MessageSquare, Truck, Search, SlidersHorizontal,
  ArrowLeft, ExternalLink, AlertTriangle, Store, ShoppingBag, BadgeCheck,
  Calendar, ChevronDown, RefreshCw,
} from 'lucide-react';
import { storePublicApi } from '@/lib/api';
import toast from 'react-hot-toast';

/* ─── Social Icons ──────────────────────────────────────────────────────── */
function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TwitterIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface StoreProfile {
  id: string;
  storeName: string;
  storeSlug: string;
  storeDescription: string | null;
  storeLogoUrl: string | null;
  storeBannerUrl: string | null;
  storePhone: string | null;
  storeEmail: string | null;
  vendorType: string;
  trustLevel: string;
  averageRating: number | null;
  isVacationMode: boolean;
  vacationMessage: string | null;
  returnPolicy: string | null;
  shippingPolicy: string | null;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  } | null;
  approvedAt: string | null;
}

interface StoreProduct {
  productId: string;
  productName: string;
  productSku: string;
  status: string;
  price: number;
  stockQuantity: number;
  unitsSold: number;
  revenue: number;
  imageUrl: string | null;
  categoryName: string | null;
  createdAt: string;
}

interface StoreReview {
  id: string;
  rating: number;
  comment: string | null;
  vendorReply: string | null;
  vendorRepliedAt: string | null;
  createdAt: string;
}

interface ReviewsData {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
  reviews: StoreReview[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface ShippingOption {
  methodName: string;
  estimatedDays: string;
  price: number;
  freeShippingThreshold: number | null;
}

type ActiveTab = 'products' | 'reviews' | 'info';

interface PublicStorePageProps {
  params: Promise<{ storeSlug: string }>;
}

/* ─── Helper: Half-star renderer ─────────────────────────────────────────── */
function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const full = rating >= i + 1;
        const half = !full && rating >= i + 0.5;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="text-gray-200 fill-gray-200" />
            {(full || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: full ? '100%' : '50%' }}
              >
                <Star size={size} className="text-amber-400 fill-amber-400" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

/* ─── Helper: Naira formatter ─────────────────────────────────────────────── */
function NairaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v18M18 3v18M6 3l12 18M4 9h16M4 14h16" />
    </svg>
  );
}
const formatNaira = (amount: number) =>
  `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/* ─── Skeleton components ─────────────────────────────────────────────────── */
function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />;
}

function StoreSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner skeleton */}
      <div className="h-52 md:h-72 bg-gray-200 animate-pulse relative">
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-6 flex items-end gap-5">
          <div className="w-24 h-24 rounded-2xl bg-gray-300 animate-pulse border-4 border-white" />
          <div className="flex-1 space-y-2 pb-1">
            <SkeletonBlock className="h-6 w-48" />
            <SkeletonBlock className="h-4 w-64" />
          </div>
        </div>
      </div>
      {/* Stats skeleton */}
      <div className="bg-white border-b border-gray-100 px-6 md:px-12 py-4 flex gap-6">
        {[1, 2, 3].map(i => <SkeletonBlock key={i} className="h-10 w-28" />)}
      </div>
      {/* Tab skeleton */}
      <div className="bg-white border-b border-gray-100 px-6 md:px-12 flex gap-6 py-1">
        {[1, 2, 3].map(i => <SkeletonBlock key={i} className="h-8 w-24 my-2" />)}
      </div>
      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white overflow-hidden border border-gray-100 shadow-sm">
            <SkeletonBlock className="aspect-square rounded-none" />
            <div className="p-3 space-y-2">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-2/3" />
              <SkeletonBlock className="h-5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function PublicStorePage({ params }: PublicStorePageProps) {
  const { storeSlug } = use(params);

  const [store, setStore] = useState<StoreProfile | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('products');

  // Products state
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsPage, setProductsPage] = useState(1);
  const [productsTotalPages, setProductsTotalPages] = useState(1);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productSearch, setProductSearch] = useState('');
  const [productSort, setProductSort] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest');

  // Reviews state
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsFilter, setReviewsFilter] = useState<number | undefined>(undefined);

  // Shipping state
  const [shippingState, setShippingState] = useState('Lagos');
  const [shippingResult, setShippingResult] = useState<{ vendorShipsToState: boolean; shippingOptions?: ShippingOption[]; message?: string } | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  // ── Fetch store profile on mount ──────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      try {
        const res = await storePublicApi.getStoreProfile(storeSlug);
        if (!isMounted) return;
        if (res?.data) {
          setStore(res.data as StoreProfile);
        } else {
          setNotFound(true);
        }
      } catch {
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setPageLoading(false);
      }
    };
    void fetch();
    return () => { isMounted = false; };
  }, [storeSlug]);

  // ── Fetch products ────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (page: number, search: string, sort: string) => {
    setProductsLoading(true);
    try {
      const res = await storePublicApi.getStoreProducts(storeSlug, {
        page,
        limit: 12,
        search: search || undefined,
        sort: sort as any,
      });
      const d = res?.data;
      if (d) {
        const list: StoreProduct[] = Array.isArray(d.data) ? d.data : [];
        setProducts(list);
        setProductsTotal(d.total ?? list.length);
        setProductsTotalPages(d.totalPages ?? 1);
      }
    } catch {
      toast.error('Could not load products');
    } finally {
      setProductsLoading(false);
    }
  }, [storeSlug]);

  useEffect(() => {
    if (!store) return;
    void fetchProducts(productsPage, productSearch, productSort);
  }, [store, productsPage, productSearch, productSort, fetchProducts]);

  // ── Fetch reviews ─────────────────────────────────────────────────────
  const fetchReviews = useCallback(async (page: number, rating?: number) => {
    setReviewsLoading(true);
    try {
      const res = await storePublicApi.getStoreReviews(storeSlug, { page, limit: 8, rating });
      if (res?.data) setReviewsData(res.data as ReviewsData);
    } catch {
      toast.error('Could not load reviews');
    } finally {
      setReviewsLoading(false);
    }
  }, [storeSlug]);

  useEffect(() => {
    if (activeTab === 'reviews' && store) {
      void fetchReviews(reviewsPage, reviewsFilter);
    }
  }, [activeTab, store, reviewsPage, reviewsFilter, fetchReviews]);

  // ── Fetch shipping ────────────────────────────────────────────────────
  const fetchShipping = async () => {
    if (!shippingState.trim()) return;
    setShippingLoading(true);
    try {
      const res = await storePublicApi.getStoreShippingOptions(storeSlug, shippingState.trim());
      if (res?.data) setShippingResult(res.data);
    } catch {
      toast.error('Could not fetch shipping options');
    } finally {
      setShippingLoading(false);
    }
  };

  // ── Loading / 404 ─────────────────────────────────────────────────────
  if (pageLoading) return <StoreSkeleton />;

  if (notFound || !store) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center">
          <Store size={36} className="text-purple-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Store Not Found</h1>
          <p className="text-gray-500 max-w-md">This store may not exist, may be suspended, or hasn&apos;t been approved yet.</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </div>
    );
  }

  const trustBadgeMap: Record<string, { label: string; color: string }> = {
    trusted_seller: { label: 'Trusted Seller', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    verified: { label: 'Verified', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    premium: { label: 'Premium', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    new_seller: { label: 'New Seller', color: 'bg-gray-50 text-gray-600 border-gray-200' },
  };
  const trustBadge = trustBadgeMap[store.trustLevel] ?? { label: store.trustLevel.replace(/_/g, ' '), color: 'bg-gray-50 text-gray-600 border-gray-200' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Vacation Mode Banner ───────────────────────────────────────── */}
      {store.isVacationMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            <span className="font-bold">This store is on vacation. </span>
            {store.vacationMessage || 'Orders may be delayed. Please check back later.'}
          </p>
        </div>
      )}

      {/* ── Banner ────────────────────────────────────────────────────── */}
      <div
        className="relative h-52 md:h-72 bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 overflow-hidden"
        style={store.storeBannerUrl ? {
          backgroundImage: `url(${store.storeBannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Back link */}
        <Link
          href="/"
          className="absolute top-4 left-4 md:left-12 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors z-10"
        >
          <ArrowLeft size={16} />
          Back to shop
        </Link>
        {/* Store header info */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-12 pb-6 flex items-end gap-4 z-10">
          {/* Logo */}
          <div className="flex-shrink-0">
            {store.storeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.storeLogoUrl}
                alt={store.storeName}
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-white object-cover shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-white bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl">
                <span className="text-white text-2xl md:text-3xl font-black">
                  {store.storeName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {/* Name + meta */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-white text-xl md:text-3xl font-black drop-shadow-md truncate">{store.storeName}</h1>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${trustBadge.color}`}>
                {trustBadge.label}
              </span>
            </div>
            {store.storeDescription && (
              <p className="text-white/80 text-sm mt-1 line-clamp-2 max-w-xl">{store.storeDescription}</p>
            )}
            {/* Social links */}
            {store.socialLinks && (
              <div className="flex gap-2 mt-2">
                {store.socialLinks.instagram && (
                  <a href={store.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-pink-500 flex items-center justify-center text-white transition-colors">
                    <InstagramIcon size={14} />
                  </a>
                )}
                {store.socialLinks.facebook && (
                  <a href={store.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-blue-600 flex items-center justify-center text-white transition-colors">
                    <FacebookIcon size={14} />
                  </a>
                )}
                {store.socialLinks.twitter && (
                  <a href={store.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-sky-500 flex items-center justify-center text-white transition-colors">
                    <TwitterIcon size={14} />
                  </a>
                )}
                {store.socialLinks.tiktok && (
                  <a href={store.socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-black flex items-center justify-center text-white transition-colors">
                    <TikTokIcon size={14} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Strip ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-4 flex flex-wrap gap-x-8 gap-y-3 items-center">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarRating rating={store.averageRating ?? 0} size={16} />
            <span className="font-bold text-gray-800 text-sm">
              {store.averageRating != null ? store.averageRating.toFixed(1) : 'No rating'}
            </span>
            {reviewsData && (
              <span className="text-gray-400 text-sm">({reviewsData.totalReviews.toLocaleString()} reviews)</span>
            )}
          </div>
          {/* Vendor type */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <BadgeCheck size={15} className="text-purple-500" />
            <span className="capitalize font-medium">{store.vendorType.replace(/_/g, ' ')} Seller</span>
          </div>
          {/* Products count */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <ShoppingBag size={15} className="text-purple-500" />
            <span className="font-medium">{productsTotal > 0 ? `${productsTotal} Products` : 'Products'}</span>
          </div>
          {/* Joined */}
          {store.approvedAt && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar size={15} className="text-purple-500" />
              <span className="font-medium">Since {new Date(store.approvedAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Tab Bar ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex">
          {(['products', 'reviews', 'info'] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 text-sm font-semibold capitalize transition-all relative whitespace-nowrap ${
                activeTab === tab
                  ? 'text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'products' && <><ShoppingBag size={14} className="inline mr-1.5 -mt-0.5" />Products</>}
              {tab === 'reviews' && <><MessageSquare size={14} className="inline mr-1.5 -mt-0.5" />Reviews</>}
              {tab === 'info' && <><Store size={14} className="inline mr-1.5 -mt-0.5" />Store Info</>}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-8">

        {/* ── PRODUCTS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'products' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={e => { setProductSearch(e.target.value); setProductsPage(1); }}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 bg-white"
                />
              </div>
              {/* Sort */}
              <div className="relative">
                <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={productSort}
                  onChange={e => { setProductSort(e.target.value as any); setProductsPage(1); }}
                  className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 bg-white appearance-none cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="popular">Popular</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Product Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-white overflow-hidden border border-gray-100 shadow-sm">
                    <SkeletonBlock className="aspect-square rounded-none" />
                    <div className="p-3 space-y-2">
                      <SkeletonBlock className="h-4 w-full" />
                      <SkeletonBlock className="h-4 w-2/3" />
                      <SkeletonBlock className="h-5 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Package size={48} className="text-gray-200" />
                <p className="text-gray-400 font-medium">No products found</p>
                {productSearch && (
                  <button onClick={() => setProductSearch('')} className="text-purple-600 text-sm font-semibold hover:underline">
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map(p => (
                    <Link
                      key={p.productId}
                      href={`/products/${p.productId}`}
                      className="group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all overflow-hidden flex flex-col"
                    >
                      <div className="aspect-square bg-gray-50 overflow-hidden">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt={p.productName}
                            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={32} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex flex-col flex-1">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">{p.productName}</p>
                        {p.categoryName && (
                          <span className="text-[10px] text-gray-400 font-medium mb-auto">{p.categoryName}</span>
                        )}
                        <div className="flex items-center gap-1 mt-2">
                          <NairaIcon size={13} />
                          <span className="text-base font-black text-purple-700">{formatNaira(p.price).replace('₦', '')}</span>
                        </div>
                        {p.stockQuantity === 0 && (
                          <span className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">Out of stock</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {productsTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setProductsPage(p => Math.max(1, p - 1))}
                      disabled={productsPage === 1}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:border-purple-300 hover:text-purple-600 transition-all"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-500 px-2 font-medium">
                      Page {productsPage} of {productsTotalPages}
                    </span>
                    <button
                      onClick={() => setProductsPage(p => Math.min(productsTotalPages, p + 1))}
                      disabled={productsPage === productsTotalPages}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:border-purple-300 hover:text-purple-600 transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── REVIEWS TAB ──────────────────────────────────────────────── */}
        {activeTab === 'reviews' && (
          <div>
            {reviewsLoading && !reviewsData ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 space-y-2">
                    <div className="flex gap-3 items-center">
                      <SkeletonBlock className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <SkeletonBlock className="h-4 w-32" />
                        <SkeletonBlock className="h-3 w-24" />
                      </div>
                    </div>
                    <SkeletonBlock className="h-4 w-full" />
                    <SkeletonBlock className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : !reviewsData ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="font-medium">No reviews yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                    <p className="text-5xl font-black text-gray-800 mb-1">
                      {reviewsData.averageRating.toFixed(1)}
                    </p>
                    <StarRating rating={reviewsData.averageRating} size={20} />
                    <p className="text-sm text-gray-500 mt-2 font-medium">{reviewsData.totalReviews.toLocaleString()} reviews</p>
                    {/* Distribution bars */}
                    <div className="mt-5 space-y-2">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviewsData.ratingDistribution?.[star] ?? 0;
                        const pct = reviewsData.totalReviews > 0 ? (count / reviewsData.totalReviews) * 100 : 0;
                        return (
                          <button
                            key={star}
                            onClick={() => { setReviewsFilter(reviewsFilter === star ? undefined : star); setReviewsPage(1); }}
                            className={`flex items-center gap-2 w-full group rounded-lg px-1.5 py-1 transition-colors ${reviewsFilter === star ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                          >
                            <span className="text-xs font-bold text-gray-500 w-3">{star}</span>
                            <Star size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 font-medium w-6 text-right">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                    {reviewsFilter && (
                      <button
                        onClick={() => { setReviewsFilter(undefined); setReviewsPage(1); }}
                        className="mt-4 text-xs text-purple-600 font-semibold hover:underline"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: review list */}
                <div className="lg:col-span-2 space-y-4">
                  {reviewsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 space-y-2 animate-pulse">
                        <SkeletonBlock className="h-4 w-48" />
                        <SkeletonBlock className="h-3 w-full" />
                      </div>
                    ))
                  ) : reviewsData.reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
                      <MessageSquare size={32} className="mx-auto mb-2 text-gray-200" />
                      <p>No {reviewsFilter ? `${reviewsFilter}-star` : ''} reviews yet</p>
                    </div>
                  ) : (
                    reviewsData.reviews.map(review => (
                      <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-700 font-bold text-sm">
                                {review.rating}★
                              </span>
                            </div>
                            <div>
                              <StarRating rating={review.rating} size={14} />
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(review.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 mt-3 leading-relaxed">{review.comment}</p>
                        )}
                        {/* Vendor reply */}
                        {review.vendorReply && (
                          <div className="mt-3 pl-4 border-l-2 border-purple-200 bg-purple-50/50 rounded-r-xl py-2 pr-3">
                            <p className="text-xs font-bold text-purple-700 mb-0.5">Store Response</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{review.vendorReply}</p>
                            {review.vendorRepliedAt && (
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(review.vendorRepliedAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {/* Reviews pagination */}
                  {reviewsData && reviewsData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <button
                        onClick={() => setReviewsPage(p => Math.max(1, p - 1))}
                        disabled={reviewsPage === 1 || reviewsLoading}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:border-purple-300 hover:text-purple-600 transition-all"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-500 px-2 font-medium">
                        {reviewsPage} / {reviewsData.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setReviewsPage(p => Math.min(reviewsData.pagination.totalPages, p + 1))}
                        disabled={reviewsPage === reviewsData.pagination.totalPages || reviewsLoading}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:border-purple-300 hover:text-purple-600 transition-all"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STORE INFO TAB ────────────────────────────────────────────── */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policies */}
            <div className="space-y-5">
              {store.returnPolicy && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <RefreshCw size={16} className="text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Return Policy</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{store.returnPolicy}</p>
                </div>
              )}
              {store.shippingPolicy && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Truck size={16} className="text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Shipping Policy</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{store.shippingPolicy}</p>
                </div>
              )}
            </div>

            {/* Contact + Shipping checker */}
            <div className="space-y-5">
              {/* Contact Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {store.storeEmail && (
                    <a
                      href={`mailto:${store.storeEmail}`}
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <Mail size={15} className="text-purple-600" />
                      </div>
                      <span>{store.storeEmail}</span>
                      <ExternalLink size={12} className="ml-auto text-gray-300" />
                    </a>
                  )}
                  {store.storePhone && (
                    <a
                      href={`tel:${store.storePhone}`}
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <Phone size={15} className="text-purple-600" />
                      </div>
                      <span>{store.storePhone}</span>
                      <ExternalLink size={12} className="ml-auto text-gray-300" />
                    </a>
                  )}
                  {!store.storeEmail && !store.storePhone && (
                    <p className="text-sm text-gray-400">No contact information available.</p>
                  )}
                </div>
              </div>

              {/* Shipping Options Checker */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <MapPin size={15} className="text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Shipping to Your State</h3>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shippingState}
                    onChange={e => setShippingState(e.target.value)}
                    placeholder="Enter your state (e.g. Lagos)"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                  <button
                    onClick={fetchShipping}
                    disabled={shippingLoading}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {shippingLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Truck size={14} />
                    )}
                    Check
                  </button>
                </div>

                {/* Shipping result */}
                {shippingResult && (
                  <div className="mt-4">
                    {!shippingResult.vendorShipsToState ? (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700 font-medium flex items-center gap-2">
                        <AlertTriangle size={15} />
                        {shippingResult.message || `This store doesn't ship to ${shippingState}.`}
                      </div>
                    ) : (
                      <div className="space-y-2 mt-1">
                        <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <BadgeCheck size={13} /> Ships to {shippingState}
                        </p>
                        {(shippingResult.shippingOptions ?? []).map((opt, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{opt.methodName}</p>
                              <p className="text-xs text-gray-400">{opt.estimatedDays}</p>
                              {opt.freeShippingThreshold != null && (
                                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                  Free shipping above {formatNaira(opt.freeShippingThreshold)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 text-purple-700 font-black text-sm">
                              <NairaIcon size={12} />
                              {formatNaira(opt.price).replace('₦', '')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
