'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { categoryApi, ApiError, requestUploadUrls, uploadFileToStorage } from '@/lib/api';
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

  // Staged image (local file, not yet uploaded)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  // Currently saved image URL (from backend)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState('');

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
      setIsLoading(false);
      setIsPublishing(false);
    }
  }, [isOpen, editingCategory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Only JPEG, PNG, GIF, and WebP formats are supported');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  /**
   * Upload the staged image file to storage via signed URL.
   * Returns the public URL or null on failure.
   */
  const uploadStagedImage = async (file: File): Promise<string | null> => {
    try {
      const uploadItems = await requestUploadUrls([{
        fileName: file.name,
        mimeType: file.type as any,
        folder: 'categories',
        expiresIn: 3600,
        isPublic: true,
      }]);
      if (!uploadItems || !uploadItems[0]) return null;
      await uploadFileToStorage(uploadItems[0], file);
      return uploadItems[0].url;
    } catch {
      return null;
    }
  };

  const handleDeleteImage = async () => {
    if (!currentImageUrl || !editingCategory) return;

    setIsLoading(true);
    setError('');

    try {
      await categoryApi.deleteCategoryImage(editingCategory.id, currentImageUrl);
      setImagePreview('');
      setCurrentImageUrl('');
      setImageFile(null);
      toast.success('Image deleted successfully');
      onSuccess();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'An error occurred while deleting the image');
      toast.error(apiError.message || 'An error occurred while deleting the image');
    } finally {
      setIsLoading(false);
    }
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

    // For new categories, image is required
    if (!editingCategory && !imageFile) {
      setError('Category image is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (editingCategory) {
        // ── Update existing category ──────────────────────────────────────────
        const updateData: Parameters<typeof categoryApi.updateCategory>[1] = {
          name: name.trim(),
          description: description.trim(),
        };

        if (imageFile) {
          const publicUrl = await uploadStagedImage(imageFile);
          if (!publicUrl) {
            setError('Failed to upload the new image. Please try again.');
            setIsLoading(false);
            return;
          }
          updateData.image = { url: publicUrl, altText: name.trim() };
          setCurrentImageUrl(publicUrl);
          setImagePreview(publicUrl);
          setImageFile(null);
        }

        await categoryApi.updateCategory(editingCategory.id, updateData);
        toast.success('Category updated successfully');

      } else {
        // ── Create new category ───────────────────────────────────────────────
        // Upload image first (required)
        const publicUrl = await uploadStagedImage(imageFile!);
        if (!publicUrl) {
          setError('Failed to upload the category image. Please try again.');
          setIsLoading(false);
          return;
        }

        await categoryApi.createCategory({
          name: name.trim(),
          description: description.trim(),
          imageUrl: publicUrl,
        });

        toast.success('Category created successfully');
      }

      onSuccess();
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'An error occurred while saving the category');
      toast.error(apiError.message || 'An error occurred while saving the category');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishCategory = async () => {
    if (!editingCategory) return;

    // Must have an image (either existing or newly staged)
    if (!currentImageUrl && !imageFile) {
      setError('Category must have an image before publishing. Please upload an image first.');
      return;
    }

    setIsPublishing(true);
    setError('');

    try {
      // If there's a staged image, save it first
      if (imageFile) {
        const publicUrl = await uploadStagedImage(imageFile);
        if (!publicUrl) {
          setError('Failed to upload the image. Please try again.');
          setIsPublishing(false);
          return;
        }
        await categoryApi.updateCategory(editingCategory.id, {
          image: { url: publicUrl, altText: name.trim() },
        });
        setCurrentImageUrl(publicUrl);
        setImagePreview(publicUrl);
        setImageFile(null);
      }

      await categoryApi.publishCategory(editingCategory.id);
      setIsPublished(true);
      toast.success('Category published successfully!');
      onSuccess();
      onClose();
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
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[3px] " onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            {isPublished && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">
                <CheckCircle size={14} />
                Published
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-md transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-slate-600 border border-red-200 rounded-md font-medium text-sm flex items-start gap-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form id="categoryForm" onSubmit={handleSubmit} className="space-y-6">

            {/* ── Image Upload (always shown — required on create) ── */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Category Image
                {!editingCategory && <span className="text-slate-500"> *</span>}
                {editingCategory && !currentImageUrl && <span className="text-slate-500"> *</span>}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  {editingCategory ? '(required to publish)' : '(required)'}
                </span>
              </label>

              <div
                className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  imagePreview
                    ? 'border-[#228b22]/30 bg-brand-50/50'
                    : 'border-gray-200 hover:border-[#228b22]/50 hover:bg-brand-50/20'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="w-full">
                    <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-md overflow-hidden shadow-sm ring-4 ring-white mb-3">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="text-xs font-bold text-[#1c711c] hover:text-[#228b22] px-3 py-1 border border-[#228b22]/30 rounded-lg hover:bg-brand-50 transition"
                      >
                        Click to change image
                      </button>
                      {editingCategory && currentImageUrl && !imageFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage();
                          }}
                          disabled={isLoading}
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                        >
                          Delete Image
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mb-3 text-gray-400">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-bold text-[#1c711c]">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF or WebP (Max 10MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* ── Name ── */}
            <div>
              <label htmlFor="catName" className="block text-sm font-bold text-slate-700 mb-2">
                Category Name <span className="text-slate-500">*</span>
              </label>
              <input
                id="catName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 focus:border-[#228b22] transition bg-white text-slate-800"
                placeholder="e.g., Electronics, Fashion"
                required
              />
            </div>

            {/* ── Description ── */}
            <div>
              <label htmlFor="catDesc" className="block text-sm font-bold text-slate-700 mb-2">
                Description <span className="text-slate-500">*</span>
              </label>
              <textarea
                id="catDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 focus:border-[#228b22] transition bg-white text-slate-800 min-h-[100px]"
                placeholder="Brief description of the category..."
                required
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50/50 flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 text-slate-700 font-bold rounded-md hover:bg-gray-100 transition disabled:opacity-50"
            disabled={isLoading || isPublishing}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="categoryForm"
            disabled={isLoading || isPublishing}
            className="flex-1 py-3 bg-[#228b22] hover:bg-[#1c711c] text-white font-bold rounded-md transition flex items-center justify-center shadow-sm disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              editingCategory ? 'Save Changes' : 'Create Category'
            )}
          </button>

          {/* Publish — only for existing draft categories, no popup */}
          {editingCategory && !isPublished && (
            <button
              type="button"
              onClick={handlePublishCategory}
              disabled={isLoading || isPublishing}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-md transition flex items-center justify-center shadow-sm disabled:opacity-70"
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
