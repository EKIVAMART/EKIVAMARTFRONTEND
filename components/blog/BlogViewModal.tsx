'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  User,
  Globe,
  ExternalLink,
} from '@/components/ui/platform-icons';
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
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
            Draft
          </span>
        );
      case 'unpublished':
        return (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
            Unpublished
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-[3px] sm:p-6 dashboard-dialog-overlay">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-preview-title"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex w-full flex-col overflow-hidden bg-white dashboard-dialog dashboard-dialog--wide"
        >
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-8 dashboard-dialog-header">
            <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Blog content</p>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="article-preview-title" className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                    Article Preview
                  </h2>
                  {getStatusBadge(post.status)}
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  /blog/{post.slug}
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {post.status === 'published' && (
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="hidden min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-emerald-800 transition-colors hover:bg-slate-50 sm:inline-flex"
                >
                  <ExternalLink size={14} />
                  <span>View Public</span>
                </Link>
              )}
              <button
                onClick={onClose}
                type="button"
                aria-label="Close article preview"
                className="rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dashboard-dialog-close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body Content Scroll Area */}
          <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/60 p-5 sm:p-8 dashboard-dialog-body">
            {/* Featured Image */}
            {post.featuredImage?.url && (
              <div className="max-h-72 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <img
                  src={post.featuredImage.url}
                  alt={decodeHtmlEntities(post.title)}
                  className="w-full h-72 object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              {decodeHtmlEntities(post.title)}
            </h1>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-slate-200 py-3 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-brand-600" />
                <span>Author: {post.author?.name || 'Unknown Author'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-brand-600" />
                <span>{post.readingTime} min read</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-brand-600" />
                <span>
                  Created: {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              {post.publishedAt && (
                <>
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold">
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
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
                {decodeHtmlEntities(post.excerpt)}
              </div>
            )}

            {/* Content Body Render */}
            <div className="blog-article-content max-w-none rounded-xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-800 sm:p-6 sm:text-base">
              <div
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* SEO Info Box */}
            {(post.seoTitle || post.seoDescription) && (
              <div className="mt-8 space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Globe size={14} />
                  <span>Google Search Result Snippet Preview</span>
                </div>
                {post.seoTitle && (
                  <h4 className="text-sm font-semibold text-emerald-800">
                    {decodeHtmlEntities(post.seoTitle)}
                  </h4>
                )}
                <p className="text-xs leading-normal text-slate-500">
                  /blog/{post.slug}
                </p>
                {post.seoDescription && (
                  <p className="text-xs leading-relaxed text-slate-600">
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
