/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { Package, Sparkles } from 'lucide-react';
import { productApi, categoryApi } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchWishlist } from '@/lib/features/wishlist/wishlistSlice';
import { mapProduct } from '@/lib/data/landing-product';
import ProductCard, { type LandingProduct } from './ProductCard';

// EmptyState renders if no products exist for a section
function EmptyState({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center max-w-md mx-auto my-4">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 shadow-inner">
        <Package size={28} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-extrabold text-neutral-800 mb-1.5">
        No Products Available
      </h3>
      <p className="text-neutral-800 text-sm mb-5 leading-relaxed">
        We couldn&apos;t find any items in the{' '}
        <span className="font-semibold text-brand-900">{category}</span>{' '}
        collection at the moment.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-brand-50 rounded-full border border-brand-100">
        <Sparkles size={13} className="text-brand-500 animate-pulse" />
        <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">
          New Stock Arriving Daily!
        </span>
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
//
// IMPORTANT: This mirrors the EXACT matching algorithm used by the working
// "/categories/[slug]" page (see app/categories/[slug]/page.tsx). That page
// resolves a category by turning its name into a slug and comparing it
// against the URL slug (with a fallback) — it never relies on a
// hand-maintained keyword list.
//
// THE BUG THIS FIXES:
// The previous implementation matched section titles against category names
// using a hardcoded keyword map (e.g. Fashion -> ['fashion', 'clothing',
// 'wear', 'dress', ...]), checked with a plain substring .includes().
// That approach is fragile:
//   - The keyword "wear" (meant for "Fashion") ALSO matches the category
//     name "Foot wear".
//   - The keyword "fashion" (meant for "Fashion") ALSO matches the category
//     name "Jewellery & Fashion Accessories".
// Whichever category the API happened to return first with ANY matching
// substring silently won the lookup — producing the wrong (often
// non-existent) categoryId for the "Fashion" and "Mobile Phones &
// Accessories" home sections specifically, while the dedicated category
// page (which matches by slug, not fuzzy keywords) worked correctly and
// showed the real products when "View all" was clicked.
//
// THE FIX:
// Derive the slug straight from the section's own `viewAllHref` prop (the
// exact same URL "View all" navigates to) and resolve the category the
// same way the category page does:
//   1. Exact slug match against the category's name.
//   2. A safe fallback that compares whole *word tokens* (not raw
//      substrings) between the slug and each category name, tolerating
//      minor spelling differences (e.g. "jewelry" vs "jewellery") but
//      requiring most of the words to line up — so a short shared word
//      like "fashion" can never win against a fuller, unrelated category
//      name.
// This guarantees the home section always resolves to the exact same
// category as clicking "View all" does.

const getSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');

/** Extract the "/categories/<slug>" segment from a viewAllHref. */
function slugFromHref(href?: string): string | undefined {
  if (!href) return undefined;
  const match = href.match(/\/categories\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]).toLowerCase() : undefined;
}

/** Split a slug or category name into lowercase word tokens. */
const tokenize = (s: string): string[] =>
  s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/** Standard Levenshtein edit distance, used to tolerate minor spelling
 *  differences between a slug and the real category name (e.g. "jewelry"
 *  vs "jewellery"). */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Two tokens are considered the same word if identical, or (for tokens of
 *  4+ letters) within a small edit-distance tolerance. */
function tokensMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 4 || b.length < 4) return false;
  return levenshtein(a, b) <= 2;
}

/** Fraction of tokens shared between the slug and a candidate category name,
 *  relative to the larger token set — a simple, safe similarity score that
 *  requires most words to line up (so "Fashion" alone never scores highly
 *  against "Jewellery & Fashion Accessories", which shares only 1 of 3
 *  words). */
function tokenOverlapScore(slugTokens: string[], nameTokens: string[]): number {
  if (slugTokens.length === 0 || nameTokens.length === 0) return 0;
  let matched = 0;
  for (const st of slugTokens) {
    if (nameTokens.some((nt) => tokensMatch(st, nt))) matched++;
  }
  return matched / Math.max(slugTokens.length, nameTokens.length);
}

// Helper to map a section's target slug to a real category id, using the
// same slug-based resolution the category detail page relies on, plus a
// token-similarity fallback that safely tolerates small naming/spelling
// differences between the hardcoded viewAllHref slugs and the category
// names actually stored in the backend.
async function resolveCategoryId(
  slug: string | undefined
): Promise<string | undefined> {
  if (!slug || slug === 'shop' || slug === 'all') return undefined;

  try {
    const res = await categoryApi.getCategories({ limit: 100 });
    let data: any[] = [];
    if (res?.data && Array.isArray(res.data)) data = res.data;
    else if (res?.data?.data && Array.isArray(res.data.data))
      data = res.data.data;
    else if (res?.data?.categories && Array.isArray(res.data.categories))
      data = res.data.categories;
    else if (res?.data?.docs && Array.isArray(res.data.docs))
      data = res.data.docs;
    else if (Array.isArray(res)) data = res;

    const active = data.filter(
      (c: any) =>
        Boolean(
          c.isActive ??
          c.is_active ??
          (c.status === 'published' || c.status === 'active')
        ) && c.status !== 'draft'
    );

    const parents = active.filter((c: any) => !c.parentId);

    // 1. Exact slug match against parent category name (same as category page)
    const exactMatch = parents.find((c: any) => {
      const name = c.name || '';
      return getSlug(name) === slug || name.toLowerCase() === slug;
    });
    if (exactMatch) {
      return String(
        exactMatch.id ||
          exactMatch._id ||
          exactMatch.categoryId ||
          exactMatch.uuid
      );
    }

    // 2. Fallback: best token-overlap match. Requires at least half of the
    //    words to line up, so short shared words (e.g. "fashion" appearing
    //    inside both "Fashion" and "Jewellery & Fashion Accessories")
    //    can never win against the true, fuller match.
    const slugTokens = tokenize(slug);
    let bestMatch: any = null;
    let bestScore = 0;
    for (const c of parents) {
      const score = tokenOverlapScore(slugTokens, tokenize(c.name || ''));
      if (score > bestScore) {
        bestScore = score;
        bestMatch = c;
      }
    }
    if (bestMatch && bestScore >= 0.5) {
      return String(
        bestMatch.id || bestMatch._id || bestMatch.categoryId || bestMatch.uuid
      );
    }
  } catch (err) {
    console.warn('resolveCategoryId error:', err);
  }

  return undefined;
}

// Helper to format raw api products to LandingProduct shape
// ─── Props ─────────────────────────────────────────────────────────────────

interface ProductCarouselProps {
  title: string;
  /** URL to navigate to when "View all" is clicked */
  viewAllHref?: string;
  /** Direct category ID override */
  categoryId?: string;
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
  categoryId: directCategoryId,
  icon,
  headerAccessory,
  leadingSlides,
  hideHeader = false,
  titleColor = 'text-neutral-800',
  viewAllVariant = 'default',
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const timer = setTimeout(updateScrollState, 150);
    window.addEventListener('resize', updateScrollState);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [products, loading, updateScrollState]);

  // Fetch products for this section
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        // "Featured Products" (and any section pointing at /categories/shop
        // or /categories/all) intentionally has no specific category —
        // it shows the newest products across the whole catalog.
        const slug = slugFromHref(viewAllHref);
        const categoryId = directCategoryId || (await resolveCategoryId(slug));
        const params: any = {
          limit: 10,
          status: 'active',
          sortBy: 'createdAt',
          sortOrder: 'desc',
          skipAuth: true,
        };
        if (categoryId) params.categoryId = categoryId;

        const res = await productApi.getAllProducts(params);

        let list: any[] = [];
        if (res?.data && Array.isArray(res.data)) list = res.data;
        else if (res?.data?.data && Array.isArray(res.data.data))
          list = res.data.data;
        else if (res?.data?.products && Array.isArray(res.data.products))
          list = res.data.products;
        else if (res?.data?.docs && Array.isArray(res.data.docs))
          list = res.data.docs;

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
    return () => {
      cancelled = true;
    };
  }, [title, viewAllHref, directCategoryId]);



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
    <section
      className={hideHeader ? 'px-4 pb-4 pt-3 md:px-6' : 'px-4 py-5 md:px-6'}
    >
      {!hideHeader && (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h2
              className={`text-base md:text-2xl ml-1 md:mb-2 font-semibold sm:text-lg ${titleColor}`}
            >
              {title}
            </h2>
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

      {/* Mobile: 2-column grid */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm animate-pulse flex flex-col gap-3"
            >
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
