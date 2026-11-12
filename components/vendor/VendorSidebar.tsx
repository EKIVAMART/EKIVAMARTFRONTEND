'use client';

import { LayoutDashboard, Package, X, LogOut, Store, ChevronRight, ShoppingCart, Bell, DollarSign } from 'lucide-react';
import { SidebarLink } from '@/components/super-admin/SharedUI';
import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import type { RootState } from '@/lib/store';
import { useState } from 'react';
import { logout } from '@/lib/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

export type VendorTab = 'dashboard' | 'products' | 'store-settings' | 'orders' | 'earnings' | 'notifications';

interface VendorSidebarProps {
  activeTab: VendorTab;
  setActiveTab: (tab: VendorTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function VendorSidebar({ activeTab, setActiveTab, isOpen, onClose }: VendorSidebarProps) {
  const authUser = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sessionId: null })
        }).catch(() => {});
      }
    } finally {
      dispatch(logout());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.replace('/');
    }
  };

const NairaIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
  >
    <path d="M6 3v18M18 3v18M6 3l12 18M4 9h16M4 14h16" />
  </svg>
);

  const navItems: { icon: React.ReactNode; label: string; tab: VendorTab }[] = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', tab: 'dashboard' },
    { icon: <Package size={20} />, label: 'My Products', tab: 'products' },
    { icon: <ShoppingCart size={20} />, label: 'Store Orders', tab: 'orders' },
    { icon: <NairaIcon size={20} />, label: 'Earnings & Payouts', tab: 'earnings' },
    { icon: <Bell size={20} />, label: 'Notifications', tab: 'notifications' },
    { icon: <Store size={20} />, label: 'Store Settings', tab: 'store-settings' },
  ];


  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-1.5 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/brand/ekivamart-logo.svg" alt="EkivaMart" width={110} height={30} className="object-contain" />
              <span className="text-[10px] text-brand-600 font-bold uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                Vendor
              </span>
            </Link>
          </div>
          {isOpen && onClose && (
            <button onClick={onClose} className="md:hidden p-2 -mr-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-xl transition">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon, label, tab }) => (
            <SidebarLink
              key={tab}
              icon={icon}
              label={label}
              active={activeTab === tab}
              onClick={() => { setActiveTab(tab); onClose?.(); }}
            />
          ))}
        </nav>

        <div className="p-4 border-t">
          <Link
            href="/vendor/application/status"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition group"
          >
            <ChevronRight size={16} className="text-brand-400 group-hover:translate-x-0.5 transition-transform" />
            Store Application Status
          </Link>
        </div>

        <div className="p-6 border-t">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center font-bold text-white text-sm">
                {authUser?.firstName?.[0] || 'V'}{authUser?.lastName?.[0] || ''}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 truncate max-w-[100px]">
                  {authUser?.firstName || 'Vendor'} {authUser?.lastName || ''}
                </p>
                <p className="text-[10px] text-brand-500 font-bold uppercase tracking-tighter">Vendor</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 text-center border"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <LogOut size={24} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg">Confirm Logout</h3>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-2">
                Are you sure you want to sign out of your vendor account?
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 border rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
