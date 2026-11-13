'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag, Calendar, BookOpen, ArrowRight } from '@/components/ui/platform-icons';
import FadeInSection from '@/components/FadeInSection';
import { blogApi, decodeHtmlEntities } from '@/lib/api-blog';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface ArticleDetail {
  id: string;
  slug: string;
  category: string;
  tag: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  featuredImage?: string | null;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  tag: string;
  readTime: string;
  gradient: string;
  featuredImage?: string | null;
}

export default function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const { slug } = use(params);

  const [post, setPost] = useState<ArticleDetail | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPostAndRelated() {
      try {
        setLoading(true);
        let live = await blogApi.getPublicPostBySlug(slug).catch(() => null);
        if (!live) {
          const adminPost = await blogApi.getAdminPostById(slug).catch(() => null);
          if (adminPost) {
            live = {
              ...adminPost,
              author: adminPost.author ? { name: adminPost.author.name } : null,
            };
          }
        }

        if (live) {
          setPost({
            id: live.id,
            slug: live.slug,
            category: (live as any).category?.name || 'EkivaMart Journal',
            tag: (live as any).tags?.[0] || 'Article',
            title: decodeHtmlEntities(live.title),
            excerpt: decodeHtmlEntities(live.excerpt || ''),
            readTime: `${live.readingTime || 3} min read`,
            date: live.publishedAt
              ? new Date(live.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent',
            featuredImage: live.featuredImage?.url || null,
            author: {
              name: live.author?.name || 'EkivaMart Staff',
              role: 'EkivaMart Editorial',
              avatar: (live.author?.name || 'FE').substring(0, 2).toUpperCase(),
            },
          });
          setHtmlContent(live.content);

          // Fetch real related articles from API
          try {
            const publicPostsRes = await blogApi.getPublicPosts({ page: 1, limit: 6 });
            if (publicPostsRes?.posts) {
              const gradients = [
                'from-[#8b0d7a] via-[#5c0060] to-[#1a0016]',
                'from-[#ff7043] via-[#e65100] to-[#1a0016]',
                'from-[#00b8d9] via-[#005f73] to-[#1a0016]',
              ];
              const filtered = publicPostsRes.posts
                .filter((p) => p.slug !== live!.slug && p.id !== live!.id)
                .slice(0, 2)
                .map((item, idx) => ({
                  id: item.id,
                  slug: item.slug,
                  title: decodeHtmlEntities(item.title),
                  tag: (item as any).tags?.[0] || 'Article',
                  readTime: `${item.readingTime || 3} min read`,
                  gradient: gradients[idx % gradients.length],
                  featuredImage: item.featuredImage?.url || null,
                }));
              setRelatedPosts(filtered);
            }
          } catch {
            setRelatedPosts([]);
          }
        } else {
          setPost(null);
        }
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    }

    loadPostAndRelated();
  }, [slug]);

  if (!post && !loading) {
    return (
      <div className="font-sans bg-[#fdf8ff] min-h-screen flex items-center justify-center py-20 px-6">
        <div className="max-w-md w-full text-center bg-white border border-[#e8b8e4] rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto mb-5">
            <BookOpen size={28} className="text-[#67a652]" />
          </div>
          <h1 className="text-2xl font-black text-[#1a0018] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
            Article Not Found
          </h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            The blog post you are looking for may have been moved, deleted, or does not exist.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#228b22] to-[#1c711c] hover:from-[#1c711c] hover:to-[#56154e] text-white font-bold text-sm px-6 py-3.5 rounded-full transition-all shadow-md"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !post) {
    return (
      <div className="font-sans bg-[#1a0016] min-h-screen flex items-center justify-center py-20 px-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#67a652]/20 border-t-[#67a652] rounded-full animate-spin" />
          <span className="text-sm font-bold text-purple-200">Loading article...</span>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div
      className="font-sans bg-[#fdf8ff] min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Georgia', serif" }}
    >
      {/* ══ HERO ══ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        {/* Render hero image from blog API data if present, otherwise default to background color */}
        {post.featuredImage ? (
          <div className="absolute inset-0 z-0">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140026] via-[#1a0016]/85 to-[#1a0016]/90 backdrop-blur-[1px]" />
          </div>
        ) : (
          <>
            {/* Deep plum background fallback */}
            <div className="absolute inset-0 bg-[#1a0016]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0016] via-[#2d002a] to-[#140026]/90" />
          </>
        )}

        {/* Ambient glow orbs */}
        <div className="absolute top-[-10%] left-[-8%] w-[45vw] h-[45vw] rounded-full bg-[#8b0d7a] opacity-[0.20] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#5c0060] opacity-[0.25] blur-[100px] pointer-events-none" />
        <div className="absolute top-[10%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-[#67a652] opacity-[0.10] blur-[80px] pointer-events-none" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #67a652 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 w-full pt-32 pb-20 z-10">
          {/* Back button and Category pill */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/75 hover:text-white text-xs font-bold transition-colors bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2 rounded-full backdrop-blur-md"
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
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
              }}
            >
              {post.title}
            </h1>
          </FadeInSection>

          {/* Author and Metadata details */}
          <FadeInSection type="fadeUp" delay={0.2}>
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#228b22] to-[#1c711c] flex items-center justify-center text-white font-black text-sm border-2 border-white/20 shadow-md">
                  {post.author.avatar}
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">{post.author.name}</h4>
                  <p className="text-white/60 text-xs font-medium">{post.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 text-white/60 text-xs font-medium sm:ml-auto">
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
            {/* Article Content */}
            {htmlContent ? (
              <div
                className="blog-article-content max-w-none text-gray-700 text-base md:text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <p className="text-gray-500 italic">No content available for this article.</p>
            )}
          </div>

          {/* ─── SHARE / NAVIGATION ─── */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-200/60 pt-6 px-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-[#67a652] hover:text-[#1c711c] font-bold text-sm transition-colors"
            >
              <ArrowLeft size={15} /> Back to Journal
            </Link>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              EkivaMart Editorial
            </span>
          </div>

          {/* ─── RELATED POSTS ─── */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h3
                className="text-xl md:text-2xl font-black text-[#1a0018] mb-6 border-l-4 border-[#67a652] pl-3"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Keep Reading
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relPost) => (
                  <Link href={`/blog/${relPost.slug}`} key={relPost.slug} className="group block">
                    <div className="bg-white border border-[#e8e4f0] rounded-2xl overflow-hidden hover:border-[#67a652] hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      <div
                        className={`relative h-28 bg-gradient-to-br ${relPost.gradient} p-4 flex items-start justify-between flex-shrink-0 overflow-hidden`}
                      >
                        {relPost.featuredImage && (
                          <img
                            src={relPost.featuredImage}
                            alt={relPost.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <span className="relative z-10 bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[2px] px-2.5 py-1 rounded-full border border-white/20">
                          {relPost.tag}
                        </span>
                        <span className="relative z-10 text-white/90 text-[10px] font-semibold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          {relPost.readTime}
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <h4
                          className="font-extrabold text-sm text-[#1a0018] group-hover:text-[#67a652] transition-colors leading-snug mb-2 line-clamp-2"
                          style={{ fontFamily: "'Georgia', serif" }}
                        >
                          {relPost.title}
                        </h4>
                        <span className="text-[10px] text-[#1c711c] font-bold flex items-center gap-1 group-hover:gap-1.5 transition-all">
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
              style={{
                background: 'linear-gradient(135deg, #120010 0%, #1a0016 40%, #2b0129 70%, #40003b 100%)',
              }}
            />
            <div className="absolute -top-20 -right-12 w-72 h-72 rounded-full bg-[#ff69e0] opacity-[0.12] blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-[#1c711c] opacity-[0.06] blur-[60px] pointer-events-none" />

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
