'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Plus, Edit, Trash2, Layers, Search,
  CheckCircle2, Clock, Upload, ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { categoryApi, ApiError } from '@/lib/api';
import { useAppSelector } from '@/lib/hooks';
import CategoryFormModal from './CategoryFormModal';
import SubcategoryModal from './SubcategoryModal';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  subcategories?: any[];
  subcategoryCount?: number;
  subcategoryDraftCounts?: number;
}



// ─── Category Card ──────────────────────────────────────────────────────────
interface CategoryCardProps {
  category: Category;
  isDraft: boolean;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onSubcategories: (cat: Category) => void;
  onPublish: (cat: Category) => void;
}

function CategoryCard({ category, isDraft, onEdit, onDelete, onSubcategories, onPublish }: CategoryCardProps) {
  return (
    <div
      className={`rounded-md border flex flex-col overflow-hidden transition-all group relative ${
        isDraft
          ? 'bg-white border-amber-200/70 shadow-sm hover:hover:border-amber-300'
          : 'bg-white border-gray-100 shadow-sm hover:shadow-sm hover:border-brand-100'
      }`}
    >
      {/* Floating Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        {isDraft ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-amber-50 text-slate-600 border border-amber-200/80 shadow-sm">
            <Clock size={9} /> Draft
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-slate-600 border border-emerald-200/80 shadow-sm">
            <CheckCircle2 size={9} /> Published
          </span>
        )}
      </div>

      {/* Status ribbon */}
      <div className={`h-1.5 w-full ${isDraft ? 'bg-amber-400' : 'bg-[#228b22]'}`} />

      {/* Body */}
      <div className="p-5 pt-8 flex flex-col items-center text-center flex-1">
        {/* Avatar */}
        <div
          className={`w-20 h-20 rounded-md overflow-hidden mb-4 ring-4 relative flex items-center justify-center text-white text-3xl font-black uppercase flex-shrink-0 ${
            isDraft
              ? 'bg-amber-400 ring-amber-50'
              : 'bg-[#228b22] ring-brand-50'
          }`}
        >
          {category.image ? (
            <Image src={category.image} alt={category.name} fill className="object-cover" />
          ) : (
            category.name.charAt(0)
          )}
        </div>

        {/* Name + desc */}
        <h3 className="font-bold text-slate-800 text-base line-clamp-2 w-full break-words min-h-[3rem] flex items-center justify-center">{category.name}</h3>
        {category.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2 w-full">{category.description}</p>
        )}

        {/* Badges */}
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {/* Subcategory Counts */}
          {!isDraft && (() => {
            const publishedCount = category.subcategoryCount ?? 0;
            const draftCount = category.subcategoryDraftCounts ?? 0;
            const totalSubcategories = publishedCount + draftCount;

            if (totalSubcategories === 0) {
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-100">
                  <Layers size={10} />
                  0 Subcategories
                </span>
              );
            }

            return (
              <>
                {publishedCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-brand-50 text-[#1c711c] border border-brand-100 animate-in fade-in duration-200">
                    <Layers size={10} />
                    {publishedCount} {publishedCount === 1 ? 'Subcategory' : 'Subcategories'}
                  </span>
                )}
                {draftCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-slate-600 border border-amber-200 animate-in fade-in duration-200">
                    <Clock size={10} />
                    {draftCount} {draftCount === 1 ? 'Draft Sub' : 'Draft Subs'}
                  </span>
                )}
              </>
            );
          })()}

          {/* No image warning for draft */}
          {isDraft && !category.image && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-50 text-slate-500 border border-red-100 animate-in fade-in duration-200">
              <AlertCircle size={10} /> No Image
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={`px-4 py-3 border-t flex flex-col gap-2 ${isDraft ? 'bg-amber-50/40 border-amber-100' : 'bg-gray-50/50 border-gray-100'}`}>
        {isDraft ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onPublish(category); }}
              className="w-full bg-[#228b22] hover:bg-[#1c711c] text-white py-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm "
            >
              <Upload size={13} />
              Publish Category
            </button>
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(category); }}
                className="flex-1 bg-white border border-blue-200 text-slate-600 hover:bg-blue-50 py-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <Edit size={13} /> Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
                className="flex-1 bg-white border border-gray-200 text-gray-400 hover:text-slate-900 hover:border-red-200 hover:bg-red-50 py-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <Trash2 size={13} /> Delete Draft
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onSubcategories(category); }}
              className="flex-1 bg-white border border-brand-200 text-[#1c711c] hover:bg-brand-50 py-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-1"
              title="Manage Subcategories"
            >
              <Layers size={13} /> Subcategories
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(category); }}
              className="flex-1 bg-white border border-blue-200 text-slate-600 hover:bg-blue-50 py-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-1"
              title="Edit Category"
            >
              <Edit size={13} /> Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
              className="flex-none bg-white border border-gray-200 text-gray-400 hover:text-slate-900 hover:border-red-200 hover:bg-red-50 p-2 rounded-md transition"
              title="Delete Category"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({
  title, count, icon, accent,
}: { title: string; count: number; icon: React.ReactNode; accent: string }) {
  return (
    <div className={`flex items-center gap-3 mb-4`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <h3 className="font-black text-slate-700 text-base tracking-tight">{title}</h3>
      <span className={`ml-1 text-xs font-bold px-2.5 py-0.5 rounded-md ${accent.replace('text-white', 'text-opacity-80')}`}>
        {count}
      </span>
    </div>
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────────────
export default function CategoriesModal({ isOpen, onClose }: CategoriesModalProps) {
  const user = useAppSelector(state => state.auth.user);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Role-based filtering is handled server-side via the JWT Bearer token
      const res = await categoryApi.getCategories({ limit: 100 });


      let data: any[] = [];
      if (res?.data && Array.isArray(res.data)) {
        data = res.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res?.data?.categories && Array.isArray(res.data.categories)) {
        data = res.data.categories;
      } else if (res?.data?.docs && Array.isArray(res.data.docs)) {
        data = res.data.docs;
      }

      const formatted: Category[] = data.map((item: any) => ({
        id: String(item.id || item._id || item.categoryId || item.uuid),
        name: item.name || item.title || item.displayName || 'Unknown Category',
        description: item.description || '',
        image: item.imageUrl || item.image || '',
        isActive: Boolean(item.isActive ?? item.is_active ?? (item.status === 'published')),
        subcategories: item.subcategories || [],
        subcategoryCount: item.subcategoryCount ?? (Array.isArray(item.subcategories) ? item.subcategories.length : 0),
        subcategoryDraftCounts: item.subcategoryDraftCounts ?? item.subcategoryDraftCount ?? 0,
      }));

      setCategories(formatted);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load categories.');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setSearchQuery('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Filtered + split ─────────────────────────────────────────────────────
  const { published, drafts } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = q
      ? categories.filter(c =>
          c.name.toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q)
        )
      : categories;
    return {
      published: filtered.filter(c => c.isActive),
      drafts: filtered.filter(c => !c.isActive),
    };
  }, [categories, searchQuery]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await categoryApi.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setDeletingId(null);
      toast.success('Category deleted successfully');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete category');
      toast.error(apiError.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = (cat: Category) => { setEditingCategory(cat); setIsFormOpen(true); };
  const openSubcategories = (cat: Category) => { setViewingCategory(cat); setIsSubcategoryModalOpen(true); };

  const handlePublishDirectly = async (cat: Category) => {
    if (!cat.image) {
      toast.error('Please upload an image before publishing this category. Click Edit to add an image.');
      return;
    }
    const toastId = toast.loading('Publishing category…');
    setIsLoading(true);
    try {
      await categoryApi.publishCategory(cat.id);
      toast.success('Category published successfully!', { id: toastId });
      fetchCategories();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to publish category.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalFiltered = published.length + drafts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 dashboard-dialog-overlay">
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[3px] " onClick={onClose} />
      <div className="relative w-full bg-white flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 dashboard-dialog dashboard-dialog--large" role="dialog" aria-modal="true" aria-labelledby="CategoriesModal-dialog-0-title">

        {/* ── Header ── */}
        <div className="flex flex-col items-start justify-between px-6 py-4 border-b bg-gray-50/50 flex-shrink-0 sm:flex-row sm:items-center dashboard-dialog-header">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight" id="CategoriesModal-dialog-0-title">All Categories</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              {published.length} published · {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditingCategory(null); setIsFormOpen(true); }}
              className="bg-[#228b22] hover:bg-[#1c711c] text-white px-4 py-2.5 rounded-md font-bold flex items-center gap-2 transition-all shadow-sm whitespace-nowrap text-sm"
            >
              <Plus size={17} /> New Category
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-md transition dashboard-dialog-close" aria-label="Close dialog" type="button">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="px-6 py-3 border-b bg-white flex-shrink-0">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search categories by name or description…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 text-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 focus:border-[#228b22] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-500 mt-2 ml-1">
              {totalFiltered === 0
                ? 'No categories match your search.'
                : `Showing ${totalFiltered} result${totalFiltered === 1 ? '' : 's'} for "${searchQuery}"`}
            </p>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA] space-y-8 dashboard-dialog-body">

          {error && (
            <div className="p-4 bg-red-50 text-slate-600 border border-red-200 rounded-md font-medium text-sm flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" /> {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#228b22]" />
                <p className="text-sm text-gray-500 font-medium">Loading categories…</p>
              </div>
            </div>
          ) : totalFiltered === 0 && searchQuery ? (
            <div className="text-center py-20 bg-white rounded-md border border-dashed border-gray-200">
              <Search size={36} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No results found</h3>
              <p className="text-gray-400 text-sm mt-1">Try a different search term.</p>
            </div>
          ) : (
            <>
              {/* ── Published Section ── */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[#228b22] flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <h3 className="font-black text-slate-700 text-base tracking-tight">Published Categories</h3>
                  <span className="ml-1 text-xs font-bold px-2.5 py-0.5 rounded-md bg-brand-100 text-[#1c711c]">
                    {published.length}
                  </span>
                </div>

                {published.length === 0 ? (
                  <div className="flex items-center gap-3 px-5 py-4 bg-white rounded-md border border-dashed border-gray-200 text-gray-400 text-sm">
                    <Layers size={18} className="flex-shrink-0" />
                    {searchQuery ? 'No published categories match your search.' : 'No published categories yet. Add and publish a category to make it visible.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {published.map(cat => (
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        isDraft={false}
                        onEdit={openEdit}
                        onDelete={(id) => setDeletingId(id)}
                        onSubcategories={openSubcategories}
                        onPublish={() => {}} // not needed for published
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* ── Divider ── */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#F8F9FA] px-4 text-xs text-gray-400 font-bold uppercase tracking-widest">
                    {drafts.length === 1 ? 'Draft Category' : 'Draft Categories'}
                  </span>
                </div>
              </div>

              {/* ── Drafts Section ── */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-white" />
                  </div>
                  <h3 className="font-black text-slate-700 text-base tracking-tight">
                    {drafts.length === 1 ? 'Draft Category' : 'Draft Categories'}
                  </h3>
                  <span className="ml-1 text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-slate-600">
                    {drafts.length}
                  </span>
                  <span className="text-xs text-gray-400 font-medium ml-1">
                    · Upload an image to publish
                  </span>
                </div>

                {drafts.length === 0 ? (
                  <div className="flex items-center gap-3 px-5 py-4 bg-white rounded-md border border-dashed border-amber-200 text-slate-400 text-sm">
                    <Clock size={18} className="flex-shrink-0" />
                    {searchQuery ? 'No draft categories match your search.' : 'No draft categories. All categories are published!'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {drafts.map(cat => (
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        isDraft={true}
                        onEdit={openEdit}
                        onDelete={(id) => setDeletingId(id)}
                        onSubcategories={openSubcategories}
                        onPublish={handlePublishDirectly}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {/* ── Delete Confirmation ── */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 dashboard-dialog-overlay">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px] " onClick={() => setDeletingId(null)} />
          <div className="relative w-full bg-white p-6 animate-in zoom-in-95 duration-200 dashboard-dialog dashboard-dialog--compact dashboard-dialog--padded" role="dialog" aria-modal="true" aria-labelledby="CategoriesModal-dialog-1-title">
            <div className="w-12 h-12 rounded-md bg-red-100 flex items-center justify-center mx-auto mb-4  dashboard-dialog-icon">
              <Trash2 size={22} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 text-center" id="CategoriesModal-dialog-1-title">Delete Category?</h3>
            <p className="text-gray-500 text-sm mb-6 text-center">
              This will permanently delete the category and all its data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 border border-gray-200 text-slate-700 font-bold rounded-md hover:bg-gray-50 transition disabled:opacity-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Category Form (Add/Edit) — for published categories only ── */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingCategory(null); }}
        editingCategory={editingCategory}
        onSuccess={fetchCategories}
      />

      {/* ── Subcategories Modal ── */}
      {viewingCategory && (
        <SubcategoryModal
          isOpen={isSubcategoryModalOpen}
          onClose={() => { setIsSubcategoryModalOpen(false); setViewingCategory(null); }}
          category={viewingCategory}
          onSubcategoryUpdate={fetchCategories}
        />
      )}
    </div>
  );
}
