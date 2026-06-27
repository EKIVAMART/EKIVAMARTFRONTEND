'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, ImageIcon } from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (images: { file: File; alt: string }[]) => void;
  onSkip: () => void;
  mode?: 'publish' | 'add';
  existingImagesCount?: number;
}

export default function ImageUploadModal({ isOpen, onClose, onComplete, onSkip, mode = 'publish', existingImagesCount = 0 }: ImageUploadModalProps) {
  const isPublishMode = mode !== 'add';
  const maxAllowed = 10 - existingImagesCount;
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [alts, setAlts] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const clearSelectedImages = () => {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setImagePreviews([]);
    setImageFiles([]);
    setAlts([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    clearSelectedImages();
    onClose();
  };

  const processFiles = useCallback((files: File[]) => {
    const oversized = files.filter(f => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      // Show info about rejected files but don't block valid ones
      console.warn(`${oversized.length} file(s) exceed 10MB and were skipped.`);
    }

    const allowedFiles = files
      .filter((file) => file.size <= MAX_FILE_SIZE)
      .slice(0, Math.max(0, maxAllowed - imageFiles.length));
    const newPreviews = allowedFiles.map(file => URL.createObjectURL(file));

    setImageFiles(prev => [...prev, ...allowedFiles].slice(0, maxAllowed));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, maxAllowed));
    setAlts(prev => [...prev, ...new Array(allowedFiles.length).fill('')].slice(0, maxAllowed));
  }, [imageFiles.length, maxAllowed]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    // Reset input so same file can be re-selected
    if (e.target) e.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    const newFiles = [...imageFiles];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);
    const newAlts = [...alts];
    newAlts.splice(index, 1);
    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
    setAlts(newAlts);
  };

  const handleComplete = () => {
    if (imageFiles.length === 0) {
      onSkip();
    } else {
      const payload = imageFiles.map((file, i) => ({ file, alt: alts[i] || '' }));
      onComplete(payload);
    }
    clearSelectedImages();
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
            <div className="bg-gradient-to-r from-[#9d4ae3] to-[#8236be] px-8 py-6 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{isPublishMode ? 'Upload Product Images' : 'Add Images'}</h2>
                <p className="text-sm opacity-90 mt-1">{isPublishMode ? 'Add visuals to publish your product' : 'Upload images for this product'}</p>
              </div>
              <button onClick={handleClose} type="button" className="p-3 hover:bg-white/20 rounded-2xl transition-colors">
                <X size={26} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] rounded-lg text-white"><ImageIcon size={22} /></div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Product Images</h3>
                  <p className="text-xs text-gray-500">
                    Upload up to {maxAllowed} images. The first image will be the cover. Max 10MB per image.
                  </p>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center cursor-pointer transition-all select-none ${
                  isDraggingOver
                    ? 'border-[#9d4ae3] bg-[#f5e6ff] scale-[1.01]'
                    : 'border-[#f3ecfc] bg-[#F8FDFF] hover:bg-[#F0F9FA] hover:border-[#e4aeff]'
                }`}
              >
                <div className={`text-white p-4 rounded-2xl mb-4 transition-all ${isDraggingOver ? 'bg-[#9d4ae3] scale-110' : 'bg-gradient-to-r from-[#9d4ae3] to-[#8236be]'}`}>
                  <Upload size={36} />
                </div>
                <p className="font-bold text-gray-700">
                  {isDraggingOver ? 'Drop images here!' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP • Max {maxAllowed} images • 10MB each</p>
              </div>
              <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleImageUpload} />

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm aspect-square bg-gray-50 flex items-center justify-center">
                        <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                        {i === 0 && existingImagesCount === 0 && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow">
                            COVER
                          </div>
                        )}
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity m-3">
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Alt text (e.g. 'Red shoes') - for SEO..." 
                        required 
                        value={alts[i] || ''} 
                        onChange={(e) => {
                          const newAlts = [...alts];
                          newAlts[i] = e.target.value;
                          setAlts(newAlts);
                        }}
                        className="w-full text-xs p-2 border rounded-lg outline-none focus:border-[#8236be]" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t bg-gray-50 flex justify-between items-center relative z-10">
              
              <div className="text-red-500 text-xs font-bold w-1/2">
                {imagePreviews.length > 0 && alts.some(alt => !alt.trim()) && (
                  <p>Please provide alt text for all images to continue.</p>
                )}
              </div>

              <button 
                type="button" 
                onClick={handleComplete} 
                className={`flex items-center gap-2 px-10 py-3 rounded-2xl font-bold transition shadow-lg ${
                  imagePreviews.length > 0 
                    ? 'bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:from-[#8236be] hover:to-[#692a99] text-white' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={imagePreviews.length === 0 || alts.some(alt => !alt.trim())}
              >
                <Check size={20} /> {isPublishMode ? 'Publish Product' : 'Upload Images'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
