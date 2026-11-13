'use client';

import ShoppingNavLink from './ShoppingNavLink';
import { UserRound, Menu, Search } from '@/components/ui/platform-icons';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useAppSelector, useCartCount } from '@/lib/hooks';
import CategoryDropdown from './CategoryDropdown';
import MarketplaceNav from './MarketplaceNav';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface DesktopNavbarProps {
  categories: any[];
  onOpenLogin: () => void;
  onOpenProfile: () => void;
}

function CollapseMenuIcon() {
  return (
    <Menu size={20} aria-hidden="true" />
  );
}

export default function DesktopNavbar({ categories, onOpenLogin, onOpenProfile }: DesktopNavbarProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const catBtnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const cartCount = useCartCount();
  const wishlistCount = useAppSelector((state) => state.wishlist.count);
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const onWishlist = pathname === '/wishlist';
  const onCart = pathname === '/cart';

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
              src="/brand/ekivamart-logo.svg"
              alt="EkivaMart"
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
              <Search size={15} aria-hidden="true" />
            </button>
          </div>

          {/* Shopping and account actions */}
          <div className="flex shrink-0 items-center gap-4">
            <ShoppingNavLink href="/wishlist" active={onWishlist} count={wishlistCount} />

            <ShoppingNavLink href="/cart" active={onCart} count={cartCount} />

            {/* In-App Notifications Bell (Renders strictly for authenticated users) */}
            <NotificationBell />


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
                <UserRound aria-hidden="true" size={22} strokeWidth={1.75} className="text-stone-700" />
                <span className="text-sm leading-tight text-neutral-700">
                  Sign in<br />
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
          <div className="flex flex-1 gap-7 overflow-x-auto scrollbar-hide py-1 min-w-0">
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

          <MarketplaceNav />
        </div>
      </div>
    </div>
  );
}
