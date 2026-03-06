'use client';
import Link from 'next/link';
import ProductCard from '../../../components/ProductCard';
import CategoriesGrid from '../../../components/CategoriesGrid';
import ProductFilters from '../../../components/ProductFilters';
import CategoryPromoBanner from '../../../components/CategoryPromoBanner';
import { useProducts } from '../../../lib/hooks';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { Product, Rating } from '../../../lib/types';

// groups for broad categories (map URL slug -> product categories)
const CATEGORY_GROUPS: Record<string, string[]> = {
  electronics: [
    'Speakers',
    'Headphones',
    'Earbuds',
    'Camera',
    'Mouse',
    'Cleaner',
    'Theater',
  ],
  fashion: ['Watch', 'Decoration'],
  bags: ['Bags', 'Backpacks'],
  footwear: ['Footwear', 'Shoes', 'Slippers'],
  groceries: ['Groceries', 'Fruits', 'Vegetables'],
  beauty: ['Beauty', 'Skincare', 'Makeup'],
};

function averageRating(ratings: Rating[] | number | undefined): number {
  if (!ratings) return 0;
  if (Array.isArray(ratings) && ratings.length > 0) {
    const nums = (ratings as Rating[]).map((r) =>
      typeof r.rating === 'number' ? r.rating : 0
    );
    return +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
  }
  if (typeof ratings === 'number') return ratings;
  return 0;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = String(params?.slug || '').toLowerCase();

  const allProducts = useProducts();

  // Get category products first
  const categoryProducts: Product[] = useMemo(() => {
    const group = CATEGORY_GROUPS[slug] || [];
    return allProducts.filter((p) => {
      if (!p || !p.category) return false;
      const cat = String(p.category).toLowerCase();
      if (cat === slug) return true;
      if (group.length > 0)
        return group.map((g) => g.toLowerCase()).includes(cat);
      return cat.includes(slug) || slug.includes(cat);
    });
  }, [allProducts, slug]);

  // Calculate global min and max prices
  const globalMin = useMemo(
    () =>
      categoryProducts.length
        ? Math.min(...categoryProducts.map((p) => p.price || 0))
        : 0,
    [categoryProducts]
  );
  const globalMax = useMemo(
    () =>
      categoryProducts.length
        ? Math.max(...categoryProducts.map((p) => p.price || 0))
        : 100000,
    [categoryProducts]
  );

  const [minPrice, setMinPrice] = useState<number>(globalMin || 0);
  const [maxPrice, setMaxPrice] = useState<number>(globalMax || 100000);
  const [selectedRating, setSelectedRating] = useState<number>(0);

  // Map slug to display name
  const slugToName: Record<string, string> = {
    electronics: 'Electronics',
    fashion: 'Fashion',
    bags: 'Bags',
    footwear: 'Footwear',
    groceries: 'Groceries',
    beauty: 'Beauty',
    wellness: 'Wellness',
    jewellery: 'Jewellery',
  };

  const active =
    slugToName[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);

  // Filter products by price and rating
  const products: Product[] = useMemo(() => {
    return categoryProducts.filter((p) => {
      const price = p.price || 0;
      if (price < minPrice || price > maxPrice) return false;

      if (selectedRating > 0) {
        const rating = averageRating(p.rating) || 0;
        if (rating < selectedRating) return false;
      }

      return true;
    });
  }, [categoryProducts, minPrice, maxPrice, selectedRating]);

  return (
    <main className="py-7 sm:py-6">
      <div className="mx-auto w-[90%]">
        <div className="rounded-2xl bg-[#fcedf9] p-5 sm:p-5 mb-5 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#7a176c] capitalize">
            {active}
          </h1>
          <div className="mt-2 text-sm text-gray-700 flex items-center gap-2">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="capitalize font-medium">{active}</span>
          </div>
        </div>

        {/* Categories Grid - Desktop Only */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Left sidebar - hidden on mobile */}
          <aside className="hidden md:block md:col-span-1">
            <div className="flex flex-col gap-4">
              {/* Categories */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-96 overflow-y-auto">
                <CategoriesGrid />
              </div>

              {/* Price and Rating Filters */}
              <div>
                <ProductFilters
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  globalMin={globalMin}
                  globalMax={globalMax}
                  onPriceChange={(min, max) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                  }}
                  onRatingChange={(rating) => setSelectedRating(rating)}
                />
              </div>

              {/* Promotional Banner */}
              <div>
                <CategoryPromoBanner />
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <section className="md:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                We found{' '}
                <span className="text-[#981d87] font-semibold">
                  {products.length}
                </span>{' '}
                items for you!
              </div>
              <div className="flex items-center gap-3">
                <button className="text-sm text-gray-600 hover:text-[#981d87]">
                  Filters
                </button>
                <button className="text-sm text-gray-600 hover:text-[#981d87]">
                  Sort
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.length > 0 ? (
                products.map((p: Product) => (
                  <div key={p.id} className="w-full">
                    <ProductCard
                      id={p.id}
                      image={p.images?.[0] ?? '/placeholder.png'}
                      category={p.category}
                      title={p.name}
                      price={p.price}
                      originalPrice={p.mrp}
                      rating={averageRating(p.rating)}
                      author={p.store?.name ?? p.storeId}
                      location={p.location}
                      href={`/product/${p.id}`}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white p-8 rounded-lg shadow text-center text-gray-600">
                  No products found for this category yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
