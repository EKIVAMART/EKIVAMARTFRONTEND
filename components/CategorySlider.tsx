'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Smartphone,
  Backpack,
  Footprints,
  Apple,
  Sparkles,
  Heart,
  Gem,
} from 'lucide-react';

interface CategorySliderItem {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const categoryItems: CategorySliderItem[] = [
  {
    name: 'Fashion',
    icon: <ShoppingBag size={28} />,
    color: 'from-blue-400 to-blue-600',
  },
  {
    name: 'Electronics',
    icon: <Smartphone size={28} />,
    color: 'from-purple-400 to-purple-600',
  },
  {
    name: 'Bags',
    icon: <Backpack size={28} />,
    color: 'from-pink-400 to-pink-600',
  },
  {
    name: 'Footwear',
    icon: <Footprints size={28} />,
    color: 'from-orange-400 to-orange-600',
  },
  {
    name: 'Groceries',
    icon: <Apple size={28} />,
    color: 'from-green-400 to-green-600',
  },
  {
    name: 'Beauty',
    icon: <Sparkles size={28} />,
    color: 'from-red-400 to-red-600',
  },
  {
    name: 'Wellness',
    icon: <Heart size={28} />,
    color: 'from-rose-400 to-rose-600',
  },
  {
    name: 'Jewellery',
    icon: <Gem size={28} />,
    color: 'from-yellow-400 to-yellow-600',
  },
];

export default function CategorySlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = 300;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  return (
    <div className="hidden lg:block w-full bg-linear-to-r from-gray-50 to-white py-6 border-b">
      <div className="mx-auto w-[95%] relative">
        {/* Section Title */}
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
          Shop by Category
        </h3>

        <div className="relative">
          {/* Scroll Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide"
          >
            {categoryItems.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="shrink-0"
              >
                <Link href={`/category/${item.name.toLowerCase()}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-linear-to-br ${item.color} p-6 rounded-xl text-white cursor-pointer shadow-md hover:shadow-lg transition-shadow w-28 h-28 flex flex-col items-center justify-center gap-2 group`}
                  >
                    <div className="text-white group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold text-center leading-tight group-hover:font-black">
                      {item.name}
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-green-600 hover:text-white text-gray-700 rounded-full p-2 shadow-lg transition-all"
            >
              <ChevronLeft size={20} />
            </motion.button>
          )}

          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-green-600 hover:text-white text-gray-700 rounded-full p-2 shadow-lg transition-all"
            >
              <ChevronRight size={20} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Hide */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
