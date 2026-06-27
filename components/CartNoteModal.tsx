'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { closeNoteModal, addItemToCartApi } from '@/lib/features/cart/cartSlice';
import { MessageSquare, Check, X } from 'lucide-react';

export default function CartNoteModal() {
  const dispatch = useAppDispatch();
  const { isOpen, productId, quantity } = useAppSelector((state) => state.cart.noteModal);
  const [showInput, setShowInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleClose = () => {
    setShowInput(false);
    setNoteText('');
    dispatch(closeNoteModal());
  };

  const handleNoThanks = () => {
    if (productId) {
      dispatch(addItemToCartApi({ productId, quantity }));
    }
    handleClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productId) {
      dispatch(addItemToCartApi({ productId, quantity, notes: noteText }));
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 overflow-hidden border border-purple-100 z-10"
        >
          {/* Decorative background gradient glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200/50 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-fuchsia-200/50 rounded-full blur-2xl" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {!showInput ? (
            <div className="text-center py-4 relative">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-5 shadow-inner">
                <MessageSquare className="text-[#9d4ae3]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Add a Note?</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                Do you wish to add a custom note or special request for this item?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleNoThanks}
                  className="flex-1 py-3.5 border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-gray-50 transition active:scale-95"
                >
                  No, thanks
                </button>
                <button
                  onClick={() => setShowInput(true)}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white font-bold rounded-xl hover:from-[#8236be] hover:to-[#692a99] transition shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  Yes, add note
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare className="text-[#9d4ae3]" size={20} />
                Item Note
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Enter any specific requests (e.g. size/color preferences, gift wrap details):
              </p>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type your note here..."
                rows={4}
                required
                autoFocus
                className="w-full px-4 py-3 text-slate-800 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 bg-gray-50 resize-none transition-all text-sm mb-6"
              />
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleNoThanks}
                  className="flex-1 py-3.5 border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-gray-50 transition"
                >
                  No thanks
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white font-bold rounded-xl hover:from-[#8236be] hover:to-[#692a99] transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check size={16} />
                  Submit Note
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
