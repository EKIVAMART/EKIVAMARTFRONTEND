'use client';
import { useEffect, useState } from 'react';
import { mapCatalogProduct, type CatalogItem, type RawCatalogProduct } from '@/lib/catalog-product';
import { cachedValue, seedCache, saveCache, getProducts, enrichProducts, mergeProducts } from '@/lib/catalog-cache';
export { mapCatalogProduct, type CatalogItem, type RawCatalogProduct } from '@/lib/catalog-product';
export { enrichProducts as mapCatalogProducts } from '@/lib/catalog-cache';

export function useMarketplaceCatalog(initial?: RawCatalogProduct[], enabled = true) {
  const [items, setItems] = useState<CatalogItem[]>(() => cachedValue<CatalogItem[]>('catalog') ?? initial?.map(row => mapCatalogProduct(row)) ?? []);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(() => items.length ? 'ready' : 'loading');
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    if (initial) seedCache('products:false:1:20', initial);
    async function load() {
      try {
        const first = await getProducts();
        if (!active) return;
        let all = first;
        const publish = () => {
          const mapped = all.map(row => mapCatalogProduct(row));
          if (active) { setItems(current => mergeProducts(current, mapped)); setState('ready'); }
          return mapped;
        };
        publish();
        if (first.length === 20) {
          for (let page = 2; page <= 5; page++) {
            if (!active) return;
            const next = await getProducts(false, page).catch(() => []);
            all = [...all, ...next];
            publish();
            if (next.length < 20) break;
          }
        }
        const enriched = await enrichProducts(all);
        const unique = mergeProducts([], enriched);
        saveCache('catalog', unique);
        if (active) setItems(unique);
      } catch {
        if (active) setState(current => current === 'ready' ? 'ready' : 'error');
      }
    }
    void load();
    return () => { active = false; };
  }, [initial, enabled]);
  return { items, state };
}
