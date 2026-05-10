'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MobileNavMenuItemProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const MobileNavMenuItem = ({
  icon,
  label,
  isActive,
  onClick,
}: MobileNavMenuItemProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all ${
        isActive ? 'bg-gradient-to-r from-[#c800ff] to-[#912cad] text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <span className="text-xs font-semibold">{label}</span>
    </motion.button>
  );
};

interface SubcategoryExpanderProps {
  isExpanded: boolean;
  subcategories: string[];
  onSubcategoryClick?: (subcategory: string) => void;
}

export const SubcategoryExpander = ({
  isExpanded,
  subcategories,
  onSubcategoryClick,
}: SubcategoryExpanderProps) => {
  return (
    <motion.div
      initial={false}
      animate={{
        height: isExpanded ? 'auto' : 0,
        opacity: isExpanded ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden bg-gray-50"
    >
      {subcategories.map((sub) => (
        <motion.button
          key={sub}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSubcategoryClick?.(sub)}
          className="block w-full text-left px-4 py-2.5 pl-12 text-sm text-gray-600 hover:text-[#c800ff] hover:bg-white transition border-b last:border-b-0"
        >
          {sub}
        </motion.button>
      ))}
    </motion.div>
  );
};
