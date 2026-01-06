"use client";
import React, { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { productDummyData, categories } from "@/assets/assets";

type Rating = {
  rating: number;
};

export default function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") {
      return productDummyData;
    }
    return productDummyData.filter(product => product.category === activeCategory);
  }, [activeCategory]);

  const calculateAverageRating = (ratings: Rating[]) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  };

  return (
    <section className="py-16 px-4 bg-linear-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated collection of premium products designed for modern living
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === "All"
                ? "bg-emerald-600 text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200"
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-emerald-600 text-white shadow-lg transform scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="transform transition-all duration-300 hover:scale-105"
            >
              <ProductCard
                image={product.images[0]}
                category={product.category}
                title={product.name}
                price={product.price}
                originalPrice={product.mrp}
                rating={calculateAverageRating(product.rating)}
                author={product.store.name}
                href={`/product/${product.id}`}
              />
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            View All Products
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .grid {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 1024px) and (max-width: 1279px) {
          .grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (min-width: 1280px) {
          .grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  );
}