'use client';

import { ArrowLeft } from '@/components/ui/platform-icons';

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Go Back</span>
    </button>
  );
}
