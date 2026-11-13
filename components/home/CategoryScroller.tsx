'use client';
import { ChevronLeft as PlatformChevronLeft, ChevronRight as PlatformChevronRight, Pause as PlatformPause, Play as PlatformPlay } from '@/components/ui/platform-icons';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categoryApi } from '@/lib/api';
import fashion from '../../assets/fashion.png';
import electronics from '../../assets/Electronics.png';
import bags from '../../assets/beg.png';
import footwear from '../../assets/footwear.png';
import groceries from '../../assets/Groceries.png';
import beauty from '../../assets/Beauty.png';
import wellness from '../../assets/wellness.png';
import jewellery from '../../assets/jewellery.png';

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
  // Check if the icon is a valid image object (Next.js Image import)
  const isStaticImage = typeof category.icon !== 'string' && category.icon !== null && category.icon !== undefined && category.icon.src;
  // Check if the icon is a data URI (which would be the emoji fallback)
  const isDataUri = typeof category.icon === 'string' && category.icon.startsWith('data:');
  // Check if the icon is a valid string URL
  const isValidStringUrl = typeof category.icon === 'string' && category.icon.length > 0 && !category.icon.startsWith('data:');
  // Check if we should show the initial instead of an image
  const showInitial = !isStaticImage && !isDataUri && !isValidStringUrl;
  
  const rowBg = row === 0 ? 'bg-brand-50' : 'bg-brand-50/90';
  
  // Get first letter of category name for the stylized initial
  const firstLetter = category.name?.charAt(0).toUpperCase() || '?';

  return (
    <Link
      href={`/categories/${category.slug}`}
      draggable={false}
      className="group flex-shrink-0 flex flex-col items-center text-center cursor-pointer px-1"
    >
      <div
        className="relative flex items-center justify-center bg-brand-600 shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 transition-all duration-300 ease-out group-hover:scale-110"
        style={{
          clipPath: 'url(#category-curved-triangle)',
          filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.15))',
        }}
      >
        <div
          className={`relative flex items-center justify-center overflow-hidden w-[calc(100%-4px)] h-[calc(100%-4px)] ${rowBg}`}
          style={{
            clipPath: 'url(#category-curved-triangle)',
          }}
        >
          {showInitial ? (
            // Show stylized initial as fallback
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-600 select-none">
              {firstLetter}
            </span>
          ) : isStaticImage ? (
            <Image
              src={category.icon}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, (max-width: 1024px) 144px, 160px"
              draggable={false}
              className="object-cover transition-transform duration-300 group-hover:scale-110 pointer-events-none"
            />
          ) : isDataUri || isValidStringUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.icon}
              alt={category.name}
              draggable={false}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 pointer-events-none"
            />
          ) : (
            // Final fallback - show initial
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-600 select-none">
              {firstLetter}
            </span>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-white transition-all duration-300 text-center break-words w-24 sm:w-28 md:w-36 lg:w-40 px-1">
        {category.name}
      </p>
    </Link>
  );
};

const RowSkeleton = () => (
  <div className="flex flex-nowrap gap-4 sm:gap-6">
    {Array.from({ length: 12 }).map((_, idx) => (
      <div key={idx} className="flex flex-col items-center gap-3 animate-pulse shrink-0">
        <div
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-brand-200/40"
          style={{ clipPath: 'url(#category-curved-triangle)' }}
        />
        <div className="h-3 w-16 bg-brand-200/40 rounded" />
      </div>
    ))}
  </div>
);

const PauseIcon = () => (
  <PlatformPause className="w-4 h-4" weight="fill" aria-hidden="true" />
);

const PlayIcon = () => (
  <PlatformPlay className="w-4 h-4" weight="fill" aria-hidden="true" />
);

export default function CategoryScroller() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [manuallyPaused, setManuallyPaused] = useState(false);

  const topWrapRef = useRef<HTMLDivElement>(null);
  const bottomWrapRef = useRef<HTMLDivElement>(null);
  const topTrackRef = useRef<HTMLDivElement>(null);
  const bottomTrackRef = useRef<HTMLDivElement>(null);

  const positionRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const phaseOffsetRef = useRef(0);

  const pausedRef = useRef(false);
  const manuallyPausedRef = useRef(false);
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
            
            // Get the icon from the API or from the asset map
            let icon = item.imageUrl || item.image || null;
            
            // If no icon from API, check the asset map
            if (!icon) {
              const mappedIcon = categoryAssetMap[name.toLowerCase()] || categoryAssetMap[slug];
              if (mappedIcon) {
                icon = mappedIcon;
              }
            }
            
            // If still no icon, leave as null - CategoryCard will show initial

            return {
              id: String(item.id || item._id || item.categoryId || item.uuid),
              name,
              slug,
              icon, // Can be null/undefined - handled in CategoryCard
              bg: bgClasses[index % bgClasses.length],
            };
          });

        if (isMounted) {
          setCategories(formatted);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Failed to fetch carousel categories:', err);
        if (isMounted) setLoading(false);
      }
    };
    void fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

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
    phaseOffsetRef.current = Math.min(wrap.clientWidth, singleSetWidth * 0.9);
  }, []);

  const applyPosition = useCallback(() => {
    const W = singleSetWidthRef.current;
    if (!W || !topTrackRef.current || !bottomTrackRef.current) return;

    const pTop = ((positionRef.current % W) + W) % W;
    topTrackRef.current.style.transform = `translateX(${-pTop}px)`;

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
    const speed = 80;

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
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = dragRef.current;
    if (!state.active || e.pointerId !== state.pointerId) return;
    const deltaX = e.clientX - state.startX;
    if (Math.abs(deltaX) > 4) {
      if (!state.moved) {
        state.moved = true;
        try {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        } catch (err) {}
      }
    }
    if (state.moved) {
      positionRef.current =
        state.row === 'top' ? state.startPosition - deltaX : state.startPosition + deltaX;
      applyPosition();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const state = dragRef.current;
    if (!state.active || e.pointerId !== state.pointerId) return;
    if (state.moved) {
      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
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
      pausedRef.current = false;
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    }
  };

  return (
    <section className="overflow-hidden w-full md:py-6 pb-3 relative">
      <div className="relative w-full py-2">
        <div
          className="absolute left-0 top-0 bottom-0 w-10 sm:w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(157, 74, 227, 0.2), transparent)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-10 sm:w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgba(130, 54, 190, 0.2), transparent)' }}
        />

        {/* Scroll Buttons */}
        <button
          onClick={() => handleScrollButton('left')}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white shadow-lg items-center justify-center transition-all duration-200 hover:scale-110 border-2 border-purple-200/50 ml-2 md:ml-4"
          aria-label="Scroll categories left"
        >
          <PlatformChevronLeft className="w-5 h-5 text-purple-600" aria-hidden="true" />
        </button>

        <button
          onClick={() => handleScrollButton('right')}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white shadow-lg items-center justify-center transition-all duration-200 hover:scale-110 border-2 border-purple-200/50 mr-2 md:mr-4"
          aria-label="Scroll categories right"
        >
          <PlatformChevronRight className="w-5 h-5 text-purple-600" aria-hidden="true" />
        </button>

        {/* Carousel Tracks */}
        <div className="flex flex-col md:gap-6">
          <div
            ref={topWrapRef}
            className="overflow-hidden px-4 md:px-12 lg:px-32 pb-2 pt-4 cursor-grab active:cursor-grabbing select-none"
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
            className="overflow-hidden px-4 md:px-12 lg:px-32 pb-2 pt-2 cursor-grab active:cursor-grabbing select-none"
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

        {/* Mobile pause/play toggle — bottom center */}
        <div className="flex justify-center mt-4 sm:hidden">
          <button
            onClick={toggleManualPause}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-white/90 shadow-md border-2 border-purple-200/50 flex items-center justify-center text-purple-600 active:scale-95 transition-transform"
            aria-label={manuallyPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          >
            {manuallyPaused ? <PlayIcon /> : <PauseIcon />}
          </button>
        </div>
      </div>

      {/* SVG clipPath definition for curved-triangle category images */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden>
        <defs>
          <clipPath id="category-curved-triangle" clipPathUnits="objectBoundingBox">
            <path d="M 0.5,0.05 C 0.76,0.05 0.90,0.66 0.80,0.78 C 0.72,0.88 0.25,0.86 0.14,0.68 C 0.05,0.52 0.22,0.05 0.5,0.05 Z" />
          </clipPath>
        </defs>
      </svg>
    </section>
  );
}