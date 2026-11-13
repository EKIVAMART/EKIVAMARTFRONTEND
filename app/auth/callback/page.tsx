import { Suspense } from 'react';
import { Loader2 } from '@/components/ui/platform-icons';
import { AuthCallbackClient } from './AuthCallbackClient';

function AuthCallbackFallback() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Social sign in
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Finishing your sign in...
          </p>
        </div>
      </div>
    </section>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackClient />
    </Suspense>
  );
}
