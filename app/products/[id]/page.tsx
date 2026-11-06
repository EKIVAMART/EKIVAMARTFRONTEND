'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronLeft, ChevronRight, ShoppingCart, Star, HelpCircle, Package, ArrowLeft, MapPin } from 'lucide-react';
import { useAppDispatch, useWishlist, useAppSelector } from '@/lib/hooks';
// import { openNoteModal } from '@/lib/features/cart/cartSlice';
// NEW - import addItemToCartApi
import { addItemToCartApi } from '@/lib/features/cart/cartSlice';
import { addWishlistItem, removeWishlistItem, fetchWishlistCount, setWishlistItemStatus } from '@/lib/features/wishlist/wishlistSlice';
import { productApi, categoryApi, wishlistApi, cartApi, reviewsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import './product-details.css';

interface Rating {
  id: string;
  rating: number;
  review: string;
  user: {
    name: string;
    image: string;
  };
  productId: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number;
  discount?: number;
  preview?: string;
  description: string;
  origin?: string;
  brand?: string;
  images?: Array<{ url: string; altText: string; isPrimary: boolean; order: number }>;
  category?: { id: string; name: string } | string;
  categoryId: string;
  store?: { id: string; name: string; logo?: string };
  storeId?: string;
  storeName?: string;
  storeSlug?: string;
  location?: string | { town?: string; state?: string; lga?: string };
  rating?: Rating[];
  stock: number | { quantity: number };
  sku?: string;
  metadata?: Record<string, any>;
  returnWindow?: number;
  returnShipping?: string;
  warrantyPeriod?: string;
}

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const wishlistItems = useWishlist();
  const isWishlisted = wishlistItems.includes(id);

  // Fetch wishlist count on mount so the header badge is always in sync
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlistCount());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      const checkStatus = async () => {
        try {
          const res = await wishlistApi.checkWishlistItem(id);
          if (res?.success && res.data) {
            dispatch(setWishlistItemStatus({ productId: id, isSaved: !!res.data.isSaved }));
          }
        } catch (err) {
          console.error('Failed to check product wishlist status:', err);
        }
      };
      void checkStatus();
    }
  }, [id, isAuthenticated, dispatch]);

  const [cartStatus, setCartStatus] = useState<'active' | 'saved_for_later' | 'not_in_cart'>('not_in_cart');

  useEffect(() => {
    if (isAuthenticated) {
      const checkCartStatus = async () => {
        try {
          const res = await cartApi.checkCartItem(id);
          if (res?.success && res.data) {
            setCartStatus(res.data.status);
          }
        } catch (err) {
          console.error('Failed to check product cart status:', err);
        }
      };
      void checkCartStatus();
    }
  }, [id, isAuthenticated]);

  const activeProductIds = useAppSelector((state) => state.cart.activeProductIds);
  const savedProductIds = useAppSelector((state) => state.cart.savedProductIds);
  const isActiveInCart = activeProductIds.includes(id) || cartStatus === 'active';
  const isSavedInCart = savedProductIds.includes(id) || cartStatus === 'saved_for_later';

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [categorySlug, setCategorySlug] = useState<string>('all');
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [activeTab, setActiveTab] = useState<'description' | 'additional' | 'reviews'>('description');

  // Load product details
  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        const res = await productApi.getProductById(id);
        let prod: Product | null = null;
        if (res?.data) {
          prod = res.data;
        } else if (res) {
          prod = res as any;
        }

        if (isMounted && prod) {
          setProduct(prod);

          // Get category slug for breadcrumbs
          let catName = '';
          if (prod.category && typeof prod.category === 'object') {
            catName = prod.category.name;
          } else if (typeof prod.category === 'string') {
            catName = prod.category;
          }
          if (catName) {
            const slugVal = catName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            setCategorySlug(slugVal);
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);



  // Fetch product reviews for the Reviews tab
  useEffect(() => {
    if (!product) return;
    let isMounted = true;
    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await reviewsApi.listByProduct(product.id, { limit: 10 });
        const list = res?.data || res?.data?.data || [];
        if (!isMounted) return;
        setProductReviews(Array.isArray(list) ? list : []);
      } catch (err) {
        // ignore and leave reviews empty
      } finally {
        if (isMounted) setReviewsLoading(false);
      }
    };
    void loadReviews();
    return () => { isMounted = false; };
  }, [product]);

  // Load related products
  useEffect(() => {
    if (!product) return;

    let isMounted = true;
    const fetchRelated = async () => {
      setRelatedLoading(true);
      try {
        const catId = typeof product.category === 'object' ? product.category?.id : product.categoryId;
        const res = await productApi.getAllProducts({
          categoryId: catId,
          status: 'active',
          limit: 10,
        });

        let list: Product[] = [];
        if (res?.data && Array.isArray(res.data)) {
          list = res.data;
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
          list = res.data.data;
        } else if (res?.data?.products && Array.isArray(res.data.products)) {
          list = res.data.products;
        }

        // Filter out current product
        const filtered = list.filter((p) => p.id !== product.id).slice(0, 4);

        if (isMounted) {
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
      } finally {
        if (isMounted) setRelatedLoading(false);
      }
    };
    void fetchRelated();
    return () => {
      isMounted = false;
    };
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-not-found">
        <div className="pd-not-found-content">
          <h1>Product Not Found</h1>
          <p>Sorry, the product you&apos;re looking for doesn&apos;t exist or is no longer available.</p>
          <Link href="/" className="pd-btn-primary mt-4 inline-flex">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const priceVal = typeof product.price === 'object' && product.price !== null ? (product.price as any).amount : (product.price ?? 0);
  const mrpVal = typeof product.compareAtPrice === 'object' && product.compareAtPrice !== null ? (product.compareAtPrice as any).amount : (product.compareAtPrice ?? priceVal);
  const discount = mrpVal > priceVal ? Math.round(((mrpVal - priceVal) / mrpVal) * 100) : 0;

  // Calculate average rating
  const avgRating = product.rating?.length
    ? product.rating.reduce((sum, r) => sum + r.rating, 0) / product.rating.length
    : 4.5;

  const parseMarkdownToHtml = (markdown: string) => {
    if (!markdown) return '';
    let escaped = markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped
      .replace(/^### (.*?)$/gm, '<h3 class="text-base font-bold my-2 text-gray-900">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold my-3 text-gray-900">$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold my-4 text-gray-900">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/^\s*[\*\-]\s+(.*?)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br />');
  };

  const images = product.images && product.images.length > 0
    ? product.images.map((img) => img.url)
    : ['/placeholder.png'];

  // Normalise stock to a number
  const stockQty = typeof product.stock === 'object' && product.stock !== null
    ? (product.stock as any).quantity ?? 0
    : (product.stock ?? 0);

  const locationStr = typeof product.location === 'object' && product.location !== null
    ? (product.location.state || product.location.town || product.location.lga || '')
    : (typeof product.location === 'string' && product.location.includes(',') ? product.location.split(',').pop()?.trim() || product.location : (product.location || ''));

  // Derive available sizes from metadata; hide selector when none
  const sizes: string[] = (() => {
    const raw = product.metadata?.sizes || product.metadata?.size || product.metadata?.availableSizes;
    if (Array.isArray(raw)) return raw.map(String);
    if (typeof raw === 'string') return raw.split(',').map((s: string) => s.trim()).filter(Boolean);
    return [];
  })();

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || 'Shop');
  const storeName = product.store?.name || product.storeId || 'EkivaMart Store';

  // Format metadata keys for technical specifications table
  const metadataRows = Object.entries(product.metadata || {}).filter(([key]) => {
    const skipKeys = ['weight', 'weightUnit', 'dimensions', 'width', 'height', 'length', 'size', 'color', 'condition'];
    return !skipKeys.includes(key);
  });

  // NEW: Handle add to cart with direct dispatch, skipping note modal
  const handleAddToCart = () => {
    if (isActiveInCart || isSavedInCart) return;
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      return;
    }
    if (stockQty <= 0) {
      toast.error('This product is out of stock');
      return;
    }

    // dispatch(openNoteModal({ productId: product.id, quantity }));

    // direct add to cart with no note modal
    dispatch(addItemToCartApi({ productId: product.id, quantity }));
    toast.success('Added to cart!');
  };

  return (
    <div className="pd-container px-5 sm:px-8 md:px-12 lg:px-16 py-8">
      {/* Breadcrumb */}
      <div className="pd-breadcrumb text-xs sm:text-sm">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/categories/${categorySlug}`}>{categoryName}</Link>
        <span>/</span>
        <span className="pd-breadcrumb-current">{product.name}</span>
      </div>

      {/* Main Content */}
      <div className="pd-main">
        {/* Left Side - Images */}
        <div className="pd-images-section">
          <div className="pd-main-image-wrapper">
            <div className="pd-main-image">
              <img
                src={images[selectedImage] || images[0]}
                alt={product.name}
                className="max-h-[90%] max-w-[90%] object-contain"
              />
              {discount > 0 && (
                <div className="pd-discount-badge">
                  {discount}% <br /> Off
                </div>
              )}
            </div>

            {images.length > 1 && (
              <>
                <button
                  className="pd-nav-arrow pd-nav-prev"
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className="pd-nav-arrow pd-nav-next"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="pd-thumbnails">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`pd-thumbnail ${idx === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Product Details */}
        <div className="pd-details-section">
          <div className="pd-info">
            {/* Category tag */}
            <span className="text-xs font-bold text-[#228b22] uppercase tracking-wider">
              {categoryName}
            </span>

            <h1 className="pd-title">{product.name}</h1>

            {/* Rating */}
            <div className="pd-rating-section">
              <div className="pd-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={`pd-star ${i < Math.floor(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="pd-review-count">
                ({product.rating?.length || 10} reviews)
              </span>
            </div>

            {/* Price section */}
            <div className="pd-price-section">
              <div className="pd-price-wrapper">
                <span className="pd-current-price">
                  ₦ {priceVal.toLocaleString()}
                </span>
                {mrpVal > priceVal && (
                  <>
                    <span className="pd-original-price">
                      ₦ {mrpVal.toLocaleString()}
                    </span>
                    <span className="pd-discount-percent">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Preview description */}
            {product.preview && (
              <p className="text-sm sm:text-base font-semibold text-gray-700 bg-purple-50/50 p-3.5 rounded-lg border border-purple-100">
                {product.preview}
              </p>
            )}

            {/* Specs row */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs sm:text-sm">
              <div>
                <span className="text-gray-400 block font-medium uppercase tracking-wider mb-0.5 text-[10px] sm:text-xs">Availability</span>
                <span className={`font-bold text-sm sm:text-base ${stockQty > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {stockQty > 0 ? `In Stock (${stockQty} units)` : 'Out of stock'}
                </span>
              </div>
              {product.brand && (
                <div>
                  <span className="text-gray-400 block font-medium uppercase tracking-wider mb-0.5 text-[10px] sm:text-xs">Brand</span>
                  <span className="font-bold text-gray-800 text-sm sm:text-base">{product.brand}</span>
                </div>
              )}
              {product.origin && (
                <div>
                  <span className="text-gray-400 block font-medium uppercase tracking-wider mb-0.5 text-[10px] sm:text-xs">Origin</span>
                  <span className="font-bold text-gray-800 text-sm sm:text-base">{product.origin}</span>
                </div>
              )}
              {locationStr && (
                <div className="col-span-2 border-t border-gray-200/50 pt-2.5 mt-1 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#228b22] shrink-0" />
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs">Location:</span>
                  <span className="font-bold text-gray-800 text-xs sm:text-sm">{locationStr}</span>
                </div>
              )}
            </div>

            {/* Size selection — only shown when product has defined sizes */}
            {sizes.length > 0 && (
              <div className="pd-size-section">
                <span className="pd-section-label">Select Size</span>
                <div className="pd-size-options">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`pd-size-btn ${selectedSize === size ? 'active' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dimensions and weights display if available in metadata */}
            {(() => {
              const meta = product.metadata;
              if (!meta) return null;
              const hasWeight = Number(meta.weight) > 0;
              const hasDims = meta.width && meta.height;
              if (!hasWeight && !hasDims) return null;
              return (
                <div className="flex flex-wrap gap-3 py-1">
                  {hasWeight && (
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700">
                      <span>Weight:</span>
                      <span>{meta.weight} {meta.weightUnit || 'kg'}</span>
                    </div>
                  )}
                  {hasDims && (
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700">
                      <span>Dimensions:</span>
                      <span>{meta.length || 0} x {meta.width} x {meta.height} {meta.dimensionUnit || 'cm'}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="pd-actions-section">
              <div className="pd-quantity-selector">
                <button
                  className="pd-qty-btn"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  className="pd-qty-input"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  aria-label="Quantity"
                  min="1"
                />
                <button
                  className="pd-qty-btn"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                className={`pd-btn-primary pd-btn-add-to-cart ${(isActiveInCart || isSavedInCart) ? 'pd-btn-readonly' : ''}`}
                onClick={handleAddToCart}
                disabled={stockQty <= 0 || isActiveInCart || isSavedInCart}
              >
                <ShoppingCart className="pd-cart-icon" />
                <span>
                  {isActiveInCart ? 'Added to Cart' : isSavedInCart ? 'Saved' : 'Add to Cart'}
                </span>
              </button>

              <button
                className={`pd-btn-wishlist ${isWishlisted ? 'active' : ''}`}
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Please log in to manage your wishlist');
                    return;
                  }
                  if (isWishlisted) {
                    dispatch(removeWishlistItem(product.id));
                  } else {
                    dispatch(addWishlistItem(product.id));
                  }
                }}
                aria-label="Add to wishlist"
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>



          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="pd-tabs-section shadow-sm">
        <div className="pd-tabs-header">
          <button
            className={`pd-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={`pd-tab-btn ${activeTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveTab('additional')}
          >
            Additional Details
          </button>
          <button
            className={`pd-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({productReviews.length || product.rating?.length || 0})
          </button>
        </div>

        <div className="pd-tabs-content">
          {activeTab === 'description' && (
            <article className="pd-reading" aria-label="Product description">
              {(product.description?.trim() || 'No description provided.').split(/\n\s*\n/).map((block, index) => (
                <div key={index} dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(block.trim()) }} />
              ))}
            </article>
          )}

          {activeTab === 'additional' && (
            <div className="pd-tab-pane animate-fade">
              <div className="pd-info-table border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                {product.returnWindow !== undefined && (
                  <div className="pd-info-row">
                    <span className="pd-info-label">Return Window</span>
                    <span className="pd-info-value">{product.returnWindow} Days</span>
                  </div>
                )}
                {product.returnShipping && (
                  <div className="pd-info-row">
                    <span className="pd-info-label">Return Shipping</span>
                    <span className="pd-info-value">
                      {product.returnShipping === 'store' ? 'Paid by Store' : 'Paid by Customer'}
                    </span>
                  </div>
                )}
                {product.warrantyPeriod && (
                  <div className="pd-info-row">
                    <span className="pd-info-label">Warranty Period</span>
                    <span className="pd-info-value">
                      {product.warrantyPeriod === 'none' ? 'No Warranty' : product.warrantyPeriod}
                    </span>
                  </div>
                )}
                {/* Weight & Dimensions from metadata */}
                {product.metadata?.weight && Number(product.metadata.weight) > 0 && (
                  <div className="pd-info-row">
                    <span className="pd-info-label">Weight</span>
                    <span className="pd-info-value">{product.metadata.weight} {product.metadata.weightUnit || 'kg'}</span>
                  </div>
                )}
                {product.metadata?.width && product.metadata?.height && (
                  <div className="pd-info-row">
                    <span className="pd-info-label">Dimensions</span>
                    <span className="pd-info-value">
                      {product.metadata.length || 0} × {product.metadata.width} × {product.metadata.height} {product.metadata.dimensionUnit || 'cm'}
                    </span>
                  </div>
                )}
                {/* Custom attributes from metadata.customAttributes */}
                {product.metadata?.customAttributes &&
                  typeof product.metadata.customAttributes === 'object' &&
                  Object.keys(product.metadata.customAttributes as Record<string, unknown>).length > 0 &&
                  Object.entries(product.metadata.customAttributes as Record<string, unknown>).map(([key, val]) => (
                    <div key={key} className="pd-info-row">
                      <span className="pd-info-label capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="pd-info-value">{String(val)}</span>
                    </div>
                  ))
                }
                {/* Other non-system metadata keys */}
                {product.metadata && (() => {
                  const skipKeys = new Set([
                    'weight', 'weightUnit', 'dimensions', 'width', 'height', 'length',
                    'size', 'color', 'condition', 'returnConditions', 'warrantyDetails',
                    'customAttributes', 'colours', 'sizes', 'origin', 'dimensionUnit',
                    'sku', 'productSku',
                  ]);
                  const extraRows = Object.entries(product.metadata).filter(([k]) => !skipKeys.has(k));
                  if (extraRows.length === 0) return null;
                  return extraRows.map(([key, val]) => (
                    <div key={key} className="pd-info-row">
                      <span className="pd-info-label capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="pd-info-value">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="pd-tab-pane">
              <div className="pd-reviews-list">
                {(productReviews && productReviews.length > 0) || (product.rating && product.rating.length > 0) ? (
                  (() => {
                    const reviewsToShow: any[] = productReviews.length > 0 ? productReviews : (product.rating ?? []);
                    return reviewsToShow.map((review: any, idx: number) => (
                    <div key={review.id || idx} className="pd-review-item border border-gray-100 rounded-xl shadow-xs">
                      <div className="pd-review-header">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                          {review.user?.name ? String(review.user.name).substring(0, 2).toUpperCase() : 'UR'}
                        </div>
                        <div className="pd-review-info">
                          <h4 className="font-bold text-gray-800">{review.user?.name || review.accountName || 'Anonymous Reviewer'}</h4>
                          <div className="pd-review-rating flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < (review.rating || review.score || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="pd-review-text italic text-gray-600">"{review.review || review.comment || review.text || ''}"</p>
                    </div>
                    ));
                  })()
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Package className="mx-auto mb-2 opacity-50" size={32} />
                    <p className="italic">No reviews yet for this product. Be the first to share your experience!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="pd-related-section">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Related Products</h2>
        {relatedLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="w-full bg-white border border-gray-100 rounded-xl h-[280px] animate-pulse flex flex-col p-4 gap-3">
                <div className="w-full h-40 bg-gray-100 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mt-auto" />
              </div>
            ))}
          </div>
        ) : relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((related) => {
              const relImage = related.images && related.images.length > 0
                ? related.images[0].url
                : '/placeholder.png';
              return (
                <Link
                  key={related.id}
                  href={`/products/${related.id}`}
                  className="pd-related-item flex flex-col h-full bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
                >
                  <div className="pd-related-img bg-gray-50 flex items-center justify-center p-4 aspect-square">
                    <img
                      src={relImage}
                      alt={related.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px] mb-2">
                      {related.name}
                    </h3>
                    {(() => {
                      const relPriceVal = typeof related.price === 'object' && related.price !== null ? (related.price as any).amount : (related.price ?? 0);
                      return (
                        <p className="pd-related-price mt-auto text-[#228b22] font-extrabold text-base">
                          ₦ {relPriceVal.toLocaleString()}
                        </p>
                      );
                    })()}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 italic text-sm">No related products found in this category.</p>
        )}
      </div>
    </div>
  );
}
