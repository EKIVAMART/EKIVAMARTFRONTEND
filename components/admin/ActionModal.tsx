'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, ChevronLeft, ChevronRight, Layers, DollarSign, Info, Tag } from 'lucide-react';

interface ProductFormData {
  id?: string;
  name: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  originalPrice: number;
  discountPercent: number;
  sellingPrice: number;
  stock: number;
  inStock: boolean;
  brand?: string;           
  weight: number;           
  sizes: string[];          
  material?: string;
  fitType?: string;
  careInstructions?: string;
  origin?: string;
  images: string[];
}

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'products' | 'vendors';
  editingItem?: any;
  onSave?: (data: any) => void;
}

const categories = ['Fashion', 'Electronics', 'Bags', 'Footwear', 'Groceries', 'Beauty', 'Wellness', 'Jewellery', 'Home Decor', 'Sports', 'Toys & Games'];
const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ActionModal({ 
  isOpen, 
  onClose, 
  activeTab, 
  editingItem,
  onSave 
}: ActionModalProps) {
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    name: editingItem?.name || '',
    category: editingItem?.category || categories[0],
    shortDescription: editingItem?.shortDescription || '',
    fullDescription: editingItem?.fullDescription || editingItem?.description || '',
    originalPrice: editingItem?.mrp || editingItem?.originalPrice || 0,
    discountPercent: editingItem?.discountPercent || 0,
    sellingPrice: editingItem?.price || 0,
    stock: editingItem?.stock || 0,
    inStock: editingItem?.inStock ?? true,
    brand: editingItem?.brand || '',
    weight: editingItem?.weight || 0,
    sizes: editingItem?.sizes || [],
    material: editingItem?.material || '',
    fitType: editingItem?.fitType || '',
    careInstructions: editingItem?.careInstructions || '',
    origin: editingItem?.origin || '',
    images: editingItem?.images || [],
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>(editingItem?.images || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalSteps = 4;

  // Auto-calculate selling price
  useEffect(() => {
    const discountAmount = (formData.originalPrice * formData.discountPercent) / 100;
    const calculated = Math.max(0, Math.round(formData.originalPrice - discountAmount));
    setFormData(prev => ({ ...prev, sellingPrice: calculated }));
  }, [formData.originalPrice, formData.discountPercent]);

  const updateField = (key: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleSize = (size: string) => {
    const current = formData.sizes;
    const updated = current.includes(size)
      ? current.filter(s => s !== size)
      : [...current, size];
    updateField('sizes', updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 6));
  };

  const removeImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const nextStep = () => currentStep < totalSteps && setCurrentStep(prev => prev + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(prev => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.sizes.length === 0) {
      alert("Please select at least one size");
      return;
    }
    if (formData.weight <= 0) {
      alert("Please enter a valid weight");
      return;
    }

    const dataToSave = {
      ...formData,
      images: imagePreviews,
      rating: [],                  
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave?.(dataToSave);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setImagePreviews([]);
    onClose();
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
            className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 md:max-h-[90vh] max-h-full flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#981d87] px-8 py-6 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingItem ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-sm opacity-90 mt-1">Step {currentStep} of {totalSteps}</p>
              </div>
              <button onClick={handleClose} className="p-3 hover:bg-white/20 rounded-2xl transition-colors">
                <X size={26} />
              </button>
            </div>

            {/* Progress Stepper */}
            <div className="px-8 pt-8 pb-6 bg-white border-b">
              <div className="flex items-center justify-center gap-3">
                {[1, 2, 3, 4].map((stepNum, index) => (
                  <React.Fragment key={stepNum}>
                    <div className="flex flex-col items-center">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all
                        ${currentStep > stepNum ? 'bg-[#981d87] border-[#981d87] text-white' : ''}
                        ${currentStep === stepNum ? 'bg-[#981d87] border-[#981d87] text-white shadow-lg' : ''}
                        ${currentStep < stepNum ? 'bg-white border-gray-200 text-gray-400' : ''}`}
                      >
                        {currentStep > stepNum ? <Check size={22} strokeWidth={3} /> : stepNum}
                      </div>
                      <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${currentStep >= stepNum ? 'text-[#981d87]' : 'text-gray-400'}`}>
                        {stepNum === 1 && 'Basic'}
                        {stepNum === 2 && 'Images'}
                        {stepNum === 3 && 'Pricing'}
                        {stepNum === 4 && 'Details'}
                      </span>
                    </div>
                    {index < 3 && <div className={`flex-1 h-[2px] mt-5 ${currentStep > stepNum ? 'bg-[#981d87]' : 'bg-gray-100'}`} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
              {/* STEP 1: Basic */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#981d87] rounded-lg text-white"><Layers size={22} /></div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">Basic Information</h3>
                      <p className="text-xs text-gray-500">Core product details</p>
                    </div>
                  </div>

                  <input type="text" placeholder="Product Name *" value={formData.name} onChange={e => updateField('name', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" required />

                  {/* Category with descriptive header */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-[#981d87] rounded-lg text-white"><Tag size={20} /></div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Product Category</h4>
                        <p className="text-xs text-gray-500">Choose the category that best describes your product. This helps customers find it easily in the store.</p>
                      </div>
                    </div>
                    <select value={formData.category} onChange={e => updateField('category', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" required>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <textarea placeholder="Short Description (for previews) *" value={formData.shortDescription} onChange={e => updateField('shortDescription', e.target.value)} rows={2} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm resize-y" required />

                  <textarea placeholder="Full Description *" value={formData.fullDescription} onChange={e => updateField('fullDescription', e.target.value)} rows={5} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm resize-y" required />

                  <input type="text" placeholder="Brand (Optional)" value={formData.brand || ''} onChange={e => updateField('brand', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" />
                </div>
              )}

              {/* STEP 2: Images */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#981d87] rounded-lg text-white"><Upload size={22} /></div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">Product Images</h3>
                      <p className="text-xs text-gray-500">Upload up to 6 high-quality images</p>
                    </div>
                  </div>

                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[#fcedf9] rounded-3xl p-12 bg-[#F8FDFF] flex flex-col items-center cursor-pointer hover:bg-[#F0F9FA]">
                    <div className="bg-[#981d87] text-white p-4 rounded-2xl mb-4"><Upload size={36} /></div>
                    <p className="font-bold text-gray-700">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP • Max 6 images</p>
                  </div>
                  <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleImageUpload} />

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                      {imagePreviews.map((preview, i) => (
                        <div key={i} className="relative group">
                          <img src={preview} alt="" className="w-full aspect-square object-cover rounded-2xl border" />
                          <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Pricing & Inventory */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#981d87] rounded-lg text-white"><DollarSign size={22} /></div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">Pricing & Inventory</h3>
                      <p className="text-xs text-gray-500">Set price, stock, and key product specifications</p>
                    </div>
                  </div>

                  {/* Price & Discount */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Original Price (₦) *</label>
                      <input type="number" value={formData.originalPrice} onChange={e => updateField('originalPrice', Number(e.target.value))} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Discount (%) </label>
                      <input type="number" min="0" max="99" value={formData.discountPercent} onChange={e => updateField('discountPercent', Number(e.target.value))} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Selling Price (Auto-calculated)</label>
                    <div className="p-4 rounded-2xl bg-[#F0F7F8] text-2xl font-semibold text-[#981d87]">
                      ₦{formData.sellingPrice.toLocaleString()}
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Stock Quantity *</label>
                      <input type="number" value={formData.stock} onChange={e => updateField('stock', Number(e.target.value))} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" required />
                    </div>
                    <div className="flex items-center pt-8">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={formData.inStock} onChange={e => updateField('inStock', e.target.checked)} className="w-5 h-5 text-[#981d87]" />
                        <span className="font-medium text-gray-700">In Stock</span>
                      </label>
                    </div>
                  </div>

                  {/* Weight & Sizes */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Weight (kg) *</label>
                      <input type="number" step="0.01" value={formData.weight} onChange={e => updateField('weight', Number(e.target.value))} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" required min="0.01" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-3 block">Available Sizes <span className="text-gray-600">*</span></label>
                    <div className="flex flex-wrap gap-3">
                      {availableSizes.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`px-6 py-3 rounded-2xl font-medium transition ${formData.sizes.includes(size) ? 'bg-[#981d87] text-white shadow' : 'bg-[#F0F7F8] hover:bg-white border border-gray-200'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {formData.sizes.length === 0 && <p className="text-red-500 text-xs mt-1">Please select at least one size</p>}
                  </div>
                </div>
              )}

              {/* STEP 4: Additional Details */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#981d87] rounded-lg text-white"><Info size={22} /></div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">Additional Details</h3>
                      <p className="text-xs text-gray-500">More specifications for the product page</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Material</label>
                      <input type="text" value={formData.material} onChange={e => updateField('material', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" placeholder="Cotton Blend" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1.5 block">Fit Type</label>
                      <input type="text" value={formData.fitType} onChange={e => updateField('fitType', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" placeholder="Regular Fit" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Care Instructions</label>
                    <textarea value={formData.careInstructions} onChange={e => updateField('careInstructions', e.target.value)} rows={3} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" placeholder="Machine wash cold, tumble dry low..." />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Origin</label>
                    <input type="text" value={formData.origin} onChange={e => updateField('origin', e.target.value)} className="w-full p-3.5 rounded-2xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none text-sm" placeholder="Manufactured in Nigeria" />
                  </div>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="px-8 py-6 border-t bg-gray-50 flex justify-between items-center">
              <button type="button" onClick={prevStep} disabled={currentStep === 1} className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-40 font-medium transition">
                <ChevronLeft size={20} /> Previous
              </button>

              {currentStep < totalSteps ? (
                <button type="button" onClick={nextStep} className="flex items-center gap-2 px-8 py-3 bg-[#981d87] hover:bg-[#7a176c] text-white rounded-2xl font-semibold transition">
                  Next <ChevronRight size={20} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} className="flex items-center gap-2 px-10 py-3 bg-[#981d87] hover:bg-[#7a176c] text-white rounded-2xl font-semibold transition shadow-lg">
                  <Check size={20} />
                  {editingItem ? 'Update Product' : 'Add Product'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}