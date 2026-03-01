'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toast } from '@/components/ui/Toast';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isVendorRegistration = pathname === '/vendor-registration';

  return (
    <>
      <Toast />
      {!isVendorRegistration && <Navbar />}
      <main>{children}</main>
      {!isVendorRegistration && <Footer />}
    </>
  );
}
