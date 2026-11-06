'use client';

import { useEffect, useState } from 'react';
import { productApi } from '@/lib/api';
import { mapProduct } from '@/lib/data/landing-product';

export type CatalogItem = ReturnType<typeof mapProduct> & {
  categoryKey: string;
  categoryName: string;
  sold: number;
  added: number;
  featured: boolean;
  saleEnd: number;
  storeSlug?: string;
};
export function useMarketplaceCatalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await productApi.getAllProducts({ status:'active', limit:60, sortBy:'createdAt', sortOrder:'desc', skipAuth:true });
        const data = response?.data;
        const rows: any[] = Array.isArray(data) ? data : data?.data ?? data?.products ?? data?.docs ?? [];
        const catalog: CatalogItem[] = rows.map(raw => ({
          ...mapProduct(raw),
          categoryKey: String(raw.categoryId ?? raw.category?.id ?? raw.category?.name ?? raw.category ?? ''),
          categoryName: raw.category?.name || raw.categoryName || (typeof raw.category === 'string' ? raw.category : ''),
          sold: Number(raw.unitsSold ?? raw.salesCount ?? 0),
          added: Date.parse(raw.createdAt) || 0,
          featured: Boolean(raw.isFeatured ?? raw.featured),
          saleEnd: Date.parse(raw.saleEndsAt ?? raw.flashSaleEndsAt) || 0,
          storeSlug: raw.storeSlug ?? raw.store?.slug,
        }));
        if (!active) return;
        setItems(catalog); setState('ready');
      } catch { if (active) setState('error'); }
    }
    void load();
    return () => { active = false; };
  }, []);
  return { items, state };
}
