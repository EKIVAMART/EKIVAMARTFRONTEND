'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Check, ChevronLeft, ChevronRight, Layers, DollarSign, Info, Plus, Trash2 } from 'lucide-react';

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
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
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  images?: string[]; // Allowed optional, for the API
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

const clampDiscount = (value: unknown) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) return 0;
  return Math.min(99, numberValue);
};

const fieldLabels: Record<string, string> = {
  categoryId: 'Product category',
  name: 'Product name',
  preview: 'Preview',
  description: 'Description',
  compareAtPrice: 'Original price',
  stock: 'Stock quantity',
  brand: 'Brand',
  returnWindow: 'Return window',
  returnShipping: 'Return shipping',
  warrantyPeriod: 'Warranty period',
  sku: 'SKU',
  discount: 'Discount',
  currency: 'Currency',
  costPerItem: 'Cost per item',
  condition: 'Condition',
  weight: 'Weight',
  color: 'Colour',
  size: 'Size',
  dimensions: 'Dimensions',
  tags: 'Tags',
  metadata: 'Specifications',
  vendorId: 'Vendor account',
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
  });

  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [customFields, setCustomFields] = useState<Array<{ key: string, value: string }>>([]);
  const [seoExpanded, setSeoExpanded] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [colourInput, setColourInput] = useState('');
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const selectedCategory = findCategory(categories, formData.categoryId);
  const selectedCategoryName = selectedCategory?.name || formData.categoryId;
  const selectedCategoryValue = selectedCategory?.id || formData.categoryId;
  const normalizedCategoryName = selectedCategoryName.trim().toLowerCase();
  const isSelectedCategory = (name: string) =>
    normalizedCategoryName === name.toLowerCase();

  const updateField = <Key extends keyof ProductFormData>(
    key: Key,
    value: ProductFormData[Key]
  ) => {
    setSaveErrors([]);
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: editingItem?.id || '',
        vendorId: editingItem?.vendorId || currentUserId,
        name: editingItem?.name || '',
        preview: editingItem?.preview || '',
        description: editingItem?.description || '',
        sku: editingItem?.sku || '',
        price: editingItem?.price || 0,
        compareAtPrice: editingItem?.compareAtPrice || 0,
        costPerItem: editingItem?.costPerItem || 0,
        currency: editingItem?.currency || 'NGN',
        condition: editingItem?.condition || 'new',
        stock: editingItem?.stock || 0,
        inStock: editingItem?.inStock ?? true,
        categoryId: editingItem?.categoryId || '',
        subCategoryId: editingItem?.subCategoryId || '',
        brand: editingItem?.brand || '',
        colours: (editingItem as any)?.colours || ((editingItem as any)?.colour ? [(editingItem as any).colour] : []),
        sizes: editingItem?.sizes || [],
        weight: editingItem?.weight || 0,
        dimensions: editingItem?.dimensions || { length: 0, width: 0, height: 0 },
        tags: editingItem?.tags || [],
        metadata: editingItem?.metadata || {},
        origin: editingItem?.origin || 'Nigeria',
        returnWindow: editingItem?.returnWindow || 'Use Store Default',
        whoPaysReturnShipping: editingItem?.whoPaysReturnShipping || 'Use Store Default',
        returnConditions: editingItem?.returnConditions || '',
        warrantyPeriod: editingItem?.warrantyPeriod || 'Use Store Default',
        warrantyDetails: editingItem?.warrantyDetails || '',
        status: editingItem?.status || 'draft',
        images: editingItem?.images || [],
      });

      let initialDiscount = 0;
      if ((editingItem as any)?.discount) {
        initialDiscount = (editingItem as any).discount;
      } else if (editingItem?.compareAtPrice && editingItem?.price) {
        initialDiscount = Math.round(((editingItem.compareAtPrice - editingItem.price) / editingItem.compareAtPrice) * 100);
      }
      setDiscountPercent(initialDiscount);

      const fields = [];
      if (editingItem?.metadata?.customAttributes) {
        for (const [k, v] of Object.entries(editingItem.metadata.customAttributes)) {
          fields.push({ key: k, value: String(v) });
        }
      }
      setCustomFields(fields);
      setCurrentStep(1);
      setTagInput('');
      setSizeInput('');
      setColourInput('');
      setSaveErrors([]);
      setIsSaving(false);
      setSeoExpanded(false);
    }
  }, [isOpen, editingItem, currentUserId]);

  // Auto calculate selling price when compareAtPrice or discount changes
  useEffect(() => {
    if (formData.compareAtPrice && discountPercent >= 0) {
      const discountAmount = (formData.compareAtPrice * discountPercent) / 100;
      const calculated = Math.max(0, Math.round(formData.compareAtPrice - discountAmount));
      updateField('price', calculated);
    }
  }, [formData.compareAtPrice, discountPercent]);

  const updateMetadata = (key: string, value: any) => {
    setSaveErrors([]);
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value }
    }));
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        updateField('tags', [...formData.tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter(t => t !== tagToRemove));
  };

  const addSize = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && sizeInput.trim()) {
      e.preventDefault();
      if (!formData.sizes.includes(sizeInput.trim())) {
        updateField('sizes', [...formData.sizes, sizeInput.trim()]);
      }
      setSizeInput('');
    }
  };

  const removeSize = (sizeToRemove: string) => {
    updateField('sizes', formData.sizes.filter(s => s !== sizeToRemove));
  };

  const addColour = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && colourInput.trim()) {
      e.preventDefault();
      if (!formData.colours.includes(colourInput.trim())) {
        updateField('colours', [...formData.colours, colourInput.trim()]);
      }
      setColourInput('');
    }
  };

  const removeColour = (colourToRemove: string) => {
    updateField('colours', formData.colours.filter(c => c !== colourToRemove));
  };

  const generateSEO = () => {
    if (!formData.name) return;
    updateMetadata('seoTitle', `${formData.name} - Buy on Faflora`);
    updateMetadata('seoDescription', `Shop ${formData.name} on Faflora. ${formData.preview.substring(0, 100)}... Get the best deals today.`);
  };

  const saveData = async (statusOverride?: ProductFormData['status']) => {
    if (isSaving) return;

    // Collect custom attributes
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

    if (!finalData.price) finalData.price = 0;

    setSaveErrors([]);
    setIsSaving(true);

    try {
      await onSave?.(finalData);
      handleClose();
    } catch (error) {
      setSaveErrors(formatSaveError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      nextStep();
      return;
    }
    // Only allow submitting if required fields exist, though it's fine for drafts
    void saveData();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSaveErrors([]);
    setIsSaving(false);
    onClose();
  };

  const nextStep = () => currentStep < totalSteps && setCurrentStep(prev => prev + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(prev => prev - 1);

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
                <motion.div
                  role="alertdialog"
                  aria-modal="false"
                  initial={{ opacity: 0, y: -14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.98 }}
                  className="absolute left-4 right-4 top-4 z-30 mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-2xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-red-100 p-2 text-red-600">
                      <AlertCircle size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-red-800">Please fix these details before saving your draft.</p>
                      <ul className="mt-2 list-disc space-y-1 pl-4">
                        {saveErrors.map((error, index) => (
                          <li key={`${error}-${index}`}>{error}</li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSaveErrors([])}
                      className="rounded-xl p-2 text-red-500 transition hover:bg-red-50"
                      aria-label="Dismiss validation errors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#c800ff] to-[#912cad] px-5 md:px-8 py-5 md:py-6 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingItem ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-sm opacity-90 mt-1">Step {currentStep} of {totalSteps}</p>
              </div>
              <button onClick={handleClose} type="button" className="p-3 hover:bg-white/20 rounded-2xl transition-colors">
                <X size={26} />
              </button>
            </div>

            {/* Progress Stepper */}
            <div className="px-5 md:px-8 pt-6 md:pt-8 pb-5 md:pb-6 bg-white border-b">
              <div className="flex items-center justify-center gap-3">
                {[1, 2, 3].map((stepNum, index) => (
                  <React.Fragment key={stepNum}>
                    <div className="flex flex-col items-center z-10 bg-white">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all
                        ${currentStep > stepNum ? 'bg-gradient-to-r from-[#c800ff] to-[#912cad] border-[#c800ff] text-white' : ''}
                        ${currentStep === stepNum ? 'bg-gradient-to-r from-[#c800ff] to-[#912cad] border-[#c800ff] text-white shadow-lg' : ''}
                        ${currentStep < stepNum ? 'bg-white border-gray-200 text-gray-400' : ''}`}
                      >
                        {currentStep > stepNum ? <Check size={22} strokeWidth={3} /> : stepNum}
                      </div>
                      <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${currentStep >= stepNum ? 'text-[#c800ff]' : 'text-gray-400'}`}>
                        {stepNum === 1 && 'Basic'}
                        {stepNum === 2 && 'Pricing'}
                        {stepNum === 3 && 'Details'}
                      </span>
                    </div>
                    {index < 2 && <div className={`flex-1 h-[2px] mt-5 relative -z-0 ${currentStep > stepNum ? 'bg-gradient-to-r from-[#c800ff] to-[#912cad]' : 'bg-gray-100'}`} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8" onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as any).tagName !== 'TEXTAREA') e.preventDefault() }}>
              {/* STEP 1: Basic */}
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
                        onChange={e => updateField('categoryId', e.target.value)}
                        className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm"
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
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Sub Category</label>
                      <input type="text" value={formData.subCategoryId} onChange={e => updateField('subCategoryId', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Preview <span className="text-[#c800ff] ml-1">*</span></label>
                    <textarea value={formData.preview} onChange={e => updateField('preview', e.target.value)} rows={2} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm resize-y" required />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Full Description <span className="text-[#c800ff] ml-1">*</span></label>
                    <textarea value={formData.description} onChange={e => updateField('description', e.target.value)} rows={5} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm resize-y" required />
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
                          <span key={t} className="bg-[#e9d2e5] text-[#c800ff] text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                            {t} <X size={12} className="cursor-pointer" onClick={() => removeTag(t)} />
                          </span>
                        ))}
                        <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} className="bg-transparent outline-none flex-1 min-w-[80px] text-sm focus:!ring-0 focus:!border-transparent" placeholder="Add tag..." />
                      </div>
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
                      <p className="text-xs text-gray-500">Set price, stock, variants and shipping metrics</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Compare at / Original Price (₦) <span className="text-[#c800ff] ml-1">*</span></label>
                      <input type="number" value={formData.compareAtPrice || ''} onChange={e => updateField('compareAtPrice', Number(e.target.value))} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Discount (%)</label>
                      <input type="number" min="0" max="99" value={discountPercent || ''} onChange={e => setDiscountPercent(clampDiscount(e.target.value))} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Selling Price (₦) <span className="text-[#c800ff] ml-1">*</span></label>
                      <input type="number" value={formData.price || ''} readOnly className="w-full p-3.5 rounded-2xl border bg-gray-100 cursor-not-allowed outline-none text-sm font-bold text-[#c800ff]" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Cost per Item (₦)</label>
                      <input type="number" value={formData.costPerItem || ''} onChange={e => updateField('costPerItem', Number(e.target.value))} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Stock Quantity <span className="text-[#c800ff] ml-1">*</span></label>
                      <input type="number" min="0" step="1" value={formData.stock || ''} onChange={e => updateField('stock', toNonNegativeInteger(e.target.value))} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" required />
                    </div>
                    <div className="flex items-center pt-2 md:pt-8">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={formData.inStock} onChange={e => updateField('inStock', e.target.checked)} className="w-5 h-5 text-[#c800ff] rounded" />
                        <span className="font-bold text-gray-700 text-sm">In Stock</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Condition</label>
                      <select value={formData.condition} onChange={e => updateField('condition', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm">
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="refurbished">Refurbished</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Colours (Press Enter to add)</label>
                      <div className="w-full p-2.5 rounded-2xl border bg-[#F0F7F8] focus-within:bg-white focus-within:ring-2 focus-within:border-[#c800ff] focus-within:ring-[#c800ff]/20 ring-[#E0F2F3] min-h-[50px] flex flex-wrap gap-2 items-center">
                        {formData.colours.map(c => (
                          <span key={c} className="bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-2">
                            {c} <X size={12} className="cursor-pointer" onClick={() => removeColour(c)} />
                          </span>
                        ))}
                        <input type="text" value={colourInput} onChange={e => setColourInput(e.target.value)} onKeyDown={addColour} className="bg-transparent outline-none flex-1 min-w-[120px] text-sm focus:!ring-0 focus:!border-transparent" placeholder="e.g. Black, White, Red..." />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Available Sizes (Press Enter to add)</label>
                    <div className="w-full p-2.5 rounded-2xl border bg-[#F0F7F8] focus-within:bg-white focus-within:ring-2 focus-within:border-[#c800ff] focus-within:ring-[#c800ff]/20 ring-[#E0F2F3] min-h-[50px] flex flex-wrap gap-2 items-center">
                      {formData.sizes.map(s => (
                        <span key={s} className="bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-2">
                          {s} <X size={12} className="cursor-pointer" onClick={() => removeSize(s)} />
                        </span>
                      ))}
                      <input type="text" value={sizeInput} onChange={e => setSizeInput(e.target.value)} onKeyDown={addSize} className="bg-transparent outline-none flex-1 min-w-[120px] text-sm focus:!ring-0 focus:!border-transparent" placeholder="e.g. EU 42, 256GB, XL..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Weight (kg)</label>
                      <input type="number" step="0.01" value={formData.weight || ''} onChange={e => updateField('weight', Number(e.target.value))} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Length (cm)</label>
                      <input type="number" step="0.1" value={formData.dimensions.length || ''} onChange={e => updateField('dimensions', { ...formData.dimensions, length: Number(e.target.value) })} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Width (cm)</label>
                      <input type="number" step="0.1" value={formData.dimensions.width || ''} onChange={e => updateField('dimensions', { ...formData.dimensions, width: Number(e.target.value) })} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Height (cm)</label>
                      <input type="number" step="0.1" value={formData.dimensions.height || ''} onChange={e => updateField('dimensions', { ...formData.dimensions, height: Number(e.target.value) })} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Additional Details / Specifications */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-[#c800ff] to-[#912cad] rounded-lg text-white"><Info size={22} /></div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">Additional Details</h3>
                      <p className="text-xs text-gray-500">Policies, specs, and SEO details</p>
                    </div>
                  </div>

                  {/* General */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <h4 className="font-bold text-gray-700 mb-4 text-sm">General</h4>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Origin / Manufactured in</label>
                      <input type="text" value={formData.origin} onChange={e => updateField('origin', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" />
                    </div>
                  </div>

                  {/* Return Policy */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <h4 className="font-bold text-gray-700 mb-4 text-sm">Return Policy</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1.5 block">Return Window</label>
                        <select value={formData.returnWindow} onChange={e => updateField('returnWindow', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm">
                          <option value="Use Store Default">Use Faflora Store Default</option>
                          <option value="3">3 days</option>
                          <option value="7 days">7 days</option>
                          <option value="14 days">14 days</option>
                          <option value="30 days">30 days</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1.5 block">Who Pays Return Shipping?</label>
                        <select value={formData.whoPaysReturnShipping} onChange={e => updateField('whoPaysReturnShipping', e.target.value)} className="w-full p-3.5 rounded-2xl border outline-none text-sm bg-white focus:ring-2 ring-[#E0F2F3]">
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
                      <select value={formData.warrantyPeriod} onChange={e => updateField('warrantyPeriod', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm">
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

                  {/* Dynamic Category Specs */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-[#e4d3e0] border-t-4 border-t-[#c800ff]">
                    <h4 className="font-bold text-gray-700 mb-4 text-sm">Category Specifications: {selectedCategoryName || 'Select a category'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                      {isSelectedCategory('Fashion') && (
                        <>
                          <div>
                            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Material</label>
                            <input type="text" value={formData.metadata.material || ''} onChange={e => updateMetadata('material', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Fit Type</label>
                            <input type="text" value={formData.metadata.fitType || ''} onChange={e => updateMetadata('fitType', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" />
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Care Instructions</label>
                            <input type="text" value={formData.metadata.careInstructions || ''} onChange={e => updateMetadata('careInstructions', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" />
                          </div>
                        </>
                      )}
                      {isSelectedCategory('Footwear') && (
                        <>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Material</label><input type="text" value={formData.metadata.material || ''} onChange={e => updateMetadata('material', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Shoe Size Type</label><input type="text" value={formData.metadata.shoeSize || ''} onChange={e => updateMetadata('shoeSize', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Closure Type</label><input type="text" value={formData.metadata.closureType || ''} onChange={e => updateMetadata('closureType', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                        </>
                      )}
                      {isSelectedCategory('Bags') && (
                        <>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Material</label><input type="text" value={formData.metadata.material || ''} onChange={e => updateMetadata('material', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Strap Type</label><input type="text" value={formData.metadata.strapType || ''} onChange={e => updateMetadata('strapType', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div className="col-span-2"><label className="text-xs font-bold text-gray-600 mb-1.5 block">Compartment Details</label><input type="text" value={formData.metadata.compartmentDetails || ''} onChange={e => updateMetadata('compartmentDetails', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                        </>
                      )}
                      {isSelectedCategory('Electronics') && (
                        <>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Screen Size</label><input type="text" value={formData.metadata.screenSize || ''} onChange={e => updateMetadata('screenSize', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Storage</label><input type="text" value={formData.metadata.storage || ''} onChange={e => updateMetadata('storage', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">RAM</label><input type="text" value={formData.metadata.ram || ''} onChange={e => updateMetadata('ram', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Battery Capacity</label><input type="text" value={formData.metadata.batteryCapacity || ''} onChange={e => updateMetadata('batteryCapacity', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div className="col-span-2"><label className="text-xs font-bold text-gray-600 mb-1.5 block">Operating System</label><input type="text" value={formData.metadata.operatingSystem || ''} onChange={e => updateMetadata('operatingSystem', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                        </>
                      )}
                      {isSelectedCategory('Groceries') && (
                        <>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Pack Size</label><input type="text" value={formData.metadata.packSize || ''} onChange={e => updateMetadata('packSize', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Expiry Date</label><input type="date" value={formData.metadata.expiryDate || ''} onChange={e => updateMetadata('expiryDate', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Storage Instructions</label><input type="text" value={formData.metadata.storageInstructions || ''} onChange={e => updateMetadata('storageInstructions', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Key Ingredients</label><input type="text" value={formData.metadata.keyIngredients || ''} onChange={e => updateMetadata('keyIngredients', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                        </>
                      )}
                      {isSelectedCategory('Beauty') && (
                        <>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Skin Type</label><input type="text" value={formData.metadata.skinType || ''} onChange={e => updateMetadata('skinType', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Product Form</label><input type="text" value={formData.metadata.productForm || ''} onChange={e => updateMetadata('productForm', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div className="col-span-2"><label className="text-xs font-bold text-gray-600 mb-1.5 block">Key Ingredients</label><input type="text" value={formData.metadata.keyIngredients || ''} onChange={e => updateMetadata('keyIngredients', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                        </>
                      )}
                      {isSelectedCategory('Wellness') && (
                        <>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Supplement Type</label><input type="text" value={formData.metadata.supplementType || ''} onChange={e => updateMetadata('supplementType', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Serving Size</label><input type="text" value={formData.metadata.servingSize || ''} onChange={e => updateMetadata('servingSize', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div className="col-span-2"><label className="text-xs font-bold text-gray-600 mb-1.5 block">Key Active Ingredients</label><input type="text" value={formData.metadata.keyActiveIngredients || ''} onChange={e => updateMetadata('keyActiveIngredients', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                        </>
                      )}
                      {isSelectedCategory('Home & Jewellery') && (
                        <div className="col-span-2"><label className="text-xs font-bold text-gray-600 mb-1.5 block">Material</label><input type="text" value={formData.metadata.material || ''} onChange={e => updateMetadata('material', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                      )}
                      {isSelectedCategory('Home Decor') && (
                        <>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Material</label><input type="text" value={formData.metadata.material || ''} onChange={e => updateMetadata('material', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" placeholder="e.g. Wood, Ceramic" /></div>
                          <div>
                            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Style</label>
                            <select value={formData.metadata.style || ''} onChange={e => updateMetadata('style', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm">
                              <option value="">Select Style</option>
                              <option value="Modern">Modern</option><option value="Minimalist">Minimalist</option><option value="Rustic">Rustic</option><option value="Bohemian">Bohemian</option><option value="Classic">Classic</option><option value="Industrial">Industrial</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Room Type</label>
                            <select value={formData.metadata.roomType || ''} onChange={e => updateMetadata('roomType', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm">
                              <option value="">Select Room</option>
                              <option value="Living Room">Living Room</option><option value="Bedroom">Bedroom</option><option value="Kitchen">Kitchen</option><option value="Bathroom">Bathroom</option><option value="Office">Office</option><option value="Outdoor">Outdoor</option>
                            </select>
                          </div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Care Instructions</label><input type="text" value={formData.metadata.careInstructions || ''} onChange={e => updateMetadata('careInstructions', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                        </>
                      )}
                      {isSelectedCategory('Toys and Games') && (
                        <>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Age Range</label><input type="text" value={formData.metadata.ageRange || ''} onChange={e => updateMetadata('ageRange', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" placeholder="e.g. 3-5 years" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Material</label><input type="text" value={formData.metadata.material || ''} onChange={e => updateMetadata('material', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Educational Benefits</label><input type="text" value={formData.metadata.educationalBenefits || ''} onChange={e => updateMetadata('educationalBenefits', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Safety Certification</label><input type="text" value={formData.metadata.safetyCertification || ''} onChange={e => updateMetadata('safetyCertification', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Battery Required</label><input type="text" value={formData.metadata.batteryRequired || ''} onChange={e => updateMetadata('batteryRequired', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" placeholder="e.g. Yes (2x AA)" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Number of Players</label><input type="text" value={formData.metadata.numberOfPlayers || ''} onChange={e => updateMetadata('numberOfPlayers', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" placeholder="e.g. 2-4 players" /></div>
                        </>
                      )}
                      {isSelectedCategory('Sports') && (
                        <>
                          <div>
                            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Sport Type</label>
                            <select value={formData.metadata.sportType || ''} onChange={e => updateMetadata('sportType', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm">
                              <option value="">Select Sport</option>
                              <option value="Football">Football</option><option value="Basketball">Basketball</option><option value="Running">Running</option><option value="Fitness">Fitness</option><option value="Cycling">Cycling</option><option value="Swimming">Swimming</option><option value="Outdoor/Adventures">Outdoor/Adventures</option>
                            </select>
                          </div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Material</label><input type="text" value={formData.metadata.material || ''} onChange={e => updateMetadata('material', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Size / Dimensions</label><input type="text" value={formData.metadata.sizeDimensions || ''} onChange={e => updateMetadata('sizeDimensions', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Weight / Capacity</label><input type="text" value={formData.metadata.weightCapacity || ''} onChange={e => updateMetadata('weightCapacity', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm" /></div>
                          <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Intended Use</label>
                            <select value={formData.metadata.intendedUse || ''} onChange={e => updateMetadata('intendedUse', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-white outline-none text-sm">
                              <option value="">Select Use</option>
                              <option value="Professional">Professional</option><option value="Amateur">Amateur</option><option value="Training">Training</option><option value="Recreational">Recreational</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Custom Attributes */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <h4 className="font-bold text-gray-700 mb-4 text-sm">Custom Attributes</h4>
                    <div className="space-y-3">
                      {customFields.map((field, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-3">
                          <input type="text" placeholder="Key (e.g. Processor)" value={field.key} onChange={e => {
                            const newF = [...customFields]; newF[index].key = e.target.value; setCustomFields(newF);
                          }} className="flex-1 p-3 rounded-xl border bg-white text-sm outline-none" />
                          <input type="text" placeholder="Value (e.g. Intel i7)" value={field.value} onChange={e => {
                            const newF = [...customFields]; newF[index].value = e.target.value; setCustomFields(newF);
                          }} className="flex-1 p-3 rounded-xl border bg-white text-sm outline-none" />
                          <button type="button" onClick={() => setCustomFields(customFields.filter((_, i) => i !== index))} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setCustomFields([...customFields, { key: '', value: '' }])} className="text-sm font-bold text-[#c800ff] flex items-center gap-1 hover:underline">
                        Add Custom Field <Plus size={16} /> 
                      </button>
                    </div>
                  </div>

                  {/* SEO */}
                  <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                    <button type="button" onClick={() => setSeoExpanded(!seoExpanded)} className="w-full p-5 flex justify-between items-center text-left hover:bg-gray-100/50 transition">
                      <h4 className="font-bold text-gray-700 text-sm">SEO (Search Engine Optimization)</h4>
                      <span className="text-gray-400 text-xs">{seoExpanded ? 'Collapse' : 'Expand'}</span>
                    </button>
                    {seoExpanded && (
                      <div className="p-5 border-t border-gray-100 space-y-4 bg-white">
                        <div className="flex justify-end">
                          <button type="button" onClick={generateSEO} className="text-xs font-bold bg-[#f1f8fc] text-[#1c7bb3] px-3 py-1.5 rounded-lg hover:bg-[#e1eff8] transition">
                            Auto-Generate from Product Data
                          </button>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Meta Title</label>
                          <input type="text" value={formData.metadata.seoTitle || ''} onChange={e => updateMetadata('seoTitle', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-gray-50 focus:bg-white focus:ring-2 ring-gray-200 outline-none text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Meta Description</label>
                          <textarea value={formData.metadata.seoDescription || ''} onChange={e => updateMetadata('seoDescription', e.target.value)} rows={3} className="w-full p-3.5 rounded-2xl border bg-gray-50 focus:bg-white focus:ring-2 ring-gray-200 outline-none text-sm resize-y" />
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </form>

            {/* Footer */}
            <div className="px-5 md:px-8 py-5 md:py-6 border-t bg-gray-50 flex flex-col-reverse md:flex-row justify-between items-center gap-4 z-10 relative">
              <button type="button" onClick={prevStep} disabled={currentStep === 1} className="flex items-center justify-center gap-2 px-6 py-3 w-full md:w-auto text-gray-600 hover:text-gray-900 disabled:opacity-40 font-medium transition">
                <ChevronLeft size={20} /> Previous
              </button>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
                <button type="button" onClick={handleClose} className="flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-2xl font-bold transition shadow-sm">
                  Cancel
                </button>
                {currentStep < totalSteps ? (
                  <button type="button" onClick={nextStep} disabled={isSaving} className="flex items-center justify-center gap-2 px-8 py-3 w-full sm:w-auto bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] disabled:opacity-60 text-white rounded-2xl font-semibold transition">
                    Next <ChevronRight size={20} />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={isSaving} className="flex items-center justify-center gap-2 px-10 py-3 w-full sm:w-auto bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] disabled:opacity-60 text-white rounded-2xl font-semibold transition shadow-lg">
                    <Check size={20} />
                    {isSaving ? 'Saving...' : editingItem ? 'Update Product' : 'Save Draft'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
