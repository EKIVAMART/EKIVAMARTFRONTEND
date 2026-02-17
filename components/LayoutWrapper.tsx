'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isVendorRegistration = pathname === '/vendor-registration';

  return (
    <>
      {!isVendorRegistration && <Navbar />}
      <main>{children}</main>
      {!isVendorRegistration && <Footer />}
    </>
  );
}
