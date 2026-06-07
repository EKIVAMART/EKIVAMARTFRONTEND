'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categoryApi } from '@/lib/api';
import fashion from '../assets/fashion.png';
import electronics from '../assets/Electronics.png';
import bags from '../assets/beg.png';
import footwear from '../assets/footwear.png';
import groceries from '../assets/Groceries.png';
import beauty from '../assets/Beauty.png';
import wellness from '../assets/wellness.png';
import jewellery from '../assets/jewellery.png';

const categoryAssetMap: Record<string, any> = {
  'fashion': fashion,
  'electronics': electronics,
  'bags & luggage': bags,
  'bags': bags,
  'footwear': footwear,
  'groceries': groceries,
  'groceries and food': groceries,
  'beauty': beauty,
  'wellness': wellness,
  'jewellery': jewellery,
  'local market': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23fef3c7"/><text y=".9em" font-size="60" x="50%" text-anchor="middle" dominant-baseline="middle" dy="0.1em">🛒</text></svg>',
  'drinks': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23dbeafe"/><text y=".9em" font-size="60" x="50%" text-anchor="middle" dominant-baseline="middle" dy="0.1em">🥤</text></svg>',
};

const bgClasses = [
  'bg-fuchsia-50/50',
  'bg-orange-50/50',
  'bg-pink-50/50',
  'bg-blue-50/50',
  'bg-purple-50/50',
  'bg-teal-50/50',
  'bg-violet-50/50',
  'bg-green-50/50',
  'bg-yellow-50/50',
  'bg-red-50/50',
  'bg-cyan-50/50',
  'bg-indigo-50/50',
];

const CategoryCard = ({ category }: { category: any }) => {
  const isStaticImage = typeof category.icon !== 'string';
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex-shrink-0 flex flex-col items-center text-center cursor-pointer px-1"
    >
      {/* Circular image container */}
      <div
        className="
          w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full
          overflow-hidden
          bg-white
          border-2 border-white/60
          shadow-lg
          transition-all duration-300 ease-out
          group-hover:scale-110
          group-hover:shadow-2xl
          group-hover:ring-4
          group-hover:ring-purple-300/50
          flex items-center justify-center
        "
      >
        {isStaticImage ? (
          <Image
            src={category.icon}
            alt={category.name}
            width={160}
            height={160}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <img
            src={category.icon}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        )}
      </div>
      {/* Text label — scales with the image on hover, and shows in full without truncation */}
      <p className="mt-2 text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#c800ff] group-hover:scale-110 group-hover:mt-4 transition-all duration-300 whitespace-nowrap max-w-[96px] sm:max-w-[120px] truncate origin-top group-hover:whitespace-normal group-hover:max-w-[160px] group-hover:overflow-visible group-hover:text-clip">
        {category.name}
      </p>
    </Link>
  );
};

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch categories
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

        const formatted = data
          .filter((item: any) => {
            const isPublished = Boolean(item.isActive ?? item.is_active ?? (item.status === 'published' || item.status === 'active'));
            const isDraft = item.status === 'draft';
            return isPublished && !isDraft && !item.parentId;
          })
          .map((item: any, index: number) => {
            const name = item.name || item.title || item.displayName || 'Unknown';
            const slug = (item.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            const fallbackIcon = categoryAssetMap[name.toLowerCase()] || categoryAssetMap[slug] || fashion;
            const icon = item.imageUrl || item.image || fallbackIcon;

            return {
              id: String(item.id || item._id || item.categoryId || item.uuid),
              name,
              slug,
              icon,
              bg: bgClasses[index % bgClasses.length],
            };
          });

        if (isMounted) {
          setCategories(formatted);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch carousel categories:', err);
        if (isMounted) setLoading(false);
      }
    };
    void fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Autoplay Smooth Scroll Animation
  useEffect(() => {
    if (categories.length === 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let isHovered = false;

    const scrollSpeed = 120; // Pixels per second — fast, crisp

    const animate = (time: number) => {
      if (!container) return;

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (!isHovered) {
        container.scrollLeft += scrollSpeed * delta;

        // Wrap around seamlessly
        const maxScroll = container.scrollWidth / 2;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft -= maxScroll;
        } else if (container.scrollLeft <= 0) {
          container.scrollLeft += maxScroll;
        }

        // Update progress indicator based on exactly one cycle (1/4 of total scroll width)
        const singleCycleWidth = container.scrollWidth / 4;
        if (singleCycleWidth > 0) {
          const progress = (container.scrollLeft % singleCycleWidth) / singleCycleWidth;
          setScrollProgress(progress);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleMouseEnter = () => { isHovered = true; };
    const handleMouseLeave = () => {
      isHovered = false;
      lastTime = performance.now();
    };

    const handleScrollEvent = () => {
      const { scrollLeft, scrollWidth } = container;
      const singleCycleWidth = scrollWidth / 4;
      if (singleCycleWidth > 0) {
        const progress = (scrollLeft % singleCycleWidth) / singleCycleWidth;
        setScrollProgress(progress);
      }
    };

    container.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    container.addEventListener('scroll', handleScrollEvent, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('scroll', handleScrollEvent);
      }
    };
  }, [categories]);

  // Duplicate categories to make infinite scrolling seamless
  const displayCategories = [...categories, ...categories, ...categories, ...categories];

  return (
    <section
      className="overflow-hidden w-full py-10 border-y"
      style={{
        background: 'linear-gradient(135deg, #edd8ff 0%, #e0d5ff 40%, #f6ebff 70%, #f472b626 100%)',
        borderColor: 'rgba(168,85,247,0.3)',
      }}
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="h-px w-8 bg-purple-300 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[3.5px] text-purple-600">Browse</span>
          <span className="h-px w-8 bg-purple-300 rounded-full" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Featured Categories
        </h2>
        <p className="mt-1 text-sm text-gray-500">Browse our wide range of product categories</p>
      </div>

      {/* Scrollable Carousel */}
      <div className="relative w-full py-2">
        {/* Fade edges */}
        <div
          className="absolute left-0 top-0 bottom-0 w-10 sm:w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #f3e8ff, transparent)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-10 sm:w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #ede9fe, transparent)' }}
        />

        <div
          ref={scrollContainerRef}
          className="flex flex-nowrap overflow-x-auto gap-4 sm:gap-6 px-6 sm:px-12 pb-4 pt-4 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3 animate-pulse shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-purple-200/40" />
                <div className="h-3 w-16 bg-purple-200/40 rounded" />
              </div>
            ))
          ) : displayCategories.length > 0 ? (
            displayCategories.map((category, index) => (
              <div key={`${category.id}-${index}`} className="shrink-0">
                <CategoryCard category={category} />
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-gray-400 py-4 w-full">No featured categories found</div>
          )}
        </div>
      </div>

      {/* Position Indicator */}
      <div className="w-28 h-1.5 bg-purple-200/60 rounded-full mx-auto mt-4 relative overflow-hidden">
        <div
          className="absolute top-0 bottom-0 bg-gradient-to-r from-[#c800ff] to-[#912cad] rounded-full transition-none"
          style={{
            width: '25%',
            left: `${scrollProgress * 75}%`,
          }}
        />
      </div>

      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default FeaturedCategories;
