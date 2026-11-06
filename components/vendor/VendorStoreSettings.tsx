'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Store, Camera, Image as ImageIcon, FileText, Palmtree, RefreshCw,
  AlertCircle, CheckCircle2, Save, UploadCloud, Loader2, Calendar, ShieldCheck, Tag, Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface StoreProfile {
  id?: string;
  storeName?: string;
  storeDescription?: string;
  storeLogoUrl?: string;
  storeBannerUrl?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
  isOnVacation?: boolean;
  vacationMessage?: string;
  slug?: string;
  rating?: number;
  totalReviews?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  applicationStatus?: string;
  applicationReference?: string;
  vendorType?: string;
  trustLevel?: string;
  businessAddress?: any;
  phoneNumber?: string;
  socialLinks?: any;
}

interface Props {
  vendorDashboardApi: typeof import('@/lib/api').vendorDashboardApi;
}

export default function VendorStoreSettings({ vendorDashboardApi }: Props) {
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Branding form
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Policies form
  const [returnPolicy, setReturnPolicy] = useState('');
  const [shippingPolicy, setShippingPolicy] = useState('');
  const [isSavingPolicies, setIsSavingPolicies] = useState(false);

  // Vacation mode
  const [isOnVacation, setIsOnVacation] = useState(false);
  const [vacationMessage, setVacationMessage] = useState('');
  const [isTogglingVacation, setIsTogglingVacation] = useState(false);

  // Image upload
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await vendorDashboardApi.getStoreProfile();
      const d: StoreProfile = (res as any)?.data ?? res;
      setProfile(d);
      setStoreName(d.storeName || '');
      setStoreDescription(d.storeDescription || '');
      setLogoUrl(d.storeLogoUrl || '');
      setBannerUrl(d.storeBannerUrl || '');
      setReturnPolicy(d.returnPolicy || '');
      setShippingPolicy(d.shippingPolicy || '');
      setIsOnVacation(d.isOnVacation ?? false);
      setVacationMessage(d.vacationMessage || '');
    } catch (e: any) {
      setError(e?.message || 'Failed to load store profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleImageUpload = async (
    file: File,
    imageType: 'logo' | 'banner',
    setUploading: (v: boolean) => void,
    setUrl: (url: string) => void,
  ) => {
    setUploading(true);
    try {
      const res = await vendorDashboardApi.getStoreImageUploadUrl({
        imageType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });
      const uploadData = (res as any)?.data ?? res;
      const { uploadUrl, url, method, headers, fields } = uploadData;

      if (method === 'PUT') {
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: headers ?? { 'Content-Type': file.type },
          body: file,
        });
      } else {
        const formData = new FormData();
        for (const [k, v] of Object.entries(fields ?? {})) formData.append(k, String(v));
        formData.append('file', file);
        await fetch(uploadUrl, { method: 'POST', body: formData });
      }
      setUrl(url);
      toast.success(`${imageType === 'logo' ? 'Logo' : 'Banner'} uploaded!`);
    } catch (e: any) {
      toast.error(e?.message || `Failed to upload ${imageType}.`);
    } finally {
      setUploading(false);
    }
  };

  const saveBranding = async () => {
    if (!storeName.trim()) { toast.error('Store name is required.'); return; }
    setIsSavingBranding(true);
    try {
      await vendorDashboardApi.updateStoreBranding({
        storeName: storeName.trim(),
        storeDescription: storeDescription.trim() || undefined,
        storeLogoUrl: logoUrl || undefined,
        storeBannerUrl: bannerUrl || undefined,
      });
      toast.success('Store branding updated!');
      setProfile(prev => prev ? { ...prev, storeName, storeDescription, storeLogoUrl: logoUrl, storeBannerUrl: bannerUrl } : prev);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update branding.');
    } finally {
      setIsSavingBranding(false);
    }
  };

  const savePolicies = async () => {
    setIsSavingPolicies(true);
    try {
      await vendorDashboardApi.updateStorePolicies({
        returnPolicy: returnPolicy.trim() || undefined,
        shippingPolicy: shippingPolicy.trim() || undefined,
      });
      toast.success('Store policies updated!');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update policies.');
    } finally {
      setIsSavingPolicies(false);
    }
  };

  const toggleVacation = async () => {
    setIsTogglingVacation(true);
    try {
      if (isOnVacation) {
        await vendorDashboardApi.toggleVacationMode(null);
        setIsOnVacation(false);
        setVacationMessage('');
        toast.success('Vacation mode disabled.');
      } else {
        if (!vacationMessage.trim()) { toast.error('Please enter a vacation message first.'); setIsTogglingVacation(false); return; }
        await vendorDashboardApi.toggleVacationMode(vacationMessage.trim());
        setIsOnVacation(true);
        toast.success('Vacation mode enabled.');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to toggle vacation mode.');
    } finally {
      setIsTogglingVacation(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-12 h-12 border-4 border-brand-200 border-t-fuchsia-600 rounded-full animate-spin" />
      <p className="text-sm font-semibold text-slate-500">Loading store settings...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <AlertCircle size={40} className="text-rose-400" />
      <p className="text-slate-600 font-semibold text-sm">{error}</p>
      <button onClick={load} className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition">
        <RefreshCw size={14} /> Try Again
      </button>
    </div>
  );

  const inputClass = 'w-full p-3.5 rounded-2xl border border-gray-200 bg-[#F8F9FA] focus:bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none text-sm font-medium transition-all';
  const textareaClass = `${inputClass} resize-y`;

  return (
    <div className="space-y-8 w-full max-w-full">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Store Settings</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage your store profile, branding, policies and vacation mode.
          </p>
        </div>
        <button
          onClick={load}
          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
        {/* Left Side Settings forms (Col 1 & Col 2) */}
        <div className="lg:col-span-2 space-y-8">
          {/* ── Branding Section ── */}
          <section className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-brand-50 to-brand-50 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-xl flex items-center justify-center">
                <Store size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Store Branding</h3>
                <p className="text-[11px] text-gray-500 font-medium">Name, description, logo, and banner</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Store Name <span className="text-brand-500">*</span></label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Tazo Official Store"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Store Description</label>
                <textarea
                  value={storeDescription}
                  onChange={e => setStoreDescription(e.target.value)}
                  rows={3}
                  className={textareaClass}
                  placeholder="Tell customers what you sell..."
                />
              </div>

              {/* Logo upload */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block">Store Logo</label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Store logo" className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                      <Camera size={24} className="text-brand-300" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'logo', setUploadingLogo, setLogoUrl);
                        if (logoInputRef.current) logoInputRef.current.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="flex items-center gap-2 px-4 py-2.5 border border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl text-xs font-bold transition disabled:opacity-60"
                    >
                      {uploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </button>
                    <p className="text-[11px] text-gray-400 font-medium mt-1.5">Recommended: 200×200px, PNG or JPG</p>
                  </div>
                </div>
              </div>

              {/* Banner upload */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block">Store Banner</label>
                <div className="space-y-3">
                  {bannerUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bannerUrl} alt="Store banner" className="w-full h-28 rounded-2xl object-cover border border-gray-200 shadow-sm" />
                  )}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'banner', setUploadingBanner, setBannerUrl);
                      if (bannerInputRef.current) bannerInputRef.current.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="flex items-center gap-2 px-4 py-2.5 border border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl text-xs font-bold transition disabled:opacity-60"
                  >
                    {uploadingBanner ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                    {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                  </button>
                  <p className="text-[11px] text-gray-400 font-medium">Recommended: 1200×400px, PNG or JPG</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={saveBranding}
                  disabled={isSavingBranding}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-700 hover:to-brand-700 text-white rounded-xl font-bold text-sm transition shadow-md disabled:opacity-60"
                >
                  {isSavingBranding ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSavingBranding ? 'Saving...' : 'Save Branding'}
                </button>
              </div>
            </div>
          </section>

          {/* ── Policies Section ── */}
          <section className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-brand-50 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-brand-600 text-white rounded-xl flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Store Policies</h3>
                <p className="text-[11px] text-gray-500 font-medium">Return and shipping policies shown to customers</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Return Policy</label>
                <textarea
                  value={returnPolicy}
                  onChange={e => setReturnPolicy(e.target.value)}
                  rows={4}
                  className={textareaClass}
                  placeholder="Describe your return and refund policy..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Shipping Policy</label>
                <textarea
                  value={shippingPolicy}
                  onChange={e => setShippingPolicy(e.target.value)}
                  rows={4}
                  className={textareaClass}
                  placeholder="Describe your shipping methods and timelines..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={savePolicies}
                  disabled={isSavingPolicies}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-brand-600 hover:from-blue-700 hover:to-brand-700 text-white rounded-xl font-bold text-sm transition shadow-md disabled:opacity-60"
                >
                  {isSavingPolicies ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSavingPolicies ? 'Saving...' : 'Save Policies'}
                </button>
              </div>
            </div>
          </section>

          {/* ── Vacation Mode Section ── */}
          <section className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center gap-3">
              <div className={`w-9 h-9 bg-gradient-to-br ${isOnVacation ? 'from-amber-400 to-orange-500' : 'from-gray-400 to-gray-500'} text-white rounded-xl flex items-center justify-center`}>
                <Palmtree size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Vacation Mode</h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  {isOnVacation ? 'Your store is currently on vacation' : 'Temporarily pause your store'}
                </p>
              </div>
              {isOnVacation && (
                <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg">ACTIVE</span>
              )}
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Vacation Message</label>
                <textarea
                  value={vacationMessage}
                  onChange={e => setVacationMessage(e.target.value)}
                  rows={3}
                  className={textareaClass}
                  placeholder="e.g. We are on a short break and will be back on Dec 15th. Orders placed now will ship after our return."
                  disabled={isOnVacation}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  {isOnVacation ? (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl text-xs font-bold">
                      <Palmtree size={14} />
                      Vacation mode is ON
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold">
                      <CheckCircle2 size={14} />
                      Store is active
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={toggleVacation}
                  disabled={isTogglingVacation}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition shadow-md disabled:opacity-60 ${
                    isOnVacation
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                  }`}
                >
                  {isTogglingVacation ? <Loader2 size={16} className="animate-spin" /> : <Palmtree size={16} />}
                  {isTogglingVacation ? 'Updating...' : isOnVacation ? 'Disable Vacation Mode' : 'Enable Vacation Mode'}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side Info widgets (Col 3) - fills the whitespace */}
        <div className="space-y-8">
          {/* Read-Only Store Info Card */}
          {profile && (
            <section className="bg-white border border-gray-150 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <ShieldCheck size={18} className="text-brand-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">Store Profile Details</h3>
              </div>
              <div className="p-6 space-y-4">
                {profile.id && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Store ID</span>
                    <p className="text-xs font-mono font-bold text-slate-700 mt-1 select-all break-all">{profile.id}</p>
                  </div>
                )}
                {profile.slug && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Public Slug</span>
                    <p className="text-sm font-bold text-slate-700 mt-1">{profile.slug}</p>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Application Status</span>
                  <div className="mt-1">
                    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg ${
                      (profile.applicationStatus || profile.status) === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                      (profile.applicationStatus || profile.status) === 'pending' || (profile.applicationStatus || profile.status) === 'in_review' ? 'bg-amber-50 text-amber-700' :
                      'bg-rose-50 text-rose-700'
                    }`}>{(profile.applicationStatus || profile.status || 'N/A').toUpperCase()}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Application Reference</span>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-1 select-all">{profile.applicationReference || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vendor Type</span>
                  <p className="text-sm font-bold text-slate-700 mt-1 capitalize">{(profile.vendorType || 'N/A').replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trust Level</span>
                  <div className="mt-1">
                    <span className={`inline-block text-[11px] font-black px-2 py-0.5 rounded border ${
                      (profile.trustLevel || 'verified').toLowerCase() === 'high' || (profile.trustLevel || 'verified').toLowerCase() === 'verified'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>{(profile.trustLevel || 'Verified').toUpperCase()}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Business Address</span>
                  <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                    {(() => {
                      const addr = profile.businessAddress;
                      if (!addr) return 'N/A';
                      if (typeof addr === 'string') return addr;
                      const parts = [addr.street, addr.city, addr.lga, addr.state, addr.postalCode].filter(Boolean);
                      return parts.join(', ') || 'N/A';
                    })()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
                  <p className="text-sm font-bold text-slate-700 mt-1">{profile.phoneNumber || (profile as any).storePhone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Social Links</span>
                  {(() => {
                    const socials = profile.socialLinks;
                    if (!socials || (!socials.instagram && !socials.facebook && !socials.twitter && !socials.tiktok)) {
                      return <p className="text-xs text-gray-400 italic">None provided</p>;
                    }
                    return (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {socials.instagram && (
                          <span className="text-[11px] font-bold bg-brand-50 text-brand-600 px-2 py-0.5 rounded border border-brand-100">
                            IG: {socials.instagram}
                          </span>
                        )}
                        {socials.facebook && (
                          <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                            FB: {socials.facebook}
                          </span>
                        )}
                        {socials.twitter && (
                          <span className="text-[11px] font-bold bg-sky-50 text-sky-600 px-2 py-0.5 rounded border border-sky-100">
                            TW: {socials.twitter}
                          </span>
                        )}
                        {socials.tiktok && (
                          <span className="text-[11px] font-bold bg-slate-900 text-slate-100 px-2 py-0.5 rounded border border-slate-700">
                            TK: {socials.tiktok}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
                {profile.createdAt && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registration Date</span>
                    <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      {new Date(profile.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Read-Only Store Rating & Reviews statistics */}
          {profile && (profile.rating !== undefined || profile.totalReviews !== undefined) && (
            <section className="bg-white border border-gray-150 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-400" />
                <h3 className="font-extrabold text-slate-800 text-sm">Store Performance</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Rating</span>
                  <p className="text-2xl font-black text-slate-800 mt-1 flex items-baseline gap-1">
                    {Number(profile.rating || 0).toFixed(1)} <span className="text-xs text-gray-400 font-semibold">/ 5.0</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Feedback</span>
                  <p className="text-sm font-bold text-slate-700 mt-1">{profile.totalReviews ?? 0} verified customer review{profile.totalReviews !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </section>
          )}

          {/* Product Page Store Badge Mockup Preview */}
          <section className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 mb-2">
              <Tag size={16} className="text-brand-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Store Card Mockup</h4>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              This is how your store details appear to customers on product pages.
            </p>
            <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 hover:border-brand-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e3ebdf] text-[#1c711c] flex items-center justify-center font-bold overflow-hidden shadow-xs border">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    storeName.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-sm font-bold text-slate-800 truncate">{storeName || 'My Store'}</h5>
                  <p className="text-[10px] text-gray-400 font-semibold">Selling on EkivaMart</p>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-gray-200/50 flex items-center justify-between text-[11px] text-gray-500">
                <div className="flex items-center gap-0.5 text-amber-500">
                  ★ <span className="font-bold text-slate-700 ml-0.5">{Number(profile?.rating || 0).toFixed(1)}</span>
                </div>
                <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100/70">Visit Store</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
