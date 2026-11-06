'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface MarketplaceRailProps {
  children: ReactNode;
  title?: string;
  href?: string;
  linkLabel?: string;
  products?: boolean;
  caption?: ReactNode;
  id?: string;
}

export default function MarketplaceRail({
  children, title = 'Shop by category', href = '/categories/shop',
  linkLabel = 'Shop all products', products = false, caption, id,
}: MarketplaceRailProps) {
  const uniqueId = useId();
  const titleId = products ? uniqueId + '-title' : 'categories-title';
  const trackId = products ? uniqueId + '-track' : 'category-track';
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const row = track.current;
    if (!row) return;
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
  }, []);

  function slide(direction: number) {
    const row = track.current;
    if (!row) return;
    row.scrollBy({ left: direction * row.clientWidth, behavior: 'auto' });
  }

  return (
    <section className="ek-section" id={id} aria-labelledby={titleId}>
      <div className="ek-section-heading ek-rail-heading">
        <h2 id={titleId}>{title}</h2>
        <div className="ek-rail-actions">
          <Link href={href}>{linkLabel}</Link>
          <button hidden={atStart && atEnd} aria-label={products ? 'Previous products' : 'Previous categories'} aria-controls={trackId} disabled={atStart} onClick={() => slide(-1)}><ChevronLeft size={18} /></button>
          <button hidden={atStart && atEnd} aria-label={products ? 'Next products' : 'Next categories'} aria-controls={trackId} disabled={atEnd} onClick={() => slide(1)}><ChevronRight size={18} /></button>
        </div>
      </div>
      {caption}
      <div id={trackId} className={products ? "ek-category-track ek-merch-track" : "ek-category-track"} ref={track}>{children}</div>
    </section>
  );
}
