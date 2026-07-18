'use client';

import { useRef, type ReactNode } from 'react';
import type { Product } from '@/lib/data/products';
import ProductCard from './ProductCard';

interface ProductCarouselProps {
  title: string;
  products: Product[]; // capped at 10 upstream — matches the "scroll through up to 10 products" spec
  icon?: ReactNode;
  headerAccessory?: ReactNode; // e.g. the flash sale countdown
  leadingSlides?: ReactNode; // e.g. the two "Step with confidence" shoe banners in Flash Sales
  hideHeader?: boolean; // when the parent section renders its own header (e.g. Flash Sales)
}

export default function ProductCarousel({
  title,
  products,
  icon,
  headerAccessory,
  leadingSlides,
  hideHeader = false,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 224, behavior: 'smooth' });
  }

  return (
    <section className={hideHeader ? 'px-4 pb-4 pt-3 md:px-6' : 'px-4 py-6 md:px-6'}>
      {!hideHeader && (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">{title}</h2>
          </div>
          <div className="flex items-center gap-3">
            {headerAccessory}
            <a href="#" className="text-sm font-medium text-brand-600">
              View all &rsaquo;
            </a>
          </div>
        </div>
      )}

      {/* Desktop: horizontal scroll carousel */}
      <div className="relative hidden md:block">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Previous products"
          className="absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-600 shadow-brand"
        >
          &#8249;
        </button>

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide">
          {leadingSlides}
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Next products"
          className="absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-600 text-white shadow-brand"
        >
          &#8250;
        </button>
      </div>

      {/* Mobile: 2-column grid showing all products (no horizontal scroll) */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {products.map((product) => (
          <div key={product.id} className="flex flex-col rounded-xl border border-neutral-100 bg-white p-2">
            <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-neutral-100">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {product.discountPercent && (
                <span
                  className="absolute left-1 top-1 flex h-8 w-8 items-center justify-center text-[8px] font-bold text-white"
                  style={{
                    background: '#e5001e',
                    clipPath:
                      'polygon(50% 0%, 65% 15%, 85% 10%, 88% 30%, 100% 45%, 85% 58%, 88% 78%, 68% 80%, 55% 95%, 38% 85%, 18% 92%, 15% 72%, 0% 58%, 12% 42%, 8% 22%, 28% 18%)',
                  }}
                >
                  -{product.discountPercent}%
                </span>
              )}
              {/* Heart at bottom-right */}
              <button
                type="button"
                aria-label="Add to wishlist"
                className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow"
              >
                <img src="/icons/Favorite_Icon.png" alt="" width={12} height={12} aria-hidden />
              </button>
            </div>
            <p className="mb-1 line-clamp-2 text-[11px] leading-tight text-neutral-800">{product.name}</p>
            <div className="mb-0.5 flex items-baseline gap-1 flex-wrap">
              <span className="text-xs font-semibold text-neutral-900">
                ₦{product.price.toLocaleString('en-NG')}
              </span>
              {product.compareAtPrice && (
                <span className="text-[10px] text-neutral-400 line-through">
                  ₦{product.compareAtPrice.toLocaleString('en-NG')}
                </span>
              )}
            </div>
            <div className="mb-1 flex items-center gap-0.5 text-[10px] text-accent-amber">
              <span>★ {product.rating}</span>
              <span className="text-neutral-400 ml-0.5">({product.reviewCount})</span>
            </div>
            <button
              type="button"
              className="mt-auto w-full rounded-lg gradient-brand py-1.5 text-[11px] font-semibold text-white"
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
