import React from 'react';
import Link from 'next/link';
import { Store, ArrowRight } from '@/components/ui/platform-icons';
import FadeInSection from '@/components/FadeInSection';

export default function VendorCTABanner() {
  return (
    <FadeInSection type="zoom" delay={0.15}>
      <div className="relative overflow-hidden rounded-3xl border border-[#bfd4bc]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#203c29] via-[#203c29] to-[#228b22]" />
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#1c711c] opacity-20 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#bfd4bc] opacity-10 blur-[60px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 32px)' }}
        />
        <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8 px-6 sm:px-10 md:px-12 py-9 sm:py-12 lg:py-14">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center">
            <Store size={26} className="text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[10px] font-black uppercase tracking-[4px] text-[#e3ebdf] mb-1">Grow Your Business</p>
            <h4 className="text-white font-extrabold text-xl md:text-2xl leading-tight">
              Ready to sell on EkivaMart?
            </h4>
            <p className="mt-2 text-white/60 text-sm leading-relaxed max-w-md">
              Join thousands of Nigerian vendors reaching millions of buyers. Our vendor team will onboard you within 48 hours.
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/support/topics/becoming-a-vendor"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#286537] font-extrabold text-sm px-6 py-3.5 rounded-full hover:bg-[#e3ebdf] hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-nowrap"
            >
              Start Selling <ArrowRight size={15} />
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/25 text-white font-bold text-sm px-6 py-3.5 rounded-full hover:bg-white/20 transition-colors whitespace-nowrap"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}