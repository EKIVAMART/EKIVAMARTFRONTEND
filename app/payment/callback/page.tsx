import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { PaymentCallbackClient } from './PaymentCallbackClient';

function PaymentCallbackFallback() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#9d4ae3]" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Verifying Payment</h1>
          <p className="mt-2 text-sm text-gray-500">Please wait while we confirm your payment...</p>
        </div>
      </div>
    </section>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<PaymentCallbackFallback />}>
      <PaymentCallbackClient />
    </Suspense>
  );
}
