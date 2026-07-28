'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categoryApi } from '@/lib/api';
import fashion from '../assets/fashion.png';
import electronics from '../assets/Electronics.png';
import bags from '../assets/beg.png';
import footwear from '../assets/footwear.png';
import groceries from '../assets/Groceries.png';
import beauty from '../assets/Beauty.png';
import wellness from '../assets/wellness.png';
import jewellery from '../assets/jewellery.png';

const categoryAssetMap: Record<string, any> = {
  'fashion': fashion,
  'electronics': electronics,
  'bags & luggage': bags,
  'bags': bags,
  'footwear': footwear,
  'groceries': groceries,
  'groceries and food': groceries,
  'beauty': beauty,
  'wellness': wellness,
  'jewellery': jewellery,
  'local market': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23fef3c7"/><text y=".9em" font-size="60" x="50%" text-anchor="middle" dominant-baseline="middle" dy="0.1em">🛒</text></svg>',
  'drinks': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23dbeafe"/><text y=".9em" font-size="60" x="50%" text-anchor="middle" dominant-baseline="middle" dy="0.1em">🥤</text></svg>',
};

const bgClasses = [
  'bg-fuchsia-50/50', 'bg-orange-50/50', 'bg-pink-50/50', 'bg-blue-50/50',
  'bg-purple-50/50', 'bg-teal-50/50', 'bg-violet-50/50', 'bg-green-50/50',
  'bg-yellow-50/50', 'bg-red-50/50', 'bg-cyan-50/50', 'bg-indigo-50/50',
];

const CategoryCard = ({ category, row }: { category: any; row: 0 | 1 }) => {
  const isStaticImage = typeof category.icon !== 'string';
  const rowBg = row === 0 ? 'bg-white/80' : 'bg-purple-50/80';

  return (
    <Link
      href={`/categories/${category.slug}`}
      draggable={false}
      className="group flex-shrink-0 flex flex-col items-center text-center cursor-pointer px-1"
    >
      <div
        className={`
          w-24 h-23 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full
          overflow-hidden
          ${rowBg}
          border-2 border-white/60
          shadow-lg
          transition-all duration-300 ease-out
          group-hover:scale-110
          group-hover:shadow-2xl
          group-hover:ring-4
          group-hover:ring-purple-300/50
          flex items-center justify-center
        `}
      >
        {isStaticImage ? (
          <Image
            src={category.icon}
            alt={category.name}
            width={160}
            height={160}
            draggable={false}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 pointer-events-none"
          />
        ) : (
          <img
            src={category.icon}
            alt={category.name}
            draggable={false}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 pointer-events-none"
          />
        )}
      </div>
      <p className="mt-2 text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#9d4ae3] group-hover:scale-110 group-hover:mt-4 transition-all duration-300 whitespace-nowrap max-w-[96px] sm:max-w-[120px] truncate origin-top group-hover:whitespace-normal group-hover:max-w-[160px] group-hover:overflow-visible group-hover:text-clip">
        {category.name}
      </p>
    </Link>
  );
};

const RowSkeleton = () => (
  <div className="flex flex-nowrap gap-4 sm:gap-6">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div key={idx} className="flex flex-col items-center gap-3 animate-pulse shrink-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-purple-200/40" />
        <div className="h-3 w-16 bg-purple-200/40 rounded" />
      </div>
    ))}
  </div>
);

const PauseIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [manuallyPaused, setManuallyPaused] = useState(false);

  const topWrapRef = useRef<HTMLDivElement>(null);
  const bottomWrapRef = useRef<HTMLDivElement>(null);
  const topTrackRef = useRef<HTMLDivElement>(null);
  const bottomTrackRef = useRef<HTMLDivElement>(null);

  // ---- SINGLE SOURCE OF TRUTH ----
  // Auto-scroll, dragging, and buttons only ever mutate this one number.
  // Both rows are pure functions of it, so they cannot desync — there is
  // nothing to "keep in sync", there's only one value to read from.
  const positionRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  // How far (in px) the bottom row lags behind the top row. Must be at
  // least the visible row width, or an item leaving the top row would
  // still be visible in the bottom row at the same instant.
  const phaseOffsetRef = useRef(0);

  const pausedRef = useRef(false); // temporary: hover/drag
  const manuallyPausedRef = useRef(false); // persistent: user tapped pause
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef({
    active: false,
    row: null as 'top' | 'bottom' | null,
    pointerId: null as number | null,
    startX: 0,
    startPosition: 0,
    moved: false,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const res = await categoryApi.getCategories({ limit: 100 });
        let data: any[] = [];
        if (res?.data && Array.isArray(res.data)) {
          data = res.data;
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res?.data?.categories && Array.isArray(res.data.categories)) {
          data = res.data.categories;
        } else if (res?.data?.docs && Array.isArray(res.data.docs)) {
          data = res.data.docs;
        }

        const formatted = data
          .filter((item: any) => {
            const isPublished = Boolean(item.isActive ?? item.is_active ?? (item.status === 'published' || item.status === 'active'));
            const isDraft = item.status === 'draft';
            return isPublished && !isDraft && !item.parentId;
          })
          .map((item: any, index: number) => {
            const name = item.name || item.title || item.displayName || 'Unknown';
            const slug = (item.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            const fallbackIcon = categoryAssetMap[name.toLowerCase()] || categoryAssetMap[slug];
            const icon = item.imageUrl || item.image || fallbackIcon;

            return {
              id: String(item.id || item._id || item.categoryId || item.uuid),
              name,
              slug,
              icon,
              bg: bgClasses[index % bgClasses.length],
            };
          });

        if (isMounted) {
          setCategories(formatted);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch carousel categories:', err);
        if (isMounted) setLoading(false);
      }
    };
    void fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Top row: original order. Bottom row: reversed — reads as one
  // continuous path folding from top into bottom.
  const topRowCategories = [...categories];
  const bottomRowCategories = [...categories].reverse();

  const displayTop = [...topRowCategories, ...topRowCategories, ...topRowCategories];
  const displayBottom = [...bottomRowCategories, ...bottomRowCategories, ...bottomRowCategories];

  const measure = useCallback(() => {
    const track = topTrackRef.current;
    const wrap = topWrapRef.current;
    if (!track || !wrap || track.children.length === 0) return;
    const singleSetWidth = track.scrollWidth / 3;
    singleSetWidthRef.current = singleSetWidth;
    // Phase = one full visible row width, capped so it never exceeds a
    // single set (guards against very short category lists).
    phaseOffsetRef.current = Math.min(wrap.clientWidth, singleSetWidth * 0.9);
  }, []);

  const applyPosition = useCallback(() => {
    const W = singleSetWidthRef.current;
    if (!W || !topTrackRef.current || !bottomTrackRef.current) return;

    const pTop = ((positionRef.current % W) + W) % W;
    topTrackRef.current.style.transform = `translateX(${-pTop}px)`;

    // Bottom row is the same position, delayed by phaseOffset — so the
    // item currently exiting the top row's view only reaches the bottom
    // row's view after it has already left the top row entirely.
    const delayed = positionRef.current - phaseOffsetRef.current;
    const pBottom = ((delayed % W) + W) % W;
    bottomTrackRef.current.style.transform = `translateX(${pBottom - W}px)`;
  }, []);

  useEffect(() => {
    measure();
    applyPosition();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [categories, measure, applyPosition]);

  useEffect(() => {
    if (categories.length === 0) return;
    let rafId: number;
    let lastTime = performance.now();
    const speed = 80; // px/sec

    const tick = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      if (!pausedRef.current && !manuallyPausedRef.current && !dragRef.current.active) {
        positionRef.current += speed * dt;
      }
      applyPosition();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [categories, applyPosition]);

  const RESUME_IDLE_MS = 500;
  const schedulePauseEnd = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_IDLE_MS);
  };

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    pausedRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };
  const handleMouseLeave = () => {
    if (!dragRef.current.active) schedulePauseEnd();
  };

  const handlePointerDown = (row: 'top' | 'bottom') => (e: React.PointerEvent) => {
    const state = dragRef.current;
    state.active = true;
    state.row = row;
    state.pointerId = e.pointerId;
    state.startX = e.clientX;
    state.startPosition = positionRef.current;
    state.moved = false;
    pausedRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = dragRef.current;
    if (!state.active || e.pointerId !== state.pointerId) return;
    const deltaX = e.clientX - state.startX;
    if (Math.abs(deltaX) > 4) state.moved = true;
    positionRef.current =
      state.row === 'top' ? state.startPosition - deltaX : state.startPosition + deltaX;
    applyPosition();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const state = dragRef.current;
    if (!state.active || e.pointerId !== state.pointerId) return;
    state.active = false;
    if (!manuallyPausedRef.current) schedulePauseEnd();
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  };

  const animateTo = (target: number, duration: number) => {
    const start = positionRef.current;
    const startTime = performance.now();
    const step = (time: number) => {
      const t = Math.min(1, (time - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      positionRef.current = start + (target - start) * eased;
      applyPosition();
      if (t < 1) {
        requestAnimationFrame(step);
      } else if (!manuallyPausedRef.current) {
        schedulePauseEnd();
      }
    };
    requestAnimationFrame(step);
  };

  const handleScrollButton = (direction: 'left' | 'right') => {
    const track = topTrackRef.current;
    const first = track?.children[0] as HTMLElement | undefined;
    if (!first) return;
    const gap = parseFloat(getComputedStyle(track!).columnGap || '0');
    const slotWidth = first.offsetWidth + gap;

    pausedRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);

    const target = positionRef.current + (direction === 'right' ? slotWidth : -slotWidth);
    animateTo(target, 300);
  };

  const toggleManualPause = () => {
    const next = !manuallyPausedRef.current;
    manuallyPausedRef.current = next;
    setManuallyPaused(next);
    if (!next) {
      // resuming: clear any stray temp-pause state too
      pausedRef.current = false;
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    }
  };

  return (
    <section
      className="overflow-hidden w-full py-10 border-y"
      style={{
        background: 'linear-gradient(135deg, #edd8ff 0%, #e0d5ff 40%, #f6ebff 70%, #f472b626 100%)',
        borderColor: 'rgba(168,85,247,0.3)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-purple-300 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[3.5px] text-purple-600">Browse</span>
            <span className="h-px w-8 bg-purple-300 rounded-full" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Featured Categories
          </h2>
          <p className="mt-1 text-sm text-gray-500">Browse our wide range of product categories</p>
        </div>

        {/* Mobile pause/play toggle */}
        <button
          onClick={toggleManualPause}
          className="sm:hidden flex-shrink-0 mt-1 w-9 h-9 rounded-full bg-white/90 shadow-md border-2 border-purple-200/50 flex items-center justify-center text-purple-600 active:scale-95 transition-transform"
          aria-label={manuallyPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
        >
          {manuallyPaused ? <PlayIcon /> : <PauseIcon />}
        </button>
      </div>

      <div className="relative w-full py-2">
        <div
          className="absolute left-0 top-0 bottom-0 w-10 sm:w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #f3e8ff, transparent)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-10 sm:w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #ede9fe, transparent)' }}
        />

        <button
          onClick={() => handleScrollButton('left')}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white shadow-lg items-center justify-center transition-all duration-200 hover:scale-110 border-2 border-purple-200/50 ml-2 md:ml-4"
          aria-label="Scroll categories left"
        >
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => handleScrollButton('right')}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white shadow-lg items-center justify-center transition-all duration-200 hover:scale-110 border-2 border-purple-200/50 mr-2 md:mr-4"
          aria-label="Scroll categories right"
        >
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="flex flex-col gap-6">
          <div
            ref={topWrapRef}
            className="overflow-hidden px-6 sm:px-12 pb-2 pt-4 cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: 'pan-y' }}
            onPointerDown={loading ? undefined : handlePointerDown('top')}
            onPointerMove={loading ? undefined : handlePointerMove}
            onPointerUp={loading ? undefined : handlePointerUp}
            onPointerCancel={loading ? undefined : handlePointerUp}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClickCapture={handleClickCapture}
          >
            {loading ? (
              <RowSkeleton />
            ) : (
              <div ref={topTrackRef} className="flex flex-nowrap gap-4 sm:gap-6 w-max">
                {displayTop.map((category, index) => (
                  <div key={`${category.id}-top-${index}`} className="shrink-0">
                    <CategoryCard category={category} row={0} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            ref={bottomWrapRef}
            className="overflow-hidden px-6 sm:px-12 pb-2 pt-2 cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: 'pan-y' }}
            onPointerDown={loading ? undefined : handlePointerDown('bottom')}
            onPointerMove={loading ? undefined : handlePointerMove}
            onPointerUp={loading ? undefined : handlePointerUp}
            onPointerCancel={loading ? undefined : handlePointerUp}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClickCapture={handleClickCapture}
          >
            {loading ? (
              <RowSkeleton />
            ) : (
              <div ref={bottomTrackRef} className="flex flex-nowrap gap-4 sm:gap-6 w-max">
                {displayBottom.map((category, index) => (
                  <div key={`${category.id}-bottom-${index}`} className="shrink-0">
                    <CategoryCard category={category} row={1} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;