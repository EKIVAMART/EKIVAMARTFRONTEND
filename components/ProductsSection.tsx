'use client';
import React, { useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { useProducts } from '@/lib/hooks';
import { Package, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

type Rating = {
  rating: number;
};

// Beautiful Empty State Component
const EmptyState = ({ category }: { category: string }) => (
  <div className="empty-state-container">
    <div className="empty-state-content">
      <div className="empty-state-icon">
        <Package size={64} strokeWidth={1.5} />
      </div>
      <h3 className="empty-state-title">No Products Found</h3>
      <p className="empty-state-subtitle">
        We couldn&apos;t find any products in the{' '}
        <span className="font-semibold text-gray-900">{category}</span> category
        at the moment.
      </p>
      <div className="empty-state-decoration">
        <Sparkles size={20} />
      </div>
      <p className="empty-state-hint">Check back soon for new arrivals!</p>
    </div>
  </div>
);

export default function ProductsSection() {
  const products = useProducts();
  const searchParams = useSearchParams();
  const selectedLocation = searchParams.get('location') || 'All';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Get unique categories from products - limit to 7
  const CATEGORY_TABS = useMemo(() => {
    const uniqueCategories = [...new Set(products.map((p) => p.category))];
    return uniqueCategories.sort().slice(0, 7);
  }, [products]);

  const [activeCategory, setActiveCategory] = useState(
    CATEGORY_TABS[0] || 'All'
  );

  // Scroll handler for mobile
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 150;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(handleScroll, 100);
    }
  };

  const calculateAverageRating = (ratings: Rating[]) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  };

  // Helper function to shuffle array and get random items
  const getRandomItems = <T,>(array: T[], count: number) => {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Filter products by active category
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = product.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesLocation = selectedLocation === 'All' || 
                             product.location?.toLowerCase() === selectedLocation.toLowerCase();
      return matchesCategory && matchesLocation;
    });
    // Return at most 10 random products from the category
    return getRandomItems(filtered, 10);
  }, [products, activeCategory, selectedLocation]);

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header + Category Nav */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-px w-6 bg-gradient-to-r from-[#c800ff] to-transparent rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[3.5px] text-[#c800ff]/80">Shop</span>
              <span className="h-px w-6 bg-gradient-to-l from-[#c800ff] to-transparent rounded-full" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Popular Products</h2>
            <p className="mt-1 text-sm text-gray-500">Discover top picks across every category</p>
          </div>

          {/* Category Pills Nav */}
          <div className="flex items-center gap-2">
            {/* Left arrow — mobile only */}
            <button
              className={`flex-shrink-0 p-1.5 rounded-full transition-colors sm:hidden ${canScrollLeft ? 'text-[#c800ff]' : 'text-gray-300'}`}
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>

            <div
              className="flex gap-2 overflow-x-auto scrollbar-none"
              ref={scrollContainerRef}
              onScroll={handleScroll}
            >
              {CATEGORY_TABS.length > 0 && CATEGORY_TABS.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200 border ${
                    activeCategory === category
                      ? 'bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white border-transparent shadow-md shadow-purple-500/30'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#c800ff] hover:text-[#c800ff]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Right arrow — mobile only */}
            <button
              className={`flex-shrink-0 p-1.5 rounded-full transition-colors sm:hidden ${canScrollRight ? 'text-[#c800ff]' : 'text-gray-300'}`}
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 animate-[fadeIn_0.5s_ease-out]">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={product.images[0]}
                category={product.category}
                title={product.name}
                price={product.price}
                originalPrice={product.mrp}
                rating={calculateAverageRating(product.rating)}
                author={product.store.name}
                location={product.location}
                href={`/product/${product.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState category={activeCategory} />
        )}
      </div>

      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
