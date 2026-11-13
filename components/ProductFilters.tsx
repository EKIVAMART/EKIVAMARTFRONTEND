'use client';

import { useEffect, useId, useState } from 'react';
import { ChevronDown, Star } from '@/components/ui/platform-icons';
import styles from './product-filters.module.css';

interface ProductFiltersProps {
  onPriceChange?: (min: number, max: number) => void;
  onRatingChange?: (rating: number) => void;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
  onInStockOnlyChange?: (value: boolean) => void;
  minPrice?: number;
  maxPrice?: number;
  globalMin?: number;
  globalMax?: number;
  sortBy?: string;
  sortOrder?: string;
  inStockOnly?: boolean;
  rating?: number;
}

export const ProductFilters = ({ onPriceChange, onRatingChange, onSortChange, onInStockOnlyChange, minPrice, maxPrice, globalMin = 0, globalMax = 100000, sortBy = 'relevance', sortOrder = 'desc', inStockOnly = false, rating = 0 }: ProductFiltersProps) => {
  const id = useId();
  const low = Number.isFinite(globalMin) ? Math.max(0, globalMin) : 0;
  const high = Number.isFinite(globalMax) ? Math.max(low, globalMax) : 100000;
  const min = Math.max(low, Math.min(minPrice ?? low, high));
  const max = Math.max(min, Math.min(maxPrice ?? high, high));
  const [minInput, setMinInput] = useState(String(min));
  const [maxInput, setMaxInput] = useState(String(max));
  useEffect(() => setMinInput(String(min)), [min]);
  useEffect(() => setMaxInput(String(max)), [max]);
  const update = (value: string, field: 'min' | 'max') => {
    (field === 'min' ? setMinInput : setMaxInput)(value);
    if (!value.trim()) return;
    const price = Number(value);
    if (!Number.isFinite(price) || price < low || price > high) return;
    if (field === 'min' && price <= max) onPriceChange?.(price, max);
    if (field === 'max' && price >= min) onPriceChange?.(min, price);
  };
  return <div className={styles.filters}>
    <div className={styles.group}>
      <label htmlFor={`${id}-sort`}>Sort by</label>
      <div className={styles.select}>
        <select id={`${id}-sort`} value={['price', 'name', 'stock'].includes(sortBy) ? `${sortBy}-${sortOrder}` : 'relevance'} onChange={event => {
          const [by, order = 'desc'] = event.target.value.split('-'); onSortChange?.(by, order);
        }}>
          <option value="relevance">Relevance</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name-asc">Name: A to Z</option><option value="name-desc">Name: Z to A</option><option value="stock-desc">Stock: high to low</option><option value="stock-asc">Stock: low to high</option>
        </select>
        <ChevronDown size={17} aria-hidden="true" />
      </div>
    </div>
    <label className={styles.stock}><input type="checkbox" checked={inStockOnly} onChange={event => onInStockOnlyChange?.(event.target.checked)} />In stock only</label>
    <fieldset className={styles.group}>
      <legend>Price range (₦)</legend>
      <div className={styles.prices}>
        <label>Minimum<input type="number" inputMode="decimal" min={low} max={max} value={minInput} onChange={event => update(event.target.value, 'min')} onBlur={() => setMinInput(String(min))} /></label>
        <label>Maximum<input type="number" inputMode="decimal" min={min} max={high} value={maxInput} onChange={event => update(event.target.value, 'max')} onBlur={() => setMaxInput(String(max))} /></label>
      </div>
      <label className={styles.range}>Minimum price<input type="range" min={low} max={high} value={min} disabled={high === low} onChange={event => onPriceChange?.(Math.min(Number(event.target.value), max), max)} /></label>
      <label className={styles.range}>Maximum price<input type="range" min={low} max={high} value={max} disabled={high === low} onChange={event => onPriceChange?.(min, Math.max(Number(event.target.value), min))} /></label>
    </fieldset>
    <fieldset className={styles.group}>
      <legend>Customer rating</legend>
      <div className={styles.ratings}>
        {[5, 4, 3, 2, 1].map(value => <button type="button" key={value} aria-pressed={rating === value} aria-label={value === 5 ? '5 stars' : `${value} stars and above`} onClick={() => onRatingChange?.(rating === value ? 0 : value)}>
          <Star size={16} aria-hidden="true" /> {value}{value < 5 ? '+' : ''}
        </button>)}
      </div>
      {rating > 0 && <button type="button" className={styles.clear} onClick={() => onRatingChange?.(0)}>Clear rating</button>}
    </fieldset>
  </div>;
};
export default ProductFilters;
