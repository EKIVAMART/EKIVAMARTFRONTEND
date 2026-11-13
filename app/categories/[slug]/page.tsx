'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/home/ProductCard';
import { departmentSlug } from '@/lib/data/departments';
import CategoriesGrid from '@/components/CategoriesGrid';
import ProductFilters from '@/components/ProductFilters';
import { Modal } from '@/components/ui/Modal';
import { categoryApi, productApi } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchWishlist } from '@/lib/features/wishlist/wishlistSlice';
import { ChevronLeft, ChevronRight, Package, SlidersHorizontal } from '@/components/ui/platform-icons';

interface Rating {
  id: string;
  rating: number;
  review: string;
  user: {
    name: string;
    image: string;
  };
  productId: string;
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
  storeName?: string;   // ← added: fixes "Property 'storeName' does not exist on type 'Product'"
  location?: string | { town?: string; state?: string; lga?: string };
  rating?: Rating[] | number;
}

export default function CategoryPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  const slug = String(params?.slug || '').toLowerCase();
  const subcategoryQuery = searchParams.get('subcategory');

  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | null>(() => {
    if (slug === 'all' || slug === 'shop') return 'ALL_PRODUCTS';
    return null;
  });

  // In-memory & Enhanced Search filters
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Pagination state synced with URL search query param
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const [page, setPage] = useState<number>(currentPage);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [serverTotalPages, setServerTotalPages] = useState<number>(1);

  // Keep internal page in sync with query param
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Scroll handlers for horizontal chips subcategory list
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

  useEffect(() => {
    const row = scrollContainerRef.current;
    if (!row) return;
    const observer = new ResizeObserver(handleScroll);
    observer.observe(row);
    return () => observer.disconnect();
  }, [subcategories]);

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

  // 1. Fetch categories on mount
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await categoryApi.getCategories({ limit: 100 });
        let data: any[] = [];
        if (res?.data && Array.isArray(res.data)) {
          data = res.data;
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res?.data?.categories && Array.isArray(res.data.categories)) {
          data = res.data.categories;
        }

        // Filter published categories
        const published = data.filter((item: any) =>
          Boolean(item.isActive ?? item.is_active ?? (item.status === 'published'))
        );

        if (isMounted) {
          setCategories(published);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Identify the active main category based on slug
  useEffect(() => {
    if (slug === 'all' || slug === 'shop') {
      setActiveCategory(null);
      setActiveSubcategoryId('ALL_PRODUCTS');
      setSubcategories([]);
      return;
    }

    if (categories.length === 0) return;

    const requestedSlug = departmentSlug(slug);
    const matched = categories.find(cat => !cat.parentId && [cat.slug, cat.name].some(
      value => typeof value === 'string' && departmentSlug(value) === requestedSlug
    ));
    setActiveCategory(matched ?? null);
    if (!matched) {
      setSubcategories([]);
      setActiveSubcategoryId(null);
    }
  }, [categories, slug]);

  // 3. Once active category is set, fetch subcategories
  useEffect(() => {
    if (!activeCategory) return;

    let isMounted = true;
    const loadSubcategories = async () => {
      try {
        const activeId = activeCategory.id || activeCategory._id;
        const res = await categoryApi.getSubcategories(activeId);
        let subCats: any[] = [];
        if (res?.data && Array.isArray(res.data)) {
          subCats = res.data;
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
          subCats = res.data.data;
        } else if (Array.isArray(res)) {
          subCats = res;
        }

        // Filter only active subcategories
        const activeSubCats = subCats.filter((item: any) =>
          Boolean(item.isActive ?? item.is_active ?? (item.status === 'published'))
        );

        if (isMounted) {
          setSubcategories(activeSubCats);
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err);
      }
    };
    void loadSubcategories();
    return () => {
      isMounted = false;
    };
  }, [activeCategory]);

  // 4. Determine which subcategory or parent category is selected from query parameters
  useEffect(() => {
    if (slug === 'all' || slug === 'shop') {
      setActiveCategory(null);
      setActiveSubcategoryId('ALL_PRODUCTS');
      return;
    }

    if (!activeCategory) {
      const searchQuery = searchParams.get('search');
      if (searchQuery) {
        setActiveSubcategoryId('ALL_PRODUCTS');
      }
      return;
    }

    const parentId = activeCategory.id || activeCategory._id;

    if (!subcategoryQuery) {
      setActiveSubcategoryId(parentId); // Query using parent category ID for "All"
      return;
    }

    // Find matching subcategory
    const getSlug = (name: string) =>
      name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const matchedSub = subcategories.find((sub: any) =>
      getSlug(sub.name) === subcategoryQuery || sub.name.toLowerCase() === subcategoryQuery.toLowerCase()
    );

    if (matchedSub) {
      setActiveSubcategoryId(matchedSub.id || matchedSub._id);
    } else {
      setActiveSubcategoryId(parentId);
    }
  }, [subcategoryQuery, subcategories, activeCategory, slug, searchParams]);

  // Reset page in URL when filters change
  const prevFilterRef = useRef({ activeSubcategoryId, sortBy, sortOrder, inStockOnly, subcategoryQuery });
  useEffect(() => {
    const prev = prevFilterRef.current;
    if (
      prev.activeSubcategoryId !== activeSubcategoryId ||
      prev.sortBy !== sortBy ||
      prev.sortOrder !== sortOrder ||
      prev.inStockOnly !== inStockOnly ||
      prev.subcategoryQuery !== subcategoryQuery
    ) {
      prevFilterRef.current = { activeSubcategoryId, sortBy, sortOrder, inStockOnly, subcategoryQuery };
      if (searchParams.get('page') && searchParams.get('page') !== '1') {
        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.delete('page');
        const queryStr = nextParams.toString();
        router.push(`/categories/${slug}${queryStr ? `?${queryStr}` : ''}`);
      }
    }
  }, [activeSubcategoryId, sortBy, sortOrder, inStockOnly, subcategoryQuery, searchParams, slug, router]);

  // 5. Fetch products whenever activeSubcategoryId changes, search query changes, or page changes
  useEffect(() => {
    if (!activeSubcategoryId) return;

    let isMounted = true;
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const qParam = searchParams.get('q') || searchParams.get('search') || undefined;
        const locationQuery = searchParams.get('location') || undefined;

        let res: any;
        if (qParam) {
          res = await productApi.search({
            searchQuery: qParam,
            categoryId: activeSubcategoryId !== 'ALL_PRODUCTS' ? activeSubcategoryId : undefined,
            minPrice: minPrice > 0 ? minPrice : undefined,
            maxPrice: maxPrice < 100000 ? maxPrice : undefined,
            inStock: inStockOnly ? true : undefined,
            sortBy: sortBy as any,
            sortOrder: sortOrder as any,
            page: currentPage,
            limit: 20,
          });
        } else {
          const fetchParams: any = {
            status: 'active',
            page: currentPage,
            limit: 20,
          };
          if (activeSubcategoryId !== 'ALL_PRODUCTS') {
            fetchParams.categoryId = activeSubcategoryId;
          }
          if (locationQuery && locationQuery !== 'All' && locationQuery !== 'Location') {
            fetchParams.state = locationQuery;
          }
          res = await productApi.getAllProducts(fetchParams);
        }

        let productList: Product[] = [];
        let total = 0;
        let totalP = 1;

        if (res?.data) {
          if (Array.isArray(res.data)) {
            productList = res.data;
            total = res.total ?? res.data.length;
            totalP = res.totalPages ?? Math.ceil(total / 20) ?? 1;
          } else if (Array.isArray(res.data.data)) {
            productList = res.data.data;
            total = res.data.total ?? res.total ?? res.data.data.length;
            totalP = res.data.totalPages ?? res.totalPages ?? Math.ceil(total / 20) ?? 1;
          } else if (Array.isArray(res.data.products)) {
            productList = res.data.products;
            total = res.data.total ?? res.total ?? res.data.products.length;
            totalP = res.data.totalPages ?? res.totalPages ?? Math.ceil(total / 20) ?? 1;
          }
        }

        // Each call should display only 20 products for the specified page
        if (productList.length > 20) {
          const startIndex = (currentPage - 1) * 20;
          if (startIndex < productList.length) {
            productList = productList.slice(startIndex, startIndex + 20);
          } else {
            productList = productList.slice(0, 20);
          }
        }

        if (isMounted) {
          setProducts(productList);
          setTotalProducts(total);
          setServerTotalPages(totalP);

          // Reset price filters range based on fetched products
          if (productList.length > 0) {
            const prices = productList.map((p) => {
              if (typeof p.price === 'object' && p.price !== null) {
                return (p.price as any).amount ?? 0;
              }
              return Number(p.price) || 0;
            });
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            if (minPrice === 0 && maxPrice === 100000) {
              setMinPrice(Number.isNaN(min) ? 0 : min);
              setMaxPrice(Number.isNaN(max) ? 100000 : max);
            }
          }
        }
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        if (isMounted) setProductsLoading(false);
      }
    };
    void loadProducts();
    return () => {
      isMounted = false;
    };
  }, [activeSubcategoryId, currentPage, searchParams, sortBy, sortOrder, inStockOnly]);

  const calculateAverageRating = (ratings: Rating[] | number | undefined) => {
    if (!ratings) return 4.2;
    if (Array.isArray(ratings)) {
      if (ratings.length === 0) return 4.2;
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      return Number((sum / ratings.length).toFixed(1));
    }
    return ratings;
  };

  const getProductPrice = (p: Product) => {
    if (!p) return 0;
    if (typeof p.price === 'object' && p.price !== null) {
      return (p.price as any).amount ?? 0;
    }
    return Number(p.price) || 0;
  };

  // Compute global dynamic slider limits based on fetched products
  const globalMin = useMemo(() => {
    if (products.length === 0) return 0;
    const prices = products.map(getProductPrice);
    const min = Math.min(...prices);
    return Number.isNaN(min) ? 0 : min;
  }, [products]);

  const globalMax = useMemo(() => {
    if (products.length === 0) return 100000;
    const prices = products.map(getProductPrice);
    const max = Math.max(...prices);
    return Number.isNaN(max) ? 100000 : max;
  }, [products]);

  // Apply price, rating, inStockOnly, location, and sorting filters
  const filteredProducts = useMemo(() => {
    const locationQuery = searchParams.get('location') || 'All';
    let result = products.filter((p) => {
      const price = getProductPrice(p);
      if (price < minPrice || price > maxPrice) return false;

      if (inStockOnly) {
        const stockVal = (p as any).stock ?? ((p as any).inStock ? 1 : 0);
        if (stockVal <= 0) return false;
      }

      if (selectedRating > 0) {
        const ratingVal = calculateAverageRating(p.rating);
        if (ratingVal < selectedRating) return false;
      }

      // Location matching
      const productLoc = typeof p.location === 'object' && p.location
        ? p.location.state || p.location.town || 'Lagos'
        : (p.location || 'Lagos');

      const locLower = productLoc.toLowerCase();
      const queryLower = locationQuery.toLowerCase();
      const matchesLocation = locationQuery === 'All' || locationQuery === 'Location' ||
        locLower === queryLower ||
        locLower.includes(queryLower) ||
        queryLower.includes(locLower);
      if (!matchesLocation) return false;

      return true;
    });

    // Sorting logic (relevance, price, name, stock) - created_at NOT added to dropdown!
    if (sortBy === 'price') {
      result.sort((a, b) => {
        const pA = getProductPrice(a);
        const pB = getProductPrice(b);
        return sortOrder === 'asc' ? pA - pB : pB - pA;
      });
    } else if (sortBy === 'name') {
      result.sort((a, b) => {
        const nA = (a.name || '').toLowerCase();
        const nB = (b.name || '').toLowerCase();
        return sortOrder === 'asc' ? nA.localeCompare(nB) : nB.localeCompare(nA);
      });
    } else if (sortBy === 'stock') {
      result.sort((a, b) => {
        const sA = (a as any).stock ?? 0;
        const sB = (b as any).stock ?? 0;
        return sortOrder === 'asc' ? sA - sB : sB - sA;
      });
    }

    return result;
  }, [products, minPrice, maxPrice, selectedRating, inStockOnly, sortBy, sortOrder, searchParams]);

  // Paginated items
  const totalCount = totalProducts || filteredProducts.length;
  const totalPages = serverTotalPages || Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedProducts = filteredProducts;

  // Change chip category filter
  const selectSubcategory = (subSlug: string | null) => {
    const nextParams = new URLSearchParams();
    if (subSlug) {
      nextParams.set('subcategory', subSlug);
    }
    const search = searchParams.get('search') || searchParams.get('q');
    if (search) nextParams.set('search', search);
    const loc = searchParams.get('location');
    if (loc) nextParams.set('location', loc);
    const queryStr = nextParams.toString();
    router.push(`/categories/${slug}${queryStr ? `?${queryStr}` : ''}`);
  };

  // Change page via URL query parameter (triggers new API call)
  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('page', String(newPage));
    router.push(`/categories/${slug}?${nextParams.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading category page...</p>
        </div>
      </div>
    );
  }

  const searchQuery = searchParams.get('search');
  const locationQuery = searchParams.get('location');
  const categoryName = (() => {
    if (searchQuery && locationQuery && locationQuery !== 'All' && locationQuery !== 'Location') {
      return `Search Results for "${searchQuery}" in ${locationQuery}`;
    }
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    if (locationQuery && locationQuery !== 'All' && locationQuery !== 'Location') {
      return `Search Results for products in "${locationQuery}"`;
    }
    return activeCategory?.name || (slug === 'shop' || slug === 'all' ? 'All Products' : slug.charAt(0).toUpperCase() + slug.slice(1));
  })();

  const filterControls = (<ProductFilters
                rating={selectedRating}
                minPrice={minPrice}
                maxPrice={maxPrice}
                globalMin={globalMin}
                globalMax={globalMax}
                sortBy={sortBy}
                sortOrder={sortOrder}
                inStockOnly={inStockOnly}
                onPriceChange={(min, max) => {
                  setMinPrice(min);
                  setMaxPrice(max);
                  setPage(1);
                }}
                onRatingChange={(rating) => {
                  setSelectedRating(rating);
                  setPage(1);
                }}
                onSortChange={(sBy, sOrder) => {
                  setSortBy(sBy);
                  setSortOrder(sOrder);
                  setPage(1);
                }}
                onInStockOnlyChange={(val) => {
                  setInStockOnly(val);
                  setPage(1);
                }}
              />);

  // Normalization for matching slugs
  const getSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  return (
    <main className="py-8 sm:py-6 bg-gray-50 min-h-screen">
      <div className="mx-auto w-[90%] max-w-7xl">

        <header className="mb-4 border-b border-stone-200 pb-5">
          <nav aria-label="Breadcrumb" className="mb-3 flex gap-2 text-sm text-stone-600">
            <Link href="/" className="hover:underline">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{categoryName}</span>
          </nav>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">{categoryName}</h1>
          {activeCategory?.description && (
            <p className="mt-3 text-sm text-gray-600 max-w-3xl leading-relaxed">
              {activeCategory.description}
            </p>
          )}
        </header>

        {/* Categories Chips Carousel (Subcategories Row) */}
        {subcategories.length > 0 && (
          <div className="flex items-center gap-2 mb-6 border-b border-stone-200">
            <button
              className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${canScrollLeft ? 'text-[#228b22] hover:bg-stone-50' : 'text-gray-300'}`}
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>

            <div
              className="flex gap-2.5 overflow-x-auto scrollbar-none scroll-smooth flex-1 py-1"
              ref={scrollContainerRef}
              onScroll={handleScroll}
              style={{ scrollbarWidth: 'none' }}
            >
              {/* "All" chip */}
              <button
                aria-pressed={!subcategoryQuery}
                onClick={() => selectSubcategory(null)}
                className={`flex-shrink-0 px-2 py-2 text-sm font-medium border-b-2 ${!subcategoryQuery
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                  }`}
              >
                All {categoryName}
              </button>

              {/* Subcategories list */}
              {subcategories.map((sub: any) => {
                const subSlug = getSlug(sub.name);
                const isSelected = subcategoryQuery === subSlug || subcategoryQuery?.toLowerCase() === sub.name.toLowerCase();
                return (
                  <button
                    key={sub.id || sub._id}
                    aria-pressed={isSelected}
                    onClick={() => selectSubcategory(subSlug)}
                    className={`flex-shrink-0 px-2 py-2 text-sm font-medium border-b-2 ${isSelected
                        ? 'border-stone-900 text-stone-900'
                        : 'border-transparent text-stone-600 hover:text-stone-900'
                      }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>

            <button
              className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${canScrollRight ? 'text-[#228b22] hover:bg-stone-50' : 'text-gray-300'}`}
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        <button type="button" onClick={() => setFiltersOpen(true)} className="mb-5 flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 text-sm text-stone-800 lg:hidden"><SlidersHorizontal size={18} aria-hidden="true" />Filter and sort</button>
        <Modal isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filter and sort" size="md" footer={<button type="button" onClick={() => setFiltersOpen(false)} className="min-h-11 w-full rounded-md bg-[#183d27] px-4 text-sm font-semibold text-white">Show results</button>}>
          {filterControls}
        </Modal>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Filters */}
          <aside className="hidden lg:flex lg:flex-col gap-6 lg:col-span-1">
            {/* Categories sidebar navigation list */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <CategoriesGrid />
            </div>

            {/* Price, Rating, Sort & In-Stock filters */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              {filterControls}
            </div>
          </aside>

          {/* Products List Area */}
          <section className="lg:col-span-3">

            {/* Results status header with UX pagination text */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-sm font-semibold text-gray-600">
                We found{' '}
                <span className="text-[#228b22] text-base font-extrabold px-1">
                  {productsLoading ? '...' : totalCount}
                </span>{' '}
                items matching your selection
              </div>
              {totalCount > 0 && (
                <div className="text-xs font-bold text-gray-500 bg-stone-50 text-stone-700 px-3 py-1.5 rounded-lg border border-stone-100">
                  Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} of {totalCount} results (Page {currentPage} of {totalPages})
                </div>
              )}
            </div>

            {/* Products Grid or Empty/Loading States */}
            {productsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="w-full bg-white rounded-2xl h-[360px] border border-gray-100 shadow-sm animate-pulse flex flex-col p-4 gap-4">
                    <div className="w-full h-48 bg-gray-100 rounded-xl" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-auto" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-[fadeIn_0.4s_ease-out]">
                  {paginatedProducts.map((p: Product) => {
                    const ratingVal = calculateAverageRating(p.rating);
                    const storeName = p.storeName || p.store?.name || p.storeId || 'EkivaMart Store';
                    const coverImage = p.images && p.images.length > 0
                      ? p.images.find(img => img.isPrimary)?.url || p.images[0].url
                      : '/placeholder.png';

                    const priceVal = typeof p.price === 'object' && p.price !== null ? (p.price as any).amount : (p.price ?? 0);
                    const compareAt = p.compareAtPrice ?? p.mrp;
                    const discountPct = p.discount ?? (compareAt && compareAt > priceVal ? Math.round(((compareAt - priceVal) / compareAt) * 100) : undefined);

                    const locObj = p.location;
                    const locationStr =
                      typeof locObj === 'object' && locObj !== null
                        ? [locObj.town, locObj.lga, locObj.state].filter(Boolean).join(', ') || 'Nigeria'
                        : (typeof locObj === 'string' ? locObj : 'Nigeria');

                    const mapped = {
                      id: p.id,
                      name: p.name,
                      image: coverImage,
                      price: priceVal,
                      compareAtPrice: compareAt,
                      discountPercent: discountPct,
                      rating: ratingVal,
                      reviewCount: Array.isArray(p.rating) ? p.rating.length : 0,
                      location: locationStr,
                      vendor: storeName,
                      storeName: storeName,
                      href: `/products/${p.id}`,
                    };

                    return (
                      <div key={p.id} className="w-full flex">
                        <ProductCard product={mapped} />
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500">
                    Page {currentPage} of {totalPages} ({totalCount} total products)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                      className="px-3.5 py-1.5 rounded-xl border text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-gray-50 text-gray-700 cursor-pointer"
                    >
                      Previous
                    </button>

                    {(() => {
                      const pages: (number | string)[] = [];
                      if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else {
                        if (currentPage <= 4) {
                          for (let i = 1; i <= 5; i++) pages.push(i);
                          pages.push('...');
                          pages.push(totalPages);
                        } else if (currentPage >= totalPages - 3) {
                          pages.push(1);
                          pages.push('...');
                          for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                        } else {
                          pages.push(1);
                          pages.push('...');
                          pages.push(currentPage - 1);
                          pages.push(currentPage);
                          pages.push(currentPage + 1);
                          pages.push('...');
                          pages.push(totalPages);
                        }
                      }

                      return pages.map((p, idx) => {
                        if (typeof p === 'string') {
                          return (
                            <span key={`el-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold select-none text-xs">
                              …
                            </span>
                          );
                        }
                        return (
                          <button
                            key={p}
                            onClick={() => handlePageChange(Number(p))}
                            className={`w-8 h-8 text-xs font-extrabold rounded-xl transition border cursor-pointer ${
                              currentPage === p
                                ? 'bg-gradient-to-r from-[#228b22] to-[#1c711c] text-white border-transparent shadow-xs'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      });
                    })()}

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-3.5 py-1.5 rounded-xl border text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-gray-50 text-gray-700 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center max-w-lg mx-auto mt-8">
                <div className="inline-flex text-[#657065] mb-4">
                  <Package size={48} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No Products Found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  We couldn&apos;t find any published products matching this selection in our category catalog.
                </p>

              </div>
            )}
          </section>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
