'use client';

import React from 'react';
import { Loader2 } from '@/components/ui/platform-icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 whitespace-nowrap';

  const variants = {
    primary:
      'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 focus:ring-purple-500 shadow-sm hover:shadow-md',
    secondary:
      'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-500',
    outline:
      'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 active:bg-purple-100 focus:ring-purple-500',
    ghost:
      'text-purple-600 hover:bg-purple-50 active:bg-purple-100 focus:ring-purple-500',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm hover:shadow-md',
  };

  const sizes = {
    sm: 'px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm',
    md: 'px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm',
    lg: 'px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      type={props.type || 'button'}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
          <span className="hidden sm:inline">Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
