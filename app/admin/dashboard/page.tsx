'use client';

import React, { useCallback, useEffect, useState, useMemo, Suspense } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboardView from '@/components/admin/AdminDashboardView';
import NotificationsView from '@/components/notifications/NotificationsView';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import ActionModal, {
  ProductCategoryOption,
  ProductFormData,
  ProductImage,
  categoryIncludesWeightAndDimensions,
} from '@/components/super-admin/ActionModal';
import CategoriesModal from '@/components/super-admin/CategoriesModal';
import ImageUploadModal from '@/components/super-admin/ImageUploadModal';
import ViewProductModal from '@/components/super-admin/ViewProductModal';
import ProductTable, { Product as ProductTableItem } from '@/components/super-admin/ProductTable';
import VendorManagementView from '@/components/admin/VendorManagementView';
import SessionTimeoutModal from '@/components/admin/SessionTimeoutModal';
import OrderTable from '@/components/super-admin/OrderTable';
import OrderDetailsModal from '@/components/super-admin/OrderDetailsModal';
import UserTable, { AppUser } from '@/components/super-admin/UserTable';
import ViewUserModal from '@/components/super-admin/ViewUserModal';
import WaitlistView from '@/components/admin/WaitlistView';
import TaxRulesManagement from '@/components/admin/TaxRulesManagement';
import BlogManagementView from '@/components/admin/BlogManagementView';
import VendorSpecialistsView from '@/components/super-admin/VendorSpecialistsView';
import { Plus, Search, Menu } from 'lucide-react';
import {
  ApiError,
  CreateProductDto,
  ProductCondition,
  ProductStatus,
  ReturnShipping,
  ReturnWindow,
  WarrantyPeriod,
  authApi,
  categoryApi,
  ordersApi,
  productApi,
  uploadImages,
} from '@/lib/api';
import { adminVendorApi } from '@/lib/api-vendor';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import type { RootState } from '@/lib/store';
import { setUser } from '@/lib/features/auth/authSlice';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

type AdminProduct = Partial<ProductFormData> & {
  id: string;
  name: string;
  price: number;
  category?: string;
  stock: number;
  image: string;
  status?: ProductStatus;
  images?: ProductImage[];
  color?: string;
  size?: string;
  subCategoryId?: string;
  subCategory?: string;
  origin?: string;
  location?: {
    town: string;
    state: string;
    lga: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

type AdminVendor = {
  id: number;
  name: string;
  type: string;
  email: string;
  status: string;
};

type AdminOrder = {
  id: string;
  orderNumber?: string;
  user: {
    name: string;
    avatar: string;
  };
  items: string;
  total: number;
  address: string;
  date: string;
  status: 'Ongoing' | 'Delivered' | 'Cancelled' | 'Returned';
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
};

type ProductRecord = {
  id?: string | number;
  _id?: string;
  vendorId?: string;
  vendorProfileId?: string;
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
  returnWindow?: ReturnWindow;
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

const PRODUCT_PAGE_LIMIT = 20;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object');


const getProductList = (payload: unknown): unknown[] => {
  if (!isRecord(payload)) return [];

  const data = payload.data;

  if (Array.isArray(data)) return data;
  if (isRecord(data) && Array.isArray(data.data)) return data.data;
  if (isRecord(data) && Array.isArray(data.products)) return data.products;
  if (isRecord(data) && Array.isArray(data.docs)) return data.docs;
  if (Array.isArray(payload.products)) return payload.products;

  return [];
};

const getCategoryList = (payload: unknown): unknown[] => {
  if (!isRecord(payload)) return [];

  const data = payload.data;

  if (Array.isArray(data)) return data;
  if (isRecord(data) && Array.isArray(data.data)) return data.data;
  if (isRecord(data) && Array.isArray(data.categories)) return data.categories;
  if (isRecord(data) && Array.isArray(data.docs)) return data.docs;
  if (isRecord(data) && Array.isArray(data.items)) return data.items;
  if (isRecord(data) && Array.isArray(data.results)) return data.results;
  if (Array.isArray(payload.categories)) return payload.categories;

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
    subcategories: Array.isArray((record as any).subcategories) ? (record as any).subcategories.map((s: any) => ({
      id: String(s.id || s._id || s.categoryId || s.uuid),
      name: String(s.name || s.title || s.displayName || 'Unknown Subcategory'),
    })) : [],
  };
};

const getStoredUserId = () => {
  if (typeof window === 'undefined') return '';

  const candidateKeys = ['user', 'authUser', 'faflora_user', 'userId', 'vendorId'];

  for (const key of candidateKeys) {
    const value = localStorage.getItem(key);
    if (!value) continue;

    try {
      const parsed = JSON.parse(value) as { id?: unknown; user?: { id?: unknown } };
      const id = parsed.id || parsed.user?.id;
      if (id) return String(id);
    } catch {
      if (key.toLowerCase().includes('id')) return value;
    }
  }

  return '';
};

const getNumber = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : fallback;
};

const getProductPagination = (
  payload: unknown,
  fallbackCount: number
): ProductPagination => {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    return {
      page: 1,
      limit: PRODUCT_PAGE_LIMIT,
      total: fallbackCount,
      totalPages: Math.max(1, Math.ceil(fallbackCount / PRODUCT_PAGE_LIMIT)),
    };
  }

  const data = payload.data;
  const page = getNumber(data.page, 1);
  const limit = getNumber(data.limit, PRODUCT_PAGE_LIMIT);
  const total = getNumber(data.total, fallbackCount);
  const totalPages = getNumber(
    data.totalPages ?? data.totalPage ?? data.pages,
    Math.max(1, Math.ceil(total / limit))
  );

  return { page, limit, total, totalPages };
};

const getCategoryName = (category: ProductRecord['category']) => {
  if (typeof category === 'string') return category;
  return category?.name || category?.title || '';
};

const getCategoryId = (record: ProductRecord) => {
  if (record.categoryId) return record.categoryId;
  if (isRecord(record.category) && record.category.id) return String(record.category.id);
  if (isRecord(record.category) && record.category._id) return String(record.category._id);
  return getCategoryName(record.category);
};

const getMoneyAmount = (value: ProductRecord['price']) => {
  if (isRecord(value)) return Number(value.amount ?? 0);
  return Number(value ?? 0);
};

const toNonNegativeInteger = (value: unknown) => {
  const numberValue = Math.floor(Number(value));
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
};

const clampPercentage = (value: unknown) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) return undefined;
  return Math.min(99, numberValue);
};

const resolveCategoryId = (
  categoryValue: string,
  categoryOptions: ProductCategoryOption[]
) => {
  const normalizedValue = categoryValue.trim().toLowerCase();
  const matchedCategory = categoryOptions.find((category) =>
    category.id === categoryValue ||
    category.name.trim().toLowerCase() === normalizedValue
  );

  return matchedCategory?.id || categoryValue;
};

const getStockQuantity = (stock: ProductRecord['stock'], quantity?: number) => {
  if (isRecord(stock)) return toNonNegativeInteger(stock.quantity);
  return toNonNegativeInteger(stock ?? quantity);
};

const getProductImagesFull = (images: ProductRecord['images']): ProductImage[] => {
  if (!Array.isArray(images)) return [];

  return [...images]
    .map((image, idx) => {
      if (typeof image === 'string') return { url: image, order: idx };
      return {
        key: image.url || '',
        url: image.url || '',
        order: image.order ?? idx,
        isPrimary: image.isPrimary,
        alt: image.alt || '',
      };
    })
    .filter(img => Boolean(img.url))
    .sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });
};

const normalizeProduct = (product: unknown): AdminProduct | null => {
  if (!isRecord(product)) return null;

  const record = product as ProductRecord;
  const id = record.id || record._id;
  const name = record.name || record.title;

  if (!id || !name) return null;

  const imageObjects = getProductImagesFull(record.images);
  const imageUrls = imageObjects.map(img => img.url);
  const compareAtPrice = getMoneyAmount(record.compareAtPrice);
  const price = getMoneyAmount(record.price) || Number(record.sellingPrice ?? record.originalPrice ?? 0);
  const metadata = record.metadata || {};
  const colours = record.color
    ? [record.color]
    : Array.isArray((metadata as { colours?: unknown }).colours)
      ? ((metadata as { colours: string[] }).colours)
      : [];
  const sizes = record.size
    ? [record.size]
    : Array.isArray((metadata as { sizes?: unknown }).sizes)
      ? ((metadata as { sizes: string[] }).sizes)
      : [];

  // Extract origin — prefer top-level field, fall back to metadata
  const origin = typeof record.origin === 'string' && record.origin
    ? record.origin
    : String((metadata as { origin?: unknown }).origin || 'Nigeria');

  // Extract location — prefer top-level field, fall back to empty
  let location: { town: string; state: string; lga: string } = { town: '', state: '', lga: '' };
  if (record.location && typeof record.location === 'object') {
    location = {
      town: String(record.location.town || ''),
      state: String(record.location.state || ''),
      lga: String(record.location.lga || ''),
    };
  }

  return {
    id: String(id),
    vendorId: record.vendorId || '',
    vendorProfileId: record.vendorProfileId || '',
    categoryId: getCategoryId(record),
    name,
    preview: record.preview || '',
    description: record.description || '',
    brand: record.brand || '',
    sku: record.sku || '',
    price,
    compareAtPrice,
    costPerItem: getMoneyAmount(record.costPerItem),
    category: getCategoryName(record.category),
    stock: getStockQuantity(record.stock, record.quantity),
    inStock: isRecord(record.stock)
      ? Boolean(record.stock.isInStock)
      : getStockQuantity(record.stock, record.quantity) > 0,
    image: record.image || imageUrls[0] || (typeof record.preview === 'string' && /\.(png|jpe?g|webp|avif)(\?|$)/i.test(record.preview) ? record.preview : ''),
    images: imageObjects,
    status: record.status || 'draft',
    condition: record.condition || 'new',
    returnWindow: record.returnWindow ? String(record.returnWindow) : 'Use Store Default',
    whoPaysReturnShipping: record.returnShipping || 'Use Store Default',
    warrantyPeriod: record.warrantyPeriod || 'Use Store Default',
    color: record.color,
    size: record.size,
    colours,
    sizes,
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
    origin,
    location,
    returnConditions: String((metadata as { returnConditions?: unknown }).returnConditions || ''),
    warrantyDetails: String((metadata as { warrantyDetails?: unknown }).warrantyDetails || ''),
    createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : new Date().toISOString(),
  };
};

const getOptionalNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0
    ? numberValue
    : undefined;
};

const parseReturnWindow = (value: string): ReturnWindow | undefined => {
  const match = value.match(/\d+/);
  const parsed = match ? Number(match[0]) : undefined;
  return parsed === 3 || parsed === 7 || parsed === 14 || parsed === 30
    ? parsed
    : undefined;
};

const getApiErrorMessage = (error: unknown) => {
  const apiError = error as ApiError;
  const validationErrors = Array.isArray(apiError.errors)
    ? apiError.errors.map((item) => `${item.field}: ${item.message}`)
    : [];

  return [apiError.message, ...validationErrors]
    .filter(Boolean)
    .join(' ');
};

const getUserList = (payload: unknown): unknown[] => {
  if (!isRecord(payload)) return [];
  const data = payload.data;
  if (Array.isArray(data)) return data;
  if (isRecord(data) && Array.isArray(data.data)) return data.data;
  if (isRecord(data) && Array.isArray(data.users)) return data.users;
  if (isRecord(data) && Array.isArray(data.docs)) return data.docs;
  if (Array.isArray(payload.users)) return payload.users;
  return [];
};

type UserPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const getUserPagination = (
  payload: unknown,
  fallbackCount: number
): UserPagination => {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    return {
      page: 1,
      limit: 10,
      total: fallbackCount,
      totalPages: Math.max(1, Math.ceil(fallbackCount / 10)),
    };
  }
  const data = payload.data;
  const getN = (v: unknown, fb: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : fb;
  };
  const limit = getN(data.limit, 10);
  const total = getN(data.total, fallbackCount);
  return {
    page: getN(data.page, 1),
    limit,
    total,
    totalPages: getN(
      (data as any).totalPages ?? (data as any).totalPage ?? (data as any).pages,
      Math.max(1, Math.ceil(total / limit))
    ),
  };
};

const normalizeAppUser = (user: any): import('@/components/super-admin/UserTable').AppUser => {
  const isActive = typeof user.isActive === 'boolean' ? user.isActive : (user.status === 'active' || user.status === true);
  return {
    id: user.id || user._id || '',
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    role: user.role || 'customer',
    isEmailVerified: Boolean(user.isEmailVerified),
    isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled),
    avatar: user.avatar || null,
    phoneNumber: user.phoneNumber || user.phone || null,
    lastLoginAt: user.lastLoginAt || null,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
    status: isActive ? 'active' : 'blocked',
    isAuthenticated: Boolean(user.isEmailVerified),
  };
};


const buildProductPayload = (
  formData: ProductFormData,
  categoryOptions: ProductCategoryOption[]
): CreateProductDto => {
  const selectedCategory = categoryOptions.find(
    (c) => c.id === formData.categoryId
  );
  const categoryName = selectedCategory?.name || '';
  const includesWeightAndDimensions = categoryIncludesWeightAndDimensions(categoryName);

  const customMetadata: Record<string, unknown> = {
    ...formData.metadata,
    returnConditions: formData.returnConditions,
    warrantyDetails: formData.warrantyDetails,
  };

  if (includesWeightAndDimensions) {
    customMetadata.weightUnit = (formData as any).weightUnit || 'kg';
  }

  delete customMetadata.origin;

  if (formData.colours.length > 0) {
    customMetadata.colours = formData.colours;
    customMetadata.color = formData.colours[0];
  }

  if (formData.sizes.length > 0) {
    customMetadata.sizes = formData.sizes;
    customMetadata.size = formData.sizes[0];
  }

  if (formData.condition) {
    customMetadata.condition = formData.condition;
  }

  const resolvedCategoryId = formData.subCategoryId && formData.subCategoryId !== ''
    ? formData.subCategoryId
    : resolveCategoryId(formData.categoryId, categoryOptions);

  const payload: CreateProductDto = {
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

  if (formData.vendorProfileId) {
    payload.vendorProfileId = formData.vendorProfileId;
  }

  if (formData.brand) payload.brand = formData.brand;
  if (formData.sku) payload.sku = formData.sku;
  if (formData.currency) payload.currency = formData.currency;
  if (formData.tags.length) payload.tags = formData.tags;

  if (formData.images?.length) {
    payload.images = formData.images.map((img, index) => {
      if (typeof img === 'string') {
        return {
          url: img,
          altText: `${formData.name} image ${index + 1}`,
          isPrimary: index === 0,
          order: index,
        };
      }
      return {
        url: img.url,
        altText: img.alt || (img as any).altText || `${formData.name} image ${index + 1}`,
        isPrimary: img.isPrimary || index === 0,
        order: img.order ?? index,
      };
    });
  }

  const returnWindow = parseReturnWindow(formData.returnWindow);
  if (returnWindow !== undefined) payload.returnWindow = returnWindow;
  if (
    formData.whoPaysReturnShipping === 'store' ||
    formData.whoPaysReturnShipping === 'vendor' ||
    formData.whoPaysReturnShipping === 'customer'
  ) {
    payload.returnShipping = formData.whoPaysReturnShipping;
  }
  if (
    formData.warrantyPeriod === 'none' ||
    formData.warrantyPeriod === '3 months' ||
    formData.warrantyPeriod === '6 months' ||
    formData.warrantyPeriod === '1 year' ||
    formData.warrantyPeriod === '2 years'
  ) {
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
    if ([length, width, height].some(value => getOptionalNumber(value) !== undefined)) {
      customMetadata.dimensions = {
        length: Number(length) || 0,
        width: Number(width) || 0,
        height: Number(height) || 0,
        unit: (formData as any).dimensionsUnit || 'cm',
      };
    }
  }

  return payload;
};

function AdminPageContent() {
  const authUser = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramTab = searchParams ? searchParams.get('tab') : null;
  const paramOrderId = searchParams ? searchParams.get('orderId') : null;

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'vendors' | 'orders' | 'users' | 'waitlist' | 'taxes' | 'notifications' | 'blog' | 'specialists'>('dashboard');

  const handleTabChange = (t: unknown) => {
    const nextTab = typeof t === 'string' && t.trim() ? t : 'dashboard';
    setActiveTab(nextTab as 'dashboard' | 'products' | 'vendors' | 'orders' | 'users' | 'waitlist' | 'taxes' | 'notifications' | 'blog' | 'specialists');
    if (nextTab !== 'orders' && typeof window !== 'undefined' && (window.location.search.includes('tab=orders') || window.location.search.includes('orderId='))) {
      router.replace('/admin/dashboard');
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [productToPublishId, setProductToPublishId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<AdminProduct | AdminVendor | AdminOrder | null>(null);
  const [viewingItem, setViewingItem] = useState<AdminProduct | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);


  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productLoadError, setProductLoadError] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [productLimit, setProductLimit] = useState(PRODUCT_PAGE_LIMIT);
  const [productTotal, setProductTotal] = useState(0);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [publishingProductId, setPublishingProductId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [categories, setCategories] = useState<ProductCategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [filterCategoryId, setFilterCategoryId] = useState('all');
  const [filterSubcategoryId, setFilterSubcategoryId] = useState('all');
  const [filterSubcategories, setFilterSubcategories] = useState<ProductCategoryOption[]>([]);
  const [filterVendorId, setFilterVendorId] = useState('all');
  const [filterVendors, setFilterVendors] = useState<Array<{ value: string; label: string }>>([]);
  const [subcategoryMap, setSubcategoryMap] = useState<Map<string, { categoryName: string; subCategoryName: string }>>(new Map());

  const ADMIN_ROLES = ['ADMIN', 'admin'];
  const SUPER_ADMIN_ROLES = ['SUPER-ADMIN', 'super-admin', 'SUPER_ADMIN'];
  const userRoleNormalized = String(authUser?.role || '').toLowerCase().replace('_', '-');
  const hasAdminRole = Boolean(authUser && (ADMIN_ROLES.includes(authUser.role) || SUPER_ADMIN_ROLES.includes(authUser.role) || userRoleNormalized === 'admin' || userRoleNormalized === 'super-admin'));

  // Initialize products as empty array (will be populated from API)
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  useEffect(() => {
    if (paramTab) {
      setActiveTab(paramTab as any);
    }
  }, [paramTab]);

  useEffect(() => {
    if (paramOrderId) {
      const cleanId = String(paramOrderId).replace('#', '');
      const matched = orders.find(
        (o) =>
          String(o.id).replace('#', '') === cleanId ||
          String((o as any).orderNumber || '').replace('#', '') === cleanId
      );
      if (matched) {
        setEditingItem(matched);
      } else {
        // Stub: pass orderNumber so OrderDetailsModal uses getByNumber endpoint
        setEditingItem({
          id: paramOrderId,
          orderNumber: paramOrderId,
          user: { name: 'Order Details', avatar: '' },
          items: '1 item',
          total: 0,
          address: 'Customer Address',
          date: new Date().toLocaleDateString(),
          status: 'Ongoing',
          paymentStatus: 'Paid',
        });
      }
      setActiveTab('orders');
      setIsModalOpen(true);
    }
  }, [paramOrderId, orders]);

  // User States
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit] = useState(10);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersLoadError, setUsersLoadError] = useState('');
  const [usersSortBy, setUsersSortBy] = useState('createdAt-desc');
  const [usersStatusFilter, setUsersStatusFilter] = useState('All');
  const [usersAuthFilter, setUsersAuthFilter] = useState('All');
  const [usersDateFrom, setUsersDateFrom] = useState('');
  const [usersDateTo, setUsersDateTo] = useState('');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersLoadError, setOrdersLoadError] = useState('');

  const handleViewUser = (user: AppUser) => {
    setSelectedUser(user);
    setIsViewUserModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    if (typeof window !== 'undefined' && window.location.search.includes('orderId')) {
      router.replace('/admin/dashboard?tab=orders');
    }
  };

  const handleBlockUser = async (id: string) => {
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'blocked' as const } : u));
    try {
      await authApi.blockUser(id);
      toast.success('User blocked successfully');
    } catch (error) {
      // Revert on failure
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' as const } : u));
      toast.error(getApiErrorMessage(error) || 'Could not block user. Please try again.');
    }
  };

  const handleUnblockUser = async (id: string) => {
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' as const } : u));
    try {
      await authApi.unblockUser(id);
      toast.success('User unblocked successfully');
    } catch (error) {
      // Revert on failure
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'blocked' as const } : u));
      toast.error(getApiErrorMessage(error) || 'Could not unblock user. Please try again.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await authApi.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setUsersTotal(prev => Math.max(0, prev - 1));
      toast.success('User deleted successfully');
    } catch (error) {
      const msg = getApiErrorMessage(error) || 'Could not delete user. Please try again.';
      toast.error(msg);
    }
  };

  const openModal = (item: AdminProduct | AdminVendor | AdminOrder | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openProductModal = (item: ProductTableItem) => {
    openModal({
      ...item,
      image: typeof item.image === 'string' ? item.image : item.image.src,
    });
  };

  const openViewModal = (item: AdminProduct) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const resolvedProducts = useMemo(() => {
    return products.map((p) => {
      let resolvedCategory = p.category || '';
      let resolvedSubCategory = p.subCategory || '';

      if (p.categoryId) {
        const subEntry = subcategoryMap.get(p.categoryId);
        if (subEntry) {
          resolvedCategory = subEntry.categoryName;
          resolvedSubCategory = subEntry.subCategoryName;
        } else {
          const parentCat = categories.find((c) => c.id === p.categoryId);
          if (parentCat) {
            resolvedCategory = parentCat.name;
            resolvedSubCategory = '';
          }
        }
      }

      return {
        ...p,
        category: resolvedCategory,
        subCategory: resolvedSubCategory,
      };
    });
  }, [products, categories, subcategoryMap]);

  useEffect(() => {
    let isMounted = true;

    const resolveCurrentUserId = async () => {
      setIsCheckingAuth(true);
      const reduxUserId = authUser?.id;
      if (reduxUserId) {
        setCurrentUserId(reduxUserId);
        setIsCheckingAuth(false);
        return;
      }

      const storedUserId = getStoredUserId();
      if (storedUserId) {
        setCurrentUserId(storedUserId);
        setIsCheckingAuth(false);
        return;
      }

      if (typeof window === 'undefined' || !localStorage.getItem('accessToken')) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await authApi.getProfile();
        const profileData = response?.data ?? response;
        const profileUserId = profileData?.user?.id || profileData?.id;
        if (isMounted && profileUserId) {
          setCurrentUserId(String(profileUserId));
          dispatch(
            setUser({
              id: String(profileUserId),
              email: profileData?.email || profileData?.user?.email || '',
              firstName: profileData?.firstName || profileData?.user?.firstName || '',
              lastName: profileData?.lastName || profileData?.user?.lastName || '',
              profilePicture: profileData?.avatar || profileData?.profilePicture || undefined,
              role: profileData?.role || profileData?.user?.role || '',
              isEmailVerified: profileData?.isEmailVerified ?? true,
            })
          );
        }
      } catch {
        if (isMounted) {
          setCurrentUserId('');
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    resolveCurrentUserId();

    return () => {
      isMounted = false;
    };
  }, [authUser?.id, dispatch]);

  useEffect(() => {
    if (isCheckingAuth || !hasAdminRole) return;

    let isMounted = true;

    const fetchCategories = async () => {
      setIsLoadingCategories(true);

      try {
        const response = await categoryApi.getCategories({
          page: 1,
          limit: 20,
          sortBy: 'name',
          sortOrder: 'asc',
        });
        const fetchedCategories = getCategoryList(response)
          .map(normalizeCategory)
          .filter((category): category is (ProductCategoryOption & { isActive: boolean }) => Boolean(category))
          .filter((category) => category.isActive);

        if (isMounted) {
          setCategories(fetchedCategories);

          const map = new Map<string, { categoryName: string; subCategoryName: string }>();
          try {
            await Promise.all(
              fetchedCategories.map(async (cat) => {
                try {
                  const subRes = await categoryApi.getSubcategories(cat.id);
                  const subs = getCategoryList(subRes)
                    .map(normalizeCategory)
                    .filter((s): s is (ProductCategoryOption & { isActive: boolean }) => Boolean(s));
                  subs.forEach((sub) => {
                    map.set(sub.id, { categoryName: cat.name, subCategoryName: sub.name });
                  });
                } catch {
                  // Subcategories unavailable for this category — skip
                }
              })
            );
          } catch {
            // Best-effort, no crash
          }

          if (isMounted) setSubcategoryMap(map);
        }
      } catch (error) {
        if (isMounted) {
          setProductLoadError(
            getApiErrorMessage(error) || 'Could not load product categories.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [isCheckingAuth, hasAdminRole]);

  // Fetch vendor list for the filter dropdown
  useEffect(() => {
    if (isCheckingAuth || !hasAdminRole) return;
    let isMounted = true;
    const fetchVendors = async () => {
      try {
        const stores = await productApi.getStores();
        const mappedStores = (Array.isArray(stores) ? stores : [])
          .filter((store: any) => store?.storeName || store?.storeSlug || store?.id)
          .map((store: any) => ({
            value: store.vendorProfileId || store.id || '',
            label: store.storeName || store.storeSlug || 'Unnamed Store',
          }))
          .filter((store) => Boolean(store.value));

        if (isMounted && mappedStores.length > 0) {
          setFilterVendors(mappedStores);
          return;
        }

        const response = await adminVendorApi.listVendors({ status: 'approved', limit: 200 });
        const vendors = response?.data?.vendors || [];
        if (isMounted) {
          setFilterVendors(
            vendors
              .filter((v: any) => v.storeName || v.vendorProfileId || v.id)
              .map((v: any) => ({
                value: v.vendorProfileId || v.id || '',
                label: v.storeName || 'Unnamed Store',
              }))
              .filter((option) => Boolean(option.value))
          );
        }
      } catch {
        if (isMounted) setFilterVendors([]);
      }
    };
    void fetchVendors();
    return () => { isMounted = false; };
  }, [isCheckingAuth, hasAdminRole]);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setProductLoadError('');

    try {
      const vendorId = filterVendorId !== 'all' ? filterVendorId : undefined;
      const response = await productApi.getAllProducts({
        page: productPage,
        limit: PRODUCT_PAGE_LIMIT,
        searchQuery: searchQuery || undefined,
        categoryId: filterSubcategoryId !== 'all' ? filterSubcategoryId : (filterCategoryId !== 'all' ? filterCategoryId : undefined),
        ...(vendorId ? { vendorId } : {}),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      const fetchedProducts = getProductList(response)
        .map(normalizeProduct)
        .filter((product): product is AdminProduct => Boolean(product));
      const pagination = getProductPagination(response, fetchedProducts.length);

      setProducts(fetchedProducts);
      setProductLimit(pagination.limit);
      setProductTotal(pagination.total);
      setProductTotalPages(pagination.totalPages);
    } catch (error) {
      // Show error — never fall back to dummy data
      setProducts([]);
      setProductTotal(0);
      setProductTotalPages(1);
      setProductLoadError(
        getApiErrorMessage(error) || 'Could not load products. Please try again.'
      );
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (isCheckingAuth || !hasAdminRole) return;

    let isMounted = true;

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      setProductLoadError('');

      try {
        const vendorId = filterVendorId !== 'all' ? filterVendorId : undefined;
        const response = await productApi.getAllProducts({
          page: productPage,
          limit: PRODUCT_PAGE_LIMIT,
          searchQuery: searchQuery || undefined,
          categoryId: filterSubcategoryId !== 'all' ? filterSubcategoryId : (filterCategoryId !== 'all' ? filterCategoryId : undefined),
          ...(vendorId ? { vendorId } : {}),
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        const fetchedProducts = getProductList(response)
          .map(normalizeProduct)
          .filter((product): product is AdminProduct => Boolean(product));
        const pagination = getProductPagination(response, fetchedProducts.length);

        if (!isMounted) return;

        setProducts(fetchedProducts);
        setProductLimit(pagination.limit);
        setProductTotal(pagination.total);
        setProductTotalPages(pagination.totalPages);
      } catch (error) {
        if (!isMounted) return;
        // Show error — never fall back to dummy data
        setProducts([]);
        setProductTotal(0);
        setProductTotalPages(1);
        setProductLoadError(
          getApiErrorMessage(error) || 'Could not load products. Please try again.'
        );
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [isCheckingAuth, hasAdminRole, productPage, searchQuery, filterCategoryId, filterSubcategoryId, filterVendorId]);

  const resolveAmount = (value: any): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
    if (typeof value === 'object' && value !== null) {
      return resolveAmount(value.amount ?? value.total ?? value.value ?? value.grandTotal ?? value.orderTotal);
    }
    return 0;
  };

  const mapOrderToRow = (order: any, customerUsers: AppUser[] = users) => {
    const customerId =
      order.customer?.id ||
      order.customer?.uuid ||
      order.customer?.customerId ||
      order.customer?.customerUuid ||
      order.customerId ||
      order.customerUuid ||
      order.user?.id ||
      order.user?.uuid ||
      order.userId ||
      order.userUuid ||
      order.customer_uuid ||
      order.customerUuid ||
      '';

    const fallbackCustomerName =
      order.customer?.name ||
      order.customerName ||
      [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(' ') ||
      order.user?.name ||
      'Customer';

    const matchingCustomer = customerUsers.find((user) => {
      const userIds = [user.id, (user as any).uuid, (user as any)._id, (user as any).customerId, (user as any).customerUuid].filter(Boolean);
      return userIds.some((candidate) => String(candidate).toLowerCase() === String(customerId).toLowerCase());
    });

    const customerName = matchingCustomer
      ? [matchingCustomer.firstName, matchingCustomer.lastName].filter(Boolean).join(' ') || matchingCustomer.fullName || matchingCustomer.email || fallbackCustomerName
      : fallbackCustomerName;

    const getOrderStatus = (status: any) => {
      if (!status) return 'Ongoing';
      const normalized = String(status).toLowerCase();
      if (normalized.includes('delivered')) return 'Delivered';
      if (normalized.includes('cancel') || normalized.includes('cancelled')) return 'Cancelled';
      if (normalized.includes('return') || normalized.includes('refunded')) return 'Returned';
      return 'Ongoing';
    };

    const getPaymentStatus = (status: any) => {
      if (!status) return 'Pending';
      const normalized = String(status).toLowerCase();
      if (normalized.includes('paid') || normalized.includes('success') || normalized.includes('completed')) return 'Paid';
      if (normalized.includes('refund')) return 'Refunded';
      if (normalized.includes('fail') || normalized.includes('failed')) return 'Failed';
      return 'Pending';
    };

    const itemCount = Array.isArray(order.items)
      ? order.items.length
      : order.itemCount ?? order.totalItems ?? order.items?.length ?? 0;

    const address =
      order.shippingAddress?.addressLine1 ||
      order.shippingAddress?.address ||
      order.deliveryAddress ||
      order.address ||
      '';

    return {
      id: String(order.orderNumber || order.id || order._id || ''),
      orderNumber: String(order.orderNumber || order.id || order._id || ''),
      orderId: String(order.id || order._id || ''),
      user: {
        name: customerName,
        avatar: order.customer?.avatar || order.customer?.profilePicture || order.user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(customerName),
      },
      items: `${itemCount} item${itemCount === 1 ? '' : 's'}`,
      total: resolveAmount(order.totalAmount ?? order.total ?? order.grandTotal ?? order.amount ?? order.orderTotal ?? 0),
      address,
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : String(order.date || ''),
      status: getOrderStatus(order.status || order.paymentStatus),
      paymentStatus: getPaymentStatus(order.paymentStatus || order.status),
    };
  };

  const loadOrders = useCallback(async (signal: { current: boolean }) => {
    if (isCheckingAuth || !hasAdminRole || activeTab !== 'orders' || !signal.current) return;
    setIsLoadingOrders(true);
    setOrdersLoadError('');

    try {
      const customerUsersResponse = users.length
        ? { data: users }
        : await authApi.searchUsers({ page: 1, limit: 100 });
      const customerUsersPayload = (customerUsersResponse as any)?.data ?? customerUsersResponse;
      const customerUserList = Array.isArray(customerUsersPayload?.users)
        ? customerUsersPayload.users
        : Array.isArray(customerUsersPayload?.data)
          ? customerUsersPayload.data
          : Array.isArray(customerUsersPayload)
            ? customerUsersPayload
            : [];
      const resolvedCustomerUsers = customerUserList.map((user: any) => ({
        ...user,
        id: String(user.id || user._id || ''),
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        fullName: user.fullName || user.full_name || [user.firstName, user.lastName].filter(Boolean).join(' '),
      })) as AppUser[];

      const response = await ordersApi.search({
        page: 1,
        limit: 50,
        searchQuery: searchQuery || undefined,
      });

      const payload = (response as any)?.data ?? response;
      const list = Array.isArray(payload?.orders)
        ? payload.orders
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

      if (!signal.current) return;
      setOrders(list.map((order: any) => mapOrderToRow(order, resolvedCustomerUsers)));
    } catch (error) {
      if (!signal.current) return;
      setOrders([]);
      setOrdersLoadError(getApiErrorMessage(error) || 'Could not load orders. Please try again.');
    } finally {
      if (signal.current) setIsLoadingOrders(false);
    }
  }, [activeTab, hasAdminRole, isCheckingAuth, searchQuery, users]);

  useEffect(() => {
    const signal = { current: true };
    void loadOrders(signal);
    return () => { signal.current = false; };
  }, [loadOrders]);

  // Users fetching effect — triggered when users tab is active
  useEffect(() => {
    if (isCheckingAuth || !hasAdminRole || activeTab !== 'users') return;
    let isMounted = true;

    const loadUsers = async () => {
      setIsLoadingUsers(true);
      setUsersLoadError('');

      try {
        let emailParam: string | undefined;
        let phoneParam: string | undefined;
        let firstParam: string | undefined;
        let lastParam: string | undefined;

        if (searchQuery) {
          const trimmed = searchQuery.trim();
          if (trimmed.includes('@')) {
            emailParam = trimmed;
          } else if (/^\+?[0-9\s\-()]+$/.test(trimmed)) {
            phoneParam = trimmed;
          } else {
            const parts = trimmed.split(/\s+/);
            if (parts.length > 1) {
              firstParam = parts[0];
              lastParam = parts.slice(1).join(' ');
            } else {
              firstParam = trimmed;
            }
          }
        }

        const [field, dir] = usersSortBy.split('-');
        const sortField = field === 'createdAt' || field === 'updatedAt' ? field : 'createdAt';
        const sortOrder = dir === 'asc' || dir === 'desc' ? dir : 'desc';

        const isActiveFilter = usersStatusFilter === 'active' ? true : (usersStatusFilter === 'blocked' ? false : undefined);

        const response = await authApi.searchUsers({
          page: usersPage,
          limit: usersLimit,
          searchQuery: searchQuery.trim() || undefined,
          isActive: isActiveFilter,
          email: emailParam,
          firstName: firstParam,
          lastName: lastParam,
          phoneNumber: phoneParam,
          sortBy: sortField as any,
          sortOrder: sortOrder as any,
        });

        if (!isMounted) return;

        const userList = getUserList(response);
        const normalized = userList.map(normalizeAppUser);
        const pagination = getUserPagination(response, normalized.length);

        setUsers(normalized);
        setUsersTotal(pagination.total);
        setUsersTotalPages(pagination.totalPages);
      } catch (error) {
        if (!isMounted) return;
        setUsers([]);
        setUsersTotal(0);
        setUsersTotalPages(1);
        setUsersLoadError(getApiErrorMessage(error) || 'Failed to load users.');
      } finally {
        if (isMounted) setIsLoadingUsers(false);
      }
    };

    loadUsers();
    return () => { isMounted = false; };
  }, [isCheckingAuth, hasAdminRole, activeTab, usersPage, searchQuery, usersSortBy, usersStatusFilter]);

  // Reset users page when search or sort changes
  useEffect(() => {
    setUsersPage(1);
  }, [searchQuery, usersSortBy, usersStatusFilter]);


  // Subcategory filter loader
  useEffect(() => {
    if (isCheckingAuth || !hasAdminRole) return;

    let isMounted = true;
    if (filterCategoryId === 'all') {
      setFilterSubcategories([]);
      setFilterSubcategoryId('all');
      return;
    }

    const fetchSubs = async () => {
      try {
        const response = await categoryApi.getSubcategories(filterCategoryId);
        const list = getCategoryList(response)
          .map(normalizeCategory)
          .filter((c): c is (ProductCategoryOption & { isActive: boolean }) => Boolean(c))
          .filter(c => c.isActive);
        if (isMounted) {
          setFilterSubcategories(list);
          setFilterSubcategoryId('all');
        }
      } catch (error) {
        console.error('Error fetching filter subcategories', error);
        if (isMounted) setFilterSubcategories([]);
      }
    };
    void fetchSubs();
    return () => { isMounted = false; };
  }, [isCheckingAuth, hasAdminRole, filterCategoryId]);


  const handleSaveProduct = async (formData: ProductFormData) => {
    if (activeTab !== 'products') return;

    setIsSavingProduct(true);
    setProductLoadError('');

    try {
      const productFormData = {
        ...formData,
        vendorProfileId: formData.vendorProfileId,
      };

      if (!productFormData.vendorProfileId) {
        const message = 'Please select a store/vendor for this product.';
        setProductLoadError(message);
        throw new Error(message);
      }

      const response = formData.id
        ? await productApi.updateProduct(formData.id, buildProductPayload(productFormData, categories))
        : await productApi.createProduct(buildProductPayload(productFormData, categories));
      const savedProduct = normalizeProduct(response?.data);

      if (savedProduct) {
        setProducts((prev) => {
          const existingIndex = prev.findIndex((product) => product.id === savedProduct.id);
          if (existingIndex < 0) return [savedProduct, ...prev];

          const next = [...prev];
          next[existingIndex] = savedProduct;
          return next;
        });
      } else {
        await fetchProducts();
      }
    } catch (error) {
      const message =
        getApiErrorMessage(error) || 'Could not save product. Please check the product details and try again.';
      setProductLoadError(message);
      throw error;
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handlePublishClick = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (product && product.images && product.images.length > 0) {
      const toastId = toast.loading('Publishing product…');
      setPublishingProductId(id);
      try {
        const response = await productApi.publishProduct(id);
        const publishedProduct = normalizeProduct(response?.data);
        if (publishedProduct) {
          setProducts(prev => prev.map(p => p.id === id ? publishedProduct : p));
        } else {
          await fetchProducts();
        }
        toast.success('Product published successfully!', { id: toastId });
      } catch (error) {
        toast.error('Failed to publish product.', { id: toastId });
        setProductLoadError(
          getApiErrorMessage(error) ||
          'Could not publish product. Products need images and stock before publishing.'
        );
      } finally {
        setPublishingProductId(null);
      }
    } else {
      setProductToPublishId(id);
      setIsImageModalOpen(true);
    }
  };

  const handleImageComplete = async (images: { file: File; alt: string }[]) => {
    if (!productToPublishId) return;
    setIsImageModalOpen(false);

    const toastId = toast.loading('Uploading images…');
    setPublishingProductId(productToPublishId);

    try {
      setProductLoadError('');

      if (images.length > 0) {
        toast.loading('Uploading images to storage…', { id: toastId });
        const uploaded = await uploadImages(
          images.map(img => ({ file: img.file, altText: img.alt })),
          'products'
        );
        toast.loading('Saving image data…', { id: toastId });
        await productApi.updateProduct(productToPublishId, { images: uploaded });
      } else {
        toast.error('Images are required to publish this product.', { id: toastId });
        setProductToPublishId(null);
        setPublishingProductId(null);
        return;
      }

      toast.loading('Publishing product…', { id: toastId });
      const response = await productApi.publishProduct(productToPublishId);
      const publishedProduct = normalizeProduct(response?.data);

      if (publishedProduct) {
        setProducts(prev => prev.map(p => p.id === productToPublishId ? publishedProduct : p));
      } else {
        await fetchProducts();
      }
      toast.success('Product published successfully!', { id: toastId });
    } catch (error) {
      toast.error('Failed to publish product.', { id: toastId });
      setProductLoadError(
        getApiErrorMessage(error) ||
        'Could not publish product. Products need images and stock before publishing.'
      );
    } finally {
      setPublishingProductId(null);
      setProductToPublishId(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setProductLoadError('');

    try {
      await productApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      setProductLoadError(
        getApiErrorMessage(error) || 'Could not delete product. Please try again.'
      );
    }
  };

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

  useEffect(() => {
    if (!isCheckingAuth && !hasToken && !authUser) {
      toast.error('Session expired. Please log in again.');
      router.push('/admin/login');
    }
  }, [isCheckingAuth, hasToken, authUser, router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#228b22]/20 border-t-[#228b22] rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-600 ">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!hasToken && !authUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">

        <div className="w-full max-w-md bg-white rounded-md shadow-sm border border-slate-100 p-8 text-center relative z-10 animate-in zoom-in-95 duration-200">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
              <svg className="w-12 h-12 text-amber-500 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Session Expired</h2>
          <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed">
            Your login session has expired. Please sign in again to continue managing the dashboard.
          </p>
          <button
            onClick={() => router.push('/admin/login')}
            className="w-full mt-8 bg-[#228b22] hover:bg-[#1c711c] text-white py-3.5 rounded-md font-bold flex items-center justify-center gap-2 transition-all shadow-sm "
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  if (authUser && !hasAdminRole) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">

        <div className="w-full max-w-md bg-white rounded-md shadow-sm border border-slate-100 p-8 text-center relative z-10 animate-in zoom-in-95 duration-200">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-50 p-4 rounded-md border border-brand-100">
              <svg className="w-12 h-12 text-[#228b22]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Unauthorized Access</h2>
          <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed">
            You do not have Admin privileges to access this dashboard. This portal is restricted to Admins only.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full mt-8 bg-[#228b22] hover:bg-[#1c711c] text-white py-3.5 rounded-md font-bold flex items-center justify-center gap-2 transition-all shadow-sm "
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] flex-col md:flex-row relative">

      {/* Session Timeout Warning */}
      <SessionTimeoutModal loginPath="/admin/login" />

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-1.5 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/brand/ekivamart-logo.svg" alt="EkivaMart" width={100} height={28} className="object-contain" />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <button aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md -mr-2">
            <Menu size={24} />
          </button>
        </div>
      </div>

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={(t) => { handleTabChange(t); setIsSidebarOpen(false); }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="ek-workspace ek-admin-workspace flex-1 w-full min-w-0 overflow-x-hidden" data-section={activeTab}>
        {/* Desktop Top Header Bar */}
        <div className="hidden md:flex items-center justify-between gap-6 mb-5 border-b border-slate-200 pb-4">
          <p className="text-sm font-medium text-slate-500">EkivaMart <span className="mx-2 text-slate-300">/</span> Administration</p>
          <div className="flex shrink-0 items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center font-semibold text-slate-700 text-sm border border-slate-200">
                {authUser?.firstName?.[0] || 'A'}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {authUser?.firstName || 'Admin'} {authUser?.lastName || 'User'}
                </p>
                <p className="text-[11px] text-gray-500 truncate max-w-[180px]">
                  Admin · {authUser?.email || 'Account'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <AdminDashboardView onNavigate={(tab: string) => handleTabChange(tab)} />
        ) : activeTab === 'notifications' ? (
          <NotificationsView />
        ) : activeTab === 'specialists' ? (
          <VendorSpecialistsView />
        ) : activeTab === 'waitlist' ? (
          <WaitlistView />

        ) : activeTab === 'users' ? (
          <>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Users</h2>
              </div>
            </header>

            <div className="bg-white p-4 rounded-md border border-gray-200 mb-6 flex items-center gap-3 shadow-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-200 transition-all">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                className="flex-1 outline-none text-sm font-medium focus:!ring-0 focus:!border-transparent"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setUsersPage(1); }}
              />
            </div>

            {usersLoadError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 mb-4">
                {usersLoadError}
              </div>
            )}

            <UserTable
              data={users}
              onView={handleViewUser}
              onBlock={handleBlockUser}
              onUnblock={handleUnblockUser}
              onDelete={handleDeleteUser}
              currentPage={usersPage}
              totalPages={usersTotalPages}
              totalItems={usersTotal}
              itemsPerPage={usersLimit}
              onPageChange={setUsersPage}
              isLoading={isLoadingUsers}
              sortBy={usersSortBy}
              onSortByChange={(s) => { setUsersSortBy(s); setUsersPage(1); }}
              statusFilter={usersStatusFilter}
              onStatusFilterChange={(s) => { setUsersStatusFilter(s); setUsersPage(1); }}
              authFilter={usersAuthFilter}
              onAuthFilterChange={(a) => { setUsersAuthFilter(a); setUsersPage(1); }}
              dateFrom={usersDateFrom}
              onDateFromChange={setUsersDateFrom}
              dateTo={usersDateTo}
              onDateToChange={setUsersDateTo}
            />
          </>
        ) : (
          <>
            <header className="flex flex-wrap justify-between items-center gap-3 mb-5">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 capitalize">{activeTab}</h1>
              </div>
              {activeTab === 'products' && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setIsCategoriesModalOpen(true)}
                    className="min-h-10 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-4 text-sm font-medium whitespace-nowrap"
                  >
                    Manage categories
                  </button>
                  <button
                    onClick={() => openModal()}
                    className="min-h-10 bg-[#176a35] hover:bg-[#12582b] text-white px-4 text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={16} /> Add product
                  </button>
                </div>
              )}
            </header>

            {activeTab === 'products' && (
              <div className="bg-white p-4 rounded-md border border-gray-200 mb-6 flex items-center gap-3 shadow-sm focus-within:border-[#228b22] focus-within:ring-2 focus-within:ring-[#228b22]/20 transition-all">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}…`}
                  className="flex-1 outline-none text-sm font-medium focus:!ring-0 focus:!border-transparent"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setProductPage(1);
                  }}
                />
              </div>
            )}

            {activeTab === 'products' && (
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select
                  value={filterCategoryId}
                  onChange={(e) => {
                    setFilterCategoryId(e.target.value);
                    setProductPage(1);
                  }}
                  className="p-3 rounded-md border border-gray-200 bg-white text-sm font-medium focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22] outline-none transition flex-1"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {filterCategoryId !== 'all' && <select
                  value={filterSubcategoryId}
                  onChange={(e) => {
                    setFilterSubcategoryId(e.target.value);
                    setProductPage(1);
                  }}
                  className="p-3 rounded-md border border-gray-200 bg-white text-sm font-medium focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22] outline-none transition flex-1 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="all">All Subcategories</option>
                  {filterSubcategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>}

                <select
                  value={filterVendorId}
                  onChange={(e) => {
                    setFilterVendorId(e.target.value);
                    setProductPage(1);
                  }}
                  className="p-3 rounded-md border border-gray-200 bg-white text-sm font-medium focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22] outline-none transition flex-1"
                >
                  <option value="all">All Vendors</option>
                  {filterVendors.map((vendor) => (
                    <option key={vendor.value} value={vendor.value}>{vendor.label}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-3">
                {(isLoadingProducts || isSavingProduct || productLoadError) && (
                  <div className={`rounded-md border px-4 py-3 text-sm font-medium ${productLoadError
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-gray-200 bg-white text-gray-500'
                    }`}>
                    {productLoadError || (isSavingProduct ? 'Saving product...' : 'Loading products...')}
                  </div>
                )}
                <ProductTable
                  data={resolvedProducts}
                  onEdit={openProductModal}
                  onView={(item, section) => openViewModal({
                    ...item,
                    initialSection: section || 'overview',
                    image: typeof item.image === 'string' ? item.image : item.image.src,
                  } as AdminProduct)}
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
              </div>
            )}
            {activeTab === 'vendors' && (
              <VendorManagementView isSuperAdmin={false} currentUserId={currentUserId} />
            )}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {ordersLoadError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {ordersLoadError}
                  </div>
                )}
                {isLoadingOrders ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />
                  </div>
                ) : (
                  <OrderTable data={orders} searchQuery={searchQuery} onViewDetails={openModal} />
                )}
              </div>
            )}
            {activeTab === 'taxes' && (
              <TaxRulesManagement />
            )}
            {activeTab === 'blog' && (
              <BlogManagementView />
            )}
          </>
        )}

        <ActionModal
          isOpen={isModalOpen && activeTab !== 'orders'}
          onClose={() => setIsModalOpen(false)}
          activeTab={activeTab}
          editingItem={activeTab === 'products' && editingItem ? editingItem as AdminProduct : undefined}
          categories={categories}
          isLoadingCategories={isLoadingCategories}
          currentUserId={currentUserId}
          onSave={handleSaveProduct}
        />

        <ViewProductModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          product={viewingItem}
        />

        <CategoriesModal
          isOpen={isCategoriesModalOpen}
          onClose={() => {
            setIsCategoriesModalOpen(false);
          }}
        />

        <ImageUploadModal
          isOpen={isImageModalOpen}
          onClose={() => { setIsImageModalOpen(false); setProductToPublishId(null); }}
          onComplete={handleImageComplete}
          onSkip={() => handleImageComplete([])}
        />

        <ViewUserModal
          isOpen={isViewUserModalOpen}
          onClose={() => setIsViewUserModalOpen(false)}
          user={selectedUser}
        />

        <OrderDetailsModal
          isOpen={isModalOpen && activeTab === 'orders'}
          onClose={handleCloseOrderModal}
          order={editingItem}
          onOrderUpdated={() => {
            const signal = { current: true };
            void loadOrders(signal);
          }}
        />
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#228b22]/20 border-t-[#228b22] rounded-full animate-spin" />
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
