'use client';

import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, PackageCheck } from 'lucide-react';

interface ProductFiltersProps {
  onPriceChange?: (min: number, max: number) => void;
  onRatingChange?: (rating: number) => void;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
  onInStockOnlyChange?: (inStockOnly: boolean) => void;
  minPrice?: number;
  maxPrice?: number;
  globalMin?: number;
  globalMax?: number;
  sortBy?: string;
  sortOrder?: string;
  inStockOnly?: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  onPriceChange,
  onRatingChange,
  onSortChange,
  onInStockOnlyChange,
  minPrice: initialMinPrice,
  maxPrice: initialMaxPrice,
  globalMin = 0,
  globalMax = 100000,
  sortBy = 'relevance',
  sortOrder = 'desc',
  inStockOnly = false,
}) => {
  const [minPrice, setMinPrice] = useState<number>(initialMinPrice ?? globalMin);
  const [maxPrice, setMaxPrice] = useState<number>(initialMaxPrice ?? globalMax);
  const [minInput, setMinInput] = useState<string>(String(initialMinPrice ?? globalMin));
  const [maxInput, setMaxInput] = useState<string>(String(initialMaxPrice ?? globalMax));
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  useEffect(() => {
    const minVal = initialMinPrice ?? globalMin;
    setMinPrice(minVal);
    setMinInput(String(minVal));
  }, [initialMinPrice, globalMin]);

  useEffect(() => {
    const maxVal = initialMaxPrice ?? globalMax;
    setMaxPrice(maxVal);
    setMaxInput(String(maxVal));
  }, [initialMaxPrice, globalMax]);

  const handleMinSliderChange = (newMin: number) => {
    if (newMin <= maxPrice) {
      setMinPrice(newMin);
      setMinInput(String(newMin));
      onPriceChange?.(newMin, maxPrice);
    }
  };

  const handleMaxSliderChange = (newMax: number) => {
    if (newMax >= minPrice) {
      setMaxPrice(newMax);
      setMaxInput(String(newMax));
      onPriceChange?.(minPrice, newMax);
    }
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setMinInput(valStr);
    const val = Number(valStr);
    if (!isNaN(val) && val >= 0 && val <= maxPrice) {
      setMinPrice(val);
      onPriceChange?.(val, maxPrice);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setMaxInput(valStr);
    const val = Number(valStr);
    if (!isNaN(val) && val >= minPrice) {
      setMaxPrice(val);
      onPriceChange?.(minPrice, val);
    }
  };

  const handleRatingClick = (rating: number) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
    onRatingChange?.(newRating || 0);
  };

  const handleSortSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let newSortBy = 'relevance';
    let newSortOrder = 'desc';

    if (val === 'price-asc') {
      newSortBy = 'price';
      newSortOrder = 'asc';
    } else if (val === 'price-desc') {
      newSortBy = 'price';
      newSortOrder = 'desc';
    } else if (val === 'name-asc') {
      newSortBy = 'name';
      newSortOrder = 'asc';
    } else if (val === 'name-desc') {
      newSortBy = 'name';
      newSortOrder = 'desc';
    } else if (val === 'stock-desc') {
      newSortBy = 'stock';
      newSortOrder = 'desc';
    } else if (val === 'stock-asc') {
      newSortBy = 'stock';
      newSortOrder = 'asc';
    } else {
      newSortBy = 'relevance';
      newSortOrder = 'desc';
    }

    onSortChange?.(newSortBy, newSortOrder);
  };

  const renderStars = (count: number, filled: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={`text-sm ${i < filled ? 'text-amber-400' : 'text-gray-300'}`}
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

  const currentSortKey = `${sortBy}-${sortOrder}`;

  return (
    <div className="flex flex-col w-full space-y-4">

      {/* Sort By Dropdown */}
      <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100">
        <h4 className="font-bold text-gray-700 text-xs mb-2 flex items-center gap-1.5">
          <SlidersHorizontal size={14} className="text-[#9d4ae3]" />
          Sort Products
        </h4>
        <select
          value={
            sortBy === 'price'
              ? sortOrder === 'asc' ? 'price-asc' : 'price-desc'
              : sortBy === 'name'
              ? sortOrder === 'asc' ? 'name-asc' : 'name-desc'
              : sortBy === 'stock'
              ? sortOrder === 'asc' ? 'stock-asc' : 'stock-desc'
              : 'relevance'
          }
          onChange={handleSortSelectChange}
          className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#9d4ae3] text-gray-700 cursor-pointer"
        >
          <option value="relevance">Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
          <option value="stock-desc">Stock: High to Low</option>
          <option value="stock-asc">Stock: Low to High</option>
        </select>
      </div>

      {/* In-Stock Only Checkbox */}
      <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockOnlyChange?.(e.target.checked)}
            className="w-4 h-4 text-[#9d4ae3] rounded border-gray-300 focus:ring-[#9d4ae3] cursor-pointer"
          />
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <PackageCheck size={15} className="text-emerald-600" />
            In-Stock Only
          </div>
        </label>
      </div>

      {/* Filter by Price */}
      <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100">
        <h4 className="font-bold text-gray-700 text-xs mb-3">
          Filter by Price (₦)
        </h4>

        {/* Draggable Dual Range Slider */}
        <div className="space-y-3">
          <div className="relative py-4">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-gray-200 rounded-lg pointer-events-none"></div>
            <div
              className="absolute top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] rounded-lg pointer-events-none"
              style={{
                left: `${minPercentage}%`,
                right: `${100 - maxPercentage}%`,
              }}
            ></div>

            <div className="relative w-full h-2">
              <input
                type="range"
                min={Number.isNaN(Number(globalMin)) ? 0 : Number(globalMin)}
                max={Number.isNaN(Number(globalMax)) ? 100000 : Number(globalMax)}
                value={Number.isNaN(Number(minPrice)) ? 0 : Number(minPrice)}
                onChange={(e) => handleMinSliderChange(Number(e.target.value))}
                className="absolute w-full h-2 top-0 appearance-none cursor-pointer pointer-events-auto slider slider-min"
                style={{
                  zIndex: minPrice > ((Number(globalMin) || 0) + (Number(globalMax) || 100000)) / 2 ? 1 : 0,
                }}
              />
              <input
                type="range"
                min={Number.isNaN(Number(globalMin)) ? 0 : Number(globalMin)}
                max={Number.isNaN(Number(globalMax)) ? 100000 : Number(globalMax)}
                value={Number.isNaN(Number(maxPrice)) ? 100000 : Number(maxPrice)}
                onChange={(e) => handleMaxSliderChange(Number(e.target.value))}
                className="absolute w-full h-2 top-0 appearance-none cursor-pointer pointer-events-auto slider slider-max"
                style={{
                  zIndex: maxPrice < ((Number(globalMin) || 0) + (Number(globalMax) || 100000)) / 2 ? 0 : 1,
                }}
              />
            </div>
          </div>

          {/* Editable Text Input Fields */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] font-bold text-gray-500 block mb-0.5">Min (₦)</span>
              <input
                type="number"
                value={minInput}
                onChange={handleMinInputChange}
                className="w-full text-xs font-semibold px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#9d4ae3] bg-gray-50"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 block mb-0.5">Max (₦)</span>
              <input
                type="number"
                value={maxInput}
                onChange={handleMaxInputChange}
                className="w-full text-xs font-semibold px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#9d4ae3] bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Ratings */}
      <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100">
        <h4 className="font-bold text-gray-700 text-xs mb-3">
          Filter By Ratings
        </h4>

        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingClick(rating)}
              className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200 text-left ${
                selectedRating === rating
                  ? 'bg-amber-50 border border-amber-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              {renderStars(5, rating)}
              {rating < 5 && (
                <span className="text-[10px] text-gray-400 ml-auto font-medium">
                  ({rating}+)
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
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
          background: linear-gradient(135deg, #9d4ae3, #8236be) !important;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(157, 74, 227, 0.4);
          border: 2px solid #fff;
          margin-top: -5px;
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #9d4ae3, #8236be) !important;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(157, 74, 227, 0.4);
          border: 2px solid #fff;
        }
      `}</style>
    </div>
  );
};

export default ProductFilters;
