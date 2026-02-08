'use client';

import React, { useRef, useMemo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { assets } from '@/assets/assets';
import ProductCard from './ProductCard';
import { useProducts } from '@/lib/hooks';

const FeaturedProducts = () => {
  const products = useProducts();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to shuffle array and get random items
  const getRandomItems = <T,>(array: T[], count: number) => {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Get 10 random products from useProducts hook
  const featuredProducts = useMemo(() => {
    return getRandomItems(products, 10);
  }, [products]);

  // Calculate average rating
  const calculateAverageRating = (ratings: Array<{ rating: number }>) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 312; // Width of one product card (w-72 = 288px) + gap (24px)
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll =
        direction === 'left'
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-8 md:py-6 lg:py-8 px-4 md:px-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h2 className="text-lg font-semibold mb-6 text-black">
          Featured Products
        </h2>

        {/* Main Container */}
        <div className="flex flex-col lg:flex-row gap-0">
          {/* Products Carousel - Constrained Container with Padels */}
          <div className="flex-1 overflow-hidden">
            <div className="relative w-full group">
              {/* Left Padel Button */}
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 hidden sm:flex items-center justify-center bg-white rounded-full p-3 shadow-lg hover:shadow-2xl hover:bg-gray-50 active:scale-95 transition-all border border-gray-300 -translate-x-20 cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft size={32} className="text-gray-800 font-bold" />
              </button>

              {/* Scroll Container - Hidden Scrollbar & Overflow Hidden */}
              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto overflow-y-hidden scroll-smooth pb-2 px-2"
                style={{
                  scrollBehavior: 'smooth',
                  scrollSnapType: 'x mandatory',
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  width: '100%',
                }}
              >
                {/* Hide scrollbar for Chrome, Safari and Opera */}
                <style>{`
                  div[class*="overflow-x-auto"]::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>

                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="shrink-0 w-72"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <ProductCard
                      image={product.images[0]}
                      category={product.category}
                      title={product.name}
                      rating={calculateAverageRating(product.rating)}
                      author={product.store.name}
                      price={product.price}
                      originalPrice={product.mrp}
                      href={`/product/${product.id}`}
                    />
                  </div>
                ))}
              </div>

              {/* Right Padel Button */}
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 hidden sm:flex items-center justify-center bg-white rounded-full p-3 shadow-lg hover:shadow-2xl hover:bg-gray-50 active:scale-95 transition-all border border-gray-300 translate-x-20 cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight size={32} className="text-gray-800 font-bold" />
              </button>
            </div>

            {/* Mobile Navigation Info */}
            <p className="text-xs text-gray-500 text-center mt-4 sm:hidden">
              Scroll to see more products
            </p>
          </div>

          {/* Promotional Image - Scrolls Vertically with Page, Fixed Width on Desktop */}
          <div className="hidden lg:flex lg:w-80 lg:h-auto lg:shrink-0 lg:items-start lg:justify-center lg:pl-6 lg:pt-0">
            <div className="w-72 h-96 rounded-lg overflow-hidden shadow-xl sticky top-20">
              <Image
                src={assets.pop_pord_img}
                alt="Promotional Offer"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </div>

          {/* Promotional Image - Responsive on Mobile/Tablet */}
          <div className="lg:hidden w-full h-64 md:h-96 relative rounded-lg overflow-hidden shadow-lg mt-8">
            <Image
              src={assets.pop_pord_img}
              alt="Promotional Offer"
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
