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
  Sparkles,
  Heart,
  Gem,
  Tv,
  Camera,
  Gamepad,
  Music,
  Blend,
  CookingPot,
  Lamp,
  Sofa,
  ShoppingBasket,
  Scissors,
  Bath,
  HeartPulse,
  Dumbbell,
  Puzzle,
  Baby,
  PawPrint,
  Car,
  Book,
  Wrench,
  Leaf,
  Briefcase,
  Bolt,
  Package,
  Store,
  GlassWater,
} from 'lucide-react';
import { categoryApi } from '@/lib/api';

const categoryIconMap: Record<string, any> = {
  'fashion': ShoppingBag,
  'footwear': Footprints,
  'bags & luggage': Backpack,
  'bags': Backpack,
  'jewelry & fashion accessories': Gem,
  'jewelry': Gem,
  'jewellery': Gem,
  'mobile phones & accessories': Smartphone,
  'computers & accessories': LaptopIconPlaceholder(),
  'electronics': Tv,
  'photography & video': Camera,
  'gaming': Gamepad,
  'musical instruments': Music,
  'audio equipment': Headphones,
  'home appliances': Blend,
  'home & kitchen': CookingPot,
  'home decor': Lamp,
  'furniture': Sofa,
  'groceries': ShoppingBasket,
  'local market': Store,
  'drinks': GlassWater,
  'beauty & cosmetics': Sparkles,
  'beauty': Sparkles,
  'hair care & extensions': Scissors,
  'personal care': Bath,
  'health & wellness': HeartPulse,
  'wellness': Heart,
  'sports & fitness': Dumbbell,
  'sports': Dumbbell,
  'toys & games': Puzzle,
  'toys': Puzzle,
  'baby products': Baby,
  'pet supplies': PawPrint,
  'automotive': Car,
  'books & stationery': Book,
  'tools & home improvement': Wrench,
  'garden & outdoor': Leaf,
  'office & school supplies': Briefcase,
  'solar & electrical': Bolt,
};

function LaptopIconPlaceholder() {
  return Smartphone; // Fallback or we can import Laptop as well
}

const getCategoryIcon = (name: string) => {
  const norm = name.toLowerCase().trim();
  return categoryIconMap[norm] || categoryIconMap[norm.replace(/&/g, 'and')] || Package;
};

export default function Header() {
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [hoveredCategoryInBrowse, setHoveredCategoryInBrowse] = useState<string | null>(null);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const browseRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerOffsetRef = useRef(0);

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch parent categories on mount (Anonymous context)
  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const res = await categoryApi.getCategories({ limit: 100 });
        let data: any[] = [];
        if (res?.data && Array.isArray(res.data)) {
          data = res.data;
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res?.data?.categories && Array.isArray(res.data.categories)) {
          data = res.data.categories;
        } else if (res?.data?.docs && Array.isArray(res.data.docs)) {
          data = res.data.docs;
        }

        const publishedData = data.filter((item: any) => {
          const isPublished = Boolean(item.isActive ?? item.is_active ?? (item.status === 'published' || item.status === 'active'));
          const isDraft = item.status === 'draft';
          return isPublished && !isDraft;
        });

        // Separate parents
        const parents = publishedData.filter((item: any) => !item.parentId);
        
        // Fetch subcategories for each parent using categoryApi.getSubcategories
        const formatted = await Promise.all(
          parents.map(async (parent: any) => {
            const parentId = String(parent.id || parent._id || parent.categoryId || parent.uuid);
            let subData: any[] = [];
            try {
              const subRes = await categoryApi.getSubcategories(parentId);
              if (subRes?.data && Array.isArray(subRes.data)) {
                subData = subRes.data;
              } else if (subRes?.data?.data && Array.isArray(subRes.data.data)) {
                subData = subRes.data.data;
              } else if (subRes?.data?.categories && Array.isArray(subRes.data.categories)) {
                subData = subRes.data.categories;
              } else if (subRes?.data?.docs && Array.isArray(subRes.data.docs)) {
                subData = subRes.data.docs;
              } else if (Array.isArray(subRes)) {
                subData = subRes;
              }
            } catch (err) {
              console.error(`Failed to fetch subcategories for parent ${parentId}:`, err);
            }

            const subcategories = subData.filter((item: any) => {
              const isPublished = Boolean(item.isActive ?? item.is_active ?? (item.status === 'published' || item.status === 'active'));
              const isDraft = item.status === 'draft';
              return isPublished && !isDraft;
            }).map((sub: any) => ({
              id: String(sub.id || sub._id || sub.categoryId || sub.uuid),
              name: sub.name || sub.title || sub.displayName || 'Unknown',
              slug: (sub.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            }));

            return {
              id: parentId,
              name: parent.name || parent.title || parent.displayName || 'Unknown',
              slug: (parent.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
              subcategories,
            };
          })
        );

        if (isMounted) {
          setCategories(formatted);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch navbar categories:', err);
        if (isMounted) setLoading(false);
      }
    };
    void fetchCats();
    return () => { isMounted = false; };
  }, []);

  const MAIN_NAV_NAMES = [
    'Fashion',
    'Electronics',
    'Home & Kitchen',
    'Beauty',
    'Groceries',
    'Sports'
  ];

  // Map main nav links to categories
  const navLinks = [
    { name: 'Home', href: '/', hasDropdown: false, subItems: [] as Array<{ name: string; href: string }> },
    { name: 'About Us', href: '/about-us', hasDropdown: false, subItems: [] as Array<{ name: string; href: string }> },
    ...MAIN_NAV_NAMES.map(name => {
      const normNav = name.toLowerCase().replace(/&/g, 'and').trim();
      const matched = categories.find(cat => {
        const normCat = cat.name.toLowerCase().replace(/&/g, 'and').trim();
        return normCat.includes(normNav) || normNav.includes(normCat);
      });

      return {
        name,
        href: matched ? `/categories/${matched.slug}` : `/categories/${name.toLowerCase().replace(/\s+/g, '-')}`,
        hasDropdown: matched ? matched.subcategories.length > 0 : false,
        subItems: matched ? matched.subcategories.map((sub: any) => ({
          name: sub.name,
          href: `/categories/${matched.slug}?subcategory=${sub.slug}`
        })) : []
      };
    })
  ];

  // Shop mega dropdown shows ALL parent categories NOT matched to the first 6 main links
  const shopCategories = categories.filter(cat => {
    const normCat = cat.name.toLowerCase().replace(/&/g, 'and').trim();
    return !MAIN_NAV_NAMES.some(name => {
      const normNav = name.toLowerCase().replace(/&/g, 'and').trim();
      return normCat.includes(normNav) || normNav.includes(normCat);
    });
  });

  return (
    <motion.header
      ref={headerRef}
      initial={{ opacity: 1 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      }}
      className={`hidden md:block w-full bg-white border-b border-t transition-all duration-300 ease-in-out z-40 will-change-transform ${isFixed ? 'fixed top-0 left-0 right-0' : 'relative'
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
            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-[#c800ff] to-[#912cad] px-3 py-2 text-sm font-semibold text-white hover:from-[#b500e6] hover:to-[#802699] transition shadow-md hover:shadow-lg"
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
                onMouseLeave={() => setHoveredCategoryInBrowse(null)}
                className="absolute left-0 top-11 z-50 w-64 rounded-md border bg-white shadow-xl"
                style={{ maxHeight: '340px', overflowY: 'auto', scrollbarWidth: 'thin' }}
              >
                {categories.length > 0 ? (
                  categories.map((cat, index) => {
                    const Icon = getCategoryIcon(cat.name);
                    const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                    return (
                      <div
                        key={cat.id}
                        className="relative"
                        onMouseEnter={() => setHoveredCategoryInBrowse(cat.id)}
                        onMouseLeave={() => setHoveredCategoryInBrowse(null)}
                      >
                        <Link
                          href={`/categories/${cat.slug}`}
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-[#fcedf9] hover:text-[#b500e6] transition"
                          onClick={() => {
                            setIsBrowseOpen(false);
                            setHoveredCategoryInBrowse(null);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={16} className="text-[#c800ff] flex-shrink-0" />
                            <span className="font-medium">{cat.name}</span>
                          </div>
                          {hasSubs && (
                            <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                          )}
                        </Link>

                        {/* Hover Flyout for subcategories */}
                        {hoveredCategoryInBrowse === cat.id && hasSubs && (
                          <div
                            className="absolute left-full top-0 ml-1 w-52 rounded-md border bg-white shadow-xl py-2 z-[60]"
                            style={{ maxHeight: '280px', overflowY: 'auto', scrollbarWidth: 'thin' }}
                          >
                            <p className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#c800ff]/70 border-b border-gray-100 mb-1">
                              {cat.name}
                            </p>
                            {cat.subcategories.map((sub: any) => (
                              <Link
                                key={sub.id}
                                href={`/categories/${cat.slug}?subcategory=${sub.slug}`}
                                className="block px-4 py-2 text-sm text-gray-600 hover:bg-[#fcedf9] hover:text-[#b500e6] font-medium transition"
                                onClick={() => {
                                  setIsBrowseOpen(false);
                                  setHoveredCategoryInBrowse(null);
                                }}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-gray-400">No categories found</div>
                )}
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
                  className={`flex items-center gap-1 transition-colors hover:text-[#c800ff] ${hoveredMenu === link.name ? 'text-[#c800ff]' : ''}`}
                >
                  {link.name}
                  {/* Always show arrow on links that have subcategories */}
                  {link.hasDropdown && (
                    <motion.span
                      animate={{ rotate: hoveredMenu === link.name ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="inline-flex"
                    >
                      <ChevronDown size={13} />
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Subcategory Dropdown for individual nav links */}
              <AnimatePresence>
                {hoveredMenu === link.name && link.hasDropdown && link.subItems && link.subItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute left-0 top-full z-50 w-52 rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden"
                    style={{ marginTop: '2px' }}
                  >
                    {/* Header label */}
                    <div className="px-4 py-2 bg-gradient-to-r from-[#fcedf9] to-white border-b border-purple-100">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#c800ff]/70">{link.name}</span>
                    </div>
                    {link.subItems.map((sub: { name: string; href: string }, index: number) => (
                      <motion.div
                        key={sub.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.12, delay: index * 0.02 }}
                        whileHover={{ x: 4, backgroundColor: '#fcedf9' }}
                      >
                        <Link
                          href={sub.href}
                          className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#c800ff] transition"
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

          {/* MEGA MENU: Shop — shows remaining categories as plain headers with clickable subcategories */}
          <div
            className="relative py-3 cursor-pointer"
            onMouseEnter={() => setHoveredMenu('Shop')}
            onMouseLeave={() => setHoveredMenu(null)}
          >
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <span
                className={`flex items-center gap-1 transition-colors hover:text-[#c800ff] select-none ${hoveredMenu === 'Shop' ? 'text-[#c800ff]' : ''}`}
              >
                Shop
                <motion.span
                  animate={{ rotate: hoveredMenu === 'Shop' ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="inline-flex"
                >
                  <ChevronDown size={13} />
                </motion.span>
              </span>
            </motion.div>

            <AnimatePresence>
              {hoveredMenu === 'Shop' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.2 }}
                  className="fixed left-1/2 z-50 w-[92vw] max-w-5xl -translate-x-1/2 rounded-2xl bg-white p-8 shadow-2xl border border-gray-100 overflow-y-auto max-h-[75vh]"
                  style={{ top: 'auto', marginTop: '2px' }}
                >
                  {shopCategories.length > 0 ? (
                    <div className="grid grid-cols-4 xl:grid-cols-5 gap-8">
                      {shopCategories.map((section, idx) => (
                        <div key={idx}>
                          {/* Plain non-clickable category header */}
                          <h3 className="mb-3 text-sm font-black text-[#c800ff] uppercase tracking-wide border-b border-purple-100 pb-1.5">
                            {section.name}
                          </h3>
                          {section.subcategories.length > 0 ? (
                            <ul className="space-y-2">
                              {section.subcategories.map((subItem: any, i: number) => (
                                <li key={i}>
                                  <Link
                                    href={`/categories/${section.slug}?subcategory=${subItem.slug}`}
                                    className="text-sm text-gray-600 hover:text-[#c800ff] transition-colors font-medium"
                                  >
                                    {subItem.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <Link
                              href={`/categories/${section.slug}`}
                              className="text-sm text-gray-500 hover:text-[#c800ff] transition-colors font-medium"
                            >
                              All {section.name}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-sm text-gray-400 py-4">All categories are listed in the main navigation.</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* RIGHT: Contact */}
        <div className="flex items-center gap-3 text-sm">
          <Link href="/vendor-registration">
            <button className="bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white px-4 py-2 rounded-md hover:from-[#b500e6] hover:to-[#802699] transition-colors">
              Become a vendor
            </button>
          </Link>
          <Headphones size={24} className="text-gray-700" />
          <div className="hidden sm:block text-right leading-tight">
            <p className="font-bold text-[#c800ff] text-lg">09069910407</p>
            <p className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">
              24/7 Support Center
            </p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
