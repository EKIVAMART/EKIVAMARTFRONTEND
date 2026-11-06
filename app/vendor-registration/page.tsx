'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorRegistrationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/become-a-vendor');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-[#228b22] rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm font-semibold">Redirecting to Become a Vendor portal...</p>
      </div>
    </div>
  );
}