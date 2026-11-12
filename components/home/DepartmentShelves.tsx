'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CatalogShelf } from '@/lib/use-home-shelves';
import { departmentSlug, homepageDepartments } from '@/lib/data/departments';
import CategoryRail from './CategoryRail';
import ProductCard from './ProductCard';

export default function DepartmentShelves({
  shelves,
}: {
  shelves: Record<string, CatalogShelf>;
}) {
  return (
    <>
      {homepageDepartments.map(([name, caption]) => {
        const slug = departmentSlug(name);
        const href = `/categories/${slug}`;
        const { items: products, state } = shelves[slug];
        return (
          <CategoryRail
            key={slug}
            title={name}
            products
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
            ) : (
              <p role="status">
                {state === 'loading'
                  ? 'Loading products…'
                  : state === 'error'
                    ? 'Products are temporarily unavailable. '
                    : 'New products are on their way. '}
                {state !== 'loading' && (
                  <Link href={href}>Explore {name.toLowerCase()}</Link>
                )}
              </p>
            )}
          </CategoryRail>
        );
      })}
    </>
  );
}
