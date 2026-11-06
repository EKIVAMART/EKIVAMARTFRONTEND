'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BlogModal from './BlogModal';
import { blogApi } from '@/lib/api-blog';
import { authApi } from '@/lib/api';
import type { AdminBlogPost } from '@/types/blog';

export default function BlogEditorPage({ role }: { role: 'admin' | 'super-admin' }) {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');
  const [post, setPost] = useState<AdminBlogPost | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(id));
  const [authorized, setAuthorized] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const back = () => router.push(`/${role}/dashboard?tab=blog`);
  useEffect(() => {
    authApi.getProfile().then(response => {
      const profile = response?.data ?? response;
      const userRole = String(profile?.role || '').toLowerCase().replace('_', '-');
      setAuthorized(role === 'super-admin' ? userRole === 'super-admin' : ['admin', 'super-admin'].includes(userRole));
    }).catch(() => setAuthorized(false)).finally(() => setCheckingAccess(false));
  }, [role]);
  useEffect(() => {
    if (!authorized || !id) return;
    let active = true;
    blogApi.getAdminPostById(id).then(value => { if (active) setPost(value); })
      .catch(err => { if (active) setError(err?.message || 'Could not load article.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, authorized]);
  if (checkingAccess) return <p className="p-8">Checking access…</p>;
  if (!authorized) return <main className="p-8"><p role="alert">You do not have access to this editor.</p><button onClick={() => router.push(`/${role}/login`)}>Sign in</button></main>;
  if (loading) return <p className="p-8">Loading article…</p>;
  if (error) return <main className="p-8"><p role="alert">{error}</p><button onClick={back}>Back to blog</button></main>;
  return <BlogModal isOpen onClose={back} onSuccess={back} postToEdit={post} />;
}
