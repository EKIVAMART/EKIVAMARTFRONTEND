'use client';
import { AlertCircle as PlatformAlertCircle } from '@/components/ui/platform-icons';

import React, { forwardRef, useId } from 'react';
import { LucideIcon } from '@/components/ui/platform-icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, rightIcon, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    return (
      <div className="space-y-1 sm:space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs sm:text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon aria-hidden="true" className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
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
              focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'}
              ${className}
            `}
            {...props}
            id={inputId}
            aria-invalid={error ? true : props['aria-invalid']}
            aria-describedby={[props['aria-describedby'], error ? errorId : undefined].filter(Boolean).join(' ') || undefined}
          />
          {rightIcon && (
            <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-xs text-red-600 flex items-center gap-1 sm:gap-1.5">
            <PlatformAlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
