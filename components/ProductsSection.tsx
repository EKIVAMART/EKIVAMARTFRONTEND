'use client';
import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '@/lib/hooks';
import { ChevronRight } from 'lucide-react';

type Rating = {
  rating: number;
};

const CATEGORY_TABS = [
  'Fashion',
  'Electronics',
  'Bags',
  'Footwear',
  'Groceries',
  'Beauty',
  'Wellness',
  'Jewellery',
];

export default function ProductsSection() {
  const products = useProducts();
  const [activeCategory, setActiveCategory] = useState('Fashion');

  const calculateAverageRating = (ratings: Rating[]) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  };

  // Filter products by active category
  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [products, activeCategory]);

  // Fallback: show all products if no match found
  const displayProducts =
    filteredProducts.length > 0 ? filteredProducts : products;

  return (
    <section className="products-section">
      <div className="products-container">
        {/* Header with Category Tabs */}
        <div className="header-tabs-wrapper">
          <div className="products-header">
            <h2 className="text-lg font-semibold mb-6 text-black">
              Popular Products
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="category-tabs-wrapper">
            <div className="category-tabs-scroll">
              {CATEGORY_TABS.map((category) => (
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
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {displayProducts.length > 0 ? (
            displayProducts
              .slice(0, 8)
              .map((product) => (
                <ProductCard
                  key={product.id}
                  image={product.images[0]}
                  category={product.category}
                  title={product.name}
                  price={product.price}
                  originalPrice={product.mrp}
                  rating={calculateAverageRating(product.rating)}
                  author={product.store.name}
                  href={`/product/${product.id}`}
                />
              ))
          ) : (
            <div className="no-products">
              <p>No products found in this category</p>
            </div>
          )}
        </div>

        {/* View More Button */}
        {displayProducts.length > 0 && (
          <div className="view-more-container">
            <button className="view-more-btn">
              <span>View All Products</span>
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .products-section {
          width: 100%;
          background: #ffffff;
          padding: 50px 20px;
          margin: 10px 0;
        }

        .products-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Header and Tabs Wrapper */
        .header-tabs-wrapper {
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
          margin-bottom: 40px;
          gap: 60px;
        }

        /* Header */
        .products-header {
          flex-shrink: 0;
        }

        .products-title {
          font-size: 28px;
          font-weight: 800;
          color: #1f2937;
          margin: 0;
          letter-spacing: -0.5px;
          white-space: nowrap;
        }

        /* Category Tabs */
        .category-tabs-wrapper {
          margin-left: auto;
          border-bottom: 2px solid #e5e7eb;
          overflow-x: auto;
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
        }

        .category-tab {
          padding: 14px 18px;
          background: transparent;
          border: none;
          font-size: 12px;
          font-weight: 700;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          position: relative;
          white-space: nowrap;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
        }

        .category-tab:hover {
          color: #16a34a;
        }

        .category-tab.active {
          color: #0369a1;
          border-bottom-color: #0369a1;
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
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          font-size: 14px;
          font-weight: 700;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 6px 20px rgba(22, 163, 74, 0.3);
          letter-spacing: 0.3px;
        }

        .view-more-btn:hover {
          background: linear-gradient(135deg, #15803d 0%, #166534 100%);
          box-shadow: 0 10px 30px rgba(22, 163, 74, 0.4);
          transform: translateY(-3px);
        }

        .view-more-btn:active {
          transform: translateY(-1px);
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .header-tabs-wrapper {
            gap: 30px;
          }

          .products-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px 18px;
          }

          .products-title {
            font-size: 24px;
          }

          .category-tab {
            padding: 12px 14px;
            font-size: 11px;
          }
        }

        @media (max-width: 768px) {
          .products-section {
            padding: 35px 16px;
            margin: 25px 0;
          }

          .header-tabs-wrapper {
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 28px;
            gap: 16px;
            justify-content: flex-start;
          }

          .products-title {
            font-size: 20px;
          }

          .category-tabs-wrapper {
            width: 100%;
            margin-bottom: 0;
            margin-left: 0;
          }

          .products-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px 14px;
          }

          .category-tab {
            padding: 10px 12px;
            font-size: 10px;
          }
        }

        @media (max-width: 480px) {
          .products-section {
            padding: 24px 12px;
            margin: 16px 0;
          }

          .header-tabs-wrapper {
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 20px;
            gap: 12px;
          }

          .products-title {
            font-size: 18px;
          }

          .category-tabs-wrapper {
            width: 100%;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px 10px;
          }

          .category-tab {
            padding: 8px 10px;
            font-size: 9px;
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

        @media (max-width: 360px) {
          .products-title {
            font-size: 16px;
          }

          .category-tab {
            padding: 8px 8px;
            font-size: 8px;
          }

          .products-grid {
            gap: 12px 8px;
          }
        }
      `}</style>
    </section>
  );
}
