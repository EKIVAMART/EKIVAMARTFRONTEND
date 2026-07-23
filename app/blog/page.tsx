'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FadeInSection from '@/components/FadeInSection';
import {
  ArrowRight,
  Clock,
  BookOpen,
  Tag,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Users,
  Zap,
  Globe,
  ChevronRight,
} from 'lucide-react';
import TypingText from '@/components/TypingText';

import { BlogPost, posts, categories } from './postsData';

const categoryIcons: Record<string, React.ReactNode> = {
  All: <BookOpen size={14} />,
  Sellers: <ShoppingBag size={14} />,
  Buyers: <Users size={14} />,
  'Platform Updates': <Zap size={14} />,
  'Commerce Insights': <Globe size={14} />,
};

/* ─── Sub-components ─── */

const FeaturedCard = ({ post }: { post: BlogPost }) => (
  <FadeInSection type="fadeUp" delay={0.1}>
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-3xl h-[480px] md:h-[560px]">
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient}`} />
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Orb accents */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-25 blur-[80px] pointer-events-none"
          style={{ background: post.accentColor }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-10">
          <div className="flex items-start justify-between">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/25 text-white text-[10px] font-black uppercase tracking-[3px] px-4 py-2 rounded-full">
              <Sparkles size={10} />
              Featured
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Tag size={11} />
              {post.tag}
            </div>
          </div>

          <div>
            <span className="inline-block text-[10px] font-black uppercase tracking-[4px] text-white/60 mb-3">
              {post.category}
            </span>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 group-hover:text-white/90 transition-colors"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {post.title}
            </h2>
            <p className="text-white/65 text-sm md:text-base leading-relaxed max-w-xl mb-6">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/50 text-xs font-medium">
                <Clock size={12} />
                {post.readTime}
              </div>
              <div className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-white/50 text-xs font-medium">{post.date}</span>
              <div
                className="ml-auto flex items-center gap-2 text-white font-bold text-sm group-hover:gap-3 transition-all"
              >
                Read Article <ArrowRight size={15} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  </FadeInSection>
);

const PostCard = ({ post, index }: { post: BlogPost; index: number }) => (
  <FadeInSection type="fadeUp" delay={0.1 + index * 0.07}>
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <div className="flex flex-col h-full bg-white border border-[#e8e4f0] rounded-3xl overflow-hidden hover:border-[#ad74e8] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        {/* Color block top */}
        <div className={`relative h-44 bg-gradient-to-br ${post.gradient} overflow-hidden flex-shrink-0`}>
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div
            className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-30 blur-[40px] pointer-events-none"
            style={{ background: post.accentColor }}
          />
          <div className="absolute top-5 left-5">
            <span className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[3px] px-3 py-1.5 rounded-full">
              <Tag size={9} />
              {post.tag}
            </span>
          </div>
          <div className="absolute bottom-5 right-5 flex items-center gap-1.5 text-white/70 text-xs font-medium">
            <Clock size={11} />
            {post.readTime}
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col flex-1 p-6">
          <span className="text-[10px] font-black uppercase tracking-[4px] text-[#ad74e8] mb-2">{post.category}</span>
          <h3
            className="text-lg font-extrabold text-[#1a0018] group-hover:text-[#ad74e8] transition-colors leading-snug mb-3 flex-1"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {post.title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium">{post.date}</span>
            <span className="inline-flex items-center gap-1 text-[#8236be] text-sm font-bold group-hover:gap-2 transition-all">
              Read <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  </FadeInSection>
);

/* ─── Page ─── */
export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const featured = posts.find((p) => p.featured)!;
  const rest = posts.filter((p) => !p.featured);
  const filtered =
    activeCategory === 'All' ? rest : rest.filter((p) => p.category === activeCategory);

  return (
    <div
      className="font-sans bg-[#fdf8ff] min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Georgia', serif" }}
    >
      {/* ══ HERO ══ */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        {/* Deep plum background with a hint of dark purple/indigo at the bottom */}
        <div className="absolute inset-0 bg-[#1a0016]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0016] via-[#2d002a] to-[#140026]/90" />
        {/* Ambient glow orbs */}
        <div className="absolute top-[-10%] left-[-8%] w-[50vw] h-[50vw] rounded-full bg-[#8b0d7a] opacity-[0.22] blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#5c0060] opacity-[0.28] blur-[110px] pointer-events-none" />
        <div className="absolute top-[10%] right-[5%] w-[28vw] h-[28vw] rounded-full bg-[#ad74e8] opacity-[0.10] blur-[90px] pointer-events-none" />
        <div className="absolute top-[45%] right-[25%] w-[20vw] h-[20vw] rounded-full bg-[#ff69e0] opacity-[0.08] blur-[70px] pointer-events-none" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ad74e8 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #ad74e8 0px, #ad74e8 1px, transparent 1px, transparent 48px)',
          }}
        />
        {/* Floating badges */}
        <div className="absolute top-24 right-[8%] hidden lg:flex items-center gap-2 bg-white/8 backdrop-blur-sm text-white/70 text-xs font-semibold px-4 py-2 rounded-full border border-white/15 select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> New Articles Weekly
        </div>
        <div className="absolute top-40 right-[13%] hidden lg:flex items-center gap-2 bg-white/8 backdrop-blur-sm text-white/70 text-xs font-semibold px-4 py-2 rounded-full border border-white/15 select-none">
          <TrendingUp size={11} /> Commerce Insights
        </div>

        <div className="relative max-w-6xl mx-auto px-6 md:px-12 lg:px-16 w-full pt-28 pb-24">
          <div className="max-w-3xl">
            <FadeInSection type="fadeDown" delay={0.1}>
              <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/15 text-white/75 text-[10px] font-black uppercase tracking-[4px] px-5 py-2.5 rounded-full mb-8">
                <BookOpen size={11} />
                Faflora · The Journal
              </div>
            </FadeInSection>

            <FadeInSection type="fadeUp" delay={0.2}>
              <h1
                className="font-black leading-[1.1] tracking-tight lg:-skew-x-6 -skew-x-4 text-5xl md:text-6xl lg:text-[5rem]"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                <span
                  style={{
                    color: '#ffffff',
                    textShadow: '0 0 60px rgba(168,79,154,0.4), 0 2px 16px rgba(168,79,154,0.2)',
                  }}
                >
                  <TypingText text="Stories," delay={100} typingSpeed={70} colorClass="" />
                </span>
                <br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #f0c8ec 0%, #ff69e0 45%, #e879f9 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 16px rgba(232,121,249,0.55))',
                  }}
                >
                  <TypingText text="Tips" delay={700} typingSpeed={70} colorClass="" />
                </span>
                <span
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {' '}
                  <TypingText text="&amp;" delay={1000} typingSpeed={70} colorClass="" />{' '}
                </span>
                <span
                  style={{
                    background: 'linear-gradient(90deg, #ffd54f 0%, #ffab40 40%, #ff7043 75%, #ff5252 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 20px rgba(255,112,67,0.5))',
                  }}
                >
                  <TypingText text="Insights" delay={1250} typingSpeed={70} colorClass="" />
                </span>
              </h1>
            </FadeInSection>

            <FadeInSection type="fadeUp" delay={0.42}>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className="h-[3px] w-14 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #e040fb, #ff7043)' }}
                />
                <div className="h-[3px] w-8 rounded-full bg-white/20" />
                <div className="h-[3px] w-4 rounded-full bg-white/10" />
              </div>
              <p className="mt-5 text-white/55 text-base md:text-lg max-w-2xl leading-relaxed">
                Expert advice, platform updates, and commerce insights to help every buyer and seller thrive on Faflora.
              </p>
            </FadeInSection>

            <FadeInSection type="fadeUp" delay={0.58}>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  { label: 'Seller Guides', dot: true },
                  { label: 'Buyer Tips' },
                  { label: 'Platform News' },
                  { label: 'Commerce Data' },
                ].map(({ label, dot }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white/65 text-xs font-semibold px-4 py-2 rounded-full"
                  >
                    {dot && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                    {label}
                  </div>
                ))}
              </div>
            </FadeInSection>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="#fdf8ff" />
          </svg>
        </div>
      </section>

      {/* ══ BODY ══ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-10 lg:px-12 md:pb-28 pb-12 pt-10">

        {/* ── FEATURED POST ── */}
        <div className="mb-12">
          {(activeCategory === 'All' || featured.category === activeCategory) && (
            <FeaturedCard post={featured} />
          )}
        </div>

        {/* ── CATEGORY FILTERS ── */}
        <FadeInSection type="fadeUp" delay={0.1}>
          <div className="flex flex-wrap gap-2.5 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white shadow-lg shadow-purple-100'
                    : 'bg-white border border-[#e8e4f0] text-gray-600 hover:border-[#ad74e8] hover:text-[#ad74e8]'
                }`}
              >
                {categoryIcons[cat]}
                {cat}
              </button>
            ))}
          </div>
        </FadeInSection>

        {/* ── POSTS GRID ── */}
        {filtered.length === 0 && activeCategory !== 'All' ? (
          <FadeInSection type="fadeUp" delay={0.1}>
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-[#ad74e8]" />
              </div>
              <h3
                className="text-xl font-extrabold text-[#1a0018] mb-2"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                No articles in this category yet
              </h3>
              <p className="text-gray-500 text-sm">More content is coming soon. Check back shortly.</p>
            </div>
          </FadeInSection>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        )}

        {/* ─── DIVIDER ─── */}
        <div className="flex items-center gap-3 my-16">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8b8e4] to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#8236be]" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8b8e4] to-transparent" />
        </div>

        {/* ─── SUPPORT CTA ─── */}
        <FadeInSection type="zoom" delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl border border-[#e8b8e4]">
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #cc00e4ff 0%, #400c4bff 40%, #541661ff 70%, #3b0080 100%)' }}
            />
            <div className="absolute -top-20 -right-12 w-72 h-72 rounded-full bg-[#e040fb] opacity-[0.14] blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-[#00e5ff] opacity-[0.06] blur-[60px] pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 32px)',
              }}
            />
            <div className="relative flex flex-col md:flex-row items-center gap-8 px-8 md:px-14 py-10 md:py-12">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                <BookOpen size={24} className="text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[4px] text-[#f0c8ec] mb-1">
                  Need step-by-step help?
                </p>
                <h4 className="text-white font-extrabold text-xl md:text-2xl leading-tight">
                  Browse our Support Center
                </h4>
                <p className="mt-1.5 text-white/55 text-sm leading-relaxed max-w-md">
                  Over 100 detailed help articles across 12 topic areas — from account setup to vendor payouts.
                </p>
              </div>
              <Link
                href="/support"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-[#981d87] font-extrabold text-sm px-7 py-3.5 rounded-full hover:bg-[#f9eaf8] hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Visit Support Center <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </FadeInSection>

        {/* ─── NEWSLETTER ─── */}
        <FadeInSection type="fadeUp" delay={0.1}>
          <div className="mt-12 rounded-3xl border border-[#e8b8e4] bg-white p-8 md:p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9d4ae3] to-[#7c3aed] flex items-center justify-center text-white mx-auto mb-5 shadow-md">
              <Sparkles size={22} />
            </div>
            <h3
              className="text-2xl md:text-3xl font-extrabold text-[#1a0018] mb-3"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Never miss a story
            </h3>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-8">
              Get the best articles, seller guides, and platform updates delivered to your inbox every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-5 py-3.5 rounded-xl border border-[#e8b8e4] text-sm font-medium outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 transition"
              />
              <button className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#9d4ae3] to-[#7c3aed] hover:from-[#8236be] hover:to-[#6d31d4] text-white font-bold text-sm transition-all shadow-lg shadow-fuchsia-100 whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-400">No spam. Unsubscribe anytime.</p>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}