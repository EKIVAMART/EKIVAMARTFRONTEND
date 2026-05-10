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
      <p className="text-[10px] font-black uppercase tracking-[3px] text-[#c740b0] mb-3">
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
                  ? 'bg-gradient-to-r from-[#c800ff] to-[#c740b0] text-white border-transparent shadow-md shadow-[#c800ff30] scale-105'
                  : 'bg-white text-gray-500 border-[#e8b8e4] hover:border-[#c740b0]/60 hover:text-[#c800ff]'
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