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

// Product responses use category IDs; a parent-filtered query can supply its department name.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCatalogProduct(raw: any, categoryName = ''): CatalogItem {
  return {
    ...mapProduct(raw),
    categoryKey: String(
      raw.categoryId ??
        raw.category?.id ??
        raw.category?.name ??
        raw.category ??
        ''
    ),
    categoryName:
      categoryName ||
      raw.category?.name ||
      raw.categoryName ||
      (typeof raw.category === 'string' ? raw.category : ''),
    sold: Number(raw.unitsSold ?? raw.salesCount ?? 0),
    added: Date.parse(raw.createdAt) || 0,
    featured: Boolean(raw.isFeatured ?? raw.featured),
    saleEnd: Date.parse(raw.saleEndsAt ?? raw.flashSaleEndsAt) || 0,
    storeSlug: raw.storeSlug ?? raw.store?.slug,
  };
}

export async function mapCatalogProducts(
  rows: Parameters<typeof mapCatalogProduct>[0][],
  categories: { id: string; name: string }[] = []
): Promise<CatalogItem[]> {
  const namesById = new Map<string, string>(
    categories.map((category) => [String(category.id), String(category.name)])
  );
  // Live products usually belong to child categories. Resolve each distinct
  // category once, following parents so every merchandising row uses departments.
  const categoryNames = new Map<string, Promise<string>>();
  const resolveDepartment = (
    id: string,
    ancestors: string[] = []
  ): Promise<string> => {
    if (!id || ancestors.includes(id)) return Promise.resolve('');
    const known = namesById.get(id);
    if (known) return Promise.resolve(known);
    const cached = categoryNames.get(id);
    if (cached) return cached;
    const request = categoryApi
      .getCategoryById(id)
      .then(async (response) => {
        const category = response?.data;
        if (!category) return '';
        return category.parentId
          ? resolveDepartment(String(category.parentId), [...ancestors, id])
          : String(category.name ?? '');
      })
      .catch(() => '');
    categoryNames.set(id, request);
    return request;
  };
  return Promise.all(
    rows.map(async (raw) =>
      mapCatalogProduct(
        raw,
        await resolveDepartment(
          String(raw.categoryId ?? raw.category?.id ?? '')
        )
      )
    )
  );
}

export function useMarketplaceCatalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [response, categoryResponse] = await Promise.all([
          productApi.getAllProducts({
            status: 'active',
            limit: 100,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            skipAuth: true,
          }),
          categoryApi.getCategories({ limit: 100 }),
        ]);
        // API product and category payloads are not typed by the shared client yet.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const categoryRows: any[] = Array.isArray(categoryResponse?.data)
          ? categoryResponse.data
          : (categoryResponse?.data?.data ??
            categoryResponse?.data?.categories ??
            []);
        const data = response?.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows: any[] = Array.isArray(data)
          ? data
          : (data?.data ?? data?.products ?? data?.docs ?? []);
        const catalog = await mapCatalogProducts(rows, categoryRows);
        if (!active) return;
        setItems(catalog);
        setState('ready');
      } catch {
        if (active) setState('error');
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);
  return { items, state };
}
