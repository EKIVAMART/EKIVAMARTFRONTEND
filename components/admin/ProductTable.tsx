import React, { useState, useMemo } from 'react';
import { Edit3, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category?: string;
  status?: 'draft' | 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
}

interface ProductTableProps {
  data: Product[];
  onEdit: (item: Product) => void;
  onDelete: (id: string) => void;
  onPublish?: (id: string) => void;
  searchQuery?: string;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export default function ProductTable({
  data,
  onEdit,
  onDelete,
  onPublish,
  searchQuery = '',
  currentPage: serverPage,
  totalPages: serverTotalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  isLoading = false,
}: ProductTableProps) {
  const [localPage, setLocalPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const isServerPaginated = Boolean(onPageChange);
  const currentPage = serverPage || localPage;

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // Sort by Price as an example
    result.sort((a, b) => {
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });

    return result;
  }, [data, searchQuery, sortOrder]);

  const totalPages =
    serverTotalPages || Math.ceil(filteredAndSortedData.length / itemsPerPage) || 1;
  const paginatedData = isServerPaginated
    ? filteredAndSortedData
    : filteredAndSortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );
  const displayTotal = totalItems ?? filteredAndSortedData.length;
  const showingFrom =
    displayTotal === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(
    (currentPage - 1) * itemsPerPage + paginatedData.length,
    displayTotal
  );

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  React.useEffect(() => {
    if (isServerPaginated) {
      onPageChange?.(1);
      return;
    }

    setLocalPage(1);
  }, [isServerPaginated, onPageChange, searchQuery]);

  const goToPage = (page: number) => {
    const nextPage = Math.min(totalPages, Math.max(1, page));

    if (isServerPaginated) {
      onPageChange?.(nextPage);
      return;
    }

    setLocalPage(nextPage);
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Desktop Action Bar */}
      <div className="hidden md:flex justify-end items-center p-4 border-b bg-white">
        <button 
          onClick={handleSortToggle}
          className="p-2 hover:bg-gray-50 rounded-lg transition text-gray-500 flex items-center gap-2 text-sm font-medium"
        >
          <ArrowUpDown size={16} />
          Sort by Price
        </button>
      </div>

      {/* Mobile Action Bar */}
      <div className="md:hidden flex justify-between items-center p-4 border-b bg-gray-50/50">
        <h2 className="text-lg font-bold text-slate-800">Products</h2>
        <button onClick={handleSortToggle} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg bg-white border">
          <ArrowUpDown size={18} />
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-gray-50/50 border-b">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Product</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">Price</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">Stock</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? paginatedData.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/50 transition">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border p-1 shrink-0 relative">
                    {p.image ? (
                      <img src={p.image} className="w-full h-full object-contain" alt={p.name} />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-400 rounded">IMG</div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700 text-sm truncate max-w-[200px]">{p.name}</span>
                    {p.status && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded w-fit mt-0.5 uppercase">{p.status.replaceAll('_', ' ')}</span>}
                  </div>
                </td>
                <td className="p-4 text-center text-sm font-bold text-slate-700">NGN {p.price.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{p.stock} In Stock</span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {p.status === 'draft' && onPublish && (
                      <button onClick={() => onPublish(p.id)} className="px-3 py-1.5 bg-[#981d87] hover:bg-[#7a176c] text-white text-xs font-bold rounded-lg transition shadow">Publish</button>
                    )}
                    <button onClick={() => onEdit(p)} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition"><Edit3 size={18}/></button>
                    <button onClick={() => onDelete(p.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col p-4 space-y-4 bg-gray-50/50">
        {paginatedData.length > 0 ? paginatedData.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border p-2 shrink-0">
                {p.image ? (
                  <img src={p.image} className="w-full h-full object-contain mix-blend-multiply" alt={p.name} />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 rounded-lg">IMG</div>
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{p.name}</h3>
                  {p.status && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded shrink-0 uppercase">{p.status.replaceAll('_', ' ')}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="text-sm font-black text-[#981d87]">NGN {p.price.toLocaleString()}</span>
                  <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{p.stock} in stock</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-50 pt-3 mt-1">
              {p.status === 'draft' && onPublish && (
                <button onClick={() => onPublish(p.id)} className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-[#981d87] text-white hover:bg-[#7a176c] rounded-xl transition text-xs font-bold shadow">
                  Publish
                </button>
              )}
              <button onClick={() => onEdit(p)} className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition text-xs font-bold">
                <Edit3 size={16}/> Edit
              </button>
              <button onClick={() => onDelete(p.id)} className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition text-xs font-bold">
                <Trash2 size={16}/> Delete
              </button>
            </div>
          </div>
        )) : (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500 font-medium">
            No products found.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {(totalPages > 1 || currentPage > 1) && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-sm text-gray-500 font-medium hidden sm:block">
            Showing {showingFrom} to {showingTo} of {displayTotal} entries
          </span>
          <div className="flex items-center gap-1 mx-auto sm:mx-0">
            <button 
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 disabled:opacity-50 transition"
            >
              <ChevronLeft size={18} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => goToPage(page)}
                disabled={isLoading}
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
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
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

