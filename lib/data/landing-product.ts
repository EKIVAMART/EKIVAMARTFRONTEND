import type { LandingProduct } from '@/components/home/ProductCard';

export function mapProduct(raw: any): LandingProduct {
  const primaryImg =
    raw.images?.find((img: any) => img.isPrimary)?.url ||
    raw.images?.[0]?.url ||
    raw.preview ||
    '/images/product_cover_image.png';

  const priceVal = raw.price?.amount ?? raw.price ?? 0;
  const compareAt = raw.compareAtPrice?.amount ?? raw.compareAtPrice ?? raw.mrp;
  const discountPct =
    raw.discount ??
    (compareAt && compareAt > priceVal
      ? Math.round(((compareAt - priceVal) / compareAt) * 100)
      : undefined);

  const locObj = raw.location;
  const locationStr =
    typeof locObj === 'object' && locObj !== null
      ? [locObj.town, locObj.lga, locObj.state].filter(Boolean).join(', ') ||
        'Nigeria'
      : typeof locObj === 'string'
        ? locObj
        : 'Nigeria';

  return {
    id: String(raw.id || raw._id || ''),
    name: raw.name || 'Product',
    image: primaryImg,
    price: typeof priceVal === 'number' ? priceVal : 0,
    compareAtPrice: typeof compareAt === 'number' ? compareAt : undefined,
    discountPercent:
      typeof discountPct === 'number' && discountPct > 0
        ? discountPct
        : undefined,
    rating: Number(raw.ratingAverage ?? raw.averageRating ?? (typeof raw.rating === 'number' ? raw.rating : 0)),
    reviewCount: Number(raw.reviewCount ?? raw.ratingCount ?? (Array.isArray(raw.rating) ? raw.rating.length : 0)),
    location: locationStr,
    vendor:
      raw.storeName || raw.store?.name || raw.vendor?.name || '',
    storeName:
      raw.storeName || raw.store?.name || raw.vendor?.name || '',
    href: `/products/${raw.id || raw._id}`,
  };
}
