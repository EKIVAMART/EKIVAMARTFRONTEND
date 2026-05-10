'use client';

import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1 sm:space-y-1.5">
        {label && (
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
            {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          )}
          <input
            ref={ref}
            className={`
              w-full px-3 sm:px-4 py-2.5 sm:py-3 
              ${Icon ? 'pl-9 sm:pl-11' : ''} 
              ${rightIcon ? 'pr-10 sm:pr-12' : ''}
              border rounded-lg sm:rounded-xl 
              bg-white text-sm sm:text-base
              transition-all duration-200
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1 sm:gap-1.5 animate-in slide-in-from-top-1 duration-200">
            <svg
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
