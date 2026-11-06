'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  User,
  Globe,
  Tag,
  Eye,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { AdminBlogPost } from '@/types/blog';
import { decodeHtmlEntities } from '@/lib/api-blog';
import Link from 'next/link';

interface BlogViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: AdminBlogPost | null;
}

export default function BlogViewModal({
  isOpen,
  onClose,
  post,
}: BlogViewModalProps) {
  if (!isOpen || !post) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="px-3 py-1 rounded-md text-xs font-black bg-emerald-100 text-emerald-700 uppercase tracking-wider">
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="px-3 py-1 rounded-md text-xs font-black bg-amber-100 text-amber-700 uppercase tracking-wider">
            Draft
          </span>
        );
      case 'unpublished':
        return (
          <span className="px-3 py-1 rounded-md text-xs font-black bg-slate-100 text-slate-700 uppercase tracking-wider">
            Unpublished
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-sm overflow-hidden border border-neutral-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-800">
                    Article Preview
                  </h3>
                  {getStatusBadge(post.status)}
                </div>
                <p className="text-xs text-neutral-400 font-medium">
                  Slug: /blog/{post.slug}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {post.status === 'published' && (
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-md bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  <span>View Public</span>
                </Link>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body Content Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            {/* Featured Image */}
            {post.featuredImage?.url && (
              <div className="rounded-md overflow-hidden max-h-72 border border-neutral-200">
                <img
                  src={post.featuredImage.url}
                  alt={decodeHtmlEntities(post.title)}
                  className="w-full h-72 object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h1
              className="text-2xl md:text-3xl font-black text-slate-900 leading-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {decodeHtmlEntities(post.title)}
            </h1>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 font-semibold py-3 border-y border-neutral-100">
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-brand-600" />
                <span>Author: {post.author?.name || 'Unknown Author'}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-neutral-300" />
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-brand-600" />
                <span>{post.readingTime} min read</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-neutral-300" />
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-brand-600" />
                <span>
                  Created: {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              {post.publishedAt && (
                <>
                  <div className="w-1 h-1 rounded-full bg-neutral-300" />
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <span>
                      Published:{' '}
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Hand-written / Auto Excerpt */}
            {post.excerpt && (
              <div className="p-4 rounded-md bg-neutral-50 border border-neutral-200/80 italic text-slate-700 text-sm font-medium">
                "{decodeHtmlEntities(post.excerpt)}"
              </div>
            )}

            {/* Content Body Render */}
            <div className="blog-article-content max-w-none text-slate-800 leading-relaxed pt-2">
              <div
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{ fontFamily: "'Palatino Linotype', 'Georgia', serif" }}
              />
            </div>

            {/* SEO Info Box */}
            {(post.seoTitle || post.seoDescription) && (
              <div className="p-4 rounded-md bg-slate-900 text-white space-y-2 mt-8">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Globe size={14} />
                  <span>Google Search Result Snippet Preview</span>
                </div>
                {post.seoTitle && (
                  <h4 className="text-sm font-bold text-sky-400 hover:underline cursor-pointer">
                    {decodeHtmlEntities(post.seoTitle)}
                  </h4>
                )}
                <p className="text-xs text-slate-300 leading-normal">
                  https://faflora.com/blog/{post.slug}
                </p>
                {post.seoDescription && (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {decodeHtmlEntities(post.seoDescription)}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
