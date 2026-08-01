'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { setCredentials } from '@/lib/features/auth/authSlice';
import { useAppDispatch } from '@/lib/hooks';

export function AuthCallbackClient() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);
  const [message, setMessage] = useState('Finishing your sign in...');

  useEffect(() => {
    if (handledRef.current) {
      return;
    }

    handledRef.current = true;

    const completeSocialAuth = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const isNewUser = searchParams.get('isNewUser') === 'true';

      if (!accessToken || !refreshToken) {
        toast.error('Social login did not return valid tokens.');
        setMessage('We could not finish your sign in. Redirecting...');
        router.replace('/');
        return;
      }

      window.history.replaceState(null, '', window.location.pathname);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      try {
        const response = await authApi.getProfile();

        if (!response?.data) {
          throw new Error('Could not load your profile.');
        }

        dispatch(
          setCredentials({
            user: response.data,
            accessToken,
            refreshToken,
          })
        );

        toast.success(
          isNewUser ? 'Account created successfully!' : 'Welcome back!'
        );
        setMessage('Signed in successfully. Redirecting...');
        const targetPath = response.data?.role?.toUpperCase() === 'VENDOR'
          ? '/vendor/dashboard'
          : '/';
        router.replace(targetPath);
      } catch (error: unknown) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        const errorMessage =
          error instanceof Error ? error.message : 'Social login failed.';

        toast.error(errorMessage);
        setMessage('We could not finish your sign in. Redirecting...');
        router.replace('/');
      }
    };

    void completeSocialAuth();
  }, [dispatch, router, searchParams]);

  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Social sign in
          </h1>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </section>
  );
}
