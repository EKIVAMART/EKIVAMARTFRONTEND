'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { categoryApi, ApiError } from '@/lib/api';
import { Category } from './CategoriesModal';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Category | null;
  onSuccess: () => void;
}

export default function CategoryFormModal({ isOpen, onClose, editingCategory, onSuccess }: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setName(editingCategory.name);
        setDescription(editingCategory.description || '');
        setImagePreview(editingCategory.image || '');
        setImageFile(null);
      } else {
        setName('');
        setDescription('');
        setImagePreview('');
        setImageFile(null);
      }
      setError('');
      setIsLoading(false);
    }
  }, [isOpen, editingCategory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, { 
          name: name.trim(), 
          description: description.trim() 
        });

        if (imageFile) {
          await categoryApi.uploadCategoryImage(editingCategory.id, imageFile);
        }
      } else {
        await categoryApi.createCategory({ 
          name: name.trim(), 
          description: description.trim() 
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'An error occurred while saving the category');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/50">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-xl transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium text-sm">
              {error}
            </div>
          )}

          <form id="categoryForm" onSubmit={handleSubmit} className="space-y-6">

            {/* Image Upload - ONLY FOR EDITING */}
            {editingCategory && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category Image</label>
                <div 
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    imagePreview ? 'border-[#c800ff]/30 bg-fuchsia-50/50' : 'border-gray-200 hover:border-[#c800ff]/50 hover:bg-fuchsia-50/20'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="relative w-full max-w-[200px] aspect-square rounded-xl overflow-hidden shadow-md ring-4 ring-white mb-3">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                      <Upload size={24} />
                    </div>
                  )}
                  <p className="text-sm font-bold text-[#912cad]">Click to {imagePreview ? 'change' : 'upload'} image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG or WEBP (Max 2MB)</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg,image/png,image/webp" 
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">Category Name <span className="text-red-500">*</span></label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c800ff]/20 focus:border-[#c800ff] transition bg-white text-slate-800"
                placeholder="e.g., Electronics, Fashion"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c800ff]/20 focus:border-[#c800ff] transition bg-white text-slate-800 min-h-[100px]"
                placeholder="Brief description of the category..."
              />
            </div>

          </form>
        </div>

        <div className="p-6 border-t bg-gray-50/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-gray-100 transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="categoryForm"
            disabled={isLoading}
            className="flex-1 py-3 bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] text-white font-bold rounded-xl transition flex items-center justify-center shadow-lg shadow-fuchsia-100 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              editingCategory ? 'Save Changes' : 'Save as Draft'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
