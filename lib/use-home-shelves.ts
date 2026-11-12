'use client';

import { useEffect, useState } from 'react';
import { categoryApi, productApi } from '@/lib/api';
import { departmentSlug, homepageDepartments } from '@/lib/data/departments';
import {
  mapCatalogProduct,
  mapCatalogProducts,
  type CatalogItem,
} from '@/lib/use-marketplace-catalog';

export type CatalogShelf = {
  items: CatalogItem[];
  state: 'loading' | 'ready' | 'error';
};

const pendingShelf: CatalogShelf = { items: [], state: 'loading' };

// Support the list envelopes used by the shared API client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rows(response: any): any[] {
  if (!response || response.success === false)
    throw new Error('Catalogue unavailable');
  const data = response.data;
  const list = Array.isArray(data)
    ? data
    : (data?.data ?? data?.products ?? data?.categories);
  if (!Array.isArray(list)) throw new Error('Invalid catalogue response');
  return list;
}

export function useHomeShelves() {
  const [offers, setOffers] = useState<CatalogShelf>(pendingShelf);
  const [departments, setDepartments] = useState<Record<string, CatalogShelf>>(
    () =>
      Object.fromEntries(
        homepageDepartments.map(([name]) => [
          departmentSlug(name),
          pendingShelf,
        ])
      )
  );

  useEffect(() => {
    let active = true;
    const update = (slug: string, shelf: CatalogShelf) => {
      if (active) setDepartments((current) => ({ ...current, [slug]: shelf }));
    };

    // Query discounts across the full catalogue, not just the newest page.
    void productApi
      .getAllProducts({
        status: 'active',
        minDiscount: 1,
        sortBy: 'discount',
        sortOrder: 'desc',
        limit: 100,
        skipAuth: true,
      })
      .then(async (response) => {
        const items = await mapCatalogProducts(rows(response));
        if (active) setOffers({ items, state: 'ready' });
      })
      .catch(() => {
        if (active) setOffers({ items: [], state: 'error' });
      });

    void categoryApi
      .getCategories({ limit: 100 })
      .then(async (response) => {
        const categories = rows(response);
        await Promise.all(
          homepageDepartments.map(async ([name]) => {
            const slug = departmentSlug(name);
            const category = categories.find((category) =>
              [category.slug, category.name].some(
                (value) =>
                  typeof value === 'string' && departmentSlug(value) === slug
              )
            );
            if (!category) {
              update(slug, { items: [], state: 'ready' });
              return;
            }
            try {
              // The API includes descendants when filtering by a parent category.
              const response = await productApi.getAllProducts({
                categoryId: category.id,
                status: 'active',
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'desc',
                skipAuth: true,
              });
              update(slug, {
                items: rows(response).map((product) => ({
                  ...mapCatalogProduct(product),
                  categoryName: name,
                })),
                state: 'ready',
              });
            } catch {
              update(slug, { items: [], state: 'error' });
            }
          })
        );
      })
      .catch(() => {
        for (const [name] of homepageDepartments)
          update(departmentSlug(name), { items: [], state: 'error' });
      });

    return () => {
      active = false;
    };
  }, []);

  return { offers, departments };
}
