'use client';
import { Heart as ProductHeart, Star as ProductStar } from '@/components/ui/platform-icons';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Store } from '@/components/ui/platform-icons';
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
    <span className="ek-discount">−{percent}%</span>
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
      className="ek-product-card group flex w-full h-full sm:w-52 sm:h-[415px] sm:shrink-0 flex-col border bg-white relative"
    >
      {/* Image container — no overflow-hidden so the rosette badge overflows beautifully */}
      <div className="relative mb-3.5 aspect-square rounded-xl bg-neutral-50 border border-neutral-100/50">
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

        {/* Wishlist Button — Positioned at bottom-right over the image */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute bottom-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 hover:bg-white border border-neutral-200/80 hover:border-brand-600 shadow-sm transition-all duration-200 ${
            isWishlisted ? 'text-brand-600 border-brand-400' : 'text-neutral-500 hover:text-brand-600'
          }`}
        >
          <ProductHeart size={14} weight={isWishlisted ? "fill" : "duotone"} className="transition-colors duration-200" aria-hidden="true" />
        </button>
      </div>

      {/* Product Name */}
      <p className="mb-1 text-xs sm:text-sm font-medium text-neutral-600 group-hover:text-brand-600 transition-colors duration-200 h-13 line-clamp-2 overflow-hidden leading-tight">
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
          <ProductStar key={i} className="w-3.5 h-3.5" weight="fill" aria-hidden="true" />
        ))}
        <span className="text-neutral-500 font-medium ml-1">
          {product.rating} ({product.reviewCount})
        </span>
      </div>

      {/* Location & Vendor */}
      <div className="mb-3 grid min-w-0 gap-1 text-[11px] leading-4 text-stone-600">
        {(product.storeName || product.vendor) && (
          <span className="flex min-w-0 items-baseline gap-1.5 font-medium text-stone-700">
            <Store size={13} strokeWidth={1.5} aria-hidden="true" className="shrink-0 self-start mt-px" />
            <span className="min-w-0 break-words"><span className="sr-only">Sold by </span>{product.storeName || product.vendor}</span>
          </span>
        )}
        <span className="flex items-baseline gap-1.5">
          <MapPin size={13} strokeWidth={1.5} aria-hidden="true" className="shrink-0 self-start mt-px" />
          {typeof product.location === 'object' && product.location !== null
            ? ((product.location as any).state || 'Lagos')
            : typeof product.location === 'string' && product.location.includes(',')
            ? product.location.split(',').pop()?.trim() || product.location
            : (product.location || 'Lagos')}
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
