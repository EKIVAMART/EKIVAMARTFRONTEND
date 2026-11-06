import React from 'react';
import type { Metadata } from 'next';
import NotificationsView from '@/components/notifications/NotificationsView';

export const metadata: Metadata = {
  title: 'Notifications & Activity | EkivaMart',
  description: 'View and manage all real-time order alerts, payment confirmations, and announcements.',
};

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-neutral-50/60 py-8">
      <NotificationsView />
    </div>
  );
}
