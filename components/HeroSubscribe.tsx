'use client';

import { assets } from '@/assets/assets';
import { Mail } from 'lucide-react';
import Image from 'next/image';

export default function HeroSubscribe() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-8 md:gap-10 rounded-3xl bg-gradient-to-br from-[#f0fdf4] via-[#e9fff3] to-[#f5f0ff] px-6 py-10 md:flex-row md:px-12 lg:px-16 shadow-lg shadow-purple-100/50 border border-green-100/50">

        {/* LEFT CONTENT */}
        <div className="w-full md:max-w-xl">
          <h2 className="mb-3 text-2xl sm:text-3xl md:text-4xl font-bold leading-snug text-gray-800">
            Stay home &amp; get your daily <br className="hidden sm:block" />
            needs from our shop
          </h2>

          <p className="mb-6 text-sm sm:text-base text-gray-500">
            Start Your Daily Shopping with Faflora
          </p>

          {/* SUBSCRIBE INPUT */}
          <div className="flex items-center overflow-hidden rounded-full bg-white shadow-md ring-1 ring-gray-200/60 w-full max-w-sm sm:max-w-md">
            {/* Mail Icon */}
            <div className="flex items-center pl-4 pr-2 text-gray-400 shrink-0">
              <Mail size={16} />
            </div>

            {/* Input */}
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 min-w-0 px-2 py-3 sm:py-4 text-sm text-gray-600 outline-none"
            />

            {/* Button */}
            <button className="shrink-0 rounded-full bg-gradient-to-r from-[#9d4ae3] to-[#8236be] px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all hover:from-[#8236be] hover:to-[#692a99] hover:shadow-lg hover:shadow-purple-400/30 active:scale-95">
              Subscribe
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE — hidden on small mobile */}
        <div className="hidden sm:block relative w-full md:w-auto md:shrink-0 md:max-w-xs lg:max-w-sm">
          <Image
            src={assets.newsletter}
            alt="Subscribe illustration"
            width={400}
            height={320}
            className="w-full object-contain drop-shadow-lg"
            priority
          />
        </div>
      </div>
    </section>
  );
}
