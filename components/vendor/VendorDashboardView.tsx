'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Box,
  Sparkles,
  ShoppingCart,
  ShieldCheck,
} from 'lucide-react';
import ProductTable from '@/components/super-admin/ProductTable';

export interface VendorProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  subCategory?: string;
  status:
    | 'draft'
    | 'active'
    | 'published'
    | 'inactive'
    | 'out_of_stock'
    | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

interface VendorDashboardViewProps {
  userName: string;
  products: VendorProduct[];
}

const statusTabs = [
  {
    id: 'all',
    label: 'All Products',
    statuses: [
      'draft',
      'active',
      'published',
      'inactive',
      'out_of_stock',
      'discontinued',
    ],
  },
  { id: 'active', label: 'Active', statuses: ['active', 'published'] },
  { id: 'draft', label: 'Drafts', statuses: ['draft'] },
  { id: 'out_of_stock', label: 'Out of Stock', statuses: ['out_of_stock'] },
];

const summaryCards = [
  {
    title: 'Active Listings',
    value: '24',
    icon: Box,
    accent: 'from-brand-500 to-brand-600',
    label: 'Live in store',
  },
  {
    title: 'Draft Products',
    value: '6',
    icon: Sparkles,
    accent: 'from-cyan-500 to-sky-600',
    label: 'Unpublished items',
  },
  {
    title: 'Pending Orders',
    value: '18',
    icon: ShoppingCart,
    accent: 'from-emerald-500 to-teal-600',
    label: 'New sales to review',
  },
  {
    title: 'Store Score',
    value: '4.9/5',
    icon: ShieldCheck,
    accent: 'from-amber-500 to-orange-500',
    label: 'Trusted vendor rating',
  },
];

const DashboardCard = ({
  title,
  value,
  label,
  Icon,
  accent,
}: {
  title: string;
  value: string;
  label: string;
  Icon: typeof Box;
  accent: string;
}) => (
  <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          {title}
        </p>
        <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          {value}
        </p>
      </div>
      <div
        className={`rounded-2xl bg-linear-to-br ${accent} p-3 text-white shadow-sm`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <p className="mt-5 text-sm text-slate-500">{label}</p>
  </div>
);

export default function VendorDashboardView({
  userName,
  products,
}: VendorDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeTabMeta =
    statusTabs.find((tab) => tab.id === activeTab) ?? statusTabs[0];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesTab = activeTabMeta.statuses.includes(product.status);
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [activeTabMeta, products, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: products.length,
      active: products.filter((product) =>
        ['active', 'published'].includes(product.status)
      ).length,
      draft: products.filter((product) => product.status === 'draft').length,
      out_of_stock: products.filter(
        (product) => product.status === 'out_of_stock'
      ).length,
    };
  }, [products]);

  const stats = useMemo(
    () => ({
      weeklySales: 42,
      revenue: 184500,
      conversion: 7.4,
      visitors: 1123,
    }),
    []
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-gray-100 bg-linear-to-r from-brand-50 via-brand-50 to-cyan-50 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
              Vendor dashboard
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">
              Welcome back, {userName}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Manage your catalog, inspect product performance, and keep your
              store growth on track. This page is mock-only for now, designed to
              match the admin dashboard polish.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Link
              href="/vendor/apply"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:shadow-md"
            >
              Add new product
              <Plus className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/vendor/application/status"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Application status
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[3fr_1.2fr]">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
          {summaryCards.map((card) => (
            <DashboardCard
              key={card.title}
              title={card.title}
              value={card.value}
              label={card.label}
              Icon={card.icon}
              accent={card.accent}
            />
          ))}
        </div>

        <div className="grid gap-5">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Performance snapshot
                </p>
                <h2 className="mt-3 text-2xl font-black text-slate-900">
                  Store momentum
                </h2>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                Approved Vendor
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Weekly sales
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {stats.weeklySales}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Orders created this week
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Revenue
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  ₦{stats.revenue.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Estimated store revenue
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Conversion rate
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {stats.conversion}%
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Clicks to completed purchase
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Store visitors
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {stats.visitors.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Unique shoppers this week
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Store summary
                </p>
                <h2 className="mt-3 text-2xl font-black text-slate-900">
                  {userName}&apos;s storefront
                </h2>
              </div>
              <ShoppingCart className="h-6 w-6 text-slate-400" />
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <p>
                Keep your product listings fresh to improve visibility in search
                and featured sections.
              </p>
              <p>
                Publish new items, update stock counts, and review draft product
                details before going live.
              </p>
              <p className="rounded-3xl bg-slate-100 p-4 text-slate-700">
                Tip: add at least 3 high-quality product photos and a complete
                category tag to improve buyer trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Product manager
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Manage your products
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-xl text-slate-500">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search product name or category"
                className="w-full rounded-3xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 rounded-3xl bg-white p-3 shadow-sm border border-gray-100">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              {tab.label}{' '}
              <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                {counts[tab.id as keyof typeof counts] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-6">
          <ProductTable
            data={filteredProducts}
            onEdit={() => undefined}
            onDelete={() => undefined}
            onView={() => undefined}
            onPublish={() => undefined}
            searchQuery={searchQuery}
            itemsPerPage={10}
          />
        </div>
      </section>
    </div>
  );
}
