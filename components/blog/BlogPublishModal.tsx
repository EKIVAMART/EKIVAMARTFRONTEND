'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bell,
  Smartphone,
  Mail,
  Users,
  X,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  AdminBlogPost,
  BlogNotificationAudience,
  NotificationChannel,
  PublishResult,
} from '@/types/blog';
import { blogApi, decodeHtmlEntities } from '@/lib/api-blog';
import { toast } from 'react-hot-toast';

interface BlogPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: PublishResult) => void;
  post: AdminBlogPost | null;
}

export default function BlogPublishModal({
  isOpen,
  onClose,
  onSuccess,
  post,
}: BlogPublishModalProps) {
  const [sendNotification, setSendNotification] = useState(true);
  const [channels, setChannels] = useState<NotificationChannel[]>([
    'in_app',
    'push',
    'email',
  ]);
  const [audience, setAudience] =
    useState<BlogNotificationAudience>('ALL_USERS');
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen || !post) return null;

  const toggleChannel = (ch: NotificationChannel) => {
    if (channels.includes(ch)) {
      if (channels.length === 1) {
        toast.error('Select at least one notification channel');
        return;
      }
      setChannels(channels.filter((c) => c !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const result = await blogApi.publishPost(post.id, {
        notification: sendNotification
          ? {
              enabled: true,
              channels: channels.map((c) => c.toLowerCase() as NotificationChannel),
              audience: audience,
            }
          : {
              enabled: false,
            },
      });

      if (result.transitioned === false) {
        toast.success('This post is already live.');
      } else if (result.notificationScheduled) {
        toast.success('Article published & notifications scheduled!');
      } else {
        toast.success('Article published successfully');
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish blog article');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-sm overflow-hidden border border-neutral-100 p-6 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Send size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">
                  Publish Article
                </h3>
                <p className="text-xs text-neutral-500 font-medium truncate max-w-[260px]">
                  {decodeHtmlEntities(post.title)}
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

          {/* Banner */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-md p-4 flex items-start gap-3 text-emerald-950">
            <Sparkles size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-extrabold">Ready to go live?</p>
              <p className="text-emerald-700 font-medium">
                Publishing makes this story immediately visible to all visitors on the public EkivaMart website.
              </p>
            </div>
          </div>

          {/* Notification Setting Toggle */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800">
                  Send Announcement Notification
                </h4>
                <p className="text-[11px] text-neutral-400 font-medium">
                  Alert users about this new blog article
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSendNotification(!sendNotification)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-md border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  sendNotification ? 'bg-brand-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-md bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    sendNotification ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* If sendNotification is true, show channels & audience */}
            {sendNotification && (
              <div className="pt-3 border-t border-neutral-200 space-y-4 animate-in fade-in">
                {/* Notification Channels */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-2">
                    Notification Channels
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* In-App */}
                    <button
                      type="button"
                      onClick={() => toggleChannel('in_app')}
                      className={`p-3 rounded-md border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                        channels.includes('in_app')
                          ? 'bg-brand-50 border-brand-300 text-brand-700 shadow-xs'
                          : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                      }`}
                    >
                      <Bell size={16} />
                      <span>In-App</span>
                    </button>

                    {/* Push */}
                    <button
                      type="button"
                      onClick={() => toggleChannel('push')}
                      className={`p-3 rounded-md border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                        channels.includes('push')
                          ? 'bg-brand-50 border-brand-300 text-brand-700 shadow-xs'
                          : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                      }`}
                    >
                      <Smartphone size={16} />
                      <span>Push</span>
                    </button>

                    {/* Email */}
                    <button
                      type="button"
                      onClick={() => toggleChannel('email')}
                      className={`p-3 rounded-md border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                        channels.includes('email')
                          ? 'bg-brand-50 border-brand-300 text-brand-700 shadow-xs'
                          : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                      }`}
                    >
                      <Mail size={16} />
                      <span>Email</span>
                    </button>
                  </div>
                </div>

                {/* Audience Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1.5">
                    Target Audience
                  </label>
                  <div className="relative">
                    <Users size={16} className="absolute left-3.5 top-3 text-neutral-400" />
                    <select
                      value={audience}
                      onChange={(e) =>
                        setAudience(e.target.value as BlogNotificationAudience)
                      }
                      className="w-full bg-white border border-neutral-200 rounded-md pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-600"
                    >
                      <option value="ALL_USERS">
                        All Users (Registered Customers, Vendors & Admin Staff)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-neutral-200 rounded-md text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-extrabold transition shadow-sm flex items-center gap-2"
            >
              {isPublishing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              <span>Confirm &amp; Publish</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
