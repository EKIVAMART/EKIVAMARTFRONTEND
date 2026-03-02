import Link from 'next/link';
import { AlertCircle, Home } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-linear-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">404</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Page not found
          </h2>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It
          might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
