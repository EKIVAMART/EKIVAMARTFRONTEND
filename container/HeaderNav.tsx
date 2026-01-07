"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Grid,
  ChevronDown,
  ChevronRight,
  Headphones,
  ShoppingBag,
  Smartphone,
  Backpack,
  Footprints,
  Apple,
  Sparkles,
  Heart,
  Gem,
} from "lucide-react";

export default function Header() {
  const [showCategories, setShowCategories] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowCategories(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = [
    { name: "Fashion", icon: ShoppingBag },
    { name: "Electronics", icon: Smartphone },
    { name: "Bags", icon: Backpack },
    { name: "Footwear", icon: Footprints },
    { name: "Groceries", icon: Apple },
    { name: "Beauty", icon: Sparkles },
    { name: "Wellness", icon: Heart },
    { name: "Jewellery", icon: Gem },
  ];

  return (
    <header className="w-full border-b bg-white">
      <div className="relative mx-auto flex w-[90%] items-center justify-between py-4">
        {/* LEFT — BROWSE ALL CATEGORIES */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <Grid size={16} />
            Browse All Categories
            <ChevronDown
              size={14}
              className={`transition-transform ${
                showCategories ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* DROPDOWN */}
          <div
            className={`absolute left-0 top-12 z-50 w-64 rounded-md border bg-white shadow-lg
              transition-all duration-200 origin-top
              ${
                showCategories
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0"
              }
            `}
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/category/${cat.name.toLowerCase()}`}
                  className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-green-600" />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* CENTER NAV */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-700 md:flex">
          <Link href="/" className="hover:text-green-600">
            Home
          </Link>
          <span className="cursor-pointer hover:text-green-600">
            Shop
          </span>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-3 text-sm">
          <Headphones size={20} className="text-gray-600" />
          <div className="text-right">
            <p className="font-semibold text-green-600">09069910407</p>
            <p className="text-xs text-gray-500">24/7 Support Center</p>
          </div>
        </div>
      </div>
    </header>
  );
}
