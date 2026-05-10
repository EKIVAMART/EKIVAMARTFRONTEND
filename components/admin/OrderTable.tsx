import React, { useState, useMemo } from 'react';
import { Calendar, MoreHorizontal, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  items: string;
  total: number;
  address: string;
  date: string;
  status: 'Ongoing' | 'Delivered' | 'Cancelled' | 'Returned';
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
}

const statusStyles = {
  'Ongoing': 'bg-blue-100 text-blue-600',
  'Delivered': 'bg-green-100 text-green-600',
  'Cancelled': 'bg-red-100 text-red-600',
  'Returned': 'bg-orange-100 text-orange-600',
};

const allStatuses = ['All', 'Ongoing', 'Delivered', 'Cancelled', 'Returned'];
const allPaymentStatuses = ['All', 'Paid', 'Pending', 'Failed', 'Refunded'];

interface OrderTableProps {
  data: Order[];
  searchQuery?: string;
  onViewDetails?: (order: Order) => void;
}

export default function OrderTable({ data, searchQuery = '', onViewDetails }: OrderTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  
  const itemsPerPage = 10;

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.user.name.toLowerCase().includes(query) ||
        order.items.toLowerCase().includes(query) ||
        order.address.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Payment Status filter
    if (paymentFilter !== 'All') {
      result = result.filter(order => order.paymentStatus === paymentFilter);
    }

    // Sort by ID (as a proxy for recency in this mock)
    result.sort((a, b) => {
      const valA = parseInt(a.id.replace(/\D/g, '')) || 0;
      const valB = parseInt(b.id.replace(/\D/g, '')) || 0;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [data, searchQuery, statusFilter, paymentFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter]);

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Action Bar - Desktop only (filters) */}
      <div className="hidden md:flex justify-end items-center p-4 border-b gap-4 bg-white">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select 
            className="bg-gray-50 border-none text-sm font-medium text-slate-700 rounded-lg p-2 outline-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {allStatuses.map(status => (
              <option key={status} value={status}>{status === 'All' ? 'All Order Status' : status}</option>
            ))}
          </select>
          <select 
            className="bg-gray-50 border-none text-sm font-medium text-slate-700 rounded-lg p-2 outline-none cursor-pointer"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            {allPaymentStatuses.map(status => (
              <option key={status} value={status}>{status === 'All' ? 'All Payment' : status}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleSortToggle}
          className="p-2 hover:bg-gray-50 rounded-lg transition text-gray-500 flex items-center gap-2 text-sm font-medium"
        >
          <ArrowUpDown size={16} />
          Sort by Date: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-50/50 border-b">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-400 capitalize">Order ID</th>
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
            {paginatedData.length > 0 ? paginatedData.map((order) => (
              <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50/50 transition">
                <td className="p-4 font-bold text-slate-700 text-sm">{order.id}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={order.user.avatar} alt={order.user.name} className="w-8 h-8 rounded-full object-cover bg-gray-100" />
                    <span className="font-semibold text-slate-700 text-sm">{order.user.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm font-medium text-slate-600">{order.items}</td>
                <td className="p-4 text-sm font-bold text-slate-800">₦ {order.total.toLocaleString()}</td>
                <td className="p-4 text-sm font-medium text-slate-600 truncate max-w-[150px]">{order.address}</td>
                <td className="p-4 text-sm font-medium text-slate-600 flex items-center gap-2 whitespace-nowrap">
                  <Calendar size={14} className="text-gray-400 shrink-0" />
                  {order.date}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                    order.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    order.paymentStatus === 'Failed' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => onViewDetails?.(order)}
                    className="text-[#c800ff] hover:bg-fuchsia-50 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                  >
                    Details
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col p-4 space-y-4 bg-gray-50/50">
        <div className="flex justify-between items-center pb-2">
          <h2 className="text-lg font-bold text-slate-800">Order List</h2>
          <div className="flex gap-2">
            <select 
              className="bg-white border text-sm font-medium text-slate-700 rounded-lg px-2 py-1 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {allStatuses.map(status => (
                <option key={status} value={status}>{status === 'All' ? 'All' : status}</option>
              ))}
            </select>
            <button onClick={handleSortToggle} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg bg-white border">
              <ArrowUpDown size={18} />
            </button>
          </div>
        </div>
        {paginatedData.length > 0 ? paginatedData.map((order) => (
          <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <span className="font-bold text-slate-800 text-base">{order.id}</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {order.paymentStatus}
                </span>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${statusStyles[order.status]}`}>
                  {order.status}
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
                  className="w-full text-center bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white py-2.5 rounded-xl text-sm font-bold shadow-md shadow-fuchsia-100 hover:opacity-90 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500 font-medium">
            No orders found.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-sm text-gray-500 font-medium hidden sm:block">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} entries
          </span>
          <div className="flex items-center gap-1 mx-auto sm:mx-0">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 disabled:opacity-50 transition"
            >
              <ChevronLeft size={18} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition text-sm font-medium ${
                  currentPage === page 
                    ? 'bg-gray-100 text-slate-800 font-bold' 
                    : 'hover:bg-gray-50 text-gray-500'
                }`}
              >
                {page}
              </button>
            ))}

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
  );
}
