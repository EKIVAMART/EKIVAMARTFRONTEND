'use client';

import React, { useState } from 'react';
import {
  User,
  Shield,
  Monitor,
  LogOut,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { logout } from '../../lib/features/auth/authSlice';
import { authApi } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { ProfileTab } from './ProfileTab';
import { SecurityTab } from './SecurityTab';
import { SessionsTab } from './SessionsTab';
import { AddressesTab } from './AddressesTab';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'profile' | 'addresses' | 'security' | 'sessions';

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authApi.logoutCurrentSession();
      dispatch(logout());
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: User,
      description: 'Personal info',
    },
    {
      id: 'addresses' as TabType,
      label: 'Addresses',
      icon: MapPin,
      description: 'Saved addresses',
    },
    {
      id: 'security' as TabType,
      label: 'Security',
      icon: Shield,
      description: 'Password',
    },
    {
      id: 'sessions' as TabType,
      label: 'Sessions',
      icon: Monitor,
      description: 'Active devices',
    },
  ];

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={undefined}
      description={undefined}
      size="2xl"
      showCloseButton={true}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Premium Profile Header */}
        <div className="relative bg-linear-to-r from-purple-600 via-purple-500 to-purple-600 rounded-lg sm:rounded-xl overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1),transparent)]"></div>
          </div>

          <div className="relative px-4 sm:px-6 py-6 sm:py-8 md:py-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white shadow-lg flex items-center justify-center text-purple-600 text-2xl sm:text-3xl md:text-4xl font-bold ring-4 ring-purple-200">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left pb-0 sm:pb-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  {user?.isEmailVerified && (
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#f3ecfc]" />
                      <span className="text-xs sm:text-sm text-[#f3ecfc] font-medium">
                        Verified
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-purple-100 text-sm sm:text-base mt-1">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 px-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className={`relative flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 group ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 shadow-sm'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {/* Tab Icon */}
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-purple-600'
                      : 'text-gray-600 group-hover:text-purple-500'
                  }`}
                />

                {/* Tab Labels */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 text-center sm:text-left">
                  <span className="text-[11px] sm:text-xs font-semibold">
                    {tab.label}
                  </span>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-1 bg-linear-to-r from-purple-600 to-indigo-600 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="bg-linear-to-br from-gray-50 via-white to-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 min-h-105 sm:min-h-120 border border-gray-100 shadow-sm"
          >
            <div className="space-y-4 sm:space-y-6">
              {activeTab === 'profile' && <ProfileTab onClose={onClose} />}
              {activeTab === 'addresses' && <AddressesTab />}
              {activeTab === 'security' && <SecurityTab />}
              {activeTab === 'sessions' && <SessionsTab />}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Divider */}
        <div className="h-px bg-linear-to-r from-gray-200 via-gray-300 to-gray-200"></div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Help Text */}
          <div className="flex-1 flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg px-3 sm:px-4 py-2 sm:py-3">
            <AlertCircle className="w-4 h-4 smw-5 sm:h-5 text-blue-500 shrink-0" />
            <span>Need help? Contact our support team</span>
          </div>

          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">
              {loading ? 'Signing out...' : 'Sign Out'}
            </span>
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};
