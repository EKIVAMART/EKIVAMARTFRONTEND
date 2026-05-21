'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle, X, Check, Layers, DollarSign, Info, ChevronLeft, ChevronRight, Trash2, Zap } from 'lucide-react';
import { categoryApi } from '@/lib/api';

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
  origin: string;
  returnWindow: string;
  whoPaysReturnShipping: string;
  returnConditions: string;
  warrantyPeriod: string;
  warrantyDetails: string;
  status: 'draft' | 'active' | 'published' | 'inactive' | 'out_of_stock' | 'discontinued';
  images?: string[];
  weightUnit?: string;
  dimensionsUnit?: string;
}

export type EditableProduct = Partial<ProductFormData>;

export interface ProductCategoryOption {
  id: string;
  name: string;
}

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'products' | 'vendors' | 'orders';
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
        {selectedValues.map(val => (
          <span key={val} className="bg-[#f0e1f7] text-[#912cad] text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 animate-in zoom-in-95 duration-100">
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
  const totalSteps = 3;

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
  const [quickAddMode, setQuickAddMode] = useState(false);
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');
  const [seoExpanded, setSeoExpanded] = useState(false);

  const QuickAddButton = () => (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
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
    setFormData(prev => ({ ...prev, [key]: value }));
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
    const customObj: Record<string, string> = {};
    customFields.forEach(f => {
      if (f.key.trim() && f.value.trim()) {
        customObj[f.key.trim()] = f.value.trim();
      }
    });

    const finalData = {
      ...formData,
      discount: discountPercent,
      stock: toNonNegativeInteger(formData.stock),
      status: statusOverride || formData.status,
      metadata: {
        ...formData.metadata,
        customAttributes: customObj
      }
    };

    setIsSaving(true);
    try {
      await onSave?.(finalData as any);
      handleClose();
    } catch (error) {
      setSaveErrors(formatSaveError(error));
    } finally {
      setIsSaving(false);
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
          <p className="text-xs text-gray-500">Provide the 6 required core product details to instantly create your product draft.</p>
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
    setCurrentStep(1);
    setSaveErrors([]);
    setIsSaving(false);
    setQuickAddMode(false);
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
    } else if (step === 2) {
      if (!formData.compareAtPrice || formData.compareAtPrice <= 0) errors.push('Original price is required.');
      if (formData.stock === undefined || formData.stock < 0) errors.push('Stock is required.');
    }
    return errors;
  };

  if (activeTab !== 'products') return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 md:max-h-[90vh] max-h-full flex flex-col"
          >
            <AnimatePresence>
              {saveErrors.length > 0 && (
                <motion.div className="absolute left-4 right-4 top-4 z-30 mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-2xl">
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
                  {formData.tags.map(t => (
                    <span key={t} className="bg-[#e9d2e5] text-[#c800ff] text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
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
                        <select
                          value={formData.weightUnit || 'kg'}
                          onChange={(e) => updateField('weightUnit', e.target.value)}
                          className="p-3.5 rounded-2xl border bg-white outline-none text-sm font-bold text-gray-700 w-24"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                        </select>
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
    </form>
  )}

            {/* Footer — only shown for the multi-step detailed form, NOT in Quick Add mode */}
  {!quickAddMode && (
    <div className="px-5 md:px-8 py-5 md:py-6 border-t bg-gray-50 flex justify-between items-center z-10 relative">
      <button
        type="button"
        onClick={prevStep}
        disabled={currentStep === 1}
        className="flex items-center justify-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-40 font-bold transition"
      >
        <ChevronLeft size={20} /> Previous
      </button>

      <div className="flex gap-3 md:gap-4">
        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] disabled:opacity-60 text-white rounded-2xl font-bold transition shadow-md shadow-fuchsia-100"
          >
            Next <ChevronRight size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-10 py-3 bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] disabled:opacity-60 text-white rounded-2xl font-extrabold transition shadow-lg shadow-fuchsia-200"
          >
            <Check size={20} strokeWidth={3} />
            {isSaving ? 'Saving...' : editingItem ? 'Update Product' : 'Create Product'}
          </button>
        )}
      </div>
    </div>
  )}
          </motion.div >
        </div >
      )
}
    </AnimatePresence >
  );
}
