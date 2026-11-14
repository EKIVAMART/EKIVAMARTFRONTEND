import { Suspense, type ReactNode } from 'react';
import HomeMerchandising from './HomeMerchandising';

async function firstBatch(offers: boolean) {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'https://faflora-staging.onrender.com/api/v1').replace(/\/$/, '');
  const url = new URL(`${base}/products`);
  url.search = new URLSearchParams({ status: 'active', page: '1', limit: offers ? '10' : '20', sortBy: offers ? 'discount' : 'createdAt', sortOrder: 'desc', ...(offers ? { minDiscount: '1' } : {}) }).toString();
  try {
    const response = await fetch(url, { next: { revalidate: 60 }, signal: AbortSignal.timeout(1500) });
    if (!response.ok) return undefined;
    const body = await response.json();
    if (body.success === false) return undefined;
    const data = body.data;
    const rows = Array.isArray(data) ? data : data?.data ?? data?.products ?? data?.docs;
    return Array.isArray(rows) ? rows : undefined;
  } catch { return undefined; }
}
async function LoadedProducts({ children }: { children: ReactNode }) {
  const [products, offers] = await Promise.all([firstBatch(false), firstBatch(true)]);
  return <HomeMerchandising initial={{ products, offers }}>{children}</HomeMerchandising>;
}
export default function HomeProducts({ children }: { children: ReactNode }) {
  return <Suspense fallback={<HomeMerchandising enabled={false}>{children}</HomeMerchandising>}>
    <LoadedProducts>{children}</LoadedProducts>
  </Suspense>;
}
