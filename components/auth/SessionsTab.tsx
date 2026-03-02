/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { authApi } from '@/lib/api';

interface Session {
  id: string;
  deviceType: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export const SessionsTab: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authApi.getSessions();
      setSessions(response?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (
      !confirm(
        'Are you sure you want to log out of all other sessions? You will remain logged in on this device.'
      )
    ) {
      return;
    }

    setLoggingOut(true);

    try {
      await authApi.logoutAllSessions();
      await fetchSessions();
    } catch (err: any) {
      setError(err.message || 'Failed to logout all sessions');
    } finally {
      setLoggingOut(false);
    }
  };

  const getDeviceIcon = (deviceType: string | undefined) => {
    if (!deviceType) return Monitor;
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const formatLastActive = (date: string) => {
    const now = new Date();
    const lastActive = new Date(date);
    const diffMinutes = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return 'Active now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Active sessions
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage and monitor your active sessions across all devices
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={handleLogoutAll}
            disabled={loggingOut}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
          >
            {loggingOut ? 'Logging out...' : 'Log out all other sessions'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No active sessions found</p>
          </div>
        ) : (
          sessions
            .filter((session) => session && session.id)
            .map((session) => {
              if (!session) return null;
              const DeviceIcon = getDeviceIcon(session.deviceType);

              return (
                <div
                  key={session.id}
                  className={`p-4 border rounded-xl transition-all ${
                    session.isCurrent
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        session?.isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                      }`}
                    >
                      <DeviceIcon
                        className={`w-6 h-6 ${
                          session?.isCurrent ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {session?.deviceName || 'Unknown'} ·{' '}
                          {session?.browser || 'Unknown'}
                        </h4>
                        {session?.isCurrent && (
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{session?.location || 'Unknown'}</span>
                          <span className="text-gray-400">·</span>
                          <span>{session?.ipAddress || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {session?.lastActive
                              ? formatLastActive(session.lastActive)
                              : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!session?.isCurrent && (
                      <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Security notice</p>
            <p>
              If you notice any suspicious activity or unrecognized sessions,
              revoke them immediately and change your password. Sessions
              automatically expire after 30 days of inactivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
