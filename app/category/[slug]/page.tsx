import Link from 'next/link';
import ProductCard from '../../../components/ProductCard';
import { productDummyData, categories as ASSET_CATEGORIES } from '../../../assets/assets';
import type { StaticImageData } from 'next/image';

type Rating = { id?: string; rating: number };
type Store = { name?: string } & Record<string, unknown>;

interface Product {
  id: string;
  name: string;
  description?: string;
  mrp?: number;
  price: number;
  images?: (string | StaticImageData)[];
  category?: string;
  storeId?: string;
  inStock?: boolean;
  store?: Store;
  rating?: Rating[] | number;
}

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

// groups for broad categories (map URL slug -> product categories)
const CATEGORY_GROUPS: Record<string, string[]> = {
  electronics: ['Speakers', 'Headphones', 'Earbuds', 'Camera', 'Mouse', 'Cleaner', 'Theater'],
  fashion: ['Watch', 'Decoration'],
  bags: ['Bags', 'Backpacks'],
  footwear: ['Footwear', 'Shoes', 'Slippers'],
  groceries: ['Groceries', 'Fruits', 'Vegetables'],
  beauty: ['Beauty', 'Skincare', 'Makeup'],
};

function averageRating(ratings: Rating[] | number | undefined): number {
  if (!ratings) return 0;
  if (Array.isArray(ratings) && ratings.length > 0) {
    const nums = (ratings as Rating[]).map((r) => (typeof r.rating === 'number' ? r.rating : 0));
    return +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
  }
  if (typeof ratings === 'number') return ratings;
  return 0;
}

export default async function CategoryPage({ params }: Props) {
  const resolved = await params;
  const slug = String(resolved?.slug || '').toLowerCase();

  // try to find a matching category from asset categories (case-insensitive)
  const ASSET_CATEGORIES_LIST = (ASSET_CATEGORIES as string[]) || [];
  const matchedAssetCategory = ASSET_CATEGORIES_LIST.find((c) => c.toLowerCase() === slug);
  const active = matchedAssetCategory || slug || 'Decoration';

  // determine which product categories to include
  const group = CATEGORY_GROUPS[slug] || [];

  const products: Product[] = (productDummyData as Product[]).filter((p) => {
    if (!p || !p.category) return false;
    const cat = String(p.category).toLowerCase();
    if (cat === slug) return true;
    if (group.length > 0) return group.map((g) => g.toLowerCase()).includes(cat);
    // fallback: include if slug is substring of category or vice-versa
    return cat.includes(slug) || slug.includes(cat);
  });

  return (
    <main className="py-6 sm:py-8">
      <div className="mx-auto w-[90%]">
        <div className="rounded-2xl bg-emerald-50 p-5 sm:p-6 mb-5 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 capitalize">{active}</h1>
          <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="capitalize font-medium">{active}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Left sidebar - hidden on mobile */}
          <aside className="hidden md:block md:col-span-1">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-6">
              <h3 className="font-semibold mb-3 text-gray-500">Category</h3>
              <div className="category-scroll">
                <ul className="space-y-2">
                  {ASSET_CATEGORIES_LIST.map((c: string, idx: number) => {
                    const slugC = String(c).toLowerCase().replace(/\s+/g, '-');
                    const isActive = String(c).toLowerCase() === String(active).toLowerCase();
                    return (
                      <li key={c}>
                           <Link
                             href={`/category/${slugC}`}
                             className={`${isActive ? 'active ' : ''}category-item block w-full px-3 py-3 rounded-lg text-sm transition-transform duration-300 ease-out ${isActive ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:text-emerald-700'}`}
                             style={{ animationDelay: `${idx * 40}ms` }}
                           >
                          <span className="capitalize">{c}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <section className="md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">We found <span className="text-emerald-600 font-semibold">{products.length}</span> items for you!</div>
              <div className="flex items-center gap-3">
                <button className="text-sm text-gray-600 hover:text-emerald-600">Filters</button>
                <button className="text-sm text-gray-600 hover:text-emerald-600">Sort</button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.length > 0 ? (
                products.map((p: Product) => (
                  <div key={p.id} className="w-full">
                    <ProductCard
                      image={p.images?.[0] ?? '/placeholder.png'}
                      category={p.category}
                      title={p.name}
                      price={p.price}
                      originalPrice={p.mrp}
                      rating={averageRating(p.rating)}
                      author={p.store?.name ?? p.storeId}
                      href={`/product/${p.id}`}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white p-8 rounded-lg shadow text-center text-gray-600">
                  No products found for this category yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
