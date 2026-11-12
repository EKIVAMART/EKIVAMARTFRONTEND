'use client';

import { useEffect, useState } from 'react';
import { categoryApi, productApi } from '@/lib/api';
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
        const [response, categoryResponse] = await Promise.all([
          productApi.getAllProducts({ status:'active', limit:100, sortBy:'createdAt', sortOrder:'desc', skipAuth:true }),
          categoryApi.getCategories({ limit:100 }),
        ]);
        // API product and category payloads are not typed by the shared client yet.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const categoryRows: any[] = Array.isArray(categoryResponse?.data) ? categoryResponse.data : categoryResponse?.data?.data ?? categoryResponse?.data?.categories ?? [];
        const namesById = new Map(categoryRows.map(category => [String(category.id), String(category.name)]));
        const data = response?.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows: any[] = Array.isArray(data) ? data : data?.data ?? data?.products ?? data?.docs ?? [];
        const catalog: CatalogItem[] = rows.map(raw => ({
          ...mapProduct(raw),
          categoryKey: String(raw.categoryId ?? raw.category?.id ?? raw.category?.name ?? raw.category ?? ''),
          categoryName: raw.category?.name || raw.categoryName || namesById.get(String(raw.categoryId)) || (typeof raw.category === 'string' ? raw.category : ''),
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
