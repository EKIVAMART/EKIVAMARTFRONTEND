'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Check } from 'lucide-react';
import { categoryApi, ApiError } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Category } from './CategoriesModal';

interface SubcategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  onSubcategoryUpdate: () => void;
}

interface Subcategory {
  id: string;
  name: string;
  isActive: boolean;
}

export default function SubcategoryModal({ isOpen, onClose, category, onSubcategoryUpdate }: SubcategoryModalProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');


  // Add new state
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && category.id) {
      fetchSubcategories();
    }
  }, [isOpen, category]);

  const fetchSubcategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res: any = await categoryApi.getSubcategories(category.id);

      let rawData: any[] = [];
      if (Array.isArray(res)) {
        rawData = res;
      } else if (res?.data && Array.isArray(res.data)) {
        rawData = res.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        rawData = res.data.data;
      } else if (res?.data?.children && Array.isArray(res.data.children)) {
        rawData = res.data.children;
      } else if (res?.children && Array.isArray(res.children)) {
        rawData = res.children;
      }

      let formatted = rawData.map((s: any) => ({
        id: String(s.id || s._id || s.uuid),
        name: s.name || s.title || 'Unknown',
        isActive: Boolean(s.isActive ?? s.is_active ?? (s.status === 'published'))
      }));

      setSubcategories(formatted);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load subcategories.');
      setSubcategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) return;

    setIsAdding(true);
    setError('');
    try {
      await categoryApi.createCategory({
        name: newSubcategoryName.trim(),
        parentId: category.id
      });
      setNewSubcategoryName('');
      await fetchSubcategories();
      onSubcategoryUpdate();
      toast.success('Subcategory created successfully!');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to add subcategory');
      toast.error(apiError.message || 'Failed to add subcategory');
    } finally {
      setIsAdding(false);
    }
  };

  const startEditing = (sub: Subcategory) => {
    setEditingId(sub.id);
    setEditName(sub.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    setIsSavingEdit(true);
    setError('');
    try {
      await categoryApi.updateCategory(editingId, { name: editName.trim() });
      setEditingId(null);
      await fetchSubcategories();
      onSubcategoryUpdate();
      toast.success('Subcategory updated successfully!');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update subcategory');
      toast.error(apiError.message || 'Failed to update subcategory');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setError('');
    try {
      await categoryApi.deleteCategory(id);
      await fetchSubcategories();
      onSubcategoryUpdate();
      toast.success('Subcategory deleted successfully!');
      setDeletingId(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete subcategory');
      toast.error(apiError.message || 'Failed to delete subcategory');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = async (id: string) => {
    setError('');
    try {
      await categoryApi.publishCategory(id);
      await fetchSubcategories();
      onSubcategoryUpdate();
      toast.success('Subcategory published successfully!');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to publish subcategory');
      toast.error(apiError.message || 'Failed to publish subcategory');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[3px] " onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Subcategories</h2>
            <p className="text-sm text-[#1c711c] font-bold mt-1 bg-brand-50 px-2 py-0.5 rounded inline-block">
              {category.name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-md transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-slate-600 border border-red-200 rounded-lg font-medium text-sm">
              {error}
            </div>
          )}

          {/* Add Form */}
          <form onSubmit={handleAdd} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              placeholder="New subcategory name..."
              className="flex-1 border border-gray-200 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 focus:border-[#228b22] transition"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding || !newSubcategoryName.trim()}
              className="bg-[#228b22] hover:bg-[#1c711c] text-white px-4 py-2.5 rounded-md font-bold transition flex items-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm "
            >
              {isAdding ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Plus size={16} /> Add</>
              )}
            </button>
          </form>

          {/* List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#228b22]"></div>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-md border border-gray-200 border-dashed">
              <p className="text-gray-500 font-medium">No subcategories found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {subcategories.map(sub => (
                <div key={sub.id} className="bg-white border border-gray-100 rounded-md p-3 flex items-center justify-between shadow-sm group">
                  {editingId === sub.id ? (
                    <div className="flex-1 flex gap-2 mr-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        className="flex-1 border border-[#228b22]/30 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#228b22]/20"
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <button
                        onClick={saveEdit}
                        disabled={isSavingEdit || !editName.trim()}
                        className="bg-[#228b22] text-white p-2 rounded-lg hover:bg-[#1c711c] transition disabled:opacity-50"
                      >
                        {isSavingEdit ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-100 text-gray-500 p-2 rounded-lg hover:bg-gray-200 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700 text-sm">{sub.name}</span>
                        {!sub.isActive && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-slate-600 border border-amber-200">
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!sub.isActive ? (
                          <button
                            onClick={() => handlePublish(sub.id)}
                            className="text-xs font-bold px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-slate-600 border border-emerald-200/80 rounded-md transition-all flex items-center gap-1.5"
                          >
                            <Check size={14} /> Publish
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(sub)}
                              className="p-2 text-slate-600 hover:text-slate-900 bg-blue-50 hover:bg-blue-100 rounded-md transition border border-blue-100/50 flex items-center justify-center"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setDeletingId(sub.id)}
                              className="p-2 text-slate-600 hover:text-slate-900 bg-red-50 hover:bg-red-100 rounded-md transition border border-red-100/50 flex items-center justify-center"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Subcategory Delete Confirmation ── */}
      {deletingId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px] " onClick={() => setDeletingId(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-md bg-red-100 flex items-center justify-center mx-auto mb-4 ">
              <Trash2 size={22} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">Delete Subcategory?</h3>
            <p className="text-gray-500 text-sm mb-6 text-center">
              This will permanently delete the subcategory. This action cannot be undone.
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
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60 -subtle"
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
    </div>
  );
}
