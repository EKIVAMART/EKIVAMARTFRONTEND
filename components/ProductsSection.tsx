'use client';
import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '@/lib/hooks';
import { ChevronRight, Zap } from 'lucide-react';

type Rating = {
  rating: number;
};

export default function ProductsSection() {
  const products = useProducts();

  const calculateAverageRating = (ratings: Rating[]) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  };

  return (
    <section className="products-section">
      <div className="products-container">
        {/* Header with Icon */}
        <div className="products-header">
          <div className="products-header-content">
            <div className="products-title-wrapper">
              <Zap className="products-icon" size={32} />
              <h2 className="products-title">Trending Now</h2>
            </div>
            <p className="products-subtitle">
              Discover our most popular and best-selling products
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {products.map((product) => (
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
          ))}
        </div>

        {/* View More Button */}
        <div className="view-more-container">
          <button className="view-more-btn">
            <span>View All Products</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .products-section {
          width: 100%;
          background: linear-gradient(135deg, #f8fafb 0%, #f0fdf4 100%);
          padding: 60px 20px;
          margin: 40px 0;
        }

        .products-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Header */
        .products-header {
          margin-bottom: 48px;
          text-align: center;
        }

        .products-header-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .products-title-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .products-icon {
          color: #16a34a;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .products-title {
          font-size: 42px;
          font-weight: 800;
          color: #1f2937;
          margin: 0;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #1f2937 0%, #16a34a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .products-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 32px 24px;
          margin-bottom: 50px;
          animation: fadeIn 0.6s ease-out;
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
          margin-top: 40px;
        }

        .view-more-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 36px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          font-size: 15px;
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
        @media (max-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
            gap: 28px 20px;
          }

          .products-title {
            font-size: 36px;
          }
        }

        @media (max-width: 768px) {
          .products-section {
            padding: 40px 16px;
            margin: 30px 0;
          }

          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
            gap: 24px 16px;
          }

          .products-title {
            font-size: 28px;
          }

          .products-subtitle {
            font-size: 14px;
          }

          .category-tabs-wrapper {
            margin-bottom: 32px;
          }

          .category-tab {
            padding: 10px 16px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .products-section {
            padding: 30px 12px;
            margin: 20px 0;
          }

          .products-header {
            margin-bottom: 30px;
          }

          .products-title {
            font-size: 24px;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px 12px;
          }

          .category-tab {
            padding: 8px 14px;
            font-size: 12px;
          }

          .view-more-btn {
            padding: 12px 28px;
            font-size: 14px;
          }
        }
      `}</style>
    </section>
  );
}
