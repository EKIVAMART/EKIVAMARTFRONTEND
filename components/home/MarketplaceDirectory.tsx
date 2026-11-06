'use client';

import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';
import { useMarketplaceCatalog, type CatalogItem } from '@/lib/use-marketplace-catalog';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price);

export default function MarketplaceDirectory() {
  const { items, state } = useMarketplaceCatalog();

  if (state === 'loading') {
    return <section className="ek-stores-content" aria-label="Featured stores">
      <div className="ek-stores-section-heading"><div><span className="ek-guide-eyebrow">Explore the marketplace</span><h2>Stores to discover</h2></div></div>
      <p className="ek-stores-status" role="status">Loading featured stores…</p>
    </section>;
  }

  if (state === 'error') {
    return <section className="ek-stores-content" aria-label="Featured stores">
      <p className="ek-stores-status" role="status">Stores could not be loaded right now. Please try again shortly.</p>
    </section>;
  }

  const grouped = new Map<string, CatalogItem[]>();
  for (const item of items) {
    if (!item.storeName) continue;
    const key = item.storeSlug || item.storeName;
    const products = grouped.get(key) ?? [];
    products.push(item);
    grouped.set(key, products);
  }
  const stores = Array.from(grouped, ([key, products]) => ({ key, products }));

  return <div className="ek-stores-content">
    <section aria-labelledby="stores-list-title">
      <div className="ek-stores-section-heading">
        <div>
          <span className="ek-guide-eyebrow">Explore the marketplace</span>
          <h2 id="stores-list-title">Stores to discover</h2>
          <p>Get to know a storefront through a few of its products, then visit the store to explore more.</p>
        </div>
        {stores.length > 0 && <span className="ek-stores-count">{stores.length} {stores.length === 1 ? 'store' : 'stores'} in this collection</span>}
      </div>

      {stores.length ? <div className={`ek-store-directory ${stores.length === 1 ? 'ek-store-directory-single' : ''}`}>
        {stores.map(({ key, products }) => {
          const storeName = products[0].storeName;
          const storeSlug = products[0].storeSlug;
          const storeHref = storeSlug ? `/stores/${encodeURIComponent(storeSlug)}` : null;
          return <article className="ek-store-card" key={key}>
            <div className="ek-store-card-heading">
              <span className="ek-store-avatar" aria-hidden="true"><Store size={26} strokeWidth={1.7} /></span>
              <div>
                <span className="ek-store-card-label">Independent storefront</span>
                <h3>{storeName}</h3>
                <p>{products.length} {products.length === 1 ? 'product' : 'products'} to preview</p>
              </div>
            </div>
            <div className="ek-store-samples" aria-label={`Products from ${storeName}`}>
              {products.slice(0, 3).map(product => <Link href={product.href || '/categories/shop'} key={product.id} className="ek-store-sample">
                {/* Product images may come from seller-provided URLs. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt="" width={180} height={180} loading="lazy" />
                <span className="ek-store-sample-name">{product.name}</span>
                <span className="ek-store-sample-price">{formatPrice(product.price)}</span>
              </Link>)}
            </div>
            {storeHref && <Link className="ek-store-visit" href={storeHref}>Visit {storeName}<ArrowRight size={17} aria-hidden="true" /></Link>}
          </article>;
        })}
      </div> : <div className="ek-stores-empty">
        <Store size={30} strokeWidth={1.5} aria-hidden="true" />
        <h3>More stores are on the way</h3>
        <p>There are no storefronts with products to feature yet. You can still browse the marketplace.</p>
        <Link href="/categories/shop">Browse products<ArrowRight size={16} aria-hidden="true" /></Link>
      </div>}
    </section>

    <section className="ek-stores-next" aria-labelledby="stores-next-title">
      <div>
        <span className="ek-guide-eyebrow">Keep exploring</span>
        <h2 id="stores-next-title">Looking for something specific?</h2>
        <p>Browse products by category, or read the shopping guide for help choosing a store and placing an order.</p>
      </div>
      <div className="ek-stores-next-links">
        <Link href="/categories/shop">Shop by category<ArrowRight size={16} aria-hidden="true" /></Link>
        <Link href="/why-ekivamart">How shopping works</Link>
      </div>
    </section>
  </div>;
}
