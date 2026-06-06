'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResetPasswordModal } from './ResetPasswordModal';

export function ResetPasswordModalTrigger() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const modal = searchParams.get('modal');
    const tokenParam = searchParams.get('token');

    if (modal === 'reset-password' && tokenParam) {
      setToken(tokenParam);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsOpen(false);
    const params = new URLSearchParams(window.location.search);
    params.delete('modal');
    params.delete('token');
    const newSearch = params.toString();
    router.push(newSearch ? `?${newSearch}` : window.location.pathname, { scroll: false });
  };

  const handleSuccess = () => {
    setIsOpen(false);
    const params = new URLSearchParams(window.location.search);
    params.delete('modal');
    params.delete('token');
    const newSearch = params.toString();
    router.push(newSearch ? `?${newSearch}` : window.location.pathname, { scroll: false });
    // Redirect user to home page or login page
    router.push('/');
  };

  return (
    <ResetPasswordModal
      isOpen={isOpen}
      otp={token}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
}
