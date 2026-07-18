'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toast } from '@/components/ui/Toast';
import CartNoteModal from './CartNoteModal';

import { ResetPasswordModalTrigger } from '@/components/auth/ResetPasswordModalTrigger';

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
  const isVendorRegistration = pathname === '/vendor-registration' || pathname === '/vendor/apply' || pathname?.startsWith('/vendor/application'); //|| pathname === '/become-a-vendor';
  const isSuperAdminRoute = pathname?.startsWith('/super-admin');
  const isAdminRoute = pathname?.startsWith('/admin');
  const isLanding = pathname?.startsWith('/landing');
  const hideNavigation = isVendorRegistration || isSuperAdminRoute || isAdminRoute || isLanding;

  return (
    <>
      {!hideNavigation && (
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>
      )}
      <Suspense fallback={<MainSkeleton />}>
        <main>{children}</main>
      </Suspense>
      {!hideNavigation && <Footer />}
      <Toast />
      <CartNoteModal />
      <Suspense fallback={null}>
        <ResetPasswordModalTrigger />
      </Suspense>
    </>
  );
}
