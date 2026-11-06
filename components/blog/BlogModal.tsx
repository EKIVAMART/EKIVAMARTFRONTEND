'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Link as LinkIcon,
  Globe,
  FileText,
  Loader2,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { AdminBlogPost, CreateBlogPostDto, UpdateBlogPostDto } from '@/types/blog';
import { blogApi, decodeHtmlEntities } from '@/lib/api-blog';
import MediumEditor from './MediumEditor';
import { toast } from 'react-hot-toast';

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (post: AdminBlogPost) => void;
  postToEdit?: AdminBlogPost | null;
}

export default function BlogModal({
  isOpen,
  onClose,
  onSuccess,
  postToEdit,
}: BlogModalProps) {
  const isEditing = Boolean(postToEdit);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [slug, setSlug] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [featuredImageKey, setFeaturedImageKey] = useState<string | null>(null);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoGenerateExcerpt, setAutoGenerateExcerpt] = useState(true);

  // Load existing post data if editing
  useEffect(() => {
    if (postToEdit) {
      setTitle(decodeHtmlEntities(postToEdit.title));
      setContent(postToEdit.content || '');
      setExcerpt(decodeHtmlEntities(postToEdit.excerpt || ''));
      setSlug(postToEdit.slug || '');
      setFeaturedImageUrl(postToEdit.featuredImage?.url || '');
      setFeaturedImageKey(postToEdit.featuredImage?.key || null);
      setSeoTitle(decodeHtmlEntities(postToEdit.seoTitle || ''));
      setSeoDescription(decodeHtmlEntities(postToEdit.seoDescription || ''));
      setAutoGenerateExcerpt(!postToEdit.excerpt);
    } else {
      setTitle('');
      setContent('');
      setExcerpt('');
      setSlug('');
      setFeaturedImageUrl('');
      setFeaturedImageKey(null);
      setSeoTitle('');
      setSeoDescription('');
      setAutoGenerateExcerpt(true);
    }
  }, [postToEdit, isOpen]);

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Hero image file size must be 10 MB or less');
      return;
    }

    try {
      setIsUploadingHero(true);
      const res = await blogApi.uploadImage(file);
      setFeaturedImageUrl(res.url);
      setFeaturedImageKey(res.key);
      toast.success('Featured image uploaded');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload featured image');
    } finally {
      setIsUploadingHero(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title for the blog article');
      return;
    }

    if (!content.trim() || content === '<p></p>') {
      toast.error('Please enter content body for the blog article');
      return;
    }

    try {
      setIsSaving(true);

      const featuredImageObj = featuredImageUrl.trim()
        ? { url: featuredImageUrl.trim(), key: featuredImageKey }
        : null;

      if (isEditing && postToEdit) {
        const updateDto: UpdateBlogPostDto = {
          title: title.trim(),
          content: content.trim(),
          excerpt: autoGenerateExcerpt ? null : excerpt.trim() || null,
          featuredImage: featuredImageObj,
          seoTitle: seoTitle.trim() || null,
          seoDescription: seoDescription.trim() || null,
        };

        if (slug.trim() && slug.trim() !== postToEdit.slug) {
          updateDto.slug = slug.trim();
        }

        const updated = await blogApi.updatePost(postToEdit.id, updateDto);
        toast.success('Blog post updated successfully');
        onSuccess(updated);
        onClose();
      } else {
        const createDto: CreateBlogPostDto = {
          title: title.trim(),
          content: content.trim(),
        };

        if (!autoGenerateExcerpt && excerpt.trim()) {
          createDto.excerpt = excerpt.trim();
        }
        if (slug.trim()) {
          createDto.slug = slug.trim();
        }
        if (featuredImageObj) {
          createDto.featuredImage = featuredImageObj;
        }
        if (seoTitle.trim()) {
          createDto.seoTitle = seoTitle.trim();
        }
        if (seoDescription.trim()) {
          createDto.seoDescription = seoDescription.trim();
        }

        const created = await blogApi.createPost(createDto);
        toast.success('Blog post saved as draft');
        onSuccess(created);
        onClose();
      }
    } catch (err: any) {
      console.error('Save blog error:', err);
      const msg = err?.message || 'Failed to save blog post';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f8faf7] p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full min-h-screen border-0 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">
                  {isEditing ? 'Edit article' : 'New article'}
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  {isEditing
                    ? 'Modify article content, images, and search engine metadata'
                    : 'Compose a story to publish on the EkivaMart blog page'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content Scrollable Area */}
          <form onSubmit={handleSave} className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-10 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Article Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={200}
                placeholder="Give your article a clear title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white transition"
              />
            </div>

            {/* Custom URL Slug */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Custom URL Slug (Optional)
              </label>
              <p className="text-[11px] text-neutral-400 mb-1.5">
                Leave blank to automatically build URL slug from article title.
              </p>
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-xs font-semibold text-neutral-500">
                <Globe size={14} className="text-neutral-400" />
                <span className="text-neutral-400">ekivamart.com/blog/</span>
                <input
                  type="text"
                  maxLength={220}
                  placeholder="article-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Featured Hero Image */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Featured Hero Image
              </label>

              {featuredImageUrl ? (
                <div className="relative rounded-md overflow-hidden border border-neutral-200 max-h-56 bg-neutral-100 group">
                  <img
                    src={featuredImageUrl}
                    alt="Featured preview"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedImageUrl('');
                        setFeaturedImageKey(null);
                      }}
                      className="px-4 py-2 bg-rose-600 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-rose-700 transition"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <label className="flex-1 border-2 border-dashed border-neutral-200 hover:border-brand-500 rounded-md p-4 text-center cursor-pointer transition bg-neutral-50/50 flex flex-col items-center justify-center">
                    {isUploadingHero ? (
                      <Loader2 size={24} className="animate-spin text-brand-600 my-1" />
                    ) : (
                      <Upload size={24} className="text-neutral-400 mb-1" />
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      Upload Featured Image
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">
                      JPEG, PNG or WebP up to 10 MB
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleHeroFileUpload}
                      disabled={isUploadingHero}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center justify-center text-xs font-bold text-neutral-400">
                    OR
                  </div>

                  <div className="flex-1">
                    <div className="relative">
                      <LinkIcon size={14} className="absolute left-3 top-3 text-neutral-400" />
                      <input
                        type="url"
                        placeholder="Paste image URL (https://...)"
                        value={featuredImageUrl}
                        onChange={(e) => {
                          setFeaturedImageUrl(e.target.value);
                          setFeaturedImageKey(null);
                        }}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-md pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Medium Editor */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Article Body Content <span className="text-rose-500">*</span>
              </label>
              <MediumEditor
                value={content}
                onChange={(html) => setContent(html)}
                placeholder="Write your guide, tips, or announcements here..."
              />
            </div>

            {/* Excerpt Section */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Card Summary Excerpt
                </label>
                <button
                  type="button"
                  onClick={() => setAutoGenerateExcerpt(!autoGenerateExcerpt)}
                  className={`text-xs font-bold px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                    autoGenerateExcerpt
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  <Sparkles size={12} />
                  <span>{autoGenerateExcerpt ? 'Auto-generate from content' : 'Custom Excerpt'}</span>
                </button>
              </div>

              {!autoGenerateExcerpt && (
                <textarea
                  maxLength={500}
                  rows={3}
                  placeholder="Enter a short custom summary for article cards (max 500 characters)..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-md p-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
              )}
            </div>

            {/* SEO Metadata Accordion */}
            <div className="border border-neutral-200 rounded-md p-4 space-y-4 bg-white">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Globe size={14} className="text-brand-600" />
                <span>Search Engine Optimization (SEO Metadata)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                    SEO Title (Max 200 chars)
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    placeholder="Article title | EkivaMart"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                    SEO Description (Max 500 chars)
                  </label>
                  <input
                    type="text"
                    maxLength={500}
                    placeholder="A short description of this article."
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 border border-neutral-200 rounded-md text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-extrabold transition shadow-sm flex items-center gap-2"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                <span>
                  {isEditing ? 'Save Changes' : 'Save as Draft'}
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
