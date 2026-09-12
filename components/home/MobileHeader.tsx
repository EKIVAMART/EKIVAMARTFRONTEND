'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAppSelector, useCartCount } from '@/lib/hooks';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface MobileHeaderProps {
  categories: any[];
  onOpenCategories: () => void;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
}

function CollapseMenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <rect x="2" y="5" width="11" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="2" y="10.2" width="11" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="2" y="15.4" width="11" height="1.6" rx="0.8" fill="currentColor" />
      <path d="M16 8l4 3-4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 12.5L17 17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
      width="22"
      height="22"
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

export default function MobileHeader({
  categories,
  onOpenCategories,
  onOpenLogin,
  onOpenProfile,
}: MobileHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Category scroller properties
  const catScrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1 representing scroll position

  const cartCount = useCartCount();
  const wishlistCount = useAppSelector((state) => state.wishlist.count);
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const onWishlist = pathname === '/wishlist';
  const onCart = pathname === '/cart';

  // Check scroll position and calculate progress from 0 to 1
  const checkScroll = () => {
    const el = catScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
    } else {
      setScrollProgress(scrollLeft / maxScroll);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  // Close search on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [searchOpen]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/categories/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  // Get active category slug from pathname
  const activeCatSlug = (() => {
    const match = pathname.match(/^\/categories\/([^/?]+)/);
    return match ? match[1] : null;
  })();

  return (
    <div className="md:hidden w-full bg-white relative z-40">
      {/* ── Row 2: Categories | logo | action icons with equal spacing in between them, logo moved closer to left ── */}
      <div className="flex w-full items-center bg-white px-3.5 py-2.5 relative border-b border-neutral-100 gap-2 min-w-0">
        
        {/* Categories button */}
        <button
          type="button"
          onClick={onOpenCategories}
          aria-label="Open categories"
          className="flex items-center gap-1 text-brand-600 font-bold text-xs shrink-0"
        >
          <CollapseMenuIcon />
          <span>Categories</span>
        </button>

        {/* Logo (moved left, close to categories but with equal layout spacing) */}
        <Link href="/" className="flex items-center shrink-0 ml-[5%] mr-auto">
          <Image
            src="/fa_logo_brand.png"
            alt="Faflora"
            width={82}
            height={26}
            className="h-6.5 w-auto object-contain"
            priority
          />
        </Link>

        {/* 4 icons group (placed close to the searchbar/other icons on the right) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Search"
            className={`p-0.5 transition-colors cursor-pointer ${
              searchOpen ? 'text-brand-600' : 'text-neutral-700 hover:text-brand-600'
            }`}
          >
            <SearchIcon />
          </button>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className={`relative flex items-center justify-center p-0.5 transition-colors ${
              onWishlist ? 'text-brand-600' : 'text-neutral-700'
            }`}
          >
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white shadow-sm">
              {wishlistCount}
            </span>
            <HeartIcon filled={onWishlist} />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className={`relative flex items-center justify-center p-0.5 transition-colors ${
              onCart ? 'text-brand-600' : 'text-neutral-700'
            }`}
          >
            <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white shadow-sm">
              {cartCount}
            </span>
            <CartIcon filled={onCart} />
          </Link>

          {/* In-App Notifications Bell (Renders strictly for authenticated users) */}
          <NotificationBell />

          {/* Account Icon */}

          {isAuthenticated && user ? (
            <button
              type="button"
              onClick={onOpenProfile}
              aria-label="Account"
              className="relative shrink-0 flex items-center justify-center"
            >
              <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-800 text-white flex items-center justify-center text-[9px] font-extrabold shadow-sm">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              aria-label="Account"
              className="relative shrink-0 flex items-center justify-center p-0.5"
            >
              <Image src="/icons/Frame.png" alt="Account" width={20} height={20} className="rounded-full" />
            </button>
          )}
        </div>
      </div>

      {/* ── Row 3: Horizontal category names strip (no underline, no scroll buttons, allow swipe scrolling) ── */}
      <div className="w-full bg-white flex flex-col border-t border-neutral-100">
        <div
          ref={catScrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-4 py-3 min-w-0"
        >
          {categories.map((cat) => {
            const isActive = activeCatSlug === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={`shrink-0 whitespace-nowrap text-xs font-semibold transition-all ${
                  isActive ? 'text-brand-600' : 'text-neutral-600 hover:text-brand-600'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Fixed horizontal line progress bar that moves along the entire bottom navbar width */}
        <div className="w-full h-1 bg-neutral-100 relative overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full absolute top-0 transition-all duration-75"
            style={{
              width: '60px',
              left: `calc(${scrollProgress * 100}% - ${scrollProgress * 60}px)`,
            }}
          />
        </div>
      </div>

      {/* ── Row 3.5: Search bar dropdown positioned directly underneath the entire navbar ── */}
      {searchOpen && (
        <div
          ref={searchContainerRef}
          className="absolute left-0 right-0 top-full z-50 bg-white border-b border-brand-100 shadow-xl px-4 py-3 flex items-center gap-2"
        >
          <div className="flex-1 flex items-center bg-neutral-50 rounded-full px-3 py-1.5 border border-neutral-200">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              autoFocus
              className="w-full bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:!border-none !border-none !outline-none active:!border-none focus:!ring-0"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className={`p-1.5 rounded-full transition-all shrink-0 ${
                searchQuery.trim()
                  ? 'bg-brand-600 text-white cursor-pointer active:scale-95'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <SearchIcon size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 shrink-0 px-1 py-1"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
