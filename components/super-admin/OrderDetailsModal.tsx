'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, CreditCard, Package, Calendar, User, Printer, Tag, Store } from 'lucide-react';
import { orderApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onStatusUpdated?: () => void;
}

export default function OrderDetailsModal({ isOpen, onClose, order, onStatusUpdated }: OrderDetailsModalProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    if (order?.status) {
      setSelectedStatus(order.status);
    }
  }, [order]);

  if (!order) return null;

  const orderId = order.id || order._id || 'N/A';
  const orderNumber = order.orderNumber || order.id || 'N/A';
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : (order.date || 'Recent');
  const customerName = order.shippingAddress?.fullName || order.user?.name || 'Customer';
  const customerPhone = order.shippingAddress?.phoneNumber || order.user?.phone || 'N/A';
  const customerEmail = order.user?.email || (order.user?.name ? `${order.user.name.toLowerCase().replace(/\s+/g, '.')}@example.com` : 'N/A');

  const addressLine = order.shippingAddress?.formatted || 
    [order.shippingAddress?.addressLine1, order.shippingAddress?.addressLine2, order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.country]
      .filter(Boolean)
      .join(', ') || order.address || 'Address not specified';

  // Normalize order items
  const items: any[] = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map((it: any) => ({
        id: it.id || it.productId || Math.random().toString(),
        name: it.productName || it.name || 'Product',
        sku: it.productSku || it.sku || 'N/A',
        image: it.productImage || it.image || '/placeholder.png',
        price: typeof it.unitPrice === 'object' && it.unitPrice !== null ? it.unitPrice.amount : (Number(it.price) || 0),
        qty: Number(it.quantity || it.qty || 1),
        subtotal: typeof it.subtotal === 'object' && it.subtotal !== null ? it.subtotal.amount : (Number(it.subtotal) || (Number(it.price || 0) * Number(it.quantity || 1))),
        vendor: it.vendor || it.storeName || 'Faflora Official Store',
        category: it.category || 'General',
      }))
    : [
        {
          id: '1',
          name: typeof order.items === 'string' ? order.items : 'Order Package Item',
          sku: 'SKU-GENERAL',
          image: '/placeholder.png',
          price: typeof order.totalAmount === 'object' ? order.totalAmount.amount : (Number(order.total) || 0),
          qty: 1,
          subtotal: typeof order.totalAmount === 'object' ? order.totalAmount.amount : (Number(order.total) || 0),
          vendor: 'Faflora Store',
          category: 'Products',
        },
      ];

  const subtotal = typeof order.subtotal === 'object' && order.subtotal !== null
    ? order.subtotal.amount
    : (Number(order.subtotal) || items.reduce((acc, it) => acc + it.subtotal, 0));

  const shippingFee = typeof order.shippingCost === 'object' && order.shippingCost !== null
    ? order.shippingCost.amount
    : (Number(order.shippingCost) || 0);

  const tax = typeof order.taxAmount === 'object' && order.taxAmount !== null
    ? order.taxAmount.amount
    : (typeof order.tax === 'number' ? order.tax : parseFloat((subtotal * 0.10).toFixed(2)));

  const grandTotal = typeof order.totalAmount === 'object' && order.totalAmount !== null
    ? order.totalAmount.amount
    : (Number(order.total) || (subtotal + shippingFee + tax));

  const paymentMethod = order.paymentMethod || 'Online Gateway';
  const paymentStatus = order.paymentStatus || 'Pending';

  const modalStatusStyles: Record<string, string> = {
    'Ongoing': 'bg-blue-400/20 text-blue-100 border-blue-400/30',
    'CONFIRMED': 'bg-blue-400/20 text-blue-100 border-blue-400/30',
    'PROCESSING': 'bg-amber-400/20 text-amber-100 border-amber-400/30',
    'SHIPPED': 'bg-purple-400/20 text-purple-100 border-purple-400/30',
    'Delivered': 'bg-green-400/20 text-green-100 border-green-400/30',
    'DELIVERED': 'bg-green-400/20 text-green-100 border-green-400/30',
    'Cancelled': 'bg-red-400/20 text-red-100 border-red-400/30',
    'CANCELLED': 'bg-red-400/20 text-red-100 border-red-400/30',
    'Returned': 'bg-orange-400/20 text-orange-100 border-orange-400/30',
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    setIsUpdatingStatus(true);
    const toastId = toast.loading('Updating order status...');
    try {
      const res = await orderApi.updateOrderStatus(orderId, selectedStatus);
      if (res?.success) {
        toast.success('Order status updated successfully', { id: toastId });
        if (onStatusUpdated) onStatusUpdated();
      } else {
        toast.error(res?.message || 'Failed to update order status', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error updating order status', { id: toastId });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#F8F9FA] w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 md:max-h-[90vh] max-h-full flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#9d4ae3] to-[#8236be] px-8 py-6 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">Order {orderNumber}</h2>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-sm shadow-sm ${modalStatusStyles[order.status] || 'bg-white/20 text-white border-white/30'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-sm text-fuchsia-100 font-medium">
                  <Calendar size={14} /> Placed on {orderDate}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold transition"
                >
                  <Printer size={16} /> Print Invoice
                </button>
                <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-2xl transition-colors" aria-label="Close modal">
                  <X size={26} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Items & Financials */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Items List */}
                  <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Package size={20} className="text-[#9d4ae3]" /> Order Items ({items.length})
                    </h3>
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div key={item.id || index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition">
                          <div className="flex items-start gap-4 w-full sm:w-auto flex-1">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                              <p className="text-xs text-gray-500 font-medium mt-0.5">SKU: {item.sku}</p>

                              <div className="flex items-center flex-wrap gap-2 mt-2.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                                  <Tag size={10} /> {item.category}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-fuchsia-50 text-[#9d4ae3] rounded text-[10px] font-bold border border-fuchsia-100">
                                  <Store size={10} /> Sold by: {item.vendor}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex sm:block justify-between items-center w-full sm:w-auto sm:text-right mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                            <p className="font-black text-slate-800 text-sm">₦ {item.price.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 font-bold sm:mt-0.5">Qty: {item.qty}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <CreditCard size={20} className="text-[#9d4ae3]" /> Payment Summary
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-gray-600 font-medium">
                        <span>Subtotal</span>
                        <span className="text-slate-800 font-bold">₦ {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 font-medium">
                        <span>Shipping Fee</span>
                        <span className="text-slate-800 font-bold">₦ {shippingFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 font-medium">
                        <span>Taxes (10% platform rate)</span>
                        <span className="text-slate-800 font-bold">₦ {tax.toLocaleString()}</span>
                      </div>
                      <div className="pt-3 mt-3 border-t flex justify-between items-center">
                        <span className="text-base font-bold text-slate-800">Grand Total</span>
                        <span className="text-xl font-black text-[#9d4ae3]">₦ {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Customer & Addresses */}
                <div className="space-y-8">
                  {/* Customer Info */}
                  <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <User size={20} className="text-[#9d4ae3]" /> Customer Info
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                        {customerName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{customerName}</p>
                        <p className="text-xs text-gray-500 font-medium">Verified Customer</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600"><span className="font-bold text-slate-700">Email:</span> {customerEmail}</p>
                      <p className="text-gray-600"><span className="font-bold text-slate-700">Phone:</span> {customerPhone}</p>
                      <p className="text-gray-600"><span className="font-bold text-slate-700">Payment:</span> <span className="capitalize font-semibold text-purple-700">{paymentMethod}</span> ({paymentStatus})</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <MapPin size={20} className="text-[#9d4ae3]" /> Shipping Address
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                      {customerName}<br />
                      {addressLine}<br />
                      Nigeria
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Action */}
            <div className="bg-white px-6 sm:px-8 py-5 border-t flex flex-col sm:flex-row justify-end items-center gap-3 sticky bottom-0 z-10 rounded-b-3xl">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 outline-none text-sm"
              >
                <option value="PENDING_PAYMENT">Status: Pending Payment</option>
                <option value="CONFIRMED">Status: Confirmed</option>
                <option value="PROCESSING">Status: Processing</option>
                <option value="SHIPPED">Status: Shipped</option>
                <option value="DELIVERED">Status: Delivered</option>
                <option value="CANCELLED">Status: Cancelled</option>
              </select>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:from-[#8236be] hover:to-[#692a99] text-white rounded-xl font-bold transition shadow-md shadow-fuchsia-100 text-sm whitespace-nowrap disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Saving...' : 'Save Status'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
