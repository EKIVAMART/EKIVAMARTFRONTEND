'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logout } from '@/lib/features/auth/authSlice';
import { authApi } from '@/lib/api';
import {
  X,
  MapPin,
  ChevronRight,
  ChevronDown,
  LogOut,
  ShoppingBag,
  Smartphone,
  Backpack,
  Footprints,
  Sparkles,
  Heart,
  Gem,
  Home,
  Search,
  User,
  Tv,
  Camera,
  Gamepad,
  Music,
  Headphones,
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
  return Smartphone;
}

const getCategoryIcon = (name: string) => {
  const norm = name.toLowerCase().trim();
  const IconComponent = categoryIconMap[norm] || categoryIconMap[norm.replace(/&/g, 'and')] || Package;
  return <IconComponent size={20} />;
};

const allLocations = [
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
  'Federal Capital Territory',
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSigninClick?: () => void;
  onProfileClick?: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationParam = searchParams.get('location') || 'All';

  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
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
          }
        } catch (err) {
          console.error('Failed to fetch sidebar categories:', err);
        }
      };
      void fetchCats();
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(locationParam);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedLocation(locationParam);
  }, [locationParam]);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setShowLocationDropdown(false);
    setLocationSearch('');

    const params = new URLSearchParams(window.location.search);
    if (location === 'All') {
      params.delete('location');
    } else {
      params.set('location', location);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Filter locations based on search
  const filteredLocations = allLocations.filter((loc) =>
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleCategoryClick = (categoryName: string) => {
    setExpandedCategory(
      expandedCategory === categoryName ? null : categoryName
    );
  };

  const handleLogout = async () => {
    try {
      await authApi.logoutCurrentSession();
      dispatch(logout());
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close location dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(e.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    };

    if (showLocationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLocationDropdown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-0 top-0 z-50 h-screen w-80 max-w-[85vw] overflow-y-auto scrollbar-thin bg-white shadow-2xl md:hidden flex flex-col"
          >
            {/* Header - Logo */}
            <div className="sticky top-0 z-20 bg-white px-4 py-3 flex items-center justify-between">
              <div>
                <Link href="/" className="flex flex-col items-start gap-1">
                  <Image src="/logo.jpg" alt="Faflora" width={120} height={32} className="object-contain" />
                </Link>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} className="text-gray-700" />
              </button>
            </div>

            {/* Location Selector with Search */}
            <div
              className="sticky top-16 z-20 bg-white px-4 py-3"
              ref={locationDropdownRef}
            >
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm hover:border-[#fcedf9]0 transition"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#c800ff]" />
                  <span className="font-semibold text-gray-700">
                    {selectedLocation}
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ${showLocationDropdown ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {/* Dropdown with Search */}
              <AnimatePresence>
                {showLocationDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-16 left-0 right-0 mx-4 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 overflow-hidden"
                  >
                    {/* Search Input */}
                    <div className="sticky top-0 bg-white px-3 py-2">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <Search size={16} className="text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search here..."
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          className="flex-1 outline-none text-sm bg-gray-50 text-gray-700 placeholder-gray-400"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Location List */}
                    <div className="max-h-48 overflow-y-auto scrollbar-thin">
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((location) => (
                          <button
                            key={location}
                            onClick={() => handleLocationSelect(location)}
                            className={`w-full text-left px-4 py-3 text-sm transition ${selectedLocation === location
                              ? 'bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            {location}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-center text-sm text-gray-500">
                          No results found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {/* Home Link */}
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#fcedf9] hover:text-[#c800ff] transition"
              >
                <Home size={20} />
                <span className="font-semibold text-sm">Home</span>
              </Link>

              {/* Categories */}
              <div>
                {categories.length > 0 ? (
                  categories.map((category) => {
                    const iconNode = getCategoryIcon(category.name);
                    return (
                      <div key={category.id}>
                        {/* Category Button */}
                        <button
                          onClick={() => handleCategoryClick(category.name)}
                          className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 transition group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-gray-500 group-hover:text-[#c800ff] transition">
                              {iconNode}
                            </div>
                            <span className="font-semibold text-sm text-gray-800">
                              {category.name}
                            </span>
                          </div>
                          <motion.div
                            animate={{
                              rotate: expandedCategory === category.name ? 90 : 0,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight size={18} className="text-gray-400" />
                          </motion.div>
                        </button>

                        {/* Subcategories */}
                        <AnimatePresence>
                          {expandedCategory === category.name && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden bg-gray-50"
                            >
                              {category.subcategories.map((sub: any) => (
                                <Link
                                  key={sub.id}
                                  href={`/categories/${category.slug}?subcategory=${sub.slug}`}
                                  onClick={onClose}
                                  className="block px-4 py-2.5 pl-12 text-sm text-gray-600 hover:text-[#c800ff] hover:bg-white transition font-medium"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-gray-400">Loading categories...</div>
                )}
              </div>
            </div>

            {/* Footer - User Section */}
            <div className="sticky bottom-0 bg-white p-4 space-y-3">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 hover:bg-[#fcedf9] hover:border-[#fcedf9] border border-gray-100 transition group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white flex items-center justify-center text-sm font-semibold shrink-0 group-hover:scale-105 transition">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 rounded-lg transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] text-white font-semibold py-2.5 rounded-lg transition"
                >
                  <User size={18} />
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
