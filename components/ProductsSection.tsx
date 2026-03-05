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
    <section className="products-section">
      <div className="products-container">
        {/* Title and Navigation Wrapper */}
        <div className="header-nav-wrapper">
          {/* Title */}
          <div className="products-header">
            <h2 className="text-lg font-semibold text-black">
              Popular Products
            </h2>
          </div>

          {/* Category Navigation */}
          <div className="category-nav-wrapper">
            {/* Left Arrow (Mobile) */}
            <button
              className={`scroll-button scroll-left ${canScrollLeft ? 'active' : ''}`}
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Tab Container */}
            <div
              className="category-tabs-wrapper"
              ref={scrollContainerRef}
              onScroll={handleScroll}
            >
              <div className="category-tabs-scroll">
                {CATEGORY_TABS.length > 0 &&
                  CATEGORY_TABS.map((category) => (
                    <button
                      key={category}
                      className={`category-tab ${
                        activeCategory === category ? 'active' : ''
                      }`}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category.toUpperCase()}
                    </button>
                  ))}
              </div>
            </div>

            {/* Right Arrow (Mobile) */}
            <button
              className={`scroll-button scroll-right ${canScrollRight ? 'active' : ''}`}
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
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
        .products-section {
          width: 100%;
          background: #ffffff;
          padding: 40px 0;
          margin: 0;
        }

        .products-container {
          max-width: 1400px;
          margin: 0 auto;
          width: 95%;
          padding: 0;
        }

        /* Title */
        .products-header {
          margin-bottom: 28px;
        }

        .products-title {
          font-size: 28px;
          font-weight: 800;
          color: #1f2937;
          margin: 0;
          letter-spacing: -0.5px;
        }

        /* Header and Navigation Wrapper - Desktop */
        .header-nav-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          margin-bottom: 40px;
        }

        .products-header {
          flex-shrink: 0;
        }

        /* Category Navigation Wrapper */
        .category-nav-wrapper {
          display: flex;
          align-items: center;
          gap: 0;
          flex: 1;
          position: relative;
          justify-content: flex-end;
        }

        /* Category Tabs */
        .category-tabs-wrapper {
          flex: 0 1 auto;
          border-bottom: 2px solid #e5e7eb;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .category-tabs-wrapper::-webkit-scrollbar {
          display: none;
        }

        .category-tabs-scroll {
          display: flex;
          gap: 0;
          padding: 0;
          margin: 0;
          list-style: none;
          min-width: min-content;
          flex-direction: row-reverse;
        }

        .category-tab {
          padding: 14px 20px;
          background: transparent;
          border: none;
          font-size: 13px;
          font-weight: 700;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          white-space: nowrap;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          flex-shrink: 0;
        }

        .category-tab:hover {
          color: #3b82f6;
        }

        .category-tab.active {
          color: #0369a1;
          border-bottom-color: #0369a1;
        }

        /* Scroll Buttons - Hidden on Desktop */
        .scroll-button {
          display: none;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 8px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .scroll-button:hover:not(:disabled) {
          color: #0369a1;
        }

        .scroll-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 28px 20px;
          margin-bottom: 40px;
          animation: fadeIn 0.6s ease-out;
        }

        .no-products {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
          font-size: 16px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* View More Button */
        .view-more-container {
          display: flex;
          justify-content: center;
          margin-top: 30px;
        }

        .view-more-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 32px;
          background: linear-gradient(135deg, #981d87 0%, #7a176c 100%);
          color: white;
          font-size: 14px;
          font-weight: 700;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 6px 20px rgba(152, 29, 135, 0.3);
          letter-spacing: 0.3px;
        }

        .view-more-btn:hover {
          background: linear-gradient(135deg, #7a176c 0%, #166534 100%);
          box-shadow: 0 10px 30px rgba(152, 29, 135, 0.4);
          transform: translateY(-3px);
        }

        .view-more-btn:active {
          transform: translateY(-1px);
        }

        /* Responsive - Tablet */
        @media (max-width: 1200px) {
          .products-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px 18px;
          }

          .products-title {
            font-size: 24px;
          }

          .category-tab {
            padding: 12px 16px;
            font-size: 12px;
          }
        }

        /* Responsive - Tablet Portrait */
        @media (max-width: 768px) {
          .products-section {
            padding: 32px 0;
            margin: 0;
          }

          .products-container {
            width: 95%;
          }

          .header-nav-wrapper {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 32px;
          }

          .products-header {
            margin-bottom: 0;
          }

          .products-title {
            font-size: 20px;
          }

          .category-nav-wrapper {
            width: 100%;
            gap: 8px;
          }

          .scroll-button {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
          }

          .scroll-button.active {
            color: #0369a1;
          }

          .category-tab {
            padding: 12px 14px;
            font-size: 11px;
          }

          .products-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px 14px;
          }
        }

        /* Responsive - Mobile */
        @media (max-width: 480px) {
          .products-section {
            padding: 24px 0;
            margin: 0;
          }

          .products-container {
            width: 95%;
          }

          .header-nav-wrapper {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 28px;
          }

          .products-header {
            margin-bottom: 0;
          }

          .products-title {
            font-size: 18px;
          }

          .category-nav-wrapper {
            width: 100%;
            gap: 6px;
          }

          .scroll-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
          }

          .scroll-button svg {
            width: 18px;
            height: 18px;
          }

          .category-tab {
            padding: 10px 12px;
            font-size: 10px;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px 10px;
          }

          .view-more-btn {
            padding: 10px 24px;
            font-size: 12px;
          }

          .no-products {
            padding: 40px 16px;
            font-size: 14px;
          }
        }

        /* Responsive - Small Mobile */
        @media (max-width: 360px) {
          .products-title {
            font-size: 16px;
          }

          .category-tab {
            padding: 8px 10px;
            font-size: 9px;
          }

          .products-grid {
            gap: 12px 8px;
          }

          .scroll-button svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </section>
  );
}
