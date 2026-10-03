'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import type { RootState } from '@/lib/store';
import { setUser } from '@/lib/features/auth/authSlice';
import {
  productApi,
  categoryApi,
  authApi,
  vendorDashboardApi,
  ordersApi,
} from '@/lib/api';
import type { ProductFormData, ProductCategoryOption, ProductImage } from '@/components/super-admin/ActionModal';
import { categoryIncludesWeightAndDimensions } from '@/components/super-admin/ActionModal';
import SessionTimeoutModal from '@/components/admin/SessionTimeoutModal';
import ProductTable from '@/components/super-admin/ProductTable';
import ActionModal from '@/components/super-admin/ActionModal';
import ViewProductModal from '@/components/super-admin/ViewProductModal';
import ImageUploadModal from '@/components/super-admin/ImageUploadModal';
import VendorSidebar from '@/components/vendor/VendorSidebar';
import type { VendorTab } from '@/components/vendor/VendorSidebar';
import VendorDashboardOverview from '@/components/vendor/VendorDashboardOverview';
import VendorStoreSettings from '@/components/vendor/VendorStoreSettings';
import VendorOrdersView from '@/components/vendor/VendorOrdersView';
import VendorEarningsView from '@/components/vendor/VendorEarningsView';
import NotificationsView from '@/components/notifications/NotificationsView';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import OrderTable from '@/components/super-admin/OrderTable';
import OrderDetailsModal from '@/components/super-admin/OrderDetailsModal';
import { toast } from 'react-hot-toast';
import {
  Menu,
  Search,
  Plus,
  BarChart2,
  X,
  TrendingUp,
  ShoppingCart,
  Eye,
  Star,
  Package,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ProductStatus =
  | 'draft'
  | 'active'
  | 'published'
  | 'inactive'
  | 'out_of_stock'
  | 'discontinued';

type ReturnWindow = 3 | 7 | 14 | 30;
type ReturnShipping = 'store' | 'vendor' | 'customer' | 'Use Store Default';
type WarrantyPeriod = 'none' | '3 months' | '6 months' | '1 year' | '2 years' | 'Use Store Default';
type ProductCondition = 'new' | 'used' | 'refurbished';

export type VendorProduct = {
  id: string;
  vendorId?: string;
  categoryId?: string;
  name: string;
  preview?: string;
  description?: string;
  brand?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  category?: string;
  subCategory?: string;
  subCategoryId?: string;
  stock: number;
  inStock?: boolean;
  image: string;
  images?: ProductImage[];
  status?: ProductStatus;
  condition?: ProductCondition;
  returnWindow?: string;
  whoPaysReturnShipping?: string;
  warrantyPeriod?: string;
  color?: string;
  size?: string;
  colours?: string[];
  sizes?: string[];
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  tags?: string[];
  metadata?: Record<string, unknown>;
  discount?: number;
  currency?: string;
  origin?: string;
  location?: { town: string; state: string; lga: string };
  returnConditions?: string;
  warrantyDetails?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ProductPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type CategoryRecord = {
  id?: string | number;
  _id?: string;
  categoryId?: string | number;
  uuid?: string;
  name?: string;
  title?: string;
  slug?: string;
  displayName?: string;
};

type ProductRecord = {
  id?: string | number;
  _id?: string;
  vendorId?: string;
  categoryId?: string;
  name?: string;
  title?: string;
  preview?: string;
  description?: string;
  brand?: string;
  sku?: string;
  price?: number | { amount?: number };
  compareAtPrice?: number | { amount?: number };
  costPerItem?: number | { amount?: number };
  sellingPrice?: number;
  originalPrice?: number;
  category?: string | { id?: string; _id?: string; name?: string; title?: string };
  subCategoryId?: string;
  subCategory?: string | { id?: string; _id?: string; name?: string; title?: string };
  stock?: number | { quantity?: number; isInStock?: boolean };
  quantity?: number;
  image?: string;
  images?: Array<string | { url?: string; isPrimary?: boolean; order?: number; alt?: string }>;
  status?: ProductStatus;
  condition?: ProductCondition;
  returnWindow?: string | number;
  returnShipping?: ReturnShipping;
  warrantyPeriod?: WarrantyPeriod;
  color?: string;
  size?: string;
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number; unit?: string };
  tags?: string[];
  metadata?: Record<string, unknown>;
  discount?: number;
  discountPercentage?: number;
  origin?: string;
  location?: { town?: string; state?: string; lga?: string };
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type ProductStats = {
  totalViews?: number;
  totalSales?: number;
  totalRevenue?: number;
  averageRating?: number;
  totalReviews?: number;
  cartAdditions?: number;
  conversionRate?: number;
  views?: number;
  sales?: number;
  revenue?: number;
  rating?: number;
  reviews?: number;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PRODUCT_PAGE_LIMIT = 20;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object');

const getProductList = (payload: unknown): unknown[] => {
  if (!isRecord(payload)) return [];
  const data = payload.data;
  if (Array.isArray(data)) return data;
  if (isRecord(data) && Array.isArray(data.data)) return data.data as unknown[];
  if (isRecord(data) && Array.isArray(data.products)) return data.products as unknown[];
  if (isRecord(data) && Array.isArray(data.docs)) return data.docs as unknown[];
  if (Array.isArray((payload as any).products)) return (payload as any).products;
  return [];
};

const getCategoryList = (payload: unknown): unknown[] => {
  if (!isRecord(payload)) return [];
  const data = payload.data;
  if (Array.isArray(data)) return data;
  if (isRecord(data) && Array.isArray(data.data)) return data.data as unknown[];
  if (isRecord(data) && Array.isArray(data.categories)) return data.categories as unknown[];
  if (isRecord(data) && Array.isArray(data.docs)) return data.docs as unknown[];
  if (isRecord(data) && Array.isArray(data.items)) return data.items as unknown[];
  if (isRecord(data) && Array.isArray(data.results)) return data.results as unknown[];
  if (Array.isArray((payload as any).categories)) return (payload as any).categories;
  return [];
};

const normalizeCategory = (category: unknown): (ProductCategoryOption & { isActive: boolean }) | null => {
  if (!isRecord(category)) return null;
  const record = category as CategoryRecord & { isActive?: boolean; is_active?: boolean; status?: string };
  const id = record.id || record._id || record.categoryId || record.uuid;
  const name = record.name || record.title || record.displayName || record.slug;
  if (!id || !name) return null;
  const isActive = Boolean(record.isActive ?? record.is_active ?? (record.status ? record.status === 'published' : true));
  return {
    id: String(id),
    name: String(name),
    isActive,
    subcategories: Array.isArray((record as any).subcategories)
      ? (record as any).subcategories.map((s: any) => ({
          id: String(s.id || s._id || s.categoryId || s.uuid),
          name: String(s.name || s.title || s.displayName || 'Unknown Subcategory'),
        }))
      : [],
  };
};

const getCategoryName = (category: ProductRecord['category']) => {
  if (typeof category === 'string') return category;
  return (category as any)?.name || (category as any)?.title || '';
};

const getCategoryId = (record: ProductRecord) => {
  if (record.categoryId) return record.categoryId;
  if (isRecord(record.category) && record.category.id) return String(record.category.id);
  if (isRecord(record.category) && record.category._id) return String(record.category._id);
  return getCategoryName(record.category);
};

const getMoneyAmount = (value: ProductRecord['price']) => {
  if (isRecord(value)) return Number((value as any).amount ?? 0);
  return Number(value ?? 0);
};

const toNonNegativeInteger = (value: unknown) => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const clampPercentage = (value: unknown) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.min(99, n);
};

const getStockQuantity = (stock: ProductRecord['stock'], quantity?: number) => {
  if (isRecord(stock)) return toNonNegativeInteger((stock as any).quantity);
  return toNonNegativeInteger(stock ?? quantity);
};

const getProductImagesFull = (images: ProductRecord['images']): ProductImage[] => {
  if (!Array.isArray(images)) return [];
  return [...images]
    .map((img, idx) => {
      if (typeof img === 'string') return { url: img, order: idx };
      return {
        key: (img as any).url || '',
        url: (img as any).url || '',
        order: (img as any).order ?? idx,
        isPrimary: (img as any).isPrimary,
        alt: (img as any).alt || '',
      };
    })
    .filter(img => Boolean(img.url))
    .sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });
};

const normalizeProduct = (product: unknown): VendorProduct | null => {
  if (!isRecord(product)) return null;
  const record = product as ProductRecord;
  const id = record.id || record._id;
  const name = record.name || record.title;
  if (!id || !name) return null;

  const imageObjects = getProductImagesFull(record.images);
  const imageUrls = imageObjects.map(img => img.url);
  const metadata = record.metadata || {};
  const price = getMoneyAmount(record.price) || Number(record.sellingPrice ?? record.originalPrice ?? 0);

  return {
    id: String(id),
    vendorId: record.vendorId || '',
    categoryId: getCategoryId(record),
    name,
    preview: record.preview || '',
    description: record.description || '',
    brand: record.brand || '',
    sku: record.sku || '',
    price,
    compareAtPrice: getMoneyAmount(record.compareAtPrice),
    costPerItem: getMoneyAmount(record.costPerItem),
    category: getCategoryName(record.category),
    stock: getStockQuantity(record.stock, record.quantity),
    inStock: isRecord(record.stock)
      ? Boolean((record.stock as any).isInStock)
      : getStockQuantity(record.stock, record.quantity) > 0,
    image: record.image || imageUrls[0] || '',
    images: imageObjects,
    status: record.status || 'draft',
    condition: record.condition || 'new',
    returnWindow: record.returnWindow ? String(record.returnWindow) : 'Use Store Default',
    whoPaysReturnShipping: record.returnShipping || 'Use Store Default',
    warrantyPeriod: record.warrantyPeriod || 'Use Store Default',
    color: record.color,
    size: record.size,
    colours: record.color ? [record.color] : Array.isArray((metadata as any).colours) ? (metadata as any).colours : [],
    sizes: record.size ? [record.size] : Array.isArray((metadata as any).sizes) ? (metadata as any).sizes : [],
    weight: Number(record.weight ?? 0),
    dimensions: {
      length: Number(record.dimensions?.length ?? 0),
      width: Number(record.dimensions?.width ?? 0),
      height: Number(record.dimensions?.height ?? 0),
    },
    tags: record.tags || [],
    metadata,
    discount: record.discount ?? record.discountPercentage ?? 0,
    currency: 'NGN',
    subCategoryId: record.subCategoryId || '',
    subCategory: getCategoryName(record.subCategory),
    origin: typeof record.origin === 'string' && record.origin ? record.origin : String((metadata as any).origin || 'Nigeria'),
    location: record.location
      ? {
          town: String(record.location.town || ''),
          state: String(record.location.state || ''),
          lga: String(record.location.lga || ''),
        }
      : { town: '', state: '', lga: '' },
    returnConditions: String((metadata as any).returnConditions || ''),
    warrantyDetails: String((metadata as any).warrantyDetails || ''),
    createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : new Date().toISOString(),
  };
};

const getProductPagination = (payload: unknown, fallbackCount: number): ProductPagination => {
  const getNumber = (value: unknown, fallback: number) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  if (!isRecord(payload) || !isRecord(payload.data)) {
    return { page: 1, limit: PRODUCT_PAGE_LIMIT, total: fallbackCount, totalPages: Math.max(1, Math.ceil(fallbackCount / PRODUCT_PAGE_LIMIT)) };
  }
  const data = payload.data as any;
  const limit = getNumber(data.limit, PRODUCT_PAGE_LIMIT);
  const total = getNumber(data.total, fallbackCount);
  return {
    page: getNumber(data.page, 1),
    limit,
    total,
    totalPages: getNumber(data.totalPages ?? data.totalPage ?? data.pages, Math.max(1, Math.ceil(total / limit))),
  };
};

const parseReturnWindow = (value: string): ReturnWindow | undefined => {
  const match = value.match(/\d+/);
  const parsed = match ? Number(match[0]) : undefined;
  return parsed === 3 || parsed === 7 || parsed === 14 || parsed === 30 ? parsed : undefined;
};

const getOptionalNumber = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

const resolveCategoryId = (categoryValue: string, categoryOptions: ProductCategoryOption[]) => {
  const normalized = categoryValue.trim().toLowerCase();
  const matched = categoryOptions.find(c => c.id === categoryValue || c.name.trim().toLowerCase() === normalized);
  return matched?.id || categoryValue;
};

const buildProductPayload = (formData: ProductFormData, categoryOptions: ProductCategoryOption[]) => {
  const selectedCategory = categoryOptions.find(c => c.id === formData.categoryId);
  const categoryName = selectedCategory?.name || '';
  const includesWeightAndDimensions = categoryIncludesWeightAndDimensions(categoryName);

  const customMetadata: Record<string, unknown> = {
    ...formData.metadata,
    returnConditions: formData.returnConditions,
    warrantyDetails: formData.warrantyDetails,
  };
  if (includesWeightAndDimensions) customMetadata.weightUnit = (formData as any).weightUnit || 'kg';
  delete customMetadata.origin;
  if (formData.colours.length > 0) { customMetadata.colours = formData.colours; customMetadata.color = formData.colours[0]; }
  if (formData.sizes.length > 0) { customMetadata.sizes = formData.sizes; customMetadata.size = formData.sizes[0]; }
  if (formData.condition) customMetadata.condition = formData.condition;

  const resolvedCategoryId = formData.subCategoryId && formData.subCategoryId !== ''
    ? formData.subCategoryId
    : resolveCategoryId(formData.categoryId, categoryOptions);

  const payload: any = {
    categoryId: resolvedCategoryId,
    name: formData.name,
    preview: formData.preview,
    description: formData.description,
    compareAtPrice: Math.max(0, Number(formData.compareAtPrice) || 0),
    stock: toNonNegativeInteger(formData.stock),
    metadata: customMetadata,
    origin: formData.origin || 'Nigeria',
    location: {
      town: formData.location?.town || '',
      state: formData.location?.state || '',
      lga: formData.location?.lga || '',
    },
  };

  if (formData.brand) payload.brand = formData.brand;
  if (formData.sku) payload.sku = formData.sku;
  if (formData.currency) payload.currency = formData.currency;
  if (formData.tags.length) payload.tags = formData.tags;
  if (formData.images?.length) {
    payload.images = formData.images.map((img, idx) => {
      if (typeof img === 'string') return { url: img, altText: `${formData.name} image ${idx + 1}`, isPrimary: idx === 0, order: idx };
      return { url: img.url, altText: img.alt || (img as any).altText || `${formData.name} image ${idx + 1}`, isPrimary: img.isPrimary || idx === 0, order: img.order ?? idx };
    });
  }
  const returnWindow = parseReturnWindow(formData.returnWindow);
  if (returnWindow !== undefined) payload.returnWindow = returnWindow;
  if (formData.whoPaysReturnShipping === 'store' || formData.whoPaysReturnShipping === 'vendor' || formData.whoPaysReturnShipping === 'customer') {
    payload.returnShipping = formData.whoPaysReturnShipping;
  }
  if (formData.warrantyPeriod === 'none' || formData.warrantyPeriod === '3 months' || formData.warrantyPeriod === '6 months' || formData.warrantyPeriod === '1 year' || formData.warrantyPeriod === '2 years') {
    payload.warrantyPeriod = formData.warrantyPeriod;
  }
  const costPerItem = getOptionalNumber(formData.costPerItem);
  if (costPerItem !== undefined) payload.costPerItem = costPerItem;
  const discount = clampPercentage(formData.discount);
  if (discount !== undefined) payload.discount = discount;

  if (includesWeightAndDimensions) {
    const weight = getOptionalNumber(formData.weight);
    if (weight !== undefined) customMetadata.weight = weight;
    const { length, width, height } = formData.dimensions;
    if ([length, width, height].some(v => getOptionalNumber(v) !== undefined)) {
      customMetadata.dimensions = { length: Number(length) || 0, width: Number(width) || 0, height: Number(height) || 0, unit: (formData as any).dimensionsUnit || 'cm' };
    }
  }

  return payload;
};

const getApiErrorMessage = (error: unknown) => {
  const e = error as any;
  const validationErrors = Array.isArray(e?.errors)
    ? e.errors.map((item: any) => `${item.field}: ${item.message}`)
    : [];
  return [e?.message, ...validationErrors].filter(Boolean).join(' ');
};

// ─── Stats Modal ───────────────────────────────────────────────────────────────

function ProductStatsModal({
  isOpen,
  onClose,
  product,
  stats,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: VendorProduct | null;
  stats: ProductStats | null;
  isLoading: boolean;
}) {
  if (!isOpen || !product) return null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value);

  const views = stats?.totalViews ?? stats?.views ?? 0;
  const sales = stats?.totalSales ?? stats?.sales ?? 0;
  const revenue = stats?.totalRevenue ?? stats?.revenue ?? 0;
  const rating = stats?.averageRating ?? stats?.rating ?? 0;
  const reviews = stats?.totalReviews ?? stats?.reviews ?? 0;
  const cartAdds = stats?.cartAdditions ?? 0;
  const conversion = stats?.conversionRate ?? (views > 0 ? ((sales / views) * 100) : 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b bg-gradient-to-r from-fuchsia-50 to-violet-50">
          <div className="flex items-center gap-3">
            {product.image ? (
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white shadow-md">
                <Image src={product.image} alt={product.name} width={56} height={56} className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-100 flex items-center justify-center">
                <Package size={24} className="text-fuchsia-500" />
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-600 mb-0.5">Product Insights</p>
              <h3 className="font-extrabold text-slate-800 text-base leading-tight max-w-[280px] truncate">{product.name}</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{product.category || 'Uncategorised'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin" />
            </div>
          ) : !stats ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle size={40} className="text-gray-300 mb-4" />
              <p className="text-slate-500 font-semibold">No insights available yet</p>
              <p className="text-xs text-gray-400 mt-1">Stats will appear once your product gets some activity.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Views', value: views.toLocaleString(), icon: <Eye size={18} className="text-blue-500" />, bg: 'bg-blue-50', border: 'border-blue-100' },
                { label: 'Total Sales', value: sales.toLocaleString(), icon: <ShoppingCart size={18} className="text-emerald-500" />, bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { label: 'Revenue', value: formatCurrency(revenue), icon: <TrendingUp size={18} className="text-fuchsia-500" />, bg: 'bg-fuchsia-50', border: 'border-fuchsia-100' },
                { label: 'Avg Rating', value: rating > 0 ? `${rating.toFixed(1)} ★` : 'N/A', icon: <Star size={18} className="text-amber-500" />, bg: 'bg-amber-50', border: 'border-amber-100' },
                { label: 'Reviews', value: reviews.toLocaleString(), icon: <BarChart2 size={18} className="text-violet-500" />, bg: 'bg-violet-50', border: 'border-violet-100' },
                { label: 'Cart Adds', value: cartAdds.toLocaleString(), icon: <ShoppingCart size={18} className="text-rose-500" />, bg: 'bg-rose-50', border: 'border-rose-100' },
                { label: 'Conversion', value: `${conversion.toFixed(1)}%`, icon: <TrendingUp size={18} className="text-teal-500" />, bg: 'bg-teal-50', border: 'border-teal-100' },
              ].map(({ label, value, icon, bg, border }) => (
                <div key={label} className={`${bg} ${border} border rounded-2xl p-4 flex flex-col gap-2`}>
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50/50 flex justify-end">
          <button onClick={onClose} className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

function VendorDashboardContent() {
  const authUser = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramTab = searchParams ? searchParams.get('tab') : null;
  const paramOrderId = searchParams ? searchParams.get('orderId') : null;

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<VendorTab>('dashboard');

  const handleTabChange = (t: VendorTab) => {
    setActiveTab(t);
    if (t !== 'orders' && typeof window !== 'undefined' && (window.location.search.includes('tab=orders') || window.location.search.includes('orderId='))) {
      router.replace('/vendor/dashboard');
    }
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (paramTab) {
      setActiveTab(paramTab as VendorTab);
    }
  }, [paramTab]);

  // Product state
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [productLimit, setProductLimit] = useState(PRODUCT_PAGE_LIMIT);
  const [productTotal, setProductTotal] = useState(0);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productLoadError, setProductLoadError] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [publishingProductId, setPublishingProductId] = useState<string | null>(null);
  const [productToPublishId, setProductToPublishId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('all');
  const [filterSubcategoryId, setFilterSubcategoryId] = useState('all');
  const [filterSubcategories, setFilterSubcategories] = useState<ProductCategoryOption[]>([]);

  // Categories
  const [categories, setCategories] = useState<ProductCategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [subcategoryMap, setSubcategoryMap] = useState<Map<string, { categoryName: string; subCategoryName: string }>>(new Map());

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<VendorProduct | null>(null);
  const [statsProduct, setStatsProduct] = useState<VendorProduct | null>(null);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const handleCloseVendorOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
    if (typeof window !== 'undefined' && window.location.search.includes('orderId')) {
      router.replace('/vendor/dashboard?tab=orders');
    }
  };

  // Orders state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vendorOrders, setVendorOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [currentUserId, setCurrentUserId] = useState('');

  const isVendor = authUser?.role === 'VENDOR' || authUser?.role === 'vendor';

  // ── Auth Check ────────────────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    const resolveUser = async () => {
      setIsCheckingAuth(true);
      if (authUser?.id) {
        setCurrentUserId(authUser.id);
        setIsCheckingAuth(false);
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        if (mounted) setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await authApi.getProfile();
        const profileData = (response as any)?.data ?? response;
        const userId = profileData?.user?.id || profileData?.id;
        const role = profileData?.role || profileData?.user?.role || '';

        if (mounted && userId) {
          setCurrentUserId(String(userId));
          dispatch(
            setUser({
              id: String(userId),
              email: profileData?.email || profileData?.user?.email || '',
              firstName: profileData?.firstName || profileData?.user?.firstName || '',
              lastName: profileData?.lastName || profileData?.user?.lastName || '',
              profilePicture: profileData?.avatar || profileData?.profilePicture || undefined,
              role,
              isEmailVerified: profileData?.isEmailVerified ?? true,
            })
          );
        }
      } catch {
        if (mounted) setCurrentUserId('');
      } finally {
        if (mounted) setIsCheckingAuth(false);
      }
    };

    resolveUser();
    return () => { mounted = false; };
  }, [authUser?.id, dispatch]);

  // ── Redirect if not vendor ─────────────────────────────────────────────────

  useEffect(() => {
    if (isCheckingAuth) return;
    if (!authUser) {
      // Token may have expired — don't redirect, show the unauthorized screen
      return;
    }
    const role = authUser.role?.toUpperCase();
    if (role !== 'VENDOR') {
      router.replace('/');
    }
  }, [isCheckingAuth, authUser, router]);

  // ── Fetch Categories ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (isCheckingAuth || !isVendor) return;
    let mounted = true;

    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await categoryApi.getCategories({ page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' });
        const fetchedCategories = getCategoryList(response)
          .map(normalizeCategory)
          .filter((c): c is ProductCategoryOption & { isActive: boolean } => Boolean(c))
          .filter(c => c.isActive);

        if (mounted) {
          setCategories(fetchedCategories);

          const map = new Map<string, { categoryName: string; subCategoryName: string }>();
          try {
            await Promise.all(
              fetchedCategories.map(async (cat) => {
                try {
                  const subRes = await categoryApi.getSubcategories(cat.id);
                  const subs = getCategoryList(subRes)
                    .map(normalizeCategory)
                    .filter((s): s is ProductCategoryOption & { isActive: boolean } => Boolean(s));
                  subs.forEach(sub => map.set(sub.id, { categoryName: cat.name, subCategoryName: sub.name }));
                } catch { /* skip */ }
              })
            );
          } catch { /* best-effort */ }

          if (mounted) setSubcategoryMap(map);
        }
      } catch (error) {
        if (mounted) setProductLoadError(getApiErrorMessage(error) || 'Could not load categories.');
      } finally {
        if (mounted) setIsLoadingCategories(false);
      }
    };

    fetchCategories();
    return () => { mounted = false; };
  }, [isCheckingAuth, isVendor]);

  // Update subcategory filter options when category changes
  useEffect(() => {
    if (filterCategoryId === 'all') {
      setFilterSubcategories([]);
      setFilterSubcategoryId('all');
      return;
    }
    let isMounted = true;
    const loadSubs = async () => {
      try {
        const subRes = await categoryApi.getSubcategories(filterCategoryId);
        const subs = getCategoryList(subRes)
          .map(normalizeCategory)
          .filter((s): s is ProductCategoryOption & { isActive: boolean } => Boolean(s))
          .filter(s => s.isActive);
        if (isMounted) {
          setFilterSubcategories(subs);
          setFilterSubcategoryId('all');
        }
      } catch {
        if (isMounted) setFilterSubcategories([]);
      }
    };
    void loadSubs();
    return () => { isMounted = false; };
  }, [filterCategoryId]);

  // ── Fetch Products ────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setProductLoadError('');
    try {
      let vendorProfileId = '';
      let fallbackVendorId = currentUserId || '';

      try {
        const storeProfileResponse = await vendorDashboardApi.getStoreProfile();
        const storeProfileData = (storeProfileResponse as any)?.data ?? storeProfileResponse;
        vendorProfileId = String(
          storeProfileData?.vendorProfileId ||
          storeProfileData?.id ||
          storeProfileData?.store?.vendorProfileId ||
          storeProfileData?.store?.id ||
          ''
        );
        fallbackVendorId = String(storeProfileData?.vendorId || currentUserId || '');
      } catch {
        vendorProfileId = '';
      }

      const response = await productApi.getVendorProducts({
        page: productPage,
        limit: PRODUCT_PAGE_LIMIT,
        searchQuery: searchQuery || undefined,
        categoryId: filterSubcategoryId !== 'all' ? filterSubcategoryId : (filterCategoryId !== 'all' ? filterCategoryId : undefined),
        status: undefined,
        vendorProfileId: vendorProfileId || undefined,
        vendorId: fallbackVendorId || undefined,
      });
      const fetched = getProductList(response)
        .map(normalizeProduct)
        .filter((p): p is VendorProduct => Boolean(p));
      const pagination = getProductPagination(response, fetched.length);

      setProducts(fetched);
      setProductLimit(pagination.limit);
      setProductTotal(pagination.total);
      setProductTotalPages(pagination.totalPages);
    } catch (error) {
      setProducts([]);
      setProductTotal(0);
      setProductTotalPages(1);
      setProductLoadError(getApiErrorMessage(error) || 'Could not load your products. Please try again.');
    } finally {
      setIsLoadingProducts(false);
    }
  }, [productPage, searchQuery, filterCategoryId, filterSubcategoryId, currentUserId]);

  useEffect(() => {
    if (isCheckingAuth || !isVendor) return;
    fetchProducts();
  }, [isCheckingAuth, isVendor, fetchProducts]);

  // ── Resolve products with category names ───────────────────────────────────

  const resolvedProducts = useMemo(() => {
    return products.map(p => {
      let resolvedCategory = p.category || '';
      let resolvedSubCategory = p.subCategory || '';
      if (p.categoryId) {
        const subEntry = subcategoryMap.get(p.categoryId);
        if (subEntry) {
          resolvedCategory = subEntry.categoryName;
          resolvedSubCategory = subEntry.subCategoryName;
        } else {
          const parentCat = categories.find(c => c.id === p.categoryId);
          if (parentCat) { resolvedCategory = parentCat.name; resolvedSubCategory = ''; }
        }
      }
      return { ...p, category: resolvedCategory, subCategory: resolvedSubCategory };
    });
  }, [products, categories, subcategoryMap]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSaveProduct = async (formData: ProductFormData) => {
    setIsSavingProduct(true);
    try {
      const payload = buildProductPayload(formData, categories);
      if (formData.id) {
        await productApi.updateProduct(formData.id, payload);
        toast.success('Product updated successfully!');
      } else {
        const created = await productApi.createProduct(payload);
        const newId = (created as any)?.data?.id || (created as any)?.data?.product?.id;
        toast.success('Product created! Add images to publish it.');
        setIsModalOpen(false);
        if (newId) {
          setProductToPublishId(newId);
          setIsImageModalOpen(true);
        }
      }
      await fetchProducts();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Could not save product. Please try again.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await productApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setProductTotal(prev => Math.max(0, prev - 1));
      toast.success('Product deleted.');
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Could not delete product.');
    }
  };

  const handlePublishClick = async (id: string) => {
    setPublishingProductId(id);
    try {
      await productApi.publishProduct(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'published' as const } : p));
      toast.success('Product published successfully!');
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Could not publish product.');
    } finally {
      setPublishingProductId(null);
    }
  };

  const handleImageComplete = async (images: { file: File; alt: string }[]) => {
    setIsImageModalOpen(false);
    if (!productToPublishId || !images.length) return;
    try {
      // Build FormData for multipart image upload
      const formData = new FormData();
      images.forEach((img, idx) => {
        formData.append('images', img.file);
        formData.append(`altText[${idx}]`, img.alt || `Image ${idx + 1}`);
        formData.append(`isPrimary[${idx}]`, idx === 0 ? 'true' : 'false');
        formData.append(`order[${idx}]`, String(idx));
      });
      await productApi.uploadProductImages(productToPublishId, formData);
      toast.success('Images added successfully!');
    } catch {
      // Fallback: store as object URLs if upload endpoint unavailable
      try {
        const imagePayload = await Promise.all(
          images.map(async (img, idx) => ({
            url: URL.createObjectURL(img.file),
            altText: img.alt || `Image ${idx + 1}`,
            isPrimary: idx === 0,
            order: idx,
          }))
        );
        await productApi.updateProduct(productToPublishId, { images: imagePayload } as any);
        toast.success('Images queued — upload to cloud when ready.');
      } catch {
        toast.error('Could not attach images. You can add them later by editing the product.');
      }
    } finally {
      setProductToPublishId(null);
      await fetchProducts();
    }
  };

  // ── Vendor Orders ──────────────────────────────────────────────────────────

  const fetchVendorOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const response = await ordersApi.search({ limit: 50 });
      const data = (response as any)?.data ?? response;
      const list = Array.isArray(data?.orders) ? data.orders
        : Array.isArray(data?.data) ? data.data
        : Array.isArray(data) ? data
        : [];
      setVendorOrders(list);
    } catch {
      setVendorOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchVendorOrders();
    }
  }, [activeTab, fetchVendorOrders]);

  // Auto-open order modal when navigating from a notification link (?orderId=...)
  useEffect(() => {
    if (paramOrderId) {
      const cleanId = String(paramOrderId).replace('#', '');
      const matched = vendorOrders.find(
        (o) => String(o.id).replace('#', '') === cleanId ||
               String(o.orderNumber || '').replace('#', '') === cleanId
      );
      if (matched) {
        setSelectedOrder(matched);
      } else {
        // Stub so the modal can still fetch full details by order number/id
        setSelectedOrder({
          id: paramOrderId,
          orderNumber: paramOrderId,
        });
      }
      setActiveTab('orders');
      setIsOrderModalOpen(true);
    }
  }, [paramOrderId, vendorOrders]);

  const openOrderModal = (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const openEditModal = (product: VendorProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openViewModal = (product: VendorProduct) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  const openStatsModal = async (product: VendorProduct) => {
    setStatsProduct(product);
    setProductStats(null);
    setIsStatsModalOpen(true);
    setIsLoadingStats(true);
    try {
      const response = await productApi.getVendorProductStats(product.id);
      const stats = (response as any)?.data ?? response;
      setProductStats(stats as ProductStats);
    } catch {
      setProductStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // ── Loading spinner while checking auth ───────────────────────────────────

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 to-violet-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-fuchsia-700">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Unauthorized / Session Expired ────────────────────────────────────────

  if (!authUser || !isVendor) {
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
    const title = hasToken ? 'Access Denied' : 'Session Expired';
    const message = hasToken
      ? 'This dashboard is only available to registered vendors.'
      : 'Your session has expired. Please log in again to continue.';
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 to-violet-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 max-w-sm w-full text-center border">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
          <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed">
            {message}
          </p>
          <button
            onClick={() => router.push('/become-a-vendor')}
            className="w-full mt-8 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Main Layout ────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] flex-col md:flex-row relative">
      <SessionTimeoutModal loginPath="/become-a-vendor" />

      {/* Mobile header */}
      <div className="md:hidden bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-1.5 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/fa_logo_brand.png" alt="Faflora" width={100} height={28} className="object-contain" />
            <span className="text-[10px] text-fuchsia-600 font-bold uppercase tracking-wider bg-fuchsia-50 px-2 py-0.5 rounded border border-fuchsia-100">Vendor</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition -mr-2">
            <Menu size={24} />
          </button>
        </div>
      </div>

      <VendorSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => handleTabChange(tab as VendorTab)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
        {/* Desktop Top Header Bar */}
        <div className="hidden md:flex items-center justify-between mb-6 pb-4 border-b border-gray-200/60">
          <div>
            <span className="text-xs font-bold text-fuchsia-600 bg-fuchsia-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-fuchsia-100">
              Vendor Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-fuchsia-100 flex items-center justify-center font-bold text-fuchsia-700 text-sm border border-fuchsia-200 shadow-sm">
                {authUser?.firstName?.[0] || 'V'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {authUser?.firstName || 'Vendor'} {authUser?.lastName || ''}
                </p>
                <p className="text-[10px] text-gray-400 font-medium truncate max-w-[140px]">
                  {authUser?.email || 'vendor@faflora.com'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Overview Tab */}
        {activeTab === 'dashboard' && (
          <VendorDashboardOverview vendorDashboardApi={vendorDashboardApi} />
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <NotificationsView />
        )}

        {/* Store Settings Tab */}
        {activeTab === 'store-settings' && (
          <VendorStoreSettings vendorDashboardApi={vendorDashboardApi} />
        )}


        {/* Products Tab */}
        {activeTab === 'products' && (<>
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">My Products</h2>
            <p className="text-sm text-gray-500 font-medium">Manage and track your store's product catalog</p>
          </div>
          <button
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-100 whitespace-nowrap"
          >
            <Plus size={18} /> Add Product
          </button>
        </header>

        {/* Search bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 flex items-center gap-3 shadow-sm focus-within:border-fuchsia-400 focus-within:ring-2 focus-within:ring-fuchsia-200 transition-all">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search your products by name..."
            className="flex-1 outline-none text-sm font-medium focus:!ring-0 focus:!border-transparent"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setProductPage(1); }}
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={filterCategoryId}
            onChange={e => { setFilterCategoryId(e.target.value); setProductPage(1); }}
            className="p-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-300 outline-none transition flex-1"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterSubcategoryId}
            onChange={e => { setFilterSubcategoryId(e.target.value); setProductPage(1); }}
            disabled={filterCategoryId === 'all'}
            className="p-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-300 outline-none transition flex-1 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="all">All Subcategories</option>
            {filterSubcategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Status / error banner */}
        {(isLoadingProducts || isSavingProduct || productLoadError) && (
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium mb-4 ${productLoadError
            ? 'border-amber-200 bg-amber-50 text-amber-700'
            : 'border-gray-200 bg-white text-gray-500'
            }`}>
            {productLoadError || (isSavingProduct ? 'Saving product…' : 'Loading your products…')}
          </div>
        )}

        {/* Product Table */}
        <ProductTable
          data={resolvedProducts}
          onEdit={(item) => openEditModal({ ...item, image: typeof item.image === 'string' ? item.image : (item.image as any).src } as VendorProduct)}
          onView={(item) => openViewModal({ ...item, image: typeof item.image === 'string' ? item.image : (item.image as any).src } as VendorProduct)}
          onDelete={handleDeleteProduct}
          onPublish={handlePublishClick}
          publishingProductId={publishingProductId}
          currentPage={productPage}
          totalPages={productTotalPages}
          totalItems={productTotal}
          itemsPerPage={productLimit}
          onPageChange={setProductPage}
          isLoading={isLoadingProducts}
          showReviewRepliesButton
        />

        {/* Stats buttons — rendered as a floating overlay on product rows via a separate section */}
        {resolvedProducts.length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Product Insights</p>
            <div className="flex flex-wrap gap-2">
              {resolvedProducts.slice(0, 5).map(p => (
                <button
                  key={p.id}
                  onClick={() => openStatsModal(p)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-fuchsia-50 hover:border-fuchsia-200 hover:text-fuchsia-700 transition shadow-sm"
                >
                  <BarChart2 size={14} />
                  <span className="max-w-[120px] truncate">{p.name}</span>
                </button>
              ))}
              {resolvedProducts.length > 5 && (
                <span className="px-4 py-2 text-xs text-gray-400 font-medium self-center">
                  +{resolvedProducts.length - 5} more products
                </span>
              )}
            </div>
          </div>
        )}
        </>) /* end products tab */}

        {/* Store Orders Tab */}
        {activeTab === 'orders' && <VendorOrdersView />}

        {/* Earnings & Financial Payouts Tab */}
        {activeTab === 'earnings' && <VendorEarningsView />}

      </main>

      {/* Modals */}
      <ActionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
        activeTab="products"
        editingItem={editingProduct ? {
          id: editingProduct.id,
          vendorId: editingProduct.vendorId || currentUserId,
          name: editingProduct.name,
          preview: editingProduct.preview,
          description: editingProduct.description,
          brand: editingProduct.brand,
          sku: editingProduct.sku,
          price: editingProduct.price,
          compareAtPrice: editingProduct.compareAtPrice,
          costPerItem: editingProduct.costPerItem,
          currency: editingProduct.currency || 'NGN',
          condition: editingProduct.condition,
          stock: editingProduct.stock,
          inStock: editingProduct.inStock ?? editingProduct.stock > 0,
          categoryId: editingProduct.categoryId || '',
          subCategoryId: editingProduct.subCategoryId || '',
          colours: editingProduct.colours || [],
          sizes: editingProduct.sizes || [],
          weight: editingProduct.weight || 0,
          dimensions: editingProduct.dimensions || { length: 0, width: 0, height: 0 },
          tags: editingProduct.tags || [],
          metadata: editingProduct.metadata || {},
          origin: editingProduct.origin || '',
          location: editingProduct.location || { town: '', state: '', lga: '' },
          returnWindow: editingProduct.returnWindow || 'Use Store Default',
          whoPaysReturnShipping: editingProduct.whoPaysReturnShipping || 'Use Store Default',
          returnConditions: editingProduct.returnConditions || '',
          warrantyPeriod: editingProduct.warrantyPeriod || 'Use Store Default',
          warrantyDetails: editingProduct.warrantyDetails || '',
          status: editingProduct.status || 'draft',
          images: editingProduct.images,
          discount: editingProduct.discount,
        } : undefined}
        categories={categories}
        isLoadingCategories={isLoadingCategories}
        currentUserId={currentUserId}
        onSave={handleSaveProduct}
        isVendorRole={true}
      />

      <ViewProductModal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setViewingProduct(null); }}
        product={viewingProduct}
      />

      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => { setIsImageModalOpen(false); setProductToPublishId(null); }}
        onComplete={handleImageComplete}
        onSkip={() => { setIsImageModalOpen(false); setProductToPublishId(null); }}
      />

      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseVendorOrderModal}
        order={selectedOrder}
        onOrderUpdated={fetchVendorOrders}
      />

      <AnimatePresence>
        {isStatsModalOpen && (
          <ProductStatsModal
            isOpen={isStatsModalOpen}
            onClose={() => { setIsStatsModalOpen(false); setStatsProduct(null); setProductStats(null); }}
            product={statsProduct}
            stats={productStats}
            isLoading={isLoadingStats}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VendorDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 to-violet-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin" />
        </div>
      }
    >
      <VendorDashboardContent />
    </Suspense>
  );
}
