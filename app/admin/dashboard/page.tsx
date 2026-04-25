'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import ActionModal from '@/components/admin/ActionModal';
import ProductTable from '@/components/admin/ProductTable';
import VendorTable from '@/components/admin/VendorTable';
import OrderTable from '@/components/admin/OrderTable';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';
import { Plus, Search, Menu } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'vendors' | 'orders'>('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Data 
  const [products, setProducts] = useState([
    { id: 1, name: 'Lenovo Ideapad Slim 3', price: 45000, category: 'Electronics', stock: 12, image: '/laptop.jpg' },
  ]);
  const [vendors, setVendors] = useState([
    { id: 1, name: 'TechHub Solutions', type: 'Electronics', email: 'contact@techhub.com', status: 'Active' },
  ]);
  const [orders, setOrders] = useState<any[]>([
    { id: '#CM9815', user: { name: 'Natali Craig', avatar: 'https://i.pravatar.cc/150?u=natalicraig' }, items: '3 items', total: 125000, address: 'Meadow Lane Oakland', date: 'Apr 25, 2026 • 10:15 AM', status: 'Ongoing' },
    { id: '#CM9814', user: { name: 'Kate Morrison', avatar: 'https://i.pravatar.cc/150?u=katemorrison' }, items: '1 item', total: 450000, address: 'Larry San Francisco', date: 'Apr 25, 2026 • 09:30 AM', status: 'Delivered' },
    { id: '#CM9813', user: { name: 'Drew Cano', avatar: 'https://i.pravatar.cc/150?u=drewcano' }, items: '2 items', total: 85000, address: 'Bagwell Avenue Ocala', date: 'Apr 24, 2026 • 04:20 PM', status: 'Ongoing' },
    { id: '#CM9812', user: { name: 'Orlando Diggs', avatar: 'https://i.pravatar.cc/150?u=orlandodiggs' }, items: '1 item', total: 1200000, address: 'Washburn Baton Rouge', date: 'Apr 24, 2026 • 02:00 PM', status: 'Delivered' },
    { id: '#CM9811', user: { name: 'Andi Lane', avatar: 'https://i.pravatar.cc/150?u=andilane' }, items: '4 items', total: 65000, address: 'Nest Lane Olivette', date: 'Apr 24, 2026 • 11:45 AM', status: 'Cancelled' },
    { id: '#CM9810', user: { name: 'Lori Daniels', avatar: 'https://i.pravatar.cc/150?u=loridaniels' }, items: '1 item', total: 32000, address: 'Pin Oak Drive, NY', date: 'Apr 23, 2026 • 05:30 PM', status: 'Delivered' },
    { id: '#CM9809', user: { name: 'Rene Wells', avatar: 'https://i.pravatar.cc/150?u=renewells' }, items: '2 items', total: 210000, address: 'Broad St, Atlanta', date: 'Apr 23, 2026 • 01:15 PM', status: 'Ongoing' },
    { id: '#CM9808', user: { name: 'Tom Hardy', avatar: 'https://i.pravatar.cc/150?u=tomhardy' }, items: '5 items', total: 450000, address: 'Main St, Boston', date: 'Apr 22, 2026 • 10:05 AM', status: 'Returned' },
    { id: '#CM9807', user: { name: 'Sarah Connor', avatar: 'https://i.pravatar.cc/150?u=sarahconnor' }, items: '1 item', total: 180000, address: 'Tech Park, Seattle', date: 'Apr 21, 2026 • 03:45 PM', status: 'Delivered' },
    { id: '#CM9806', user: { name: 'John Smith', avatar: 'https://i.pravatar.cc/150?u=johnsmith' }, items: '2 items', total: 55000, address: 'Library Ave, Austin', date: 'Apr 20, 2026 • 09:20 AM', status: 'Delivered' },
    { id: '#CM9805', user: { name: 'Emily Clark', avatar: 'https://i.pravatar.cc/150?u=emilyclark' }, items: '1 item', total: 290000, address: 'Home Blvd, Chicago', date: 'Apr 19, 2026 • 02:10 PM', status: 'Cancelled' },
    { id: '#CM9804', user: { name: 'Michael Lee', avatar: 'https://i.pravatar.cc/150?u=michaellee' }, items: '3 items', total: 155000, address: 'Fitness Way, Miami', date: 'Apr 18, 2026 • 11:30 AM', status: 'Delivered' },
    { id: '#CM9803', user: { name: 'Sophia Chen', avatar: 'https://i.pravatar.cc/150?u=sophiachen' }, items: '1 item', total: 145000, address: 'Gamer St, Vegas', date: 'Apr 15, 2026 • 08:45 AM', status: 'Returned' },
    { id: '#CM9802', user: { name: 'David Kim', avatar: 'https://i.pravatar.cc/150?u=davidkim' }, items: '4 items', total: 195000, address: 'Adventure Rd, Denver', date: 'Apr 10, 2026 • 04:15 PM', status: 'Delivered' },
    { id: '#CM9801', user: { name: 'Olivia Brown', avatar: 'https://i.pravatar.cc/150?u=oliviabrown' }, items: '2 items', total: 42000, address: 'Camp St, Portland', date: 'Feb 2, 2026 • 10:00 AM', status: 'Delivered' },
  ]);

  const openModal = (item: any = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] flex-col md:flex-row relative">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="text-[#981d87] text-2xl font-bold">Faflories</div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600 text-sm cursor-pointer border border-teal-200 shadow-sm"
            >
              A
            </div>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-56 bg-white border rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b bg-gray-50/50">
                    <p className="text-sm font-bold text-slate-800">Admin User</p>
                    <p className="text-xs text-gray-500 font-medium truncate">admin@faflories.com</p>
                  </div>
                  <button className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-gray-50 transition">
                    Account Settings
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition border-t">
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition -mr-2">
            <Menu size={24} />
          </button>
        </div>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter capitalize">{activeTab} Management</h2>
            <p className="text-sm text-gray-500 font-medium">Control and oversee your marketplace data</p>
          </div>
          {activeTab !== 'orders' && (
            <button 
              onClick={() => openModal()}
              className="bg-[#981d87] hover:bg-[#7a176c] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-100"
            >
              <Plus size={18} /> Add {activeTab === 'products' ? 'Product' : 'Vendor'}
            </button>
          )}
        </header>

        <div className="bg-white p-4 rounded-2xl border mb-6 flex items-center gap-3 shadow-sm">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder={`Search across ${activeTab}...`} 
            className="flex-1 outline-none text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === 'products' && (
          <ProductTable data={products} onEdit={openModal} onDelete={(id: any) => setProducts(products.filter(p => p.id !== id))} searchQuery={searchQuery} />
        )}
        {activeTab === 'vendors' && (
          <VendorTable data={vendors} onEdit={openModal} onDelete={(id: any) => setVendors(vendors.filter(v => v.id !== id))} searchQuery={searchQuery} />
        )}
        {activeTab === 'orders' && (
          <OrderTable data={orders} searchQuery={searchQuery} onViewDetails={openModal} />
        )}

        <ActionModal 
          isOpen={isModalOpen && activeTab !== 'orders'} 
          onClose={() => setIsModalOpen(false)} 
          activeTab={activeTab} 
          editingItem={editingItem} 
        />

        <OrderDetailsModal
          isOpen={isModalOpen && activeTab === 'orders'}
          onClose={() => setIsModalOpen(false)}
          order={editingItem}
        />
      </main>
    </div>
  );
}