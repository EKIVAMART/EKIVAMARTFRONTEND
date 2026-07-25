'use client';

import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { Package, Sparkles } from 'lucide-react';
import { productApi, categoryApi } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchWishlist } from '@/lib/features/wishlist/wishlistSlice';
import ProductCard, { type LandingProduct } from './ProductCard';

// EmptyState renders if no products exist for a section
function EmptyState({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center max-w-md mx-auto my-4">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 shadow-inner">
        <Package size={28} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-extrabold text-neutral-800 mb-1.5">No Products Available</h3>
      <p className={category == "featured" ? `text-neutral-500 text-sm mb-5 leading-relaxed` : 'text-brand-300'}>
        We couldn&apos;t find any items in the{' '}
        <span className={category == "featured" ? `font-semibold text-brand-50` : 'font-semibold text-brand-800'}>{category}</span> collection at the moment.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-full border border-brand-100">
        <Sparkles size={13} className="text-brand-500 animate-pulse" />
        <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">New Stock Arriving Daily!</span>
      </div>
    </div>
  );
}

// Loading Skeleton component for product slides
function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          className="w-44 sm:w-52 md:w-56 shrink-0 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm animate-pulse flex flex-col gap-3"
        >
          <div className="aspect-square rounded-xl bg-neutral-200" />
          <div className="h-3 rounded bg-neutral-200 w-3/4" />
          <div className="h-3 rounded bg-neutral-200 w-1/2" />
          <div className="h-8 rounded-xl bg-neutral-200 mt-auto" />
        </div>
      ))}
    </>
  );
}

// ─── Category Name → API lookup helper ──────────────────────────────────────

const CATEGORY_KEYWORD_MAP: Record<string, string[]> = {
  'Featured Products': [],
  'Fashion': ['fashion', 'clothing', 'apparel', 'garment', 'wear', 'dress'],
  'Foot wear': ['footwear', 'shoe', 'sandal', 'boot', 'sneaker', 'slipper'],
  'Bags & Luggages': ['bag', 'luggage', 'handbag', 'backpack', 'purse', 'suitcase'],
  'Jewellery & Fashion Accessories': ['jewel', 'jewelry', 'accessory', 'watch', 'necklace', 'ring', 'bracelet'],
  'Mobile Phones & Accessories': ['mobile', 'phone', 'smartphone', 'tablet', 'iphone', 'android', 'gadget', 'tech'],
  'Flash': ['phone', 'mobile', 'smartphone', 'android', 'iphone', 'samsung'],
};

// Helper to map section titles to category ids
async function resolveCategoryId(sectionTitle: string): Promise<string | undefined> {
  if (sectionTitle === 'Featured Products') return undefined;

  const keywords = CATEGORY_KEYWORD_MAP[sectionTitle] || [sectionTitle.toLowerCase()];

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

    // Try parents first
    const parentMatch = active.find((c: any) => {
      const name = (c.name || '').toLowerCase();
      return keywords.some((kw) => name.includes(kw));
    });
    if (parentMatch) {
      return String(parentMatch.id || parentMatch._id || parentMatch.categoryId || parentMatch.uuid);
    }

    // Try fetching subcategories for each parent
    for (const parent of active.filter((c: any) => !c.parentId)) {
      const parentId = String(parent.id || parent._id || parent.categoryId || parent.uuid);
      try {
        const subRes = await categoryApi.getSubcategories(parentId);
        let subs: any[] = [];
        if (subRes?.data && Array.isArray(subRes.data)) subs = subRes.data;
        else if (subRes?.data?.data && Array.isArray(subRes.data.data)) subs = subRes.data.data;
        else if (Array.isArray(subRes)) subs = subRes;

        const subMatch = subs.find((s: any) => {
          const name = (s.name || '').toLowerCase();
          return keywords.some((kw) => name.includes(kw));
        });
        if (subMatch) {
          return String(subMatch.id || subMatch._id || subMatch.categoryId || subMatch.uuid);
        }
      } catch {
        // ignore individual sub errors
      }
    }
  } catch (err) {
    console.error('resolveCategoryId error:', err);
  }

  return undefined;
}

// Helper to format raw api products to LandingProduct shape
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
    vendor: raw.store?.name || raw.vendor?.name || 'Faflora Store',
    href: `/products/${raw.id || raw._id}`,
  };
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface ProductCarouselProps {
  title: string;
  /** URL to navigate to when "View all" is clicked */
  viewAllHref?: string;
  icon?: ReactNode;
  headerAccessory?: ReactNode;
  leadingSlides?: ReactNode;
  hideHeader?: boolean;
  titleColor?: string;
  /** 'featured' = bg-brand-700 rounded-full; 'default' = bg-brand-100 text-brand-600 */
  viewAllVariant?: 'featured' | 'default';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductCarousel({
  title,
  viewAllHref = '#',
  icon,
  headerAccessory,
  leadingSlides,
  hideHeader = false,
  titleColor = 'text-neutral-800',
  viewAllVariant = 'default',
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [products, setProducts] = useState<LandingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Fetch wishlist when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  // Fetch products for this section
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const categoryId = await resolveCategoryId(title);
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
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load products');
          setLoading(false);
        }
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [title]);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  function scroll(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 240, behavior: 'smooth' });
  }

  const viewAllClass =
    viewAllVariant === 'featured'
      ? 'rounded-full bg-brand-700 px-5 py-2 text-xs md:text-sm font-semibold text-neutral-100 hover:bg-brand-800 transition-colors'
      : 'rounded-full bg-brand-100 px-5 py-2 text-xs md:text-sm font-semibold text-brand-600 hover:bg-brand-200 transition-colors';

  return (
    <section className={hideHeader ? 'px-4 pb-4 pt-3 md:px-6' : 'px-4 py-5 md:px-6'}>
      {!hideHeader && (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className={`text-base md:text-2xl ml-1 md:mb-2 font-semibold sm:text-lg ${titleColor}`}>{title}</h2>
          </div>
          <div className="flex items-center gap-3">
            {headerAccessory}
            <Link href={viewAllHref} className={viewAllClass}>
              View all ›
            </Link>
          </div>
        </div>
      )}

      {/* Desktop: horizontal scroll carousel */}
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
          className="flex gap-3 md:gap-6 overflow-x-auto scroll-smooth scrollbar-hide px-1"
        >
          {leadingSlides}
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <EmptyState category={title} />
          ) : products.length === 0 ? (
            <EmptyState category={title} />
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

      {/* Mobile: 2-column grid */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm animate-pulse flex flex-col gap-3">
              <div className="aspect-square rounded-xl bg-neutral-200" />
              <div className="h-3 rounded bg-neutral-200 w-3/4" />
              <div className="h-3 rounded bg-neutral-200 w-1/2" />
              <div className="h-8 rounded-xl bg-neutral-200 mt-auto" />
            </div>
          ))
        ) : error || products.length === 0 ? (
          <div className="col-span-2">
            <EmptyState category={title} />
          </div>
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} isMobile />
          ))
        )}
      </div>
    </section>
  );
}
