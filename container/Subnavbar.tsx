"use client";

import { JSX, useState } from "react";
import { useUser, useClerk, UserButton } from "@clerk/nextjs";
import { FiHeart, FiMapPin, FiSearch, FiShoppingCart } from "react-icons/fi";

/* ---------------- LOCATION SELECTOR ---------------- */

const countries: string[] = [
  "All",
  "Nigeria",
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "South Africa",
  "Ghana",
];

const LocationSelector = (): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>("All");

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

/* ---------------- SUBNAVBAR ---------------- */

const Subnavbar = (): JSX.Element => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  return (
    <header className="w-full border-b bg-white text-black">
      {/* ⬇️ 90% width container */}
      <div className="mx-auto flex w-[90%] items-center justify-between gap-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="text-green-600 text-2xl font-bold">Faflories</div>
          <span className="text-xs text-gray-500">BIG MEGA SHOP</span>
        </div>

        {/* Search */}
        <div className="flex flex-1 max-w-xl items-center border rounded-md px-3 py-2">
          <input
            type="text"
            placeholder="Search for items..."
            className="flex-1 outline-none text-sm text-black"
          />
          <FiSearch className="text-gray-500" />
        </div>

        {/* Location Selector */}
        <LocationSelector />

        {/* Icons */}

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 cursor-pointer">
            <FiHeart className="text-xl" />
            <span className="text-sm text-black">Wishlist</span>
          </div>

          <div className="flex items-center gap-1 cursor-pointer">
            <FiShoppingCart className="text-xl" />
            <span className="text-sm text-black">Cart</span>
          </div>

          {!user ? (
            <button
              onClick={() => openSignIn?.()}
              className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-md"
            >
              Sign In
            </button>
          ) : (
            <UserButton />
          )}

          
        </div>
      </div>
    </header>
  );
};

export default Subnavbar;
