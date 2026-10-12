import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Search, RefreshCw, Store, MapPin, DollarSign, Tag } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { adminVendorApi } from '@/lib/api-vendor';
import { toast } from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber?: string;
  orderId?: string;
  user: {
    name: string;
    avatar: string;
  };
  items: string;
  total: number;
  address: string;
  date: string;
  status: string;
  paymentStatus: string;
}

const statusStyles: Record<string, string> = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-800 border-amber-200',
  pending_payment: 'bg-amber-100 text-amber-800 border-amber-200',
  PAYMENT_FAILED: 'bg-rose-100 text-rose-800 border-rose-200',
  payment_failed: 'bg-rose-100 text-rose-800 border-rose-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  REFUNDED: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  refunded: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  Ongoing: 'bg-blue-100 text-blue-600',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-gray-100 text-gray-700',
  Returned: 'bg-orange-100 text-orange-700',
};

const statusLabels: Record<string, string> = {
  ALL: 'All Orders',
  PENDING_PAYMENT: 'Pending Payment',
  pending_payment: 'Pending Payment',
  PAYMENT_FAILED: 'Payment Failed',
  payment_failed: 'Payment Failed',
  CONFIRMED: 'Confirmed',
  confirmed: 'Confirmed',
  PROCESSING: 'Processing',
  processing: 'Processing',
  SHIPPED: 'Shipped',
  shipped: 'Shipped',
  DELIVERED: 'Delivered',
  delivered: 'Delivered',
  CANCELLED: 'Cancelled',
  cancelled: 'Cancelled',
  REFUNDED: 'Refunded',
  refunded: 'Refunded',
};

const STATUS_TABS = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'pending_payment', label: 'Pending Payment' },
  { id: 'payment_failed', label: 'Payment Failed' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'refunded', label: 'Refunded' },
];

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

const SORT_OPTIONS = [
  { id: 'created_at:desc', label: 'Date: Newest First', sortBy: 'created_at', sortOrder: 'desc' },
  { id: 'created_at:asc', label: 'Date: Oldest First', sortBy: 'created_at', sortOrder: 'asc' },
  { id: 'total_amount:desc', label: 'Amount: Highest First', sortBy: 'total_amount', sortOrder: 'desc' },
  { id: 'total_amount:asc', label: 'Amount: Lowest First', sortBy: 'total_amount', sortOrder: 'asc' },
];

interface VendorOption {
  id: string;
  name: string;
}

interface OrderTableProps {
  data?: Order[];
  searchQuery?: string;
  onViewDetails?: (order: any) => void;
  selectedStatusFilter?: string;
  onStatusFilterChange?: (newStatus: string) => void;
}

export default function OrderTable({ data: initialData = [], searchQuery: globalQuery = '', onViewDetails, selectedStatusFilter, onStatusFilterChange }: OrderTableProps) {
  // Filter States
  const [orderId, setOrderId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState(selectedStatusFilter || 'ALL');
  const [sortCombo, setSortCombo] = useState('created_at:desc');

  // Vendor list state
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  // Dynamic Orders state (fetched via search endpoint)
  const [ordersList, setOrdersList] = useState<Order[]>(initialData);
  const [isSearching, setIsSearching] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sync selectedStatusFilter if parent forces a status tab change
  useEffect(() => {
    if (selectedStatusFilter && selectedStatusFilter !== activeStatusTab) {
      setActiveStatusTab(selectedStatusFilter);
      void executeSearch({ status: selectedStatusFilter });
    }
  }, [selectedStatusFilter]);

  // Sync initialData if provided and user hasn't executed a custom search yet
  useEffect(() => {
    if (initialData.length > 0 && !isSearching) {
      setOrdersList(initialData);
    }
  }, [initialData]);

  // Load vendors for dropdown
  useEffect(() => {
    const fetchVendors = async () => {
      setLoadingVendors(true);
      try {
        const res = await adminVendorApi.listVendors({ limit: 100 });
        if (res?.data) {
          const payload = res.data as any;
          const list = Array.isArray(payload.vendors)
            ? payload.vendors
            : Array.isArray(payload.data)
              ? payload.data
              : Array.isArray(payload)
                ? payload
                : [];
          setVendors(
            list.map((v: any) => ({
              id: String(v.id || v.vendorId || v._id || ''),
              name: String(v.storeName || v.name || v.fullName || v.email || 'Unnamed Store'),
            })).filter((v: VendorOption) => v.id)
          );
        }
      } catch {
        // Fallback silently if vendors list fetch fails
      } finally {
        setLoadingVendors(false);
      }
    };

    void fetchVendors();
  }, []);

  // Execute Search API call
  const executeSearch = useCallback(async (overrides?: { status?: string }) => {
    setIsSearching(true);
    setCurrentPage(1);

    const rawTarget = overrides?.status !== undefined ? overrides.status : activeStatusTab;
    const targetStatus = rawTarget === 'ALL' ? 'ALL' : rawTarget.toLowerCase();
    const [sortBy, sortOrder] = sortCombo.split(':');

    const searchParams: Record<string, any> = {
      page: 1,
      limit: 50,
      orderId: orderId.trim() || undefined,
      vendorId: vendorId || undefined,
      minAmount: minAmount !== '' ? Number(minAmount) : undefined,
      maxAmount: maxAmount !== '' ? Number(maxAmount) : undefined,
      deliveryState: deliveryState || undefined,
      status: targetStatus !== 'ALL' ? targetStatus : undefined,
      sortBy: sortBy || 'created_at',
      sortOrder: sortOrder || 'desc',
    };

    if (globalQuery && !orderId) {
      searchParams.searchQuery = globalQuery;
    }

    try {
      const response = await ordersApi.search(searchParams);
      const payload = (response as any)?.data ?? response;
      const rawList = Array.isArray(payload?.orders)
        ? payload.orders
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

      const mapped = rawList.map((order: any) => {
        const customerName =
          order.customer?.name ||
          order.customerName ||
          [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(' ') ||
          order.user?.name ||
          'Customer';

        const itemCount = Array.isArray(order.items)
          ? order.items.length
          : order.itemCount ?? order.totalItems ?? 0;

        const rawAmount = order.totalAmount?.amount ?? order.totalAmount ?? order.total ?? order.grandTotal ?? order.amount ?? 0;
        const totalNum = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount)) || 0;

        const rawAddr =
          order.shippingAddress?.addressLine1 ||
          order.shippingAddress?.address ||
          order.deliveryAddress ||
          order.address ||
          'N/A';

        const orderNum = order.orderNumber || order.orderNo || (order.id && !order.id.startsWith('order-') ? order.id : '') || (order.orderId ? `#${String(order.orderId).slice(-8).toUpperCase()}` : '');
        const orderIdVal = order.orderId || order.id || order._id || '';

        return {
          id: String(orderNum || orderIdVal),
          orderNumber: String(orderNum || orderIdVal),
          orderId: String(orderIdVal),
          user: {
            name: customerName,
            avatar: order.customer?.avatar || order.customer?.profilePicture || order.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}`,
          },
          items: `${itemCount} item${itemCount === 1 ? '' : 's'}`,
          total: totalNum,
          address: rawAddr,
          date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : String(order.date || ''),
          status: order.status || 'PENDING_PAYMENT',
          paymentStatus: order.paymentStatus || 'Pending',
        };
      });

      setOrdersList(mapped);
    } catch {
      toast.error('Search failed. Using active view filters.');
    } finally {
      setIsSearching(false);
    }
  }, [activeStatusTab, deliveryState, globalQuery, maxAmount, minAmount, orderId, sortCombo, vendorId]);

  // Handle Tab Click
  const handleTabClick = (statusId: string) => {
    setActiveStatusTab(statusId);
    onStatusFilterChange?.(statusId);
    void executeSearch({ status: statusId });
  };

  // Handle Reset Filters
  const handleResetFilters = () => {
    setOrderId('');
    setVendorId('');
    setMinAmount('');
    setMaxAmount('');
    setDeliveryState('');
    setActiveStatusTab('ALL');
    setSortCombo('created_at:desc');
    void executeSearch({ status: 'ALL' });
  };

  // Local Client Filtering Fallback when offline or using static data
  const filteredData = useMemo(() => {
    let result = [...ordersList];

    if (orderId.trim()) {
      const q = orderId.trim().toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        (o.orderId && o.orderId.toLowerCase().includes(q))
      );
    }

    if (activeStatusTab !== 'ALL') {
      result = result.filter(o => String(o.status).toUpperCase() === activeStatusTab.toUpperCase());
    }

    if (minAmount) {
      result = result.filter(o => o.total >= Number(minAmount));
    }

    if (maxAmount) {
      result = result.filter(o => o.total <= Number(maxAmount));
    }

    return result;
  }, [ordersList, orderId, activeStatusTab, minAmount, maxAmount]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      {/* ── Filter Controls Header Card ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Filter size={18} className="text-[#9d4ae3]" />
            <span>Order Search & Advanced Filters</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-gray-500 hover:text-purple-600 transition flex items-center gap-1"
          >
            <RefreshCw size={12} /> Reset Filters
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Order ID Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. ORD-10294"
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* 2. Vendor Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Store size={12} /> Vendor
            </label>
            <select
              value={vendorId}
              onChange={e => setVendorId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">All Vendors</option>
              {loadingVendors ? (
                <option disabled>Loading vendors...</option>
              ) : (
                vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))
              )}
            </select>
          </div>

          {/* 3. Min Amount */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Min Amount (₦)</label>
            <input
              type="number"
              value={minAmount}
              onChange={e => setMinAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* 4. Max Amount */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Max Amount (₦)</label>
            <input
              type="number"
              value={maxAmount}
              onChange={e => setMaxAmount(e.target.value)}
              placeholder="1,000,000"
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* 5. Delivery State Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <MapPin size={12} /> Delivery State
            </label>
            <select
              value={deliveryState}
              onChange={e => setDeliveryState(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">All 36 States</option>
              {NIGERIAN_STATES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* 6. Sort By Dropdown (4 combos) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown size={12} /> Sort By
            </label>
            <select
              value={sortCombo}
              onChange={e => setSortCombo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => void executeSearch()}
            disabled={isSearching}
            className="px-6 py-2.5 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-md shadow-fuchsia-100 flex items-center gap-2 transition disabled:opacity-60"
          >
            {isSearching ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search size={14} /> Search Orders
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Status Tabs Row ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-150 p-2 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {STATUS_TABS.map(tab => {
            const isActive = activeStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#9d4ae3] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-slate-800'
                }`}
              >
                <Tag size={12} className={isActive ? 'text-white' : 'text-gray-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Orders Data Table ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-50/50 border-b">
              <tr>
                <th className="p-4 text-xs font-semibold text-gray-400 capitalize text-center w-12">#</th>
                <th className="p-4 text-xs font-semibold text-gray-400 capitalize">Order Number</th>
                <th className="p-4 text-xs font-semibold text-gray-400 capitalize">User</th>
                <th className="p-4 text-xs font-semibold text-gray-400 capitalize">Items</th>
                <th className="p-4 text-xs font-semibold text-gray-400 capitalize">Total</th>
                <th className="p-4 text-xs font-semibold text-gray-400 capitalize">Address</th>
                <th className="p-4 text-xs font-semibold text-gray-400 capitalize">Date</th>
                <th className="p-4 text-xs font-semibold text-gray-400 capitalize text-center">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 capitalize text-center">Payment</th>
                <th className="p-4 text-xs font-semibold text-gray-400 capitalize text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((order, idx) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50/50 transition">
                    <td className="p-4 text-xs font-bold text-slate-400 text-center">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="p-4 font-bold text-slate-700 text-sm">{order.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.user.avatar}
                          alt={order.user.name}
                          className="w-8 h-8 rounded-full object-cover bg-gray-100"
                        />
                        <span className="font-semibold text-slate-700 text-sm">{order.user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">{order.items}</td>
                    <td className="p-4 text-sm font-bold text-slate-800">
                      ₦ {order.total.toLocaleString()}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600 truncate max-w-[150px]">
                      {order.address}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400 shrink-0" />
                        {order.date}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusStyles[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : order.paymentStatus === 'Pending'
                              ? 'bg-amber-100 text-amber-700'
                              : order.paymentStatus === 'Failed'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onViewDetails?.(order)}
                        className="text-[#9d4ae3] hover:bg-fuchsia-50 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-gray-500 font-medium">
                    No orders match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col p-4 space-y-4 bg-gray-50/50">
          {paginatedData.length > 0 ? (
            paginatedData.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="font-bold text-slate-800 text-base">{order.id}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {order.paymentStatus}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${statusStyles[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm font-medium">User</span>
                    <div className="flex items-center gap-2">
                      <img src={order.user.avatar} alt={order.user.name} className="w-6 h-6 rounded-full object-cover bg-gray-100" />
                      <span className="font-semibold text-slate-700 text-sm">{order.user.name}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm font-medium">Items</span>
                    <span className="font-medium text-slate-700 text-sm">{order.items}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm font-medium">Total Price</span>
                    <span className="font-bold text-slate-800 text-sm">₦ {order.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm font-medium">Address</span>
                    <span className="font-medium text-slate-700 text-sm truncate max-w-[180px]">{order.address}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm font-medium">Date</span>
                    <span className="font-medium text-slate-700 text-sm">{order.date}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-50 mt-2">
                    <button
                      onClick={() => onViewDetails?.(order)}
                      className="w-full text-center bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white py-2.5 rounded-xl text-sm font-bold shadow-md shadow-fuchsia-100 hover:opacity-90 transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500 font-medium">
              No orders found.
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <span className="text-sm text-gray-500 font-medium hidden sm:block">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries (Page {currentPage} of {totalPages})
            </span>
            <div className="flex items-center gap-1 mx-auto sm:mx-0">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 disabled:opacity-50 transition"
              >
                <ChevronLeft size={18} />
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

                return pages.map((page, idx) => {
                  if (typeof page === 'string') {
                    return (
                      <span key={`el-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold select-none text-sm">
                        …
                      </span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition text-sm font-medium ${
                        currentPage === page
                          ? 'bg-[#9d4ae3] text-white font-bold shadow-xs'
                          : 'hover:bg-gray-50 text-gray-500'
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 disabled:opacity-50 transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

