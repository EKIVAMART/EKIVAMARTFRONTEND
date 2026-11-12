'use client';

import { LayoutGrid, Store } from 'lucide-react';
import Link from 'next/link';

export default function MobileSecondaryNav({ onOpenCategories }: { onOpenCategories: () => void }) {
  const itemClass = 'flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-1 text-[13px] font-semibold text-stone-700 focus-visible:outline-2 focus-visible:outline-green-700';

  return (
    <nav aria-label="Shopping navigation" className="ek-mobile-secondary flex items-center gap-1.5 border-b border-neutral-100 bg-white px-2.5 py-1.5 md:hidden">
      <button type="button" onClick={onOpenCategories} className={`${itemClass} ek-mobile-categories`} aria-label="Browse categories">
        <LayoutGrid size={19} strokeWidth={1.8} aria-hidden="true" /><span>Categories</span>
      </button>
      <Link href="/#special-offers" aria-label="Offers" className={`${itemClass} ek-mobile-offers`}>
        <span className="sr-only">Offers</span>
      </Link>
      <Link href="/become-a-vendor" className={`${itemClass} ek-mobile-sell`}>
        <Store size={19} strokeWidth={1.8} aria-hidden="true" /><span>Sell</span>
      </Link>
    </nav>
  );
}
