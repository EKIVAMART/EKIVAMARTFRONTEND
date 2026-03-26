import { HelpCircle } from 'lucide-react';

export const SidebarLink = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
      active ? 'bg-[#981d87] text-white shadow-lg shadow-fuchsia-100' : 'text-gray-400 hover:bg-gray-50 hover:text-slate-700'
    }`}
  >
    {icon}
    {label}
  </button>
);

export const AdminInput = ({ label, type = "text", defaultValue, placeholder }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
      {label} <HelpCircle size={12} className="text-[#00A8B5]" />
    </label>
    <input 
      type={type} 
      defaultValue={defaultValue} 
      placeholder={placeholder}
      className="w-full p-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 ring-fuchsia-100 outline-none transition text-sm font-medium" 
    />
  </div>
);