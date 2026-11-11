import type React from 'react';
import { HelpCircle } from 'lucide-react';

export const SidebarLink = ({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) => (
  <button type="button" aria-current={active ? 'page' : undefined} onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 min-h-10 rounded-md text-left text-sm font-medium transition-colors ${active ? 'bg-[#e8f3e8] text-[#166a24]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
    <span className="[&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:stroke-[1.8]" aria-hidden="true">{icon}</span>{label}
  </button>
);

export const AdminInput = ({ label, type = "text", defaultValue, placeholder }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
      {label} <HelpCircle size={12} className="text-slate-600" />
    </label>
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full p-3 rounded-md border bg-gray-50 focus:bg-white focus:ring-2 ring-brand-100 outline-none transition text-sm font-medium"
    />
  </div>
);