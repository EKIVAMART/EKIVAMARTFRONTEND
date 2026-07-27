'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Package, Sparkles } from 'lucide-react';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { productApi, categoryApi } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchWishlist } from '@/lib/features/wishlist/wishlistSlice';
import ProductCard, { type LandingProduct } from './ProductCard';

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center max-w-14 md:w-16 bg-neutral-100 border border-neutral-200/80 px-1 py-1 min-w-[45px] sm:min-w-[50px] shadow-sm">
      <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-600 font-medium border-b border-neutral-600 pb-0.5 w-full text-center">
        {label}
      </span>
      <span className="text-sm md:text-lg font-bold text-neutral-800 pt-0.5 leading-none">{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center max-w-md mx-auto my-4">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 shadow-inner">
        <Package size={28} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-extrabold text-neutral-800 mb-1.5">No Flash Sale Items</h3>
      <p className="text-neutral-500 text-sm mb-5 leading-relaxed">
        Check back soon for exciting flash deals on smartphones and more!
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-full border border-brand-100">
        <Sparkles size={13} className="text-brand-500 animate-pulse" />
        <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">New Deals Drop Daily!</span>
      </div>
    </div>
  );
}

// Helper to resolve smartphone category id for flash sale products
async function resolveSmartphonesCategoryId(): Promise<string | undefined> {
  const keywords = ['smartphone', 'mobile', 'phone', 'iphone', 'android', 'tech'];
  try {
    const res = await categoryApi.getCategories({ limit: 100 });
    let data: any[] = [];
    if (res?.data && Array.isArray(res.data)) data = res.data;
    else if (res?.data?.data && Array.isArray(res.data.data)) data = res.data.data;
    else if (res?.data?.categories && Array.isArray(res.data.categories)) data = res.data.categories;
    else if (res?.data?.docs && Array.isArray(res.data.docs)) data = res.data.docs;
    else if (Array.isArray(res)) data = res;

    const active = data.filter((c: any) =>
      Boolean(c.isActive ?? c.is_active ?? (c.status === 'published' || c.status === 'active')) &&
      c.status !== 'draft'
    );

    const parentMatch = active.find((c: any) =>
      keywords.some((kw) => (c.name || '').toLowerCase().includes(kw))
    );
    if (parentMatch) return String(parentMatch.id || parentMatch._id);

    // Try subcategories
    for (const parent of active.filter((c: any) => !c.parentId)) {
      const parentId = String(parent.id || parent._id);
      try {
        const subRes = await categoryApi.getSubcategories(parentId);
        let subs: any[] = [];
        if (subRes?.data && Array.isArray(subRes.data)) subs = subRes.data;
        else if (subRes?.data?.data && Array.isArray(subRes.data.data)) subs = subRes.data.data;
        else if (Array.isArray(subRes)) subs = subRes;

        const subMatch = subs.find((s: any) =>
          keywords.some((kw) => (s.name || '').toLowerCase().includes(kw))
        );
        if (subMatch) return String(subMatch.id || subMatch._id);
      } catch { /* ignore */ }
    }
  } catch (err) {
    console.error('resolveSmartphonesCategoryId error:', err);
  }
  return undefined;
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
      ? [locObj.town, locObj.lga, locObj.state].filter(Boolean).join(', ') || 'Nigeria'
      : (typeof locObj === 'string' ? locObj : 'Nigeria');

  return {
    id: String(raw.id || raw._id || ''),
    name: raw.name || 'Product',
    image: primaryImg,
    price: typeof priceVal === 'number' ? priceVal : 0,
    compareAtPrice: typeof compareAt === 'number' ? compareAt : undefined,
    discountPercent: typeof discountPct === 'number' && discountPct > 0 ? discountPct : undefined,
    rating: 4.2,
    reviewCount: 0,
    location: locationStr,
    // FIXED: Use 'Faflora Store' as fallback instead of raw.vendor?.name which might be 'fadlora'
    vendor: raw.store?.name || raw.vendor?.name || 'Faflora Store',
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
        const categoryId = await resolveSmartphonesCategoryId();
        const params: any = { limit: 10, status: 'active', sortBy: 'createdAt', sortOrder: 'desc' };
        if (categoryId) params.categoryId = categoryId;

        const res = await productApi.getAllProducts(params);
        let list: any[] = [];
        if (res?.data && Array.isArray(res.data)) list = res.data;
        else if (res?.data?.data && Array.isArray(res.data.data)) list = res.data.data;
        else if (res?.data?.products && Array.isArray(res.data.products)) list = res.data.products;
        else if (res?.data?.docs && Array.isArray(res.data.docs)) list = res.data.docs;

        if (!cancelled) {
          setProducts(list.slice(0, 10).map(mapProduct));
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
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
            <Image src="/icons/flash.png" alt="" width={22} height={22} aria-hidden className="shrink-0" />
            <h2 className="text-base md:text-2xl font-semibold text-neutral-200">Flash Sales</h2>
          </div>
          {/* Mobile only View All */}
          <div className="md:hidden">
            <a href="/categories/mobile-phones--accessories" className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-200 bg-danger-600 px-4 py-1.5 rounded-full hover:bg-danger-800 transition-colors">
              View all
              <span className="text-[10px]">›</span>
            </a>
          </div>
        </div>

        {/* Mobile Row 2 / Desktop Center — countdown */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-sm md:text-base font-bold text-neutral-200">Time Left:</span>
          <div className="flex gap-1 items-center">
            <TimeBox label="Day" value={days} />
            <span className="text-sm font-bold text-[#F9F854] px-0.5 self-center">:</span>
            <TimeBox label="Hour" value={hours} />
            <span className="text-sm font-bold text-[#F9F854] px-0.5 self-center">:</span>
            <TimeBox label="Minutes" value={minutes} />
            <span className="text-sm font-bold text-[#F9F854] px-0.5 self-center">:</span>
            <TimeBox label="Seconds" value={seconds} />
          </div>
        </div>

        {/* Desktop only View All */}
        <div className="hidden md:block">
          <a href="/categories/mobile-phones--accessories" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-danger-600 hover:bg-danger-600/50 px-5 py-2 rounded-full transition-colors shadow-sm">
            View all
            <span className="text-[16px] font-bold">›</span>
          </a>
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
              canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
            ].join(' ')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-3 md:gap-6 overflow-x-auto scroll-smooth scrollbar-hide px-1 py-1"
          >
            {/* Leading banner slides - FIXED height to match product card (h-[415px] from ProductCard) */}
            <div className="relative h-[415px] w-44 shrink-0 overflow-hidden rounded sm:w-52 shadow-sm">
              <Image src="/images/flash_sale_banner_2.png" alt="Step with confidence" fill sizes="208px" className="object-fill" />
            </div>
            <div className="relative h-[415px] w-44 shrink-0 overflow-hidden rounded sm:w-52 shadow-sm">
              <Image src="/images/flash_sale_banner_1.png" alt="Step with confidence" fill sizes="208px" className="object-fill" />
            </div>

            {/* Flash sale product cards */}
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="w-52 shrink-0 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm animate-pulse flex flex-col gap-3 h-[415px]">
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
              canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
            ].join(' ')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Mobile: 2-column grid — banners first, then products */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {/* Banner 1 - FIXED height to match mobile product card */}
          <div className="relative w-full overflow-hidden rounded-2xl shadow-sm" style={{ aspectRatio: '3/4' }}>
            <Image src="/images/flash_sale_banner_2.png" alt="Step with confidence" fill className="object-contain" />
          </div>
          {/* Banner 2 - FIXED height to match mobile product card */}
          <div className="relative w-full overflow-hidden rounded-2xl shadow-sm" style={{ aspectRatio: '3/4' }}>
            <Image src="/images/flash_sale_banner_1.png" alt="Step with confidence" fill className="object-contain" />
          </div>

          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm animate-pulse flex flex-col gap-3">
                <div className="aspect-square rounded-xl bg-neutral-200" />
                <div className="h-3 rounded bg-neutral-200 w-3/4" />
                <div className="h-8 rounded-xl bg-neutral-200 mt-auto" />
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-2"><EmptyState /></div>
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