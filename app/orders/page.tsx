'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, ArrowLeft, Clock, CheckCircle2, Truck, AlertCircle, ShoppingBag } from 'lucide-react';
import { orderApi, OrderData } from '@/lib/api';
import { useAppSelector } from '@/lib/hooks';

export default function MyOrdersPage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await orderApi.getMyOrders({ limit: 50 });
        if (!isMounted) return;
        if (res?.success && res.data) {
          const data = (res.data as any).data || res.data;
          setOrders(Array.isArray(data) ? data : []);
        } else {
          setOrders([]);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load your orders.');
        setOrders([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [isAuthenticated]);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"><CheckCircle2 size={12} /> Delivered</span>;
      case 'SHIPPED':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200"><Truck size={12} /> Shipped</span>;
      case 'PROCESSING':
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200"><Clock size={12} /> {status}</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200"><AlertCircle size={12} /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"><Clock size={12} /> {status || 'Pending'}</span>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-md mx-auto">
          <Package size={48} className="mx-auto text-purple-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-sm text-gray-500 mb-6">Please sign in to view your order history and track shipments.</p>
          <Link href="/" className="bg-[#9d4ae3] text-white px-6 py-3 rounded-xl font-bold inline-block hover:bg-[#8236be] transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-2 hover:text-[#9d4ae3] transition">
            <ArrowLeft size={14} /> Back to Shopping
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Orders</h1>
          <p className="text-xs text-gray-500">Track and manage your order history</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-[#9d4ae3] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-sm text-red-600">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-1">No Orders Yet</h3>
          <p className="text-xs text-gray-400 mb-6">You haven&apos;t placed any orders on Faflora yet.</p>
          <Link href="/" className="bg-[#9d4ae3] text-white px-6 py-2.5 rounded-xl font-bold text-sm inline-block hover:bg-[#8236be] transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const total = typeof order.totalAmount === 'object' ? order.totalAmount.amount : (Number(order.totalAmount) || 0);
            const items = order.items || [];

            return (
              <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">Order Number</span>
                    <h3 className="text-sm font-bold text-slate-800">#{order.orderNumber || order.id.slice(0, 8)}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-gray-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {items.map((item, idx) => {
                    const price = item.unitPrice?.amount ?? (typeof (item as any).price === 'object' ? (item as any).price?.amount : Number((item as any).price) || 0);
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs text-gray-700">
                        <span className="font-medium truncate max-w-[70%]">
                          {item.quantity}x {item.productName || 'Product item'}
                        </span>
                        <span className="font-bold text-slate-800">₦{price.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-sm">
                  <span className="text-xs text-gray-500 font-medium">Total:</span>
                  <span className="font-black text-base text-[#9d4ae3]">₦{total.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
