'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import ActionModal from '@/components/admin/ActionModal';
import ProductTable from '@/components/admin/ProductTable';
import VendorTable from '@/components/admin/VendorTable';
import { Plus, Search } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'vendors'>('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Mock Data (In a real app, these come from your API/Context)
  const [products, setProducts] = useState([
    { id: 1, name: 'Lenovo Ideapad Slim 3', price: 45000, category: 'Electronics', stock: 12, image: '/laptop.jpg' },
  ]);
  const [vendors, setVendors] = useState([
    { id: 1, name: 'TechHub Solutions', type: 'Electronics', email: 'contact@techhub.com', status: 'Active' },
  ]);

  const openModal = (item: any = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter capitalize">{activeTab} Management</h2>
            <p className="text-sm text-gray-500 font-medium">Control and oversee your marketplace data</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-[#981d87] hover:bg-[#7a176c] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-100"
          >
            <Plus size={18} /> Add {activeTab === 'products' ? 'Product' : 'Vendor'}
          </button>
        </header>

        <div className="bg-white p-4 rounded-2xl border mb-6 flex items-center gap-3 shadow-sm">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder={`Search across ${activeTab}...`} className="flex-1 outline-none text-sm font-medium" />
        </div>

        {activeTab === 'products' ? (
          <ProductTable data={products} onEdit={openModal} onDelete={(id: any) => setProducts(products.filter(p => p.id !== id))} />
        ) : (
          <VendorTable data={vendors} onEdit={openModal} onDelete={(id: any) => setVendors(vendors.filter(v => v.id !== id))} />
        )}

        <ActionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          activeTab={activeTab} 
          editingItem={editingItem} 
        />
      </main>
    </div>
  );
}