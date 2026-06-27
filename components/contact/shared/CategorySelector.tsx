import React from 'react';
import { Category, CONTACT_REASONS } from './types';

export default function CategorySelector({
  value,
  onChange,
}: {
  value: Category;
  onChange: (v: Category) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[3px] text-[#8236be] mb-3">
        How can we help? <span className="text-red-400">*</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {CONTACT_REASONS.map(({ value: v, label, icon: Icon }) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v as Category)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                active
                  ? 'bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white border-transparent shadow-md shadow-[#9d4ae330] scale-105'
                  : 'bg-white text-gray-500 border-[#e8b8e4] hover:border-[#8236be]/60 hover:text-[#9d4ae3]'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}