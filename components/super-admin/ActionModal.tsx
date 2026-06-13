'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle, X, Check, Layers, DollarSign, Info, ChevronLeft, ChevronRight, Trash2, Zap, Image as ImageIcon, UploadCloud, GripVertical, CheckCircle2, Edit2 } from 'lucide-react';
import { categoryApi, productApi, requestUploadUrls, uploadFileToStorage } from '@/lib/api';
import { toast } from 'react-hot-toast';
import ImageUploadModal from './ImageUploadModal';

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export function categoryIncludesWeightAndDimensions(categoryName: string): boolean {
  if (!categoryName) return true; // Show weight & dimensions as fallback when no category is selected
  const normalized = categoryName.toLowerCase().trim();
  const whitelist = [
    'electronics',
    'home decor',
    'footwear',
    'bags',
    'toys and games',
    'sports',
    'furniture',
    'appliances',
    'luggage'
  ];
  return whitelist.some(item => normalized.includes(item));
}

export interface ProductFormData {
  id?: string;
  vendorId: string;
  name: string;
  preview: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice: number;
  discount?: number;
  costPerItem: number;
  currency: string;
  condition: string;
  stock: number;
  inStock: boolean;
  categoryId: string;
  subCategoryId: string;
  brand: string;
  colours: string[];
  sizes: string[];
  weight: number;
  dimensions: ProductDimensions;
  tags: string[];
  metadata: Record<string, any>;
  origin: string;        // Country of manufacture
  location: {            // Shipping location (ALL REQUIRED)
    town: string;
    state: string;
    lga: string;
  };
  returnWindow: string;
  whoPaysReturnShipping: string;
  returnConditions: string;
  warrantyPeriod: string;
  warrantyDetails: string;
  status: 'draft' | 'active' | 'published' | 'inactive' | 'out_of_stock' | 'discontinued';
  images?: ProductImage[];
  weightUnit?: string;
  dimensionsUnit?: string;
}

export interface ProductImage {
  key?: string;
  url: string;
  order: number;
  isPrimary?: boolean;
  alt?: string;
  file?: File;
}

export type EditableProduct = Partial<ProductFormData>;

export interface ProductCategoryOption {
  id: string;
  name: string;
  subcategories?: { id: string; name: string }[];
}

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'dashboard' | 'products' | 'vendors' | 'orders' | 'admins' | 'users';
  editingItem?: EditableProduct;
  categories?: ProductCategoryOption[];
  isLoadingCategories?: boolean;
  currentUserId?: string;
  onSave?: (data: ProductFormData) => void | Promise<void>;
}

type BackendValidationErrors =
  | Record<string, string[] | string>
  | Array<{ field?: string; message?: string }>;

const toNonNegativeInteger = (value: unknown) => {
  const numberValue = Math.floor(Number(value));
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
};

const fieldLabels: Record<string, string> = {
  categoryId: 'Product category',
  name: 'Product name',
  preview: 'Preview',
  description: 'Description',
  compareAtPrice: 'Original price',
  stock: 'Stock quantity',
  brand: 'Brand',
  sku: 'SKU',
};

const sentenceCase = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const humanizeField = (field?: string) => {
  if (!field) return 'Product details';
  const normalized = field.replace(/\[(\d+)\]/g, ' $1').split('.').pop() || field;
  return fieldLabels[normalized] || sentenceCase(normalized.replace(/([A-Z])/g, ' $1').trim());
};

const formatSaveError = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return ['Could not save this draft. Please review the product details and try again.'];
  }

  const apiError = error as {
    message?: unknown;
    errors?: BackendValidationErrors;
  };
  const messages: string[] = [];

  if (Array.isArray(apiError.errors)) {
    apiError.errors.forEach((item) => {
      const message = item.message?.trim();
      if (message) messages.push(`${humanizeField(item.field)}: ${message}`);
    });
  } else if (apiError.errors && typeof apiError.errors === 'object') {
    Object.entries(apiError.errors).forEach(([field, value]) => {
      const fieldMessages = Array.isArray(value) ? value : [value];
      fieldMessages.forEach((message) => {
        if (message) messages.push(`${humanizeField(field)}: ${message}`);
      });
    });
  }

  if (messages.length) return messages;

  if (typeof apiError.message === 'string' && apiError.message.trim()) {
    return [apiError.message.trim()];
  }

  return ['Could not save this draft. Please review the product details and try again.'];
};

const POPULAR_COLOURS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Grey', 'Gold', 'Silver'];
const POPULAR_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '64GB', '128GB', '256GB', '512GB', '1TB'];

const parseMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<u>$1</u>');
  html = html.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/g, '<u>$1</u>');

  const lines = html.split('\n');
  const outputLines: string[] = [];
  let inUl = false;
  let inOl = false;

  for (const line of lines) {
    const bulletMatch = line.match(/^- (.*)/);
    const numberedMatch = line.match(/^\d+\.\s+(.*)/);

    if (bulletMatch) {
      if (inOl) { outputLines.push('</ol>'); inOl = false; }
      if (!inUl) { outputLines.push('<ul style="list-style-type:disc;padding-left:1.5rem;margin:0.25rem 0">'); inUl = true; }
      outputLines.push(`<li style="padding-left:0.25rem">${bulletMatch[1]}</li>`);
    } else if (numberedMatch) {
      if (inUl) { outputLines.push('</ul>'); inUl = false; }
      if (!inOl) { outputLines.push('<ol style="list-style-type:decimal;padding-left:1.5rem;margin:0.25rem 0">'); inOl = true; }
      outputLines.push(`<li style="padding-left:0.25rem">${numberedMatch[1]}</li>`);
    } else {
      if (inUl) { outputLines.push('</ul>'); inUl = false; }
      if (inOl) { outputLines.push('</ol>'); inOl = false; }
      outputLines.push(line === '' ? '<br />' : `<p style="margin:0">${line}</p>`);
    }
  }
  if (inUl) outputLines.push('</ul>');
  if (inOl) outputLines.push('</ol>');

  return outputLines.join('');
};

const ChipSelector = ({
  label,
  selectedValues,
  onChange,
  popularOptions,
  placeholder,
}: {
  label: string;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  popularOptions: string[];
  placeholder: string;
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleToggle = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const val = inputValue.trim();
      if (!selectedValues.includes(val)) {
        onChange([...selectedValues, val]);
      }
      setInputValue('');
    }
  };

  const handleRemove = (val: string) => {
    onChange(selectedValues.filter(v => v !== val));
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-600 block">{label}</label>
      <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2 rounded-2xl border bg-white focus-within:ring-2 focus-within:ring-[#c800ff]/20 focus-within:border-[#c800ff] transition-all">
        {selectedValues.map((val, idx) => (
          <span key={`${val}-${idx}`} className="bg-[#f0e1f7] text-[#912cad] text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 animate-in zoom-in-95 duration-100">
            {val}
            <button type="button" onClick={() => handleRemove(val)} className="text-[#912cad] hover:text-red-500 transition">
              <X size={13} strokeWidth={3} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none flex-1 min-w-[100px] text-xs focus:!ring-0 focus:!border-transparent py-0.5"
          placeholder={placeholder}
        />
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider self-center mr-1">Popular:</span>
        {popularOptions.map(opt => {
          const isSelected = selectedValues.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleToggle(opt)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all ${isSelected
                ? 'bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white border-transparent shadow-sm'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const findCategory = (categories: ProductCategoryOption[], value: string) => {
  const normalizedValue = value.trim().toLowerCase();
  return categories.find((category) =>
    category.id === value || category.name.trim().toLowerCase() === normalizedValue
  );
};

export default function ActionModal({
  isOpen,
  onClose,
  activeTab,
  editingItem,
  categories = [],
  isLoadingCategories = false,
  currentUserId = '',
  onSave
}: ActionModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [stagedImages, setStagedImages] = useState<ProductImage[]>([]);
  const totalSteps = 4;

  const [formData, setFormData] = useState<ProductFormData>({
    id: '',
    vendorId: '',
    name: '',
    preview: '',
    description: '',
    sku: '',
    price: 0,
    compareAtPrice: 0,
    costPerItem: 0,
    currency: 'NGN',
    condition: 'new',
    stock: 0,
    inStock: true,
    categoryId: '',
    subCategoryId: '',
    brand: '',
    colours: [],
    sizes: [],
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    tags: [],
    metadata: {},
    origin: 'Nigeria',
    location: { town: '', state: '', lga: '' },
    returnWindow: 'Use Store Default',
    whoPaysReturnShipping: 'Use Store Default',
    returnConditions: '',
    warrantyPeriod: 'Use Store Default',
    warrantyDetails: '',
    status: 'draft',
    images: [],
    weightUnit: 'kg',
    dimensionsUnit: 'cm',
  });

  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [customFields, setCustomFields] = useState<Array<{ key: string, value: string }>>([]);
  const [tagInput, setTagInput] = useState('');
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [quickAddMode, setQuickAddMode] = useState(false);
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');
  const [seoExpanded, setSeoExpanded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Step 4 Image Management State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderImages, setReorderImages] = useState<ProductImage[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isImageActionLoading, setIsImageActionLoading] = useState(false);
  const [editingAltIndex, setEditingAltIndex] = useState<number | null>(null);
  const [altTextInput, setAltTextInput] = useState('');
  const [imageToDelete, setImageToDelete] = useState<ProductImage | null>(null);
  const [imageToReplace, setImageToReplace] = useState<{ file: File; preview: string; alt: string; order: number } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const replaceInputRef = React.useRef<HTMLInputElement>(null);

  const sortImages = (images: ProductImage[]): ProductImage[] => {
    if (!Array.isArray(images)) return [];
    return [...images].sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });
  };

  const QuickAddButton = () => (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes quick-add-shine {
          0% { left: -150%; }
          50% { left: 150%; }
          100% { left: 150%; }
        }
        @keyframes quick-add-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(45, 212, 191, 0.4), 0 0 15px rgba(200, 0, 255, 0.2); }
          50% { box-shadow: 0 0 20px rgba(45, 212, 191, 0.7), 0 0 30px rgba(200, 0, 255, 0.4); }
        }
        .animate-quick-shine {
          animation: quick-add-shine 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-quick-glow {
          animation: quick-add-glow 2.5s ease-in-out infinite;
        }
      `}} />
      <motion.button
        type="button"
        whileHover={{ scale: 1.06, y: -1 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setQuickAddMode(true)}
        className="relative overflow-hidden px-5 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white rounded-2xl text-xs font-black tracking-wider uppercase flex items-center gap-2 border border-teal-300/30 transition-all duration-300 animate-quick-glow shadow-lg shadow-teal-500/20"
      >
        <span className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 animate-quick-shine pointer-events-none" />
        <Zap size={14} className="text-emerald-50 fill-emerald-100/40 animate-bounce" />
        Quick Add
        <Layers size={14} className="text-emerald-50 fill-emerald-100/40 ml-0.5" />
      </motion.button>
    </>
  );

  const updateField = <Key extends keyof ProductFormData>(
    key: Key,
    value: ProductFormData[Key]
  ) => {
    setSaveErrors([]);
    setHasUnsavedChanges(true);
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateLocation = (field: 'town' | 'state' | 'lga', value: string) => {
    setSaveErrors([]);
    setHasUnsavedChanges(true);
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const clampDiscount = (val: string) => {
    const num = Number(val);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(99, num));
  };

  const generateSKU = () => {
    const cat = selectedCategory?.name ? selectedCategory.name.substring(0, 4).toUpperCase() : 'PROD';
    const namePart = formData.name ? formData.name.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') : 'ITEM';
    const random = Math.floor(1000 + Math.random() * 9000);
    const skuVal = `${cat}-${namePart}-${random}`;
    updateField('sku', skuVal);
  };

  const generateSEO = () => {
    const seoTitle = formData.name ? `${formData.name} | Buy Online` : '';
    const seoDescription = formData.preview || formData.description ? (formData.preview || formData.description).substring(0, 150) : '';
    updateMetadata('seoTitle', seoTitle);
    updateMetadata('seoDescription', seoDescription);
  };

  const saveData = async (statusOverride?: ProductFormData['status']) => {
    if (isSaving) return;
    
    setIsSaving(true);
    setSaveErrors([]);

    try {
      // ─── Step 4 Image Upload Flow ──────────────────────────────────────────
      // Collect all staged images that have local File objects (batch upload)
      const uploadedImages: Array<{ url: string; altText: string; isPrimary: boolean; order: number }> = [];
      const filesToUpload = stagedImages.filter(img => img.file);

      if (filesToUpload.length > 0) {
        setLoadingMessage(`Preparing for upload (${filesToUpload.length} image${filesToUpload.length > 1 ? 's' : ''})…`);
        // Batch-request all upload URLs in a single call
        const uploadRequests = filesToUpload.map(img => ({
          fileName: img.file!.name,
          mimeType: img.file!.type as any,
          folder: 'products' as const,
          expiresIn: 3600,
          isPublic: true,
        }));

        const uploadResults = await requestUploadUrls(uploadRequests);

        if (!uploadResults || uploadResults.length !== filesToUpload.length) {
          throw new Error('Failed to request upload URLs for all images.');
        }

        // Upload each file to its signed URL
        for (let i = 0; i < filesToUpload.length; i++) {
          const img = filesToUpload[i];
          const result = uploadResults[i];
          setLoadingMessage(`Uploading image ${i + 1} of ${filesToUpload.length}…`);
          try {
            await uploadFileToStorage(result, img.file!);
          } catch (err) {
            toast.error(`Failed to upload image: ${img.file!.name}`);
            throw err;
          }
          // Use the returned url from uploadResult
          const globalIdx = stagedImages.indexOf(img);
          uploadedImages.push({
            url: result.url,
            altText: img.alt || formData.name,
            isPrimary: img.isPrimary || false,
            order: globalIdx,
          });
        }
      }

      // Add already-uploaded images (no File object)
      stagedImages.forEach((img, i) => {
        if (!img.file) {
          uploadedImages.push({
            url: img.url,
            altText: img.alt || formData.name,
            isPrimary: img.isPrimary || false,
            order: i,
          });
        }
      });

      // Re-sort by original order index
      uploadedImages.sort((a, b) => a.order - b.order);
      // Re-index orders to 0..n
      uploadedImages.forEach((img, i) => { img.order = i; });

      // ─── Construct Payload ─────────────────────────────────────────────────
      const customObj: Record<string, string> = {};
      customFields.forEach(f => {
        if (f.key.trim() && f.value.trim()) {
          customObj[f.key.trim()] = f.value.trim();
        }
      });

      setLoadingMessage(editingItem ? 'Updating product…' : 'Creating product draft…');

      const finalData = {
        ...formData,
        images: uploadedImages as any,
        discount: discountPercent,
        stock: toNonNegativeInteger(formData.stock),
        status: statusOverride || formData.status,
        metadata: {
          ...formData.metadata,
          customAttributes: customObj
        }
      };

      await onSave?.(finalData as any);
      toast.success(editingItem ? 'Product updated successfully!' : 'Product created successfully!');
      closeModalAndReset();
    } catch (error: any) {
      setSaveErrors(formatSaveError(error));
    } finally {
      setIsSaving(false);
      setLoadingMessage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddMode && currentStep < totalSteps) {
      nextStep();
      return;
    }
    void saveData();
  };

  const renderQuickAddForm = () => (
    <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 min-h-0 bg-white">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-teal-400 to-teal-600 rounded-lg text-white">
          <Plus size={22} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">Quick Add Form</h3>
          <p className="text-xs text-gray-500">Provide the required core product details to instantly create your product draft.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Product Name <span className="text-[#c800ff] ml-1">*</span></label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm font-semibold"
            required
            placeholder="e.g. Vintage Leather Jacket"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Product Category <span className="text-[#c800ff] ml-1">*</span></label>
          <select
            value={selectedCategoryValue}
            onChange={e => {
              updateField('categoryId', e.target.value);
              updateField('subCategoryId', ''); // Clear subcategory on change
            }}
            className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm font-medium"
            required
            disabled={isLoadingCategories}
          >
            <option value="">
              {isLoadingCategories ? 'Loading categories...' : 'Select category'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Sub Category <span className="text-[#c800ff] ml-1">*</span></label>
          <select
            value={formData.subCategoryId}
            onChange={e => updateField('subCategoryId', e.target.value)}
            className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm font-medium"
            required
            disabled={isLoadingSubcategories || !formData.categoryId}
          >
            <option value="">
              {!formData.categoryId
                ? 'Please select a category first'
                : isLoadingSubcategories
                  ? 'Loading subcategories...'
                  : 'Select subcategory'
              }
            </option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Price (₦) <span className="text-[#c800ff] ml-1">*</span></label>
          <input
            type="number"
            value={formData.compareAtPrice || ''}
            onChange={(e) => updateField('compareAtPrice', Number(e.target.value))}
            className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm font-bold"
            required
            placeholder="Price"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Stock Quantity <span className="text-[#c800ff] ml-1">*</span></label>
          <input
            type="number"
            min="0"
            step="1"
            value={formData.stock || ''}
            onChange={(e) => updateField('stock', toNonNegativeInteger(e.target.value))}
            className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm font-semibold"
            required
            placeholder="Available stock"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-600 mb-1.5 block">Preview / Short Summary <span className="text-[#c800ff] ml-1">*</span></label>
        <textarea
          value={formData.preview}
          onChange={e => updateField('preview', e.target.value)}
          rows={2}
          className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm resize-y"
          required
          placeholder="Brief description for search listings..."
        />
      </div>

      <div>
        <label className="text-xs font-bold text-gray-600 mb-1.5 block">Full Description <span className="text-[#c800ff] ml-1">*</span></label>
        <div className="border rounded-2xl overflow-hidden bg-[#F0F7F8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#E0F2F3] transition-all">
          <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => applyFormat('bold')} className="px-3 py-1.5 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition"><b>B</b></button>
              <button type="button" onClick={() => applyFormat('italic')} className="px-3 py-1.5 hover:bg-gray-200 rounded-lg text-xs italic text-gray-700 transition"><i>I</i></button>
              <button type="button" onClick={() => applyFormat('underline')} className="px-3 py-1.5 hover:bg-gray-200 rounded-lg text-xs underline text-gray-700 transition"><u>U</u></button>
            </div>
            <div className="flex bg-gray-200 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setEditorMode('write')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${editorMode === 'write' ? 'bg-white shadow-sm text-[#912cad]' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${editorMode === 'preview' ? 'bg-white shadow-sm text-[#912cad]' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Preview
              </button>
            </div>
          </div>
          {editorMode === 'write' ? (
            <textarea
              ref={descriptionRef}
              value={formData.description}
              onChange={e => updateField('description', e.target.value)}
              rows={4}
              className="w-full p-4 bg-transparent outline-none border-0 focus:ring-0 text-sm resize-y"
              placeholder="Describe your product here..."
              required
            />
          ) : (
            <div
              className="w-full min-h-[100px] p-4 bg-white text-sm prose max-w-none overflow-y-auto max-h-[200px]"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(formData.description) }}
            />
          )}
        </div>
      </div>

      {/* Origin & Location Section in Quick Add */}
      <div className="bg-teal-50/40 rounded-2xl p-5 border border-teal-100">
        <h4 className="font-bold text-teal-800 mb-4 text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-teal-500 rounded-full inline-block" />
          Origin &amp; Location <span className="text-[#c800ff] text-xs ml-1">(All Required)</span>
        </h4>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Country of Origin <span className="text-[#c800ff] ml-1">*</span></label>
            <input
              type="text"
              value={formData.origin || ''}
              onChange={e => updateField('origin', e.target.value)}
              placeholder="e.g. Nigeria, China, USA"
              className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm"
              required
            />
          </div>
          <div className="border-t border-teal-100 pt-4">
            <label className="text-xs font-bold text-gray-600 mb-3 block">Shipping Location <span className="text-[#c800ff] ml-1">*</span></label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={formData.location?.town || ''}
                onChange={e => updateLocation('town', e.target.value)}
                placeholder="Town / City *"
                className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm"
                required
              />
              <input
                type="text"
                value={formData.location?.state || ''}
                onChange={e => updateLocation('state', e.target.value)}
                placeholder="State *"
                className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm"
                required
              />
              <input
                type="text"
                value={formData.location?.lga || ''}
                onChange={e => updateLocation('lga', e.target.value)}
                placeholder="LGA (Local Government Area) *"
                className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => setQuickAddMode(false)}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition text-sm"
        >
          Switch to Detailed Form
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 disabled:opacity-60 text-white rounded-2xl font-extrabold transition shadow-lg text-sm"
        >
          {isSaving ? 'Creating...' : 'Create Product'}
        </button>
      </div>
    </form>
  );

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
      return;
    }
    closeModalAndReset();
  };

  const closeModalAndReset = () => {
    setCurrentStep(1);
    setSaveErrors([]);
    setIsSaving(false);
    setLoadingMessage('');
    setQuickAddMode(false);
    setHasUnsavedChanges(false);
    setShowCancelConfirm(false);
    onClose();
  };

  const nextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (stepErrors.length > 0) {
      setSaveErrors(stepErrors);
      return;
    }
    setCurrentStep(prev => Math.min(totalSteps, prev + 1));
  };
  const prevStep = () => {
    setSaveErrors([]);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);

  const [subcategories, setSubcategories] = useState<ProductCategoryOption[]>([]);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);

  const selectedCategory = findCategory(categories, formData.categoryId);
  const selectedCategoryValue = selectedCategory?.id || formData.categoryId;
  const selectedCategoryName = selectedCategory?.name || '';

  const renderCategoryInputs = (categoryName: string) => {
    const normalized = categoryName.toLowerCase().trim();
    if (normalized.includes('fashion') || normalized.includes('clothing') || normalized.includes('apparel')) {
      return (
        <div className="col-span-1 md:col-span-2 space-y-4 animate-in fade-in duration-200">
          <h5 className="font-extrabold text-[#912cad] text-xs uppercase tracking-wider">Fashion Specifications</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 block">Material / Fabric</label>
              <input
                type="text"
                placeholder="e.g. 100% Cotton"
                value={formData.metadata.material || ''}
                onChange={(e) => updateMetadata('material', e.target.value)}
                className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 block">Fit / Style</label>
              <input
                type="text"
                placeholder="e.g. Slim Fit, Casual"
                value={formData.metadata.fitStyle || ''}
                onChange={(e) => updateMetadata('fitStyle', e.target.value)}
                className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm font-semibold"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ChipSelector
              label="Available Colours"
              selectedValues={formData.colours}
              onChange={(vals) => updateField('colours', vals)}
              popularOptions={POPULAR_COLOURS}
              placeholder="Type colour and press Enter..."
            />
            <ChipSelector
              label="Available Sizes"
              selectedValues={formData.sizes}
              onChange={(vals) => updateField('sizes', vals)}
              popularOptions={POPULAR_SIZES}
              placeholder="Type size and press Enter..."
            />
          </div>
        </div>
      );
    }

    if (normalized.includes('electronics') || normalized.includes('gadget') || normalized.includes('appliances')) {
      return (
        <div className="col-span-1 md:col-span-2 space-y-4 animate-in fade-in duration-200">
          <h5 className="font-extrabold text-[#912cad] text-xs uppercase tracking-wider">Technical Specifications</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 block">Model Name / Number</label>
              <input
                type="text"
                placeholder="e.g. iPhone 15 Pro"
                value={formData.metadata.modelNumber || ''}
                onChange={(e) => updateMetadata('modelNumber', e.target.value)}
                className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 block">Warranty Policy</label>
              <input
                type="text"
                placeholder="e.g. 1 Year Brand Warranty"
                value={formData.metadata.warrantyPolicy || ''}
                onChange={(e) => updateMetadata('warrantyPolicy', e.target.value)}
                className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm font-semibold"
              />
            </div>
          </div>
        </div>
      );
    }

    // Default return empty or general attributes
    return (
      <div className="col-span-1 md:col-span-2 space-y-4 animate-in fade-in duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ChipSelector
            label="Available Colours (Optional)"
            selectedValues={formData.colours}
            onChange={(vals) => updateField('colours', vals)}
            popularOptions={POPULAR_COLOURS}
            placeholder="Type colour and press Enter..."
          />
          <ChipSelector
            label="Available Sizes (Optional)"
            selectedValues={formData.sizes}
            onChange={(vals) => updateField('sizes', vals)}
            popularOptions={POPULAR_SIZES}
            placeholder="Type size and press Enter..."
          />
        </div>
      </div>
    );
  };

  const updateMetadata = (key: string, value: any) => {
    setSaveErrors([]);
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value }
    }));
  };

  const getCategoryListLocal = (payload: unknown): unknown[] => {
    if (!payload || typeof payload !== 'object') return [];
    const record = payload as Record<string, any>;
    const data = record.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    if (data && typeof data === 'object' && Array.isArray(data.categories)) return data.categories;
    if (data && typeof data === 'object' && Array.isArray(data.docs)) return data.docs;
    if (data && typeof data === 'object' && Array.isArray(data.items)) return data.items;
    if (data && typeof data === 'object' && Array.isArray(data.results)) return data.results;
    if (Array.isArray(record.categories)) return record.categories;
    if (Array.isArray(record.children)) return record.children;
    return [];
  };

  useEffect(() => {
    let isMounted = true;
    const fetchSubs = async () => {
      if (!formData.categoryId) {
        setSubcategories([]);
        return;
      }
      setIsLoadingSubcategories(true);
      try {
        const response = await categoryApi.getSubcategories(formData.categoryId);
        const list = getCategoryListLocal(response)
          .map((c: any) => {
            if (!c || typeof c !== 'object') return null;
            const id = c.id || c._id || c.categoryId || c.uuid;
            const name = c.name || c.title || c.displayName || c.slug;
            const isActive = Boolean(c.isActive ?? c.is_active ?? (c.status === 'published' || c.status == null));
            return id && name ? { id: String(id), name: String(name), isActive } : null;
          })
          .filter((c: any): c is (ProductCategoryOption & { isActive: boolean }) => Boolean(c))
          .filter(c => c.isActive);

        if (isMounted) setSubcategories(list);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        if (isMounted) setSubcategories([]);
      } finally {
        if (isMounted) setIsLoadingSubcategories(false);
      }
    };
    void fetchSubs();
    return () => { isMounted = false; };
  }, [formData.categoryId]);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      if (editingItem) {
        setFormData({
          id: editingItem.id || '',
          vendorId: editingItem.vendorId || currentUserId,
          name: editingItem.name || '',
          preview: editingItem.preview || '',
          description: editingItem.description || '',
          sku: editingItem.sku || '',
          price: editingItem.price || 0,
          compareAtPrice: editingItem.compareAtPrice || 0,
          costPerItem: editingItem.costPerItem || 0,
          currency: editingItem.currency || 'NGN',
          condition: editingItem.condition || 'new',
          stock: editingItem.stock || 0,
          inStock: editingItem.inStock ?? true,
          categoryId: editingItem.categoryId || '',
          subCategoryId: editingItem.subCategoryId || '',
          brand: editingItem.brand || '',
          colours: editingItem.colours || [],
          sizes: editingItem.sizes || [],
          weight: editingItem.weight || 0,
          dimensions: editingItem.dimensions || { length: 0, width: 0, height: 0 },
          tags: editingItem.tags || [],
          metadata: editingItem.metadata || {},
          origin: editingItem.origin || 'Nigeria',
          location: (editingItem as any).location || { town: '', state: '', lga: '' },
          returnWindow: editingItem.returnWindow || 'Use Store Default',
          whoPaysReturnShipping: editingItem.whoPaysReturnShipping || 'Use Store Default',
          returnConditions: editingItem.returnConditions || '',
          warrantyPeriod: editingItem.warrantyPeriod || 'Use Store Default',
          warrantyDetails: editingItem.warrantyDetails || '',
          status: editingItem.status || 'draft',
          images: editingItem.images || [],
          weightUnit: editingItem.weightUnit || 'kg',
          dimensionsUnit: editingItem.dimensionsUnit || 'cm',
        });

        if (editingItem.discount !== undefined) {
          setDiscountPercent(editingItem.discount);
        } else {
          setDiscountPercent(0);
        }

        if (editingItem.metadata?.customAttributes) {
          const attributes = editingItem.metadata.customAttributes as Record<string, string>;
          setCustomFields(Object.entries(attributes).map(([key, value]) => ({ key, value })));
        } else {
          setCustomFields([]);
        }

        setStagedImages(sortImages(editingItem.images || []));

        if (editingItem.categoryId) {
          categoryApi.getCategoryById(editingItem.categoryId).then(res => {
            if (!isMounted) return;
            const cat = res?.data || res;
            if (cat && cat.parentId) {
              setFormData(prev => ({
                ...prev,
                categoryId: String(cat.parentId),
                subCategoryId: editingItem.categoryId || ''
              }));
            } else {
              setFormData(prev => ({
                ...prev,
                categoryId: editingItem.categoryId || '',
                subCategoryId: ''
              }));
            }
          }).catch(err => console.error("Error fetching category:", err));
        }

        setQuickAddMode(false);
      } else {
        setFormData({
          id: '',
          vendorId: currentUserId,
          name: '',
          preview: '',
          description: '',
          sku: '',
          price: 0,
          compareAtPrice: 0,
          costPerItem: 0,
          currency: 'NGN',
          condition: 'new',
          stock: 0,
          inStock: true,
          categoryId: '',
          subCategoryId: '',
          brand: '',
          colours: [],
          sizes: [],
          weight: 0,
          dimensions: { length: 0, width: 0, height: 0 },
          tags: [],
          metadata: {},
          origin: 'Nigeria',
          location: { town: '', state: '', lga: '' },
          returnWindow: 'Use Store Default',
          whoPaysReturnShipping: 'Use Store Default',
          returnConditions: '',
          warrantyPeriod: 'Use Store Default',
          warrantyDetails: '',
          status: 'draft',
          images: [],
          weightUnit: 'kg',
          dimensionsUnit: 'cm',
        });
        setDiscountPercent(0);
        setCustomFields([]);
        setStagedImages([]);
      }
    }
    return () => { isMounted = false; };
  }, [isOpen, editingItem, currentUserId]);

  useEffect(() => {
    if (formData.compareAtPrice >= 0 && discountPercent >= 0) {
      const discountAmount = (formData.compareAtPrice * discountPercent) / 100;
      const calculated = Math.max(0, Math.round(formData.compareAtPrice - discountAmount));
      updateField('price', calculated);
    }
  }, [formData.compareAtPrice, discountPercent]);

  const applyFormat = (formatType: 'bold' | 'italic' | 'underline' | 'bullet' | 'number') => {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.description;
    const selectedText = text.substring(start, end);
    let replacement = '';
    switch (formatType) {
      case 'bold': replacement = `**${selectedText || 'bold text'}**`; break;
      case 'italic': replacement = `*${selectedText || 'italic text'}*`; break;
      case 'underline': replacement = `<u>${selectedText || 'underlined text'}</u>`; break;
      case 'bullet': replacement = selectedText ? selectedText.split('\n').map(l => l.startsWith('- ') ? l : `- ${l}`).join('\n') : '- bullet point'; break;
      case 'number': replacement = selectedText ? selectedText.split('\n').map((l, i) => l.match(/^\d+\.\s/) ? l : `${i + 1}. ${l}`).join('\n') : '1. list item'; break;
    }
    updateField('description', text.substring(0, start) + replacement + text.substring(end));
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start, start + replacement.length); }, 0);
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) updateField('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => updateField('tags', formData.tags.filter(x => x !== t));

  const validateStep = (step: number): string[] => {
    const errors: string[] = [];
    if (step === 1) {
      if (!formData.name.trim()) errors.push('Product name is required.');
      if (!formData.categoryId) errors.push('Product category is required.');
      // Origin & Location validation - ALL REQUIRED
      if (!formData.origin?.trim()) errors.push('Country of origin is required.');
      if (!formData.location?.town?.trim()) errors.push('Town/City is required.');
      if (!formData.location?.state?.trim()) errors.push('State is required.');
      if (!formData.location?.lga?.trim()) errors.push('LGA (Local Government Area) is required.');
    } else if (step === 2) {
      if (!formData.compareAtPrice || formData.compareAtPrice <= 0) errors.push('Original price is required.');
      if (formData.stock === undefined || formData.stock < 0) errors.push('Stock is required.');
    }
    return errors;
  };

  const handleImageModalComplete = (images: { file: File; alt: string }[]) => {
    if (!images.length) return;
    setIsUploadModalOpen(false);
    setSelectedImageIndex(0);
    
    const newStaged: ProductImage[] = images.map((img, idx) => {
      const order = stagedImages.length + idx;
      return {
        url: URL.createObjectURL(img.file),
        order,
        isPrimary: stagedImages.length === 0 && idx === 0,
        alt: img.alt,
        file: img.file,
      };
    });

    setStagedImages(prev => {
      const updated = [...prev, ...newStaged];
      if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
    setHasUnsavedChanges(true);
    toast.success('Images added to gallery draft.');
  };

  const handleImageReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const currentImage = stagedImages[selectedImageIndex];
    if (!currentImage) return;

    const order = currentImage.order ?? selectedImageIndex;
    const alt = currentImage.alt || '';

    setImageToReplace({
      file,
      preview: URL.createObjectURL(file),
      alt,
      order
    });
    
    if (replaceInputRef.current) replaceInputRef.current.value = '';
  };

  const handleCancelReplace = () => {
    if (imageToReplace) {
      URL.revokeObjectURL(imageToReplace.preview);
    }
    setImageToReplace(null);
  };

  const handleConfirmReplace = () => {
    if (!imageToReplace) return;
    
    if (!imageToReplace.alt.trim()) {
      toast.error('Alt text is required for the new image.');
      return;
    }

    setStagedImages(prev => {
      const updated = [...prev];
      if (updated[selectedImageIndex]) {
        updated[selectedImageIndex] = {
          ...updated[selectedImageIndex],
          url: imageToReplace.preview,
          alt: imageToReplace.alt,
          file: imageToReplace.file,
        };
      }
      return updated;
    });
    setHasUnsavedChanges(true);
    toast.success('Image replaced in draft.');
    setImageToReplace(null);
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    if (imageToDelete.url && !imageToDelete.file && formData.id) {
      try {
        await productApi.deleteProductImage(formData.id, imageToDelete.url);
      } catch (error) {
        console.error('Error deleting image from backend:', error);
      }
    }

    setStagedImages(prev => {
      const filtered = prev.filter((_, idx) => idx !== selectedImageIndex);
      const updated = filtered.map((img, idx) => ({
        ...img,
        order: idx,
        isPrimary: idx === 0,
      }));
      return updated;
    });
    setHasUnsavedChanges(true);
    setImageToDelete(null);
    setSelectedImageIndex(0);
    toast.success('Image deleted from draft.');
  };

  const handleSetCoverImage = () => {
    setStagedImages(prev => {
      const updated = prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === selectedImageIndex,
      }));
      return sortImages(updated);
    });
    setSelectedImageIndex(0);
    setHasUnsavedChanges(true);
    toast.success('Cover image updated in draft.');
  };

  const handleSaveAltText = () => {
    if (editingAltIndex === null) return;
    if (!altTextInput.trim()) {
      toast.error('Alt text is required.');
      return;
    }

    setStagedImages(prev => {
      const updated = [...prev];
      if (updated[editingAltIndex]) {
        updated[editingAltIndex].alt = altTextInput.trim();
      }
      return updated;
    });
    setHasUnsavedChanges(true);
    setEditingAltIndex(null);
    toast.success('Alt text updated in draft.');
  };

  const handleSaveReorder = () => {
    setStagedImages(reorderImages.map((img, idx) => ({ ...img, order: idx, isPrimary: idx === 0 })));
    setIsReordering(false);
    setSelectedImageIndex(0);
    setHasUnsavedChanges(true);
    toast.success('Image order updated in draft.');
  };

  if (activeTab !== 'products') return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
        <div key="action-modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 md:max-h-[90vh] max-h-full flex flex-col"
          >
            <AnimatePresence>
              {saveErrors.length > 0 && (
                <motion.div key="save-errors-banner" className="absolute left-4 right-4 top-4 z-30 mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-2xl">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-red-100 p-2 text-red-600"><AlertCircle size={20} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-red-800">Please fix these details before saving.</p>
                      <ul className="mt-2 list-disc space-y-1 pl-4">
                        {saveErrors.map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}
                      </ul>
                    </div>
                    <button type="button" onClick={() => setSaveErrors([])} className="rounded-xl p-2 text-red-500 transition hover:bg-red-50"><X size={18} /></button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-gradient-to-r from-[#c800ff] to-[#912cad] px-8 py-6 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{editingItem ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-sm opacity-90 mt-1">
                  {quickAddMode ? 'Quick Add Mode' : `Step ${currentStep} of ${totalSteps}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!editingItem && !quickAddMode && <QuickAddButton />}
                {quickAddMode && (
                  <button
                    type="button"
                    onClick={() => setQuickAddMode(false)}
                    className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    Switch to Detailed Form
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition"
                  aria-label="Close modal"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {quickAddMode ? (
              renderQuickAddForm()
            ) : (
              <div className="flex flex-col flex-grow min-h-0">
                {/* Step Indicator */}
                <div className="px-6 md:px-8 pt-6 pb-2 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    {[
                      { step: 1, title: 'Basic Information', desc: 'Core product details' },
                      { step: 2, title: 'Pricing & Inventory', desc: 'Set price, stock levels, and costs' },
                      { step: 3, title: 'Additional Details', desc: 'Policies, category specifications, and SEO metadata' },
                      ...(totalSteps === 4 ? [{ step: 4, title: 'Images', desc: 'Manage product gallery' }] : [])
                    ].map((s) => (
                      <div key={s.step} className="flex flex-col items-center flex-1 relative">
                        {s.step !== 1 && <div className={`absolute top-4 left-[-50%] w-full h-[2px] ${currentStep >= s.step ? 'bg-[#c800ff]' : 'bg-gray-200'}`} />}
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 ${currentStep === s.step ? 'bg-[#c800ff] text-white shadow-md shadow-[#c800ff]/30 ring-4 ring-[#c800ff]/10' : currentStep > s.step ? 'bg-[#912cad] text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {currentStep > s.step ? <Check size={14} /> : s.step}
                        </div>
                        <div className="mt-2 text-center hidden md:block">
                          <p className={`text-[11px] font-bold ${currentStep >= s.step ? 'text-gray-800' : 'text-gray-400'}`}>{s.title}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 min-h-0">
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-[#c800ff] to-[#912cad] rounded-lg text-white"><Layers size={22} /></div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">Basic Information</h3>
                          <p className="text-xs text-gray-500">Core product details</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1.5 block">Product Name <span className="text-[#c800ff] ml-1">*</span></label>
                        <input type="text" value={formData.name} onChange={e => updateField('name', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" required />
                      </div>

                      <input type="hidden" value={formData.vendorId} readOnly />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Product Category <span className="text-[#c800ff] ml-1">*</span></label>
                          <select
                            value={selectedCategoryValue}
                            onChange={e => {
                              updateField('categoryId', e.target.value);
                              updateField('subCategoryId', ''); // Clear subcategory on change
                            }}
                            className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm font-medium"
                            required
                            disabled={isLoadingCategories}
                          >
                            <option value="">
                              {isLoadingCategories ? 'Loading categories...' : 'Select category'}
                            </option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Sub Category <span className="text-[#c800ff] ml-1">*</span></label>
                          <select
                            value={formData.subCategoryId}
                            onChange={e => updateField('subCategoryId', e.target.value)}
                            className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm font-medium"
                            required
                            disabled={isLoadingSubcategories || !formData.categoryId}
                          >
                            <option value="">
                              {!formData.categoryId
                                ? 'Please select a category first'
                                : isLoadingSubcategories
                                  ? 'Loading subcategories...'
                                  : 'Select subcategory'
                              }
                            </option>
                            {subcategories.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1.5 block">Preview <span className="text-[#c800ff] ml-1">*</span></label>
                        <textarea value={formData.preview} onChange={e => updateField('preview', e.target.value)} rows={2} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm resize-y" required />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1.5 block">Full Description <span className="text-[#c800ff] ml-1">*</span></label>
                        <div className="border rounded-2xl overflow-hidden bg-[#F0F7F8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#E0F2F3] transition-all">
                          {/* Editor Header Toolbar */}
                          <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => applyFormat('bold')}
                                className="px-3 py-1.5 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition"
                                title="Bold"
                              >
                                <b>B</b>
                              </button>
                              <button
                                type="button"
                                onClick={() => applyFormat('italic')}
                                className="px-3 py-1.5 hover:bg-gray-200 rounded-lg text-xs italic text-gray-700 transition"
                                title="Italic"
                              >
                                <i>I</i>
                              </button>
                              <button
                                type="button"
                                onClick={() => applyFormat('underline')}
                                className="px-3 py-1.5 hover:bg-gray-200 rounded-lg text-xs underline text-gray-700 transition"
                                title="Underline"
                              >
                                <u>U</u>
                              </button>
                              <div className="w-[1px] h-4 bg-gray-300 mx-1" />
                              <button
                                type="button"
                                onClick={() => applyFormat('bullet')}
                                className="px-3 py-1.5 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition"
                                title="Bulleted List"
                              >
                                • List
                              </button>
                              <button
                                type="button"
                                onClick={() => applyFormat('number')}
                                className="px-3 py-1.5 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition"
                                title="Numbered List"
                              >
                                1. List
                              </button>
                            </div>
                            <div className="flex bg-gray-200 rounded-lg p-0.5">
                              <button
                                type="button"
                                onClick={() => setEditorMode('write')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition ${editorMode === 'write' ? 'bg-white shadow-sm text-[#912cad]' : 'text-gray-500 hover:text-gray-800'}`}
                              >
                                Write
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditorMode('preview')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition ${editorMode === 'preview' ? 'bg-white shadow-sm text-[#912cad]' : 'text-gray-500 hover:text-gray-800'}`}
                              >
                                Preview
                              </button>
                            </div>
                          </div>

                          {editorMode === 'write' ? (
                            <textarea
                              ref={descriptionRef}
                              value={formData.description}
                              onChange={e => updateField('description', e.target.value)}
                              rows={6}
                              className="w-full p-4 bg-transparent outline-none border-0 focus:ring-0 text-sm resize-y"
                              placeholder="Describe your product here..."
                              required
                            />
                          ) : (
                            <div
                              className="w-full min-h-[144px] p-4 bg-white text-sm prose max-w-none overflow-y-auto max-h-[300px]"
                              dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(formData.description) }}
                            />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Brand</label>
                          <input type="text" value={formData.brand} onChange={e => updateField('brand', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Tags (Press Enter to add)</label>
                          <div className="w-full p-2.5 rounded-2xl border bg-[#F0F7F8] focus-within:bg-white focus-within:ring-2 focus-within:border-[#c800ff] focus-within:ring-[#c800ff]/20 ring-[#E0F2F3] min-h-[50px] flex flex-wrap gap-2 items-center">
                            {formData.tags.map((t, idx) => (
                              <span key={`tag-${t}-${idx}`} className="bg-[#e9d2e5] text-[#c800ff] text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                                {t} <X size={12} className="cursor-pointer text-[#c800ff] hover:text-red-500 transition" onClick={() => removeTag(t)} />
                              </span>
                            ))}
                            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} className="bg-transparent outline-none flex-1 min-w-[80px] text-sm focus:!ring-0 focus:!border-transparent" placeholder="Add tag..." />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1.5 block">SKU (Stock Keeping Unit)</label>
                        <div className="flex gap-3">
                          <input type="text" value={formData.sku} onChange={e => updateField('sku', e.target.value)} className="flex-1 p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm font-semibold tracking-wider text-gray-700" placeholder="e.g. GADG-IPHONE-256GB" />
                          <button
                            type="button"
                            onClick={generateSKU}
                            className="px-5 bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] text-white text-xs font-bold rounded-2xl shadow-md transition"
                          >
                            Auto-Generate SKU
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium mt-2 leading-relaxed">
                          SKU is a unique code used for inventory tracking. <br />
                          Example: <span className="font-bold text-gray-500">GADG-IPHONE-256GB</span> or <span className="font-bold text-gray-500">FASH-TSHIRT-BLACK-M</span>.
                          You can auto-generate it, type your own, or leave it blank if unsure.
                        </p>
                      </div>

                      {/* Origin & Location Section - ALL FIELDS REQUIRED */}
                      <div className="bg-purple-50/40 rounded-2xl p-5 border border-purple-100">
                        <h4 className="font-bold text-purple-800 mb-4 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#c800ff] rounded-full inline-block" />
                          Origin &amp; Location <span className="text-[#c800ff] text-xs ml-1">(All Fields Required)</span>
                        </h4>

                        {/* Country of Origin */}
                        <div className="mb-5">
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                            Country of Origin <span className="text-[#c800ff] ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.origin || ''}
                            onChange={e => updateField('origin', e.target.value)}
                            className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm"
                            required
                            placeholder="e.g. Nigeria, China, USA"
                          />
                          <p className="text-[11px] text-gray-400 font-medium mt-1.5">
                            Where the product is manufactured or sourced from
                          </p>
                        </div>

                        {/* Shipping Location */}
                        <div className="border-t border-purple-100 pt-4">
                          <label className="text-xs font-bold text-gray-600 mb-3 block">
                            Shipping Location <span className="text-[#c800ff] ml-1">*</span>
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                            <div>
                              <label className="text-xs font-bold text-gray-500 mb-1 block">
                                Town / City <span className="text-[#c800ff] ml-1">*</span>
                              </label>
                              <input
                                type="text"
                                value={formData.location?.town || ''}
                                onChange={e => updateLocation('town', e.target.value)}
                                className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm"
                                required
                                placeholder="e.g. Victoria Island"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 mb-1 block">
                                State <span className="text-[#c800ff] ml-1">*</span>
                              </label>
                              <input
                                type="text"
                                value={formData.location?.state || ''}
                                onChange={e => updateLocation('state', e.target.value)}
                                className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm"
                                required
                                placeholder="e.g. Lagos"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 mb-1 block">
                                LGA (Local Government Area) <span className="text-[#c800ff] ml-1">*</span>
                              </label>
                              <input
                                type="text"
                                value={formData.location?.lga || ''}
                                onChange={e => updateLocation('lga', e.target.value)}
                                className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm"
                                required
                                placeholder="e.g. Eti-Osa"
                              />
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-400 font-medium mt-2">
                            Where the product is physically located for shipping/delivery
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Pricing & Inventory */}
                  {currentStep === 2 && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-[#c800ff] to-[#912cad] rounded-lg text-white"><DollarSign size={22} /></div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">Pricing & Inventory</h3>
                          <p className="text-xs text-gray-500">Set price, stock levels, and costs</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Compare at / Original Price (₦) <span className="text-[#c800ff] ml-1">*</span></label>
                          <input type="number" value={formData.compareAtPrice || ''} onChange={e => updateField('compareAtPrice', Number(e.target.value))} onKeyDown={e => { if (e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault(); }} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm font-bold" required />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Discount (%)</label>
                          <input type="number" min="0" max="99" value={discountPercent || ''} onChange={e => setDiscountPercent(clampDiscount(e.target.value))} onKeyDown={e => { if (e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault(); }} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Selling Price (₦) <span className="text-[#c800ff] ml-1">*</span></label>
                          <input type="number" value={formData.price || ''} readOnly className="w-full p-3.5 rounded-2xl border bg-gray-100 cursor-not-allowed outline-none text-sm font-black text-[#c800ff]" required />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Cost per Item (₦)</label>
                          <input type="number" value={formData.costPerItem || ''} onChange={e => updateField('costPerItem', Number(e.target.value))} onKeyDown={e => { if (e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault(); }} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Stock Quantity <span className="text-[#c800ff] ml-1">*</span></label>
                          <input type="number" min="0" step="1" value={formData.stock || ''} onChange={e => updateField('stock', toNonNegativeInteger(e.target.value))} onKeyDown={e => { if (e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault(); }} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm font-semibold" required />
                        </div>
                        <div className="flex items-center pt-2 md:pt-8">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={formData.inStock} onChange={e => updateField('inStock', e.target.checked)} className="w-5 h-5 text-[#c800ff] rounded border-gray-300 focus:ring-[#c800ff]" />
                            <span className="font-bold text-gray-700 text-sm">In Stock</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Additional Details & Specifications */}
                  {currentStep === 3 && (
                    <div className="space-y-8 animate-in fade-in duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-[#c800ff] to-[#912cad] rounded-lg text-white"><Info size={22} /></div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">Additional Details</h3>
                          <p className="text-xs text-gray-500">Policies, category specifications, and SEO metadata</p>
                        </div>
                      </div>

                      {/* General Origin */}
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <h4 className="font-bold text-gray-700 mb-4 text-sm">General</h4>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Origin / Manufactured in</label>
                          <input type="text" value={formData.origin} onChange={e => updateField('origin', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm font-medium" />
                        </div>
                      </div>

                      {/* Return Policy */}
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <h4 className="font-bold text-gray-700 mb-4 text-sm">Return Policy</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-4">
                          <div>
                            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Return Window</label>
                            <select value={formData.returnWindow} onChange={e => updateField('returnWindow', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm font-bold text-gray-700">
                              <option value="Use Store Default">Use Faflora Store Default</option>
                              <option value="3">3 days</option>
                              <option value="7 days">7 days</option>
                              <option value="14 days">14 days</option>
                              <option value="30 days">30 days</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Who Pays Return Shipping?</label>
                            <select value={formData.whoPaysReturnShipping} onChange={e => updateField('whoPaysReturnShipping', e.target.value)} className="w-full p-3.5 rounded-2xl border outline-none text-sm bg-white focus:ring-2 ring-[#E0F2F3] font-bold text-gray-700">
                              <option value="Use Store Default">Use Faflora Store Default</option>
                              <option value="store">Faflora Store pays</option>
                              <option value="vendor">Vendor pays</option>
                              <option value="customer">Customer pays</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Return Conditions</label>
                          <textarea value={formData.returnConditions} onChange={e => updateField('returnConditions', e.target.value)} rows={2} className="w-full p-3.5 rounded-2xl border outline-none text-sm resize-y bg-white focus:ring-2 ring-[#E0F2F3]" placeholder="Must be in original packaging, unworn, etc." />
                        </div>
                      </div>

                      {/* Warranty */}
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <h4 className="font-bold text-gray-700 mb-4 text-sm">Warranty</h4>
                        <div className="mb-4">
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Warranty Period</label>
                          <select value={formData.warrantyPeriod} onChange={e => updateField('warrantyPeriod', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm font-bold text-gray-700">
                            <option value="Use Store Default">Use Faflora Store Default</option>
                            <option value="none">None</option>
                            <option value="3 months">3 months</option>
                            <option value="6 months">6 months</option>
                            <option value="1 year">1 year</option>
                            <option value="2 years">2 years</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Warranty Details</label>
                          <textarea disabled={formData.warrantyPeriod === 'none'} value={formData.warrantyPeriod === 'none' ? 'Not Applicable' : formData.warrantyDetails} onChange={e => updateField('warrantyDetails', e.target.value)} rows={2} className={`w-full p-3.5 rounded-2xl border outline-none text-sm resize-y ${formData.warrantyPeriod === 'none' ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white focus:ring-2 ring-[#E0F2F3]'}`} placeholder="Covers manufacturing defects only..." />
                        </div>
                      </div>

                      {/* Dynamic Category Specifications + Custom Fields */}
                      <div className="bg-gray-50 rounded-2xl p-5 border border-[#e4d3e0] border-t-4 border-t-[#c800ff]">
                        <h4 className="font-extrabold text-gray-800 mb-4 text-sm uppercase tracking-wide">
                          {selectedCategoryName || 'General'} Specifications
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                          {renderCategoryInputs(selectedCategoryName)}

                          {/* Unified weight & dimension inputs nested in specs based on category */}
                          {categoryIncludesWeightAndDimensions(selectedCategoryName) && (
                            <div className="col-span-1 md:col-span-2 border-t pt-5 mt-4 space-y-4">
                              <h5 className="font-extrabold text-[#912cad] text-xs uppercase tracking-wider">Weight & Physical Dimensions</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">Weight</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={formData.weight || ''}
                                      onChange={(e) => updateField('weight', Number(e.target.value))}
                                      onKeyDown={e => { if (e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault(); }}
                                      className="flex-1 p-3.5 rounded-2xl border bg-white outline-none text-sm font-semibold"
                                      placeholder="Value"
                                    />
                                    {(formData.weight > 0) && (
                                      <select
                                        value={formData.weightUnit || 'kg'}
                                        onChange={(e) => updateField('weightUnit', e.target.value)}
                                        className="p-3.5 rounded-2xl border bg-white outline-none text-sm font-bold text-gray-700 w-24 animate-in fade-in zoom-in-95 duration-150"
                                      >
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                      </select>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">Dimensions Measurement Unit</label>
                                  <select
                                    value={formData.dimensionsUnit || 'cm'}
                                    onChange={(e) => updateField('dimensionsUnit', e.target.value)}
                                    className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm font-bold text-gray-700"
                                  >
                                    <option value="cm">cm</option>
                                    <option value="inches">inches</option>
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Length</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={formData.dimensions.length || ''}
                                    onChange={(e) => updateField('dimensions', { ...formData.dimensions, length: Number(e.target.value) })}
                                    onKeyDown={e => { if (e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault(); }}
                                    className="w-full p-3 rounded-2xl border bg-white outline-none text-sm font-semibold"
                                    placeholder="L"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Width</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={formData.dimensions.width || ''}
                                    onChange={(e) => updateField('dimensions', { ...formData.dimensions, width: Number(e.target.value) })}
                                    onKeyDown={e => { if (e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault(); }}
                                    className="w-full p-3 rounded-2xl border bg-white outline-none text-sm font-semibold"
                                    placeholder="W"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Height</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={formData.dimensions.height || ''}
                                    onChange={(e) => updateField('dimensions', { ...formData.dimensions, height: Number(e.target.value) })}
                                    onKeyDown={e => { if (e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault(); }}
                                    className="w-full p-3 rounded-2xl border bg-white outline-none text-sm font-semibold"
                                    placeholder="H"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Custom Attributes Fields Grid — always at the bottom of specs */}
                        <div className="mt-6 pt-5 border-t border-[#e4d3e0] space-y-3">
                          <h5 className="font-extrabold text-[#912cad] text-xs uppercase tracking-wider mb-3">Custom Fields</h5>
                          {customFields.map((field, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-3">
                              <input type="text" placeholder="Key (e.g. Processor)" value={field.key} onChange={e => {
                                const newF = [...customFields]; newF[index].key = e.target.value; setCustomFields(newF);
                              }} className="flex-1 p-3 rounded-xl border bg-white text-sm outline-none font-medium" />
                              <input type="text" placeholder="Value (e.g. Intel i7)" value={field.value} onChange={e => {
                                const newF = [...customFields]; newF[index].value = e.target.value; setCustomFields(newF);
                              }} className="flex-1 p-3 rounded-xl border bg-white text-sm outline-none font-medium" />
                              <button type="button" onClick={() => setCustomFields(customFields.filter((_, i) => i !== index))} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                          <button type="button" onClick={() => setCustomFields([...customFields, { key: '', value: '' }])} className="text-sm font-extrabold text-[#c800ff] flex items-center gap-1.5 hover:underline mt-2">
                            <Plus size={15} /> Add Custom Field
                          </button>
                        </div>
                      </div>

                      {/* SEO collapsed layout */}
                      <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                        <button type="button" onClick={() => setSeoExpanded(!seoExpanded)} className="w-full p-5 flex justify-between items-center text-left hover:bg-gray-100/50 transition">
                          <h4 className="font-bold text-gray-700 text-sm">SEO (Search Engine Optimization)</h4>
                          <span className="text-gray-400 text-xs font-bold">{seoExpanded ? 'Collapse' : 'Expand'}</span>
                        </button>
                        {seoExpanded && (
                          <div className="p-5 border-t border-gray-100 space-y-4 bg-white">
                            <div className="flex justify-end">
                              <button type="button" onClick={generateSEO} className="text-xs font-extrabold bg-[#f1f8fc] text-[#1c7bb3] px-3.5 py-2 rounded-xl hover:bg-[#e1eff8] transition">
                                Auto-Generate from Product Data
                              </button>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-600 mb-1.5 block">Meta Title</label>
                              <input type="text" value={formData.metadata.seoTitle || ''} onChange={e => updateMetadata('seoTitle', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-gray-50 focus:bg-white focus:ring-2 ring-gray-200 outline-none text-sm font-semibold" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-600 mb-1.5 block">Meta Description</label>
                              <textarea value={formData.metadata.seoDescription || ''} onChange={e => updateMetadata('seoDescription', e.target.value)} rows={3} className="w-full p-3.5 rounded-2xl border bg-gray-50 focus:bg-white focus:ring-2 ring-gray-200 outline-none text-sm font-medium resize-y" />
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* STEP 4: Images (Only for Published Products) */}
                  {currentStep === 4 && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-[#c800ff] to-[#912cad] rounded-lg text-white">
                            <ImageIcon size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">Product Images</h3>
                            <p className="text-xs text-gray-500">Manage, replace, and reorder images.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReorderImages(stagedImages || []);
                            setIsReordering(true);
                          }}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs flex items-center gap-2 transition"
                        >
                          <GripVertical size={16} /> Change Order
                        </button>
                      </div>

                      {isReordering ? (
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                          <h4 className="font-bold text-gray-800 mb-4">Reorder Images</h4>
                          <p className="text-xs text-gray-500 mb-4">Drag images to reorder them. The first image will become the cover.</p>
                          <div className="space-y-3">
                            {reorderImages.map((img, idx) => {
                              const url = img?.url;
                              const alt = img?.alt;
                              const isPrimary = img?.isPrimary;
                              return (
                                <div
                                  key={url || `reorder-${idx}`}
                                  draggable={true}
                                  onDragStart={(e) => {
                                    setDraggedIndex(idx);
                                    e.dataTransfer.effectAllowed = 'move';
                                    e.dataTransfer.setData('text/plain', idx.toString());
                                  }}
                                  onDragEnd={() => {
                                    setDraggedIndex(null);
                                  }}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                    if (draggedIndex !== null && draggedIndex !== idx) {
                                      const newImages = [...reorderImages];
                                      const [moved] = newImages.splice(draggedIndex, 1);
                                      newImages.splice(idx, 0, moved);
                                      setReorderImages(newImages);
                                      setDraggedIndex(idx);
                                    }
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    setDraggedIndex(null);
                                  }}
                                  className={`flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border cursor-grab active:cursor-grabbing select-none hover:border-[#c800ff]/30 hover:shadow-md transition-all ${
                                    draggedIndex === idx ? 'opacity-40 border-[#c800ff] scale-[0.98]' : 'border-gray-100'
                                  }`}
                                  style={{ touchAction: 'none' }}
                                >
                                  <GripVertical className="text-gray-400 flex-shrink-0" size={20} />
                                  <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 pointer-events-none">
                                    <img src={url} alt={alt || 'Product image'} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 pointer-events-none">
                                    <p className="font-bold text-sm">Image {idx + 1}</p>
                                    {alt && <p className="text-xs text-gray-500 mt-0.5">{alt}</p>}
                                    {isPrimary && <span className="text-[10px] font-bold text-[#c800ff] bg-[#f0e1f7] px-2 py-0.5 rounded-lg inline-block mt-1">Cover Image</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setIsReordering(false)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50">Cancel</button>
                            <button type="button" onClick={handleSaveReorder} className="px-5 py-2.5 bg-[#c800ff] text-white rounded-xl font-bold text-sm hover:bg-[#b500e6]">Save New Order</button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center">
                          {/* Main Image Window */}
                          <div className="relative w-full max-w-lg aspect-square bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center group mb-6">
                            {stagedImages && stagedImages.length > 0 ? (() => {
                              const safeIdx = Math.min(selectedImageIndex, stagedImages.length - 1);
                              const previewUrl = stagedImages[safeIdx]?.url;
                              return previewUrl ? (
                                <img src={previewUrl} alt="Main preview" className="w-full h-full object-contain" />
                              ) : (
                                <div className="text-gray-400 flex flex-col items-center gap-2">
                                  <ImageIcon size={48} strokeWidth={1} />
                                  <span className="text-sm font-medium">No preview available</span>
                                </div>
                              );
                            })() : (
                              <div className="text-gray-400 flex flex-col items-center gap-2">
                                <ImageIcon size={48} strokeWidth={1} />
                                <span className="text-sm font-medium">No images uploaded</span>
                              </div>
                            )}

                            {stagedImages && stagedImages.length > 1 && (
                              <>
                                <button type="button" onClick={() => setSelectedImageIndex(prev => Math.max(0, prev - 1))} disabled={selectedImageIndex === 0} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-md rounded-r-full shadow-md flex items-center justify-center text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition opacity-80 hover:opacity-100 focus:opacity-100">
                                  <ChevronLeft size={24} />
                                </button>
                                <button type="button" onClick={() => setSelectedImageIndex(prev => Math.min((stagedImages?.length || 1) - 1, prev + 1))} disabled={selectedImageIndex === (stagedImages?.length || 1) - 1} className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-md rounded-l-full shadow-md flex items-center justify-center text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition opacity-80 hover:opacity-100 focus:opacity-100">
                                  <ChevronRight size={24} />
                                </button>
                              </>
                            )}

                            {stagedImages && stagedImages.length > 0 && stagedImages[Math.min(selectedImageIndex, stagedImages.length - 1)]?.isPrimary && (
                              <div className="absolute top-4 left-4 bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                                <CheckCircle2 size={14} /> Cover Image
                              </div>
                            )}
                          </div>

                          <div className="text-xs font-semibold text-gray-500 mb-3 bg-purple-50 text-purple-700 px-3.5 py-1.5 rounded-full border border-purple-100 shadow-sm flex items-center gap-1.5">
                            <span>{(stagedImages?.length || 0)} / 10 Images Uploaded</span>
                            <span>•</span>
                            <span className="font-extrabold">{10 - (stagedImages?.length || 0)} more can be added</span>
                          </div>

                          {/* Thumbnails */}
                          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-2xl mb-8">
                            {stagedImages?.map((img, idx) => {
                              const url = img?.url;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => { setSelectedImageIndex(idx); setEditingAltIndex(null); }}
                                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-[#c800ff] shadow-md scale-110' : 'border-transparent hover:border-gray-300 opacity-60 hover:opacity-100'}`}
                                >
                                  <img src={url} className="w-full h-full object-cover" alt="" />
                                </button>
                              );
                            })}
                            {(stagedImages?.length || 0) < 10 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReorderImages(stagedImages);
                                  setIsUploadModalOpen(true);
                                }}
                                className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#c800ff] text-gray-400 hover:text-[#c800ff] flex items-center justify-center transition-all bg-white"
                              >
                                <Plus size={24} />
                              </button>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {stagedImages && stagedImages.length > 0 && (() => {
                            const currentImg = stagedImages[selectedImageIndex];
                            const isPrimary = currentImg?.isPrimary;
                            const hasAlt = Boolean(currentImg?.alt);
                            const altText = currentImg?.alt || '';

                            return (
                              <div className="flex flex-wrap justify-center gap-3 w-full">
                                <button type="button" onClick={() => replaceInputRef.current?.click()} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#c800ff] rounded-2xl text-sm font-bold flex items-center gap-2 transition">
                                  <UploadCloud size={16} /> Change Image
                                </button>
                                {!isPrimary && (
                                  <button type="button" onClick={handleSetCoverImage} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#c800ff] rounded-2xl text-sm font-bold flex items-center gap-2 transition">
                                    <Check size={16} /> Set as Cover
                                  </button>
                                )}
                                <button type="button" onClick={() => { setEditingAltIndex(selectedImageIndex); setAltTextInput(altText); }} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#c800ff] rounded-2xl text-sm font-bold flex items-center gap-2 transition">
                                  <Edit2 size={16} /> {hasAlt ? 'Edit Alt Text' : 'Add Alt Text'}
                                </button>
                                <button type="button" onClick={() => setImageToDelete(currentImg as any)} className="px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl text-sm font-bold flex items-center gap-2 transition">
                                  <Trash2 size={16} /> Delete
                                </button>
                              </div>
                            );
                          })()}

                          {/* Alt text edit popup inline */}
                          {editingAltIndex !== null && (
                            <div className="mt-6 w-full max-w-md bg-white p-4 rounded-2xl shadow-sm border border-[#e4d3e0] animate-in fade-in zoom-in-95">
                              <label className="text-xs font-bold text-gray-600 mb-1.5 block">Image Alt Text</label>
                              <input type="text" value={altTextInput} onChange={(e) => setAltTextInput(e.target.value)} placeholder="Describe the image for SEO" className="w-full p-3 rounded-xl border focus:border-[#c800ff] outline-none text-sm mb-3" />
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setEditingAltIndex(null)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="button" onClick={handleSaveAltText} className="px-4 py-2 text-xs font-bold bg-[#c800ff] text-white rounded-lg hover:bg-[#b500e6]">Save Alt Text</button>
                              </div>
                            </div>
                          )}

                        </div>
                      )}

                      {/* Hidden inputs */}
                      <input type="file" ref={replaceInputRef} accept="image/*" onChange={handleImageReplace} className="hidden" />

                      {/* Delete Confirmation */}
                      {imageToDelete && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                              <Trash2 size={24} />
                            </div>
                            <h4 className="text-center font-bold text-lg text-gray-800 mb-2">Delete Image?</h4>
                            <p className="text-center text-sm text-gray-500 mb-6">Are you sure you want to remove this product image? This action cannot be undone.</p>
                            <div className="flex gap-3">
                              <button type="button" onClick={() => setImageToDelete(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition">Cancel</button>
                              <button type="button" onClick={handleDeleteImage} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition">{isImageActionLoading ? 'Deleting...' : 'Delete'}</button>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Footer — only shown for the multi-step detailed form, NOT in Quick Add mode */}
            {!quickAddMode && (
              <div className="px-5 md:px-8 py-5 md:py-6 border-t bg-gray-50 flex justify-between items-center z-10 relative">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isSaving || isImageActionLoading || isImageUploading}
                  className="flex items-center justify-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-40 font-bold transition"
                >
                  <ChevronLeft size={20} /> Previous
                </button>

                <div className="flex flex-col items-end gap-1">
                  {(isSaving || isImageUploading || isImageActionLoading) && loadingMessage && (
                    <span className="text-xs text-[#912cad] font-semibold animate-pulse text-right">{loadingMessage}</span>
                  )}
                  <div className="flex gap-3 md:gap-4">
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={isSaving || isImageActionLoading || isImageUploading}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] disabled:opacity-60 text-white rounded-2xl font-bold transition shadow-md shadow-fuchsia-100"
                      >
                        Next <ChevronRight size={20} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSaving || isImageActionLoading || isImageUploading}
                        className="flex items-center justify-center gap-2 px-10 py-3 bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] disabled:opacity-60 text-white rounded-2xl font-extrabold transition shadow-lg shadow-fuchsia-200"
                      >
                        {isSaving || isImageActionLoading || isImageUploading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {loadingMessage || 'Processing…'}
                          </>
                        ) : (
                          <>
                            <Check size={20} strokeWidth={3} />
                            {editingItem ? 'Update Product' : 'Create Product'}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div >
        </div >
      )}
      </AnimatePresence>

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onComplete={handleImageModalComplete}
        onSkip={() => setIsUploadModalOpen(false)}
        mode="add"
        existingImagesCount={stagedImages?.length || 0}
      />

      {imageToReplace && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 flex flex-col">
            <h4 className="font-bold text-lg text-gray-800 mb-4 text-center">Replace Image</h4>
            
            <div className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4 border border-gray-200">
              <img src={imageToReplace.preview} alt="New Preview" className="w-full h-full object-cover" />
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-gray-600 mb-1.5 block">Image Alt Text <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={imageToReplace.alt} 
                onChange={(e) => setImageToReplace({ ...imageToReplace, alt: e.target.value })} 
                placeholder="Describe the image for SEO" 
                className="w-full p-3 rounded-xl border focus:border-[#c800ff] outline-none text-sm" 
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={handleCancelReplace} disabled={isImageActionLoading} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition">Cancel</button>
              <button type="button" onClick={handleConfirmReplace} disabled={isImageActionLoading || !imageToReplace.alt.trim()} className="flex-1 py-3 bg-[#c800ff] hover:bg-[#b500e6] disabled:opacity-50 text-white rounded-2xl font-bold transition flex items-center justify-center gap-2">
                {isImageActionLoading ? 'Saving...' : 'Save Image & Alt Text'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 flex flex-col">
            <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertCircle size={24} />
            </div>
            <h4 className="text-center font-bold text-lg text-gray-800 mb-2">Unsaved Changes</h4>
            <p className="text-center text-sm text-gray-500 mb-6">You have unsaved changes. Do you want to save them before leaving?</p>
            <div className="flex gap-3">
              <button type="button" onClick={closeModalAndReset} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition">Discard</button>
              <button type="button" onClick={() => setShowCancelConfirm(false)} className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-2xl font-bold transition">Cancel</button>
              <button type="button" onClick={() => { setShowCancelConfirm(false); void saveData(); }} disabled={isSaving} className="flex-1 py-3 bg-[#c800ff] hover:bg-[#b500e6] disabled:opacity-60 text-white rounded-2xl font-bold transition">{isSaving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
