'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag, Calendar, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import FadeInSection from '@/components/FadeInSection';
import { posts, BlogPost } from '../postsData';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const { slug } = use(params);
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="font-sans bg-[#fdf8ff] min-h-screen flex items-center justify-center py-20 px-6">
        <div className="max-w-md w-full text-center bg-white border border-[#e8b8e4] rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto mb-5">
            <BookOpen size={28} className="text-[#a84f9a]" />
          </div>
          <h1 className="text-2xl font-black text-[#1a0018] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
            Article Not Found
          </h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            The blog post you are looking for may have been moved, deleted, or does not exist.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#a84f9a] to-[#7d1870] hover:from-[#7d1870] hover:to-[#56154e] text-white font-bold text-sm px-6 py-3.5 rounded-full transition-all shadow-md"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Find 2 related posts (same category, or just other posts if none)
  const relatedPosts = posts
    .filter((p) => p.slug !== post.slug)
    .filter((p) => p.category === post.category || p.featured)
    .slice(0, 2);

  return (
    <div
      className="font-sans bg-[#fdf8ff] min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Georgia', serif" }}
    >
      {/* ══ HERO ══ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        {/* Deep plum background with a hint of dark purple/indigo at the bottom */}
        <div className="absolute inset-0 bg-[#1a0016]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0016] via-[#2d002a] to-[#140026]/90" />
        
        {/* Ambient glow orbs */}
        <div className="absolute top-[-10%] left-[-8%] w-[45vw] h-[45vw] rounded-full bg-[#8b0d7a] opacity-[0.20] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#5c0060] opacity-[0.25] blur-[100px] pointer-events-none" />
        <div className="absolute top-[10%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-[#a84f9a] opacity-[0.10] blur-[80px] pointer-events-none" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #a84f9a 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 w-full pt-32 pb-20 z-10">
          {/* Back button and Category pill */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/75 hover:text-white text-xs font-bold transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
            >
              <ArrowLeft size={14} /> Back to Journal
            </Link>
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-[10px] font-black uppercase tracking-[3px] px-3.5 py-1.5 rounded-full">
              <Tag size={10} className="text-[#f0c8ec]" />
              {post.category}
            </div>
          </div>

          {/* Title */}
          <FadeInSection type="fadeUp" delay={0.1}>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-8"
              style={{
                fontFamily: "'Georgia', serif",
                textShadow: '0 2px 20px rgba(168,79,154,0.3)',
              }}
            >
              {post.title}
            </h1>
          </FadeInSection>

          {/* Author and Metadata details */}
          <FadeInSection type="fadeUp" delay={0.2}>
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a84f9a] to-[#7d1870] flex items-center justify-center text-white font-black text-sm border-2 border-white/20">
                  {post.author.avatar}
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">{post.author.name}</h4>
                  <p className="text-white/50 text-xs font-medium">{post.author.role}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-5 text-white/50 text-xs font-medium sm:ml-auto">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {post.date}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {post.readTime}
                </span>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ══ MAIN BODY CONTENT ══ */}
      <section className="relative py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white border border-[#e8e4f0] rounded-3xl p-8 md:p-12 shadow-sm">
            {/* Article Sections */}
            <div className="space-y-8 text-gray-700 text-base md:text-lg leading-relaxed">
              {post.content.map((section, idx) => {
                if (section.type === 'paragraph') {
                  // If it is the first paragraph, style it beautifully
                  const isFirst = idx === 0;
                  return (
                    <p
                      key={idx}
                      className={`text-gray-600 font-medium ${
                        isFirst ? 'text-lg md:text-xl text-gray-800 font-semibold first-letter:text-5xl first-letter:font-black first-letter:text-[#a84f9a] first-letter:float-left first-letter:mr-3 first-letter:line-height-1' : ''
                      }`}
                    >
                      {section.text}
                    </p>
                  );
                }
                
                if (section.type === 'heading') {
                  return (
                    <h2
                      key={idx}
                      className="text-2xl md:text-3xl font-extrabold text-[#1a0018] mt-10 mb-4 leading-tight border-b border-gray-100 pb-3"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      {section.text}
                    </h2>
                  );
                }

                if (section.type === 'quote') {
                  return (
                    <div
                      key={idx}
                      className="my-8 pl-6 border-l-4 border-[#a84f9a] bg-purple-50/30 p-6 rounded-r-2xl italic text-[#1a0018] font-bold text-lg"
                    >
                      <p className="mb-2">"{section.text}"</p>
                      {section.author && (
                        <cite className="block text-xs font-bold text-[#a84f9a] not-italic uppercase tracking-widest mt-2">
                          — {section.author}
                        </cite>
                      )}
                    </div>
                  );
                }

                if (section.type === 'list') {
                  return (
                    <ul key={idx} className="space-y-3 my-6 pl-4">
                      {section.items?.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3 text-gray-600">
                          <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#a84f9a] to-[#7d1870] flex items-center justify-center shadow-sm">
                            <svg width="8" height="6" viewBox="0 0 9 7" fill="none">
                              <path d="M1 3.5L3.2 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* ─── SHARE / REACTIONS ─── */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-200/60 pt-6 px-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-[#a84f9a] hover:text-[#7d1870] font-bold text-sm transition-colors"
            >
              <ArrowLeft size={15} /> Back to Journal
            </Link>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Faflora Editorial · 2026
            </span>
          </div>

          {/* ─── RELATED POSTS ─── */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h3 className="text-xl md:text-2xl font-black text-[#1a0018] mb-6 border-l-4 border-[#a84f9a] pl-3" style={{ fontFamily: "'Georgia', serif" }}>
                Keep Reading
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relPost) => (
                  <Link href={`/blog/${relPost.slug}`} key={relPost.slug} className="group block">
                    <div className="bg-white border border-[#e8e4f0] rounded-2xl overflow-hidden hover:border-[#a84f9a] hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      <div className={`h-24 bg-gradient-to-br ${relPost.gradient} opacity-90 p-4 flex items-start justify-between flex-shrink-0`}>
                        <span className="bg-white/25 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[2px] px-2.5 py-1 rounded-full border border-white/15">
                          {relPost.tag}
                        </span>
                        <span className="text-white/80 text-[10px] font-semibold">{relPost.readTime}</span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <h4 className="font-extrabold text-sm text-[#1a0018] group-hover:text-[#a84f9a] transition-colors leading-snug mb-2 line-clamp-2" style={{ fontFamily: "'Georgia', serif" }}>
                          {relPost.title}
                        </h4>
                        <span className="text-[10px] text-[#c740b0] font-bold flex items-center gap-1 group-hover:gap-1.5 transition-all">
                          Read Post <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ─── SUPPORT CTA ─── */}
          <div className="relative overflow-hidden rounded-3xl border border-[#e8b8e4] mt-16">
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #120010 0%, #1a0016 40%, #2b0129 70%, #40003b 100%)' }}
            />
            <div className="absolute -top-20 -right-12 w-72 h-72 rounded-full bg-[#ff69e0] opacity-[0.12] blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-[#c740b0] opacity-[0.06] blur-[60px] pointer-events-none" />
            
            <div className="relative flex flex-col sm:flex-row items-center gap-6 px-8 py-8">
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-white font-extrabold text-lg">Have more questions?</h4>
                <p className="mt-1 text-white/50 text-xs">
                  Our Support Center is packed with step-by-step guides for buyers and vendors.
                </p>
              </div>
              <Link
                href="/support"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-[#981d87] font-extrabold text-xs px-5 py-3 rounded-full hover:bg-[#f9eaf8] hover:scale-105 transition-all shadow-md"
              >
                Support Center <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
