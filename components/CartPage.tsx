'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trash2,
  Star,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { assets } from '../assets/assets';


export default function CartPage() {
  // Added 'quantity' field to the data
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: ' Ideapad Slim 3 Intel Core I5-12450H 15.6" (...',
      image: assets.product_img12,
      rating: 5,
      reviews: 5,
      price: 45000,
      quantity: 1,
    },
    {
      id: '2',
      name: 'boAt Wave Fury Smartwatch with 4.64 cm (1.83 inch)...',
      image: assets.product_img5,
      rating: 5,
      reviews: 5,
      price: 1800,
      quantity: 2,
    },
  ]);

  // Handle Quantity Change
  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  // Remove Item
  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculate Subtotal
  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 1. BREADCRUMBS */}
      <div className="border-b py-4 bg-gray-50/50">
        <div className="mx-auto w-[95%] flex items-center gap-2 text-sm">
          <Link href="/" className="text-[#c800ff] font-medium hover:underline">
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-600">Your Cart</span>
        </div>
      </div>

      <main className="mx-auto w-[95%] mt-10">
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-1">Your Cart</h1>
          <p className="text-gray-500 font-medium">
            There are{' '}
            <span className="text-[#c800ff] font-bold">{cartItems.length}</span>{' '}
            products in your cart
          </p>
        </section>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* 3. CART ITEMS LIST */}
          <div className="flex-[2]">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[3fr_1.5fr_1.5fr_1.5fr_0.5fr] bg-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700">
              <div>Product</div>
              <div className="text-center">Unit Price</div>
              <div className="text-center">Quantity</div>
              <div className="text-center">Subtotal</div>
              <div className="text-right">Remove</div>
            </div>

            <div className="rounded-2xl overflow-hidden mt-2">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-1 md:grid-cols-[3fr_1.5fr_1.5fr_1.5fr_0.5fr] items-center p-4 md:p-6 border-b hover:bg-gray-50 transition-colors"
                  >
                    {/* Product Info */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 border rounded-lg overflow-hidden bg-white p-2">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star
                            size={12}
                            className="fill-orange-400 text-orange-400"
                          />
                          <span className="text-[10px] text-gray-400">
                            ({item.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="hidden md:block text-center font-bold text-slate-700">
                      Rs: {item.price.toLocaleString()}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex justify-center mt-4 md:mt-0">
                      <div className="flex items-center border rounded-lg px-2 py-1 bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:text-[#c800ff]"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 font-bold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:text-[#c800ff]"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-center mt-4 md:mt-0 font-bold text-[#c800ff]">
                      <span className="md:hidden text-gray-400 text-xs block">
                        Subtotal
                      </span>
                      Rs: {(item.price * item.quantity).toLocaleString()}
                    </div>

                    {/* Remove */}
                    <div className="text-right mt-4 md:mt-0">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={25} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* 4. CART TOTALS SUMMARY */}
          <div className="flex-1">
            <div className="bg-gray-50 border rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">
                    Rs: {totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-[#c800ff] font-bold">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimate Tax</span>
                  <span className="font-bold text-slate-800">Rs: 0</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-[#c800ff]">
                    Rs: {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white font-bold py-4 rounded-xl mt-8 hover:from-[#b500e6] hover:to-[#802699] transition flex items-center justify-center gap-2">
                Proceed To Checkout
                <ShoppingBag size={20} />
              </button>

              <p className="text-[11px] text-gray-400 text-center mt-4">
                Secure SSL Encryption & Fast Delivery
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {cartItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added anything yet.
            </p>
            <Link
              href="/"
              className="bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white px-8 py-3 rounded-lg font-bold hover:from-[#b500e6] hover:to-[#802699] transition"
            >
              Return To Shop
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
