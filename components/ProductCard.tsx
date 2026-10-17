'use client';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, MapPin, Plus } from 'lucide-react';
import { useAppDispatch, useWishlist, useAppSelector } from '@/lib/hooks';
import { addWishlistItem, removeWishlistItem } from '@/lib/features/wishlist/wishlistSlice';
import { openNoteModal } from '@/lib/features/cart/cartSlice';
import toast from 'react-hot-toast';

type ProductCardProps = {
  id: string;
  image?: string | StaticImageData;
  category?: string;
  subcategory?: string;
  title: string;
  rating?: number;
  author?: string;
  storeName: string;
  storeSlug: string;
  price: number | { amount: number; currency?: string };
  originalPrice?: number | { amount: number; currency?: string };
  currency?: string;
  href?: string;
  location?: string | { town?: string; state?: string; lga?: string };
};

export default function ProductCard({
  id,
  image = '/placeholder.png',
  category,
  subcategory,
  title,
  rating = 4.2,
  author,
  storeName,
  storeSlug,
  price,
  originalPrice,
  currency = '₦',
  href = '#',
  location = 'Lagos',
}: ProductCardProps) {
  const sellerName = storeName || author || 'Faflora Store';
  const locationStr = typeof location === 'object' && location !== null
    ? (location.state || location.town || location.lga || 'Lagos')
    : (typeof location === 'string' && location.includes(',') ? location.split(',').pop()?.trim() || location : (location || 'Lagos'));
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const wishlistItems = useWishlist();
  const isWishlisted = wishlistItems.includes(id);

  const activeProductIds = useAppSelector((state) => state.cart.activeProductIds);
  const savedProductIds = useAppSelector((state) => state.cart.savedProductIds);
  const isActiveInCart = activeProductIds.includes(id);
  const isSavedInCart = savedProductIds.includes(id);

  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  const priceVal = typeof price === 'object' && price !== null ? (price as any).amount : (price ?? 0);
  const originalPriceVal = typeof originalPrice === 'object' && originalPrice !== null ? (originalPrice as any).amount : originalPrice;

  const discount = originalPriceVal
    ? Math.round(((originalPriceVal - priceVal) / originalPriceVal) * 100)
    : 0;

  return (
    <div className="pc-card">
      <Link href={href} className="pc-card-link-wrapper block">
        <div className="pc-image-wrap">
          <div className="pc-image-inner">
            <Image
              src={image}
              alt={title}
              className="pc-image"
              width={260}
              height={260}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      </Link>

      <div className="pc-body">
        {(category || subcategory) && (
          <div className="pc-category">
            {category}{subcategory ? ` › ${subcategory}` : ''}
          </div>
        )}

        <h3 className="pc-title" title={title}>
          <Link href={href} className="hover:text-[#9d4ae3] transition-colors">{title}</Link>
        </h3>

        <div className="pc-rating-row">
          <div className="pc-stars-container">
            <div className="pc-stars" aria-label={`Rating ${rating} out of 5`}>
              {Array.from({ length: fullStars }).map((_, i) => (
                <svg
                  key={'f' + i}
                  viewBox="0 0 24 24"
                  className="star star-filled"
                >
                  <path d="M12 .587l3.668 7.431L23 9.75l-5.5 5.357L18.834 24 12 19.897 5.166 24l1.334-8.893L1 9.75l7.332-1.732z" />
                </svg>
              ))}
              {halfStar && (
                <svg viewBox="0 0 24 24" className="star star-half">
                  <defs>
                    <linearGradient id="halfGrad">
                      <stop offset="50%" stopColor="#fb923c" />
                      <stop offset="50%" stopColor="#e6e6e6" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#halfGrad)"
                    d="M12 .587l3.668 7.431L23 9.75l-5.5 5.357L18.834 24 12 19.897 5.166 24l1.334-8.893L1 9.75l7.332-1.732z"
                  />
                </svg>
              )}
              {Array.from({ length: emptyStars }).map((_, i) => (
                <svg
                  key={'e' + i}
                  viewBox="0 0 24 24"
                  className="star star-empty"
                >
                  <path d="M12 .587l3.668 7.431L23 9.75l-5.5 5.357L18.834 24 12 19.897 5.166 24l1.334-8.893L1 9.75l7.332-1.732z" />
                </svg>
              ))}
            </div>
            <span className="pc-rating-num">({rating})</span>
          </div>
          
          <div className="pc-location">
            <MapPin size={12} className="pc-location-icon" />
            <span>{locationStr}</span>
          </div>
        </div>

        <div className="pc-author-section">
          <span className="pc-seller-badge">Sold by</span>
          <span className="pc-author font-bold text-[#9d4ae3]">{sellerName}</span>
        </div>

        <div className="pc-price-row">
          <div className="pc-price">
            <span className="pc-current">
              {currency}
              {priceVal.toLocaleString()}
            </span>
            {originalPriceVal && originalPriceVal > priceVal && (
              <span className="pc-original">
                {currency}
                {originalPriceVal.toLocaleString()}
              </span>
            )}
          </div>
          
          <button 
            className="pc-add-cart-btn"
            disabled={isActiveInCart || isSavedInCart}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isActiveInCart || isSavedInCart) return;
              dispatch(openNoteModal({ productId: id, quantity: 1 }));
            }}
          >
            <Plus size={16} />
            <span>
              {isActiveInCart ? 'Added' : isSavedInCart ? 'Saved' : 'Add'}
            </span>
          </button>
        </div>
      </div>

      <button 
        className={`pc-wishlist-btn ${isWishlisted ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isAuthenticated) {
            toast.error('Please log in to manage your wishlist');
            return;
          }
          if (isWishlisted) {
            dispatch(removeWishlistItem(id));
          } else {
            dispatch(addWishlistItem(id));
          }
        }}
        aria-label="Add to wishlist"
      >
        <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>

      <style jsx>{`
        .pc-card {
          display: flex;
          flex-direction: column;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          text-decoration: none;
          color: inherit;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, box-shadow;
          position: relative;
          height: 100%;
          border: 1px solid rgba(157, 74, 227, 0.1);
        }

        .pc-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 40px rgba(157, 74, 227, 0.15);
          border-color: rgba(157, 74, 227, 0.3);
        }

        .pc-image-wrap {
          background: linear-gradient(135deg, #f8fafb 0%, #f3ecfc 100%);
          height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .pc-image-inner {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .pc-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 0;
        }

        .pc-card:hover .pc-image {
          transform: scale(1.12) rotate(2deg);
        }

        /* Discount Badge */
        .pc-discount-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #9d4ae3 0%, #8236be 100%);
          color: white;
          border-radius: 12px;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          font-weight: 700;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(157, 74, 227, 0.3);
          min-width: 52px;
        }

        .pc-discount-text {
          font-size: 14px;
          line-height: 1;
        }

        .pc-discount-label {
          font-size: 9px;
          letter-spacing: 0.5px;
        }

        /* Wishlist Button */
        .pc-wishlist-btn {
          position: absolute;
          bottom: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: 1.5px solid #9d4ae3;
          color: #9d4ae3;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
        }

        .pc-wishlist-btn:hover {
          background: #9d4ae3;
          color: white;
          transform: scale(1.1);
        }

        .pc-wishlist-btn:active {
          transform: scale(0.95);
        }

        .pc-add-cart-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f3ecfc;
          color: #9d4ae3;
          border: none;
          padding: 6px 14px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #f3ecfc;
        }

        .pc-add-cart-btn:hover {
          background: #9d4ae3;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(157, 74, 227, 0.2);
        }

        .pc-add-cart-btn:disabled {
          background: #f3f4f6;
          color: #9ca3af;
          border-color: #e5e7eb;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .pc-add-cart-btn:active {
          transform: translateY(0);
        }

        /* Quick View */
        .pc-quick-view {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #9d4ae3 0%, #8236be 100%);
          color: white;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }

        .pc-card:hover .pc-quick-view {
          opacity: 1;
          transform: translateY(0);
        }

        /* Body */
        .pc-body {
          padding: 10px 16px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-grow: 1;
        }

        .pc-category {
          font-size: 11px;
          color: #9d4ae3;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 4px;
        }

        .pc-title {
          font-size: 15px;
          margin: 0;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.3s ease;
        }

        .pc-card:hover .pc-title {
          color: #9d4ae3;
        }

        /* Rating */
        .pc-rating-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin: 6px 0;
          flex-wrap: wrap;
        }

        .pc-stars-container {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pc-rating-num {
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
        }

        .pc-location {
          display: flex;
          align-items: flex-start;
          gap: 3px;
          font-size: 11px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
          flex-wrap: wrap;
          word-break: break-word;
          flex-shrink: 1;
          min-width: 0;
        }

        .pc-location-icon {
          color: #9d4ae3;
          flex-shrink: 0;
        }

        .pc-stars {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .star {
          width: 13px;
          height: 13px;
        }

        .star-filled path {
          fill: #fb923c;
        }

        .star-half path {
          fill: url(#halfGrad);
        }

        .star-empty path {
          fill: #e5e7eb;
        }

        /* Author/Seller Section */
        .pc-author-section {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          margin: 4px 0;
        }

        .pc-seller-badge {
          color: #9ca3af;
          font-weight: 500;
        }

        .pc-author {
          color: #9d4ae3;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .pc-card:hover .pc-author {
          color: #8236be;
        }

        /* Price Row */
        .pc-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-top: auto;
          padding-top: 4px;
          flex-wrap: wrap;
        }

        .pc-price {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pc-current {
          font-size: 18px;
          font-weight: 800;
          color: #9d4ae3;
          letter-spacing: -0.3px;
        }

        .pc-original {
          font-size: 12px;
          color: #9ca3af;
          text-decoration: line-through;
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .pc-card {
            border-radius: 12px;
          }

          .pc-image-wrap {
            height: 160px;
          }

          .pc-body {
            padding: 10px;
            gap: 5px;
          }

          .pc-title {
            font-size: 12px;
          }

          .pc-category {
            font-size: 9px;
            margin-bottom: 2px;
          }

          .pc-current {
            font-size: 13px;
          }

          .pc-original {
            font-size: 10px;
          }

          .pc-author-section {
            font-size: 10px;
          }

          .pc-stars {
            gap: 2px;
          }

          .star {
            width: 10px;
            height: 10px;
          }

          .pc-rating-num {
            font-size: 10px;
          }

          .pc-location {
            font-size: 10px;
            padding: 2px 4px;
            word-break: break-word;
          }

          .pc-add-cart-btn {
            padding: 5px 10px;
            font-size: 11px;
          }

          .pc-wishlist-btn {
            width: 32px;
            height: 32px;
          }
        }

        @media (max-width: 480px) {
          .pc-image-wrap {
            height: 140px;
          }

          .pc-body {
            padding: 9px;
            gap: 4px;
          }

          .pc-title {
            font-size: 11px;
          }

          .pc-current {
            font-size: 12px;
          }

          .pc-add-cart-btn {
            padding: 4px 8px;
            font-size: 10px;
          }

          .pc-wishlist-btn {
            width: 28px;
            height: 28px;
          }
        }

        @media (max-width: 320px) {
          .pc-card {
            border-radius: 10px;
          }

          .pc-image-wrap {
            height: 160px;
          }

          .pc-body {
            padding: 10px;
            gap: 4px;
          }

          .pc-title {
            font-size: 11px;
          }

          .pc-current {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
