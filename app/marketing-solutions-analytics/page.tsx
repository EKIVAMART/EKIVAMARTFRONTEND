'use client';

import React from 'react';
import Link from 'next/link';
import FadeInSection from '@/components/FadeInSection';
import TypingText from '@/components/TypingText';
import {
  BarChart3,
  TrendingUp,
  Target,
  Megaphone,
  PieChart,
  LineChart,
  Users,
  ShoppingBag,
  ArrowRight,
  Zap,
  Eye,
  MousePointerClick,
  Globe,
  Layers,
  Award,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

const Divider = () => (
  <div className="flex items-center gap-3 my-24">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8b8e4] to-transparent" />
    <div className="w-1.5 h-1.5 rounded-full bg-[#ad74e8]" />
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8b8e4] to-transparent" />
  </div>
);

const SectionEyebrow = ({
  eyebrow,
  title,
  icon: Icon,
  delay = 0.1,
}: {
  eyebrow: string;
  title: string;
  icon: LucideIcon;
  delay?: number;
}) => (
  <FadeInSection type="slideLeft" delay={delay}>
    <div className="flex items-center gap-3 mb-10">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9d4ae3] to-[#8236be] flex items-center justify-center text-white shadow-lg shadow-[#9d4ae330]">
        <Icon size={18} />
      </div>
      <div>
        <span className="block text-[10px] font-black uppercase tracking-[4px] text-[#8236be]">
          {eyebrow}
        </span>
        <h2
          className="text-2xl md:text-3xl font-extrabold text-[#1a0018] leading-tight"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {title}
        </h2>
      </div>
    </div>
  </FadeInSection>
);

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}) => (
  <FadeInSection type="fadeUp" delay={0.1 + index * 0.08}>
    <div className="group relative h-full bg-white border border-[#e8b8e4] rounded-3xl p-7 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-[#8236be] overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[#fdf3fc]/40 to-transparent" />
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9d4ae3] to-[#8236be] flex items-center justify-center text-white mb-5 shadow-md shadow-[#9d4ae320] group-hover:scale-110 transition-transform duration-300">
          <Icon size={22} />
        </div>
        <h3 className="text-lg font-extrabold text-[#1a0018] mb-3 leading-tight">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  </FadeInSection>
);

const StatCard = ({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) => (
  <FadeInSection type="zoom" delay={0.15 + index * 0.1}>
    <div className="text-center px-6 py-8 rounded-2xl border border-[#e8b8e4] bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      <span
        className="block text-4xl md:text-5xl font-black text-[#9d4ae3] mb-2 tracking-tight"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {value}
      </span>
      <span className="text-xs font-bold uppercase tracking-[3px] text-[#8236be]">{label}</span>
    </div>
  </FadeInSection>
);

const AnalyticsMetricRow = ({
  icon: Icon,
  metric,
  description,
  delay,
}: {
  icon: LucideIcon;
  metric: string;
  description: string;
  delay: number;
}) => (
  <FadeInSection type="fadeUp" delay={delay}>
    <div className="flex items-start gap-4 p-5 rounded-2xl border border-[#e8b8e4] bg-white hover:bg-[#fdf3fc]/60 hover:border-[#8236be] transition-all duration-300 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#fdf3fc] border border-[#e8b8e4] flex items-center justify-center text-[#9d4ae3] group-hover:bg-gradient-to-br group-hover:from-[#9d4ae3] group-hover:to-[#8236be] group-hover:text-white group-hover:border-transparent transition-all duration-300">
        <Icon size={18} />
      </div>
      <div>
        <h4 className="font-bold text-[#1a0018] text-sm mb-1">{metric}</h4>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  </FadeInSection>
);

const CheckItem = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3 text-gray-600 text-[15px] md:text-[16px] leading-relaxed">
    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#9d4ae3] to-[#8236be] flex items-center justify-center shadow-sm">
      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
        <path d="M1 3.5L3.2 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <span>{text}</span>
  </li>
);

const marketingFeatures = [
  {
    icon: Target,
    title: 'Sponsored Listings',
    description:
      'Boost your products to the top of search results and category pages. Pay-per-click pricing means you only pay when shoppers engage with your listings.',
  },
  {
    icon: Megaphone,
    title: 'Campaign Manager',
    description:
      'Create targeted promotional campaigns with custom budgets, scheduling, and audience filters. Run flash sales, seasonal promos, and discount bundles effortlessly.',
  },
  {
    icon: Eye,
    title: 'Brand Storefront',
    description:
      'Design a dedicated brand page on Faflora with custom banners, featured collections, and your brand story. Build recognition and loyalty at scale.',
  },
  {
    icon: MousePointerClick,
    title: 'Retargeting & Remarketing',
    description:
      'Re-engage shoppers who viewed your products but didn\'t purchase. Automated email and on-platform retargeting drives higher conversion rates.',
  },
  {
    icon: Globe,
    title: 'Social Commerce Integration',
    description:
      'Share products directly to Instagram, WhatsApp, and TikTok with auto-generated product links and promotional creatives tailored for each platform.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Recommendations',
    description:
      'Our recommendation engine surfaces your products to shoppers who are most likely to buy, based on browsing behaviour, purchase history, and category affinity.',
  },
];

const analyticsMetrics = [
  {
    icon: BarChart3,
    metric: 'Revenue Analytics',
    description:
      'Track daily, weekly, and monthly revenue with trend visualisations. Break down earnings by product, category, or time period to identify growth opportunities.',
  },
  {
    icon: TrendingUp,
    metric: 'Conversion Funnel',
    description:
      'Monitor your full customer journey from product impressions to cart additions to completed orders. Pinpoint exactly where you lose potential buyers.',
  },
  {
    icon: Users,
    metric: 'Customer Demographics',
    description:
      'Understand who your buyers are with aggregated insights on location (state/city), device type, and shopping preferences — without exposing personal data.',
  },
  {
    icon: PieChart,
    metric: 'Product Performance',
    description:
      'See which products drive the most views, wishlists, and sales. Compare performance across your catalogue to optimise pricing and inventory levels.',
  },
  {
    icon: LineChart,
    metric: 'Traffic Sources',
    description:
      'Discover how shoppers find your store — whether through search, social media, direct links, or Faflora\'s internal recommendations. Double down on what works.',
  },
  {
    icon: ShoppingBag,
    metric: 'Inventory Intelligence',
    description:
      'Get real-time alerts for low stock, predict restocking needs based on sales velocity, and avoid lost sales from out-of-stock items during peak periods.',
  },
];

export default function MarketingSolutionsAnalyticsPage() {
  return (
    <div
      className="font-sans bg-[#fdf8ff] min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Georgia', serif" }}
    >
      {/* ══ HERO ══ */}
      <section className="relative min-h-[82vh] flex items-center overflow-hidden">
        {/* Rich purple background — slightly brighter, closer to brand primary button gradient */}
        <div className="absolute inset-0 bg-[#350834]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#350834] via-[#1f0321] to-[#0d000e]" />
        {/* Ambient glow orbs */}
        <div className="absolute top-[-10%] left-[-8%] w-[55vw] h-[55vw] rounded-full bg-[#8236be] opacity-[0.25] blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#56154e] opacity-[0.30] blur-[110px] pointer-events-none" />
        <div className="absolute top-[10%] right-[5%] w-[30vw] h-[30vw] rounded-full bg-[#ad74e8] opacity-[0.12] blur-[90px] pointer-events-none" />
        <div className="absolute top-[40%] right-[20%] w-[22vw] h-[22vw] rounded-full bg-[#d8acd1] opacity-[0.10] blur-[70px] pointer-events-none" />

        <div className="absolute top-10 right-10 w-56 h-56 rounded-full border border-white/8 pointer-events-none" />
        <div className="absolute top-16 right-16 w-40 h-40 rounded-full border border-white/8 pointer-events-none" />
        <div className="absolute bottom-10 left-6 w-72 h-72 rounded-full border border-white/5 pointer-events-none" />
        {/* Fine diagonal grid */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #ad74e8 0px, #ad74e8 1px, transparent 1px, transparent 48px)',
          }}
        />
        {/* Dot matrix overlay */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ad74e8 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        <div className="absolute top-24 right-[8%] hidden lg:flex items-center gap-2 bg-white/8 backdrop-blur-sm text-white/75 text-xs font-semibold px-4 py-2 rounded-full border border-white/15 select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Data-Driven Growth
        </div>
        <div className="absolute top-40 right-[12%] hidden lg:flex items-center gap-2 bg-white/8 backdrop-blur-sm text-white/75 text-xs font-semibold px-4 py-2 rounded-full border border-white/15 select-none">
          <BarChart3 size={11} /> Real-Time Insights
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full pt-28 pb-20">
          <div className="max-w-4xl">
            <FadeInSection type="fadeDown" delay={0.1}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
                <TrendingUp size={12} /> Faflora · Growth Suite
              </div>
            </FadeInSection>

            <FadeInSection type="fadeUp" delay={0.2}>
              <h1
                className="font-black uppercase leading-[1.1] tracking-tight lg:-skew-x-8 -skew-x-6 text-5xl md:text-7xl lg:text-[5.5rem]"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {/* "Marketing" — bright white with strong glow */}
                <span
                  className="inline-block"
                  style={{
                    color: '#ffffff',
                    textShadow: '0 0 60px rgba(168,79,154,0.4), 0 2px 20px rgba(168,79,154,0.2)',
                    filter: 'drop-shadow(0 0 24px rgba(168,79,154,0.35))',
                  }}
                >
                  <TypingText text="Marketing" delay={300} typingSpeed={60} hideCursorOnComplete />
                </span>
                <br />
                {/* "Solutions" — soft lavender/purple gradient */}
                <span
                  className="inline-block mr-4"
                  style={{
                    background: 'linear-gradient(90deg, #f4e9f2 0%, #d8acd1 45%, #c07db5 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 18px rgba(216,172,209,0.4))',
                  }}
                >
                  <TypingText text="Solutions" delay={900} typingSpeed={60} hideCursorOnComplete />
                </span>
                <span
                  className="inline-block mr-4"
                  style={{ color: 'rgba(255,255,255,0.55)', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }}
                >
                  <TypingText text="&" delay={1400} typingSpeed={60} hideCursorOnComplete />
                </span>
                <br />
                {/* "Analytics" — warm amber-gold, creating maximum contrast against the cool plum background */}
                <span
                  className="inline-block"
                  style={{
                    background: 'linear-gradient(90deg, #ffd54f 0%, #ffab40 35%, #ff7043 65%, #ff5252 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 22px rgba(255,112,67,0.5))',
                  }}
                >
                  <TypingText text="Analytics" delay={1600} typingSpeed={60} />
                </span>
              </h1>
            </FadeInSection>

            <FadeInSection type="fadeUp" delay={0.5}>
              <div className="mt-7 flex items-center gap-3">
                <div className="h-[3px] w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #ad74e8, #ff7043)' }} />
                <div className="h-[3px] w-8 rounded-full bg-white/25" />
                <div className="h-[3px] w-4 rounded-full bg-white/12" />
              </div>
            </FadeInSection>

            <FadeInSection type="fadeUp" delay={0.65}>
              <p className="mt-8 text-white/60 text-base md:text-lg max-w-2xl leading-relaxed">
                Grow your business with <span className="font-bold text-white/90">Faflora&rsquo;s</span> integrated marketing tools and real-time analytics dashboard. From sponsored listings to deep performance insights, everything you need to scale is at your fingertips.
              </p>
            </FadeInSection>

            <FadeInSection type="fadeUp" delay={0.8}>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  { label: 'Real-Time Data', dot: true },
                  { label: 'AI Recommendations' },
                  { label: 'Campaign Manager' },
                  { label: 'Conversion Tracking' },
                ].map(({ label, dot }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 text-xs font-semibold px-4 py-2 rounded-full"
                  >
                    {dot && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                    {label}
                  </div>
                ))}
              </div>
            </FadeInSection>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#fdf8ff" />
          </svg>
        </div>
      </section>

      {/* ══ STATS RIBBON ══ */}
      <FadeInSection type="fade" delay={0.1}>
        <div className="py-6 px-6 md:px-12" style={{ background: 'linear-gradient(135deg, #120010 0%, #1a0016 40%, #2b0129 70%, #120010 100%)' }}>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '3.2×', label: 'Avg. ROI Increase' },
              { value: '48%', label: 'Higher Conversion' },
              { value: '2.8M', label: 'Monthly Impressions' },
              { value: '36', label: 'States Covered' },
            ].map(({ value, label }) => (
              <div key={label}>
                <span className="block text-white font-black text-2xl md:text-3xl tracking-tight">{value}</span>
                <span className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* ══ BODY ══ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-10 lg:px-12 pb-28">

        {/* ── MARKETING SOLUTIONS ── */}
        <div className="pt-16 pb-6">
          <SectionEyebrow
            eyebrow="Grow your reach"
            title="Marketing Solutions"
            icon={Megaphone}
          />

          <FadeInSection type="fadeUp" delay={0.15}>
            <div className="relative rounded-3xl overflow-hidden border border-[#e8b8e4] shadow-md bg-white mb-12">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#9d4ae3] via-[#8236be] to-[#ad74e8]" />
              <div className="px-8 md:px-12 py-8 md:py-10 pl-10 md:pl-14">
                <p className="text-xs font-black uppercase tracking-[4px] text-[#8236be] mb-3">Overview</p>
                <p className="text-gray-700 text-base md:text-[17px] leading-relaxed">
                  Faflora&rsquo;s Marketing Suite empowers vendors of every size to compete effectively in Nigeria&rsquo;s fastest-growing e-commerce ecosystem. Whether you&rsquo;re a first-time seller or an established brand, our tools are designed to drive visibility, engagement, and conversions without requiring a marketing degree.
                </p>
                <p className="mt-4 text-gray-500 text-sm md:text-[15px] leading-relaxed">
                  Set budgets that work for your business, track returns in real time, and let our AI optimise your campaigns automatically. Every Naira you spend is engineered for maximum impact.
                </p>
              </div>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketingFeatures.map((feature, i) => (
              <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} index={i} />
            ))}
          </div>
        </div>

        <Divider />

        {/* ── HOW IT WORKS ── */}
        <div className="mb-6">
          <SectionEyebrow eyebrow="Simple process" title="How It Works" icon={Layers} />

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Set Your Goals',
                desc: 'Choose your objective — more traffic, higher sales, or brand awareness. Our platform recommends the best tools and budget for your goals.',
              },
              {
                step: '02',
                title: 'Launch & Optimise',
                desc: 'Create campaigns in minutes with our guided builder. AI-powered bidding and targeting optimise your spend continuously while your campaign runs.',
              },
              {
                step: '03',
                title: 'Measure & Scale',
                desc: 'Track results in real time through the analytics dashboard. See exactly what\'s working, refine your approach, and scale winning strategies across your catalogue.',
              },
            ].map((item, i) => (
              <FadeInSection key={item.step} type="fadeUp" delay={0.1 + i * 0.12}>
                <div className="relative pl-8 border-l-2 border-[#e8b8e4] hover:border-[#9d4ae3] transition-colors duration-300 h-full">
                  <span
                    className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#9d4ae3] to-[#8236be] text-white text-xs font-black flex items-center justify-center shadow-md"
                  >
                    {item.step}
                  </span>
                  <h3 className="text-lg font-extrabold text-[#1a0018] mb-3 pt-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── ANALYTICS DASHBOARD ── */}
        <div className="mb-6">
          <SectionEyebrow eyebrow="Actionable insights" title="Analytics Dashboard" icon={BarChart3} />

          <FadeInSection type="zoom" delay={0.12}>
            <div className="relative rounded-3xl overflow-hidden border border-[#e8b8e4] bg-white shadow-md mb-12">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdf3fc] to-white" />
              <div className="relative px-8 md:px-12 py-8 md:py-10">
                <p className="text-gray-700 text-base md:text-[17px] leading-relaxed">
                  Your vendor dashboard isn&rsquo;t just numbers on a screen. It&rsquo;s a command centre for your entire business on Faflora. Every metric is designed to answer a specific question: <em className="text-[#9d4ae3] font-semibold">What&rsquo;s selling? Who&rsquo;s buying? Where can I improve?</em>
                </p>
                <p className="mt-4 text-gray-500 text-sm md:text-[15px] leading-relaxed">
                  Filter by daily, weekly, or monthly views. Export reports as CSV. Compare performance across time periods. All data updates in real time — no manual refreshing required.
                </p>
              </div>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-4">
            {analyticsMetrics.map((metric, i) => (
              <AnalyticsMetricRow key={metric.metric} icon={metric.icon} metric={metric.metric} description={metric.description} delay={0.1 + i * 0.06} />
            ))}
          </div>
        </div>

        <Divider />

        {/* ── STATS SHOWCASE ── */}
        <div className="mb-6">
          <SectionEyebrow eyebrow="Platform impact" title="By The Numbers" icon={Award} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { value: '150K+', label: 'Active Vendors' },
              { value: '12M+', label: 'Products Listed' },
              { value: '98.6%', label: 'Uptime SLA' },
              { value: '<2s', label: 'Dashboard Load' },
            ].map((stat, i) => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} index={i} />
            ))}
          </div>
        </div>

        <Divider />

        {/* ── VENDOR GROWTH TOOLS ── */}
        <div className="mb-6">
          <SectionEyebrow eyebrow="Vendor toolkit" title="Growth Accelerators" icon={Zap} />

          <div className="grid md:grid-cols-2 gap-8">
            <FadeInSection type="fadeUp" delay={0.1}>
              <div className="rounded-3xl border border-[#e8b8e4] bg-white p-8 h-full">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9d4ae3] to-[#8236be] flex items-center justify-center text-white mb-6 shadow-md">
                  <TrendingUp size={22} />
                </div>
                <h3
                  className="text-xl font-extrabold text-[#1a0018] mb-4"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Performance Benchmarks
                </h3>
                <ul className="space-y-3">
                  <CheckItem text="Compare your store's performance against category averages and top sellers." />
                  <CheckItem text="Receive personalised improvement suggestions based on your unique product mix and sales history." />
                  <CheckItem text="Track your seller rating, response time, and fulfilment speed against platform standards." />
                </ul>
              </div>
            </FadeInSection>

            <FadeInSection type="fadeUp" delay={0.2}>
              <div className="rounded-3xl border border-[#e8b8e4] bg-white p-8 h-full">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9d4ae3] to-[#8236be] flex items-center justify-center text-white mb-6 shadow-md">
                  <Users size={22} />
                </div>
                <h3
                  className="text-xl font-extrabold text-[#1a0018] mb-4"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Customer Insights
                </h3>
                <ul className="space-y-3">
                  <CheckItem text="See which states and cities drive the most orders for your products." />
                  <CheckItem text="Understand peak shopping hours and days to time your promotions perfectly." />
                  <CheckItem text="Analyse repeat purchase rates and customer lifetime value to prioritise retention." />
                </ul>
              </div>
            </FadeInSection>
          </div>
        </div>

        <Divider />

        {/* ── ADVERTISING PROGRAMS ── */}
        <div className="mb-6">
          <SectionEyebrow eyebrow="Paid growth" title="Advertising Programs" icon={Target} />

          <div className="space-y-5">
            {[
              {
                title: 'Sponsored Search',
                desc: 'Your products appear at the top of relevant search results. Bid on keywords your target customers are searching for. Average CPC starts from ₦15.',
                tag: 'Most Popular',
              },
              {
                title: 'Category Spotlight',
                desc: 'Feature your products prominently on category landing pages. Ideal for seasonal collections, new arrivals, and clearance campaigns.',
                tag: 'High Impact',
              },
              {
                title: 'Homepage Banner',
                desc: 'Maximum visibility with premium placement on Faflora\'s homepage carousel. Perfect for brand launches, Black Friday events, and major promotions.',
                tag: 'Premium',
              },
            ].map((program, i) => (
              <FadeInSection key={program.title} type="fadeUp" delay={0.1 + i * 0.1}>
                <div className="group relative rounded-2xl border border-[#e8b8e4] bg-white p-6 md:p-8 hover:border-[#8236be] hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-[#fdf3fc]/40 to-transparent" />
                  <div className="relative flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-extrabold text-[#1a0018]">{program.title}</h4>
                        <span className="inline-flex items-center gap-1 bg-[#fdf3fc] border border-[#e8b8e4] text-[#9d4ae3] text-[10px] font-black uppercase tracking-[2px] px-3 py-1 rounded-full">
                          {program.tag}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">{program.desc}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-2 text-[#8236be] text-sm font-semibold group-hover:gap-3 transition-all">
                        Learn more <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── CTA BANNER ── */}
        <FadeInSection type="zoom" delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl border border-[#e8b8e4]">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #ad74e8 0%, #8236be 50%, #35082e 100%)' }} />
            <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#8236be] opacity-20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#56154e] opacity-[0.10] blur-[60px] pointer-events-none" />
            <div className="absolute top-[30%] left-[40%] w-48 h-48 rounded-full bg-[#ad74e8] opacity-[0.10] blur-[60px] pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 32px)',
              }}
            />
            <div className="relative px-8 md:px-16 py-12 md:py-16 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-[10px] font-black uppercase tracking-[3px] px-4 py-2 rounded-full mb-5">
                  <Sparkles size={11} /> Start Growing Today
                </div>
                <h3
                  className="text-2xl md:text-4xl lg:text-[42px] font-black text-white leading-tight mb-4"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Ready to scale<br />
                  <span className="text-[#f0c8ec]">your business?</span>
                </h3>
                <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-md">
                  Join thousands of Nigerian vendors already using Faflora&rsquo;s marketing and analytics tools to grow revenue, optimise operations, and build lasting customer relationships.
                </p>
              </div>

              <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
                <Link
                  href="/become-a-vendor"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#981d87] px-8 py-3.5 rounded-full font-extrabold text-sm shadow-lg hover:bg-[#f9eaf8] hover:scale-105 active:scale-95 transition-all"
                >
                  Become a Vendor <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-3.5 rounded-full font-extrabold text-sm hover:bg-white/10 transition-colors"
                >
                  Talk to Our Team
                </Link>
                <p className="text-center text-[11px] text-white/30 mt-1">
                  No minimum spend required. Start with any budget.
                </p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}
