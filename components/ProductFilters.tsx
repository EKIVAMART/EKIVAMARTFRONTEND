'use client';

import React, { useState } from 'react';

interface ProductFiltersProps {
  onPriceChange?: (min: number, max: number) => void;
  onRatingChange?: (rating: number) => void;
  minPrice?: number;
  maxPrice?: number;
  globalMin?: number;
  globalMax?: number;
}

const ProductFilters = ({
  onPriceChange,
  onRatingChange,
  minPrice: initialMinPrice,
  maxPrice: initialMaxPrice,
  globalMin = 0,
  globalMax = 100000,
}: ProductFiltersProps) => {
  const [minPrice, setMinPrice] = useState<number>(
    initialMinPrice ?? globalMin
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    initialMaxPrice ?? globalMax
  );
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const handleMinChange = (newMin: number) => {
    if (newMin <= maxPrice) {
      setMinPrice(newMin);
      onPriceChange?.(newMin, maxPrice);
    }
  };

  const handleMaxChange = (newMax: number) => {
    if (newMax >= minPrice) {
      setMaxPrice(newMax);
      onPriceChange?.(minPrice, newMax);
    }
  };

  const handleRatingClick = (rating: number) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
    onRatingChange?.(newRating || 0);
  };

  const renderStars = (count: number, filled: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={`text-sm ${i < filled ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const minPercentage =
    ((minPrice - globalMin) / (globalMax - globalMin)) * 100;
  const maxPercentage =
    ((maxPrice - globalMin) / (globalMax - globalMin)) * 100;

  return (
    <div className="flex flex-col w-[70%] space-y-4">
      {/* Filter by Price */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <h4 className="font-semibold text-gray-700 text-[13px] mb-3">
          Filter by price
        </h4>

        {/* Price Range Slider */}
        <div className="space-y-3">
          {/* Dual Range Slider with Progress Bar */}
          <div className="relative py-4">
            {/* Background track */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-gray-200 rounded-lg pointer-events-none"></div>
            {/* Active track */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-2 bg-blue-500 rounded-lg pointer-events-none"
              style={{
                left: `${minPercentage}%`,
                right: `${100 - maxPercentage}%`,
              }}
            ></div>

            {/* Input wrapper for proper alignment */}
            <div className="relative w-full h-2">
              {/* Min slider */}
              <input
                type="range"
                min={globalMin}
                max={globalMax}
                value={minPrice}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className="absolute w-full h-2 top-0 appearance-none cursor-pointer pointer-events-auto slider slider-min"
                style={{
                  zIndex: minPrice > (globalMin + globalMax) / 2 ? 1 : 0,
                }}
              />

              {/* Max slider */}
              <input
                type="range"
                min={globalMin}
                max={globalMax}
                value={maxPrice}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                className="absolute w-full h-2 top-0 appearance-none cursor-pointer pointer-events-auto slider slider-max"
                style={{
                  zIndex: maxPrice < (globalMin + globalMax) / 2 ? 0 : 1,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-gray-600 pt-2">
            <span>
              From:{' '}
              <span className="text-blue-500 font-semibold">₦ {minPrice}</span>
            </span>
            <span>
              To:{' '}
              <span className="text-blue-500 font-semibold">₦ {maxPrice}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter by Ratings */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <h4 className="font-semibold text-gray-700 text-[13px] mb-3">
          Filter By Ratings
        </h4>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingClick(rating)}
              className={`w-full flex items-center gap-2 p-2 rounded-md transition-all duration-300 text-left ${
                selectedRating === rating
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              {renderStars(5, rating)}
              {rating < 5 && (
                <span className="text-[10px] text-gray-500 ml-auto">
                  ({rating}+)
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
