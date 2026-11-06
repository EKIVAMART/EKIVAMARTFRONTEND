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
      <p className="text-[10px] font-black uppercase tracking-[3px] text-[#1c711c] mb-3">
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
                  ? 'bg-gradient-to-r from-[#228b22] to-[#1c711c] text-white border-transparent shadow-md shadow-[#48824d30] scale-105'
                  : 'bg-white text-gray-500 border-[#bfd4bc] hover:border-[#1c711c]/60 hover:text-[#228b22]'
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