'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
}) => {
  const calculateStrength = (pass: string): number => {
    let strength = 0;

    if (pass.length >= 8) strength += 25;
    if (pass.length >= 12) strength += 10;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength += 25;
    if (/\d/.test(pass)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(pass)) strength += 20;

    return Math.min(strength, 100);
  };

  const getStrengthLabel = (
    strength: number
  ): { label: string; color: string; bgColor: string } => {
    if (strength < 25)
      return { label: 'Weak', color: 'text-red-600', bgColor: 'bg-red-500' };
    if (strength < 50)
      return {
        label: 'Fair',
        color: 'text-orange-600',
        bgColor: 'bg-orange-500',
      };
    if (strength < 75)
      return {
        label: 'Good',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
      };
    return {
      label: 'Strong',
      color: 'text-green-600',
      bgColor: 'bg-green-500',
    };
  };

  if (!password) return null;

  const strength = calculateStrength(password);
  const { label, color, bgColor } = getStrengthLabel(strength);

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    {
      label: 'Upper & lowercase letters',
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { label: 'At least one number', met: /\d/.test(password) },
    { label: 'Special character (!@#$%)', met: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Password strength
        </span>
        <span className={`text-sm font-semibold ${color}`}>{label}</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${strength}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full ${bgColor}`}
        />
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2 pt-2">
        {requirements.map((req, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2"
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                req.met ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              {req.met ? (
                <Check className="w-3 h-3 text-white" />
              ) : (
                <X className="w-3 h-3 text-gray-500" />
              )}
            </div>
            <span
              className={`text-xs ${
                req.met ? 'text-green-700 font-medium' : 'text-gray-600'
              }`}
            >
              {req.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
