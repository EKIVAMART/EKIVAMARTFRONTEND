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
import PublishCategoryModal from './PublishCategoryModal';

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
  onPublish: (id: string) => void;
}

function CategoryCard({ category, isDraft, onEdit, onDelete, onSubcategories, onPublish }: CategoryCardProps) {
  return (
    <div
      className={`rounded-2xl border flex flex-col overflow-hidden transition-all group relative ${
        isDraft
          ? 'bg-white border-amber-200/70 shadow-sm hover:shadow-amber-100 hover:border-amber-300'
          : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-fuchsia-100'
      }`}
    >
      {/* Floating Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        {isDraft ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200/80 shadow-sm">
            <Clock size={9} /> Draft
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-sm">
            <CheckCircle2 size={9} /> Published
          </span>
        )}
      </div>

      {/* Status ribbon */}
      <div className={`h-1.5 w-full ${isDraft ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-gradient-to-r from-[#c800ff] to-[#912cad]'}`} />

      {/* Body */}
      <div className="p-5 pt-8 flex flex-col items-center text-center flex-1">
        {/* Avatar */}
        <div
          className={`w-20 h-20 rounded-full overflow-hidden mb-4 ring-4 relative flex items-center justify-center text-white text-3xl font-black uppercase flex-shrink-0 ${
            isDraft
              ? 'bg-gradient-to-br from-amber-400 to-yellow-300 ring-amber-50'
              : 'bg-gradient-to-br from-[#c800ff] to-[#912cad] ring-fuchsia-50'
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
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-100">
                  <Layers size={10} />
                  0 Subcategories
                </span>
              );
            }

            return (
              <>
                {publishedCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-fuchsia-50 text-[#912cad] border border-fuchsia-100 animate-in fade-in duration-200">
                    <Layers size={10} />
                    {publishedCount} {publishedCount === 1 ? 'Subcategory' : 'Subcategories'}
                  </span>
                )}
                {draftCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 animate-in fade-in duration-200">
                    <Clock size={10} />
                    {draftCount} {draftCount === 1 ? 'Draft Sub' : 'Draft Subs'}
                  </span>
                )}
              </>
            );
          })()}

          {/* No image warning for draft */}
          {isDraft && !category.image && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 animate-in fade-in duration-200">
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
              onClick={(e) => { e.stopPropagation(); onPublish(category.id); }}
              className="w-full bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-fuchsia-100"
            >
              <Upload size={13} />
              {category.image ? 'Publish Category' : 'Upload Image & Publish'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
              className="w-full bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <Trash2 size={13} /> Delete Draft
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onSubcategories(category); }}
              className="flex-1 bg-white border border-fuchsia-200 text-[#912cad] hover:bg-fuchsia-50 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              title="Manage Subcategories"
            >
              <Layers size={13} /> Subcategories
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(category); }}
              className="flex-1 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              title="Edit Category"
            >
              <Edit size={13} /> Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
              className="flex-none bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 p-2 rounded-xl transition"
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
      <span className={`ml-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${accent.replace('text-white', 'text-opacity-80')}`}>
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
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishingCategory, setPublishingCategory] = useState<Category | null>(null);

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
  const openPublish = (cat: Category) => { setPublishingCategory(cat); setIsPublishModalOpen(true); };

  if (!isOpen) return null;

  const totalFiltered = published.length + drafts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/50 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">All Categories</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              {published.length} published · {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditingCategory(null); setIsFormOpen(true); }}
              className="bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-100 whitespace-nowrap text-sm"
            >
              <Plus size={17} /> New Category
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-xl transition">
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
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c800ff]/20 focus:border-[#c800ff] transition"
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
        <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA] space-y-8">

          {error && (
            <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium text-sm flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" /> {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c800ff]" />
                <p className="text-sm text-gray-500 font-medium">Loading categories…</p>
              </div>
            </div>
          ) : totalFiltered === 0 && searchQuery ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Search size={36} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No results found</h3>
              <p className="text-gray-400 text-sm mt-1">Try a different search term.</p>
            </div>
          ) : (
            <>
              {/* ── Published Section ── */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c800ff] to-[#912cad] flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <h3 className="font-black text-slate-700 text-base tracking-tight">Published Categories</h3>
                  <span className="ml-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-fuchsia-100 text-[#912cad]">
                    {published.length}
                  </span>
                </div>

                {published.length === 0 ? (
                  <div className="flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-white" />
                  </div>
                  <h3 className="font-black text-slate-700 text-base tracking-tight">
                    {drafts.length === 1 ? 'Draft Category' : 'Draft Categories'}
                  </h3>
                  <span className="ml-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-600">
                    {drafts.length}
                  </span>
                  <span className="text-xs text-gray-400 font-medium ml-1">
                    · Upload an image to publish
                  </span>
                </div>

                {drafts.length === 0 ? (
                  <div className="flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-dashed border-amber-200 text-amber-400 text-sm">
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
                        onPublish={() => openPublish(cat)}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeletingId(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">Delete Category?</h3>
            <p className="text-gray-500 text-sm mb-6 text-center">
              This will permanently delete the category and all its data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
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

      {/* ── Publish Modal (also handles image upload for drafts) ── */}
      <PublishCategoryModal
        isOpen={isPublishModalOpen}
        onClose={() => { setIsPublishModalOpen(false); setPublishingCategory(null); }}
        categoryId={publishingCategory?.id ?? null}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
