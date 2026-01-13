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
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Popular Products
          </h2>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-3 mb-12 overflow-x-auto scrollbar-hide px-4 md:px-0 md:justify-center md:flex-wrap">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
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
              className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                activeCategory === category
                  ? "bg-emerald-600 text-white shadow-lg transform scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

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
    </section>
  );
}