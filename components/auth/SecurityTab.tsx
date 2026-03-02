/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { PasswordStrength } from './PasswordStrength';

export const SecurityTab: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // Validate new password is different
    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      await authApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Change password</h3>
        <p className="text-sm text-gray-600 mt-1">
          Update your password to keep your account secure
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Password changed successfully!
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                All other sessions have been logged out for security
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Current Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Current password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              required
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Enter current password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({
                  ...showPasswords,
                  current: !showPasswords.current,
                })
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showPasswords.current ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            New password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              required
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Enter new password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({ ...showPasswords, new: !showPasswords.new })
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showPasswords.new ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Password Strength */}
        {formData.newPassword && (
          <PasswordStrength password={formData.newPassword} />
        )}

        {/* Confirm New Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Confirm new password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Confirm new password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({
                  ...showPasswords,
                  confirm: !showPasswords.confirm,
                })
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showPasswords.confirm ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {formData.confirmPassword &&
            formData.newPassword !== formData.confirmPassword && (
              <p className="text-xs text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Passwords do not match
              </p>
            )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={
              loading || formData.newPassword !== formData.confirmPassword
            }
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating password...
              </>
            ) : (
              'Update password'
            )}
          </button>
        </div>
      </form>

      {/* Security Info */}
      <div className="pt-6 border-t border-gray-100">
        <h4 className="font-medium text-gray-900 mb-3">Security tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
            <span>
              Use a unique password that you don&apos;t use for other accounts
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
            <span>
              Include a mix of uppercase, lowercase, numbers, and special
              characters
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
            <span>
              Avoid using personal information like names or birthdays
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
            <span>
              Consider using a password manager to generate and store passwords
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
