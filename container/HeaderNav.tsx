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
} from 'lucide-react';

// 1. Data Structure for all menus
const megaMenuData = [
  {
    title: 'Fashion',
    items: [
      { name: 'Men', href: '/category/fashion' },
      { name: 'Women', href: '/category/fashion' },
    ],
  },
  {
    title: 'Electronics',
    items: [
      { name: 'Laptops', href: '/category/electronics' },
      { name: 'Smart Watch Accessories', href: '/category/electronics' },
      { name: 'Cameras', href: '/category/electronics' },
    ],
  },
  {
    title: 'Bags',
    items: [
      { name: 'Men Bags', href: '/category/bags' },
      { name: 'Women Bags', href: '/category/bags' },
    ],
  },
  {
    title: 'Footwear',
    items: [
      { name: 'Men Footwear', href: '/category/footwear' },
      { name: 'Women Footwear', href: '/category/footwear' },
    ],
  },
  {
    title: 'Groceries',
    items: [{ name: 'Groceries', href: '/category/groceries' }],
  },
];

// Define which items have dropdowns and their contents
const navLinks = [
  { name: 'Home', href: '/', hasDropdown: false },
  {
    name: 'Fashion',
    href: '/category/fashion',
    hasDropdown: true,
    subItems: megaMenuData[0].items,
  },
  {
    name: 'Electronics',
    href: '/category/electronics',
    hasDropdown: true,
    subItems: megaMenuData[1].items,
  },
  {
    name: 'Bags',
    href: '/category/bags',
    hasDropdown: true,
    subItems: megaMenuData[2].items,
  },
  {
    name: 'Footwear',
    href: '/category/footwear',
    hasDropdown: true,
    subItems: megaMenuData[3].items,
  },
  { name: 'Groceries', href: '/category/groceries', hasDropdown: false },
  { name: 'Beauty', href: '/category/beauty', hasDropdown: false },
];

export default function Header() {
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const browseRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerOffsetRef = useRef(0);

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

  // Set initial header offset on mount
  useEffect(() => {
    if (headerRef.current) {
      headerOffsetRef.current = headerRef.current.offsetTop;
    }
  }, []);

  // Detect scroll to make header fixed when it reaches top
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 100);

      // When scroll reaches header position, fix it to top
      if (scrollY >= headerOffsetRef.current) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
    <motion.header
      ref={headerRef}
      initial={{ opacity: 1 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      }}
      className={`hidden md:block w-full bg-white border-b border-t transition-all duration-300 ease-in-out z-4 will-change-transform ${
        isFixed ? 'fixed top-0 left-0 right-0' : 'relative'
      }`}
      style={{
        boxShadow: isFixed
          ? '0 10px 30px rgba(0, 0, 0, 0.15)'
          : isScrolled
            ? '0 4px 12px rgba(0, 0, 0, 0.08)'
            : 'none',
      }}
    >
      <div className="mx-auto flex w-[95%] items-center justify-between py-3">
        {/* LEFT: Browse Categories */}
        <div className="relative flex items-center gap-6" ref={browseRef}>
          <motion.button
            onClick={() => setIsBrowseOpen(!isBrowseOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 transition shadow-md hover:shadow-lg"
          >
            <Grid size={15} />
            Browse All Categories
            <motion.div
              animate={{ rotate: isBrowseOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={14} />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {isBrowseOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="absolute left-0 top-11 z-50 w-64 rounded-md border bg-white shadow-lg overflow-hidden"
              >
                {categories.map((cat, index) => {
                  const Icon = cat.icon;
                  return (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Link
                        href={`/category/${cat.name.toLowerCase()}`}
                        className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <motion.div whileHover={{ scale: 1.1 }}>
                            <Icon size={17} className="text-green-600" />
                          </motion.div>
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <motion.div whileHover={{ x: 4 }}>
                          <ChevronRight size={15} className="text-gray-400" />
                        </motion.div>
                      </Link>
                    </motion.div>
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
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-1 transition-colors hover:text-green-600 ${hoveredMenu === link.name ? 'text-green-600' : ''}`}
                >
                  {link.name}
                  {link.hasDropdown && (
                    <motion.div
                      animate={{ rotate: hoveredMenu === link.name ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={13} />
                    </motion.div>
                  )}
                </Link>
              </motion.div>

              {/* Standard Dropdown for individual links */}
              <AnimatePresence>
                {hoveredMenu === link.name && link.hasDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="absolute left-0 mt-5 z-50 w-52 rounded-xl bg-white py-2 shadow-xl overflow-hidden"
                  >
                    {link.subItems?.map((sub, index) => (
                      <motion.div
                        key={sub.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: index * 0.03 }}
                        whileHover={{ x: 4, backgroundColor: '#f0fdf4' }}
                      >
                        <Link
                          href={sub.href}
                          className="block px-4 py-2 text-sm font-semibold text-gray-600 hover:text-green-600 transition"
                        >
                          {sub.name}
                        </Link>
                      </motion.div>
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
          <Link href="/vendor-registration">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Become a vendor
            </button>
          </Link>
          <Headphones size={24} className="text-gray-700" />
          <div className="hidden sm:block text-right leading-tight">
            <p className="font-bold text-green-600 text-lg">09069910407</p>
            <p className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">
              24/7 Support Center
            </p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
