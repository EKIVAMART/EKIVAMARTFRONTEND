import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface FloatInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FloatInput = React.forwardRef<HTMLInputElement, FloatInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = Boolean(props.value);
    const lifted = focused || hasValue;
    return (
      <div className="relative">
        <input
          ref={ref}
          {...props}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
          placeholder=""
          className={`peer w-full px-4 pt-6 pb-2 rounded-2xl border bg-white text-[15px] text-[#203c29] focus:outline-none transition-all duration-200 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-300'
              : focused
              ? 'border-[#228b22] shadow-[0_0_0_3px_rgba(152,29,135,0.08)]'
              : 'border-[#bfd4bc] hover:border-[#1c711c]/50'
          } ${className}`}
          style={{ fontFamily: "'Palatino Linotype', Georgia, serif" }}
        />
        <label
          className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium ${
            lifted
              ? 'top-2 text-[10px] uppercase tracking-[2px] text-[#1c711c]'
              : 'top-4 text-[14px] text-gray-400'
          }`}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={11} /> {error}
          </p>
        )}
      </div>
    );
  }
);

FloatInput.displayName = 'FloatInput';
export default FloatInput;