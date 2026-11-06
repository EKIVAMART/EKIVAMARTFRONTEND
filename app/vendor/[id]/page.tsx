'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Search, Share, UserPlus, Calendar, Heart, MapPin, CheckCircle, ChevronDown, Plus, Monitor, Watch, Headphones, Speaker, MousePointerClick, Home, AlertCircle } from 'lucide-react';
import './vendor-details.css';
import { useAppDispatch, useAppSelector, useWishlist } from '@/lib/hooks';
import { addItemToCartApi } from '@/lib/features/cart/cartSlice';
import { addWishlistItem, removeWishlistItem } from '@/lib/features/wishlist/wishlistSlice';
import { storeApi, PublicStoreProfile } from '@/lib/api';
import toast from 'react-hot-toast';

interface VendorPageProps {
  params: Promise<{ id: string }>;
}

export default function VendorPage({ params }: VendorPageProps) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const wishlistItems = useWishlist();

  const [store, setStore] = useState<PublicStoreProfile | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [reviewsData, setReviewsData] = useState<{
    averageRating: number | null;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    reviews: any[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'reviews'>('items');
  const [activeFilter, setActiveFilter] = useState('relevance');

  // Load store profile
  useEffect(() => {
    let isMounted = true;
    const fetchStore = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await storeApi.getStoreProfile(id);
        if (!isMounted) return;
        if (res?.success && res.data) {
          setStore(res.data);
        } else {
          setLoadError('Store not found or unavailable');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setLoadError(err?.message || 'Failed to load store profile');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStore();
    return () => { isMounted = false; };
  }, [id]);

  // Load store products
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        let sortParam: any = undefined;
        if (activeFilter === 'top-sales') sortParam = 'popular';
        else if (activeFilter === 'most-recent') sortParam = 'newest';

        const res = await storeApi.getStoreProducts(id, {
          sort: sortParam,
          limit: 30,
        });
        if (!isMounted) return;
        if (res?.success && res.data) {
          const prods = (res.data as any).products || res.data;
          setProducts(Array.isArray(prods) ? prods : []);
        }
      } catch (err) {
        console.error('Failed to load store products', err);
      }
    };

    fetchProducts();
    return () => { isMounted = false; };
  }, [id, activeFilter]);

  // Load store reviews
  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        const res = await storeApi.getStoreReviews(id, { limit: 20 });
        if (!isMounted) return;
        if (res?.success && res.data) {
          setReviewsData(res.data as any);
        }
      } catch (err) {
        console.error('Failed to load store reviews', err);
      }
    };

    fetchReviews();
    return () => { isMounted = false; };
  }, [id]);

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      return;
    }
    dispatch(addItemToCartApi({ productId, quantity: 1 }));
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to manage your wishlist');
      return;
    }
    if (wishlistItems.includes(productId)) {
      dispatch(removeWishlistItem(productId));
    } else {
      dispatch(addWishlistItem(productId));
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`}
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading store details...</p>
        </div>
      </div>
    );
  }

  if (loadError || !store) {
    return (
      <div className="vp-container py-20 text-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
          <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Store Not Available</h2>
          <p className="text-gray-500 mb-6">{loadError || 'This store profile could not be found.'}</p>
          <Link href="/" className="bg-[#228b22] text-white px-6 py-2.5 rounded-xl font-bold inline-block hover:bg-[#1c711c] transition">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const storeName = store.storeName || 'Store';
  const averageRating = store.averageRating ?? reviewsData?.averageRating ?? 4.8;
  const memberSince = store.approvedAt
    ? `Started selling on EkivaMart in ${new Date(store.approvedAt).getFullYear()}`
    : 'Verified seller on EkivaMart';

  const ratingDistribution = reviewsData?.ratingDistribution || { 5: 85, 4: 10, 3: 3, 2: 1, 1: 1 };
  const totalReviewsCount = reviewsData?.totalReviews || Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

  const ratingBars = [5, 4, 3, 2, 1].map((stars) => {
    const count = ratingDistribution[stars] || 0;
    const percent = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
    return { stars, percent };
  });

  return (
    <div className="vp-container">
      {/* Header */}
      <header className="vp-header">
        <Link href="/" className="vp-back-btn">
          <ChevronLeft size={24} />
        </Link>
        <div className="vp-header-actions ml-auto">
          <button title="Search in store"><Search size={22} /></button>
          <button title="Share store" onClick={() => {
            if (navigator.share) {
              navigator.share({ title: storeName, url: window.location.href });
            } else {
              navigator.clipboard?.writeText(window.location.href);
              toast.success('Store link copied to clipboard!');
            }
          }}><Share size={22} /></button>
        </div>
      </header>

      {/* Cover Photo */}
      <div
        className="vp-cover-photo"
        style={store.storeBannerUrl ? { backgroundImage: `url(${store.storeBannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className="vp-cover-content">
          <div className="vp-title-group -mt-16">
            <h1 className="vp-brilliant-title">{storeName}</h1>
            <div className="vp-brilliant-badge">VERIFIED SELLER</div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="vp-profile">
        <div className="vp-profile-top">
          <div className="vp-avatar -top-8">
            {store.storeLogoUrl ? (
              <img src={store.storeLogoUrl} alt={storeName} className="vp-avatar-img w-full h-full object-cover rounded-full" />
            ) : (
              <span>{storeName.substring(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div className="vp-profile-actions">
            <button className="vp-follow-btn -mt-8" onClick={() => toast.success(`You are now following ${storeName}`)}>
              <UserPlus size={16} /> Follow
            </button>
          </div>
        </div>

        {store.isVacationMode && store.vacationMessage && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span><strong>Store on vacation:</strong> {store.vacationMessage}</span>
          </div>
        )}

        {store.storeDescription && (
          <p className="text-sm text-gray-600 mt-3 max-w-2xl">{store.storeDescription}</p>
        )}

        <div className="vp-stats-row">
          <span className="vp-stat-primary">★ {averageRating.toFixed(1)} Rating</span>
          <span className="vp-stat-divider">|</span>
          <span className="vp-stat-secondary">{products.length} Products</span>
          {store.storePhone && (
            <>
              <span className="vp-stat-divider">|</span>
              <span className="text-xs text-gray-500 font-medium">📞 {store.storePhone}</span>
            </>
          )}
        </div>

        <div className="vp-joined-date mt-4">
          <Calendar size={16} className="text-gray-400" />
          <span>{memberSince}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="vp-tabs">
        <button
          className={`vp-tab ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          Items ({products.length})
        </button>
        <button
          className={`vp-tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Policies
        </button>
        <button
          className={`vp-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews ({averageRating.toFixed(1)}★)
        </button>
      </div>

      {/* Tab Content */}
      <div className="vp-content">
        {activeTab === 'items' && (
          <div className="vp-items-tab">
            {/* Filters */}
            <div className="vp-filters">
              {['relevance', 'top-sales', 'most-recent'].map((filter) => (
                <button
                  key={filter}
                  className={`vp-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            {products.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                No active products currently listed in this store.
              </div>
            ) : (
              <div className="vp-product-grid">
                {products.map((product) => {
                  const price = typeof product.price === 'object' ? product.price.amount : (Number(product.price) || 0);
                  const compareAtPrice = typeof product.compareAtPrice === 'object' ? product.compareAtPrice.amount : (Number(product.compareAtPrice) || 0);
                  const discount = compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
                  const imageUrl = product.images?.[0]?.url || product.preview || product.image || '/placeholder.png';
                  const isWishlisted = wishlistItems.includes(product.id);

                  return (
                    <div key={product.id} className="vp-product-card">
                      <div className="vp-product-img-wrapper">
                        <img src={imageUrl} alt={product.name} className="vp-product-img object-cover w-full h-full" />
                        <button
                          className={`vp-wishlist-btn ${isWishlisted ? 'text-red-500' : ''}`}
                          onClick={(e) => handleWishlistToggle(product.id, e)}
                        >
                          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <div className="vp-product-details">
                        <Link href={`/products/${product.id}`} className="vp-product-name line-clamp-2">
                          {product.name}
                        </Link>
                        <div className="vp-product-rating">
                          <div className="flex">{renderStars(product.rating || 4.5)}</div>
                          <span className="vp-rating-count">{product.reviewCount || 1}</span>
                        </div>
                        <div className="vp-product-price-row">
                          {discount > 0 && <span className="vp-discount">-{discount}%</span>}
                          <span className="vp-price">₦{price.toLocaleString()}</span><span className="vp-price-decimals">.00</span>
                        </div>
                        {compareAtPrice > price && (
                          <div className="vp-list-price">List Price: ₦{compareAtPrice.toLocaleString()}</div>
                        )}
                        <div className="vp-location">
                          <MapPin size={12} />
                          <span>{typeof product.location === 'object' ? product.location?.state : (product.location || 'Nigeria')}</span>
                        </div>
                        <button
                          className="vp-add-to-cart-btn"
                          onClick={() => handleAddToCart(product.id)}
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="vp-categories-grid">
            <div className="vp-category-card col-span-full p-6 bg-white rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-800 text-base mb-2">Shipping Policy</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{store.shippingPolicy || 'Standard delivery terms apply.'}</p>
            </div>
            <div className="vp-category-card col-span-full p-6 bg-white rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-800 text-base mb-2">Return & Refund Policy</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{store.returnPolicy || 'Standard 7-day return policy applies to eligible products in their original packaging.'}</p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="vp-reviews-tab">
            <div className="vp-verified-banner">
              <CheckCircle size={16} className="text-green-600" />
              <span>All reviews are from verified purchases</span>
            </div>

            <div className="vp-rating-overview">
              <div className="vp-rating-score">
                <h2>{averageRating.toFixed(1)}</h2>
                <p>{totalReviewsCount} review(s)</p>
              </div>
              <div className="vp-rating-bars">
                {ratingBars.map((bar) => (
                  <div key={bar.stars} className="vp-rating-bar-row">
                    <div className="vp-stars-label">{renderStars(bar.stars)}</div>
                    <div className="vp-progress-bar">
                      <div className="vp-progress-fill" style={{ width: `${bar.percent}%` }}></div>
                    </div>
                    <div className="vp-percent-label">{bar.percent}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="vp-reviews-list">
              {(reviewsData?.reviews && reviewsData.reviews.length > 0) ? (
                reviewsData.reviews.map((review: any, idx: number) => (
                  <div key={idx} className="vp-review-item">
                    <div className="vp-reviewer-header">
                      <div className="vp-reviewer-avatar" style={{ backgroundColor: `hsl(${idx * 137 % 360}, 70%, 40%)` }}>
                        {(review.userName || review.user?.name || 'Customer').charAt(0)}
                      </div>
                      <div>
                        <div className="vp-reviewer-name">{review.userName || review.user?.name || 'Customer'}</div>
                        <div className="vp-review-date">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent'}</div>
                      </div>
                    </div>
                    <div className="vp-review-stars mb-1.5 flex">{renderStars(review.rating || 5)}</div>
                    <p className="vp-review-text">{review.review || review.comment || 'Great experience with this seller!'}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No written reviews yet for this store.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

