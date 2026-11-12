'use client';

import ShoppingNavLink from './ShoppingNavLink';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAppSelector, useCartCount } from '@/lib/hooks';
import { Menu, Search, UserRound, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';

interface MobileHeaderProps {
  onOpenLogin: () => void;
  onOpenProfile: () => void;
}

export default function MobileHeader({ onOpenLogin, onOpenProfile }: MobileHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const cartCount = useCartCount();
  const wishlistCount = useAppSelector((state) => state.wishlist.count);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/categories/shop?search=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="ek-mobile-header relative w-full bg-white md:hidden">
      <div className="ek-mobile-header-row flex min-h-14 items-center justify-between gap-1 border-b border-neutral-100 px-2.5">
        <Link href="/" onClick={() => { setMenuOpen(false); setSearchOpen(false); }} aria-label="EkivaMart home" className="flex min-h-11 min-w-0 shrink items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">
          <Image src="/brand/ekivamart-logo.svg" alt="EkivaMart" width={122} height={39} priority className="ek-mobile-logo h-auto w-full max-w-[122px] object-contain" />
        </Link>
        <div className="ek-mobile-actions flex shrink-0 items-center">
          <button type="button" aria-label={searchOpen ? 'Close search' : 'Search products'} aria-expanded={searchOpen} aria-controls="mobile-product-search" onClick={() => { setSearchOpen((open) => !open); setMenuOpen(false); }} className="ek-mobile-icon-button flex h-11 w-11 items-center justify-center rounded-md text-stone-700 hover:text-green-800 focus-visible:outline-2 focus-visible:outline-green-700">
            <Search size={23} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <ShoppingNavLink href="/wishlist" active={pathname === '/wishlist'} count={wishlistCount} />
          <ShoppingNavLink href="/cart" active={pathname === '/cart'} count={cartCount} />
          <div ref={menuRef} className="relative">
            <button type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-main-menu" onClick={() => { setMenuOpen((open) => !open); setSearchOpen(false); }} className="ek-mobile-icon-button flex h-11 w-11 items-center justify-center rounded-md text-stone-700 hover:text-green-800 focus-visible:outline-2 focus-visible:outline-green-700">
              {menuOpen ? <X size={24} strokeWidth={1.8} aria-hidden="true" /> : <Menu size={24} strokeWidth={1.8} aria-hidden="true" />}
            </button>
            {menuOpen && (
              <nav id="mobile-main-menu" aria-label="More navigation" className="ek-mobile-menu absolute right-0 top-full z-50 w-[min(290px,calc(100vw-20px))] rounded-b-xl border border-neutral-100 bg-white p-2 shadow-xl">
                <button type="button" onClick={() => { setMenuOpen(false); if (isAuthenticated) onOpenProfile(); else onOpenLogin(); }} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-stone-800 hover:bg-green-50">
                  <UserRound size={20} strokeWidth={1.8} aria-hidden="true" /> {isAuthenticated ? 'My account' : 'Sign in / Account'}
                </button>
                <Link href="/categories/shop" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-sm text-stone-800 hover:bg-green-50">Shop all products</Link>
                <Link href="/stores" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-sm text-stone-800 hover:bg-green-50">Featured stores</Link>
                <Link href="/why-ekivamart" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-sm text-stone-800 hover:bg-green-50">Why shop with EkivaMart?</Link>
                {isAuthenticated && <div className="flex min-h-11 items-center gap-3 border-t border-neutral-100 px-3 text-sm text-stone-800"><span>Notifications</span><NotificationBell /></div>}
              </nav>
            )}
          </div>
        </div>
      </div>
      {searchOpen && (
        <form id="mobile-product-search" role="search" onSubmit={handleSearch} className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2">
          <input ref={searchRef} type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search products and stores" aria-label="Search products and stores" className="min-h-11 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-base text-stone-800 outline-none focus:border-green-700" />
          <button type="submit" disabled={!searchQuery.trim()} className="min-h-11 rounded-lg bg-green-800 px-4 text-sm font-semibold text-white disabled:opacity-50">Search</button>
        </form>
      )}
    </div>
  );
}
