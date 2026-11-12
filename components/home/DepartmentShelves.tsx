'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CatalogItem } from '@/lib/use-marketplace-catalog';
import { departmentSlug } from '@/lib/data/departments';
import CategoryRail from './CategoryRail';
import ProductCard from './ProductCard';

const selections = [
  ['Fashion', 'Find your next everyday favourite.'],
  ['Footwear', 'Step into something new.'],
  ['Bags & Luggage', 'For everyday plans and journeys ahead.'],
  ['Jewelry & Fashion Accessories', 'The details that complete your look.'],
  ['Beauty & Cosmetics', 'Refresh your beauty routine.'],
  ['Groceries & Food', 'Stock up on everyday essentials.'],
  ['Home Appliances', 'Make more of life at home.'],
];

export default function DepartmentShelves({ items }: { items: CatalogItem[] }) {
  return <>{selections.map(([name, caption]) => {
    const slug = departmentSlug(name);
    const href = `/categories/${slug}`;
    const products = items.filter(item => departmentSlug(item.categoryName) === slug).slice(0, 10);
    return <CategoryRail key={slug} title={name} products href={href} linkLabel="View all" caption={
      <Link href={href} className="ek-department-caption"><Image src={`/images/departments/${slug}.webp`} alt="" width={64} height={64} /><span>{caption}</span></Link>
    }>
      {products.length ? products.map(item => <ProductCard key={item.id} product={item} />) :
        <p>New products are on their way. <Link href={href}>Explore {name.toLowerCase()}</Link></p>}
    </CategoryRail>;
  })}</>;
}
