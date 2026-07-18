'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useEffect, useRef } from 'react';

interface CategoryDropdownProps {
  categories: any[];
  onClose: () => void;
  /** ref of the Categories button so modal can be positioned directly below it */
  anchorRef?: React.RefObject<HTMLButtonElement>;
}

const FEATURED_SLUG = '__featured__';

// Popular product chips from Popular Products section to add under Featured
const FEATURED_CHIPS = [
  { name: 'All Products', href: '/categories/shop' },
  { name: 'Smartphones', href: '/categories/mobile-phones--accessories?subcategory=smartphones' },
  { name: 'Drones', href: '/categories/photography--video?subcategory=drones' },
  { name: 'Handbags', href: '/categories/bags--luggage?subcategory=handbags' },
  { name: 'Watches', href: '/categories/jewelry--fashion-accessories?subcategory=watches' },
  { name: 'Sneakers', href: '/categories/fashion?subcategory=sneakers' },
  { name: 'Headphones', href: '/categories/electronics?subcategory=headphones' },
  { name: 'Skincare', href: '/categories/beauty?subcategory=skincare' },
  { name: 'Laptops', href: '/categories/electronics?subcategory=laptops' },
  { name: 'Fragrances', href: '/categories/beauty?subcategory=fragrances' },
];

export function CategoryImage({ src, alt, size = 36 }: { src: string; alt: string; size?: number }) {
  const [imgSrc, setImgSrc] = useState(src || '/images/product_cover_image.png');

  useEffect(() => {
    setImgSrc(src || '/images/product_cover_image.png');
  }, [src]);

  return (
    <span
      className="relative flex items-center justify-center bg-brand-600 shrink-0"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        clipPath: 'url(#curved-triangle)',
      }}
    >
      <span
        className="relative flex items-center justify-center bg-white overflow-hidden"
        style={{
          width: `${size - 4}px`,
          height: `${size - 4}px`,
          clipPath: 'url(#curved-triangle)',
        }}
      >
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setImgSrc('/images/product_cover_image.png')}
          aria-hidden
          unoptimized={imgSrc.startsWith('http')}
        />
      </span>
    </span>
  );
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
      className="absolute top-full left-0 z-50 mt-1 flex w-[780px] max-w-[96vw] overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_-8px_rgba(157,74,227,0.22)] ring-1 ring-neutral-100"
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
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 shrink-0">
            <Image
              src="/icons/solar_star-fall-bold-duotone.png"
              alt=""
              width={18}
              height={18}
              aria-hidden
            />
          </span>
          <span className="text-sm font-semibold">Featured</span>
        </button>

        {categories.map((category) => (
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
        ))}
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
