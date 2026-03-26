import React from 'react';
import { Edit3, Trash2, Mail, ExternalLink } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  type: string;
  email: string;
  status: string;
}

interface VendorTableProps {
  data: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (id: number) => void;
}

export default function VendorTable({ data, onEdit, onDelete }: VendorTableProps) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor Details</th>
            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Industry</th>
            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((vendor) => (
            <tr key={vendor.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors group">
              {/* Vendor Name & Email */}
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-sm group-hover:text-[#00A8B5] transition-colors cursor-pointer flex items-center gap-1">
                    {vendor.name} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                    <Mail size={10} />
                    {vendor.email}
                  </div>
                </div>
              </td>

              {/* Industry Type */}
              <td className="p-4 text-center">
                <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                  {vendor.type}
                </span>
              </td>

              {/* Status Badge */}
              <td className="p-4 text-center">
                <span 
                  className={`
                    px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter
                    ${vendor.status === 'Active' 
                      ? 'bg-fuchsia-100 text-fuchsia-600 border border-fuchsia-200' 
                      : 'bg-amber-100 text-amber-600 border border-amber-200'
                    }
                  `}
                >
                  {vendor.status}
                </span>
              </td>

              {/* Action Buttons */}
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => onEdit(vendor)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                    title="Edit Vendor"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(vendor.id)}
                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all active:scale-90"
                    title="Delete Vendor"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty State within the table */}
      {data.length === 0 && (
        <div className="py-20 text-center bg-white">
          <p className="text-gray-400 font-medium">No vendors found. Add your first partner to get started.</p>
        </div>
      )}
    </div>
  );
}