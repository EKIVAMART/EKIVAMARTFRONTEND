'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logout } from '@/lib/features/auth/authSlice';
import { authApi } from '@/lib/api';
import { LogOut, User } from 'lucide-react';

interface MobileCategorySidebarProps {
  categories: any[];
  open: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

const FEATURED_SLUG = '__featured__';

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

function CategoryImage({ src, alt, size = 32 }: { src: string; alt: string; size?: number }) {
  const [imgSrc, setImgSrc] = useState(src || '/images/product_cover_image.png');
  useEffect(() => { setImgSrc(src || '/images/product_cover_image.png'); }, [src]);

  return (
    <span
      className="relative flex items-center justify-center bg-brand-600 shrink-0"
      style={{ width: `${size}px`, height: `${size}px`, clipPath: 'url(#curved-triangle)' }}
    >
      <span
        className="relative flex items-center justify-center bg-white overflow-hidden"
        style={{ width: `${size - 4}px`, height: `${size - 4}px`, clipPath: 'url(#curved-triangle)' }}
      >
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setImgSrc('/images/product_cover_image.png')}
          unoptimized={imgSrc.startsWith('http')}
          aria-hidden
        />
      </span>
    </span>
  );
}

export default function MobileCategorySidebar({
  categories,
  open,
  onClose,
  onOpenLogin,
}: MobileCategorySidebarProps) {
  const [activeSlug, setActiveSlug] = useState<string>(FEATURED_SLUG);
  const activeCategory = categories.find((c) => c.slug === activeSlug);

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleLogout = async () => {
    try {
      await authApi.logoutCurrentSession();
      dispatch(logout());
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close categories"
        onClick={onClose}
        className={`absolute inset-0 bg-neutral-900/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Panel */}
      <div
        className={`absolute left-0 top-0 flex h-full w-[85vw] max-w-[340px] flex-col bg-white shadow-[4px_0_40px_-4px_rgba(0,0,0,0.2)] transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header — purple title */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3.5 shrink-0">
          <h2 className="text-base font-bold text-brand-700">Shop By Category</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-xl leading-none text-neutral-400 hover:text-neutral-700 cursor-pointer p-1 rounded-lg hover:bg-neutral-100 transition-all"
          >
            &times;
          </button>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Category rail */}
          <div className="w-[44%] shrink-0 border-r border-neutral-100 overflow-y-auto py-2 bg-neutral-50/60 scrollbar-none">
            {/* Featured */}
            <button
              type="button"
              onClick={() => setActiveSlug(FEATURED_SLUG)}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-all ${
                activeSlug === FEATURED_SLUG
                  ? 'bg-brand-50 text-brand-700 font-bold border-l-[3px] border-brand-600'
                  : 'border-l-[3px] border-transparent text-neutral-700 font-semibold hover:bg-neutral-100'
              }`}
            >
              {/* Star icon using same curved border shape */}
              <span
                className="flex items-center justify-center bg-brand-600 shrink-0"
                style={{ width: 32, height: 32, clipPath: 'url(#curved-triangle)' }}
              >
                <span
                  className="flex items-center justify-center bg-brand-100"
                  style={{ width: 28, height: 28, clipPath: 'url(#curved-triangle)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M8 1l1.8 3.6L14 5.5l-3 2.9.7 4.1L8 10.4l-3.7 2.1.7-4.1-3-2.9 4.2-.9z" fill="#9d4ae3"/>
                  </svg>
                </span>
              </span>
              <span className="text-xs leading-tight">Featured</span>
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveSlug(category.slug)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-all ${
                  activeSlug === category.slug
                    ? 'bg-brand-50 text-brand-700 font-bold border-l-[3px] border-brand-600'
                    : 'border-l-[3px] border-transparent text-neutral-700 font-medium hover:bg-neutral-100'
                }`}
              >
                <CategoryImage src={category.imageUrl} alt={category.name} size={32} />
                {/* Full name — no truncation, wraps naturally */}
                <span className="text-xs leading-tight break-words min-w-0">
                  {category.name}
                </span>
              </button>
            ))}
          </div>

          {/* Subcategory panel */}
          <div className="flex-1 overflow-y-auto p-3 bg-white">
            {activeSlug === FEATURED_SLUG ? (
              <div className="pt-1">
                <Link
                  href="/categories/shop"
                  onClick={onClose}
                  className="block mb-3 rounded-full bg-brand-600 text-white text-center text-xs font-bold py-1.5 px-3 hover:bg-brand-700 transition-all"
                >
                  All Products
                </Link>

                <div className="flex flex-wrap gap-2">
                  {FEATURED_CHIPS.slice(1).map((chip) => (
                    <Link
                      key={chip.name}
                      href={chip.href}
                      onClick={onClose}
                      className="rounded-full bg-white border border-neutral-200 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-all"
                    >
                      {chip.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pt-1">
                <Link
                  href={`/categories/${activeCategory?.slug}`}
                  onClick={onClose}
                  className="block mb-3 rounded-full bg-brand-600 text-white text-center text-xs font-bold py-1.5 px-3 hover:bg-brand-700 transition-all"
                >
                  All {activeCategory?.name}
                </Link>

                {activeCategory?.subcategories && activeCategory.subcategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeCategory.subcategories.map((sub: any) => (
                      <Link
                        key={sub.id}
                        href={`/categories/${activeCategory.slug}?subcategory=${sub.slug}`}
                        onClick={onClose}
                        className="rounded-full bg-white border border-neutral-200 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-all"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-neutral-400 italic">No subcategories</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer: profile card + logout */}
        <div className="border-t border-neutral-100 px-4 py-3 shrink-0 bg-neutral-50/50 space-y-2.5">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl p-3 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-brand-600 to-brand-800 text-white flex items-center justify-center text-sm font-semibold shrink-0 shadow-md">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-800 truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger-500 hover:bg-danger-50 py-2.5 text-sm font-bold text-danger-500 cursor-pointer active:scale-95 transition-all"
              >
                <LogOut size={15} />
                Log out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => { onClose(); onOpenLogin(); }}
              className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-800 hover:opacity-90 text-white font-bold py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all shadow-md"
            >
              <User size={15} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
