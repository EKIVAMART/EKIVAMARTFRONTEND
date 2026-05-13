'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Check } from 'lucide-react';
import { categoryApi, ApiError } from '@/lib/api';
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
}

export default function SubcategoryModal({ isOpen, onClose, category, onSubcategoryUpdate }: SubcategoryModalProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fallbackSubcategories: Subcategory[] = [
    { id: 'sub-f1', name: 'Sample Subcategory 1' },
    { id: 'sub-f2', name: 'Sample Subcategory 2' },
    { id: 'sub-f3', name: 'Sample Subcategory 3' },
  ];
  
  // Add new state
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && category.id) {
      fetchSubcategories();
    }
  }, [isOpen, category]);

  const fetchSubcategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await categoryApi.getSubcategories(category.id);
      
      let data: any[] = [];
      if (res?.data && Array.isArray(res.data)) {
        data = res.data;
      } else if (res?.data?.subcategories && Array.isArray(res.data.subcategories)) {
        data = res.data.subcategories;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }

      let formatted = data.map((s: any) => ({
        id: String(s.id || s._id || s.uuid),
        name: s.name || s.title || 'Unknown'
      }));

      if (formatted.length === 0) {
        formatted = fallbackSubcategories;
      }
      
      setSubcategories(formatted);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load subcategories. Showing fallback data.');
      setSubcategories(fallbackSubcategories);
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
      await categoryApi.createSubcategory(category.id, { name: newSubcategoryName.trim() });
      setNewSubcategoryName('');
      await fetchSubcategories();
      onSubcategoryUpdate();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to add subcategory');
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
      await categoryApi.updateSubcategory(category.id, editingId, { name: editName.trim() });
      setEditingId(null);
      await fetchSubcategories();
      onSubcategoryUpdate();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update subcategory');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError('');
    try {
      await categoryApi.deleteSubcategory(category.id, id);
      await fetchSubcategories();
      onSubcategoryUpdate();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete subcategory');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Subcategories</h2>
            <p className="text-sm text-[#912cad] font-bold mt-1 bg-fuchsia-50 px-2 py-0.5 rounded inline-block">
              {category.name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-xl transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium text-sm">
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
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c800ff]/20 focus:border-[#c800ff] transition"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding || !newSubcategoryName.trim()}
              className="bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] text-white px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-fuchsia-100"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c800ff]"></div>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-200 border-dashed">
              <p className="text-gray-500 font-medium">No subcategories found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {subcategories.map(sub => (
                <div key={sub.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between shadow-sm group">
                  {editingId === sub.id ? (
                    <div className="flex-1 flex gap-2 mr-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        className="flex-1 border border-[#c800ff]/30 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c800ff]/20"
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <button
                        onClick={saveEdit}
                        disabled={isSavingEdit || !editName.trim()}
                        className="bg-[#c800ff] text-white p-2 rounded-lg hover:bg-[#b500e6] transition disabled:opacity-50"
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
                      <span className="font-medium text-slate-700 text-sm">{sub.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(sub)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          disabled={deletingId === sub.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          {deletingId === sub.id ? (
                            <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
