import React from 'react';
import Link from 'next/link';
import { Clock, Truck, CreditCard, LifeBuoy } from 'lucide-react';
import FadeInSection from '@/components/FadeInSection';
import TypingText from '@/components/TypingText';
import HeroGeometry from './HeroGeometry';
import { RESPONSE_TIMES } from './shared/types';

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* ── Multi-layer background ── */}
      <div className="absolute inset-0 bg-[#1a0016]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0016] via-[#3d0040]/95 to-transparent" />

      {/* Chromatic glow orbs */}
      <div className="absolute top-[-8%] left-[30%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-[#8b0d7a] opacity-30 blur-[140px] pointer-events-none" />
      <div className="absolute top-[8%] right-[-8%] w-[40vw] h-[40vw] max-w-[540px] max-h-[540px] rounded-full bg-[#8236be] opacity-20 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full bg-[#5c0060] opacity-25 blur-[90px] pointer-events-none" />
      <div className="absolute top-[18%] left-[48%] w-[22vw] h-[22vw] max-w-[280px] max-h-[280px] rounded-full bg-[#ff69e0] opacity-[0.12] blur-[60px] pointer-events-none" />

      {/* Geometric art */}
      <HeroGeometry />

      {/* ── Status badges — desktop only ── */}
      <div className="absolute top-24 right-6 lg:right-12 hidden lg:flex flex-col gap-2.5 z-10">
        <div className="flex items-center gap-2.5 bg-white/[0.07] backdrop-blur-md border border-white/[0.12] text-white/75 text-[10px] font-bold uppercase tracking-[2.5px] px-4 py-2.5 rounded-full shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          WhatsApp Available
        </div>
        <div className="flex items-center gap-2.5 bg-white/[0.07] backdrop-blur-md border border-white/[0.12] text-white/75 text-[10px] font-bold uppercase tracking-[2.5px] px-4 py-2.5 rounded-full shadow-lg">
          <Clock size={10} className="opacity-70" />
          24 hr Email Response
        </div>
      </div>

      {/* ── Hero content ── */}
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 md:px-12 lg:px-20 w-full pt-32 pb-36">
        <div className="max-w-3xl">
          {/* Eyebrow pill — with circular border like "Legal & Privacy" */}
          <FadeInSection type="fadeDown" delay={0.1}>
            <div className="relative inline-flex items-center gap-2.5 mb-9">
              {/* Left tick */}
              <span className="block w-8 h-[1.5px] bg-gradient-to-r from-transparent to-[#ff69e0]/70" />

              <span className="text-[10px] font-black uppercase tracking-[4.5px] text-[#ff69e0]/80 px-6 py-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                Faflora · Get in Touch
              </span>

              {/* Right tick */}
              <span className="block w-8 h-[1.5px] bg-gradient-to-l from-transparent to-[#ff69e0]/70" />
            </div>
          </FadeInSection>

          {/* Headline */}
          <FadeInSection type="fadeUp" delay={0.2}>
            <h1
              className="font-black text-white leading-[0.92] tracking-[-0.02em] drop-shadow-[0_8px_48px_rgba(199,64,176,0.35)] lg:-skew-x-8 -skew-x-6"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: 'clamp(3.2rem, 8vw, 6rem)',
              }}
            >
              <span className="block text-white/90"><TypingText text="We're" delay={300} typingSpeed={70} /></span>
              <span className="block text-white"><TypingText text="always" delay={800} typingSpeed={70} /></span>
              <span
                className="block italic font-extrabold pb-6"
                style={{
                  background: 'linear-gradient(95deg, #f0c8ec 0%, #ff69e0 45%, #e879f9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                <TypingText text="listening." delay={1300} typingSpeed={65} />
              </span>
            </h1>
          </FadeInSection>

          {/* Refined rule */}
          <FadeInSection type="fadeUp" delay={0.42}>
            <div className="mt-9 flex items-center gap-2">
              <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-[#ff69e0] to-[#8236be]" />
              <div className="h-[2px] w-8 rounded-full bg-white/20" />
              <div className="h-[2px] w-3 rounded-full bg-white/10" />
            </div>
            <p className="mt-6 text-white/55 text-[15px] md:text-[17px] max-w-lg leading-[1.75] font-normal tracking-[0.01em]"
              style={{ fontFamily: "'Palatino Linotype', Georgia, serif" }}
            >
              Got a question, a complaint, or a great idea? Faflora' support team is standing by — for buyers, vendors, partners, and everyone in between.
            </p>
          </FadeInSection>

          {/* Quick action chips */}
          <FadeInSection type="fadeUp" delay={0.58}>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {[
                { label: 'Track an Order', icon: Truck, href: '/support/topics/orders-tracking' },
                { label: 'Request Refund', icon: CreditCard, href: '/support/topics/payments-refunds-withdrawals' },
                { label: 'Support Center', icon: LifeBuoy, href: '/support' },
              ].map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="inline-flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/80 text-[11.5px] font-bold px-4 py-2.5 rounded-full hover:bg-white/[0.15] hover:border-white/30 hover:text-white transition-all duration-200 tracking-wide"
                >
                  <Icon size={12} /> {label}
                </Link>
              ))}
            </div>
          </FadeInSection>
        </div>

        {/* ── Response time strip ── */}
        <FadeInSection type="fadeUp" delay={0.74}>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            {RESPONSE_TIMES.map(({ channel, time, icon: Icon, dot }) => (
              <div
                key={channel}
                className="flex items-center gap-3 bg-white/[0.06] backdrop-blur-md border border-white/[0.1] rounded-2xl px-4 py-4 hover:bg-white/[0.1] transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-white/[0.12] flex items-center justify-center text-white/80 flex-shrink-0 border border-white/[0.08]">
                  <Icon size={15} />
                </div>
                <div>
                  <p className="text-white/90 text-[13px] font-bold leading-tight tracking-wide">{channel}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                    <p className="text-white/45 text-[11px]">{time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeInSection>
      </div>

      {/* SVG Slope Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="#fdf8ff"
          />
        </svg>
      </div>
    </section>
  );
}