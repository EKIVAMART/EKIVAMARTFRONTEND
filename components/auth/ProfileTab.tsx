/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../lib/hooks';
import { setUser } from '@/lib/features/auth/authSlice';
import { authApi } from '@/lib/api';

export const ProfileTab: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.updateProfile(formData);
      if (response) {
        dispatch(setUser(response.data));
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsEditing(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-medium">Change</span>
          </button>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Profile picture</h3>
          <p className="text-sm text-gray-600 mt-1">
            Update your profile picture to personalize your account
          </p>
          <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700">
            Upload new picture
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-[#f3ecfc] border border-[#f3ecfc] rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-[#9d4ae3]" />
            <p className="text-sm font-medium text-[#8236be]">
              Profile updated successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              First name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              disabled={!isEditing || loading}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Last name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              disabled={!isEditing || loading}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
            />
          </div>
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email address
          </label>
          <div className="flex items-center gap-3">
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
            {user?.isEmailVerified && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecfc] text-[#8236be] text-xs font-medium rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Role (Read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Account role
          </label>
          <div className="px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
            <span className="text-gray-700 capitalize">
              {user?.role.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          {!isEditing ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
              >
                Edit profile
              </button>
              {user?.role?.toUpperCase() === 'VENDOR' && (
                <Link
                  href="/vendor/dashboard"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#9d4ae3] hover:bg-[#8236be] text-white font-medium rounded-lg transition-all flex items-center justify-center"
                >
                  Go to my dashboard
                </Link>
              )}
            </div>
          ) : (
            <>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save changes'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};
