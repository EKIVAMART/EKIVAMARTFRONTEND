'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Star, ChevronRight } from 'lucide-react';
import { assets } from '../assets/assets';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistPage() {
  const [wishlistData, setWishlistData] = useState([
    {
      id: '1',
      name: 'Lenovo Ideapad Slim 3 Intel Core I5-12450H 15.6" (...',
      image: assets.product_img12,
      rating: 5,
      reviews: 5,
      price: 45000,
    },
    {
      id: '2',
      name: 'boAt Wave Fury Smartwatch with 4.64 cm (1.83 inch)...',
      image: assets.product_img5, // Using a smartwatch image from assets
      rating: 5,
      reviews: 5,
      price: 1800,
    },
  ]);

  const removeItem = (id: string) => {
    setWishlistData((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-white pb-10 ">
      {/* 1. BREADCRUMBS */}
      <div className="border-b py-4 bg-gray-50/50">
        <div className="mx-auto w-[95%] flex items-center gap-2 text-sm">
          <Link href="/" className="text-[#981d87] font-medium hover:underline">
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-600">My List</span>
        </div>
      </div>

      <main className="mx-auto w-full md:w-[95%] mt-10 px-4 md:px-10">
        {/* 2. HEADER SECTION */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-1">My List</h1>
          <p className="text-gray-500 font-medium">
            There are{' '}
            <span className="text-[#981d87] font-bold">
              {wishlistData.length}
            </span>{' '}
            products in your Wishlist
          </p>
        </section>

        {/* 3. WISHLIST TABLE/LIST */}
        <div className="w-full">
          {/* Table Header (Hidden on Mobile) */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] bg-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700">
            <div>Product</div>
            <div className="text-center">Price</div>
            <div className="text-right">Remove</div>
          </div>

          <div className=" rounded-2xl overflow-hidden">
            <AnimatePresence>
              {wishlistData.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr] items-center p-4 md:p-6 border-b last:border-b-0 hover:bg-gray-50 transition-colors gap-4 md:gap-0"
                >
                  {/* Product Info */}
                  <div className="col-span-2 md:col-span-1 flex items-center gap-4 md:gap-6">
                    <div className="relative w-24 h-24 md:w-32 md:h-24 border rounded-lg overflow-hidden flex-shrink-0 bg-white p-2">
                      {/* Using a placeholder div for image - replace with <Image /> */}
                      <div className="w-full h-full bg-gray-100 relative">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-bold text-slate-800 line-clamp-2 hover:text-[#981d87] cursor-pointer">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < item.rating
                                ? 'fill-orange-400 text-orange-400'
                                : 'text-gray-300'
                            }
                          />
                        ))}
                        <span className="text-xs text-gray-400 font-medium ml-1">
                          ({item.reviews})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-1 md:col-span-1 mt-0 md:mt-0 text-left md:text-center">
                    <span className="md:hidden text-xs text-gray-400 block mb-1">
                      Price
                    </span>
                    <p className="text-lg font-bold text-slate-800">
                      <span className="text-sm font-semibold">Rs: </span>
                      {item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 md:col-span-1 mt-0 md:mt-0 text-right">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 size={25} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Empty State (Optional but good practice) */}
        {wishlistData.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
            <Link
              href="/"
              className="bg-[#981d87] text-white px-6 py-2 rounded-md font-bold hover:bg-[#7a176c] transition"
            >
              Fill it now
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
