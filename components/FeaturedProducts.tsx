'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { assets } from '@/assets/assets';
import ProductCard from './ProductCard';
import { productApi } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchWishlist } from '@/lib/features/wishlist/wishlistSlice';

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
  location?: string | { town?: string; state?: string; lga?: string };
  rating?: Rating[] | number;
  stock: number;
}

const FeaturedProducts = () => {
  const searchParams = useSearchParams();
  const selectedLocation = searchParams.get('location') || 'All';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products from backend
  useEffect(() => {
    let isMounted = true;
    const fetchPublishedProducts = async () => {
      setLoading(true);
      try {
        const res = await productApi.getAllProducts({ status: 'active', limit: 100 });
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
  }, []);

  // Helper function to shuffle array and get random items
  const getRandomItems = <T,>(array: T[], count: number) => {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Get 10 random products from backend products, filtered by location if selected
  const featuredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (selectedLocation === 'All') return true;
      const productLoc = typeof product.location === 'object' && product.location
        ? product.location.state || product.location.town || 'Lagos'
        : (product.location || 'Lagos');
      return productLoc.toLowerCase() === selectedLocation.toLowerCase();
    });
    // Return at most 10 random products, but avoid shuffling during SSR to prevent hydration errors
    if (!mounted) return filtered.slice(0, 10);
    return getRandomItems(filtered, 10);
  }, [products, selectedLocation, mounted]);

  // Check scroll position and update button states
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Set up scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      // Check initial state
      setTimeout(checkScroll, 100);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [loading]);

  // Calculate average rating
  const calculateAverageRating = (ratings: Rating[] | number | undefined) => {
    if (!ratings) return 4.2;
    if (Array.isArray(ratings)) {
      if (ratings.length === 0) return 4.2;
      const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
      return sum / ratings.length;
    }
    return ratings;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 312; // Width of one product card (w-72 = 288px) + gap (24px)
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll =
        direction === 'left'
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });

      // Update button states after scroll completes
      setTimeout(checkScroll, 400);
    }
  };

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-6 bg-gradient-to-r from-[#9d4ae3] to-transparent rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[3.5px] text-[#9d4ae3]/80">Picks</span>
            <span className="h-px w-6 bg-gradient-to-l from-[#9d4ae3] to-transparent rounded-full" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Featured Products</h2>
          <p className="mt-1 text-sm text-gray-500">Handpicked for you — swipe to explore</p>
        </div>

        {/* Main Container */}
        <div className="flex flex-col lg:flex-row gap-0">
          {/* Products Carousel - Constrained Container with Paddles */}
          <div className="flex-1 overflow-hidden">
            <div className="relative w-full group">
              {/* Left Paddle Button */}
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`absolute left-2 top-1/2 -translate-y-1/2 z-30 hidden sm:flex items-center justify-center rounded-full p-2 transition-all border duration-300 ${
                  canScrollLeft
                    ? 'bg-white shadow-md hover:shadow-lg hover:bg-gray-50 active:scale-95 border-[#9d4ae3]/30 text-[#9d4ae3] cursor-pointer'
                    : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed opacity-50'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft size={24} className="font-bold" />
              </button>

              {/* Scroll Container - Hidden Scrollbar & Overflow Hidden */}
              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto overflow-y-hidden scroll-smooth pb-2 px-2"
                style={{
                  scrollBehavior: 'smooth',
                  scrollSnapType: 'x mandatory',
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  width: '100%',
                }}
              >
                {/* Hide scrollbar for Chrome, Safari and Opera */}
                <style>{`
                  div[class*="overflow-x-auto"]::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>

                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="shrink-0 w-72 h-[320px] bg-white border border-gray-100 rounded-2xl animate-pulse flex flex-col p-4 gap-4"
                    >
                      <div className="w-full h-40 bg-gray-100 rounded-xl" />
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 mt-auto" />
                    </div>
                  ))
                ) : featuredProducts.map((product) => {
                  const coverImage = product.images && product.images.length > 0 
                    ? product.images.find(img => img.isPrimary)?.url || product.images[0].url 
                    : '/placeholder.png';
                  const prodCat = typeof product.category === 'object' ? product.category?.name : (product.category || 'Fashion');
                  const storeName = product.store?.name || product.storeId || 'Faflories Store';

                  return (
                    <div
                      key={product.id}
                      className="shrink-0 w-72"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <ProductCard
                        id={product.id}
                        image={coverImage}
                        category={prodCat}
                        title={product.name}
                        rating={calculateAverageRating(product.rating)}
                        author={storeName}
                        location={product.location || 'Lagos'}
                        price={product.price}
                        originalPrice={product.compareAtPrice || product.mrp}
                        href={`/products/${product.id}`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Right Paddle Button */}
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`absolute right-2 top-1/2 -translate-y-1/2 z-30 hidden sm:flex items-center justify-center rounded-full p-2 transition-all border duration-300 ${
                  canScrollRight
                    ? 'bg-white shadow-md hover:shadow-lg hover:bg-gray-50 active:scale-95 border-[#9d4ae3]/30 text-[#9d4ae3] cursor-pointer'
                    : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed opacity-50'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight size={24} className="font-bold" />
              </button>
            </div>

            {/* Mobile Navigation Info */}
            <p className="text-xs text-gray-500 text-center mt-4 sm:hidden">
              Scroll to see more products
            </p>
          </div>

          {/* Promotional Image - Scrolls Vertically with Page, Fixed Width on Desktop */}
          <div className="hidden lg:flex lg:w-80 lg:h-auto lg:shrink-0 lg:items-start lg:justify-center lg:pl-6 lg:pt-0">
            <div className="w-72 h-96 rounded-lg overflow-hidden shadow-xl sticky top-20">
              <Image
                src={assets.pop_pord_img}
                alt="Promotional Offer"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </div>

          {/* Promotional Image - Responsive on Mobile/Tablet */}
          <div className="lg:hidden w-full h-64 md:h-96 relative rounded-lg overflow-hidden shadow-lg mt-8">
            <Image
              src={assets.pop_pord_img}
              alt="Promotional Offer"
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
