'use client';

import ShoppingNavLink from './ShoppingNavLink';
import { UserRound } from 'lucide-react';
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
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-brand-200 scrollbar-track-brand-50/60 [scrollbar-width:thin] [scrollbar-color:rgba(157,74,227,0.35)_rgba(157,74,227,0.08)]">
        <div className="flex w-max min-w-full items-center bg-white px-3.5 py-2.5 relative border-b border-neutral-100 gap-2 min-w-0">

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
              src="/brand/ekivamart-logo.svg"
              alt="EkivaMart"
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

          <ShoppingNavLink href="/wishlist" active={onWishlist} count={wishlistCount} />

          <ShoppingNavLink href="/cart" active={onCart} count={cartCount} />

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
              <UserRound aria-hidden="true" size={22} strokeWidth={1.75} className="text-stone-700" />
            </button>
          )}
          </div>
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
