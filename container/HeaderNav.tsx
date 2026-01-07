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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
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
      <div className="mx-auto flex w-[95%] items-center justify-between py-3">
        {/* LEFT */}
        <div className="relative flex items-center gap-6" ref={ref}>
          {/* Browse Button */}
          <button
            onClick={() => setOpen(!open)}
            className="
              flex items-center gap-2
              rounded-md bg-green-600
              px-3 py-2
              text-sm font-semibold text-white
              hover:bg-green-700
              transition
            "
          >
            <Grid size={15} />
            Browse All Categories
            <ChevronDown
              size={14}
              className={`transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          <div
            className={`
              absolute left-0 top-11 z-50 w-64
              rounded-md border bg-white shadow-lg
              transition-all duration-200 origin-top
              ${
                open
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
                  className="
                    flex items-center justify-between
                    px-4 py-3 text-sm
                    text-gray-700
                    hover:bg-gray-50
                  "
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className="text-green-600" />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <ChevronRight size={15} className="text-gray-400" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* CENTER NAV */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          {[
            "Home",
            "Fashion",
            "Electronics",
            "Bags",
            "Footwear",
            "Groceries",
            "Beauty",
            "Shop",
          ].map((item) => (
            <Link
              key={item}
              href="/"
              className="flex items-center gap-1 hover:text-green-600"
            >
              {item}
              {item !== "Home" && item !== "Shop" && (
                <ChevronDown size={13} />
              )}
            </Link>
          ))}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-3 text-sm">
          <Headphones size={18} className="text-gray-600" />
          <div className="text-right leading-tight">
            <p className="font-semibold text-green-600">09069910407</p>
            <p className="text-xs text-gray-500">24/7 Support Center</p>
          </div>
        </div>
      </div>
    </header>
  );
}
