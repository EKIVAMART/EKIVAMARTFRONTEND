import { mapProduct } from '@/lib/data/landing-product';

export type RawCatalogProduct = Parameters<typeof mapProduct>[0];

export type CatalogItem = ReturnType<typeof mapProduct> & {
  categoryKey: string;
  categoryName: string;
  sold: number;
  added: number;
  featured: boolean;
  saleEnd: number;
  storeSlug?: string;
};

export function mapCatalogProduct(raw: RawCatalogProduct, categoryName = ''): CatalogItem {
  return {
    ...mapProduct(raw),
    categoryKey: String(
      raw.categoryId ??
        raw.category?.id ??
        raw.category?.name ??
        raw.category ??
        ''
    ),
    categoryName:
      categoryName ||
      raw.category?.name ||
      raw.categoryName ||
      (typeof raw.category === 'string' ? raw.category : ''),
    sold: Number(raw.unitsSold ?? raw.salesCount ?? 0),
    added: Date.parse(raw.createdAt) || 0,
    featured: Boolean(raw.isFeatured ?? raw.featured),
    saleEnd: Date.parse(raw.saleEndsAt ?? raw.flashSaleEndsAt) || 0,
    storeSlug: raw.storeSlug ?? raw.store?.slug,
  };
}
