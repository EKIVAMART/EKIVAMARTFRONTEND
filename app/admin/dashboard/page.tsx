'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import ActionModal from '@/components/admin/ActionModal';
import ImageUploadModal from '@/components/admin/ImageUploadModal';
import ProductTable from '@/components/admin/ProductTable';
import VendorTable from '@/components/admin/VendorTable';
import OrderTable from '@/components/admin/OrderTable';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';
import { Plus, Search, Menu } from 'lucide-react';
import { productApi } from '@/lib/api';

type AdminProduct = {
  id: string;
  name: string;
  price: number;
  category?: string;
  stock: number;
  image: string;
  status?: 'draft' | 'published';
};

type AdminVendor = {
  id: number;
  name: string;
  type: string;
  email: string;
  status: string;
};

type AdminOrder = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  items: string;
  total: number;
  address: string;
  date: string;
  status: 'Ongoing' | 'Delivered' | 'Cancelled' | 'Returned';
};

type ProductRecord = {
  id?: string | number;
  _id?: string;
  name?: string;
  title?: string;
  price?: number;
  sellingPrice?: number;
  originalPrice?: number;
  category?: string | { name?: string; title?: string };
  stock?: number;
  quantity?: number;
  image?: string;
  images?: string[];
};

type ProductPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const PRODUCT_PAGE_LIMIT = 20;

const fallbackProducts: AdminProduct[] = [
  {
    id: '1',
    name: 'Lenovo Ideapad Slim 3',
    price: 45000,
    category: 'Electronics',
    stock: 12,
    image: '/laptop.jpg',
  },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object');

const getProductList = (payload: unknown): unknown[] => {
  if (!isRecord(payload)) return [];

  const data = payload.data;

  if (Array.isArray(data)) return data;
  if (isRecord(data) && Array.isArray(data.data)) return data.data;
  if (isRecord(data) && Array.isArray(data.products)) return data.products;
  if (isRecord(data) && Array.isArray(data.docs)) return data.docs;
  if (Array.isArray(payload.products)) return payload.products;

  return [];
};

const getNumber = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : fallback;
};

const getProductPagination = (
  payload: unknown,
  fallbackCount: number
): ProductPagination => {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    return {
      page: 1,
      limit: PRODUCT_PAGE_LIMIT,
      total: fallbackCount,
      totalPages: Math.max(1, Math.ceil(fallbackCount / PRODUCT_PAGE_LIMIT)),
    };
  }

  const data = payload.data;
  const page = getNumber(data.page, 1);
  const limit = getNumber(data.limit, PRODUCT_PAGE_LIMIT);
  const total = getNumber(data.total, fallbackCount);
  const totalPages = getNumber(
    data.totalPages ?? data.totalPage ?? data.pages,
    Math.max(1, Math.ceil(total / limit))
  );

  return { page, limit, total, totalPages };
};

const getCategoryName = (category: ProductRecord['category']) => {
  if (typeof category === 'string') return category;
  return category?.name || category?.title || '';
};

const normalizeProduct = (product: unknown): AdminProduct | null => {
  if (!isRecord(product)) return null;

  const record = product as ProductRecord;
  const id = record.id || record._id;
  const name = record.name || record.title;

  if (!id || !name) return null;

  return {
    id: String(id),
    name,
    price: Number(record.price ?? record.sellingPrice ?? record.originalPrice ?? 0),
    category: getCategoryName(record.category),
    stock: Number(record.stock ?? record.quantity ?? 0),
    image: record.image || record.images?.[0] || '/laptop.jpg',
  };
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'vendors' | 'orders'>('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [productToPublishId, setProductToPublishId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<AdminProduct | AdminVendor | AdminOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productLoadError, setProductLoadError] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [productLimit, setProductLimit] = useState(PRODUCT_PAGE_LIMIT);
  const [productTotal, setProductTotal] = useState(fallbackProducts.length);
  const [productTotalPages, setProductTotalPages] = useState(1);

  // Mock Data 
  const [products, setProducts] = useState<AdminProduct[]>(fallbackProducts);
  const [vendors, setVendors] = useState<AdminVendor[]>([
    { id: 1, name: 'TechHub Solutions', type: 'Electronics', email: 'contact@techhub.com', status: 'Active' },
  ]);
  const [orders] = useState<AdminOrder[]>([
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

  const openModal = (item: AdminProduct | AdminVendor | AdminOrder | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProductLoadError('');

      try {
        const response = await productApi.getAllProducts({
          page: productPage,
          limit: PRODUCT_PAGE_LIMIT,
        });
        const fetchedProducts = getProductList(response)
          .map(normalizeProduct)
          .filter((product): product is AdminProduct => Boolean(product));
        const pagination = getProductPagination(response, fetchedProducts.length);

        if (!isMounted) return;

        const savedDraftsRaw = localStorage.getItem('faflora_product_drafts');
        const savedDrafts: AdminProduct[] = savedDraftsRaw ? JSON.parse(savedDraftsRaw) : [];

        setProducts([...savedDrafts, ...fetchedProducts]);
        setProductPage(pagination.page);
        setProductLimit(pagination.limit);
        setProductTotal(pagination.total);
        setProductTotalPages(pagination.totalPages);
      } catch {
        if (!isMounted) return;
        const savedDraftsRaw = localStorage.getItem('faflora_product_drafts');
        const savedDrafts: AdminProduct[] = savedDraftsRaw ? JSON.parse(savedDraftsRaw) : [];
        setProducts([...savedDrafts, ...fallbackProducts]);
        setProductTotal(fallbackProducts.length);
        setProductTotalPages(1);
        setProductLoadError('Could not load products. Showing fallback data.');
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [productPage]);

  const handleSaveProduct = (formData: any) => {
    if (activeTab !== 'products') return;

    const id = formData.id || `draft-${Date.now()}`;
    const newDraft = {
      ...formData,
      id,
      name: formData.name,
      price: formData.price,
      category: formData.categoryId,
      stock: formData.stock,
      image: formData.images?.[0] || '',
      status: formData.status
    } as AdminProduct;

    if (formData.status === 'draft') {
      const savedDraftsRaw = localStorage.getItem('faflora_product_drafts');
      const savedDrafts: AdminProduct[] = savedDraftsRaw ? JSON.parse(savedDraftsRaw) : [];

      const existingIdx = savedDrafts.findIndex(d => d.id === id);
      if (existingIdx >= 0) {
        savedDrafts[existingIdx] = newDraft;
      } else {
        savedDrafts.unshift(newDraft);
      }

      localStorage.setItem('faflora_product_drafts', JSON.stringify(savedDrafts));

      setProducts(prev => {
        const existing = prev.findIndex(p => p.id === id);
        if (existing >= 0) {
          const newProducts = [...prev];
          newProducts[existing] = newDraft;
          return newProducts;
        }
        return [newDraft, ...prev];
      });
    }
    // Note: If saving as published directly without draft, one would normally call the API.
  };

  const handlePublishClick = (id: string) => {
    setProductToPublishId(id);
    setIsImageModalOpen(true);
  };

  const handleImageComplete = (images: string[]) => {
    if (!productToPublishId) return;

    setProducts(prev => prev.map(p => {
      if (p.id === productToPublishId) {
        return { ...p, status: 'published', image: images[0] || '' };
      }
      return p;
    }));

    const savedDraftsRaw = localStorage.getItem('faflora_product_drafts');
    if (savedDraftsRaw) {
      const savedDrafts: AdminProduct[] = JSON.parse(savedDraftsRaw);
      const updatedDrafts = savedDrafts.filter(d => d.id !== productToPublishId);
      localStorage.setItem('faflora_product_drafts', JSON.stringify(updatedDrafts));
    }

    setIsImageModalOpen(false);
    setProductToPublishId(null);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] flex-col md:flex-row relative">

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="text-[#981d87] text-2xl font-bold">Faflora</div>
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
                    <p className="text-xs text-gray-500 font-medium truncate">admin@faflora.com</p>
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
          <div className="space-y-3">
            {(isLoadingProducts || productLoadError) && (
              <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${productLoadError
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-gray-200 bg-white text-gray-500'
                }`}>
                {productLoadError || 'Loading products...'}
              </div>
            )}
            <ProductTable
              data={products}
              onEdit={openModal}
              onDelete={(id: string) => setProducts(products.filter(p => p.id !== id))}
              onPublish={handlePublishClick}
              searchQuery={searchQuery}
              currentPage={productPage}
              totalPages={productTotalPages}
              totalItems={productTotal}
              itemsPerPage={productLimit}
              onPageChange={setProductPage}
              isLoading={isLoadingProducts}
            />
          </div>
        )}
        {activeTab === 'vendors' && (
          <VendorTable data={vendors} onEdit={openModal} onDelete={(id: number) => setVendors(vendors.filter(v => v.id !== id))} searchQuery={searchQuery} />
        )}
        {activeTab === 'orders' && (
          <OrderTable data={orders} searchQuery={searchQuery} onViewDetails={openModal} />
        )}

        <ActionModal
          isOpen={isModalOpen && activeTab !== 'orders'}
          onClose={() => setIsModalOpen(false)}
          activeTab={activeTab}
          editingItem={activeTab === 'products' && editingItem ? editingItem as AdminProduct : undefined}
          onSave={handleSaveProduct}
        />

        <ImageUploadModal
          isOpen={isImageModalOpen}
          onClose={() => { setIsImageModalOpen(false); setProductToPublishId(null); }}
          onComplete={handleImageComplete}
          onSkip={() => handleImageComplete([])}
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
