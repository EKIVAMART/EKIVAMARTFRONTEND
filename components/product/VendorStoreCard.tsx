'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ChevronRight, Calendar } from '@/components/ui/platform-icons';
import { storePublicApi, productApi } from '@/lib/api';

interface VendorStoreCardProps {
  product: any;
}

export default function VendorStoreCard({ product }: VendorStoreCardProps) {
  const storeSlug = product.storeSlug || product.store?.slug || product.vendor?.storeSlug || '';
  const storeName = product.storeName || product.store?.name || product.vendor?.storeName || '';
  const vendorProfileId =
    product.vendorProfileId ||
    product.vendorId ||
    product.vendor?._id ||
    product.vendor?.id ||
    '';

  const [storeData, setStoreData] = useState<{
    slug: string;
    name: string;
    logoUrl?: string;
    description?: string;
    trustLevel?: string;
    averageRating?: number | null;
    totalReviews?: number;
  } | null>(
    storeSlug || storeName
      ? {
          slug: storeSlug,
          name: storeName || 'EkivaMart Store',
        }
      : null
  );
  const [storeCardLoading, setStoreCardLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const tryResolveFromStores = async () => {
      if (!vendorProfileId && !storeSlug) return;
      try {
        setStoreCardLoading(true);
        const res: any = await productApi.getStores();
        if (!isMounted) return;
        const stores = res.data?.stores || res.data || res || [];
        const match = Array.isArray(stores)
          ? stores.find(
              (s: any) =>
                (vendorProfileId && (s._id === vendorProfileId || s.id === vendorProfileId || s.vendorProfileId === vendorProfileId || s.userId === vendorProfileId)) ||
                (storeSlug && (s.slug === storeSlug || s.username === storeSlug))
            )
          : null;

        if (match) {
          setStoreData({
            slug: match.slug || match.username || storeSlug,
            name: match.name || match.storeName || storeName || 'EkivaMart Store',
            logoUrl: match.logo || match.logoUrl || undefined,
            description: match.description || undefined,
            trustLevel: match.trustLevel || undefined,
            averageRating: match.rating ?? match.averageRating ?? null,
            totalReviews: match.totalReviews ?? undefined,
          });
        }
      } catch {
        // silently fallback to basic store data
      } finally {
        if (isMounted) setStoreCardLoading(false);
      }
    };

    const fetchStore = async () => {
      try {
        if (!storeSlug) {
          await tryResolveFromStores();
        }

        if (!storeSlug) return;

        const [profileRes, reviewsRes] = await Promise.allSettled([
          storePublicApi.getStoreProfile(storeSlug),
          storePublicApi.getStoreReviews(storeSlug, { limit: 1 }),
        ]);
        if (!isMounted) return;

        const profile = profileRes.status === 'fulfilled' ? profileRes.value?.data : null;
        const reviews = reviewsRes.status === 'fulfilled' ? reviewsRes.value?.data : null;

        if (profile) {
          setStoreData((prev) => ({
            slug: profile.storeSlug || storeSlug,
            name: profile.storeName || prev?.name || storeName || 'EkivaMart Store',
            logoUrl: profile.storeLogoUrl || undefined,
            description: profile.storeDescription || undefined,
            trustLevel: profile.trustLevel || undefined,
            averageRating: reviews?.averageRating ?? profile.averageRating ?? null,
            totalReviews: reviews?.totalReviews ?? undefined,
          }));
        }
      } catch {
        // silently fail
      }
    };

    void tryResolveFromStores();
    void fetchStore();
    return () => {
      isMounted = false;
    };
  }, [product, storeSlug, storeName, vendorProfileId]);

  if (storeCardLoading) {
    return (
      <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-2.5 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="w-5 h-5 rounded bg-gray-100 animate-pulse" />
        </div>
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-3.5 h-3.5 rounded bg-gray-100 animate-pulse" />
            ))}
            <div className="w-8 h-3 bg-gray-100 rounded animate-pulse ml-1" />
          </div>
          <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!storeData) return null;

  const ratingVal = typeof storeData.averageRating === 'number' ? storeData.averageRating : 0;
  const totalReviews = storeData.totalReviews ?? 0;

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => {
      const full = rating >= i + 1;
      const half = !full && rating >= i + 0.5;
      return (
        <span key={i} className="relative inline-block" style={{ width: 14, height: 14 }}>
          <Star size={14} className="text-gray-200 fill-gray-200" />
          {(full || half) && (
            <span className="absolute inset-0 overflow-hidden" style={{ width: full ? '100%' : '50%' }}>
              <Star size={14} className="text-amber-400 fill-amber-400" />
            </span>
          )}
        </span>
      );
    });

  return (
    <Link
      href={storeData.slug ? `/stores/${encodeURIComponent(storeData.slug)}` : '/stores'}
      className="pd-vendor-card group cursor-pointer mt-4 block"
    >
      <div className="pd-vendor-header">
        <div className="pd-vendor-avatar">
          {storeData.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={storeData.logoUrl} alt={storeData.name} className="pd-vendor-logo-img" />
          ) : (
            <span className="pd-vendor-initials">{storeData.name.substring(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="pd-vendor-info">
          <div className="flex items-center gap-2">
            <h4 className="pd-vendor-name">{storeData.name}</h4>
            {storeData.trustLevel && (
              <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100/70">
                {storeData.trustLevel.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          {storeData.description && (
            <p className="text-[11px] text-gray-500 font-semibold line-clamp-1 mt-0.5">{storeData.description}</p>
          )}
        </div>
        <ChevronRight size={20} className="pd-vendor-chevron group-hover:translate-x-1 transition-transform text-gray-400" />
      </div>
      <div className="pd-vendor-footer">
        <div className="pd-vendor-rating flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">{renderStars(ratingVal)}</div>
          <span className="text-xs font-bold text-gray-700">
            {ratingVal > 0 ? ratingVal.toFixed(1) : 'No rating yet'}
          </span>
          {totalReviews > 0 && (
            <span className="text-xs text-gray-400 font-medium">({totalReviews.toLocaleString()})</span>
          )}
        </div>
        <div className="pd-vendor-joined flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Calendar size={14} className="text-gray-400" />
          <span>Selling on EkivaMart</span>
        </div>
      </div>
    </Link>
  );
}
