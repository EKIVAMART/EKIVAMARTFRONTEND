'use client';

import React, { useState, useEffect } from 'react';

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

  // Sync state with parent props when they change
  useEffect(() => {
    setMinPrice(initialMinPrice ?? globalMin);
  }, [initialMinPrice, globalMin]);

  useEffect(() => {
    setMaxPrice(initialMaxPrice ?? globalMax);
  }, [initialMaxPrice, globalMax]);

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

  const range = (globalMax || 0) - (globalMin || 0);
  const minPercentage = range > 0 ? (((minPrice || 0) - (globalMin || 0)) / range) * 100 : 0;
  const maxPercentage = range > 0 ? (((maxPrice || 0) - (globalMin || 0)) / range) * 100 : 100;

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
              className="absolute top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-[#c800ff] to-[#912cad] rounded-lg pointer-events-none"
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
                min={Number.isNaN(Number(globalMin)) ? 0 : Number(globalMin)}
                max={Number.isNaN(Number(globalMax)) ? 100000 : Number(globalMax)}
                value={Number.isNaN(Number(minPrice)) ? 0 : Number(minPrice)}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className="absolute w-full h-2 top-0 appearance-none cursor-pointer pointer-events-auto slider slider-min"
                style={{
                  zIndex: minPrice > ((Number(globalMin) || 0) + (Number(globalMax) || 100000)) / 2 ? 1 : 0,
                }}
              />

              {/* Max slider */}
              <input
                type="range"
                min={Number.isNaN(Number(globalMin)) ? 0 : Number(globalMin)}
                max={Number.isNaN(Number(globalMax)) ? 100000 : Number(globalMax)}
                value={Number.isNaN(Number(maxPrice)) ? 100000 : Number(maxPrice)}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                className="absolute w-full h-2 top-0 appearance-none cursor-pointer pointer-events-auto slider slider-max"
                style={{
                  zIndex: maxPrice < ((Number(globalMin) || 0) + (Number(globalMax) || 100000)) / 2 ? 0 : 1,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-gray-600 pt-2">
            <span>
              From:{' '}
              <span className="text-[#c800ff] font-semibold">₦ {minPrice}</span>
            </span>
            <span>
              To:{' '}
              <span className="text-[#c800ff] font-semibold">₦ {maxPrice}</span>
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

      <style>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          outline: none;
          background: transparent;
          padding: 0;
          margin: 0;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c800ff, #912cad) !important;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(200, 0, 255, 0.4);
          border: 2px solid #fff;
          margin-top: -5px;
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c800ff, #912cad) !important;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(200, 0, 255, 0.4);
          border: 2px solid #fff;
        }
        .slider::-webkit-slider-thumb:hover,
        .slider::-moz-range-thumb:hover {
          background: linear-gradient(135deg, #d845ff, #a23cd6) !important;
          box-shadow: 0 2px 6px rgba(200, 0, 255, 0.6);
        }
      `}</style>
    </div>
  );
};

export default ProductFilters;
