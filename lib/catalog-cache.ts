import { categoryApi, productApi } from '@/lib/api';
import { mapCatalogProduct, type CatalogItem, type RawCatalogProduct } from '@/lib/catalog-product';

type Entry<T> = { value?: T; updated: number; pending?: Promise<T> };
const entries = new Map<string, Entry<unknown>>();
const ttl = 60_000;
export function cachedValue<T>(key: string): T | undefined {
  return entries.get(key)?.value as T | undefined;
}
export function saveCache<T>(key: string, value: T) {
  entries.set(key, { value, updated: Date.now() });
}
export function seedCache<T>(key: string, value: T) {
  if (!entries.has(key)) entries.set(key, { value, updated: Date.now() });
}
export function cachedRequest<T>(key: string, load: () => Promise<T>): Promise<T> {
  const entry = (entries.get(key) ?? { updated: 0 }) as Entry<T>;
  if (entry.pending) return entry.pending;
  if (entry.value !== undefined && Date.now() - entry.updated < ttl) return Promise.resolve(entry.value);
  entries.set(key, entry);
  entry.pending = load().then(value => {
    entry.value = value;
    entry.updated = Date.now();
    return value;
  }).finally(() => { entry.pending = undefined; });
  return entry.pending;
}
export function catalogRows(response: Awaited<ReturnType<typeof productApi.getAllProducts>>): RawCatalogProduct[] {
  if (!response || response.success === false) throw new Error('Catalogue unavailable');
  const data = response.data;
  const rows = Array.isArray(data) ? data : data?.data ?? data?.products ?? data?.categories ?? data?.docs;
  if (!Array.isArray(rows)) throw new Error('Invalid catalogue response');
  return rows;
}
export const getCategories = () => cachedRequest('categories', async () => catalogRows(await categoryApi.getCategories({ limit: 100 })));
export const getProducts = (offers = false, page = 1, limit = offers ? 10 : 20) => cachedRequest(
  `products:${offers}:${page}:${limit}`,
  async () => catalogRows(await productApi.getAllProducts({ status: 'active', limit, page, sortBy: offers ? 'discount' : 'createdAt', sortOrder: 'desc', skipAuth: true, ...(offers ? { minDiscount: 1 } : {}) }))
);
export async function enrichProducts(rows: RawCatalogProduct[], categories?: RawCatalogProduct[]): Promise<CatalogItem[]> {
  const known = categories ?? await getCategories().catch(() => []);
  const byId = new Map(known.map(category => [String(category.id), category]));
  async function resolve(id: string, ancestors: string[] = []): Promise<string> {
    if (!id || ancestors.includes(id)) return '';
    const category = byId.get(id) ?? await cachedRequest(`category:${id}`, async () => (await categoryApi.getCategoryById(id))?.data).catch(() => null);
    if (!category) return '';
    return category.parentId ? resolve(String(category.parentId), [...ancestors, id]) : String(category.name ?? '');
  }
  return Promise.all(rows.map(async row => mapCatalogProduct(row, await resolve(String(row.categoryId ?? row.category?.id ?? '')))));
}
export function mergeProducts(current: CatalogItem[], incoming: CatalogItem[]) {
  return [...new Map([...current, ...incoming].map(item => [item.id, item])).values()];
}
