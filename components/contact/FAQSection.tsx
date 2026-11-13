'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LifeBuoy, Truck, Store, MessageSquare, Briefcase, ArrowRight } from '@/components/ui/platform-icons';
import FadeInSection from '@/components/FadeInSection';
import { faqs } from './shared/types';

const FAQItem = ({ q, a, index }: { q: string; a: string; index: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <FadeInSection type="fadeUp" delay={0.08 + index * 0.07}>
      <div
        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
          open ? 'border-[#1c711c]/50 shadow-md shadow-[#1c711c]/10' : 'border-[#bfd4bc]'
        }`}
      >
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left bg-white hover:bg-[#f7f9f5] transition-colors group"
        >
          <span
            className={`font-bold text-[14px] sm:text-[15px] leading-snug transition-colors pr-4 ${
              open ? 'text-[#228b22]' : 'text-[#203c29] group-hover:text-[#228b22]'
            }`}
          >
            {q}
          </span>
          <ChevronDown
            size={18}
            className={`flex-shrink-0 text-[#1c711c] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <div className="px-5 sm:px-6 pb-5 bg-[#f7f9f5] border-t border-[#e3ebdf]">
            <p className="text-gray-600 text-[14px] sm:text-[14.5px] leading-relaxed pt-4">{a}</p>
          </div>
        )}
      </div>
    </FadeInSection>
  );
};

export default function FAQSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-14 items-start">
      {/* LEFT: FAQ */}
      <div>
        <FadeInSection type="slideLeft" delay={0.1}>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#228b22] to-[#1c711c] flex items-center justify-center text-white shadow-md">
              <LifeBuoy size={17} />
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase tracking-[4px] text-[#1c711c]">Common Questions</span>
              <h2
                className="text-2xl md:text-3xl font-extrabold text-[#203c29]"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Frequently Asked
              </h2>
            </div>
          </div>
        </FadeInSection>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>

        <FadeInSection type="fadeUp" delay={0.45}>
          <p className="mt-8 text-gray-400 text-sm">
            Still have questions?{' '}
            <Link href="/support" className="text-[#228b22] font-bold hover:underline">
              Browse our full support centre →
            </Link>
          </p>
        </FadeInSection>
      </div>

      {/* RIGHT: Quick Self-Help (before FAQs on mobile, beside on desktop) */}
      <div className="order-first lg:order-none">
        <FadeInSection type="fadeUp" delay={0.38}>
          <div className="rounded-2xl border border-[#bfd4bc] bg-white p-5 sm:p-6 lg:sticky lg:top-8">
            <p className="text-[10px] font-black uppercase tracking-[4px] text-[#1c711c] mb-4">
              Quick Self-Help
            </p>
            <div className="space-y-1">
              {[
                { label: 'Browse Support Articles', href: '/support',                              icon: LifeBuoy    },
                { label: 'Track Your Order',        href: '/support/topics/orders-tracking',       icon: Truck       },
                { label: 'Become a Vendor',         href: '/support/topics/becoming-a-vendor',     icon: Store       },
                { label: 'Privacy Policy',          href: '/privacy-policy',                       icon: MessageSquare },
                { label: 'Terms of Service',        href: '/terms-and-conditions',                 icon: Briefcase   },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f7f9f5] transition-colors group text-[13px] sm:text-[13.5px] text-gray-600 hover:text-[#228b22] font-medium"
                >
                  <Icon size={14} className="text-[#1c711c]/60 group-hover:text-[#1c711c] transition-colors flex-shrink-0" />
                  {label}
                  <ArrowRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[#1c711c]" />
                </Link>
              ))}
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}