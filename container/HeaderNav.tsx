// "use client";

// import { useState, useRef, useEffect } from "react";
// import Link from "next/link";
// import {
//   Grid,
//   ChevronDown,
//   ChevronRight,
//   Headphones,
//   ShoppingBag,
//   Smartphone,
//   Backpack,
//   Footprints,
//   Apple,
//   Sparkles,
//   Heart,
//   Gem,
// } from "lucide-react";

// export default function Header() {
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () =>
//       document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const categories = [
//     { name: "Fashion", icon: ShoppingBag },
//     { name: "Electronics", icon: Smartphone },
//     { name: "Bags", icon: Backpack },
//     { name: "Footwear", icon: Footprints },
//     { name: "Groceries", icon: Apple },
//     { name: "Beauty", icon: Sparkles },
//     { name: "Wellness", icon: Heart },
//     { name: "Jewellery", icon: Gem },
//   ];

//   return (
//     <header className="w-full border-b bg-white">
//       <div className="mx-auto flex w-[95%] items-center justify-between py-3">
//         {/* LEFT */}
//         <div className="relative flex items-center gap-6" ref={ref}>
//           {/* Browse Button */}
//           <button
//             onClick={() => setOpen(!open)}
//             className="
//               flex items-center gap-2
//               rounded-md bg-green-600
//               px-3 py-2
//               text-sm font-semibold text-white
//               hover:bg-green-700
//               transition
//             "
//           >
//             <Grid size={15} />
//             Browse All Categories
//             <ChevronDown
//               size={14}
//               className={`transition-transform ${
//                 open ? "rotate-180" : ""
//               }`}
//             />
//           </button>

//           {/* Dropdown */}
//           <div
//             className={`
//               absolute left-0 top-11 z-50 w-64
//               rounded-md border bg-white shadow-lg
//               transition-all duration-200 origin-top
//               ${
//                 open
//                   ? "scale-100 opacity-100"
//                   : "pointer-events-none scale-95 opacity-0"
//               }
//             `}
//           >
//             {categories.map((cat) => {
//               const Icon = cat.icon;
//               return (
//                 <Link
//                   key={cat.name}
//                   href={`/category/${cat.name.toLowerCase()}`}
//                   className="
//                     flex items-center justify-between
//                     px-4 py-3 text-sm
//                     text-gray-700
//                     hover:bg-gray-50
//                   "
//                 >
//                   <div className="flex items-center gap-3">
//                     <Icon size={17} className="text-green-600" />
//                     <span className="font-medium">{cat.name}</span>
//                   </div>
//                   <ChevronRight size={15} className="text-gray-400" />
//                 </Link>
//               );
//             })}
//           </div>
//         </div>

//         {/* CENTER NAV */}
//         <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
//           {[
//             "Home",
//             "Fashion",
//             "Electronics",
//             "Bags",
//             "Footwear",
//             "Groceries",
//             "Beauty",
//             "Shop ",
//           ].map((item) => (
//             <Link
//               key={item}
//               href="/"
//               className="flex items-center gap-1 hover:text-green-600"
//             >
//               {item}
//               {item !== "Home" && item !== "Shop" && (
//                 <ChevronDown size={13} />
//               )}
//             </Link>
//           ))}
//         </nav>

//         {/* RIGHT */}
//         <div className="flex items-center gap-3 text-sm">
//           <Headphones size={18} className="text-gray-600" />
//           <div className="text-right leading-tight">
//             <p className="font-semibold text-green-600">09069910407</p>
//             <p className="text-xs text-gray-500">24/7 Support Center</p>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import Link from 'next/link';
// import { motion, AnimatePresence } from 'framer-motion'; // Added Framer Motion
// import {
//   Grid,
//   ChevronDown,
//   ChevronRight,
//   Headphones,
//   ShoppingBag,
//   Smartphone,
//   Backpack,
//   Footprints,
//   Apple,
//   Sparkles,
//   Heart,
//   Gem,
// } from 'lucide-react';

// // 1. Define the Mega Menu Data Structure
// const megaMenuData = [
//   {
//     title: 'Fashion',
//     items: [
//       { name: 'Men', href: '/fashion/men' },
//       { name: 'Women', href: '/fashion/women' },
//     ],
//   },
//   {
//     title: 'Electronics',
//     items: [
//       { name: 'Laptops', href: '/electronics/laptops' },
//       { name: 'Smart Watch Accessories', href: '/electronics/accessories' },
//       { name: 'Cameras', href: '/electronics/cameras' },
//     ],
//   },
//   {
//     title: 'Bags',
//     items: [
//       { name: 'Men Bags', href: '/bags/men' },
//       { name: 'Women Bags', href: '/bags/women' },
//     ],
//   },
//   {
//     title: 'Footwear',
//     items: [
//       { name: 'Men Footwear', href: '/footwear/men' },
//       { name: 'Women Footwear', href: '/footwear/women' },
//     ],
//   },
//   {
//     title: 'Groceries',
//     items: [],
//   },
// ];

// export default function Header() {
//   const [open, setOpen] = useState(false);
//   const [isShopHovered, setIsShopHovered] = useState(false); // State for Mega Menu
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const categories = [
//     { name: 'Fashion', icon: ShoppingBag },
//     { name: 'Electronics', icon: Smartphone },
//     { name: 'Bags', icon: Backpack },
//     { name: 'Footwear', icon: Footprints },
//     { name: 'Groceries', icon: Apple },
//     { name: 'Beauty', icon: Sparkles },
//     { name: 'Wellness', icon: Heart },
//     { name: 'Jewellery', icon: Gem },
//   ];

//   const navLinks = [
//     'Home',
//     'Fashion',
//     'Electronics',
//     'Bags',
//     'Footwear',
//     'Groceries',
//     'Beauty',
//   ];

//   return (
//     <header className="w-full border-b bg-white relative">
//       <div className="mx-auto flex w-[95%] items-center justify-between py-3">
//         {/* LEFT: Browse Categories */}
//         <div className="relative flex items-center gap-6" ref={ref}>
//           <button
//             onClick={() => setOpen(!open)}
//             className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
//           >
//             <Grid size={15} />
//             Browse All Categories
//             <ChevronDown
//               size={14}
//               className={`transition-transform ${open ? 'rotate-180' : ''}`}
//             />
//           </button>

//           {/* Category Dropdown */}
//           <div
//             className={`absolute left-0 top-11 z-50 w-64 rounded-md border bg-white shadow-lg transition-all duration-200 origin-top ${
//               open
//                 ? 'scale-100 opacity-100'
//                 : 'pointer-events-none scale-95 opacity-0'
//             }`}
//           >
//             {categories.map((cat) => {
//               const Icon = cat.icon;
//               return (
//                 <Link
//                   key={cat.name}
//                   href={`/category/${cat.name.toLowerCase()}`}
//                   className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <div className="flex items-center gap-3">
//                     <Icon size={17} className="text-green-600" />
//                     <span className="font-medium">{cat.name}</span>
//                   </div>
//                   <ChevronRight size={15} className="text-gray-400" />
//                 </Link>
//               );
//             })}
//           </div>
//         </div>

//         {/* CENTER NAV */}
//         <nav className="hidden items-center gap-6 text-sm font-bold text-gray-700 md:flex">
//           {navLinks.map((item) => (
//             <Link
//               key={item}
//               href="/"
//               className="flex items-center gap-1 hover:text-green-600 transition-colors"
//             >
//               {item}
//               {item !== 'Home' && <ChevronDown size={13} />}
//             </Link>
//           ))}

//           {/* SHOP ITEM WITH MEGA MENU */}
//           <div
//             className="relative py-3 cursor-pointer"
//             onMouseEnter={() => setIsShopHovered(true)}
//             onMouseLeave={() => setIsShopHovered(false)}
//           >
//             <div
//               className={`flex items-center gap-1 hover:text-green-600 transition-colors ${isShopHovered ? 'text-green-600' : ''}`}
//             >
//               Shop{' '}
//               <ChevronDown
//                 size={13}
//                 className={`transition-transform duration-300 ${isShopHovered ? 'rotate-180' : ''}`}
//               />
//             </div>

//             {/* MEGA MENU COMPONENT */}
//             <AnimatePresence>
//               {isShopHovered && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 15 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: 15 }}
//                   transition={{ duration: 0.2 }}
//                   className="absolute -left-[1000px] top-full z-50 w-[1350px] rounded-lg bg-white p-8 shadow-xl"
//                 >
//                   <div className="grid grid-cols-5 gap-8">
//                     {megaMenuData.map((section, idx) => (
//                       <div key={idx}>
//                         <h3 className="mb-4 text-base font-bold text-green-600">
//                           {section.title}
//                         </h3>
//                         <ul className="space-y-3">
//                           {section.items.map((subItem, i) => (
//                             <li key={i}>
//                               <Link
//                                 href={subItem.href}
//                                 className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
//                               >
//                                 {subItem.name}
//                               </Link>
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     ))}
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </nav>

//         {/* RIGHT */}
//         <div className="flex items-center gap-3 text-sm">
//           <Headphones size={18} className="text-gray-600" />
//           <div className="text-right leading-tight">
//             <p className="font-semibold text-green-600">09069910407</p>
//             <p className="text-xs text-gray-500">24/7 Support Center</p>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Menu,
  X,
} from 'lucide-react';

// 1. Data Structure for all menus
const megaMenuData = [
  {
    title: 'Fashion',
    items: [
      { name: 'Men', href: '/fashion/men' },
      { name: 'Women', href: '/fashion/women' },
    ],
  },
  {
    title: 'Electronics',
    items: [
      { name: 'Laptops', href: '/electronics/laptops' },
      { name: 'Smart Watch Accessories', href: '/electronics/accessories' },
      { name: 'Cameras', href: '/electronics/cameras' },
    ],
  },
  {
    title: 'Bags',
    items: [
      { name: 'Men Bags', href: '/bags/men' },
      { name: 'Women Bags', href: '/bags/women' },
    ],
  },
  {
    title: 'Footwear',
    items: [
      { name: 'Men Footwear', href: '/footwear/men' },
      { name: 'Women Footwear', href: '/footwear/women' },
    ],
  },
  {
    title: 'Groceries',
    items: [],
  },
];

// Define which items have dropdowns and their contents
const navLinks = [
  { name: 'Home', href: '/', hasDropdown: false },
  {
    name: 'Fashion',
    href: '/fashion',
    hasDropdown: true,
    subItems: megaMenuData[0].items,
  },
  {
    name: 'Electronics',
    href: '/electronics',
    hasDropdown: true,
    subItems: megaMenuData[1].items,
  },
  {
    name: 'Bags',
    href: '/bags',
    hasDropdown: true,
    subItems: megaMenuData[2].items,
  },
  {
    name: 'Footwear',
    href: '/footwear',
    hasDropdown: true,
    subItems: megaMenuData[3].items,
  },
  { name: 'Groceries', href: '/groceries', hasDropdown: false },
  { name: 'Beauty', href: '/beauty', hasDropdown: false },
];

export default function Header() {
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const browseRef = useRef<HTMLDivElement>(null);

  // Close browse dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (browseRef.current && !browseRef.current.contains(e.target as Node)) {
        setIsBrowseOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    { name: 'Fashion', icon: ShoppingBag },
    { name: 'Electronics', icon: Smartphone },
    { name: 'Bags', icon: Backpack },
    { name: 'Footwear', icon: Footprints },
    { name: 'Groceries', icon: Apple },
    { name: 'Beauty', icon: Sparkles },
    { name: 'Wellness', icon: Heart },
    { name: 'Jewellery', icon: Gem },
  ];

  return (
    <header className="w-full border-b bg-white relative z-[100]">
      <div className="mx-auto flex w-[95%] items-center justify-between py-3">
        {/* LEFT: Browse Categories */}
        <div className="relative flex items-center gap-6" ref={browseRef}>
          <button
            onClick={() => setIsBrowseOpen(!isBrowseOpen)}
            className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
          >
            <Grid size={15} />
            Browse All Categories
            <ChevronDown
              size={14}
              className={`transition-transform ${isBrowseOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {isBrowseOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 top-11 z-50 w-64 rounded-md border bg-white shadow-lg"
              >
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.name}
                      href={`/category/${cat.name.toLowerCase()}`}
                      className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={17} className="text-green-600" />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <ChevronRight size={15} className="text-gray-400" />
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CENTER NAV */}
        <nav className="hidden items-center gap-6 text-sm font-bold text-gray-700 md:flex">
          {navLinks.map((link) => (
            <div
              key={link.name}
              className="relative py-3 cursor-pointer"
              onMouseEnter={() => setHoveredMenu(link.name)}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <Link
                href={link.href}
                className={`flex items-center gap-1 transition-colors hover:text-green-600 ${hoveredMenu === link.name ? 'text-green-600' : ''}`}
              >
                {link.name}
                {link.hasDropdown && (
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-300 ${hoveredMenu === link.name ? 'rotate-180' : ''}`}
                  />
                )}
              </Link>

              {/* Standard Dropdown for individual links */}
              <AnimatePresence>
                {hoveredMenu === link.name && link.hasDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute left-0 mt-5 z-50 w-52 rounded-xl bg-white py-2 shadow-xl"
                  >
                    {link.subItems?.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className="block px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-green-600 transition"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* MEGA MENU: Shop */}
          <div
            className="relative py-3 cursor-pointer"
            onMouseEnter={() => setHoveredMenu('Shop')}
            onMouseLeave={() => setHoveredMenu(null)}
          >
            <div
              className={`flex items-center gap-1 transition-colors hover:text-green-600 ${hoveredMenu === 'Shop' ? 'text-green-600' : ''}`}
            >
              Shop{' '}
              <ChevronDown
                size={13}
                className={`transition-transform duration-300 ${hoveredMenu === 'Shop' ? 'rotate-180' : ''}`}
              />
            </div>

            <AnimatePresence>
              {hoveredMenu === 'Shop' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="fixed left-1/2 z-50 w-[95%] -translate-x-1/2 rounded-xl bg-white p-10 shadow-2xl mt-5"
                >
                  <div className="grid grid-cols-5 gap-8">
                    {megaMenuData.map((section, idx) => (
                      <div key={idx}>
                        <h3 className="mb-4 text-base font-bold text-green-600">
                          {section.title}
                        </h3>
                        <ul className="space-y-3">
                          {section.items.map((subItem, i) => (
                            <li key={i}>
                              <Link
                                href={subItem.href}
                                className="text-sm font-medium text-gray-600 hover:text-green-600 transition"
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* RIGHT: Contact */}
        <div className="flex items-center gap-3 text-sm">
          <Headphones size={24} className="text-gray-700" />
          <div className="hidden sm:block text-right leading-tight">
            <p className="font-bold text-green-600 text-lg">09069910407</p>
            <p className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">
              24/7 Support Center
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
