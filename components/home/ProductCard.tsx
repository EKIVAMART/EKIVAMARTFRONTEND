'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppDispatch, useAppSelector, useWishlist } from '@/lib/hooks';
import { addWishlistItem, removeWishlistItem } from '@/lib/features/wishlist/wishlistSlice';
import { openNoteModal } from '@/lib/features/cart/cartSlice';
// Import the API action for direct add to cart
import { addItemToCartApi } from '@/lib/features/cart/cartSlice';
import toast from 'react-hot-toast';

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

/** 12-point rosette/star-burst discount badge on top-right, floating over border */
function RosetteBadge({ percent }: { percent: number }) {
  return (
    <div className="absolute -top-2.5 -right-2.5 z-20 flex h-10 w-10 items-center justify-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)]">
        <path
          fill="#ff3b30"
          d="M50 0 L58 12 L71 5 L74 19 L88 17 L85 30 L97 34 L89 46 L98 56 L86 63 L91 76 L78 78 L78 91 L65 89 L60 100 L48 93 L38 100 L32 89 L19 91 L20 78 L7 76 L13 63 L1 56 L10 46 L2 34 L14 30 L11 17 L25 19 L28 5 L41 12 Z"
        />
      </svg>
      <span className="relative z-10 text-[9px] font-bold text-white">-{percent}%</span>
    </div>
  );
}

export interface LandingProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  location: string;
  vendor: string;
  storeName: string;
  href?: string;
}

interface ProductCardProps {
  product: LandingProduct;
  isMobile?: boolean;
}

export default function ProductCard({ product, isMobile = false }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const wishlistItems = useWishlist();
  const isWishlisted = wishlistItems.includes(product.id);

  const activeProductIds = useAppSelector((state) => state.cart.activeProductIds);
  const savedProductIds = useAppSelector((state) => state.cart.savedProductIds);
  const isActiveInCart = activeProductIds.includes(product.id);
  const isSavedInCart = savedProductIds.includes(product.id);

  const productHref = product.href ?? `/products/${product.id}`;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to manage your wishlist');
      return;
    }
    if (isWishlisted) {
      dispatch(removeWishlistItem(product.id));
    } else {
      dispatch(addWishlistItem(product.id));
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isActiveInCart || isSavedInCart) return;
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      return;
    }
    
    // dispatch(openNoteModal({ productId: product.id, quantity: 1 }));
    
    // direct add to cart with no note modal
    dispatch(addItemToCartApi({ productId: product.id, quantity: 1 }));
    toast.success('Added to cart!');
  };

  return (
    <Link
      href={productHref}
      className="group flex w-full h-full sm:w-52 sm:h-[415px] sm:shrink-0 flex-col rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm hover:shadow-md hover:scale-103 transition-shadow duration-200 relative"
    >
      {/* Image container — no overflow-hidden so the rosette badge overflows beautifully */}
      <div className="relative mb-2.5 aspect-square rounded-xl bg-neutral-50 border border-neutral-100/50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="208px"
          className="object-cover rounded-xl"
        />

        {/* Rosette discount badge — conditionally shown only if discount exists */}
        {product.discountPercent ? (
          <RosetteBadge percent={product.discountPercent} />
        ) : null}
      </div>

      {/* Wishlist Button Row — between image and product name, aligned right */}
      <div className="flex justify-end mb-1">
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`flex h-7 w-7 items-center justify-center rounded-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 hover:border-brand-600 transition-all duration-200 ${
            isWishlisted ? 'text-brand-600 border-brand-400' : 'text-neutral-400 hover:text-brand-600'
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isWishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-200"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Product Name */}
      <p className="mb-1 text-xs sm:text-sm font-medium text-neutral-600 group-hover:text-brand-600 transition-colors duration-200 h-12 line-clamp-2 overflow-hidden leading-tight">
        {product.name}
      </p>

      {/* Pricing — only show compareAtPrice if it exists and is greater than price */}
      <div className="mb-1 flex items-baseline gap-1.5 flex-wrap">
        <span className="text-sm sm:text-base font-bold text-neutral-800">{formatNaira(product.price)}</span>
        {product.compareAtPrice && product.compareAtPrice > product.price ? (
          <span className="text-xs text-neutral-400 line-through">
            {formatNaira(product.compareAtPrice)}
          </span>
        ) : null}
      </div>

      {/* Rating (5 Stars) */}
      <div className="mb-1 flex items-center gap-0.5 text-xs text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-neutral-500 font-medium ml-1">
          {product.rating} ({product.reviewCount})
        </span>
      </div>

      {/* Location & Vendor */}
      <div className="mb-2.5 flex items-start gap-1.1 text-[11px] text-neutral-500">
        <Image src="/icons/location.png" alt="" width={14} height={14} className="shrink-0 mt-px mr-1" />
        <span className="flex-1 break-words">
          {typeof product.location === 'object' && product.location !== null
            ? ((product.location as any).state || 'Lagos')
            : typeof product.location === 'string' && product.location.includes(',')
            ? product.location.split(',').pop()?.trim() || product.location
            : (product.location || 'Lagos')}
        </span>
        <span className="rounded break-words bg-purple-100 px-1 py-0.5 text-[10px] font-bold text-purple-700 shrink-0 max-w-[45%]">
          {product.storeName || product.vendor}
        </span>
      </div>

      {/* Add to Cart Button */}
      <button
        type="button"
        disabled={isActiveInCart || isSavedInCart}
        onClick={handleAddToCart}
        className="mt-auto w-full rounded bg-brand-600 hover:bg-brand-700 active:bg-brand-800 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isActiveInCart ? 'Added to Cart' : isSavedInCart ? 'Saved' : 'Add to cart'}
      </button>
    </Link>
  );
}