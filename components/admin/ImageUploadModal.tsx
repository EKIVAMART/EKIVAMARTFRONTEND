'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, ImageIcon } from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (images: string[]) => void;
  onSkip: () => void;
}

export default function ImageUploadModal({ isOpen, onClose, onComplete, onSkip }: ImageUploadModalProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 10)); // Max 10 images
  };

  const removeImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleComplete = () => {
    if (imagePreviews.length === 0) {
      onSkip();
    } else {
      onComplete(imagePreviews);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="bg-[#981d87] px-8 py-6 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Upload Product Images</h2>
                <p className="text-sm opacity-90 mt-1">Add visuals to publish your product</p>
              </div>
              <button onClick={onClose} type="button" className="p-3 hover:bg-white/20 rounded-2xl transition-colors">
                <X size={26} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#981d87] rounded-lg text-white"><ImageIcon size={22} /></div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Product Images</h3>
                  <p className="text-xs text-gray-500">Upload up to 10 images. The first image will be the cover.</p>
                </div>
              </div>

              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[#fcedf9] rounded-3xl p-12 bg-[#F8FDFF] flex flex-col items-center cursor-pointer hover:bg-[#F0F9FA] transition">
                <div className="bg-[#981d87] text-white p-4 rounded-2xl mb-4"><Upload size={36} /></div>
                <p className="font-bold text-gray-700">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP • Max 10 images</p>
              </div>
              <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleImageUpload} />

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm aspect-square bg-gray-50 flex items-center justify-center">
                      <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <div className="absolute top-2 left-2 bg-[#981d87] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow">
                          COVER
                        </div>
                      )}
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity m-3">
                        <X size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t bg-gray-50 flex justify-end items-center relative z-10">

              <button 
                type="button" 
                onClick={handleComplete} 
                className={`flex items-center gap-2 px-10 py-3 rounded-2xl font-bold transition shadow-lg ${
                  imagePreviews.length > 0 
                    ? 'bg-[#981d87] hover:bg-[#7a176c] text-white' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={imagePreviews.length === 0}
              >
                <Check size={20} /> Publish Product
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
