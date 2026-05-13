'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Layers, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { categoryApi, ApiError } from '@/lib/api';
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
  subcategories?: any[];
  subcategoryCount?: number;
  status?: string;
}

const fallbackCategories: Category[] = [
  { id: 'f1', name: 'Electronics', description: 'Gadgets, phones, laptops, and tech accessories.', image: '', subcategoryCount: 5, status: 'published' },
  { id: 'f2', name: 'Fashion', description: 'Clothing, shoes, bags, and jewelry for all ages.', image: '', subcategoryCount: 12, status: 'published' },
  { id: 'f3', name: 'Home & Kitchen', description: 'Furniture, appliances, decor, and cookware.', image: '', subcategoryCount: 8, status: 'published' },
  { id: 'f4', name: 'Beauty', description: 'Skincare, makeup, and personal care products.', image: '', subcategoryCount: 6, status: 'draft' },
];

export default function CategoriesModal({ isOpen, onClose }: CategoriesModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishingCategoryId, setPublishingCategoryId] = useState<string | null>(null);

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
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

      const formattedCategories = data.map((item: any) => ({
        id: String(item.id || item._id || item.categoryId || item.uuid),
        name: item.name || item.title || item.displayName || 'Unknown Category',
        description: item.description || '',
        image: item.image || item.imageUrl || '',
        subcategories: item.subcategories || [],
        subcategoryCount: item.subcategoryCount ?? (Array.isArray(item.subcategories) ? item.subcategories.length : 0),
        status: item.status || (item.image ? 'published' : 'draft'),
      }));

      if (formattedCategories.length === 0) {
        setCategories(fallbackCategories);
      } else {
        setCategories(formattedCategories);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load categories. Showing fallback data.');
      setCategories(fallbackCategories);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await categoryApi.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setDeletingId(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsFormOpen(true);
  };

  const openSubcategories = (cat: Category) => {
    setViewingCategory(cat);
    setIsSubcategoryModalOpen(true);
  };

  const openPublish = (id: string) => {
    setPublishingCategoryId(id);
    setIsPublishModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">All Categories</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage your product categories and subcategories</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setEditingCategory(null);
                setIsFormOpen(true);
              }}
              className="bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-100 whitespace-nowrap"
            >
              <Plus size={18} /> Add New Category
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-xl transition">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c800ff]"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
              <div className="w-16 h-16 bg-fuchsia-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#c800ff]">
                <Layers size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Categories Found</h3>
              <p className="text-gray-500 mt-2">Start by adding your first category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map(category => {
                const isDraft = category.status === 'draft' || !category.image;
                return (
                <div key={category.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col relative">
                  
                  {isDraft && (
                    <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider z-10">
                      Draft
                    </div>
                  )}

                  <div className="p-5 flex flex-col items-center text-center relative border-b border-gray-50">
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-4 shadow-inner ring-4 ring-fuchsia-50 relative bg-gradient-to-r from-[#c800ff] to-[#912cad] flex items-center justify-center text-white text-3xl font-black uppercase">
                      {category.image ? (
                        <Image src={category.image} alt={category.name} fill className="object-cover" />
                      ) : (
                        category.name.charAt(0)
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg line-clamp-1 w-full">{category.name}</h3>
                    {category.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 w-full">{category.description}</p>
                    )}
                    <div className="mt-3 bg-fuchsia-50 text-[#912cad] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                      <Layers size={14} />
                      {category.subcategoryCount === 1 ? '1 Subcategory' : `${category.subcategoryCount || 0} Subcategories`}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50/50 flex flex-col gap-2 mt-auto">
                    {isDraft && (
                      <button 
                        onClick={() => openPublish(category.id)}
                        className="w-full bg-[#c800ff] text-white hover:bg-[#b500e6] py-2 rounded-lg text-sm font-bold transition flex items-center justify-center shadow-md shadow-fuchsia-100"
                      >
                        Publish
                      </button>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <button 
                        onClick={() => openSubcategories(category)}
                        className="flex-1 bg-white border border-gray-200 text-slate-700 hover:text-[#c800ff] hover:border-[#c800ff]/30 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => openEdit(category)}
                        className="flex-1 bg-white border border-gray-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button 
                        onClick={() => setDeletingId(category.id)}
                        className="flex-none bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 p-2 rounded-lg transition flex items-center justify-center"
                        title="Delete Category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                </div>
              )})}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeletingId(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Category?</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingId(null)} 
                className="flex-1 py-2.5 border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-gray-50 transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deletingId)} 
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal (Add/Edit) */}
      <CategoryFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        editingCategory={editingCategory}
        onSuccess={fetchCategories}
      />

      {/* Subcategories Modal */}
      {viewingCategory && (
        <SubcategoryModal
          isOpen={isSubcategoryModalOpen}
          onClose={() => setIsSubcategoryModalOpen(false)}
          category={viewingCategory}
          onSubcategoryUpdate={fetchCategories}
        />
      )}

      {/* Publish Category Modal */}
      <PublishCategoryModal
        isOpen={isPublishModalOpen}
        onClose={() => { setIsPublishModalOpen(false); setPublishingCategoryId(null); }}
        categoryId={publishingCategoryId}
        onSuccess={fetchCategories}
      />

    </div>
  );
}
