'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { categoryApi } from '@/lib/api';
import { departments, departmentSlug } from '@/lib/data/departments';

const departmentNames = new Map(departments.map(name => [departmentSlug(name), name]));

const CategoriesGrid = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const activeSlug = departmentSlug(String(params?.slug || ''));
  const searchQuery = searchParams.get('search');

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Callback ref to scroll active category into view inside the scrollable sidebar
  const activeRef = React.useCallback((node: HTMLAnchorElement | null) => {
    if (node !== null) {
      node.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const res = await categoryApi.getCategories({ limit: 100 });
        let data: any[] = [];
        if (res?.data && Array.isArray(res.data)) {
          data = res.data;
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res?.data?.categories && Array.isArray(res.data.categories)) {
          data = res.data.categories;
        } else if (res?.data?.docs && Array.isArray(res.data.docs)) {
          data = res.data.docs;
        }

        const formatted = data
          .filter((item: any) => {
            const isPublished = Boolean(item.isActive ?? item.is_active ?? (item.status === 'published' || item.status === 'active'));
            const isDraft = item.status === 'draft';
            return isPublished && !isDraft && !item.parentId;
          })
          .map((item: any) => {
            const name = item.name || item.title || item.displayName || 'Unknown';
            const slug = departmentSlug(name);
            const displayName = departmentNames.get(slug);
            return {
              id: item.id || item._id || slug,
              name: displayName || name,
              slug,
              image: displayName ? `/images/departments/${slug}.webp` : item.imageUrl || item.image,
            };
          });

        if (isMounted) {
          setCategories(formatted);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch sidebar categories:', err);
        if (isMounted) setLoading(false);
      }
    };
    void fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <nav aria-label="Product categories" className="flex flex-col w-full">
      <h3 className="font-semibold text-stone-900 text-base mb-3">
        Categories
      </h3>
      <div className="flex flex-col gap-0.5 overflow-y-auto max-h-72 pr-1">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 border border-gray-100 animate-pulse h-12 w-full">
              <div className="w-8 h-8 rounded bg-gray-200" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          ))
        ) : categories.length > 0 ? (
          categories.map((category) => {
            const isSelected = category.slug === activeSlug;
            return (
              <Link
                key={category.id}
                ref={isSelected ? activeRef : undefined}
                href={`/categories/${category.slug}${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                aria-current={isSelected ? 'page' : undefined}
                className={`flex items-center gap-3 rounded px-2 py-1.5 text-sm leading-snug text-stone-800 focus-visible:outline-offset-[-2px] ${isSelected ? 'bg-stone-100 font-semibold' : 'font-medium hover:bg-stone-50'}`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded bg-stone-100">
                  {category.image ? (
                    <Image unoptimized src={category.image} alt="" width={44} height={44} className="h-full w-full object-contain" />
                  ) : (
                    <span aria-hidden="true">{category.name.charAt(0)}</span>
                  )}
                </div>
                {category.name}
              </Link>
            );
          })
        ) : (
          <div className="text-center py-4 text-xs text-gray-400">No categories found</div>
        )}
      </div>
    </nav>
  );
};

export default CategoriesGrid;