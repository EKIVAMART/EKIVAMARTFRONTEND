'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Star, ChevronRight, ShoppingCart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchWishlist, removeWishlistItem, clearWishlistApi } from '@/lib/features/wishlist/wishlistSlice';
import { addToCart } from '@/lib/features/cart/cartSlice';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const hydratedItems = useAppSelector((state) => state.wishlist.hydratedItems);
  const loading = useAppSelector((state) => state.wishlist.loading);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const router = useRouter();

  const [showClearModal, setShowClearModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  const getAverageRating = (product: any) => {
    const ratings = product.rating || product.ratings;
    if (!ratings) return 4.2;
    if (Array.isArray(ratings)) {
      if (ratings.length === 0) return 4.2;
      const sum = ratings.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
      return sum / ratings.length;
    }
    return Number(ratings) || 4.2;
  };

  const getRatingCount = (product: any) => {
    const ratings = product.rating || product.ratings;
    if (Array.isArray(ratings)) return ratings.length;
    return 10;
  };

  const getProductImage = (product: any) => {
    if (!product || !product.images || product.images.length === 0) {
      return '/placeholder.png';
    }
    const firstImage = product.images[0];
    if (typeof firstImage === 'object' && firstImage !== null) {
      return firstImage.url || firstImage.image || '/placeholder.png';
    }
    return firstImage || '/placeholder.png';
  };

  const removeItem = (id: string) => {
    dispatch(removeWishlistItem(id));
  };

  const handleAddToCart = (id: string, name: string) => {
    dispatch(addToCart({ productId: id }));
    toast.success(`${name} added to cart`);
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlistApi());
    setShowClearModal(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `Saved on ${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    } catch {
      return '';
    }
  };

  // Prevent SSR/client hydration mismatch — auth state is client-only
  if (!mounted) {
    return (
      <div className="min-h-[60vh] bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
          <ShoppingCart size={30} className="text-[#c800ff]" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Your Wishlist</h2>
        <p className="text-gray-500 max-w-sm mb-6">
          Please log in to save products you love and view them later.
        </p>
        <Link
          href="/"
          className="bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white px-6 py-2.5 rounded-xl font-bold hover:from-[#b500e6] hover:to-[#802699] transition shadow-md"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  if (loading && hydratedItems.length === 0) {
    return (
      <div className="min-h-[60vh] bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* 1. BREADCRUMBS */}
      <div className="border-b py-4 bg-gray-50/50">
        <div className="mx-auto w-[95%] flex items-center gap-2 text-sm">
          <Link href="/" className="text-[#c800ff] font-medium hover:underline">
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-600">My List</span>
        </div>
      </div>

      <main className="mx-auto w-full md:w-[95%] mt-10 px-5 md:px-10">
        {/* 2. HEADER SECTION */}
        <section className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">My List</h1>
            <p className="text-gray-500 font-medium">
              There are{' '}
              <span className="text-[#c800ff] font-bold">
                {hydratedItems.length}
              </span>{' '}
              products in your Wishlist
            </p>
          </div>
          {hydratedItems.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition text-sm flex items-center gap-2 border border-red-100 self-start sm:self-center"
            >
              <Trash2 size={16} />
              Clear Wishlist
            </button>
          )}
        </section>

        {/* 3. WISHLIST TABLE/LIST */}
        {hydratedItems.length > 0 ? (
          <div className="w-full">
            {/* Table Header (Hidden on Mobile) */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] bg-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700">
              <div>Product</div>
              <div className="text-center">Price</div>
              <div className="text-center">Action</div>
              <div className="text-right">Remove</div>
            </div>

            <div className="rounded-2xl overflow-hidden">
              <AnimatePresence>
                {hydratedItems.map((item, index) => {
                  const product = item.product;
                  if (!product) return null;
                  const priceVal = typeof product.price === 'object' && product.price !== null ? (product.price as any).amount : (product.price ?? 0);
                  const currencyStr = '₦';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ delay: index * 0.05 }}
                      className="grid grid-cols-3 md:grid-cols-[2fr_1fr_1fr_1fr] items-center p-4 md:p-6 border-b last:border-b-0 hover:bg-gray-50 transition-colors gap-4 md:gap-0"
                    >
                      {/* Product Info */}
                      <div className="col-span-3 md:col-span-1 flex items-center gap-4 md:gap-6">
                        <Link href={`/products/${product.id}`} className="block relative w-24 h-24 md:w-32 md:h-24 border rounded-lg overflow-hidden flex-shrink-0 bg-white p-2 hover:opacity-90 transition-opacity">
                          <div className="w-full h-full bg-gray-100 relative">
                            <Image
                              src={getProductImage(product)}
                              alt={product.name}
                              width={100}
                              height={100}
                              className="object-contain w-full h-full"
                            />
                          </div>
                        </Link>
                        <div>
                          <Link href={`/products/${product.id}`}>
                            <h3 className="text-sm md:text-base font-bold text-slate-800 line-clamp-2 hover:text-[#c800ff] cursor-pointer">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < Math.floor(getAverageRating(product))
                                    ? 'fill-orange-400 text-orange-400'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                            <span className="text-xs text-gray-400 font-medium ml-1">
                              ({getRatingCount(product)})
                            </span>
                          </div>
                          {item.addedAt && (
                            <div className="text-xs text-gray-400 font-semibold mt-1">
                              {formatDate(item.addedAt)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-3 md:col-span-1 mt-0 md:mt-0 text-left md:text-center">
                        <span className="md:hidden text-xs text-gray-400 block mb-1">
                          Price
                        </span>
                        <p className="text-lg font-bold text-slate-800">
                          <span className="text-sm font-semibold">{currencyStr}</span>
                          {priceVal.toLocaleString()}
                        </p>
                      </div>

                      {/* Cart Action */}
                      <div className="col-span-2 md:col-span-1 mt-2 md:mt-0 text-center flex justify-center">
                        <button
                          onClick={() => handleAddToCart(product.id, product.name)}
                          className="bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white px-4 py-2 rounded-xl font-semibold hover:from-[#b500e6] hover:to-[#802699] transition text-sm w-full md:w-auto flex items-center justify-center gap-2 shadow-sm"
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </button>
                      </div>

                      {/* Remove */}
                      <div className="col-span-1 md:col-span-1 mt-0 md:mt-0 flex justify-end">
                        <button
                          onClick={() => removeItem(product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        >
                          <Trash2 size={22} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500 mb-6">Your wishlist is empty — start saving items you love!</p>
            <Link
              href="/"
              className="bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white px-8 py-3 rounded-xl font-bold hover:from-[#b500e6] hover:to-[#802699] transition shadow-lg"
            >
              Explore Products
            </Link>
          </div>
        )}
      </main>

      {/* ── Clear All Confirmation Modal ── */}
      {showClearModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowClearModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">Clear Wishlist?</h3>
            <p className="text-gray-500 text-sm mb-6 text-center">
              Are you sure you want to clear your wishlist? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearWishlist}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
