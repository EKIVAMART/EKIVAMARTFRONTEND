import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check } from 'lucide-react';
import { AdminInput } from './SharedUI';

export default function ActionModal({ isOpen, onClose, activeTab, editingItem }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10"
          >
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-slate-800">{editingItem ? 'Update' : 'Add New'} {activeTab === 'products' ? 'Product' : 'Vendor'}</h3>
              <X className="cursor-pointer text-gray-400 hover:text-red-500" onClick={onClose} />
            </div>
            <div className="p-8 space-y-6">
               {activeTab === 'products' ? (
                 <>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:border-fuchsia-300 transition group">
                    <Upload className="text-fuchsia-500 mb-2 group-hover:-translate-y-1 transition-transform" />
                    <p className="text-xs font-bold text-gray-500">Upload Product Image</p>
                  </div>
                  <div className="space-y-4">
                    <AdminInput label="Product Name" defaultValue={editingItem?.name} />
                    <div className="grid grid-cols-2 gap-4">
                      <AdminInput label="Price (Rs)" type="number" defaultValue={editingItem?.price} />
                      <AdminInput label="Stock" type="number" defaultValue={editingItem?.stock} />
                    </div>
                  </div>
                 </>
               ) : (
                 <div className="space-y-4">
                    <AdminInput label="Vendor Name" defaultValue={editingItem?.name} />
                    <AdminInput label="Business Email" type="email" defaultValue={editingItem?.email} />
                    <AdminInput label="Industry" defaultValue={editingItem?.type} />
                 </div>
               )}
               <button className="w-full bg-[#00A8B5] text-white font-bold py-4 rounded-2xl hover:bg-[#0096a1] transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-cyan-100">
                  <Check size={20} /> Save Information
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}