'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { categoryApi } from '@/lib/api';
import fashion from '../assets/fashion.png';
import electronics from '../assets/Electronics.png';
import bags from '../assets/beg.png';
import footwear from '../assets/footwear.png';
import groceries from '../assets/Groceries.png';
import beauty from '../assets/Beauty.png';
import wellness from '../assets/wellness.png';
import jewellery from '../assets/jewellery.png';

const categoryAssetMap: Record<string, any> = {
  'fashion': fashion,
  'electronics': electronics,
  'bags & luggage': bags,
  'bags': bags,
  'footwear': footwear,
  'groceries': groceries,
  'beauty': beauty,
  'wellness': wellness,
  'jewellery': jewellery,
};

const bgClasses = [
  'bg-white',
  'bg-orange-50',
  'bg-pink-50',
  'bg-blue-50',
  'bg-purple-50',
  'bg-teal-50',
  'bg-violet-50',
  'bg-[#f3ecfc]',
  'bg-green-50',
  'bg-yellow-50',
  'bg-red-50',
  'bg-cyan-50',
  'bg-indigo-50',
];

const CategoriesGrid = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const activeSlug = String(params?.slug || '').toLowerCase();
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
          .map((item: any, index: number) => {
            const name = item.name || item.title || item.displayName || 'Unknown';
            const slug = (item.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            const fallbackIcon = categoryAssetMap[name.toLowerCase()] || categoryAssetMap[slug] || fashion;
            const icon = item.imageUrl || item.image || fallbackIcon;

            return {
              id: String(item.id || item._id || item.categoryId || item.uuid),
              name,
              slug,
              icon,
              bg: bgClasses[index % bgClasses.length],
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
    <div className="flex flex-col w-full">
      <h3 className="font-bold text-gray-800 text-[15px] px-1.5 mb-4 uppercase tracking-wider">
        Categories
      </h3>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-96 pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 border border-gray-100 animate-pulse h-12 w-full">
              <div className="w-8 h-8 rounded bg-gray-200" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          ))
        ) : categories.length > 0 ? (
          categories.map((category) => {
            const isStaticImage = typeof category.icon !== 'string';
            const isSelected = category.slug === activeSlug || category.name.toLowerCase() === activeSlug;
            return (
              <Link
                key={category.id}
                ref={isSelected ? activeRef : undefined}
                href={`/categories/${category.slug}${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-300 border text-gray-800 ${
                  isSelected 
                    ? 'border-[#9d4ae3] bg-gradient-to-r from-[#f3ecfc] to-[#f5eeff] shadow-sm font-bold scale-[1.02]' 
                    : 'bg-white border-gray-100 hover:border-[#f3ecfc] hover:bg-[#f3ecfc]/25 hover:shadow-sm'
                }`}
              >
                <div
                  className={`
                    w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                    ${category.bg}
                    transition-all duration-300
                  `}
                >
                  {isStaticImage ? (
                    <Image
                      src={category.icon}
                      alt={category.name}
                      width={22}
                      height={22}
                      className="transition-transform duration-300 object-contain"
                    />
                  ) : (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-7 h-7 transition-transform duration-300 object-contain rounded-md"
                    />
                  )}
                </div>

                <p className={`text-xs font-semibold transition-colors ${isSelected ? 'text-[#9d4ae3]' : 'text-gray-700 hover:text-[#9d4ae3]'}`}>
                  {category.name}
                </p>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-4 text-xs text-gray-400">No categories found</div>
        )}
      </div>
    </div>
  );
};

export default CategoriesGrid;
