import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Home,
  ArrowLeft,
  ArrowRight,
  Clock,
  User,
  UserCog,
  Store,
  Search,
  Package,
  CreditCard,
  Truck,
  RotateCw,
  ShieldCheck,
  Smartphone,
  LayoutDashboard,
  Scale,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import FadeInSection from '@/components/FadeInSection';
import { fafloraSupportData } from '../../data/supportData';

/* ─── TOPIC ICON MAP ─── */
const topicIcons: Record<string, React.ReactNode> = {
  'account-creation-verification': <User size={22} />,
  'buyer-account-management': <UserCog size={22} />,
  'becoming-a-vendor': <Store size={22} />,
  'browsing-purchasing': <Search size={22} />,
  'orders-tracking': <Package size={22} />,
  'payments-refunds-withdrawals': <CreditCard size={22} />,
  'delivery-shipping': <Truck size={22} />,
  'returns-refunds-disputes': <RotateCw size={22} />,
  'security-fraud-privacy': <ShieldCheck size={22} />,
  'app-technical-issues': <Smartphone size={22} />,
  'vendor-tools-dashboard': <LayoutDashboard size={22} />,
  'policies-legal': <Scale size={22} />,
};

/* ─── ARTICLE CARD ─── */
const ArticleCard = ({
  article,
  topicSlug,
  index,
}: {
  article: { id: string; slug: string; title: string; content: string; lastUpdated: string };
  topicSlug: string;
  index: number;
}) => {
  const intro = article.content
    .replace(/[#*`]/g, '')
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, 120) + '…';

  return (
    <FadeInSection type="fadeUp" delay={0.1 + index * 0.09}>
      <Link
        href={`/support/topics/${topicSlug}/${article.slug}`}
        className="group relative flex flex-col bg-white border border-[#e8b8e4] hover:border-[#c740b0] rounded-3xl p-8 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
      >
        {/* Hover bloom */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[#fdf3fc]/60 to-transparent" />

        {/* Running article number */}
        <span
          className="absolute top-6 right-6 text-[3rem] font-black leading-none text-[#f5e0f5] select-none pointer-events-none"
          style={{ fontFamily: "'Georgia', serif" }}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Icon dot */}
        <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#981d87] to-[#c740b0] flex items-center justify-center text-white shadow-md shadow-[#981d8730] mb-5">
          <BookOpen size={16} />
        </div>

        <h3 className="relative text-[17px] font-extrabold text-[#1a0018] group-hover:text-[#981d87] transition-colors leading-snug line-clamp-2 mb-3">
          {article.title}
        </h3>

        <p className="relative text-gray-500 text-[14px] leading-relaxed line-clamp-3 flex-1 mb-6">
          {intro}
        </p>

        <div className="relative flex items-center justify-between pt-4 border-t border-[#f0e5f5]">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock size={12} />
            Updated {article.lastUpdated}
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c740b0] opacity-0 group-hover:opacity-100 transition-all">
            Read <ArrowRight size={13} />
          </div>
        </div>
      </Link>
    </FadeInSection>
  );
};

/* ─── PAGE ─── */
export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const topic = fafloraSupportData.find((t) => t.slug === topicSlug);
  if (!topic) notFound();

  const icon = topicIcons[topic.slug] ?? <BookOpen size={22} />;

  return (
    <div
      className="min-h-screen bg-[#fdf8ff]"
      style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Georgia', serif" }}
    >
      {/* ── HEADER BAND ── */}
      <div className="relative bg-white border-b border-[#f0e0ef] overflow-hidden">

        {/* Geometric accent — top right */}
        <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <svg viewBox="0 0 288 288" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="240" cy="48" r="160" fill="#fdf3fc" />
            <circle cx="240" cy="48" r="200" stroke="#e8b8e4" strokeWidth="1" />
            <circle cx="240" cy="48" r="240" stroke="#f0c8ec" strokeWidth="0.5" />
            <line x1="0" y1="140" x2="288" y2="0" stroke="#e8b8e4" strokeWidth="0.6" />
            <line x1="0" y1="190" x2="288" y2="50" stroke="#f0c8ec" strokeWidth="0.4" />
            <circle cx="270" cy="8" r="3.5" fill="#c740b0" opacity="0.4" />
            <circle cx="260" cy="18" r="2" fill="#981d87" opacity="0.3" />
          </svg>
        </div>

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.022]"
          style={{ backgroundImage: 'radial-gradient(circle, #981d87 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        <div className="relative max-w-6xl mx-auto px-6 md:px-12 lg:px-16 pt-10 pb-14">

          {/* Breadcrumb */}
          <FadeInSection type="fadeDown" delay={0.05}>
            <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-8 flex-wrap">
              <Link href="/support" className="hover:text-[#981d87] flex items-center gap-1.5 transition-colors">
                <Home size={13} /> Support
              </Link>
              <ChevronRight size={12} className="text-gray-500" />
              <span className="text-[#981d87]">{topic.title}</span>
            </nav>
          </FadeInSection>

          <div className="flex items-start gap-6">
            {/* Large topic icon */}
            <FadeInSection type="zoom" delay={0.1}>
              <div className="flex-shrink-0 lg:w-16 lg:h-16 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#981d87] to-[#c740b0] flex items-center justify-center text-white shadow-xl shadow-[#981d8740] mt-1">
                {icon}
              </div>
            </FadeInSection>

            <div className="flex-1">
              <FadeInSection type="fadeUp" delay={0.15}>
                <span className="block text-[10px] font-black uppercase tracking-[4px] text-[#c740b0] mb-2">
                  Support Topic
                </span>
                <h1
                  className="text-4xl md:text-5xl lg:text-[3.6rem] font-black text-[#1a0018] leading-[0.96] tracking-tight"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  {topic.title}
                </h1>
              </FadeInSection>

              <FadeInSection type="fadeUp" delay={0.28}>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-[3px] w-10 rounded-full bg-gradient-to-r from-[#981d87] to-[#c740b0]" />
                  <div className="h-[3px] w-6 rounded-full bg-[#e8b8e4]" />
                  <div className="h-[3px] w-3 rounded-full bg-[#f0c8ec]" />
                </div>
                <p className="mt-4 text-gray-500 text-base md:text-lg max-w-2xl leading-relaxed">
                  {topic.description}
                </p>
              </FadeInSection>

              <FadeInSection type="fadeUp" delay={0.38}>
                <div className="mt-5 inline-flex items-center gap-2 bg-[#fdf3fc] border border-[#e8b8e4] text-[#981d87] text-xs font-bold px-4 py-2 rounded-full">
                  <BookOpen size={12} />
                  {topic.articles.length} article{topic.articles.length !== 1 ? 's' : ''} in this topic
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>
      </div>

      {/* ── ARTICLES GRID ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-14">

        <FadeInSection type="slideLeft" delay={0.05}>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-[#e8b8e4] to-transparent" />
            <span className="text-[10px] font-black uppercase tracking-[4px] text-[#c740b0]">
              All Articles
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e8b8e4]" />
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-6">
          {topic.articles.map((article, i) => (
            <ArticleCard
              key={article.id}
              article={article}
              topicSlug={topic.slug}
              index={i}
            />
          ))}
        </div>

        {/* Back button */}
        <FadeInSection type="fadeUp" delay={0.2}>
          <div className="mt-16 flex justify-center">
            <Link
              href="/support"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white border border-[#e8b8e4] hover:border-[#981d87] rounded-full text-sm font-extrabold text-[#981d87] hover:bg-[#fdf3fc] transition-all shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={16} />
              Back to All Topics
            </Link>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}