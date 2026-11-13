'use client';

import Link from 'next/link';
import { ChevronDown, Compass } from '@/components/ui/platform-icons';
import { useEffect, useRef } from 'react';

export default function ExploreMenu() {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false;
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  return <details ref={menu} className="ek-explore-menu" onKeyDown={event => {
    if (event.key === 'Escape' && menu.current?.open) {
      menu.current.open = false;
      menu.current.querySelector('summary')?.focus();
    }
  }}>
    <summary className="ek-market-nav-item">
      <Compass size={16} aria-hidden="true" />
      <span>Explore<span className="ek-market-nav-wide"> EkivaMart</span></span>
      <ChevronDown className="ek-explore-chevron" size={13} aria-hidden="true" />
    </summary>
    <div className="ek-explore-links">
      <Link href="/stores" onClick={() => { if (menu.current) menu.current.open = false; }}>Featured stores</Link>
      <Link href="/why-ekivamart" onClick={() => { if (menu.current) menu.current.open = false; }}>Why shop with EkivaMart?</Link>
      <Link href="/blog" onClick={() => { if (menu.current) menu.current.open = false; }}>Blog</Link>
    </div>
  </details>;
}
