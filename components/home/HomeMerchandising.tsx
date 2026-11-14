'use client';

import type { RawCatalogProduct } from '@/lib/catalog-product';
import { useEffect, useState, type ReactNode } from 'react';
import {
  useMarketplaceCatalog,
  type CatalogItem,
} from '@/lib/use-marketplace-catalog';
import { fetchWishlist } from '@/lib/features/wishlist/wishlistSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import MarketplaceRail from './CategoryRail';
import Link from 'next/link';
import Image from 'next/image';
import {
  departmentSlug,
  departments,
  homepageDepartments,
} from '@/lib/data/departments';
import ProductCard from './ProductCard';
import ProductRowSkeleton from './ProductRowSkeleton';
import DepartmentShelves from './DepartmentShelves';
import { useHomeShelves } from '@/lib/use-home-shelves';

function Shelf({
  title,
  items,
  empty,
  id,
  children,
  href,
  loading = false,
}: {
  title: string;
  items: CatalogItem[];
  empty: ReactNode;
  id?: string;
  children?: ReactNode;
  href?: string;
  loading?: boolean;
}) {
  return (
    <MarketplaceRail
      title={title}
      products
      loading={loading && !items.length}
      id={id}
      caption={children}
      href={href}
      linkLabel={href ? 'View category' : 'Shop all products'}
    >
      {items.length ? (
        items
          .slice(0, 10)
          .map((item) => <ProductCard key={item.id} product={item} />)
      ) : loading ? (
        <ProductRowSkeleton />
      ) : (
        <p>{empty}</p>
      )}
    </MarketplaceRail>
  );
}

function SaleClock({ end }: { end: number }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(clock);
  }, []);
  const seconds = Math.max(0, Math.floor((end - now) / 1000));
  const time = [
    Math.floor(seconds / 3600),
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ];
  return (
    <p className="mb-3 text-sm tabular-nums text-stone-600">
      {seconds
        ? `Next offer ends in ${time.map((n) => String(n).padStart(2, '0')).join(':')}`
        : 'Offer ended'}
    </p>
  );
}

export default function HomeMerchandising({
  children, initial, enabled = true,
}: {
  children: ReactNode;
  initial?: { products?: RawCatalogProduct[]; offers?: RawCatalogProduct[] };
  enabled?: boolean;
}) {
  const saved = useAppSelector((state) => state.wishlist.items);
  const signedIn = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (enabled && signedIn) dispatch(fetchWishlist());
  }, [signedIn, dispatch, enabled]);
  const { items, state } = useMarketplaceCatalog(initial?.products, enabled);
  const { offers: offerCatalog, departments: departmentShelves, loadDepartment } =
    useHomeShelves(initial?.offers, enabled);
  const [saleTime, setSaleTime] = useState(Date.now);
  useEffect(() => {
    const nextEnd = Math.min(
      ...offerCatalog.items
        .map((p) => p.saleEnd)
        .filter((end) => end > saleTime)
    );
    if (!Number.isFinite(nextEnd)) return;
    const timeout = window.setTimeout(
      () => setSaleTime(Date.now()),
      Math.min(2147483647, Math.max(1, nextEnd - Date.now()))
    );
    return () => window.clearTimeout(timeout);
  }, [offerCatalog.items, saleTime]);
  const offers = offerCatalog.items
    .filter((p) => p.discountPercent && (!p.saleEnd || p.saleEnd > saleTime))
    .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
  const end = Math.min(
    ...offers
      .slice(0, 10)
      .filter((p) => p.saleEnd)
      .map((p) => p.saleEnd)
  );
  const offerMessage =
    offerCatalog.state === 'ready' ? (
      'Check back for new offers.'
    ) : (
      <span role="status">
        {offerCatalog.state === 'loading'
          ? 'Loading marketplace offers…'
          : 'Marketplace offers are temporarily unavailable.'}
      </span>
    );
  const offerShelf = (
    <Shelf
      id="special-offers"
      title="Flash sales & special offers"
      items={offers}
      loading={offerCatalog.state === 'loading'}
      empty={offerMessage}
    >
      {Number.isFinite(end) && <SaleClock end={end} />}
    </Shelf>
  );
  const catalogError = state === 'error' ? 'Products are temporarily unavailable.' : null;
  const newest = [...items].sort((a, b) => b.added - a.added);
  const popular = [...items].sort(
    (a, b) => b.sold - a.sold || b.reviewCount - a.reviewCount
  );
  const seen = new Set<string>();
  const featured = [...items]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .filter((p) => {
      const key = p.categoryKey + '|' + p.storeName;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const interests = new Set(
    items
      .filter((p) => signedIn && saved.includes(p.id))
      .map((p) => p.categoryKey)
      .filter(Boolean)
  );
  const related = popular.filter(
    (p) => interests.has(p.categoryKey) && !saved.includes(p.id)
  );
  const byDepartment = new Map<string, CatalogItem[]>();
  for (const item of items) {
    const slug = departmentSlug(item.categoryName);
    if (!slug) continue;
    const group = byDepartment.get(slug) ?? [];
    group.push(item);
    byDepartment.set(slug, group);
  }
  const fixedDepartments = new Set(
    homepageDepartments.map(([name]) => departmentSlug(name))
  );
  const stocked = departments.filter(
    (name) =>
      !fixedDepartments.has(departmentSlug(name)) &&
      byDepartment.has(departmentSlug(name))
  );
  const rotation =
    Math.floor(saleTime / 86400000) % Math.max(1, stocked.length);
  const spotlight = [
    ...stocked.slice(rotation),
    ...stocked.slice(0, rotation),
  ].slice(0, 5);
  const saleDepartments = departments.filter((name) =>
    offers.some(
      (product) => departmentSlug(product.categoryName) === departmentSlug(name)
    )
  );
  return (
    <>
      {offerShelf}
      <Shelf
        title="Trending now"
        loading={state === 'loading'}
        items={popular}
        empty={catalogError ?? 'Popular products will appear here.'}
      />
      {children}
      <Shelf
        title="Featured products"
        loading={state === 'loading'}
        items={featured}
        empty={catalogError ?? 'Our next selection is on its way.'}
      />
      {spotlight.map((name) => {
        const slug = departmentSlug(name);
        return (
          <Shelf
            key={slug}
            title={name}
            href={`/categories/${slug}`}
            items={byDepartment.get(slug)!}
            empty=""
          />
        );
      })}
      <DepartmentShelves shelves={departmentShelves} loadDepartment={loadDepartment} enabled={enabled} />
      <Shelf
        title="New arrivals"
        loading={state === 'loading'}
        items={newest}
        empty={catalogError ?? 'New products will appear here.'}
      />
      <Shelf
        title="Recommended for you"
        loading={state === 'loading'}
        items={
          related.length
            ? related
            : featured.slice(4).concat(featured.slice(0, 4))
        }
        empty={catalogError ?? 'Explore the marketplace to discover more products.'}
      >
        <p className="ek-shelf-caption">
          {related.length
            ? 'Inspired by your wishlist.'
            : 'Discover more from across the marketplace.'}
        </p>
      </Shelf>
      {saleDepartments.length > 0 && (
        <MarketplaceRail
          products
          title="Shop the sale"
          href="/#special-offers"
          linkLabel="See special offers"
        >
          {saleDepartments.map((name) => {
            const slug = departmentSlug(name);
            const item = offers.find(
              (product) => departmentSlug(product.categoryName) === slug
            )!;
            return (
              <Link className="ek-sale-department" href={item.href!} key={slug}>
                <Image
                  src={item.image}
                  alt=""
                  width={160}
                  height={130}
                  sizes="160px"
                />
                <strong>{name}</strong>
                <span>
                  {item.name} · {item.discountPercent}% off
                </span>
              </Link>
            );
          })}
        </MarketplaceRail>
      )}
    </>
  );
}
