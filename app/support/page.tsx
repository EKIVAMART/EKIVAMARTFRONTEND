import Link from 'next/link';
import {
  Clock,
  ArrowRight,
  Store,
  HelpCircle,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import FadeInSection from '@/components/FadeInSection';
import TypingText from '@/components/TypingText';
import { fafloriesSupportData } from './data/supportData';
import PopularCarousel from '@/components/support/PopularCarousel';
import SearchBar from '@/components/support/SearchBar';

interface Topic {
  id: string;
  slug: string;
  title: string;
  description: string;
  articleCount: number;
}

/* ─── STAGGERED CARD WRAPPER ─── */
const StaggerCard = ({
  children,
  index,
  baseDelay = 0.1,
  step = 0.11,
}: {
  children: React.ReactNode;
  index: number;
  baseDelay?: number;
  step?: number;
}) => (
  <FadeInSection type="fadeUp" delay={baseDelay + index * step}>
    {children}
  </FadeInSection>
);

/* ─── TOPIC CARD ─── */
const TopicCard = ({ topic, index }: { topic: Topic; index: number }) => (
  <StaggerCard index={index}>
    <Link
      href={`/support/topics/${topic.slug}`}
      className="group relative overflow-hidden bg-white border border-[#e8b8e4] hover:border-[#c740b0] rounded-3xl flex flex-col h-[450px] md:h-[490px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-[240px] md:h-[270px] overflow-hidden flex-shrink-0">
        <img
          src={`/images/topics/${topic.slug}.png`}
          alt={topic.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0018]/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-5 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full">
          <Sparkles size={11} />
          {topic.articleCount} articles
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col flex-1 px-7 py-6">
        {/* Fixed-height title area — 2 lines reserved — keeps all cards uniform */}
        <div className="h-[3.6rem] flex items-center mb-2">
          <h3 className="text-xl font-extrabold text-[#1a0018] group-hover:text-[#981d87] transition-colors leading-tight line-clamp-2">
            {topic.title}
          </h3>
        </div>
        {/* Two-line description — fixed height keeps Explore link uniformly anchored */}
        <div className="h-[2.8rem] mb-1">
          <p className="text-gray-500 text-[14px] leading-relaxed line-clamp-2">
            {topic.description}
          </p>
        </div>
        <div className="mt-5 inline-flex items-center gap-2 text-[#c740b0] text-sm font-semibold group-hover:gap-3 transition-all">
          Explore <ArrowRight size={15} />
        </div>
      </div>

      {/* Hover bloom */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[#fdf3fc]/30 to-transparent" />
    </Link>
  </StaggerCard>
);

/* ─── CONTACT BANNER ─── */
const ContactBanner = () => (
  <FadeInSection type="zoom" delay={0.15}>
    <div className="relative overflow-hidden rounded-3xl border border-[#e8b8e4]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2d0029] via-[#6b0f6b] to-[#981d87]" />
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#c740b0] opacity-20 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#ff69e0] opacity-10 blur-[60px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 32px)',
        }}
      />
      <div className="relative flex flex-col md:flex-row items-center gap-8 px-8 md:px-12 py-10">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center">
          <MessageCircle size={26} className="text-white" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-[4px] text-[#f0c8ec] mb-1">
            Still need help?
          </p>
          <h4 className="text-white font-extrabold text-xl md:text-2xl leading-tight">
            Our support team is here for you
          </h4>
          <p className="mt-1 text-white/60 text-sm leading-relaxed max-w-md">
            Can&rsquo;t find what you&rsquo;re looking for? Reach out directly and we&rsquo;ll get back to you as fast as possible.
          </p>
        </div>
        <Link
          href="/contact-us"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-[#981d87] font-extrabold text-sm px-7 py-3.5 rounded-full hover:bg-[#f9eaf8] hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          Contact Us <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  </FadeInSection>
);

/* ─── SECTION HEADING ─── */
const SectionHeading = ({
  eyebrow,
  title,
  icon,
  delay = 0.1,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  delay?: number;
}) => (
  <FadeInSection type="slideLeft" delay={delay}>
    <div className="flex items-center gap-3 mb-10">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#981d87] to-[#c740b0] flex items-center justify-center text-white shadow-md">
        {icon}
      </div>
      <div>
        <span className="block text-[10px] font-black uppercase tracking-[4px] text-[#c740b0]">
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

/* ─── DIVIDER ─── */
const Divider = () => (
  <FadeInSection type="fade" delay={0.1}>
    <div className="flex items-center gap-3 my-16">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8b8e4] to-transparent" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#c740b0]" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8b8e4] to-transparent" />
    </div>
  </FadeInSection>
);

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function SupportHome() {
  return (
    <div
      className="font-sans bg-[#fdf8ff] min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Georgia', serif" }}
    >

      {/* ══ HERO — Light editorial with geometric art ══ */}
      <section className="relative bg-white z-10">

        {/* Geometric SVG art — top right — clipped individually */}
        <div
          className="absolute top-0 right-0 w-[520px] h-[520px] pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <svg viewBox="0 0 520 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Large blush fill circle */}
            <circle cx="400" cy="80" r="230" fill="#fdf3fc" />
            {/* Concentric rings */}
            <circle cx="400" cy="80" r="270" stroke="#e8b8e4" strokeWidth="1" />
            <circle cx="400" cy="80" r="310" stroke="#f0c8ec" strokeWidth="0.5" />
            <circle cx="400" cy="80" r="350" stroke="#e8b8e4" strokeWidth="0.3" />
            {/* Small accent circle bottom-left */}
            <circle cx="120" cy="380" r="52" fill="#fdf3fc" />
            <circle cx="120" cy="380" r="72" stroke="#e8b8e4" strokeWidth="0.8" />
            {/* Diagonal ruled lines */}
            <line x1="0" y1="220" x2="520" y2="0" stroke="#e8b8e4" strokeWidth="0.6" />
            <line x1="0" y1="280" x2="520" y2="60" stroke="#f0c8ec" strokeWidth="0.4" />
            <line x1="0" y1="340" x2="520" y2="120" stroke="#e8b8e4" strokeWidth="0.3" />
            {/* Dot cluster top-right corner */}
            <circle cx="498" cy="12" r="4" fill="#c740b0" opacity="0.45" />
            <circle cx="486" cy="24" r="2.5" fill="#981d87" opacity="0.3" />
            <circle cx="506" cy="26" r="2" fill="#c740b0" opacity="0.25" />
            <circle cx="476" cy="14" r="2" fill="#981d87" opacity="0.2" />
            {/* Crosshair accent */}
            <line x1="230" y1="400" x2="274" y2="400" stroke="#c740b0" strokeWidth="0.8" opacity="0.45" />
            <line x1="252" y1="378" x2="252" y2="422" stroke="#c740b0" strokeWidth="0.8" opacity="0.45" />
            <circle cx="252" cy="400" r="3" fill="#c740b0" opacity="0.35" />
            {/* Small square outline accent */}
            <rect x="340" y="340" width="28" height="28" rx="4" stroke="#e8b8e4" strokeWidth="1" fill="none" />
            <rect x="346" y="346" width="16" height="16" rx="2" stroke="#c740b0" strokeWidth="0.7" fill="none" opacity="0.5" />
          </svg>
        </div>

        {/* Geometric SVG art — bottom left */}
        <div
          className="absolute bottom-0 left-0 w-[240px] h-[240px] pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="-30" cy="270" r="210" stroke="#e8b8e4" strokeWidth="1" />
            <circle cx="-30" cy="270" r="160" stroke="#f0c8ec" strokeWidth="0.6" />
            <circle cx="70" cy="200" r="22" fill="#fdf3fc" />
            <line x1="0" y1="160" x2="180" y2="240" stroke="#e8b8e4" strokeWidth="0.6" />
          </svg>
        </div>

        {/* Subtle dot-grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.022]"
          style={{
            backgroundImage: 'radial-gradient(circle, #981d87 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Hero content */}
        <div className="relative max-w-6xl mx-auto px-6 md:px-12 lg:px-16 pt-28 pb-36">
          <div className="max-w-2xl">

            {/* Eyebrow badge */}
            <FadeInSection type="fadeDown" delay={0.1}>
              <div className="inline-flex items-center gap-2 bg-[#fdf3fc] border border-[#e8b8e4] text-[#981d87] text-[10px] font-black uppercase tracking-[4px] px-5 py-2.5 rounded-full mb-8">
                <HelpCircle size={11} />
                Faflories · Support Center
              </div>
            </FadeInSection>

            {/* Headline */}
            <FadeInSection type="fadeUp" delay={0.18}>
              <h1
                className="text-5xl md:text-6xl lg:text-[5.5rem] lg:-skew-x-8 -skew-x-6 font-black text-[#1a0018] leading-[0.92] tracking-tight"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                <TypingText
                  text="How can"
                  delay={350}
                  typingSpeed={60}
                  colorClass="text-[#c740b0]"
                />
                <br />
                <span className="text-[#981d87]">
                  <TypingText
                    text="we help"
                    delay={950}
                    typingSpeed={60}
                    colorClass="text-[#c740b0]"
                  />
                </span>
                <span className="text-[#c740b0]">
                  <TypingText
                    text=" you?"
                    delay={1430}
                    typingSpeed={60}
                    colorClass="text-[#981d87]"
                  />
                </span>
              </h1>
            </FadeInSection>

            {/* Rule + subtitle */}
            <FadeInSection type="fadeUp" delay={0.42}>
              <div className="mt-7 flex items-center gap-3">
                <div className="h-[3px] w-14 rounded-full bg-gradient-to-r from-[#981d87] to-[#c740b0]" />
                <div className="h-[3px] w-8 rounded-full bg-[#e8b8e4]" />
                <div className="h-[3px] w-4 rounded-full bg-[#f0c8ec]" />
              </div>
              <p className="mt-5 text-gray-500 text-base md:text-lg max-w-xl leading-relaxed">
                Find answers about buying, selling, orders, deliveries, refunds, and everything in between.
              </p>
            </FadeInSection>

            {/* Search */}
            <FadeInSection type="fadeUp" delay={0.58}>
              <div className="mt-9">
                <SearchBar />
              </div>
            </FadeInSection>

            {/* Quick stat pills */}
            <FadeInSection type="fadeUp" delay={0.72}>
              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  { label: 'NDPR Compliant', dot: true },
                  { label: '24 hr response' },
                  { label: '12 topic areas' },
                  { label: '100+ articles' },
                ].map(({ label, dot }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 bg-[#fdf3fc] border border-[#e8b8e4] text-[#981d87] text-xs font-semibold px-4 py-2 rounded-full"
                  >
                    {dot && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    {label}
                  </div>
                ))}
              </div>
            </FadeInSection>
          </div>
        </div>

        {/* Wave into body — taller for a smoother visual bridge */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#fdf8ff" />
            <path d="M0,55 C480,80 960,30 1440,55 L1440,80 L0,80 Z" fill="#fdf8ff" opacity="0.5" />
          </svg>
        </div>
      </section>

      {/* ══ BODY ══ */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-12 pb-28">

        {/* Popular Articles */}
        <div className="pt-10 pb-6">
          <SectionHeading
            eyebrow="Quick reads"
            title="Popular Articles"
            icon={<Clock size={17} />}
          />
          <PopularCarousel />
        </div>

        <Divider />

        {/* Topics Grid */}
        <div className="mb-20">
          <SectionHeading
            eyebrow="Browse all"
            title="Support Topics"
            icon={<Store size={17} />}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {(fafloriesSupportData as Topic[]).map((topic, i) => (
              <TopicCard key={topic.id} topic={topic} index={i} />
            ))}
          </div>
        </div>

        {/* Contact banner */}
        <ContactBanner />
      </div>
    </div>
  );
}