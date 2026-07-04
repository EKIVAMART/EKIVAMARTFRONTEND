'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/lib/hooks';
import VendorDashboardView, {
  VendorProduct,
} from '@/components/vendor/VendorDashboardView';
import { productDummyData } from '@/assets/assets';

const buildVendorProducts = (
  products: typeof productDummyData
): VendorProduct[] =>
  products.slice(0, 12).map((product, idx) => {
    const productImage = product.images?.[0];
    const image =
      typeof productImage === 'string'
        ? productImage
        : productImage &&
            typeof productImage === 'object' &&
            'src' in productImage
          ? String(productImage.src)
          : '';

    const status: VendorProduct['status'] = product.inStock
      ? idx % 5 === 0
        ? 'draft'
        : 'active'
      : 'out_of_stock';

    return {
      id: product.id || `prod-${idx}`,
      name: product.name || 'Untitled product',
      price: product.price || 0,
      stock: product.inStock
        ? product.inStock === true
          ? 28 - idx * 2
          : 0
        : 0,
      image,
      category: product.category || 'General',
      subCategory: idx % 2 === 0 ? 'Featured' : undefined,
      status,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: product.updatedAt || new Date().toISOString(),
    };
  });

const mockProducts = buildVendorProducts(productDummyData);
const dummyProducts = buildVendorProducts(productDummyData);

export default function VendorDashboardPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const isVendor = authUser?.role === 'VENDOR';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      {!isVendor && (
        <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-3 rounded-2xl border border-fuchsia-100 bg-linear-to-r from-fuchsia-50 to-violet-50 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-fuchsia-700">
              Mock vendor preview
            </p>
            <p className="text-sm text-slate-600">
              The dashboard is showing mock catalog data so you can review the
              layout immediately.
            </p>
          </div>
          <Link
            href="/become-a-vendor"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Become a vendor
          </Link>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl">
        <VendorDashboardView
          userName={authUser?.firstName || authUser?.email || 'Vendor Demo'}
          products={isVendor ? mockProducts : dummyProducts}
        />
      </div>
    </div>
  );
}
