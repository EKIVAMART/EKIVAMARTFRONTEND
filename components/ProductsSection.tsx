'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { productApi, categoryApi } from '@/lib/api';
import { Package, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface Rating {
  id: string;
  rating: number;
  review: string;
  user: {
    name: string;
    image: string;
  };
}

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  mrp?: number;
  discount?: number;
  preview?: string;
  description?: string;
  images?: Array<{ url: string; altText: string; isPrimary: boolean; order: number }>;
  category?: { id: string; name: string } | string;
  categoryId: string;
  store?: { id: string; name: string; logo?: string };
  storeId?: string;
  location?: string;
  rating?: Rating[] | number;
  stock: number;
}

// Beautiful Empty State Component
const EmptyState = ({ category }: { category: string }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 bg-white rounded-3xl border border-purple-100 shadow-sm text-center max-w-md mx-auto my-6 animate-[fadeIn_0.4s_ease-out]">
    <div className="w-16 h-16 rounded-2xl bg-[#fcedf9] text-[#c800ff] flex items-center justify-center mb-5 shadow-inner">
      <Package size={32} strokeWidth={1.5} />
    </div>
    <h3 className="text-lg font-extrabold text-gray-900 mb-2">No Products Available</h3>
    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
      We couldn&apos;t find any published items in the{' '}
      <span className="font-semibold text-[#c800ff]">{category}</span> collection
      at the moment.
    </p>
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#fcedf9] to-[#f5eeff] rounded-full border border-purple-100">
      <Sparkles size={14} className="text-purple-500 animate-pulse" />
      <span className="text-[10px] font-bold text-[#912cad] uppercase tracking-wider">New Stock Arriving Daily!</span>
    </div>
  </div>
);

export default function ProductsSection() {
  const searchParams = useSearchParams();
  const selectedLocation = searchParams.get('location') || 'All';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Smartphones');
  const [subcategoryIdMap, setSubcategoryIdMap] = useState<Record<string, string>>({});

  // 8 Specific popular product chips requested by the user
  const CATEGORY_TABS = [
    'Smartphones',
    'Sneakers',
    'Headphones',
    'Skincare',
    'Laptops',
    'T-Shirts',
    'Fragrances',
    'Rice'
  ];

  const findMatchingSubcategory = (chip: string, allSubcategories: any[]) => {
    const chipNorm = chip.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // First pass: exact match
    let matched = allSubcategories.find(sub => {
      const nameNorm = sub.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return nameNorm === chipNorm;
    });
    
    if (matched) return matched;

    // Second pass: contains / is contained in
    matched = allSubcategories.find(sub => {
      const nameNorm = sub.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return nameNorm.includes(chipNorm) || chipNorm.includes(nameNorm);
    });

    if (matched) return matched;

    // Third pass: specific synonyms
    if (chipNorm === 'smartphones') {
      matched = allSubcategories.find(sub => {
        const nameNorm = sub.name.toLowerCase();
        return nameNorm.includes('phone') || nameNorm.includes('mobile');
      });
    } else if (chipNorm === 'sneakers') {
      matched = allSubcategories.find(sub => {
        const nameNorm = sub.name.toLowerCase();
        return nameNorm.includes('shoe') || nameNorm.includes('footwear') || nameNorm.includes('sneaker');
      });
    } else if (chipNorm === 'headphones') {
      matched = allSubcategories.find(sub => {
        const nameNorm = sub.name.toLowerCase();
        return nameNorm.includes('audio') || nameNorm.includes('headphone') || nameNorm.includes('earbud');
      });
    } else if (chipNorm === 'skincare') {
      matched = allSubcategories.find(sub => {
        const nameNorm = sub.name.toLowerCase();
        return nameNorm.includes('skin') || nameNorm.includes('beauty') || nameNorm.includes('cosmetic');
      });
    } else if (chipNorm === 'laptops') {
      matched = allSubcategories.find(sub => {
        const nameNorm = sub.name.toLowerCase();
        return nameNorm.includes('laptop') || nameNorm.includes('computer');
      });
    } else if (chipNorm === 'tshirts') {
      matched = allSubcategories.find(sub => {
        const nameNorm = sub.name.toLowerCase();
        return nameNorm.includes('shirt') || nameNorm.includes('fashion') || nameNorm.includes('apparel');
      });
    } else if (chipNorm === 'fragrances') {
      matched = allSubcategories.find(sub => {
        const nameNorm = sub.name.toLowerCase();
        return nameNorm.includes('perfume') || nameNorm.includes('fragrance') || nameNorm.includes('scent') || nameNorm.includes('beauty');
      });
    } else if (chipNorm === 'rice') {
      matched = allSubcategories.find(sub => {
        const nameNorm = sub.name.toLowerCase();
        return nameNorm.includes('rice') || nameNorm.includes('grocery') || nameNorm.includes('groceries') || nameNorm.includes('grain');
      });
    }

    return matched;
  };

  // Fetch categories and subcategories on mount to map chips
  useEffect(() => {
    let isMounted = true;
    const fetchCategoriesAndSubcategories = async () => {
      try {
        const res = await categoryApi.getCategories({ limit: 100 });
        let data: any[] = [];
        if (res?.data && Array.isArray(res.data)) {
          data = res.data;
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res?.data?.categories && Array.isArray(res.data.categories)) {
          data = res.data.categories;
        } else if (res?.data?.docs && Array.isArray(res.data.docs)) {
          data = res.data.docs;
        }

        const publishedData = data.filter((item: any) => {
          const isPublished = Boolean(item.isActive ?? item.is_active ?? (item.status === 'published' || item.status === 'active'));
          const isDraft = item.status === 'draft';
          return isPublished && !isDraft;
        });

        const parents = publishedData.filter((item: any) => !item.parentId);

        const allSubs: any[] = [];
        await Promise.all(
          parents.map(async (parent: any) => {
            const parentId = String(parent.id || parent._id || parent.categoryId || parent.uuid);
            try {
              const subRes = await categoryApi.getSubcategories(parentId);
              let subData: any[] = [];
              if (subRes?.data && Array.isArray(subRes.data)) {
                subData = subRes.data;
              } else if (subRes?.data?.data && Array.isArray(subRes.data.data)) {
                subData = subRes.data.data;
              } else if (subRes?.data?.categories && Array.isArray(subRes.data.categories)) {
                subData = subRes.data.categories;
              } else if (subRes?.data?.docs && Array.isArray(subRes.data.docs)) {
                subData = subRes.data.docs;
              } else if (Array.isArray(subRes)) {
                subData = subRes;
              }

              subData.forEach((sub: any) => {
                allSubs.push({
                  id: String(sub.id || sub._id || sub.categoryId || sub.uuid),
                  name: sub.name || 'Unknown',
                });
              });
            } catch (err) {
              console.error('Failed to fetch subcategories for mapping:', parentId, err);
            }
          })
        );

        const newMap: Record<string, string> = {};
        CATEGORY_TABS.forEach(chip => {
          const matchedSub = findMatchingSubcategory(chip, allSubs);
          if (matchedSub) {
            newMap[chip] = matchedSub.id;
          }
        });

        if (isMounted) {
          setSubcategoryIdMap(newMap);
        }
      } catch (err) {
        console.error('Error fetching categories in ProductsSection:', err);
      }
    };
    void fetchCategoriesAndSubcategories();
    return () => { isMounted = false; };
  }, []);

  // Fetch products dynamically based on categoryId mapped to the active tab
  useEffect(() => {
    setMounted(true);
    let isMounted = true;
    const fetchPublishedProducts = async () => {
      setLoading(true);
      try {
        const activeSubcategoryId = subcategoryIdMap[activeCategory];
        const params: any = {
          status: 'active',
          limit: 100,
        };
        if (activeSubcategoryId) {
          params.categoryId = activeSubcategoryId;
        }

        const res = await productApi.getAllProducts(params);

        let list: Product[] = [];
        if (res?.data && Array.isArray(res.data)) {
          list = res.data;
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
          list = res.data.data;
        } else if (res?.data?.products && Array.isArray(res.data.products)) {
          list = res.data.products;
        }

        if (isMounted) {
          setProducts(list);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch home page products:', err);
        if (isMounted) setLoading(false);
      }
    };
    void fetchPublishedProducts();
    return () => {
      isMounted = false;
    };
  }, [activeCategory, subcategoryIdMap]);



  const filterByChip = (product: Product, chip: string) => {
    const chipNorm = chip.toLowerCase().trim();
    
    // Check product's category name if it exists
    const prodCat = typeof product.category === 'object' 
      ? product.category?.name 
      : product.category;
    if (prodCat && String(prodCat).toLowerCase().includes(chipNorm)) {
      return true;
    }
    
    // Fallback: check if the product name or description contains the chip word
    const nameNorm = product.name.toLowerCase();
    const descNorm = (product.description || '').toLowerCase();
    
    if (nameNorm.includes(chipNorm) || descNorm.includes(chipNorm)) {
      return true;
    }
    
    // Additional direct alias matching to be extremely robust
    if (chipNorm === 'smartphones') {
      return nameNorm.includes('phone') || nameNorm.includes('iphone') || nameNorm.includes('samsung') || nameNorm.includes('android');
    }
    if (chipNorm === 'sneakers') {
      return nameNorm.includes('shoe') || nameNorm.includes('sneaker') || nameNorm.includes('boot') || nameNorm.includes('canvas') || nameNorm.includes('footwear');
    }
    if (chipNorm === 'headphones') {
      return nameNorm.includes('headphone') || nameNorm.includes('earbud') || nameNorm.includes('headset') || nameNorm.includes('audio') || nameNorm.includes('earphone');
    }
    if (chipNorm === 'skincare') {
      return nameNorm.includes('cream') || nameNorm.includes('lotion') || nameNorm.includes('skin') || nameNorm.includes('face') || nameNorm.includes('serum') || nameNorm.includes('skincare') || nameNorm.includes('oil');
    }
    if (chipNorm === 'laptops') {
      return nameNorm.includes('laptop') || nameNorm.includes('computer') || nameNorm.includes('macbook') || nameNorm.includes('notebook');
    }
    if (chipNorm === 't-shirts') {
      return nameNorm.includes('t-shirt') || nameNorm.includes('tshirt') || nameNorm.includes('shirt') || nameNorm.includes('polo') || nameNorm.includes('top');
    }
    if (chipNorm === 'fragrances') {
      return nameNorm.includes('perfume') || nameNorm.includes('fragrance') || nameNorm.includes('cologne') || nameNorm.includes('scent') || nameNorm.includes('spray');
    }
    if (chipNorm === 'rice') {
      return nameNorm.includes('rice') || nameNorm.includes('grain');
    }

    return false;
  };

  // Scroll handler for mobile
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 150;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(handleScroll, 100);
    }
  };

  const calculateAverageRating = (ratings: Rating[] | number | undefined) => {
    if (!ratings) return 4.2;
    if (Array.isArray(ratings)) {
      if (ratings.length === 0) return 4.2;
      const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
      return sum / ratings.length;
    }
    return ratings;
  };

  // Helper function to shuffle array and get random items
  const getRandomItems = <T,>(array: T[], count: number) => {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Filter products by active category
  const filteredProducts = useMemo(() => {
    const activeSubcategoryId = subcategoryIdMap[activeCategory];
    const filtered = products.filter((product) => {
      const matchesCategory = activeSubcategoryId ? true : filterByChip(product, activeCategory);
      const matchesLocation = selectedLocation === 'All' || 
                             product.location?.toLowerCase() === selectedLocation.toLowerCase();
      return matchesCategory && matchesLocation;
    });
    // Return at most 10 random products from the category, but avoid shuffling during SSR to prevent hydration errors
    if (!mounted) return filtered.slice(0, 10);
    return getRandomItems(filtered, 10);
  }, [products, activeCategory, subcategoryIdMap, selectedLocation, mounted]);

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header + Category Nav */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-px w-6 bg-gradient-to-r from-[#c800ff] to-transparent rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[3.5px] text-[#c800ff]/80">Shop</span>
              <span className="h-px w-6 bg-gradient-to-l from-[#c800ff] to-transparent rounded-full" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Popular Products</h2>
            <p className="mt-1 text-sm text-gray-500">Discover top picks across every category</p>
          </div>

          {/* Category Pills Nav */}
          <div className="flex items-center gap-2">
            {/* Left arrow — mobile only */}
            <button
              className={`flex-shrink-0 p-1.5 rounded-full transition-colors sm:hidden ${canScrollLeft ? 'text-[#c800ff]' : 'text-gray-300'}`}
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>

            <div
              className="flex gap-2 overflow-x-auto scrollbar-none"
              ref={scrollContainerRef}
              onScroll={handleScroll}
            >
              {CATEGORY_TABS.length > 0 && CATEGORY_TABS.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200 border ${
                    activeCategory === category
                      ? 'bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white border-transparent shadow-md shadow-purple-500/30'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#c800ff] hover:text-[#c800ff]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Right arrow — mobile only */}
            <button
              className={`flex-shrink-0 p-1.5 rounded-full transition-colors sm:hidden ${canScrollRight ? 'text-[#c800ff]' : 'text-gray-300'}`}
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Products Grid or Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="w-full bg-white rounded-2xl h-[320px] border border-gray-100 shadow-sm animate-pulse flex flex-col p-4 gap-4">
                <div className="w-full h-40 bg-gray-100 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 animate-[fadeIn_0.5s_ease-out]">
            {filteredProducts.map((product) => {
              const coverImage = product.images && product.images.length > 0 
                ? product.images.find(img => img.isPrimary)?.url || product.images[0].url 
                : '/placeholder.png';
              const prodCat = typeof product.category === 'object' ? product.category?.name : (product.category || 'Fashion');
              const storeName = product.store?.name || product.storeId || 'Faflories Store';

              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  image={coverImage}
                  category={prodCat}
                  title={product.name}
                  price={product.price}
                  originalPrice={product.compareAtPrice || product.mrp}
                  rating={calculateAverageRating(product.rating)}
                  author={storeName}
                  location={product.location || 'Lagos'}
                  href={`/products/${product.id}`}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState category={activeCategory || 'Selected'} />
        )}
      </div>

      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
