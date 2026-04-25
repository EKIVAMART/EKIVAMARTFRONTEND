import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, CreditCard, Package, Calendar, User, Printer, Tag } from 'lucide-react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  if (!order) return null;

  // Mock extended details for the view
  const orderItems = [
    { name: 'Wireless Bluetooth Headphones', variant: 'Black / One Size', qty: 1, price: 45000, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80' },
    { name: 'Cotton Crewneck T-Shirt', variant: 'Navy Blue / L', qty: 2, price: 15000, category: 'Fashion', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&q=80' }
  ];

  const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shippingFee = 2500;
  const tax = subtotal * 0.05; // 5% tax
  const grandTotal = subtotal + shippingFee + tax;

  const modalStatusStyles: any = {
    'Ongoing': 'bg-blue-400/20 text-blue-100 border-blue-400/30',
    'Delivered': 'bg-green-400/20 text-green-100 border-green-400/30',
    'Cancelled': 'bg-red-400/20 text-red-100 border-red-400/30',
    'Returned': 'bg-orange-400/20 text-orange-100 border-orange-400/30',
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
            <div className="bg-[#981d87] px-8 py-6 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">Order {order.id}</h2>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-sm shadow-sm ${modalStatusStyles[order.status] || 'bg-white/20 text-white border-white/30'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-sm text-fuchsia-100 font-medium">
                  <Calendar size={14} /> Placed on {order.date}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold transition">
                  <Printer size={16} /> Print Invoice
                </button>
                <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-2xl transition-colors">
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
                      <Package size={20} className="text-[#981d87]" /> Order Items
                    </h3>
                    <div className="space-y-4">
                      {orderItems.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition">
                          <div className="flex items-start gap-4 w-full sm:w-auto flex-1">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                              <p className="text-xs text-gray-500 font-medium mt-0.5">{item.variant}</p>
                              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                                <Tag size={10} /> {item.category}
                              </span>
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
                      <CreditCard size={20} className="text-[#981d87]" /> Payment Summary
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
                        <span>Taxes (5%)</span>
                        <span className="text-slate-800 font-bold">₦ {tax.toLocaleString()}</span>
                      </div>
                      <div className="pt-3 mt-3 border-t flex justify-between items-center">
                        <span className="text-base font-bold text-slate-800">Grand Total</span>
                        <span className="text-xl font-black text-[#981d87]">₦ {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Customer & Addresses */}
                <div className="space-y-8">
                  {/* Customer Info */}
                  <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <User size={20} className="text-[#981d87]" /> Customer Info
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
                      <img src={order.user.avatar} alt={order.user.name} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                      <div>
                        <p className="font-bold text-slate-800">{order.user.name}</p>
                        <p className="text-xs text-gray-500 font-medium">Customer since Jan 2024</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600"><span className="font-bold text-slate-700">Email:</span> {order.user.name.toLowerCase().replace(' ', '.')}@example.com</p>
                      <p className="text-gray-600"><span className="font-bold text-slate-700">Phone:</span> +234 800 123 4567</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <MapPin size={20} className="text-[#981d87]" /> Shipping Address
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                      {order.user.name}<br />
                      {order.address}<br />
                      State/Province, Zip Code<br />
                      Nigeria
                    </p>
                  </div>

                  {/* Billing Address */}
                  <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <CreditCard size={20} className="text-[#981d87]" /> Billing Address
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                      <span className="text-xs font-bold text-[#981d87] bg-fuchsia-50 px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">Same as Shipping</span><br />
                      {order.user.name}<br />
                      {order.address}<br />
                      State/Province, Zip Code<br />
                      Nigeria
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Action */}
            <div className="bg-white px-6 sm:px-8 py-5 border-t flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 z-10 rounded-b-3xl">
              <select className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-gray-50 border rounded-xl font-bold text-slate-700 outline-none text-sm">
                <option value="Ongoing">Update Status: Ongoing</option>
                <option value="Delivered">Update Status: Delivered</option>
                <option value="Cancelled">Update Status: Cancelled</option>
                <option value="Returned">Update Status: Returned</option>
              </select>
              <button className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-[#981d87] hover:bg-[#7a176c] text-white rounded-xl font-bold transition shadow-md shadow-fuchsia-100 text-sm whitespace-nowrap">
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
