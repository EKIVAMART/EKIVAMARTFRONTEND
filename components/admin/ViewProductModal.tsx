import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Tag, Package, ShieldCheck, RefreshCcw, Info, Box } from 'lucide-react';
import { ProductImage } from './ActionModal';

interface ViewProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewProductModal({ product, isOpen, onClose }: ViewProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : product.image ? [{ url: product.image, alt: product.name, isPrimary: true, order: 0 }] : [];

  const mainImage = images[selectedImageIndex];
  const mainImageUrl = mainImage ? (typeof mainImage === 'string' ? mainImage : mainImage.url) : '';

  const compulsoryInfo = [
    { label: 'Price', value: `NGN ${Number(product.price).toLocaleString()}` },
    { label: 'Original Price', value: product.compareAtPrice ? `NGN ${Number(product.compareAtPrice).toLocaleString()}` : '-' },
    { label: 'Stock', value: `${product.stock} items` },
    { label: 'SKU', value: product.sku || '-' },
    { label: 'Brand', value: product.brand || '-' },
    { label: 'Condition', value: product.condition ? product.condition.charAt(0).toUpperCase() + product.condition.slice(1) : '-' },
  ];

  const metadataEntries = Object.entries(product.metadata || {}).filter(([key, value]) => {
    // Filter out some internal or already displayed keys if needed
    if (key === 'customAttributes' || key === 'colours' || key === 'sizes') return false;
    return Boolean(value);
  });

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const isPublished = status === 'active' || status === 'published';
    if (isPublished) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Published
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase border border-amber-200/80">
        {status.replaceAll('_', ' ')}
      </span>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-6xl rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 max-h-full flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#c800ff] to-[#912cad] px-6 sm:px-8 py-5 text-white flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{product.name}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                {getStatusBadge(product.status)}
                {(product.category || product.subCategory) && (
                  <span className="text-xs font-medium text-white/90 bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 flex items-center gap-1.5">
                    <Tag size={12} />
                    {product.category} {product.subCategory ? `› ${product.subCategory}` : ''}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Left Column: Images */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-100 flex flex-col items-center">
                  <div className="relative w-full aspect-square bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex items-center justify-center group mb-4">
                    {mainImageUrl ? (
                      <img src={mainImageUrl} alt={product.name} className="w-full h-full object-contain p-4" />
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center gap-2">
                        <Box size={48} strokeWidth={1} />
                        <span className="text-sm font-medium">No image available</span>
                      </div>
                    )}

                    {images.length > 1 && (
                      <>
                        <button 
                          onClick={() => setSelectedImageIndex(prev => Math.max(0, prev - 1))} 
                          disabled={selectedImageIndex === 0} 
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-slate-700 disabled:opacity-0 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button 
                          onClick={() => setSelectedImageIndex(prev => Math.min(images.length - 1, prev + 1))} 
                          disabled={selectedImageIndex === images.length - 1} 
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-slate-700 disabled:opacity-0 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                      {images.map((img: any, idx: number) => {
                        const url = typeof img === 'string' ? img : img.url;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all bg-white ${
                              selectedImageIndex === idx ? 'border-[#c800ff] shadow-md scale-110' : 'border-transparent hover:border-slate-300 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={url} className="w-full h-full object-cover" alt="" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-3xl">
                  <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <Info size={16} className="text-indigo-500" /> Description
                  </h4>
                  <p className="text-sm text-indigo-900/70 whitespace-pre-line leading-relaxed">
                    {product.description || product.preview || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Right Column: Info */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Compulsory Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {compulsoryInfo.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50 hover:border-fuchsia-200 hover:shadow-fuchsia-50 transition-all">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="text-sm font-black text-slate-800">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Additional Settings */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <RefreshCcw size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">Return: <span className="text-slate-800">{product.returnWindow || 'Store Default'}</span></span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <ShieldCheck size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">Warranty: <span className="text-slate-800">{product.warrantyPeriod || 'Store Default'}</span></span>
                  </div>
                  {product.origin && (
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                      <Package size={16} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">Origin: <span className="text-slate-800">{product.origin}</span></span>
                    </div>
                  )}
                </div>

                {/* Tags & Colors/Sizes */}
                <div className="space-y-4">
                  {product.colours && product.colours.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available Colours</p>
                      <div className="flex flex-wrap gap-2">
                        {product.colours.map((c: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available Sizes</p>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((s: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((t: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-fuchsia-50 text-fuchsia-700 text-xs font-bold rounded-lg border border-fuchsia-100">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info Table */}
                {(metadataEntries.length > 0 || (Number(product.weight) > 0) || (product.dimensions && (Number(product.dimensions.length) > 0 || Number(product.dimensions.width) > 0 || Number(product.dimensions.height) > 0))) && (
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Info size={16} className="text-[#c800ff]" />
                        Additional Info
                      </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {Number(product.weight) > 0 && (
                        <div className="flex items-center px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                          <div className="w-1/3 text-xs font-bold text-slate-500 uppercase tracking-wider">Weight</div>
                          <div className="w-2/3 text-sm font-semibold text-slate-800">{product.weight} {product.weightUnit || 'kg'}</div>
                        </div>
                      )}
                      {product.dimensions && (Number(product.dimensions.length) > 0 || Number(product.dimensions.width) > 0 || Number(product.dimensions.height) > 0) && (
                        <div className="flex items-center px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                          <div className="w-1/3 text-xs font-bold text-slate-500 uppercase tracking-wider">Dimensions</div>
                          <div className="w-2/3 text-sm font-semibold text-slate-800">
                            {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} {product.dimensionsUnit || 'cm'}
                          </div>
                        </div>
                      )}
                      {metadataEntries.map(([key, value], idx) => (
                        <div key={idx} className="flex items-center px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                          <div className="w-1/3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="w-2/3 text-sm font-semibold text-slate-800 break-words">
                            {String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
