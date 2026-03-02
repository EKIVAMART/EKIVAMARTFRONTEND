'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toast } from '@/components/ui/Toast';

function NavbarSkeleton() {
  return <div className="h-16 sm:h-20 bg-gray-100 animate-pulse" />;
}

function MainSkeleton() {
  return <div className="min-h-screen bg-gray-100 animate-pulse" />;
}

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isVendorRegistration = pathname === '';

  return (
    <>
      {!isVendorRegistration && (
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>
      )}
      <Suspense fallback={<MainSkeleton />}>
        <main>{children}</main>
      </Suspense>
      {!isVendorRegistration && <Footer />}
      <Toast />
    </>
  );
}
