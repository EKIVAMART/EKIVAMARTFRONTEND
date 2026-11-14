'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { CatalogShelf } from '@/lib/use-home-shelves';
import { departmentSlug, homepageDepartments } from '@/lib/data/departments';
import CategoryRail from './CategoryRail';
import ProductCard from './ProductCard';
import ProductRowSkeleton from './ProductRowSkeleton';

export default function DepartmentShelves({
  shelves, loadDepartment, enabled = true,
}: {
  shelves: Record<string, CatalogShelf>;
  loadDepartment: (slug: string) => Promise<void>;
  enabled?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled || !container.current) return;
    const sections = Array.from(container.current.children);
    const load = (element: Element) => {
      const index = sections.indexOf(element);
      if (index >= 0) void loadDepartment(departmentSlug(homepageDepartments[index][0]));
    };
    if (!('IntersectionObserver' in window)) { sections.forEach(load); return; }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { load(entry.target); observer.unobserve(entry.target); }
      });
    }, { rootMargin: '800px 0px' });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [loadDepartment, enabled]);
  return (
    <div ref={container} style={{ display: 'contents' }}>
      {homepageDepartments.map(([name, caption]) => {
        const slug = departmentSlug(name);
        const href = `/categories/${slug}`;
        const { items: products, state } = shelves[slug];
        return (
          <CategoryRail
            key={slug}
            title={name}
            products
            loading={state === 'loading' && !products.length}
            href={href}
            linkLabel="View all"
            caption={
              <Link href={href} className="ek-department-caption">
                <Image
                  src={`/images/departments/${slug}.webp`}
                  alt=""
                  width={64}
                  height={64}
                />
                <span>{caption}</span>
              </Link>
            }
          >
            {products.length ? (
              products.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))
            ) : state === 'loading' ? (
              <ProductRowSkeleton />
            ) : (
              <p role="status">
                {state === 'error'
                    ? 'Products are temporarily unavailable. '
                    : 'New products are on their way. '}
                <Link href={href}>Explore {name.toLowerCase()}</Link>
              </p>
            )}
          </CategoryRail>
        );
      })}
    </div>
  );
}
