"use client";
import { useState } from "react";
import { ChevronDown, Headphones, Grid } from "lucide-react";

type MenuKey =
  | "Fashion"
  | "Electronics"
  | "Bags"
  | "Footwear"
  | "Groceries"
  | "Beauty"
  | null;

export default function Header() {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);

  const menus: Record<Exclude<MenuKey, null>, string[]> = {
    Fashion: ["Men Wear", "Women Wear", "Kids Wear", "Accessories"],
    Electronics: ["Phones", "Laptops", "TVs", "Accessories"],
    Bags: ["Hand Bags", "Backpacks", "Travel Bags"],
    Footwear: ["Men Shoes", "Women Shoes", "Slippers"],
    Groceries: ["Fruits", "Vegetables", "Beverages"],
    Beauty: ["Skincare", "Makeup", "Hair Care"],
  };

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex w-[90%] items-center justify-between py-4">
        {/* Left */}
        <button className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          <Grid size={16} />
          Browse All Categories
          <ChevronDown size={14} />
        </button>

        {/* Center Navigation */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-700 md:flex">
          <span className="cursor-pointer hover:text-green-600">Home</span>

          {Object.keys(menus).map((item) => (
            <div
              key={item}
              className="relative"
              onMouseEnter={() => setOpenMenu(item as MenuKey)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button className="flex items-center gap-1 hover:text-green-600">
                {item}
                <ChevronDown size={14} />
              </button>

              {openMenu === item && (
                <div className="absolute left-0 top-8 z-50 w-44 rounded-md border bg-white shadow-md">
                  {menus[item as keyof typeof menus].map((sub) => (
                    <a
                      key={sub}
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600"
                    >
                      {sub}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          <span className="cursor-pointer hover:text-green-600">Shop</span>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3 text-sm">
          <Headphones className="text-gray-600" size={20} />
          <div className="text-right">
            <p className="font-semibold text-green-600">09069910407</p>
            <p className="text-xs text-gray-500">24/7 Support Center</p>
          </div>
        </div>
      </div>
    </header>
  );
}
