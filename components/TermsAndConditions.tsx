'use client';

import React from 'react';
import FadeInSection from '@/components/FadeInSection';
import TypingText from '@/components/TypingText';
import { ArrowRight, Shield, RefreshCcw, CreditCard, Store, Lock, Scale, BarChart2, Users } from 'lucide-react';

const PrimaryButton = ({ text, onClick }: { text: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 bg-white text-[#981d87] px-10 py-4 rounded-full font-extrabold transition-all group text-base shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 border-2 border-white hover:bg-[#f9eaf8] tracking-wide"
  >
    {text}
    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
  </button>
);

const SectionIcon = ({ icon }: { icon: React.ReactNode }) => (
  <div className="flex-shrink-0 mt-1 w-11 h-11 rounded-xl bg-gradient-to-br from-[#9d4ae3] to-[#8236be] text-white flex items-center justify-center shadow-md shadow-[#9d4ae330]">
    {icon}
  </div>
);

const SectionTitle = ({ subtitle, title, icon }: { subtitle: string; title: string; icon: React.ReactNode }) => (
  <div className="mb-8 flex items-start gap-4">
    <SectionIcon icon={icon} />
    <div>
      <span className="block text-[#8236be] font-bold uppercase tracking-[3px] text-xs mb-1">
        Section {subtitle}
      </span>
      <h3 className="text-2xl md:text-3xl font-extrabold text-[#1a0018] leading-tight">{title}</h3>
    </div>
  </div>
);

const BulletItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 mt-[7px] w-5 h-5 rounded-full bg-[#f0c8ec] flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#9d4ae3] to-[#8236be]" />
    </div>
    <span className="text-gray-600 text-sm md:text-base leading-relaxed">{text}</span>
  </div>
);

const InfoCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[#fdf3fc] to-[#f9eaf8] border border-[#e8b8e4]">
    <p className="font-bold text-[#9d4ae3] mb-4 flex items-center gap-2">
      <span className="w-5 h-5 rounded-full bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white flex items-center justify-center text-[10px]">!</span>
      {label}
    </p>
    {children}
  </div>
);

const SectionWrapper = ({ children, delay }: { children: React.ReactNode; delay: number }) => (
  <FadeInSection type="fadeUp" delay={delay}>
    <div className="group relative pl-6 border-l-2 border-[#e8b8e4] hover:border-[#9d4ae3] transition-colors duration-300">
      {children}
    </div>
  </FadeInSection>
);

export default function TermsAndConditions() {
  return (
    <div className="font-sans bg-white min-h-screen overflow-x-hidden" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* ── HERO ── */}
      <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2d0029] via-[#6b0f6b] to-[#9d4ae3]" />
        <div className="absolute top-[-10%] left-[-8%] w-[55vw] h-[55vw] rounded-full bg-[#8236be] opacity-20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#3d0060] opacity-30 blur-[100px] pointer-events-none" />
        <div className="absolute top-[30%] right-[15%] w-[28vw] h-[28vw] rounded-full bg-[#ff69e0] opacity-10 blur-[80px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-56 h-56 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute top-16 right-16 w-40 h-40 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute bottom-10 left-6 w-72 h-72 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 40px)' }} />

        <div className="absolute top-24 right-[8%] hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-semibold px-4 py-2 rounded-full border border-white/20 select-none">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> NDPR Compliant
        </div>
        <div className="absolute top-40 right-[12%] hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-semibold px-4 py-2 rounded-full border border-white/20 select-none">
          <Lock size={11} /> Secure Escrow
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full pt-24 pb-16">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
              <Shield size={12} /> Legal &amp; Privacy
            </div>
            <h1
              className="text-white font-black uppercase leading-[0.95] tracking-tight lg:-skew-x-8 -skew-x-6 text-5xl md:text-7xl lg:text-[5.5rem] drop-shadow-[0_4px_32px_rgba(199,64,176,0.4)]"
              style={{ fontFamily: "'Georgia', serif", textShadow: '0 2px 40px rgba(248, 243, 247, 0.35)' }}
            >
              <TypingText text="Terms of Service & Privacy Policy" className='text-brand-300' delay={300} typingSpeed={65} />
            </h1>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-[3px] w-16 rounded-full bg-[#ff69e0]" />
              <div className="h-[3px] w-8 rounded-full bg-white/30" />
              <div className="h-[3px] w-4 rounded-full bg-white/15" />
            </div>
            <p className="mt-8 text-white/65 text-base md:text-lg max-w-xl leading-relaxed">
              Last updated: <span className="text-white/90 font-semibold">April 03, 2026</span>
            </p>
            <p className="mt-4 text-white/55 text-sm max-w-2xl leading-relaxed">
              These terms govern your use of Nigeria's premier multivendor marketplace. Please read carefully before using our platform.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-12 pb-32">

        {/* Intro */}
        <FadeInSection type="fadeUp" delay={0.2} className="pt-12">
          <div className="relative p-8 rounded-2xl bg-gradient-to-br from-[#f9eaf8] to-white border border-[#e8b8e4] shadow-sm">
            <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-gradient-to-br from-[#9d4ae3] to-[#8236be] flex items-center justify-center shadow-md">
              <Shield size={14} className="text-white" />
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              <span className="font-bold text-[#9d4ae3]">Faflora</span> stands as Nigeria's premier multivendor online marketplace, designed to revolutionize how local vendors connect with millions of buyers across the country. By centralizing payments, vendor data, and customer data on one powerful, user-friendly platform, Faflora eliminates the headaches of running an independent online store while amplifying your reach, sales potential, and business growth. Whether you're a small fashion boutique in Lagos, a handmade crafts artisan in Asaba, a shoe vendor in Abuja, or a beauty products seller in Port Harcourt, Faflora provides the infrastructure you need to thrive in Nigeria's booming ecommerce landscape.
            </p>
            <p className="mt-5 text-gray-600 leading-relaxed">
              We handle the heavy lifting so you can focus on what matters most: sourcing quality products, delighting customers, and scaling your brand. Our platform supports seamless shopping experiences with features like easy search, secure transactions, fast nationwide delivery partnerships, and innovative options such as partial or installment payments — allowing customers to buy now and pay later without stress. This flexibility boosts conversion rates and helps vendors move more inventory, especially for higher-value items like clothing, accessories, electronics, home goods, and more.
            </p>
            <p className="mt-5 text-gray-600 leading-relaxed">
              At its core, Faflora is built on trust, empowerment, and simplicity. We bridge buyers seeking affordable, high-quality, locally made Nigerian products with vendors ready to grow. Shopping on Faflora is seamless, secure, and stylish — customers discover authentic items from trusted local sellers, while vendors gain visibility, analytics, and tools to compete effectively against bigger players.
            </p>
          </div>
        </FadeInSection>

        <div className="space-y-16 pt-20 text-gray-700 leading-relaxed text-[15px] md:text-[17px]">

          {/* 1. Payments */}
          <SectionWrapper delay={0.3}>
            <SectionTitle subtitle="1" title="Payments" icon={<CreditCard size={20} />} />
            <p className="text-gray-600">
              Faflora integrates robust, secure payment gateways tailored for the Nigerian market, supporting popular methods like bank transfers, cards, mobile money, USSD, and flexible partial payment plans. Customers can split payments over time, making premium or bulk purchases accessible without waiting for payday.
            </p>
            <div className="mt-6 grid gap-3">
              <BulletItem text="Funds are held securely in escrow until delivery confirmation, protecting both buyers and vendors." />
              <BulletItem text="Vendors receive reliable, scheduled payouts (minus transparent platform fees) directly to their verified bank accounts — often within days of successful order completion." />
              <BulletItem text="Escrow auto-releases after a set period if no dispute is raised, ensuring cash flow is never unnecessarily delayed." />
              <BulletItem text="This system reduces payment risks, minimizes fraud exposure, and ensures steady cash flow for your business operations." />
            </div>
          </SectionWrapper>

          {/* 2. Vendor Data */}
          <SectionWrapper delay={0.35}>
            <SectionTitle subtitle="2" title="Vendor Data" icon={<BarChart2 size={20} />} />
            <p className="text-gray-600">
              We provide a centralized dashboard where you manage everything: product uploads, high-resolution images, detailed descriptions, pricing, variations (sizes, colors, etc.), inventory tracking, and sales analytics.
            </p>
            <div className="mt-6 grid gap-3">
              <BulletItem text="Track performance metrics like views, add-to-carts, orders, revenue trends, top-performing items, and customer feedback." />
              <BulletItem text="Use insights to optimize listings, adjust pricing strategically, run promotions, and identify growth opportunities." />
              <BulletItem text="No more scattered spreadsheets — Faflora keeps your vendor data organized, secure, and actionable, helping you make data-driven decisions to boost profitability." />
            </div>
          </SectionWrapper>

          {/* 3. Customer Data */}
          <SectionWrapper delay={0.4}>
            <SectionTitle subtitle="3" title="Customer Data" icon={<Users size={20} />} />
            <p className="text-gray-600">
              Faflora securely collects and manages buyer information needed for smooth transactions: shipping addresses, order history, preferences, and contact details.
            </p>
            <div className="mt-6 grid gap-3">
              <BulletItem text="Powers personalized recommendations, targeted promotions, abandoned cart reminders, and loyalty rewards." />
              <BulletItem text="Vendors receive aggregated insights (without revealing personal identities) to understand audience behavior — e.g., popular categories in specific regions — so you can stock what Nigerians want most." />
              <BulletItem text="All data handling prioritizes privacy and compliance, fostering long-term customer trust and repeat business." />
            </div>
          </SectionWrapper>

          {/* 4. Payment Liability */}
          <SectionWrapper delay={0.45}>
            <SectionTitle subtitle="4" title="Payment Liability" icon={<Shield size={20} />} />
            <p className="text-gray-600">
              One of the biggest advantages of joining Faflora is reduced financial risk for vendors. We manage the entire payment ecosystem, including fraud detection, chargeback handling, and dispute resolution.
            </p>
            <div className="mt-6 grid gap-3">
              <BulletItem text="When a customer pays, funds enter escrow — released to you only after order fulfillment and buyer confirmation (or auto-release after a set period if no issues arise)." />
              <BulletItem text="Protects you from non-payment scams or unauthorized transactions." />
              <BulletItem text="In cases of valid disputes (e.g., item not received), Faflora facilitates fair resolution, often covering platform-side liabilities." />
              <BulletItem text="Vendors aren't directly exposed to raw card details or immediate refund demands — we handle processing refunds from escrow where appropriate." />
              <BulletItem text="Competitive, transparent commission rates with scheduled payouts. This structure builds confidence especially for new or small-scale sellers entering ecommerce." />
            </div>
          </SectionWrapper>

          {/* 5. Vendor Responsibility */}
          <SectionWrapper delay={0.5}>
            <SectionTitle subtitle="5" title="Vendor Responsibility" icon={<Store size={20} />} />
            <p className="text-gray-600">Success on Faflora thrives on mutual accountability. As a vendor, you commit to:</p>
            <div className="mt-6 grid gap-3">
              <BulletItem text="Uploading accurate, honest product listings with clear photos, specifications, pricing, and stock levels to prevent overselling or cancellations." />
              <BulletItem text="Ensuring all items are genuine, high-quality, and meet Nigerian consumer standards — no counterfeits or misleading claims." />
              <BulletItem text="Fulfilling orders promptly: pack securely, ship within agreed timelines (often 1–3 business days), and provide tracking via our partnered logistics for fast delivery to all states." />
              <BulletItem text="Communicating professionally with customers through our messaging system for queries, updates, or issues." />
              <BulletItem text="Complying with platform guidelines, Nigerian laws (including consumer protection and e-commerce regulations), and honoring your listed policies on warranties, returns, or exchanges." />
              <BulletItem text="Maintaining positive ratings — high-performing vendors get boosted visibility, priority support, and promotional features. Breaches (e.g., repeated late shipments) may lead to warnings, suspensions, or account review, but we offer guidance to help you improve. Ultimately, your responsibility drives your reputation and success on the platform." />
            </div>
          </SectionWrapper>

          {/* 6. Refund Policy */}
          <SectionWrapper delay={0.55}>
            <SectionTitle subtitle="6" title="Refund Policy" icon={<RefreshCcw size={20} />} />
            <p className="text-gray-600">
              Customer satisfaction is paramount at Faflora, and our refund policy balances fairness for buyers with protection for honest vendors.
            </p>
            <div className="mt-6 grid gap-3">
              <BulletItem text="Customers may initiate returns/refunds for defective, damaged, incorrect, or non-delivered items — typically within 7–14 days of receipt (exact window displayed per order; always check current faflora.com policy)." />
              <BulletItem text="For vendor errors (wrong item, poor quality), you may cover return shipping, and approved refunds deduct from your escrow or future payouts." />
              <BulletItem text="Valid refunds process back to the original payment method, often within 5–10 business days." />
              <BulletItem text="Change-of-mind returns depend on your individual store policy — some vendors offer them for a competitive edge." />
              <BulletItem text="Faflora mediates fairly, reviewing evidence like photos or tracking data. Vendors with low dispute rates enjoy better platform perks." />
            </div>
            <InfoCard label="Non-refundable items (must be clearly marked in listings):">
              <div className="grid gap-2">
                {['Personalized or custom-made products', 'Hygiene, beauty, and personal care items', 'Perishable goods'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8236be] flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </InfoCard>
          </SectionWrapper>

          {/* 7. Data Usage */}
          <SectionWrapper delay={0.6}>
            <SectionTitle subtitle="7" title="Data Usage & Privacy" icon={<Lock size={20} />} />
            <p className="text-gray-600">
              Data is handled responsibly to enhance the entire ecosystem while protecting privacy at every layer.
            </p>
            <div className="mt-6 grid gap-3">
              <BulletItem text="We collect vendor data (business profile, sales stats, listings) to deliver tools like performance dashboards, search optimization, recommendation algorithms, and marketing insights — helping you grow visibility and sales." />
              <BulletItem text="Customer data (orders, browsing patterns, aggregate demographics) enables personalized shopping, targeted ads, delivery coordination, and platform improvements." />
              <BulletItem text="All personal information is encrypted, never sold to third parties, and used strictly for legitimate purposes." />
              <BulletItem text="We comply fully with Nigeria's Data Protection Regulation (NDPR) and international best practices, conducting regular audits." />
              <BulletItem text="Vendors can access their own data reports, but sensitive customer details are safeguarded at all times. This responsible approach builds trust — buyers shop confidently, vendors benefit from better tools, and the entire Faflora community grows sustainably." />
            </div>
          </SectionWrapper>

          {/* 8. Governing Law */}
          <SectionWrapper delay={0.65}>
            <SectionTitle subtitle="8" title="Governing Law" icon={<Scale size={20} />} />
            <p className="text-gray-600 leading-relaxed">
              These Terms are governed by the laws of the Federal Republic of Nigeria.
              Any disputes arising from or in connection with these Terms shall be resolved by the competent courts of Nigeria.
            </p>
          </SectionWrapper>

          {/* ── CTA FOOTER ── */}
          <FadeInSection type="fadeUp" delay={0.7} className="pt-16">
            <div className="relative overflow-hidden rounded-[28px] w-full">
              {/* Backgrounds */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e0020] via-[#5a0a5a] to-[#9d4ae3]" />
              <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 40px)' }} />
              <div className="absolute top-[-40%] left-[-10%] w-[55%] h-[200%] rounded-full bg-[#8236be] opacity-18 blur-[90px] pointer-events-none" />
              <div className="absolute bottom-[-40%] right-[-5%] w-[40%] h-[180%] rounded-full bg-[#3d0060] opacity-28 blur-[80px] pointer-events-none" />
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/[0.07] pointer-events-none" />
              <div className="absolute -top-7 -right-7 w-44 h-44 rounded-full border border-white/[0.07] pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full border border-white/[0.04] pointer-events-none" />

              {/* Content grid */}
              <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-10 lg:gap-16 px-10 lg:px-20 py-14 lg:py-16">

                {/* LEFT */}
                <div className="flex flex-col gap-5">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 rounded-full w-fit">
                    <span className="w-2 h-2 rounded-full bg-[#ff69e0]" />
                    Nigeria's premier marketplace
                  </div>

                  <h4 className="text-white font-black text-[2.2rem] md:text-[2.5rem] leading-[1.1] tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                    Shop Seamless.<br />
                    <span className="text-[#ff9eed]">Sell Smarter.</span>
                  </h4>

                  <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl">
                    Joining Faflora means partnering with a platform that's truly Nigerian-focused — empowering local creators, supporting small businesses, and making online shopping accessible and enjoyable for everyone. With millions of potential customers, flexible payments, powerful tools, and strong protections, Faflora isn't just another marketplace — it's your gateway to exponential growth in Nigeria's digital economy.
                  </p>

                  {/* Stats strip */}
                  <div className="flex flex-col md:flex-row gap-7 px-6 py-4 bg-white/[0.06] border border-white/10 rounded-2xl w-full mx-auto">
                    {[
                      { num: 'Escrow', label: 'Protected payments' },
                      { num: 'NDPR', label: 'Data compliant' },
                      { num: '36 States', label: 'Nationwide reach' },
                    ].map(({ num, label }, i, arr) => (
                      <React.Fragment key={i}>
                        <div className="text-center">
                          <span className="block text-white font-extrabold text-lg tracking-tight">{num}</span>
                          <span className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">{label}</span>
                        </div>
                        {i < arr.length - 1 && <div className="w-full h-px md:w-px md:h-auto bg-white/30 md:bg-white/20" />}
                      </React.Fragment>
                    ))}
                  </div>

                  <p className="text-white/30 text-xs leading-relaxed max-w-md border-l-2 border-white/10 pl-3">
                    By continuing to browse or use Faflora, you acknowledge that you have read and accepted these Terms of Service and Privacy Policy.
                  </p>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col items-center gap-5">
                  <div className="w-16 h-16 lg:flex hidden rounded-[18px] bg-white/10 border border-white/20 items-center justify-center">
                    <Store size={28} className="text-white/85" />
                  </div>
                  <div className="hidden lg:block w-px h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                  <PrimaryButton text="Return to Homepage" onClick={() => (window.location.href = '/')} />
                  <p className="text-white/50 text-[12px] md:text-[15px] text-center md:max-w-[140px] leading-relaxed">
                    Why wait? Onboard today, list your products, and watch your business flourish
                  </p>
                  <p className="text-white/70 text-[12px] md:text-[15px] text-center md:max-w-[140px] leading-relaxed">
                    The future of Nigerian commerce starts here.
                  </p>
                </div>
              </div>
            </div>
          </FadeInSection>

        </div>
      </div>
    </div>
  );
}