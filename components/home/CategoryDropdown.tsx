'use client';

import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useEffect, useRef } from 'react';

interface CategoryDropdownProps {
  categories: any[];
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLButtonElement | null>;
}

const FEATURED_SLUG = '__featured__';

// Popular product chips from Popular Products section to add under Featured
export const FEATURED_CHIPS = [
  { name: 'All products', href: '/categories/shop' },
  { name: 'Fashion', href: '/categories/fashion' },
  { name: 'Electronics', href: '/categories/electronics' },
  { name: 'Footwear', href: '/categories/footwear' },
  { name: 'Bags & Luggage', href: '/categories/bags-luggage' },
  { name: 'Home & Kitchen', href: '/categories/home-kitchen' },
  { name: 'Beauty & Cosmetics', href: '/categories/beauty-cosmetics' },
];

export function CategoryImage({ src, size = 36 }: { src: string; alt: string; size?: number }) {
  return <Image src={src} alt="" width={size} height={size} className="shrink-0 rounded object-contain" />;
}

export default function CategoryDropdown({ categories, onClose, anchorRef }: CategoryDropdownProps) {
  const [activeSlug, setActiveSlug] = useState<string>(FEATURED_SLUG);
  const activeCategory = categories.find((c) => c.slug === activeSlug);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !(anchorRef?.current?.contains(e.target as Node))
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, anchorRef]);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 z-50 mt-1 flex w-[780px] max-w-[96vw] overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_-8px_rgba(24,28,24,0.12)] ring-1 ring-neutral-100"
      style={{ minHeight: '320px' }}
    >
      {/* Left rail */}
      <div className="max-h-[460px] w-64 shrink-0 overflow-y-auto border-r border-neutral-100 bg-neutral-50/60 py-2 scrollbar-thin">
        {/* Featured */}
        <button
          type="button"
          onMouseEnter={() => setActiveSlug(FEATURED_SLUG)}
          onClick={() => setActiveSlug(FEATURED_SLUG)}
          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-all ${
            activeSlug === FEATURED_SLUG
              ? 'bg-brand-50 border-l-[3px] border-brand-600 text-brand-700 font-bold'
              : 'border-l-[3px] border-transparent text-neutral-800 hover:bg-neutral-100 font-medium'
          }`}
        >
          <LayoutGrid size={36} strokeWidth={1.5} className="p-2 text-stone-700" aria-hidden="true" />
          <span className="text-sm font-semibold">Featured</span>
        </button>

        {categories.map((category) => {
          
          return (
            <button
              key={category.id}
              type="button"
              onMouseEnter={() => setActiveSlug(category.slug)}
              onClick={() => setActiveSlug(category.slug)}
              className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-all ${
                activeSlug === category.slug
                  ? 'bg-brand-50 border-l-[3px] border-brand-600 text-brand-700 font-bold'
                  : 'border-l-[3px] border-transparent text-neutral-700 hover:bg-neutral-100 font-medium'
              }`}
            >
              <CategoryImage src={category.imageUrl} alt={category.name} size={36} />
              <span className="text-sm leading-tight">{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Right panel */}
      <div className="flex-1 max-h-[460px] overflow-y-auto bg-white">
        {activeSlug === FEATURED_SLUG ? (
          <div className="p-5">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[3px] text-brand-600/70">Popular</p>
            <div className="flex flex-wrap gap-2">
              {FEATURED_CHIPS.map((chip) => (
                <Link
                  key={chip.name}
                  href={chip.href}
                  onClick={onClose}
                  className="rounded-full bg-white text-neutral-700 border border-neutral-200 hover:border-brand-400 hover:text-brand-700 px-4 py-1.5 text-xs font-semibold transition-all"
                >
                  {chip.name}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5">
            <Link
              href={`/categories/${activeCategory?.slug}`}
              onClick={onClose}
              className="mb-4 flex items-center gap-2 text-brand-700 hover:text-brand-800 group transition-all"
            >
              <span className="text-sm font-bold group-hover:underline">All {activeCategory?.name}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            {activeCategory?.subcategories && activeCategory.subcategories.length > 0 ? (
              <>
                <p className="mb-2.5 text-[10px] font-black uppercase tracking-[3px] text-neutral-400">Subcategories</p>
                <div className="flex flex-wrap gap-2">
                  {activeCategory.subcategories.map((sub: any) => (
                    <Link
                      key={sub.id}
                      href={`/categories/${activeCategory.slug}?subcategory=${sub.slug}`}
                      onClick={onClose}
                      className="rounded-full bg-neutral-50 border border-neutral-200 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 px-4 py-1.5 text-xs font-semibold text-neutral-600 transition-all"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <span className="text-xs text-neutral-400 italic">No subcategories found</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}