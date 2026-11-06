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
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const loadOrders = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await vendorOrdersApi.getOrders({
        page: targetPage,
        limit: 10,
        status: statusFilter,
      });

      if (res?.data) {
        const d = res.data;
        const list = Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : [];
        setOrders(list);
        const resolvedTotal = typeof d.total === 'number' ? d.total : list.length;
        const resolvedPages = typeof d.totalPages === 'number' ? d.totalPages : Math.ceil(resolvedTotal / (d.limit || 10)) || 1;
        setTotalPages(resolvedPages);
        setTotalOrders(resolvedTotal);
      }
    } catch (err) {
      toast.error('Failed to load store orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders(page);
  }, [page, statusFilter]);

  const handleOpenOrder = async (orderId: string, orderNumber?: string, initialData?: any) => {
    setSelectedOrderId(orderId);
    setSelectedOrderNumber(orderNumber || initialData?.orderNumber || orderId);
    if (initialData) {
      setOrderDetails(initialData);
    }
    setModalLoading(true);
    try {
      const res = await vendorOrdersApi.getOrderById(orderId);
      if (res?.data) {
        setOrderDetails(res.data);
      } else {
        // Fallback to finding in local list
        const found = orders.find(o => (o.orderId || o.id || o._id) === orderId || o.orderNumber === orderNumber);
        setOrderDetails(found || initialData || null);
      }
    } catch (err) {
      const found = orders.find(o => (o.orderId || o.id || o._id) === orderId || o.orderNumber === orderNumber);
      setOrderDetails(found || initialData || null);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const id = String(o.orderId || o.id || o._id || '').toLowerCase();
    const orderNum = String(o.orderNumber || o.orderNo || '').toLowerCase();
    const customer = String(o.customer?.name || o.customerName || '').toLowerCase();
    return id.includes(q) || orderNum.includes(q) || customer.includes(q);
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
          className="self-start sm:self-auto p-2.5 text-slate-600 hover:text-[#228b22] hover:bg-brand-50 border border-slate-200 rounded-xl transition-all flex items-center gap-2 text-xs font-bold"
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
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 font-medium"
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
                  ? 'bg-white text-[#228b22] shadow-xs font-black'
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
            <div className="w-10 h-10 border-4 border-brand-200 border-t-[#228b22] rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-500">Loading store orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12 text-slate-400 font-bold uppercase tracking-wider">#</th>
                  <th className="px-6 py-3.5">Order Ref</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Expected Delivery</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Total</th>
                  <th className="px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord, i) => {
                  const rowNumber = (page - 1) * 10 + i + 1;
                  const orderId = ord.orderId || ord.id || ord._id;
                  const orderNumber = ord.orderNumber || ord.orderNo || (orderId ? String(orderId).slice(-8).toUpperCase() : `ORD-${i + 1}`);
                  const customerName = ord.customer?.name || ord.customerName || 'Customer';
                  const status = (ord.status || 'pending').toLowerCase();
                  const itemCount = ord.items?.length || ord.totalItems || 1;
                  const total = ord.totalAmount ?? ord.amount ?? 0;
                  const orderDate = ord.orderDate || ord.createdAt || ord.date;

                  return (
                    <tr key={orderId || orderNumber || i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-4 text-xs font-bold text-slate-400 text-center">
                        {rowNumber}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800 font-mono text-xs">
                        {orderNumber}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">
                        {formatDate(orderDate)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {customerName}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ord.expectedDelivery ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 bg-brand-50/70 border border-brand-100 px-2.5 py-1 rounded-lg w-fit">
                            <Truck size={13} className="text-[#228b22]" />
                            <span>{ord.expectedDelivery.expectedDeliveryLabel}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          status === 'processing' ? 'bg-brand-50 text-brand-700 border-brand-200' :
                          status === 'confirmed' ? 'bg-brand-50 text-brand-700 border-brand-200' :
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
                          onClick={() => handleOpenOrder(orderId || orderNumber, orderNumber, ord)}
                          className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-[#228b22] rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1"
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
        {(totalPages > 1 || page > 1) && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-white">
            <span className="font-semibold text-slate-500">
              Showing {totalOrders === 0 ? 0 : (page - 1) * 10 + 1} to {Math.min(page * 10, totalOrders)} of {totalOrders} orders (Page {page} of {totalPages})
            </span>
            <div className="flex items-center gap-1 mx-auto sm:mx-0">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-50 transition cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>

              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (page <= 4) {
                    for (let i = 1; i <= 5; i++) pages.push(i);
                    pages.push('...');
                    pages.push(totalPages);
                  } else if (page >= totalPages - 3) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    pages.push('...');
                    pages.push(page - 1);
                    pages.push(page);
                    pages.push(page + 1);
                    pages.push('...');
                    pages.push(totalPages);
                  }
                }

                return pages.map((p, idx) => {
                  if (typeof p === 'string') {
                    return (
                      <span key={`el-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold select-none text-sm">
                        …
                      </span>
                    );
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(Number(p))}
                      disabled={loading}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition text-sm font-medium cursor-pointer ${
                        page === p
                          ? 'bg-[#228b22] text-white font-bold shadow-xs'
                          : 'hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      {p}
                    </button>
                  );
                });
              })()}

              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-50 transition cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
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
                    <Package size={20} className="text-[#228b22]" />
                    Order {orderDetails?.orderNumber || selectedOrderNumber || (selectedOrderId && !selectedOrderId.startsWith('order-') ? `#${String(selectedOrderId).slice(-8).toUpperCase()}` : '')}
                  </h3>
                  {(orderDetails?.orderDate || orderDetails?.createdAt) && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Placed on {formatDate(orderDetails.orderDate || orderDetails.createdAt)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setSelectedOrderNumber(null);
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
                    <div className="w-8 h-8 border-3 border-brand-200 border-t-[#228b22] rounded-full animate-spin" />
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
                        <p className="text-lg font-black text-[#228b22]">
                          {fmt(orderDetails.totalAmount ?? orderDetails.amount ?? 0)}
                        </p>
                      </div>
                    </div>

                    {/* Customer Promised Delivery Date */}
                    {orderDetails.expectedDelivery && (
                      <div className="bg-gradient-to-r from-brand-50 via-brand-50/70 to-brand-50 border border-brand-200 rounded-2xl p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#228b22] to-[#1c711c] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Truck size={18} />
                        </div>
                        <div className="flex-1 text-xs">
                          <span className="text-[10px] font-extrabold uppercase text-[#228b22] bg-brand-100 px-2 py-0.5 rounded-full">
                            Customer Promised Delivery
                          </span>
                          <p className="font-extrabold text-brand-950 text-sm mt-1">
                            {orderDetails.expectedDelivery.expectedDeliveryLabel}
                          </p>
                          <p className="text-brand-800 font-medium mt-0.5">
                            Within {orderDetails.expectedDelivery.maxWorkingDays} working days of processing.
                            {orderDetails.expectedDelivery.isInterState && ' (Inter-state leg)'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Customer Info */}
                    <div className="border border-slate-100 rounded-2xl p-4 space-y-2">
                      <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                        <User size={14} className="text-brand-600" /> Customer Information
                      </h4>
                      <div className="text-xs space-y-1 text-slate-600 pt-1">
                        <p className="font-bold text-slate-800">{orderDetails.customerName || orderDetails.customer?.name || 'Customer'}</p>
                        <p>{orderDetails.customerEmail || orderDetails.customer?.email || 'N/A'}</p>
                        <p>{orderDetails.customerPhone || orderDetails.customer?.phone || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
                      <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                        <Package size={14} className="text-brand-600" /> Purchased Items
                      </h4>
                      <div className="divide-y divide-slate-100">
                        {((orderDetails.items as any[]) || []).map((item, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-800">{item.productName || item.name || item.title || 'Product'}</p>
                              <p className="text-slate-400">Qty: {item.quantity || item.qty || 1} • {fmt(item.unitPrice ?? item.price ?? 0)} each</p>
                            </div>
                            <p className="font-black text-slate-800">
                              {fmt(item.subtotal ?? ((item.unitPrice ?? item.price ?? 0) * (item.quantity || item.qty || 1)))}
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
