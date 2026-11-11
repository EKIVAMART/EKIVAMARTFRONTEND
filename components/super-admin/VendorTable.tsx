import React, { useState, useMemo } from 'react';
import { Edit3, Trash2, Mail, ExternalLink, ArrowUpDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  type: string;
  email: string;
  status: string;
}

interface VendorTableProps {
  data: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (id: number) => void;
  searchQuery?: string;
}

const allStatuses = ['All', 'Active', 'Inactive', 'Pending'];

export default function VendorTable({ data, onEdit, onDelete, searchQuery = '' }: VendorTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const itemsPerPage = 10;

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(vendor =>
        vendor.name.toLowerCase().includes(query) ||
        vendor.email.toLowerCase().includes(query) ||
        vendor.type.toLowerCase().includes(query) ||
        vendor.status.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(vendor => vendor.status === statusFilter);
    }

    // Sort by Name
    result.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [data, searchQuery, statusFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage) || 1;
  const paginatedData = filteredAndSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  return (
    <div className="bg-white rounded-md border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Desktop Action Bar */}
      <div className="hidden md:flex justify-end items-center p-4 border-b gap-4 bg-white">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            className="bg-gray-50 border-none text-sm font-medium text-slate-700 rounded-lg p-2 outline-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {allStatuses.map(status => (
              <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSortToggle}
          className="p-2 hover:bg-gray-50 rounded-lg transition text-gray-500 flex items-center gap-2 text-sm font-medium"
        >
          <ArrowUpDown size={16} />
          Sort by Name
        </button>
      </div>

      {/* Mobile Action Bar */}
      <div className="md:hidden flex justify-between items-center p-4 border-b bg-gray-50/50">
        <h2 className="text-lg font-bold text-slate-800">Vendors</h2>
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

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor Details</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Industry</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? paginatedData.map((vendor) => (
              <tr key={vendor.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors group">
                {/* Vendor Name & Email */}
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm group-hover:text-slate-600 transition-colors cursor-pointer flex items-center gap-1">
                      {vendor.name} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium mt-0.5">
                      <Mail size={10} />
                      {vendor.email}
                    </div>
                  </div>
                </td>

                {/* Industry Type */}
                <td className="p-4 text-center">
                  <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                    {vendor.type}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="p-4 text-center">
                  <span
                    className={`
                      px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter
                      ${vendor.status === 'Active'
                        ? 'bg-brand-100 text-brand-600 border border-brand-200'
                        : 'bg-amber-100 text-slate-600 border border-amber-200'
                      }
                    `}
                  >
                    {vendor.status}
                  </span>
                </td>

                {/* Action Buttons */}
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(vendor)}
                      className="p-2 text-slate-500 hover:bg-blue-50 rounded-md transition-all active:scale-90"
                      title="Edit Vendor"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(vendor.id)}
                      className="p-2 text-slate-400 hover:bg-red-50 hover:text-slate-900 rounded-md transition-all active:scale-90"
                      title="Delete Vendor"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">No vendors found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col p-4 space-y-4 bg-gray-50/50">
        {paginatedData.length > 0 ? paginatedData.map((vendor) => (
          <div key={vendor.id} className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                  {vendor.name}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium mt-1">
                  <Mail size={10} />
                  {vendor.email}
                </div>
              </div>
              <span
                className={`
                  px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter shrink-0
                  ${vendor.status === 'Active'
                    ? 'bg-brand-100 text-brand-600 border border-brand-200'
                    : 'bg-amber-100 text-slate-600 border border-amber-200'
                  }
                `}
              >
                {vendor.status}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 border-t border-gray-50 pt-3">
              <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                {vendor.type}
              </span>
              <div className="flex gap-2">
                <button onClick={() => onEdit(vendor)} className="p-1.5 hover:bg-blue-50 text-slate-500 rounded-lg transition"><Edit3 size={16}/></button>
                <button onClick={() => onDelete(vendor.id)} className="p-1.5 hover:bg-red-50 text-slate-500 rounded-lg transition"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white p-8 rounded-md shadow-sm border border-gray-100 text-center text-gray-500 font-medium">
            No vendors found.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {(filteredAndSortedData.length > itemsPerPage || currentPage > 1) && (
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