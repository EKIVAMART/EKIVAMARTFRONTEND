import React, { useState, useMemo } from 'react';
import RecordActions from '@/components/admin/RecordActions';
import Image, { StaticImageData } from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string | StaticImageData;
  category?: string;
  subCategory?: string;
  status?:
    | 'draft'
    | 'active'
    | 'published'
    | 'inactive'
    | 'out_of_stock'
    | 'discontinued';
  createdAt?: string;
  updatedAt?: string;
}

interface ProductTableProps {
  data: Product[];
  onEdit: (item: Product) => void;
  onDelete: (id: string) => void;
  onView?: (item: Product, section?: 'overview' | 'reviews') => void;
  onPublish?: (id: string) => void;
  publishingProductId?: string | null;
  searchQuery?: string;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  showReviewRepliesButton?: boolean;
  /** When provided, sorting is controlled by the parent (e.g. sent to the server). */
  sortBy?: string;
  onSortByChange?: (sortBy: string) => void;
}

const getStatusBadge = (status?: Product['status']) => {
  if (!status) return null;

  const isPublished = status === 'active' || status === 'published';

  if (isPublished) {
    return (
      <span className="text-xs text-[#176a35]">
        Active
      </span>
    );
  }

  return (
    <span className="text-xs text-slate-600 capitalize">
      {status.replaceAll('_', ' ')}
    </span>
  );
};

export default function ProductTable({
  data,
  onEdit,
  onDelete,
  onView,
  onPublish,
  publishingProductId,
  searchQuery = '',
  currentPage: serverPage,
  totalPages: serverTotalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  isLoading = false,
  showReviewRepliesButton = false,
  sortBy: controlledSortBy,
  onSortByChange,
}: ProductTableProps) {
  const [localPage, setLocalPage] = useState(1);
  const [localSortBy, setLocalSortBy] = useState<string>('createdAt-desc');
  const sortBy = controlledSortBy ?? localSortBy;
  const setSortBy = (value: string) => {
    if (onSortByChange) onSortByChange(value);
    else setLocalSortBy(value);
  };
  const isServerPaginated = Boolean(onPageChange);
  const currentPage = serverPage || localPage;

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );
    }

    // Sort options
    const [field, direction] = sortBy.split('-');
    result.sort((a, b) => {
      let comparison = 0;
      if (field === 'price') {
        comparison = a.price - b.price;
      } else if (field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (field === 'createdAt') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = dateA - dateB;
      } else if (field === 'updatedAt') {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        comparison = dateA - dateB;
      }
      return direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [data, searchQuery, sortBy]);

  const totalPages =
    serverTotalPages ||
    Math.ceil(filteredAndSortedData.length / itemsPerPage) ||
    1;
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Desktop Action Bar */}
      <div className="hidden md:flex justify-end items-center p-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <label htmlFor="product-sort-desktop" className="text-xs text-gray-600">Sort by</label>
          <select
            id="product-sort-desktop"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-sm font-medium text-slate-700 rounded-lg p-2 outline-none cursor-pointer focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22]"
          >
            <option value="createdAt-desc">Newest Created</option>
            <option value="createdAt-asc">Oldest Created</option>
            <option value="updatedAt-desc">Recent Updated</option>
            <option value="updatedAt-asc">Oldest Updated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Mobile Action Bar */}
      <div className="md:hidden flex flex-col gap-2 p-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <label htmlFor="product-sort-mobile" className="text-xs text-gray-600 shrink-0">Sort by</label>
          <select
            id="product-sort-mobile"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-white border text-sm font-medium text-slate-700 rounded-lg px-2 py-1.5 outline-none cursor-pointer"
          >
            <option value="createdAt-desc">Newest Created</option>
            <option value="createdAt-asc">Oldest Created</option>
            <option value="updatedAt-desc">Recent Updated</option>
            <option value="updatedAt-asc">Oldest Updated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-200">
          <thead className="bg-gray-50/50 border-b">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase w-12 text-center">
                #
              </th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">
                Product
              </th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">
                Price
              </th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">
                Stock
              </th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((p, idx) => {
                const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                return (
                  <React.Fragment key={p.id}>
                    <tr className="cursor-pointer border-b transition hover:bg-emerald-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 last:border-0" onClick={() => onView?.(p, 'overview')} onKeyDown={(event) => { if (event.key === 'Enter') onView?.(p, 'overview'); }} tabIndex={onView ? 0 : -1} aria-label={`View ${p.name}`}>
                      <td className="p-4 text-xs font-bold text-slate-400 text-center">
                        {rowNumber}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border p-1 shrink-0 relative">
                      {p.image ? (
                        <Image
                          src={
                            typeof p.image === 'string' ? p.image : p.image.src
                          }
                          alt={p.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-400 rounded">
                          IMG
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-left font-semibold text-slate-800 text-sm break-words">{p.name}</span>
                      <div className="flex items-center gap-2 mt-0.5 w-fit">
                        {getStatusBadge(p.status)}
                        {(p.category || p.subCategory) && (
                          <span className="text-xs text-slate-500">
                            {p.category}{' '}
                            {p.subCategory ? `› ${p.subCategory}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    </div>
                  </td>
                  <td className="p-4 text-center text-sm font-medium text-slate-800">
                    ₦{p.price.toLocaleString('en-NG')}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-xs whitespace-nowrap ${p.stock <= 5 ? 'text-slate-700 font-semibold' : 'text-slate-600'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} available`}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <RecordActions name={p.name} actions={[
                      onView && { label: 'View product', onSelect: () => onView(p, 'overview') },
                      showReviewRepliesButton && onView && { label: 'View reviews', onSelect: () => onView(p, 'reviews') },
                      { label: 'Edit product', onSelect: () => onEdit(p) },
                      p.status === 'draft' && onPublish && { label: publishingProductId === p.id ? 'Publishing…' : 'Publish product', onSelect: () => { if (publishingProductId !== p.id) onPublish(p.id); } },
                      { label: 'Delete product', onSelect: () => onDelete(p.id), destructive: true },
                    ]} />
                  </td>
                </tr>
                </React.Fragment>
              );
            })
          ) : (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-500 font-medium"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col p-4 space-y-4 bg-gray-50/50">
        {paginatedData.length > 0 ? (
          paginatedData.map((p, idx) => {
            const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
            return (
            <div
              key={p.id}
              onClick={() => onView?.(p, 'overview')}
              onKeyDown={(event) => { if (event.key === 'Enter') onView?.(p, 'overview'); }}
              tabIndex={onView ? 0 : -1}
              role="button"
              aria-label={`View ${p.name}`}
              className="flex cursor-pointer flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-md overflow-hidden border p-2 shrink-0 relative">
                  {p.image ? (
                    <Image
                      src={typeof p.image === 'string' ? p.image : p.image.src}
                      alt={p.name}
                      fill
                      className="object-contain mix-blend-multiply"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 rounded-lg">
                      IMG
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-black text-slate-400 shrink-0">#{rowNumber}</span>
                      <h3 className="font-semibold text-slate-800 text-sm leading-snug break-words">
                        {p.name}
                      </h3>
                    </div>
                    {getStatusBadge(p.status)}
                  </div>
                  {(p.category || p.subCategory) && (
                    <div className="mt-1">
                      <span className="text-xs text-slate-500">
                        {p.category} {p.subCategory ? `› ${p.subCategory}` : ''}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <span className="text-sm font-semibold text-slate-900">
                      ₦{p.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-600">
                      {p.stock} available
                    </span>
                  </div>

                </div>
              </div>
              <div className="flex justify-end border-t border-slate-100 pt-3" onClick={(event) => event.stopPropagation()}>
                <RecordActions name={p.name} actions={[
                  onView && { label: 'View product', onSelect: () => onView(p, 'overview') },
                  showReviewRepliesButton && onView && { label: 'View reviews', onSelect: () => onView(p, 'reviews') },
                  { label: 'Edit product', onSelect: () => onEdit(p) },
                  p.status === 'draft' && onPublish && { label: publishingProductId === p.id ? 'Publishing…' : 'Publish product', onSelect: () => { if (publishingProductId !== p.id) onPublish(p.id); } },
                  { label: 'Delete product', onSelect: () => onDelete(p.id), destructive: true },
                ]} />
              </div>
            </div>
            );
          })
        ) : (
          <div className="bg-white p-8 rounded-md shadow-sm border border-gray-100 text-center text-gray-500 font-medium">
            No products found.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {(totalPages > 1 || currentPage > 1) && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-sm text-gray-500 font-medium hidden sm:block">
            Showing {showingFrom} to {showingTo} of {displayTotal} products (Page {currentPage} of {totalPages})
          </span>
          <div className="flex items-center gap-1 mx-auto sm:mx-0">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
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

              return pages.map((page, index) => {
                if (typeof page === 'string') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold select-none text-sm"
                    >
                      …
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    disabled={isLoading}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition text-sm font-medium ${
                      currentPage === page
                        ? 'bg-[#228b22] text-white font-bold shadow-xs'
                        : 'hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}

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
