'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from '@/components/ui/platform-icons';
import Link from 'next/link';

interface MarketplaceRailProps {
  children: ReactNode;
  title?: string;
  href?: string;
  linkLabel?: string;
  products?: boolean;
  caption?: ReactNode;
  id?: string;
  loopCards?: ReactNode;
  loading?: boolean;
}

export default function MarketplaceRail({
  children, title = 'Shop by category', href = '/categories/shop',
  linkLabel = 'Shop all products', products = false, caption, id, loopCards, loading = false,
}: MarketplaceRailProps) {
  const uniqueId = useId();
  const titleId = products ? uniqueId + '-title' : 'categories-title';
  const trackId = products ? uniqueId + '-track' : 'category-track';
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const loops = Boolean(loopCards);

  useEffect(() => {
    const row = track.current;
    if (loops || !row) return;
    function update() {
      if (!row) return;
      setAtStart(row.scrollLeft <= 1);
      setAtEnd(row.scrollLeft + row.clientWidth >= row.scrollWidth - 1);
    }
    const observer = new ResizeObserver(update);
    observer.observe(row);
    row.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      row.removeEventListener('scroll', update);
    };
  }, [loops, loading]);

  useEffect(() => {
    const row = track.current;
    if (!loops || !row) return;
    const first = row.firstElementChild as HTMLElement | null;
    const copy = row.querySelector<HTMLElement>('.ek-category-copy');
    if (!first || !copy) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canHover = window.matchMedia('(any-hover: hover)');
    let frame = 0;
    let previous = 0;
    let remainder = 0;
    let resumeAfter = 0;

    function defer() {
      resumeAfter = performance.now() + 1800;
    }

    const advance = (time: number) => {
      frame = requestAnimationFrame(advance);
      const elapsed = previous ? Math.min(time - previous, 50) : 0;
      previous = time;
      if (reducedMotion.matches || time < resumeAfter || row.matches(':focus-within, :active') ||
          (canHover.matches && row.matches(':hover'))) return;

      const distance = remainder + elapsed * 0.048;
      const pixels = Math.floor(distance);
      remainder = distance - pixels;
      if (!pixels) return;

      const loopWidth = copy.offsetLeft - first.offsetLeft;
      if (loopWidth > row.clientWidth) {
        row.scrollLeft = (row.scrollLeft + pixels) % loopWidth;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (entry.isIntersecting) frame = requestAnimationFrame(advance);
    });
    observer.observe(row);
    row.addEventListener('pointerdown', defer, { passive: true });
    row.addEventListener('wheel', defer, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      row.removeEventListener('pointerdown', defer);
      row.removeEventListener('wheel', defer);
    };
  }, [loops]);

  function slide(direction: number) {
    const row = track.current;
    if (!row) return;
    row.scrollBy({ left: direction * row.clientWidth, behavior: 'auto' });
  }

  return (
    <section className="ek-section" id={id} aria-labelledby={titleId} aria-busy={loading || undefined}>
      <div className="ek-section-heading ek-rail-heading">
        <h2 id={titleId}>{title}</h2>
        <div className="ek-rail-actions">
          <Link href={href}>{linkLabel}</Link>
          {!loops && !loading && (
            <>
              <button hidden={atStart && atEnd} aria-label={products ? 'Previous products' : 'Previous categories'} aria-controls={trackId} disabled={atStart} onClick={() => slide(-1)}><ChevronLeft size={18} /></button>
              <button hidden={atStart && atEnd} aria-label={products ? 'Next products' : 'Next categories'} aria-controls={trackId} disabled={atEnd} onClick={() => slide(1)}><ChevronRight size={18} /></button>
            </>
          )}
        </div>
      </div>
      {caption}
      {loading && <span className="sr-only" role="status">Loading {title.toLowerCase()} products</span>}
      <div id={trackId} className={`ek-category-track${products ? ' ek-merch-track' : ''}${loops ? ' ek-category-loop' : ''}`} ref={track}>
        {children}
        {loopCards}
      </div>
    </section>
  );
}
