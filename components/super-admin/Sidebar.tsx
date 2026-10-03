import { LayoutDashboard, Package, Users, Settings, ShoppingCart, X, UserCog, UserCircle, Clock, LogOut, Percent, Bell, BookOpen, Mail, Truck } from 'lucide-react';
import { SidebarLink } from './SharedUI';
import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import type { RootState } from '@/lib/store';
import { useState } from 'react';
import { logout } from '@/lib/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export type SuperAdminTab = 'dashboard' | 'products' | 'vendors' | 'orders' | 'admins' | 'users' | 'waitlist' | 'taxes' | 'notifications' | 'blog' | 'engagement' | 'specialists';

interface SidebarProps {
  activeTab: SuperAdminTab | string;
  setActiveTab: (tab: SuperAdminTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
  const authUser = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
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
      router.replace('/super-admin/login');
    }
  };

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
              <Image src="/fa_logo_brand.png" alt="Faflora" width={110} height={30} className="object-contain" />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                Super Admin
              </span>
            </Link>
          </div>
          {isOpen && onClose && (
            <button onClick={onClose} className="md:hidden p-2 -mr-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-xl transition">
              <X size={20} />
            </button>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarLink
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => { setActiveTab('dashboard'); onClose?.(); }}
          />
          <SidebarLink
            icon={<Package size={20} />}
            label="Products"
            active={activeTab === 'products'}
            onClick={() => { setActiveTab('products'); onClose?.(); }}
          />
          <SidebarLink
            icon={<ShoppingCart size={20} />}
            label="Orders"
            active={activeTab === 'orders'}
            onClick={() => { setActiveTab('orders'); onClose?.(); }}
          />
          <SidebarLink
            icon={<Users size={20} />}
            label="Vendor Settings"
            active={activeTab === 'vendors'}
            onClick={() => { setActiveTab('vendors'); onClose?.(); }}
          />
          <SidebarLink
            icon={<UserCog size={20} />}
            label="Admins"
            active={activeTab === 'admins'}
            onClick={() => { setActiveTab('admins'); onClose?.(); }}
          />
          <SidebarLink
            icon={<UserCircle size={20} />}
            label="Users"
            active={activeTab === 'users'}
            onClick={() => { setActiveTab('users'); onClose?.(); }}
          />
          <SidebarLink
            icon={<Clock size={20} />}
            label="Waitlist"
            active={activeTab === 'waitlist'}
            onClick={() => { setActiveTab('waitlist'); onClose?.(); }}
          />
          <SidebarLink
            icon={<BookOpen size={20} />}
            label="Blog & Articles"
            active={activeTab === 'blog'}
            onClick={() => { setActiveTab('blog'); onClose?.(); }}
          />
          <SidebarLink
            icon={<Bell size={20} />}
            label="Notifications"
            active={activeTab === 'notifications'}
            onClick={() => { setActiveTab('notifications'); onClose?.(); }}
          />
          <SidebarLink
            icon={<Mail size={20} />}
            label="Engagement"
            active={activeTab === 'engagement'}
            onClick={() => { setActiveTab('engagement'); onClose?.(); }}
          />
          <SidebarLink
            icon={<Truck size={20} />}
            label="Vendor Specialists"
            active={activeTab === 'specialists'}
            onClick={() => { setActiveTab('specialists'); onClose?.(); }}
          />
          <SidebarLink
            icon={<Percent size={20} />}
            label="Tax & Compliance"
            active={activeTab === 'taxes'}
            onClick={() => { setActiveTab('taxes'); onClose?.(); }}
          />
        </nav>

        <div className="p-6 border-t mt-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600">
                {authUser?.firstName?.[0] || 'A'}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 truncate max-w-[100px]">{authUser?.firstName || 'Admin'} {authUser?.lastName || 'User'}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{authUser?.role === 'super-admin' ? 'Super Admin' : 'Admin'}</p>
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
                Are you sure you want to sign out of your account? Any unsaved changes may be lost.
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