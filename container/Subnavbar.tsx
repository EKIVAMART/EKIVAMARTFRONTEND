'use client';

import { JSX, useState, useRef, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { FiHeart, FiSearch, FiShoppingCart, FiMenu } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartCount, useWishlist } from '@/lib/hooks';
import MobileSidebar from '@/components/MobileSidebar';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import { ProfileModal } from '@/components/auth/ProfileModal';

/* ---------------- LOCATION SELECTOR (Desktop) ---------------- */

const nigerianStates: string[] = [
  'All',
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
  const locationParam = searchParams.get('location') || 'All';

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
        className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm cursor-pointer bg-white hover:bg-gray-50 transition-all rounded-md border border-gray-300 w-20 group"
      >
        <span className="font-medium text-gray-800 text-xs">{selected}</span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
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
                  <span className="font-medium">{state}</span>
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
          background-color: #10b981;
          border-radius: 6px;
          border: 2px solid transparent;
          background-clip: content-box;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #059669;
          background-clip: content-box;
        }
      `}</style>
    </div>
  );
};

/* ================== MAIN SUBNAVBAR COMPONENT ================== */

const Subnavbar = (): JSX.Element => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const cartCount = useCartCount();
  const wishlistItems = useWishlist();
  
  const wishlistCount = wishlistItems.length;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMobileHeader, setShowMobileHeader] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
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
        className={`md:hidden w-full bg-white text-black z-10 border-2 border-amber-950 transition-all duration-300 ease-in-out overflow-hidden ${
          showMobileHeader ? 'sticky top-0' : 'fixed -top-full'
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
            <div className="flex-1 text-center">
              <div className="text-[#981d87] text-lg font-bold">Faflories</div>
              <span className="text-[10px] text-gray-500">BIG MEGA SHOP</span>
            </div>

            {/* Cart Icon */}
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition relative">
                <FiShoppingCart size={20} className="text-gray-700" />
                <span className="absolute -top-1 -right-1 bg-[#981d87] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              </button>
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
        className={`hidden md:flex w-full bg-white text-black relative z-20 transition-all duration-300 ease-in-out ${
          isScrolled ? 'shadow-md' : 'shadow-none'
        }`}
      >
        <div className="mx-auto w-[95%] flex items-center justify-between gap-4 py-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition"
          >
            <div className="text-[#981d87] text-2xl font-bold">Faflories</div>
            <span className="text-xs text-gray-500 font-semibold">
              BIG MEGA SHOP
            </span>
          </Link>

          {/* Search Bar - Takes up more space */}
          <div className="flex w-full items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200 hover:border-green-300 focus-within:border-[#fcedf9]0 transition group">
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
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold">
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
