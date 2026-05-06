'use client';

import { JSX, useState, useRef, useEffect } from 'react';
import { FiHeart, FiSearch, FiShoppingCart, FiMenu, FiMapPin } from 'react-icons/fi';
import { FaAngleDown } from "react-icons/fa6";
import { FiUser } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartCount, useWishlist, useAppSelector } from '@/lib/hooks';
import MobileSidebar from '@/components/MobileSidebar';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import { ProfileModal } from '@/components/auth/ProfileModal';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';

/* ---------------- LOCATION SELECTOR (Desktop) ---------------- */

const nigerianStates: string[] = [
  'Location',
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

const LocationSelector = (): JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationParam = searchParams.get('location') || 'Location';

  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>(locationParam);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(locationParam);
  }, [locationParam]);

  const handleSelect = (state: string) => {
    setSelected(state);
    setOpen(false);
    setSearchQuery('');

    const params = new URLSearchParams(window.location.search);
    if (state === 'All') {
      params.delete('location');
    } else {
      params.set('location', state);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const filteredStates = nigerianStates.filter((state) =>
    state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
    setOpen(!open);
  };

  return (
    <div className="relative hidden md:block z-50">
      {/* Selector Button */}
      <div
        ref={buttonRef}
        onClick={handleOpen}
        className="flex items-center justify-between gap-4 px-4 py-2.5 cursor-pointer bg-white hover:bg-gray-50 transition-all rounded-md border border-gray-300 group"
      >
        <div className="flex items-center gap-1.5 w-full">
          <FiMapPin className="text-[#981d87] shrink-0" size={15} />
          <span className="font-medium text-gray-800 text-[15px] truncate">{selected}</span>
        </div>
        <FaAngleDown className="text-gray-600" size={15} />

      </div>

      {/* Dropdown with Search */}
      {open && (
        <div
          className="fixed z-50 w-56 rounded-lg bg-white shadow-lg border border-gray-200 overflow-hidden animate-in fade-in duration-200"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
            <div className="relative">
              <FiSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 bg-gray-50 transition-all"
              />
            </div>
          </div>

          {/* States List */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {filteredStates.length > 0 ? (
              filteredStates.map((state) => (
                <div
                  key={state}
                  onClick={() => handleSelect(state)}
                  className="px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-100 border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    {state === 'All' && <FiMapPin size={14} className="text-[#981d87]" />}
                    <span className="font-medium">{state}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500 font-medium">
                No states found
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #981d87;
          border-radius: 6px;
          border: 2px solid transparent;
          background-clip: content-box;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #7a176c;
          background-clip: content-box;
        }
      `}</style>
    </div>
  );
};

/* ================== MAIN SUBNAVBAR COMPONENT ================== */

const Subnavbar = (): JSX.Element => {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const cartCount = useCartCount();
  const wishlistItems = useWishlist();

  const wishlistCount = wishlistItems.length;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMobileHeader, setShowMobileHeader] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Mobile header: hide when scrolling down, show when scrolling up
      if (currentScrollY > 100) {
        setIsScrolled(true);
        if (currentScrollY > lastScrollY) {
          // Scrolling down
          setShowMobileHeader(false);
        } else {
          // Scrolling up
          setShowMobileHeader(true);
        }
      } else {
        setIsScrolled(false);
        setShowMobileHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSigninClick={() => setIsLoginModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />

      {/* ===== MOBILE HEADER ===== */}
      <header
        className={`md:hidden w-full bg-white text-black z-10 border-2 border-amber-950 transition-all duration-300 ease-in-out overflow-hidden ${showMobileHeader ? 'sticky top-0' : 'fixed -top-full'
          }`}
      >
        <div className="px-3 py-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Hamburger Menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              aria-label="Open menu"
            >
              <FiMenu size={24} className="text-gray-700" />
            </button>

            {/* Logo */}
            <div className="flex-1 flex justify-center">
              <Link href="/">
                <Image src="/logo.jpg" alt="Faflora" width={120} height={32} className="object-contain" />
              </Link>
            </div>

            {/* Account & Cart Icons */}
            <div className="flex items-center gap-2">
              {!isAuthenticated ? (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition group"
                >
                  <FiUser size={20} className="text-gray-700 group-hover:text-[#981d87]" />
                </button>
              ) : (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-[#981d87] text-white flex items-center justify-center text-xs font-semibold"
                >
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </button>
              )}

              <Link href="/wishlist" className="p-1.5 hover:bg-gray-100 rounded-lg transition relative group">
                <FiHeart size={20} className="text-gray-700 group-hover:text-[#981d87]" />
                <span className="absolute -top-1 -right-1 bg-[#981d87] text-white text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full font-bold">
                  {wishlistCount}
                </span>
              </Link>

              <Link href="/cart" className="p-1.5 hover:bg-gray-100 rounded-lg transition relative group">
                <FiShoppingCart size={20} className="text-gray-700 group-hover:text-[#981d87]" />
                <span className="absolute -top-1 -right-1 bg-[#981d87] text-white text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <FiSearch size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 outline-none text-sm text-black bg-transparent"
            />
          </div>
        </div>
      </header>

      {/* ===== DESKTOP HEADER - TOP SECTION ===== */}
      <header
        className={`hidden md:flex w-full bg-white text-black relative z-20 transition-all duration-300 ease-in-out ${isScrolled ? 'shadow-md' : 'shadow-none'
          }`}
      >
        <div className="mx-auto w-[95%] flex items-center justify-between gap-4 py-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition"
          >
            <Image src="/logo.jpg" alt="Faflora" width={160} height={45} className="object-contain" />
          </Link>

          {/* Search Bar - Takes up more space */}
          <div className="flex w-full max-w-xl items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200 hover:border-[#fcedf9] focus-within:border-[#fcedf9]0 transition group">
            <input
              type="text"
              placeholder="Search for items..."
              className="flex-1 outline-none text-sm text-black bg-transparent placeholder-gray-500"
            />
            <button className="p-1 hover:bg-gray-100 rounded-lg transition">
              <FiSearch size={20} className="text-[#981d87]" />
            </button>
          </div>

          {/* Location Selector - RIGHT SIDE */}

          <LocationSelector />

          {/* Right Icons Section */}
          <div className="flex items-center gap-5">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="relative">
                <FiHeart
                  className="w-7 h-7 text-slate-700 group-hover:text-[#981d87] transition-colors"
                  strokeWidth={1.5}
                />
                <span className="absolute -top-2 -right-2 bg-[#981d87] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              </div>
              {/* This is your specific line of code, now wrapped in a Link */}
              <span className="text-sm font-medium text-slate-700 group-hover:text-[#981d87] transition-colors">
                Wishlist
              </span>
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="relative">
                <FiShoppingCart
                  className="w-7 h-7 text-slate-700 group-hover:text-[#981d87] transition-colors"
                  strokeWidth={1.5}
                />
                <span className="absolute -top-2 -right-2 bg-[#981d87] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              {/* This is your specific line of code, now wrapped in a Link */}
              <span className="text-sm font-medium text-slate-700 group-hover:text-[#981d87] transition-colors">
                Cart
              </span>
            </Link>

            {/* Account */}
            {!isAuthenticated ? (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex flex-wrap gap-3 items-center justify-center group"
              >
                <FiUser
                  size={22}
                  className="text-gray-700 group-hover:text-[#981d87] transition"
                />
                <span className="text-sm text-gray-600 group-hover:text-[#981d87] transition whitespace-nowrap hidden lg:block">
                  Account
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#981d87] text-white flex items-center justify-center text-sm font-semibold">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
                <span className="text-xs text-gray-600 hidden lg:block">
                  {user?.firstName}
                </span>
              </button>
            )}

            {/* Modals */}
            <LoginModal
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
              onSwitchToSignup={() => {
                setIsLoginModalOpen(false);
                setIsSignupModalOpen(true);
              }}
              onSwitchToForgotPassword={() => {
                setIsLoginModalOpen(false);
                setIsForgotPasswordModalOpen(true);
              }}
            />
            <ForgotPasswordModal
              isOpen={isForgotPasswordModalOpen}
              onClose={() => setIsForgotPasswordModalOpen(false)}
              onSwitchToLogin={() => {
                setIsForgotPasswordModalOpen(false);
                setIsLoginModalOpen(true);
              }}
            />
            <SignupModal
              isOpen={isSignupModalOpen}
              onClose={() => setIsSignupModalOpen(false)}
              onSwitchToLogin={() => {
                setIsSignupModalOpen(false);
                setIsLoginModalOpen(true);
              }}
            />
            <ProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
            />
          </div>
        </div>
      </header>
    </>
  );
};

export default Subnavbar;
