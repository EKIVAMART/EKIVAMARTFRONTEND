import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface FloatTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const FloatTextarea = React.forwardRef<HTMLTextAreaElement, FloatTextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = Boolean(props.value);
    const lifted = focused || hasValue;
    return (
      <div className="relative">
        <textarea
          ref={ref}
          {...props}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
          placeholder=""
          rows={5}
          className={`peer w-full px-4 pt-8 pb-3 rounded-2xl border bg-white text-[15px] text-[#1a0018] focus:outline-none transition-all duration-200 resize-none ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-300'
              : focused
              ? 'border-[#c800ff] shadow-[0_0_0_3px_rgba(152,29,135,0.08)]'
              : 'border-[#e8b8e4] hover:border-[#c740b0]/50'
          } ${className}`}
          style={{ fontFamily: "'Palatino Linotype', Georgia, serif" }}
        />
        <label
          className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium ${
            lifted
              ? 'top-2 text-[10px] uppercase tracking-[2px] text-[#c740b0]'
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

FloatTextarea.displayName = 'FloatTextarea';
export default FloatTextarea;