'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { useAppSelector, useCartCount } from '@/lib/hooks';
import CategoryDropdown from './CategoryDropdown';

interface DesktopNavbarProps {
  categories: any[];
  onOpenLogin: () => void;
  onOpenProfile: () => void;
}

function CollapseMenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="2" y="4" width="10" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="2" y="9.25" width="10" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="2" y="14.5" width="10" height="1.5" rx="0.75" fill="currentColor" />
      <path d="M15 7l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21C12 21 3 14.5 3 8.5C3 5.46 5.46 3 8.5 3C10.24 3 11.8 3.94 12 5C12.2 3.94 13.76 3 15.5 3C18.54 3 21 5.46 21 8.5C21 14.5 12 21 12 21Z"
        fill={filled ? '#9d4ae3' : 'none'}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 23 21"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <g fill={filled ? '#9d4ae3' : 'currentColor'}>
        <rect x="0" y="0" width="1" height="1" />
        <rect x="0" y="1" width="2" height="1" />
        <rect x="0" y="2" width="2" height="1" />
        <rect x="1" y="3" width="1" height="1" />
        <rect x="1" y="4" width="20" height="1" />
        <rect x="1" y="5" width="22" height="1" />
        <rect x="1" y="6" width="2" height="1" />
        <rect x="21" y="6" width="2" height="1" />
        <rect x="2" y="7" width="1" height="1" />
        <rect x="21" y="7" width="2" height="1" />
        <rect x="2" y="8" width="1" height="1" />
        <rect x="21" y="8" width="2" height="1" />
        <rect x="2" y="9" width="2" height="1" />
        <rect x="21" y="9" width="2" height="1" />
        <rect x="2" y="10" width="2" height="1" />
        <rect x="21" y="10" width="1" height="1" />
        <rect x="3" y="11" width="1" height="1" />
        <rect x="21" y="11" width="1" height="1" />
        <rect x="3" y="12" width="1" height="1" />
        <rect x="9" y="12" width="7" height="1" />
        <rect x="20" y="12" width="2" height="1" />
        <rect x="3" y="13" width="2" height="1" />
        <rect x="20" y="13" width="1" height="1" />
        <rect x="4" y="14" width="1" height="1" />
        <rect x="19" y="14" width="2" height="1" />
        <rect x="4" y="15" width="3" height="1" />
        <rect x="18" y="15" width="2" height="1" />
        <rect x="6" y="16" width="13" height="1" />
        <rect x="8" y="19" width="2" height="1" />
        <rect x="14" y="19" width="2" height="1" />
        <rect x="9" y="20" width="1" height="1" />
        <rect x="15" y="20" width="1" height="1" />
      </g>
    </svg>
  );
}

export default function DesktopNavbar({ categories, onOpenLogin, onOpenProfile }: DesktopNavbarProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const catBtnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const cartCount = useCartCount();
  const wishlistCount = useAppSelector((state) => state.wishlist.count);
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const onWishlist = pathname === '/wishlist';
  const onCart = pathname === '/cart';

  function checkScroll() {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }

  function scrollByAmount(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * 240, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/categories/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="relative hidden w-full bg-white md:block">
      {/* ── Row 2: logo / search / icons ── */}
      <div className="border-b border-neutral-100 w-full bg-white">
        <div className="w-full px-4 md:px-12 flex justify-between items-center gap-6 py-3.5 mx-auto">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/fa_logo_brand.png"
              alt="Faflora"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search bar — clean border line, no shadow, no inner division line */}
          <div
            className={`flex w-[40%] items-center overflow-hidden rounded-full border bg-white transition-all duration-200 ${
              searchFocused ? '!border-brand-600' : 'border-neutral-300 hover:border-brand-300'
            }`}
          >
            <input
              type="text"
              placeholder="Search for products, brands or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-transparent px-5 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:!outline-none focus:!ring-0 focus:!border-0"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 hover:bg-brand-700 text-white mr-3 cursor-pointer active:scale-95 transition-all"
              aria-label="Search"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M10 10.5L14 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Action icons — custom SVGs with no circular borders or background */}
          <div className="flex shrink-0 items-center gap-4">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className={`relative flex items-center justify-center p-1 transition-colors ${
                onWishlist ? 'text-brand-600' : 'text-neutral-600 hover:text-brand-600'
              }`}
              aria-label="Wishlist"
            >
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-sm">
                {wishlistCount}
              </span>
              <HeartIcon filled={onWishlist} />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className={`relative flex items-center justify-center p-1 transition-colors ${
                onCart ? 'text-brand-600' : 'text-neutral-600 hover:text-brand-600'
              }`}
              aria-label="Cart"
            >
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-sm">
                {cartCount}
              </span>
              <CartIcon filled={onCart} />
            </Link>

            {/* Account Profile Section */}
            {isAuthenticated && user ? (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2.5 group cursor-pointer hover:opacity-80 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-brand-600 to-brand-800 text-white flex items-center justify-center text-sm font-semibold shadow-md shrink-0">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <span className="text-sm font-semibold text-neutral-700 group-hover:text-brand-600 transition-colors whitespace-nowrap">
                  {user.firstName} {user.lastName}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2.5 group cursor-pointer hover:opacity-85 transition-all text-left"
              >
                <Image
                  src="/icons/Frame.png"
                  alt="Account"
                  width={30}
                  height={30}
                  className="rounded-full border border-neutral-200"
                />
                <span className="text-sm leading-tight text-neutral-700">
                  Get Started<br />
                  <span className="font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors">Orders &amp; Account</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: categories strip ── */}
      <div className="border-b border-neutral-100 w-full bg-white">
        <div className="w-full px-4 md:px-12 flex items-center py-2 text-sm text-neutral-700 relative mx-auto">
          {/* Categories dropdown button */}
          <div className="relative shrink-0">
            <button
              ref={catBtnRef}
              type="button"
              onClick={() => setCategoriesOpen((v) => !v)}
              className="flex items-center gap-2 font-bold text-brand-700 hover:text-brand-800 transition-colors mr-4 py-1"
            >
              <CollapseMenuIcon />
              <span>Categories</span>
            </button>

            {/* Category dropdown positioned directly below the button */}
            {categoriesOpen && (
              <CategoryDropdown
                categories={categories}
                onClose={() => setCategoriesOpen(false)}
                anchorRef={catBtnRef}
              />
            )}
          </div>

          {/* Scrollable category name strip */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex flex-1 gap-7 overflow-x-auto scrollbar-hide scroll-smooth py-1 min-w-0"
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="shrink-0 font-medium text-neutral-600 hover:text-brand-600 transition-colors whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Scroll buttons on the far right with slightly more space in between them (gap-2.5) */}
          <div className="flex items-center gap-2.5 shrink-0 ml-4">
            <button
              type="button"
              onClick={() => scrollByAmount(-1)}
              aria-label="Scroll categories left"
              className={`flex items-center justify-center w-8 h-8 rounded-l-lg border border-r-0 transition-all font-bold text-base ${
                canScrollLeft
                  ? 'bg-brand-600 hover:bg-brand-700 text-white border-brand-600 cursor-pointer'
                  : 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
              }`}
            >
              &#8249;
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(1)}
              aria-label="Scroll categories right"
              className={`flex items-center justify-center w-8 h-8 rounded-r-lg border transition-all font-bold text-base ${
                canScrollRight
                  ? 'bg-brand-600 hover:bg-brand-700 text-white border-brand-600 cursor-pointer active:scale-95'
                  : 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
              }`}
            >
              &#8250;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
