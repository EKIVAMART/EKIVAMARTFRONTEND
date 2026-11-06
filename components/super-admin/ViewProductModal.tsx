import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Tag, Package, ShieldCheck, RefreshCcw, Info, Box, MapPin } from 'lucide-react';
import { ProductImage } from './ActionModal';

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
      outputLines.push(line === '' ? '<br />' : `<p style="margin:0 0 0.25rem 0">${line}</p>`);
    }
  }
  if (inUl) outputLines.push('</ul>');
  if (inOl) outputLines.push('</ol>');

  return outputLines.join('');
};

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

  const weightVal = Number(product.weight ?? product.metadata?.weight ?? 0);
  const weightUnitVal = product.weightUnit ?? product.metadata?.weightUnit ?? 'kg';

  const locationStr = product.location && typeof product.location === 'object'
    ? [product.location.town, product.location.lga, product.location.state].filter(Boolean).join(', ')
    : (product.location || '');

  const compulsoryInfo = [
    { label: 'Final Price', value: `NGN ${Number(product.price).toLocaleString()}` },
    { label: 'Initial Price', value: product.compareAtPrice ? `NGN ${Number(product.compareAtPrice).toLocaleString()}` : '-' },
    { label: 'Discount', value: product.discount ? `${product.discount}%` : '-' },
    { label: 'Stock', value: `${product.stock} items` },
    { label: 'SKU', value: product.sku || '-' },
    { label: 'Brand', value: product.brand || '-' },
    { label: 'Preview', value: product.preview || '-', isFullWidth: true },
  ];

  const metadataEntries = Object.entries(product.metadata || {}).filter(([key, value]) => {
    // Filter out internal or already displayed keys
    if (
      key === 'customAttributes' ||
      key === 'colours' ||
      key === 'sizes' ||
      key === 'weight' ||
      key === 'weightUnit' ||
      key === 'dimensions' ||
      key === 'dimensionsUnit' ||
      key === 'condition'
    ) return false;
    return Boolean(value);
  });

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const isPublished = status === 'active' || status === 'published';
    if (isPublished) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 ">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-6xl rounded-[2rem] shadow-sm overflow-hidden border border-gray-100 max-h-full flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#228b22] px-6 sm:px-8 py-5 text-white flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{product.name}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                {getStatusBadge(product.status)}
                {(product.category || product.subCategory) && (
                  <span className="text-xs font-medium text-white/90 bg-white/20 px-2.5 py-0.5 rounded-md border border-white/30 flex items-center gap-1.5">
                    <Tag size={12} />
                    {product.category} {product.subCategory ? `› ${product.subCategory}` : ''}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors "
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

              {/* Left Column: Images */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-50 p-4 sm:p-6 rounded-md border border-slate-100 flex flex-col items-center">
                  <div className="relative w-full aspect-square bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden flex items-center justify-center group mb-4">
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
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-md shadow-sm flex items-center justify-center text-slate-700 disabled:opacity-0 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                          disabled={selectedImageIndex === images.length - 1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-md shadow-sm flex items-center justify-center text-slate-700 disabled:opacity-0 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
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
                            className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-all bg-white ${
                              selectedImageIndex === idx ? 'border-[#228b22] shadow-sm scale-110' : 'border-transparent hover:border-slate-300 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={url} className="w-full h-full object-cover" alt="" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-brand-50/50 border border-brand-100 p-5 rounded-md">
                  <h4 className="text-sm font-bold text-brand-900 mb-2 flex items-center gap-2">
                    <Info size={16} className="text-brand-500" /> Description
                  </h4>
                  {product.description || product.preview ? (
                    <div
                      className="text-sm text-brand-900/70 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(product.description || product.preview) }}
                    />
                  ) : (
                    <p className="text-sm text-brand-900/70">No description provided.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Info */}
              <div className="lg:col-span-7 space-y-8">

                {/* Compulsory Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {compulsoryInfo.map((item, idx) => (
                    <div key={idx} className={`bg-white p-4 rounded-md border border-slate-100 shadow-sm hover:border-brand-200 hover:transition-all ${item.isFullWidth ? 'col-span-2 sm:col-span-3' : ''}`}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                      <p className={`text-sm text-slate-800 ${item.isFullWidth ? 'font-medium leading-relaxed' : 'font-black'}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Additional Settings */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-md border border-slate-100">
                    <RefreshCcw size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">Return: <span className="text-slate-800">{product.returnWindow || 'Store Default'}</span></span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-md border border-slate-100">
                    <ShieldCheck size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">Warranty: <span className="text-slate-800">{product.warrantyPeriod || 'Store Default'}</span></span>
                  </div>
                  {product.origin && (
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-md border border-slate-100">
                      <Package size={16} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">Origin: <span className="text-slate-800">{product.origin}</span></span>
                    </div>
                  )}
                  {locationStr && (
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-md border border-slate-100">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">Location: <span className="text-slate-800">{locationStr}</span></span>
                    </div>
                  )}
                  {weightVal > 0 && (
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-md border border-slate-100">
                      <span className="text-xs font-bold text-slate-800">{weightVal}{weightUnitVal}</span>
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
                          <span key={i} className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg border border-brand-100">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info Table */}
                {(metadataEntries.length > 0 || (product.dimensions && (Number(product.dimensions.length) > 0 || Number(product.dimensions.width) > 0 || Number(product.dimensions.height) > 0))) && (
                  <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Info size={16} className="text-[#228b22]" />
                        Additional Info
                      </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
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
