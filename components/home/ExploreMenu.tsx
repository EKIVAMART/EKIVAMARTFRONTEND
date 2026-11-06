'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
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
    <summary>Explore EkivaMart <ChevronDown size={14} aria-hidden="true" /></summary>
    <nav aria-label="Explore EkivaMart" onClick={() => { if (menu.current) menu.current.open = false; }}>
      <Link href="/stores">Featured stores</Link>
      <Link href="/why-ekivamart">Why shop with EkivaMart?</Link>
    </nav>
  </details>;
}
