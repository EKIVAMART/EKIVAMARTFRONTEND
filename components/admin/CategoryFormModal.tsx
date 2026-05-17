'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
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
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setName(editingCategory.name);
        setDescription(editingCategory.description || '');
        setImagePreview(editingCategory.image || '');
        setCurrentImageUrl(editingCategory.image || '');
        setImageFile(null);
        setIsPublished(editingCategory.isActive || false);
      } else {
        setName('');
        setDescription('');
        setImagePreview('');
        setCurrentImageUrl('');
        setImageFile(null);
        setIsPublished(false);
      }
      setError('');
      setSuccessMessage('');
      setIsLoading(false);
      setIsPublishing(false);
    }
  }, [isOpen, editingCategory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (10MB max as per documentation)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Only JPEG, PNG, GIF, and WebP formats are supported');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleDeleteImage = async () => {
    if (!currentImageUrl) return;
    
    setIsLoading(true);
    setError('');

    try {
      if (editingCategory) {
        await categoryApi.deleteCategoryImage(editingCategory.id, currentImageUrl);
        setImagePreview('');
        setCurrentImageUrl('');
        setImageFile(null);
        setIsPublished(false);
        setSuccessMessage('Image deleted successfully');
        toast.success('Image deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'An error occurred while deleting the image');
      toast.error(apiError.message || 'An error occurred while deleting the image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingCategory || !imageFile) return;

    setIsLoading(true);
    setError('');

    try {
      const uploadResponse = await categoryApi.uploadCategoryImage(
        editingCategory.id, 
        imageFile
      );
      const newImageUrl = uploadResponse?.data?.imageUrl;
      if (newImageUrl) {
        setCurrentImageUrl(newImageUrl);
        setImagePreview(newImageUrl);
      }
      setImageFile(null);
      setSuccessMessage('Image uploaded successfully');
      toast.success('Image uploaded successfully');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'An error occurred while uploading the image');
      toast.error(apiError.message || 'An error occurred while uploading the image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(currentImageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    if (!description.trim()) {
      setError('Category description is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (editingCategory) {
        // Update category metadata only
        await categoryApi.updateCategory(editingCategory.id, { 
          name: name.trim(), 
          description: description.trim() 
        });

        setSuccessMessage('Category info updated successfully');
        toast.success('Category info updated successfully');
      } else {
        // Create new category
        const createResponse = await categoryApi.createCategory({ 
          name: name.trim(), 
          description: description.trim() 
        });

        // Upload image if provided
        const newCategoryId = createResponse?.data?.id;
        if (imageFile && newCategoryId) {
          const uploadResponse = await categoryApi.uploadCategoryImage(
            newCategoryId, 
            imageFile
          );
          const newImageUrl = uploadResponse?.data?.imageUrl;
          if (newImageUrl) {
            setCurrentImageUrl(newImageUrl);
            setImagePreview(newImageUrl);
          }
          setSuccessMessage('Category created and image uploaded successfully');
          toast.success('Category created and image uploaded successfully');
        } else {
          setSuccessMessage('Category created successfully (image required to publish)');
          toast.success('Category created successfully');
        }

        // Update editingCategory state so publish button appears
        if (editingCategory === null) {
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
          return;
        }
      }

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'An error occurred while saving the category');
      toast.error(apiError.message || 'An error occurred while saving the category');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishCategory = async () => {
    if (!currentImageUrl) {
      setError('Category must have an image before publishing');
      return;
    }

    setIsPublishing(true);
    setError('');
    setSuccessMessage('');

    try {
      if (editingCategory) {
        await categoryApi.publishCategory(editingCategory.id);
        setIsPublished(true);
        setSuccessMessage('Category published successfully!');
        toast.success('Category published successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'An error occurred while publishing the category');
      toast.error(apiError.message || 'An error occurred while publishing the category');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            {isPublished && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                <CheckCircle size={14} />
                Published
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-xl transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium text-sm flex items-start gap-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 border border-green-200 rounded-xl font-medium text-sm flex items-start gap-3">
              <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
              {successMessage}
            </div>
          )}

          <form id="categoryForm" onSubmit={handleSubmit} className="space-y-6">

            {/* Image Upload - ONLY FOR EDITING */}
            {editingCategory && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Category Image
                  {!currentImageUrl && <span className="text-red-500"> *</span>}
                  <span className="text-xs font-normal text-gray-500 ml-1">(Required to publish)</span>
                </label>
                <div 
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    imagePreview ? 'border-[#c800ff]/30 bg-fuchsia-50/50' : 'border-gray-200 hover:border-[#c800ff]/50 hover:bg-fuchsia-50/20'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="w-full">
                      <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-xl overflow-hidden shadow-md ring-4 ring-white mb-3">
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      </div>
                      <div className="flex gap-2 justify-center">
                        {imageFile ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSaveImage}
                              disabled={isLoading}
                              className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg transition disabled:opacity-50 flex items-center gap-1"
                            >
                              <CheckCircle size={14} /> Save Image
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelImage}
                              disabled={isLoading}
                              className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              className="text-xs font-bold text-[#912cad] hover:text-[#c800ff] px-3 py-1 border border-[#c800ff]/30 rounded-lg hover:bg-fuchsia-50 transition"
                            >
                              Change Image
                            </button>
                            {currentImageUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteImage();
                                }}
                                disabled={isLoading}
                                className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                              >
                                Delete Image
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-bold text-[#912cad]">Click to upload image</p>
                      <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF or WebP (Max 10MB)</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg,image/png,image/gif,image/webp" 
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
              <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">Description <span className="text-red-500">*</span></label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c800ff]/20 focus:border-[#c800ff] transition bg-white text-slate-800 min-h-[100px]"
                placeholder="Brief description of the category..."
                required
              />
            </div>

          </form>
        </div>

        <div className="p-6 border-t bg-gray-50/50 flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
            disabled={isLoading || isPublishing}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="categoryForm"
            disabled={isLoading || isPublishing}
            className="flex-1 py-3 bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] text-white font-bold rounded-xl transition flex items-center justify-center shadow-lg shadow-fuchsia-100 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              editingCategory ? 'Save Changes' : 'Create Category'
            )}
          </button>

          {/* Publish Button - Only for existing categories with images and NOT yet published */}
          {editingCategory && currentImageUrl && !isPublished && (
            <button
              type="button"
              onClick={handlePublishCategory}
              disabled={isLoading || isPublishing}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl transition flex items-center justify-center shadow-lg shadow-green-100 disabled:opacity-70"
            >
              {isPublishing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Publish Category'
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
