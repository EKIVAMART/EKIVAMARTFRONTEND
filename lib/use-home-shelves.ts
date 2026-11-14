'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { productApi } from '@/lib/api';
import { departmentSlug, homepageDepartments } from '@/lib/data/departments';
import { mapCatalogProduct, type CatalogItem, type RawCatalogProduct } from '@/lib/catalog-product';
import { cachedRequest, cachedValue, seedCache, saveCache, catalogRows, getCategories, getProducts, enrichProducts } from '@/lib/catalog-cache';
export type CatalogShelf = { items: CatalogItem[]; state: 'loading' | 'ready' | 'error' };
const pendingShelf: CatalogShelf = { items: [], state: 'loading' };
export function useHomeShelves(initial?: RawCatalogProduct[], enabled = true) {
  const [offers, setOffers] = useState<CatalogShelf>(() => {
    const items = cachedValue<CatalogItem[]>('offers') ?? initial?.map(row => mapCatalogProduct(row));
    return items ? { items, state: 'ready' } : pendingShelf;
  });
  const [departments, setDepartments] = useState<Record<string, CatalogShelf>>(() => Object.fromEntries(homepageDepartments.map(([name]) => {
    const slug = departmentSlug(name);
    const items = cachedValue<CatalogItem[]>(`department:${slug}`);
    return [slug, items ? { items, state: 'ready' } : pendingShelf];
  })));
  const active = useRef(false);
  const loading = useRef(new Set<string>());
  useEffect(() => {
    active.current = enabled;
    if (!enabled) return;
    let cancelled = false;
    const requests = loading.current;
    if (initial) seedCache('products:true:1:10', initial);
    async function load() {
      try {
        let rows = await getProducts(true);
        if (cancelled) return;
        setOffers({ items: rows.map(row => mapCatalogProduct(row)), state: 'ready' });
        if (rows.length === 10) rows = await getProducts(true, 1, 100).catch(() => rows);
        if (cancelled) return;
        setOffers({ items: rows.map(row => mapCatalogProduct(row)), state: 'ready' });
        const items = await enrichProducts(rows);
        saveCache('offers', items);
        if (!cancelled) setOffers({ items, state: 'ready' });
      } catch {
        if (!cancelled) setOffers(current => current.items.length ? current : { items: [], state: 'error' });
      }
    }
    void load();
    return () => { cancelled = true; active.current = false; requests.clear(); };
  }, [initial, enabled]);
  const loadDepartment = useCallback(async (slug: string) => {
    if (!active.current || loading.current.has(slug)) return;
    loading.current.add(slug);
    try {
      const items = await cachedRequest(`department:${slug}`, async () => {
        const categories = await getCategories();
        const category = categories.find(category => [category.slug, category.name].some(value => typeof value === 'string' && departmentSlug(value) === slug));
        if (!category) return [];
        const name = homepageDepartments.find(([name]) => departmentSlug(name) === slug)?.[0] ?? '';
        const response = await productApi.getAllProducts({ categoryId: category.id, status: 'active', limit: 10, sortBy: 'createdAt', sortOrder: 'desc', skipAuth: true });
        return catalogRows(response).map(row => mapCatalogProduct(row, name));
      });
      if (active.current) setDepartments(current => ({ ...current, [slug]: { items, state: 'ready' } }));
    } catch {
      if (active.current) setDepartments(current => ({ ...current, [slug]: current[slug].items.length ? current[slug] : { items: [], state: 'error' } }));
      loading.current.delete(slug);
    }
  }, []);
  return { offers, departments, loadDepartment };
}
