import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Home,
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
  Clock,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import FadeInSection from '@/components/FadeInSection';
import { fafloraSupportData } from '../../../data/supportData';

/* ─── TOPIC ICON MAP ─── */
const topicIcons: Record<string, React.ReactNode> = {
  'account-creation-verification': <User size={18} />,
  'buyer-account-management': <UserCog size={18} />,
  'becoming-a-vendor': <Store size={18} />,
  'browsing-purchasing': <Search size={18} />,
  'orders-tracking': <Package size={18} />,
  'payments-refunds-withdrawals': <CreditCard size={18} />,
  'delivery-shipping': <Truck size={18} />,
  'returns-refunds-disputes': <RotateCw size={18} />,
  'security-fraud-privacy': <ShieldCheck size={18} />,
  'app-technical-issues': <Smartphone size={18} />,
  'vendor-tools-dashboard': <LayoutDashboard size={18} />,
  'policies-legal': <Scale size={18} />,
};

/* ─── PAGE ─── */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ topicSlug: string; articleSlug: string }>;
}) {
  const { topicSlug, articleSlug } = await params;

  let currentArticle = null;
  let currentTopic = null;

  for (const topic of fafloraSupportData) {
    if (topic.slug === topicSlug) {
      const found = topic.articles.find((a) => a.slug === articleSlug);
      if (found) {
        currentArticle = found;
        currentTopic = topic;
        break;
      }
    }
  }

  if (!currentArticle || !currentTopic) notFound();

  const icon = topicIcons[currentTopic.slug] ?? <BookOpen size={18} />;

  /* Adjacent article navigation */
  const articleIndex = currentTopic.articles.findIndex((a) => a.slug === articleSlug);
  const prevArticle = articleIndex > 0 ? currentTopic.articles[articleIndex - 1] : null;
  const nextArticle =
    articleIndex < currentTopic.articles.length - 1
      ? currentTopic.articles[articleIndex + 1]
      : null;

  return (
    <div
      className="min-h-screen bg-[#fdf8ff]"
      style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Georgia', serif" }}
    >

      {/* ── TOP NAV BAND ── */}
      <div className="relative bg-white border-b border-[#f0e0ef] overflow-hidden">

        {/* Geometric accent */}
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="210" cy="46" r="140" fill="#fdf3fc" />
            <circle cx="210" cy="46" r="180" stroke="#e8b8e4" strokeWidth="0.8" />
            <line x1="0" y1="120" x2="256" y2="0" stroke="#e8b8e4" strokeWidth="0.5" />
            <circle cx="248" cy="8" r="3" fill="#8236be" opacity="0.4" />
            <circle cx="238" cy="18" r="1.8" fill="#9d4ae3" opacity="0.3" />
          </svg>
        </div>
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: 'radial-gradient(circle, #9d4ae3 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        <div className="relative max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-8">

          {/* Breadcrumb */}
          <FadeInSection type="fadeDown" delay={0.05}>
            <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 flex-wrap">
              <Link href="/support" className="hover:text-[#9d4ae3] flex items-center gap-1.5 transition-colors">
                <Home size={13} /> Support
              </Link>
              <ChevronRight size={12} className="text-gray-500" />
              <Link
                href={`/support/topics/${currentTopic.slug}`}
                className="hover:text-[#9d4ae3] flex items-center gap-1.5 transition-colors"
              >
                {icon}
                {currentTopic.title}
              </Link>
              <ChevronRight size={12} className="text-gray-500" />
              <span className="text-[#9d4ae3] line-clamp-1 max-w-[200px]">
                {currentArticle.title}
              </span>
            </nav>
          </FadeInSection>

          {/* Back button */}
          <FadeInSection type="fadeUp" delay={0.12}>
            <div className="mt-5">
              <Link
                href={`/support/topics/${currentTopic.slug}`}
                className="inline-flex items-center gap-2 text-sm font-extrabold text-[#9d4ae3] hover:gap-3 transition-all group"
              >
                <span className="w-7 h-7 rounded-full bg-[#fdf3fc] border border-[#e8b8e4] group-hover:border-[#9d4ae3] flex items-center justify-center transition-colors">
                  <ArrowLeft size={13} />
                </span>
                Back to {currentTopic.title}
              </Link>
            </div>
          </FadeInSection>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── ARTICLE BODY ── */}
          <main className="flex-1 min-w-0">

            {/* Article card */}
            <FadeInSection type="fadeUp" delay={0.1}>
              <article className="bg-white rounded-3xl border border-[#e8b8e4] shadow-sm overflow-hidden">

                {/* Article header bar */}
                <div className="relative px-10 md:px-14 pt-12 pb-8 border-b border-[#f5e8f5]">
                  {/* Running number watermark */}
                  <span
                    className="absolute top-4 right-8 text-[7rem] font-black leading-none text-[#f5e0f5]/70 select-none pointer-events-none"
                    style={{ fontFamily: "'Georgia', serif" }}
                    aria-hidden="true"
                  >
                    {String(articleIndex + 1).padStart(2, '0')}
                  </span>

                  {/* Topic pill */}
                  <div className="relative inline-flex items-center gap-2 bg-[#fdf3fc] border border-[#e8b8e4] text-[#9d4ae3] text-[10px] font-black uppercase tracking-[4px] px-4 py-2 rounded-full mb-6">
                    {icon}
                    {currentTopic.title}
                  </div>

                  <h1
                    className="relative text-3xl md:text-4xl lg:text-[2.8rem] font-black text-[#1a0018] leading-[1.05] tracking-tight mb-5"
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    {currentArticle.title}
                  </h1>

                  <div className="flex items-center gap-3">
                    <div className="h-[3px] w-10 rounded-full bg-gradient-to-r from-[#9d4ae3] to-[#8236be]" />
                    <div className="h-[3px] w-6 rounded-full bg-[#e8b8e4]" />
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={14} />
                    Last updated:{' '}
                    <span className="font-semibold text-[#9d4ae3]">
                      {currentArticle.lastUpdated}
                    </span>
                  </div>
                </div>

                {/* Article prose */}
                <div className="px-10 md:px-14 py-10 md:py-12">
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <ReactMarkdown
                      components={{
                        h1: ({ ...props }) => (
                          <h1
                            className="text-3xl font-black text-[#1a0018] mt-10 mb-5 leading-tight"
                            style={{ fontFamily: "'Georgia', serif" }}
                            {...props}
                          />
                        ),
                        h2: ({ ...props }) => (
                          <h2
                            className="text-2xl font-extrabold text-[#9d4ae3] mt-10 mb-4 leading-tight"
                            style={{ fontFamily: "'Georgia', serif" }}
                            {...props}
                          />
                        ),
                        h3: ({ ...props }) => (
                          <h3
                            className="text-xl font-bold text-[#1a0018] mt-8 mb-3"
                            style={{ fontFamily: "'Georgia', serif" }}
                            {...props}
                          />
                        ),
                        p: ({ ...props }) => (
                          <p className="text-[16.5px] leading-[1.85] mb-5 text-gray-600" {...props} />
                        ),
                        ul: ({ ...props }) => (
                          <ul className="mb-6 space-y-2.5 pl-0" {...props} />
                        ),
                        li: ({ ...props }) => (
                          <li className="flex items-start gap-3 text-[16px] leading-relaxed text-gray-600">
                            <span className="flex-shrink-0 mt-[7px] w-4 h-4 rounded-full bg-gradient-to-br from-[#9d4ae3] to-[#8236be] flex items-center justify-center shadow-sm">
                              <svg width="6" height="5" viewBox="0 0 6 5" fill="none">
                                <path d="M1 2.5L2.2 4L5 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            <span {...props} />
                          </li>
                        ),
                        strong: ({ ...props }) => (
                          <strong className="font-bold text-[#9d4ae3]" {...props} />
                        ),
                        blockquote: ({ ...props }) => (
                          <blockquote
                            className="relative pl-5 border-l-4 border-[#8236be] bg-gradient-to-r from-[#fdf3fc] to-transparent py-4 pr-4 rounded-r-xl my-6"
                            {...props}
                          />
                        ),
                        a: ({ ...props }) => (
                          <a
                            className="text-[#9d4ae3] font-semibold underline underline-offset-2 hover:text-[#8236be] transition-colors"
                            {...props}
                          />
                        ),
                        hr: () => (
                          <div className="flex items-center gap-3 my-8">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8b8e4] to-transparent" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#8236be]" />
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8b8e4] to-transparent" />
                          </div>
                        ),
                      }}
                    >
                      {currentArticle.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </article>
            </FadeInSection>

            {/* ── PREV / NEXT NAVIGATION ── */}
            {(prevArticle || nextArticle) && (
              <FadeInSection type="fadeUp" delay={0.2}>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {prevArticle ? (
                    <Link
                      href={`/support/topics/${currentTopic.slug}/${prevArticle.slug}`}
                      className="group flex items-center gap-4 bg-white border border-[#e8b8e4] hover:border-[#8236be] rounded-2xl px-6 py-5 transition-all hover:shadow-lg"
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#fdf3fc] border border-[#e8b8e4] group-hover:border-[#8236be] flex items-center justify-center text-[#9d4ae3] transition-colors">
                        <ArrowLeft size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-0.5">Previous</p>
                        <p className="text-sm font-bold text-[#1a0018] group-hover:text-[#9d4ae3] transition-colors line-clamp-1">
                          {prevArticle.title}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextArticle && (
                    <Link
                      href={`/support/topics/${currentTopic.slug}/${nextArticle.slug}`}
                      className="group flex items-center gap-4 bg-white border border-[#e8b8e4] hover:border-[#8236be] rounded-2xl px-6 py-5 transition-all hover:shadow-lg sm:flex-row-reverse sm:text-right"
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#fdf3fc] border border-[#e8b8e4] group-hover:border-[#8236be] flex items-center justify-center text-[#9d4ae3] transition-colors">
                        <ArrowRight size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-0.5">Next</p>
                        <p
                          className="text-sm font-bold text-[#1a0018] group-hover:text-[#9d4ae3] transition-colors 
                                    line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                          {nextArticle.title}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              </FadeInSection>
            )}
          </main>

          {/* ── SIDEBAR ── */}
          <aside className="lg:w-72 flex-shrink-0">
            <FadeInSection type="slideRight" delay={0.18}>
              <div className="sticky top-8 space-y-5">

                {/* In this topic */}
                <div className="bg-white rounded-3xl border border-[#e8b8e4] overflow-hidden">
                  {/* Sidebar header */}
                  <div className="px-6 py-5 border-b border-[#f5e8f5] bg-gradient-to-r from-[#fdf3fc] to-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#9d4ae3] to-[#8236be] flex items-center justify-center text-white shadow-sm">
                        {icon}
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[3px] text-[#8236be]">In this topic</p>
                        <p className="text-xs font-bold text-[#1a0018] leading-tight">{currentTopic.title}</p>
                      </div>
                    </div>
                  </div>

                  {/* Article list */}
                  <nav className="p-3">
                    {currentTopic.articles.map((article, i) => {
                      const isActive = article.slug === articleSlug;
                      return (
                        <Link
                          key={article.id}
                          href={`/support/topics/${currentTopic.slug}/${article.slug}`}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[13.5px] transition-all group ${isActive
                              ? 'bg-gradient-to-r from-[#fdf3fc] to-white text-[#9d4ae3] font-extrabold border border-[#e8b8e4]'
                              : 'hover:bg-[#fdf8ff] text-gray-600 hover:text-[#9d4ae3]'
                            }`}
                        >
                          {/* Index number */}
                          <span
                            className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${isActive
                                ? 'bg-gradient-to-br from-[#9d4ae3] to-[#8236be] text-white shadow-sm'
                                : 'bg-[#f5e8f5] text-[#8236be] group-hover:bg-[#fdf3fc]'
                              }`}
                          >
                            {i + 1}
                          </span>
                          <span className="leading-snug line-clamp-2">{article.title}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Need more help card */}
                <div className="relative overflow-hidden rounded-3xl border border-[#e8b8e4]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2d0029] via-[#6b0f6b] to-[#9d4ae3]" />
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#8236be] opacity-25 blur-[40px] pointer-events-none" />
                  <div className="relative px-6 py-7 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[3px] text-[#f0c8ec] mb-2">Need more help?</p>
                    <p className="text-white font-extrabold text-base leading-tight mb-4">
                      Can't find the answer?
                    </p>
                    <Link
                      href="/contact-us"
                      className="inline-flex items-center gap-1.5 bg-white text-[#9d4ae3] text-xs font-extrabold px-5 py-2.5 rounded-full hover:bg-[#f9eaf8] hover:scale-105 active:scale-95 transition-all shadow-md"
                    >
                      Contact Support <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>

                {/* Back to topic link */}
                <Link
                  href={`/support/topics/${currentTopic.slug}`}
                  className="flex items-center gap-2.5 text-sm font-extrabold text-[#9d4ae3] hover:gap-3.5 transition-all group px-1"
                >
                  <span className="w-7 h-7 rounded-full bg-white border border-[#e8b8e4] group-hover:border-[#9d4ae3] flex items-center justify-center transition-colors">
                    <ArrowLeft size={13} />
                  </span>
                  All {currentTopic.title} articles
                </Link>
              </div>
            </FadeInSection>
          </aside>
        </div>
      </div>
    </div>
  );
}