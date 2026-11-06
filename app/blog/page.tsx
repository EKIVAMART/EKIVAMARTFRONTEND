'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FadeInSection from '@/components/FadeInSection';
import {
  ArrowRight,
  Clock,
  BookOpen,
  Tag,
  Sparkles,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Loader2,
  FileText,
  Search,
  X,
} from 'lucide-react';
import TypingText from '@/components/TypingText';
import { blogApi, decodeHtmlEntities, PublicBlogPostSummary } from '@/lib/api-blog';

export interface MappedBlogPost {
  id: string;
  slug: string;
  category: string;
  tag: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  gradient: string;
  accentColor: string;
  featured: boolean;
  featuredImage?: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

const GRADIENTS = [
  'from-[#8b0d7a] via-[#5c0060] to-[#1a0016]',
  'from-[#ff7043] via-[#e65100] to-[#1a0016]',
  'from-[#00b8d9] via-[#005f73] to-[#1a0016]',
  'from-[#43a047] via-[#1b5e20] to-[#1a0016]',
  'from-[#228b22] via-[#6a0dad] to-[#1a0016]',
];

/* ─── Sub-components ─── */

const FeaturedCard = ({ post }: { post: MappedBlogPost }) => (
  <FadeInSection type="fadeUp" delay={0.1}>
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-3xl h-[480px] md:h-[560px]">
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient}`} />
        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
          />
        )}
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
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-10 z-10">
          <div className="flex items-start justify-between">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/25 text-white text-[10px] font-black uppercase tracking-[3px] px-4 py-2 rounded-full">
              <Sparkles size={10} />
              Featured Article
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
            <p className="text-white/75 text-sm md:text-base leading-relaxed max-w-xl mb-6 line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
                <Clock size={12} />
                {post.readTime}
              </div>
              <div className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-white/60 text-xs font-medium">{post.date}</span>
              <div className="ml-auto flex items-center gap-2 text-white font-bold text-sm group-hover:gap-3 transition-all">
                Read Article <ArrowRight size={15} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  </FadeInSection>
);

const PostCard = ({ post, index }: { post: MappedBlogPost; index: number }) => (
  <FadeInSection type="fadeUp" delay={0.05 + (index % 3) * 0.05}>
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <div className="flex flex-col h-full bg-white border border-[#e8e4f0] rounded-3xl overflow-hidden hover:border-[#67a652] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        {/* Top visual block */}
        <div className={`relative h-48 bg-gradient-to-br ${post.gradient} overflow-hidden flex-shrink-0`}>
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <>
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
            </>
          )}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[2px] px-3 py-1.5 rounded-full">
              <Tag size={9} />
              {post.tag}
            </span>
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
            <Clock size={11} />
            {post.readTime}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6">
          <span className="text-[10px] font-black uppercase tracking-[3px] text-[#67a652] mb-2">
            {post.category}
          </span>
          <h3
            className="text-lg font-extrabold text-[#1a0018] group-hover:text-[#67a652] transition-colors leading-snug mb-3 flex-1 line-clamp-2"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {post.title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-5">{post.excerpt}</p>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <span className="text-xs text-gray-400 font-medium">{post.date}</span>
            <span className="inline-flex items-center gap-1 text-[#1c711c] text-sm font-bold group-hover:gap-2 transition-all">
              Read <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  </FadeInSection>
);

/* ─── Main Page ─── */
export default function BlogPage() {
  const [posts, setPosts] = useState<MappedBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await blogApi.getPublicPosts({ page, limit: 10, search: debouncedSearch });
        if (res.posts) {
          const mapped: MappedBlogPost[] = res.posts.map((item: PublicBlogPostSummary, idx: number) => ({
            id: item.id,
            slug: item.slug,
            category: (item as any).category?.name || 'EkivaMart Journal',
            tag: (item as any).tags?.[0] || 'Article',
            title: decodeHtmlEntities(item.title),
            excerpt: decodeHtmlEntities(item.excerpt || 'Read article for full details...'),
            readTime: `${item.readingTime || 3} min read`,
            date: item.publishedAt
              ? new Date(item.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent',
            gradient: GRADIENTS[idx % GRADIENTS.length],
            accentColor: '#228b22',
            featured: page === 1 && idx === 0 && !debouncedSearch,
            featuredImage: item.featuredImage?.url,
            author: {
              name: item.author?.name || 'EkivaMart Editorial',
              role: 'EkivaMart Staff',
              avatar: (item.author?.name || 'FE').substring(0, 2).toUpperCase(),
            },
          }));

          setPosts(mapped);
          setPagination({
            page: Number(res.pagination?.page) || page,
            limit: Number(res.pagination?.limit) || 10,
            total: Number(res.pagination?.total) || mapped.length,
            pages: Number(res.pagination?.totalPages || res.pagination?.pages) || 1,
          });
        } else {
          setPosts([]);
        }
      } catch (err) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [page, debouncedSearch]);

  const featured = page === 1 ? (posts.find((p) => p.featured) || posts[0]) : null;
  const remainingPosts = page === 1 && featured ? posts.filter((p) => p.id !== featured.id) : posts;

  return (
    <div
      className="font-sans bg-[#fdf8ff] min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Georgia', serif" }}
    >
      {/* ══ HERO ══ */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[#1a0016]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0016] via-[#2d002a] to-[#140026]/90" />
        {/* Glow Orbs */}
        <div className="absolute top-[-10%] left-[-8%] w-[50vw] h-[50vw] rounded-full bg-[#8b0d7a] opacity-[0.22] blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#5c0060] opacity-[0.28] blur-[110px] pointer-events-none" />
        <div className="absolute top-[10%] right-[5%] w-[28vw] h-[28vw] rounded-full bg-[#67a652] opacity-[0.10] blur-[90px] pointer-events-none" />
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #67a652 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 md:px-12 lg:px-16 w-full pt-28 pb-24">
          <div className="max-w-3xl">
            <FadeInSection type="fadeDown" delay={0.1}>
              <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/15 text-white/75 text-[10px] font-black uppercase tracking-[4px] px-5 py-2.5 rounded-full mb-8">
                <BookOpen size={11} />
                EkivaMart · The Journal
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
                  <TypingText text="Stories," delay={100} typingSpeed={70} colorClass="" hideCursorOnComplete />
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
                  <TypingText text="Tips" delay={700} typingSpeed={70} colorClass="" hideCursorOnComplete />
                </span>
                <span
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {' '}
                  <TypingText text="&amp;" delay={1000} typingSpeed={70} colorClass="" hideCursorOnComplete />{' '}
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
              <p className="mt-5 text-white/60 text-base md:text-lg max-w-2xl leading-relaxed">
                Expert advice, platform updates, and commerce insights to help every buyer and seller thrive on EkivaMart.
              </p>
            </FadeInSection>

            {/* Hero Search Bar */}
            <FadeInSection type="fadeUp" delay={0.5}>
              <div className="mt-8 max-w-xl relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  placeholder="Search articles by title, category, or keyword..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-11 pr-10 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#67a652] transition shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition cursor-pointer"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </FadeInSection>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="#fdf8ff" />
          </svg>
        </div>
      </section>

      {/* ══ BODY ══ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-10 lg:px-12 pb-24 pt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-[#67a652]" />
            <p className="text-sm font-medium text-gray-500">Loading articles from EkivaMart Journal...</p>
          </div>
        ) : posts.length === 0 ? (
          /* EMPTY STATE */
          <FadeInSection type="fadeUp" delay={0.1}>
            <div className="bg-white border border-[#e8b8e4] rounded-3xl p-12 md:p-16 text-center max-w-2xl mx-auto shadow-sm my-8">
              <div className="w-16 h-16 rounded-2xl bg-[#fdf3fc] border border-[#e8b8e4] text-[#228b22] flex items-center justify-center mx-auto mb-6">
                <FileText size={32} />
              </div>
              <h2
                className="text-2xl md:text-3xl font-extrabold text-[#1a0018] mb-3"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                No Blog Posts Yet
              </h2>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-8">
                Our editorial team is currently crafting stories, seller guides, and platform updates. Check back soon!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#228b22] to-[#1c711c] text-white font-extrabold text-sm px-7 py-3.5 rounded-full hover:shadow-lg transition-all"
              >
                Return to Home <ArrowRight size={15} />
              </Link>
            </div>
          </FadeInSection>
        ) : (
          <>
            {/* FEATURED POST (on page 1) */}
            {page === 1 && featured && (
              <div className="md:mb-12 mb-6">
                <FeaturedCard post={featured} />
              </div>
            )}

            {/* ARTICLES GRID */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 md:mb-14 mb-8">
              {(page === 1 ? remainingPosts : posts).map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>

            {/* PAGINATION BAR */}
            {pagination.pages > 1 && (
              <FadeInSection type="fadeUp" delay={0.1}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#e8e4f0] rounded-2xl p-5 mb-16 shadow-xs">
                  <span className="text-sm font-semibold text-gray-500">
                    Showing page <span className="text-[#1a0018] font-bold">{pagination.page}</span> of{' '}
                    <span className="text-[#1a0018] font-bold">{pagination.pages}</span> ({pagination.total} articles)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#67a652] hover:text-[#67a652] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={15} /> Previous
                    </button>

                    <div className="flex items-center gap-1 px-2">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            pageNum === page
                              ? 'bg-[#228b22] text-white'
                              : 'text-gray-600 hover:bg-purple-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#67a652] hover:text-[#67a652] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </FadeInSection>
            )}
          </>
        )}

        {/* ─── DIVIDER ─── */}
        <div className="flex items-center gap-3 my-16">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8b8e4] to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#1c711c]" />
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
      </div>
    </div>
  );
}