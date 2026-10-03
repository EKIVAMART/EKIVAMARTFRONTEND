'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Search, RefreshCw, Eye, Clock, CheckCircle2, AlertCircle,
  Truck, X, ChevronLeft, ChevronRight, MapPin, User, Package, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { vendorOrdersApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

const fmt = (n?: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n ?? 0);

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export default function VendorOrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);

  // Modal state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await vendorOrdersApi.getOrders({
        page,
        limit: 10,
        status: statusFilter,
      });

      if (res?.data) {
        const d = res.data;
        const list = Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : [];
        setOrders(list);
        setTotalPages(d.totalPages || 1);
        setTotalOrders(d.total || list.length);
      }
    } catch (err) {
      toast.error('Failed to load store orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, [page, statusFilter]);

  const handleOpenOrder = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalLoading(true);
    try {
      const res = await vendorOrdersApi.getOrderById(orderId);
      if (res?.data) {
        setOrderDetails(res.data);
      } else {
        // Fallback to finding in local list
        const found = orders.find(o => (o.id || o._id) === orderId);
        setOrderDetails(found || null);
      }
    } catch (err) {
      const found = orders.find(o => (o.id || o._id) === orderId);
      setOrderDetails(found || null);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const id = String(o.id || o._id || '').toLowerCase();
    const customer = String(o.customer?.name || o.customerName || '').toLowerCase();
    return id.includes(q) || customer.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Store Orders Management
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            View customer purchases, order status, item details, and fulfillment timeline.
          </p>
        </div>

        <button
          onClick={() => loadOrders()}
          className="self-start sm:self-auto p-2.5 text-slate-600 hover:text-[#9d4ae3] hover:bg-purple-50 border border-slate-200 rounded-xl transition-all flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh Orders
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 font-medium"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 overflow-x-auto">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-[#9d4ae3] shadow-xs font-black'
                  : 'hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table Card */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-[#9d4ae3] rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-500">Loading store orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Order Ref</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Total</th>
                  <th className="px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord, i) => {
                  const id = ord.id || ord._id || `order-${i}`;
                  const customerName = ord.customer?.name || ord.customerName || 'Customer';
                  const status = (ord.status || 'pending').toLowerCase();
                  const itemCount = ord.items?.length || ord.totalItems || 1;
                  const total = ord.totalAmount ?? ord.amount ?? 0;

                  return (
                    <tr key={id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-800 font-mono text-xs">
                        #{String(id).slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">
                        {formatDate(ord.createdAt || ord.date)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {customerName}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          status === 'processing' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-800 whitespace-nowrap">
                        {fmt(total)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpenOrder(id)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#9d4ae3] rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Eye size={13} />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-xs font-medium space-y-2">
            <ShoppingCart size={36} className="mx-auto text-slate-300" />
            <p className="font-bold text-slate-600">No store orders found</p>
            <p>Orders placed for your store products will appear here.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 font-bold flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="font-bold text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 font-bold flex items-center gap-1"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrderId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                    <Package size={20} className="text-[#9d4ae3]" />
                    Order #{String(selectedOrderId).slice(-8).toUpperCase()}
                  </h3>
                  {orderDetails?.createdAt && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Placed on {formatDate(orderDetails.createdAt)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setOrderDetails(null);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {modalLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-3 border-purple-200 border-t-[#9d4ae3] rounded-full animate-spin" />
                    <p className="text-xs font-bold text-slate-400">Loading order details...</p>
                  </div>
                ) : orderDetails ? (
                  <>
                    {/* Status & Summary Header */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400">Order Status</span>
                        <p className="text-sm font-black text-slate-800 capitalize mt-0.5">
                          {orderDetails.status || 'Pending'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-slate-400">Total Amount</span>
                        <p className="text-lg font-black text-[#9d4ae3]">
                          {fmt(orderDetails.totalAmount ?? orderDetails.amount ?? 0)}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="border border-slate-100 rounded-2xl p-4 space-y-2">
                      <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                        <User size={14} className="text-purple-600" /> Customer Information
                      </h4>
                      <div className="text-xs space-y-1 text-slate-600 pt-1">
                        <p className="font-bold text-slate-800">{orderDetails.customer?.name || orderDetails.customerName || 'Customer'}</p>
                        <p>{orderDetails.customer?.email || orderDetails.customerEmail}</p>
                        <p>{orderDetails.customer?.phone || orderDetails.customerPhone}</p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
                      <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                        <Package size={14} className="text-purple-600" /> Purchased Items
                      </h4>
                      <div className="divide-y divide-slate-100">
                        {((orderDetails.items as any[]) || []).map((item, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-800">{item.name || item.productName || item.title || 'Product'}</p>
                              <p className="text-slate-400">Qty: {item.quantity || item.qty || 1} • {fmt(item.price)} each</p>
                            </div>
                            <p className="font-black text-slate-800">
                              {fmt((item.price || 0) * (item.quantity || item.qty || 1))}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-12 text-slate-400 text-xs">Could not load details for this order.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
