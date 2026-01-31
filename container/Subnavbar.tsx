'use client';

import { JSX, useState } from 'react';
import { useUser, useClerk, UserButton } from '@clerk/nextjs';
import {
  FiHeart,
  FiMapPin,
  FiSearch,
  FiShoppingCart,
  FiMenu,
} from 'react-icons/fi';
import MobileSidebar from '@/components/MobileSidebar';

/* ---------------- LOCATION SELECTOR (Desktop) ---------------- */

const countries: string[] = [
  'All',
  'Nigeria',
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'France',
  'South Africa',
  'Ghana',
];

const LocationSelector = (): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>('All');

  return (
    <div className="relative hidden md:block w-48">
      {/* Selector */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-start gap-2 border rounded-md px-3 py-2 text-sm cursor-pointer bg-white"
      >
        <FiMapPin className="text-gray-500" />
        <span>{selected}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full max-h-48 overflow-y-auto border rounded-md bg-white shadow-md">
          {countries.map((country) => (
            <div
              key={country}
              onClick={() => {
                setSelected(country);
                setOpen(false);
              }}
              className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {country}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------- SUBNAVBAR (RESPONSIVE) ---------------- */

const Subnavbar = (): JSX.Element => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <header className="w-full border-b bg-white text-black sticky top-0 z-30">
        {/* Mobile Header */}
        <div className="md:hidden px-3 py-3">
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
              <div className="text-green-600 text-lg font-bold">Faflories</div>
              <span className="text-[10px] text-gray-500">BIG MEGA SHOP</span>
            </div>

            {/* Cart Icon */}
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition relative">
                <FiShoppingCart size={20} className="text-gray-700" />
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  0
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

        {/* Desktop Header */}
        <div className="hidden md:flex mx-auto w-[95%] items-center justify-between gap-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-green-600 text-2xl font-bold">Faflories</div>
            <span className="text-xs text-gray-500">BIG MEGA SHOP</span>
          </div>

          {/* Search */}
          <div className="flex flex-1 max-w-xl items-center border rounded-lg px-4 py-2.5 bg-gray-50 focus-within:border-green-500 transition">
            <input
              type="text"
              placeholder="Search for items..."
              className="flex-1 outline-none text-sm text-black bg-transparent"
            />
            <FiSearch size={18} className="text-gray-500" />
          </div>

          {/* Location Selector */}
          <LocationSelector />

          {/* Right Icons */}
          <div className="flex items-center gap-6">
            {/* Wishlist */}
            <button className="flex items-center gap-2 hover:text-green-600 transition group">
              <div className="relative">
                <FiHeart
                  size={22}
                  className="text-gray-700 group-hover:text-green-600"
                />
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  0
                </span>
              </div>
              <span className="text-sm text-gray-700 group-hover:text-green-600 hidden lg:block">
                Wishlist
              </span>
            </button>

            {/* Cart */}
            <button className="flex items-center gap-2 hover:text-green-600 transition group">
              <div className="relative">
                <FiShoppingCart
                  size={22}
                  className="text-gray-700 group-hover:text-green-600"
                />
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  0
                </span>
              </div>
              <span className="text-sm text-gray-700 group-hover:text-green-600 hidden lg:block">
                Cart
              </span>
            </button>

            {/* Auth Button */}
            {!user ? (
              <button
                onClick={() => openSignIn?.()}
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2 rounded-lg font-semibold transition"
              >
                Sign In
              </button>
            ) : (
              <div className="p-1">
                <UserButton />
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Subnavbar;
