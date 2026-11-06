/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Sparkles } from 'lucide-react';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { productApi } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchWishlist } from '@/lib/features/wishlist/wishlistSlice';
import ProductCard, { type LandingProduct } from './ProductCard';

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center max-w-14 md:w-16 bg-neutral-100 border border-neutral-200/80 px-1 py-1 min-w-11.25 sm:min-w-12.5 shadow-sm">
      <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-600 font-medium border-b border-neutral-600 pb-0.5 w-full text-center">
        {label}
      </span>
      <span className="text-sm md:text-lg font-bold text-neutral-800 pt-0.5 leading-none">
        {value}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center max-w-md mx-auto my-4">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 shadow-inner">
        <Package size={28} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-extrabold text-neutral-800 mb-1.5">
        No Flash Sale Items
      </h3>
      <p className="text-neutral-500 text-sm mb-5 leading-relaxed">
        Check back soon for exciting flash deals across all categories!
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-full border border-brand-100">
        <Sparkles size={13} className="text-brand-500 animate-pulse" />
        <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">
          New Deals Drop Daily!
        </span>
      </div>
    </div>
  );
}

// Fisher-Yates shuffle — returns a new array in random order without
// mutating the input, so the same underlying product list produces a
// different random spread of categories on every call.
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Safely unwraps the product list from whichever response shape the API
// happens to return (mirrors the same defensive unwrapping used across the
// rest of the app in ProductCarousel.tsx and the category page).
function extractList(res: any): any[] {
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
  if (res?.data?.products && Array.isArray(res.data.products))
    return res.data.products;
  if (res?.data?.docs && Array.isArray(res.data.docs)) return res.data.docs;
  if (Array.isArray(res)) return res;
  return [];
}

// Maps raw API product objects to LandingProduct format
function mapProduct(raw: any): LandingProduct {
  const primaryImg =
    raw.images?.find((img: any) => img.isPrimary)?.url ||
    raw.images?.[0]?.url ||
    raw.preview ||
    '/images/product_cover_image.png';

  const priceVal = raw.price?.amount ?? raw.price ?? 0;
  const compareAt = raw.compareAtPrice?.amount ?? raw.compareAtPrice ?? raw.mrp;
  const discountPct =
    raw.discount ??
    (compareAt && compareAt > priceVal
      ? Math.round(((compareAt - priceVal) / compareAt) * 100)
      : undefined);

  const locObj = raw.location;
  const locationStr =
    typeof locObj === 'object' && locObj !== null
      ? [locObj.town, locObj.lga, locObj.state].filter(Boolean).join(', ') ||
        'Nigeria'
      : typeof locObj === 'string'
        ? locObj
        : 'Nigeria';

  return {
    id: String(raw.id || raw._id || ''),
    name: raw.name || 'Product',
    image: primaryImg,
    price: typeof priceVal === 'number' ? priceVal : 0,
    compareAtPrice: typeof compareAt === 'number' ? compareAt : undefined,
    discountPercent:
      typeof discountPct === 'number' && discountPct > 0
        ? discountPct
        : undefined,
    rating: 4.2,
    reviewCount: 0,
    location: locationStr,
    vendor:
      raw.storeName || raw.store?.name || raw.vendor?.name || 'EkivaMart Store',
    storeName:
      raw.storeName || raw.store?.name || raw.vendor?.name || 'EkivaMart Store',
    href: `/products/${raw.id || raw._id}`,
  };
}

export default function FlashSaleSection() {
  const { days, hours, minutes, seconds } = useCountdown();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [products, setProducts] = useState<LandingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchWishlist());
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        // No categoryId is passed here on purpose — Flash Sales should draw
        // from every category in the store, not just one. We pull a wider
        // pool of active products (across ALL categories) and then pick a
        // random sample from it below, so the section shows a genuine mix
        // instead of always the same category's items.
        const baseParams: any = {
          limit: 60,
          status: 'active',
          sortBy: 'createdAt',
          sortOrder: 'desc',
          skipAuth: true,
        };

        // Prefer products that actually have a discount, since this is a
        // "Flash Sale" — but if the store doesn't have enough discounted
        // items across categories yet, fall back to the general pool so
        // the section is never left empty.
        let list: any[] = [];

        const discountedRes = await productApi.getAllProducts({
          ...baseParams,
          minDiscount: 1,
        });
        list = extractList(discountedRes);

        if (list.length < 10) {
          const generalRes = await productApi.getAllProducts(baseParams);
          const generalList = extractList(generalRes);
          // Merge, de-duplicating by product id, so we don't show the same
          // product twice if it appeared in both queries.
          const seen = new Set(list.map((p: any) => String(p.id || p._id)));
          for (const p of generalList) {
            const id = String(p.id || p._id);
            if (!seen.has(id)) {
              seen.add(id);
              list.push(p);
            }
          }
        }

        // Randomly shuffle the combined, cross-category pool and take 10 —
        // this is what guarantees the section mixes products from every
        // category rather than clustering around whichever category
        // happens to sort first.
        const randomSample = shuffleArray(list).slice(0, 10);

        if (!cancelled) {
          setProducts(randomSample.map(mapProduct));
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const timer = setTimeout(updateScrollState, 100);
    return () => clearTimeout(timer);
  }, [updateScrollState, products]);

  function scroll(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 240, behavior: 'smooth' });
  }

  return (
    <div className="w-full overflow-hidden">
      {/* Heading row — bg-danger-500 */}
      <div className="bg-danger-500 px-4 py-3 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        {/* Mobile Header Row 1 / Desktop Left */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2 text-white">
            <Image
              src="/icons/flash.png"
              alt=""
              width={22}
              height={22}
              aria-hidden
              className="shrink-0"
            />
            <h2 className="text-base md:text-2xl font-semibold text-neutral-200">
              Flash Sales
            </h2>
          </div>
          {/* Mobile only View All */}
          <div className="md:hidden">
            <Link
              href="/categories/shop"
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-200 bg-danger-600 px-4 py-1.5 rounded-full hover:bg-danger-800 transition-colors"
            >
              View all
              <span className="text-[10px]">›</span>
            </Link>
          </div>
        </div>

        {/* Mobile Row 2 / Desktop Center — countdown */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-sm md:text-base font-bold text-neutral-200">
            Time Left:
          </span>
          <div className="flex gap-1 items-center">
            <TimeBox label="Day" value={days} />
            <span className="text-sm font-bold text-[#F9F854] px-0.5 self-center">
              :
            </span>
            <TimeBox label="Hour" value={hours} />
            <span className="text-sm font-bold text-[#F9F854] px-0.5 self-center">
              :
            </span>
            <TimeBox label="Minutes" value={minutes} />
            <span className="text-sm font-bold text-[#F9F854] px-0.5 self-center">
              :
            </span>
            <TimeBox label="Seconds" value={seconds} />
          </div>
        </div>

        {/* Desktop only View All */}
        <div className="hidden md:block">
          <Link
            href="/categories/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-danger-600 hover:bg-danger-600/50 px-5 py-2 rounded-full transition-colors shadow-sm"
          >
            View all
            <span className="text-[16px] font-bold">›</span>
          </Link>
        </div>
      </div>

      {/* Products area */}
      <div className="bg-neutral-50 px-4 pb-4 pt-3 md:px-6 border-x border-b border-neutral-100">
        {/* Desktop: horizontal scroll with leading banners + nav arrows */}
        <div className="relative hidden md:block">
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Previous products"
            aria-hidden={!canScrollLeft}
            className={[
              'absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-20 w-9 items-center justify-center',
              'bg-brand-700 text-white shadow-md hover:bg-brand-800 active:scale-95 transition-all duration-150 rounded-lg',
              canScrollLeft
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none',
            ].join(' ')}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-3 md:gap-6 overflow-x-auto scroll-smooth scrollbar-hide px-1 py-1"
          >
            {/* Leading banner slides - FIXED height to match product card (h-[415px] from ProductCard) */}
            <div className="relative h-103.75 w-44 shrink-0 overflow-hidden rounded sm:w-52 shadow-sm">
              <Image
                src="/images/flash_sale_banner_2.png"
                alt="Step with confidence"
                fill
                sizes="208px"
                className="object-fill"
              />
            </div>
            <div className="relative h-103.75 w-44 shrink-0 overflow-hidden rounded sm:w-52 shadow-sm">
              <Image
                src="/images/flash_sale_banner_1.png"
                alt="Step with confidence"
                fill
                sizes="208px"
                className="object-fill"
              />
            </div>

            {/* Flash sale product cards */}
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-52 shrink-0 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm animate-pulse flex flex-col gap-3 h-103.75"
                >
                  <div className="aspect-square rounded-xl bg-neutral-200" />
                  <div className="h-3 rounded bg-neutral-200 w-3/4" />
                  <div className="h-3 rounded bg-neutral-200 w-1/2" />
                  <div className="h-8 rounded-xl bg-neutral-200 mt-auto" />
                </div>
              ))
            ) : products.length === 0 ? (
              <EmptyState />
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Next products"
            aria-hidden={!canScrollRight}
            className={[
              'absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-20 w-9 items-center justify-center',
              'bg-brand-700 text-white shadow-md hover:bg-brand-800 active:scale-95 transition-all duration-150 rounded-lg',
              canScrollRight
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none',
            ].join(' ')}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Mobile: 2-column grid — banners first, then products */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {/* Banner 1 - FIXED height to match mobile product card */}
          <div
            className="relative w-full overflow-hidden rounded-2xl shadow-sm"
            style={{ aspectRatio: '3/4' }}
          >
            <Image
              src="/images/flash_sale_banner_2.png"
              alt="Step with confidence"
              fill
              className="object-contain"
            />
          </div>
          {/* Banner 2 - FIXED height to match mobile product card */}
          <div
            className="relative w-full overflow-hidden rounded-2xl shadow-sm"
            style={{ aspectRatio: '3/4' }}
          >
            <Image
              src="/images/flash_sale_banner_1.png"
              alt="Step with confidence"
              fill
              className="object-contain"
            />
          </div>

          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm animate-pulse flex flex-col gap-3"
              >
                <div className="aspect-square rounded-xl bg-neutral-200" />
                <div className="h-3 rounded bg-neutral-200 w-3/4" />
                <div className="h-8 rounded-xl bg-neutral-200 mt-auto" />
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-2">
              <EmptyState />
            </div>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} isMobile />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
