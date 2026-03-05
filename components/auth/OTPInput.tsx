'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, val: string) => {
    // Only allow digits
    const digit = val.replace(/[^\d]/g, '');

    if (digit.length > 1) {
      // Handle paste
      const digits = digit.slice(0, length);
      onChange(digits);

      // Focus last filled input
      const nextIndex = Math.min(digits.length - 1, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Update value
    const newValue = value.split('');
    newValue[index] = digit;
    const result = newValue.join('').slice(0, length);
    onChange(result);

    // Move to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValue = value.split('');

      if (value[index]) {
        // Clear current input
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/[^\d]/g, '').slice(0, length);
    onChange(digits);

    // Focus last filled input
    const nextIndex = Math.min(digits.length - 1, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <input
            ref={(el) => {
              if (el) {
                inputRefs.current[index] = el;
              }
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            disabled={disabled}
            className={`
              w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-2xl
              border-2 transition-all duration-200
              ${
                error
                  ? 'border-red-300 bg-red-50 text-red-600'
                  : focusedIndex === index
                    ? 'border-purple-600 bg-purple-50 shadow-brand'
                    : value[index]
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-200 bg-white'
              }
              focus:outline-none focus:ring-2 focus:ring-purple-500/20
              disabled:bg-gray-100 disabled:cursor-not-allowed
            `}
          />
        </motion.div>
      ))}
    </div>
  );
};
