"use client";
import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";

type SimpleProduct = {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  image?: string;
  category?: string;
  rating?: number;
  store?: string;
  location?: string;
};

type Props = {
  initialProducts: SimpleProduct[];
  categories: string[];
  active: string;
};

export default function CategoryProductsClient({ initialProducts, categories, active }: Props) {
   const searchParams = useSearchParams();
  const selectedLocation = searchParams.get('location') || 'All';
  const currency = "₦";

  const globalMin = useMemo(() => (initialProducts.length ? Math.min(...initialProducts.map((p) => p.price)) : 0), [initialProducts]);
  const globalMax = useMemo(() => (initialProducts.length ? Math.max(...initialProducts.map((p) => p.price)) : 0), [initialProducts]);

  const [minValue, setMinValue] = useState<number>(globalMin || 0);
  const [maxValue, setMaxValue] = useState<number>(globalMax || 0);

  // keep values in range if the data changes
  React.useEffect(() => {
    setMinValue(globalMin || 0);
    setMaxValue(globalMax || 0);
  }, [globalMin, globalMax]);

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchesPrice = p.price >= minValue && p.price <= maxValue;
      const matchesLocation = selectedLocation === 'All' || 
                             p.location?.toLowerCase() === selectedLocation.toLowerCase();
      return matchesPrice && matchesLocation;
    });
  }, [initialProducts, minValue, maxValue, selectedLocation]);

  function handleMinChange(v: number) {
    const next = Math.min(v, maxValue);
    setMinValue(next);
  }
  function handleMaxChange(v: number) {
    const next = Math.max(v, minValue);
    setMaxValue(next);
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <aside className="hidden md:block md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
            <h3 className="font-semibold mb-3 text-gray-500">Category</h3>
            <ul className="space-y-2">
              {categories.map((c) => {
                const slugC = String(c).toLowerCase().replace(/\s+/g, '-');
                const isActive = String(c).toLowerCase() === String(active).toLowerCase();
                return (
                    <li key={c}>
                      <a
                        href={`/categories/${slugC}`}
                        className={`block w-full px-3 py-3 rounded-lg transition text-sm ${isActive ? 'bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span className="capitalize">{c}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
  
              <div className="mt-6">
                <h4 className="font-semibold text-gray-500 mb-3">Filter by price</h4>
                <div className="p-3 bg-white rounded-lg border border-gray-100">
                  <div className="text-sm text-gray-600 mb-2">From: <span className="text-[#c800ff] font-semibold">{currency} {minValue}</span></div>
                  <div className="text-sm text-gray-600 mb-4">To: <span className="text-[#c800ff] font-semibold">{currency} {maxValue}</span></div>
  
                  <div className="space-y-2">
                    <input
                      aria-label="Minimum price"
                      type="range"
                      min={globalMin}
                      max={globalMax}
                      value={minValue}
                      onChange={(e) => handleMinChange(Number(e.target.value))}
                      className="w-full"
                    />
  
                    <input
                      aria-label="Maximum price"
                      type="range"
                      min={globalMin}
                      max={globalMax}
                      value={maxValue}
                      onChange={(e) => handleMaxChange(Number(e.target.value))}
                      className="w-full"
                    />
  
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        className="px-3 py-2 rounded-md bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white text-sm"
                        onClick={() => { setMinValue(globalMin); setMaxValue(globalMax); }}
                      >
                        Reset
                      </button>
                      <div className="text-sm text-gray-500">Showing <span className="text-[#c800ff] font-semibold">{filtered.length}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
  
          <section className="md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">We found <span className="text-[#c800ff] font-semibold">{filtered.length}</span> items for you!</div>
              <div className="flex items-center gap-3">
                <button className="text-sm text-gray-600 hover:text-[#c800ff]">Filters</button>
                <button className="text-sm text-gray-600 hover:text-[#c800ff]">Sort</button>
              </div>
            </div>
  
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <div key={p.id} className="w-full">
                    <ProductCard
                      id={p.id}
                      image={p.image ?? '/placeholder.png'}
                      category={p.category}
                      title={p.name}
                      price={p.price}
                      originalPrice={p.mrp}
                      rating={p.rating}
                      author={p.store}
                      location={p.location}
                      href={`/products/${p.id}`}
                    />
                  </div>
                ))
            ) : (
              <div className="col-span-full bg-white p-8 rounded-lg shadow text-center text-gray-600">No products found for this category yet.</div>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          :global(.pc-card) { max-width: 100%; }
        }
      `}</style>
    </div>
  );
}
