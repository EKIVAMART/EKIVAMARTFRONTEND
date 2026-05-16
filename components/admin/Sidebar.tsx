import { LayoutDashboard, Package, Users, Settings, ShoppingCart, X } from 'lucide-react';
import { SidebarLink } from './SharedUI';
import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector } from '@/lib/hooks';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
  const authUser = useAppSelector((state) => state.auth.user);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-1.5 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.jpg" alt="Faflora" width={110} height={30} className="object-contain" />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                Admin
              </span>
            </Link>
          </div>
          {isOpen && onClose && (
            <button onClick={onClose} className="md:hidden p-2 -mr-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-xl transition">
              <X size={20} />
            </button>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarLink icon={<Package size={20} />} label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <SidebarLink icon={<ShoppingCart size={20} />} label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <SidebarLink icon={<Users size={20} />} label="Vendor Settings" active={activeTab === 'vendors'} onClick={() => setActiveTab('vendors')} />
          <SidebarLink icon={<Settings size={20} />} label="Settings" active={false} onClick={() => { }} />
        </nav>
        <div className="p-6 border-t mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600">
              {authUser?.firstName?.[0] || 'A'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{authUser?.firstName || 'Admin'} {authUser?.lastName || 'User'}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{authUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}