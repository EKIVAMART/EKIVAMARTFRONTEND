import { LayoutDashboard, Package, Users, Settings } from 'lucide-react';
import { SidebarLink } from './SharedUI';

export default function Sidebar({ activeTab, setActiveTab }: any) {
  return (
    <aside className="w-64 bg-white border-r hidden md:flex flex-col sticky top-0 h-screen">
      <div className="p-6 border-b">
        <h1 className="text-xl font-black tracking-tighter text-[#00A8B5]">SHOPSTIC ADMIN</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <SidebarLink icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <SidebarLink icon={<Package size={20}/>} label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
        <SidebarLink icon={<Users size={20}/>} label="Vendor Settings" active={activeTab === 'vendors'} onClick={() => setActiveTab('vendors')} />
        <SidebarLink icon={<Settings size={20}/>} label="Settings" active={false} onClick={() => {}} />
      </nav>
      <div className="p-6 border-t mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600">A</div>
          <div>
            <p className="text-sm font-bold text-slate-800">Admin User</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}