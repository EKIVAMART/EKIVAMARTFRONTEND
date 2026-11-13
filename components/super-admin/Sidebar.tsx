import { LayoutDashboard, Package, Users, ShoppingCart, X, UserCog, UserCircle, Clock, LogOut, Percent, Bell, BookOpen, Mail, Truck, CircleHelp } from '@/components/ui/platform-icons';
import { SidebarLink } from './SharedUI';
import Image from 'next/image';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/hooks';
import { useState } from 'react';
import { logout } from '@/lib/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

export type SuperAdminTab = 'dashboard' | 'products' | 'vendors' | 'orders' | 'admins' | 'users' | 'waitlist' | 'taxes' | 'notifications' | 'blog' | 'engagement' | 'specialists' | 'deliveryRoutes';

interface SidebarProps {
  activeTab: SuperAdminTab | string;
  setActiveTab: (tab: SuperAdminTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
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
      router.replace('/super-admin/login');
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 h-dvh w-52 bg-white border-r border-slate-200 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <div className="flex items-center gap-1.5 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/brand/ekivamart-logo.svg" alt="EkivaMart" width={108} height={30} className="object-contain" />
            </Link>
          </div>
          {isOpen && onClose && (
            <button onClick={onClose} className="md:hidden p-2 -mr-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-md transition">
              <X size={20} />
            </button>
          )}
        </div>
        <nav aria-label="Dashboard navigation" className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <SidebarLink
            icon={<LayoutDashboard size={20} />}
            label="Overview"
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
            label="Vendors"
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
          <hr className="!my-3 border-slate-100" />
          <SidebarLink
            icon={<BookOpen size={20} />}
            label="Blog"
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
          <hr className="!my-3 border-slate-100" />
          <SidebarLink
            icon={<Truck size={20} />}
            label="Vendor Specialists"
            active={activeTab === 'specialists'}
            onClick={() => { setActiveTab('specialists'); onClose?.(); }}
          />
          <SidebarLink
            icon={<Truck size={20} />}
            label="Delivery routes"
            active={activeTab === 'deliveryRoutes'}
            onClick={() => { setActiveTab('deliveryRoutes'); onClose?.(); }}
          />
          <SidebarLink
            icon={<Percent size={20} />}
            label="Tax rules"
            active={activeTab === 'taxes'}
            onClick={() => { setActiveTab('taxes'); onClose?.(); }}
          />
        </nav>

        <div className="px-3 py-3 border-t mt-auto">
          <a href="https://wa.me/2349069910407" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 min-h-10 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
            <CircleHelp size={18} aria-hidden="true" /> Help
          </a>
          <button type="button" onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 px-3 min-h-10 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
            <LogOut size={18} aria-hidden="true" /> Sign out
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dashboard-dialog-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full p-6 dashboard-dialog dashboard-dialog--compact dashboard-dialog--padded" role="dialog" aria-modal="true" aria-labelledby="Sidebar-dialog-0-title"
            >
              <h3 className="font-semibold text-slate-900 text-lg" id="Sidebar-dialog-0-title">Sign out?</h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-2">
                Unsaved changes may be lost.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 min-h-10 border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 min-h-10 bg-[#176a35] hover:bg-[#12582b] text-white rounded-md text-sm font-medium"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
