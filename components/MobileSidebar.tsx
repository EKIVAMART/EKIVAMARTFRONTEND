'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logout } from '@/lib/features/auth/authSlice';
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
  Apple,
  Sparkles,
  Heart,
  Gem,
  Home,
  Search,
  User,
} from 'lucide-react';

interface Category {
  name: string;
  icon: React.ReactNode;
  subcategories: string[];
}

const categories: Category[] = [
  {
    name: 'Fashion',
    icon: <ShoppingBag size={20} />,
    subcategories: ['Men', 'Women', 'Kids', 'Accessories'],
  },
  {
    name: 'Electronics',
    icon: <Smartphone size={20} />,
    subcategories: ['Laptops', 'Smartphones', 'Accessories', 'Smart Watch'],
  },
  {
    name: 'Bags',
    icon: <Backpack size={20} />,
    subcategories: ['Men Bags', 'Women Bags', 'Travel Bags', 'Backpacks'],
  },
  {
    name: 'Footwear',
    icon: <Footprints size={20} />,
    subcategories: ['Men Shoes', 'Women Shoes', 'Sneakers', 'Formal Shoes'],
  },
  {
    name: 'Groceries',
    icon: <Apple size={20} />,
    subcategories: ['Fruits', 'Vegetables', 'Dairy', 'Snacks'],
  },
  {
    name: 'Beauty',
    icon: <Sparkles size={20} />,
    subcategories: ['Skincare', 'Makeup', 'Haircare', 'Fragrances'],
  },
  {
    name: 'Wellness',
    icon: <Heart size={20} />,
    subcategories: ['Supplements', 'Fitness', 'Health', 'Personal Care'],
  },
  {
    name: 'Jewellery',
    icon: <Gem size={20} />,
    subcategories: ['Gold', 'Silver', 'Diamonds', 'Accessories'],
  },
];

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

export default function MobileSidebar({
  isOpen,
  onClose,
  onSigninClick,
  onProfileClick,
}: MobileSidebarProps) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('Lagos');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Filter locations based on search
  const filteredLocations = allLocations.filter((loc) =>
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleCategoryClick = (categoryName: string) => {
    setExpandedCategory(
      expandedCategory === categoryName ? null : categoryName
    );
  };

  const handleLogout = () => {
    dispatch(logout());
    onClose();
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
                <div className="text-green-600 text-lg font-bold">
                  Faflories
                </div>
                <span className="text-[10px] text-gray-500">BIG MEGA SHOP</span>
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
                className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm hover:border-green-500 transition"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-green-600" />
                  <span className="font-semibold text-gray-700">
                    {selectedLocation}
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ${
                    showLocationDropdown ? 'rotate-180' : ''
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
                            onClick={() => {
                              setSelectedLocation(location);
                              setShowLocationDropdown(false);
                              setLocationSearch('');
                            }}
                            className={`w-full text-left px-4 py-3 text-sm transition ${
                              selectedLocation === location
                                ? 'bg-green-600 text-white font-semibold'
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
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition"
              >
                <Home size={20} />
                <span className="font-semibold text-sm">Home</span>
              </Link>

              {/* Categories */}
              <div>
                {categories.map((category) => (
                  <div key={category.name}>
                    {/* Category Button */}
                    <button
                      onClick={() => handleCategoryClick(category.name)}
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-gray-500 group-hover:text-green-600 transition">
                          {category.icon}
                        </div>
                        <span className="font-medium text-sm">
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
                          {category.subcategories.map((sub) => (
                            <Link
                              key={sub}
                              href={`/category/${category.name.toLowerCase()}`}
                              onClick={onClose}
                              className="block px-4 py-2.5 pl-12 text-sm text-gray-600 hover:text-green-600 hover:bg-white transition"
                            >
                              {sub}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer - User Section */}
            <div className="sticky bottom-0 bg-white p-4 space-y-3">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      onProfileClick?.();
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 hover:bg-green-50 hover:border-green-300 border border-gray-100 transition group"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold shrink-0 group-hover:scale-105 transition">
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
                    onSigninClick?.();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition"
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
