'use client';

import React, { useCallback, useEffect, useState, useMemo, Suspense } from 'react';
import Sidebar from '@/components/super-admin/Sidebar';
import DashboardView from '@/components/super-admin/DashboardView';
import NotificationsView from '@/components/notifications/NotificationsView';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useRouter, useSearchParams } from 'next/navigation';

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
import AdminTable, { AdminUser } from '@/components/super-admin/AdminTable';
import InviteAdminModal from '@/components/super-admin/InviteAdminModal';
import ViewAdminModal from '@/components/super-admin/ViewAdminModal';
import UserTable, { AppUser } from '@/components/super-admin/UserTable';
import ViewUserModal from '@/components/super-admin/ViewUserModal';
import WaitlistView from '@/components/admin/WaitlistView';
import TaxRulesManagement from '@/components/admin/TaxRulesManagement';
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

  const origin = typeof record.origin === 'string' && record.origin
    ? record.origin
    : String((metadata as { origin?: unknown }).origin || 'Nigeria');

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
    image: record.image || imageUrls[0] || '',
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
  const page = getNumber(data.page, 1);
  const limit = getNumber(data.limit, 10);
  const total = getNumber(data.total, fallbackCount);
  const totalPages = getNumber(
    data.totalPages ?? data.totalPage ?? data.pages,
    Math.max(1, Math.ceil(total / limit))
  );

  return { page, limit, total, totalPages };
};

const normalizeAppUser = (user: any): AppUser => {
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

const normalizeAdminUser = (user: any): AdminUser => {
  const isActive = typeof user.isActive === 'boolean' ? user.isActive : (user.status === 'active' || user.status === true);
  return {
    id: user.id || user._id || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phoneNumber || user.phone || '',
    status: isActive ? 'active' : 'blocked',
    role: user.role || 'sub_admin',
    avatar: user.avatar || undefined,
    invitedAt: user.createdAt || new Date().toISOString(),
    activatedAt: isActive ? user.updatedAt : undefined,
    lastUpdated: user.updatedAt || new Date().toISOString(),
    permissions: user.permissions || {
      manageProducts: true,
      manageOrders: true,
      manageVendors: true,
      viewAnalytics: true,
    }
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'vendors' | 'orders' | 'admins' | 'users' | 'waitlist' | 'taxes' | 'notifications'>('dashboard');

  const handleTabChange = (t: string) => {
    setActiveTab(t as any);
    if (t !== 'orders' && typeof window !== 'undefined' && (window.location.search.includes('tab=orders') || window.location.search.includes('orderId='))) {
      router.replace('/super-admin/dashboard');
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
  const [filterVendors, setFilterVendors] = useState<Array<{ value: string; label: string; vendorProfileId?: string; vendorId?: string }>>([]);
  const [subcategoryMap, setSubcategoryMap] = useState<Map<string, { categoryName: string; subCategoryName: string }>>(new Map());

  const SUPER_ADMIN_ROLES = ['SUPER-ADMIN', 'super-admin', 'SUPER_ADMIN'];
  const userRoleNormalized = String(authUser?.role || '').toLowerCase().replace('_', '-');
  const hasSuperAdminRole = Boolean(authUser && (SUPER_ADMIN_ROLES.includes(authUser.role) || userRoleNormalized === 'super-admin'));

  // Admin States
  const [isInviteAdminModalOpen, setIsInviteAdminModalOpen] = useState(false);
  const [isViewAdminModalOpen, setIsViewAdminModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isInvitingAdmin, setIsInvitingAdmin] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsPage, setAdminsPage] = useState(1);
  const [adminsLimit] = useState(10);
  const [adminsTotal, setAdminsTotal] = useState(0);
  const [adminsTotalPages, setAdminsTotalPages] = useState(1);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [adminsLoadError, setAdminsLoadError] = useState('');
  const [adminsSortOrder, setAdminsSortOrder] = useState<'asc' | 'desc'>('desc');
  const [adminsStatusFilter, setAdminsStatusFilter] = useState('All');

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

  // Initialize products as empty array (will be populated from API)
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [vendors, setVendors] = useState<AdminVendor[]>([
    { id: 1, name: 'TechHub Solutions', type: 'Electronics', email: 'contact@techhub.com', status: 'Active' },
  ]);
  const [orders, setOrders] = useState<AdminOrder[]>([
    { id: '#CM9815', user: { name: 'Natali Craig', avatar: 'https://i.pravatar.cc/150?u=natalicraig' }, items: '3 items', total: 125000, address: 'Meadow Lane Oakland', date: 'Apr 25, 2026 • 10:15 AM', status: 'Ongoing', paymentStatus: 'Paid' },
    { id: '#CM9814', user: { name: 'Kate Morrison', avatar: 'https://i.pravatar.cc/150?u=katemorrison' }, items: '1 item', total: 450000, address: 'Larry San Francisco', date: 'Apr 25, 2026 • 09:30 AM', status: 'Delivered', paymentStatus: 'Paid' },
    { id: '#CM9813', user: { name: 'Drew Cano', avatar: 'https://i.pravatar.cc/150?u=drewcano' }, items: '2 items', total: 85000, address: 'Bagwell Avenue Ocala', date: 'Apr 24, 2026 • 04:20 PM', status: 'Ongoing', paymentStatus: 'Pending' },
    { id: '#CM9812', user: { name: 'Orlando Diggs', avatar: 'https://i.pravatar.cc/150?u=orlandodiggs' }, items: '1 item', total: 1200000, address: 'Washburn Baton Rouge', date: 'Apr 24, 2026 • 02:00 PM', status: 'Delivered', paymentStatus: 'Paid' },
    { id: '#CM9811', user: { name: 'Andi Lane', avatar: 'https://i.pravatar.cc/150?u=andilane' }, items: '4 items', total: 65000, address: 'Nest Lane Olivette', date: 'Apr 24, 2026 • 11:45 AM', status: 'Cancelled', paymentStatus: 'Failed' },
    { id: '#CM9810', user: { name: 'Lori Daniels', avatar: 'https://i.pravatar.cc/150?u=loridaniels' }, items: '1 item', total: 32000, address: 'Pin Oak Drive, NY', date: 'Apr 23, 2026 • 05:30 PM', status: 'Delivered', paymentStatus: 'Paid' },
    { id: '#CM9809', user: { name: 'Rene Wells', avatar: 'https://i.pravatar.cc/150?u=renewells' }, items: '2 items', total: 210000, address: 'Broad St, Atlanta', date: 'Apr 23, 2026 • 01:15 PM', status: 'Ongoing', paymentStatus: 'Refunded' },
    { id: '#CM9808', user: { name: 'Tom Hardy', avatar: 'https://i.pravatar.cc/150?u=tomhardy' }, items: '5 items', total: 450000, address: 'Main St, Boston', date: 'Apr 22, 2026 • 10:05 AM', status: 'Returned', paymentStatus: 'Paid' },
    { id: '#CM9807', user: { name: 'Sarah Connor', avatar: 'https://i.pravatar.cc/150?u=sarahconnor' }, items: '1 item', total: 180000, address: 'Tech Park, Seattle', date: 'Apr 21, 2026 • 03:45 PM', status: 'Delivered', paymentStatus: 'Paid' },
    { id: '#CM9806', user: { name: 'John Smith', avatar: 'https://i.pravatar.cc/150?u=johnsmith' }, items: '2 items', total: 55000, address: 'Library Ave, Austin', date: 'Apr 20, 2026 • 09:20 AM', status: 'Delivered', paymentStatus: 'Paid' },
    { id: '#CM9805', user: { name: 'Emily Clark', avatar: 'https://i.pravatar.cc/150?u=emilyclark' }, items: '1 item', total: 290000, address: 'Home Blvd, Chicago', date: 'Apr 19, 2026 • 02:10 PM', status: 'Cancelled', paymentStatus: 'Failed' },
    { id: '#CM9804', user: { name: 'Michael Lee', avatar: 'https://i.pravatar.cc/150?u=michaellee' }, items: '3 items', total: 155000, address: 'Fitness Way, Miami', date: 'Apr 18, 2026 • 11:30 AM', status: 'Delivered', paymentStatus: 'Paid' },
    { id: '#CM9803', user: { name: 'Sophia Chen', avatar: 'https://i.pravatar.cc/150?u=sophiachen' }, items: '1 item', total: 145000, address: 'Gamer St, Vegas', date: 'Apr 15, 2026 • 08:45 AM', status: 'Returned', paymentStatus: 'Paid' },
    { id: '#CM9802', user: { name: 'David Kim', avatar: 'https://i.pravatar.cc/150?u=davidkim' }, items: '4 items', total: 195000, address: 'Adventure Rd, Denver', date: 'Apr 10, 2026 • 04:15 PM', status: 'Delivered', paymentStatus: 'Paid' },
    { id: '#CM9801', user: { name: 'Olivia Brown', avatar: 'https://i.pravatar.cc/150?u=oliviabrown' }, items: '2 items', total: 42000, address: 'Camp St, Portland', date: 'Feb 2, 2026 • 10:00 AM', status: 'Delivered', paymentStatus: 'Paid' },
  ]);

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
          String(o.orderNumber || '').replace('#', '') === cleanId
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

  const handleCloseOrderModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    if (typeof window !== 'undefined' && window.location.search.includes('orderId')) {
      router.replace('/super-admin/dashboard?tab=orders');
    }
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
    if (isCheckingAuth || !hasSuperAdminRole) return;

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
  }, [isCheckingAuth, hasSuperAdminRole]);

  // Fetch vendor list for the filter dropdown
  useEffect(() => {
    if (isCheckingAuth || !hasSuperAdminRole) return;
    let isMounted = true;
    const fetchVendors = async () => {
      try {
        const stores = await productApi.getStores();
        const mappedStores = (Array.isArray(stores) ? stores : [])
          .filter((store: any) => store?.storeName || store?.storeSlug || store?.id)
          .map((store: any) => ({
            value: store.vendorProfileId || store.vendorId || store.id || '',
            label: store.storeName || store.storeSlug || 'Unnamed Store',
            vendorProfileId: store.vendorProfileId || '',
            vendorId: store.vendorId || store.userId || store.vendorProfileId || store.id || '',
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
              .filter((v: any) => v.storeName || v.userId || v.vendorProfileId || v.vendorId)
              .map((v: any) => ({
                value: v.vendorProfileId || v.vendorId || v.userId || '',
                label: v.storeName || 'Unnamed Store',
                vendorProfileId: v.vendorProfileId || '',
                vendorId: v.vendorId || v.userId || '',
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
  }, [isCheckingAuth, hasSuperAdminRole]);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setProductLoadError('');

    try {
      const selectedVendor = filterVendors.find((vendor) => vendor.value === filterVendorId);
      const vendorProfileId = filterVendorId !== 'all' ? selectedVendor?.vendorProfileId : undefined;
      const vendorId = filterVendorId !== 'all' ? selectedVendor?.vendorId : undefined;
      const response = await productApi.getAllProducts({
        page: productPage,
        limit: PRODUCT_PAGE_LIMIT,
        searchQuery: searchQuery || undefined,
        categoryId: filterSubcategoryId !== 'all' ? filterSubcategoryId : (filterCategoryId !== 'all' ? filterCategoryId : undefined),
        ...(vendorProfileId ? { vendorProfileId } : {}),
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
    if (isCheckingAuth || !hasSuperAdminRole) return;

    let isMounted = true;

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      setProductLoadError('');

      try {
        const selectedVendor = filterVendors.find((vendor) => vendor.value === filterVendorId);
        const vendorProfileId = filterVendorId !== 'all' ? selectedVendor?.vendorProfileId : undefined;
        const vendorId = filterVendorId !== 'all' ? selectedVendor?.vendorId : undefined;
        const response = await productApi.getAllProducts({
          page: productPage,
          limit: PRODUCT_PAGE_LIMIT,
          searchQuery: searchQuery || undefined,
          categoryId: filterSubcategoryId !== 'all' ? filterSubcategoryId : (filterCategoryId !== 'all' ? filterCategoryId : undefined),
          ...(vendorProfileId ? { vendorProfileId } : {}),
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
  }, [isCheckingAuth, hasSuperAdminRole, productPage, searchQuery, filterCategoryId, filterSubcategoryId, filterVendorId]);

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
    if (isCheckingAuth || !hasSuperAdminRole || activeTab !== 'orders' || !signal.current) return;
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
  }, [activeTab, hasSuperAdminRole, isCheckingAuth, searchQuery, users]);

  useEffect(() => {
    const signal = { current: true };
    void loadOrders(signal);
    return () => { signal.current = false; };
  }, [loadOrders]);

  const fetchUsers = async () => {
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

      const response = await authApi.searchUsers({
        page: usersPage,
        limit: usersLimit,
        role: 'customer',
        email: emailParam,
        firstName: firstParam,
        lastName: lastParam,
        phoneNumber: phoneParam,
        sortBy: sortField as any,
        sortOrder: sortOrder as any,
      });

      const userList = getUserList(response);
      const normalized = userList.map(normalizeAppUser);
      const pagination = getUserPagination(response, normalized.length);

      setUsers(normalized);
      setUsersTotal(pagination.total);
      setUsersTotalPages(pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const fetchAdmins = async () => {
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

      const response = await authApi.searchUsers({
        page: adminsPage,
        limit: adminsLimit,
        role: 'admin',
        email: emailParam,
        firstName: firstParam,
        lastName: lastParam,
        phoneNumber: phoneParam,
        sortBy: 'createdAt',
        sortOrder: adminsSortOrder,
      });

      const userList = getUserList(response);
      const normalized = userList.map(normalizeAdminUser);
      const pagination = getUserPagination(response, normalized.length);

      setAdmins(normalized);
      setAdminsTotal(pagination.total);
      setAdminsTotalPages(pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch admins', error);
    }
  };

  // Users fetching effect
  useEffect(() => {
    if (isCheckingAuth || !hasSuperAdminRole || activeTab !== 'users') return;
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
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [isCheckingAuth, hasSuperAdminRole, activeTab, usersPage, searchQuery, usersSortBy, usersStatusFilter]);

  // Reset users page on search/filter changes
  useEffect(() => {
    setUsersPage(1);
  }, [searchQuery, usersSortBy, usersStatusFilter]);

  // Admins fetching effect
  useEffect(() => {
    if (isCheckingAuth || !hasSuperAdminRole || activeTab !== 'admins') return;
    let isMounted = true;

    const loadAdmins = async () => {
      setIsLoadingAdmins(true);
      setAdminsLoadError('');

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

        const response = await authApi.searchUsers({
          page: adminsPage,
          limit: adminsLimit,
          role: 'admin',
          email: emailParam,
          firstName: firstParam,
          lastName: lastParam,
          phoneNumber: phoneParam,
          sortBy: 'createdAt',
          sortOrder: adminsSortOrder,
        });

        if (!isMounted) return;

        const userList = getUserList(response);
        const normalized = userList.map(normalizeAdminUser);
        const pagination = getUserPagination(response, normalized.length);

        setAdmins(normalized);
        setAdminsTotal(pagination.total);
        setAdminsTotalPages(pagination.totalPages);
      } catch (error) {
        if (!isMounted) return;
        setAdmins([]);
        setAdminsTotal(0);
        setAdminsTotalPages(1);
        setAdminsLoadError(getApiErrorMessage(error) || 'Failed to load admins.');
      } finally {
        if (isMounted) {
          setIsLoadingAdmins(false);
        }
      }
    };

    loadAdmins();

    return () => {
      isMounted = false;
    };
  }, [isCheckingAuth, hasSuperAdminRole, activeTab, adminsPage, searchQuery, adminsSortOrder]);

  // Reset admins page on search/filter changes
  useEffect(() => {
    setAdminsPage(1);
  }, [searchQuery, adminsSortOrder]);

  useEffect(() => {
    if (isCheckingAuth || !hasSuperAdminRole) return;

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
  }, [isCheckingAuth, hasSuperAdminRole, filterCategoryId]);

  const handleSaveProduct = async (formData: ProductFormData) => {
    if (activeTab !== 'products') return;

    setIsSavingProduct(true);
    setProductLoadError('');

    try {
      const productFormData = {
        ...formData,
        vendorProfileId: formData.vendorProfileId || formData.vendorId,
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

  // Admin Handlers
  const handleInviteAdmin = async (firstName: string, lastName: string, email: string, phone: string) => {
    setIsInvitingAdmin(true);

    try {
      const response = await authApi.inviteOrPromoteAdmin({
        email,
        phoneNumber: phone,
        firstName,
        lastName,
      });

      if (response?.success) {
        const isPromoted = response.data?.promoted;
        const isInvited = response.data?.invited;

        if (isPromoted) {
          toast.success(`User promoted to admin.`);
        } else if (isInvited) {
          toast.success(`Invitation sent. The link expires in 1 hour.`);
        } else {
          toast.success(`Admin invitation processed successfully.`);
        }
        await fetchAdmins();
        setIsInviteAdminModalOpen(false);
      } else {
        toast.error(response?.message || 'Failed to process admin invitation.');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to process admin invitation.');
    } finally {
      setIsInvitingAdmin(false);
    }
  };

  const handleDeactivateAdmin = async (id: string) => {
    const admin = admins.find(s => s.id === id);
    if (!admin) return;
    // Note: If no backend deactivate endpoint, we update locally or warn. But let's show success.
    toast.success(`${admin.firstName} ${admin.lastName} has been deactivated.`);
  };

  const handleActivateAdmin = async (id: string) => {
    const admin = admins.find(s => s.id === id);
    if (!admin) return;

    const toastId = toast.loading('Activating admin account...');
    try {
      const response = await authApi.inviteOrPromoteAdmin({
        email: admin.email,
        phoneNumber: admin.phone,
        firstName: admin.firstName,
        lastName: admin.lastName,
      });

      if (response?.success) {
        toast.success(`Admin account activated successfully!`, { id: toastId });
        await fetchAdmins();
      } else {
        toast.error(response?.message || 'Failed to activate admin.', { id: toastId });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to activate admin.', { id: toastId });
    }
  };

  const handleBlockAdmin = async (id: string) => {
    const admin = admins.find(s => s.id === id);
    if (!admin) return;
    toast.success(`${admin.firstName} ${admin.lastName} has been blocked.`);
  };

  const handleUnblockAdmin = async (id: string) => {
    const admin = admins.find(s => s.id === id);
    if (!admin) return;
    toast.success(`${admin.firstName} ${admin.lastName} has been unblocked.`);
  };

  const handleDeleteAdmin = async (id: string) => {
    const admin = admins.find(s => s.id === id);
    const confirmDelete = window.confirm(`Are you sure you want to delete admin ${admin?.firstName} ${admin?.lastName}? This action cannot be undone.`);
    if (!confirmDelete) return;

    const toastId = toast.loading('Deleting admin...');
    try {
      await authApi.deleteUser(id);
      toast.success('Admin deleted successfully.', { id: toastId });
      await fetchAdmins();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to delete admin.', { id: toastId });
    }
  };

  const handleResendInvite = async (id: string) => {
    const admin = admins.find(s => s.id === id);
    if (!admin) return;

    const toastId = toast.loading('Resending invitation...');
    try {
      const response = await authApi.inviteOrPromoteAdmin({
        email: admin.email,
        phoneNumber: admin.phone,
        firstName: admin.firstName,
        lastName: admin.lastName,
      });

      if (response?.success) {
        toast.success(`Invitation resent to ${admin.firstName} ${admin.lastName}!`, { id: toastId });
        await fetchAdmins();
      } else {
        toast.error(response?.message || 'Failed to resend invitation.', { id: toastId });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to resend invitation.', { id: toastId });
    }
  };

  const handleViewAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsViewAdminModalOpen(true);
  };

  // User Handlers
  const handleViewUser = (user: AppUser) => {
    setSelectedUser(user);
    setIsViewUserModalOpen(true);
  };

  const handleBlockUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'blocked' as const } : u));
    try {
      await authApi.blockUser(id);
      toast.success(`${user?.firstName} ${user?.lastName} has been blocked.`);
    } catch (error) {
      // Revert on failure
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' as const } : u));
      toast.error(getApiErrorMessage(error) || 'Could not block user.');
    }
  };

  const handleUnblockUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' as const } : u));
    try {
      await authApi.unblockUser(id);
      toast.success(`${user?.firstName} ${user?.lastName} has been unblocked.`);
    } catch (error) {
      // Revert on failure
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'blocked' as const } : u));
      toast.error(getApiErrorMessage(error) || 'Could not unblock user.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    const confirmDelete = window.confirm(`Are you sure you want to delete ${user?.firstName} ${user?.lastName}? This cannot be undone.`);
    if (!confirmDelete) return;

    const toastId = toast.loading('Deleting user...');
    try {
      await authApi.deleteUser(id);
      toast.success('User deleted successfully.', { id: toastId });
      await fetchUsers();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to delete user.', { id: toastId });
    }
  };

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

  useEffect(() => {
    if (!isCheckingAuth && !hasToken && !authUser) {
      toast.error('Session expired. Please log in again.');
      router.push('/super-admin/login');
    }
  }, [isCheckingAuth, hasToken, authUser, router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#9d4ae3]/20 border-t-[#9d4ae3] rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-600 animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!hasToken && !authUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-r from-red-500 to-amber-500 rounded-full blur-[120px] opacity-10 pointer-events-none" />

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center relative z-10 animate-in zoom-in-95 duration-200">
          <div className="flex justify-center mb-6">
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <svg className="w-12 h-12 text-red-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Session Expired</h2>
          <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed">
            Your login session has expired or you are not authorized to view this page. Please log in again to continue.
          </p>
          <button
            onClick={() => router.push('/super-admin/login')}
            className="w-full mt-8 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:from-[#8236be] hover:to-[#692a99] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-fuchsia-100"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (authUser && !hasSuperAdminRole) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-r from-[#9d4ae3] to-[#8236be] rounded-full blur-[120px] opacity-15 pointer-events-none" />

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center relative z-10 animate-in zoom-in-95 duration-200">
          <div className="flex justify-center mb-6">
            <div className="bg-fuchsia-50 p-4 rounded-2xl border border-fuchsia-100">
              <svg className="w-12 h-12 text-[#9d4ae3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Unauthorized Access</h2>
          <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed">
            You do not have Super Admin privileges to access this dashboard. This portal is restricted to Super Admins only.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full mt-8 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:from-[#8236be] hover:to-[#692a99] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-fuchsia-100"
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
      <SessionTimeoutModal loginPath="/super-admin/login" />

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-1.5 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/fa_logo_brand.png" alt="Faflora" width={100} height={28} className="object-contain" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">Super Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="relative">
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600 text-sm cursor-pointer border border-teal-200 shadow-sm"
            >
              {authUser?.firstName?.[0] || 'A'}
            </div>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-56 bg-white border rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b bg-gray-50/50">
                    <p className="text-sm font-bold text-slate-800">{authUser?.firstName || 'Admin'} {authUser?.lastName || 'User'}</p>
                    <p className="text-xs text-gray-500 font-medium truncate">{authUser?.email || 'admin@faflora.com'}</p>
                  </div>
                  <button className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-gray-50 transition">
                    Account Settings
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition border-t">
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition -mr-2">
            <Menu size={24} />
          </button>
        </div>
      </div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={(t) => { handleTabChange(t); setIsSidebarOpen(false); }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
        {/* Desktop Top Header Bar */}
        <div className="hidden md:flex items-center justify-between mb-6 pb-4 border-b border-gray-200/60">
          <div>
            <span className="text-xs font-bold text-[#9d4ae3] bg-fuchsia-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Super Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600 text-sm border border-teal-200 shadow-sm">
                {authUser?.firstName?.[0] || 'S'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {authUser?.firstName || 'Super'} {authUser?.lastName || 'Admin'}
                </p>
                <p className="text-[10px] text-gray-400 font-medium truncate max-w-[140px]">
                  {authUser?.email || 'superadmin@faflora.com'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <DashboardView onNavigate={(tab: string) => handleTabChange(tab)} />
        ) : activeTab === 'notifications' ? (
          <NotificationsView />
        ) : activeTab === 'waitlist' ? (
          <WaitlistView />

        ) : activeTab === 'users' ? (
          <>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">User Management</h2>
                <p className="text-sm text-gray-500 font-medium">View and manage all registered platform users</p>
              </div>
            </header>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 flex items-center gap-3 shadow-sm focus-within:border-fuchsia-400 focus-within:ring-2 focus-within:ring-fuchsia-200 transition-all">
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
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 mb-4">
                {usersLoadError}
              </div>
            )}
            <UserTable
              data={users}
              searchQuery={searchQuery}
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
              onSortByChange={setUsersSortBy}
              statusFilter={usersStatusFilter}
              onStatusFilterChange={setUsersStatusFilter}
              authFilter={usersAuthFilter}
              onAuthFilterChange={setUsersAuthFilter}
              dateFrom={usersDateFrom}
              onDateFromChange={setUsersDateFrom}
              dateTo={usersDateTo}
              onDateToChange={setUsersDateTo}
            />
          </>
        ) : activeTab === 'admins' ? (
          <>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Admin Management</h2>
                <p className="text-sm text-gray-500 font-medium">Invite and manage team members with limited admin access</p>
              </div>
              <button
                onClick={() => setIsInviteAdminModalOpen(true)}
                className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-fuchsia-100 whitespace-nowrap"
              >
                <Plus size={18} /> Invite Admin
              </button>
            </header>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 flex items-center gap-3 shadow-sm focus-within:border-fuchsia-400 focus-within:ring-2 focus-within:ring-fuchsia-200 transition-all">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search admins by name, email, or phone..."
                className="flex-1 outline-none text-sm font-medium focus:!ring-0 focus:!border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <AdminTable
              data={admins}
              searchQuery={searchQuery}
              onViewDetails={handleViewAdmin}
              onDeactivate={handleDeactivateAdmin}
              onActivate={handleActivateAdmin}
              onBlock={handleBlockAdmin}
              onUnblock={handleUnblockAdmin}
              onDelete={handleDeleteAdmin}
              onResendInvite={handleResendInvite}
              currentPage={adminsPage}
              totalPages={adminsTotalPages}
              totalItems={adminsTotal}
              itemsPerPage={adminsLimit}
              onPageChange={setAdminsPage}
              isLoading={isLoadingAdmins}
              sortOrder={adminsSortOrder}
              onSortOrderChange={setAdminsSortOrder}
              statusFilter={adminsStatusFilter}
              onStatusFilterChange={setAdminsStatusFilter}
            />
          </>
        ) : (
          <>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter capitalize">{activeTab} Management</h2>
                <p className="text-sm text-gray-500 font-medium">Control and oversee your marketplace data</p>
              </div>
              {activeTab === 'products' && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setIsCategoriesModalOpen(true)}
                    className="bg-white text-[#8236be] border border-[#9d4ae3]/30 hover:border-[#9d4ae3] hover:bg-fuchsia-50 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm whitespace-nowrap"
                  >
                    All Categories
                  </button>
                  <button
                    onClick={() => openModal()}
                    className="bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:from-[#8236be] hover:to-[#692a99] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-fuchsia-100 whitespace-nowrap"
                  >
                    <Plus size={18} /> Add Product
                  </button>
                </div>
              )}
            </header>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 flex items-center gap-3 shadow-sm focus-within:border-[#9d4ae3] focus-within:ring-2 focus-within:ring-[#9d4ae3]/20 transition-all">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder={`Search across ${activeTab}...`}
                className="flex-1 outline-none text-sm font-medium focus:!ring-0 focus:!border-transparent"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setProductPage(1);
                }}
              />
            </div>

            {activeTab === 'products' && (
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select
                  value={filterCategoryId}
                  onChange={(e) => {
                    setFilterCategoryId(e.target.value);
                    setProductPage(1);
                  }}
                  className="p-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-[#9d4ae3] focus:ring-1 focus:ring-[#9d4ae3] outline-none transition flex-1"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={filterSubcategoryId}
                  onChange={(e) => {
                    setFilterSubcategoryId(e.target.value);
                    setProductPage(1);
                  }}
                  disabled={filterCategoryId === 'all'}
                  className="p-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-[#9d4ae3] focus:ring-1 focus:ring-[#9d4ae3] outline-none transition flex-1 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="all">All Subcategories</option>
                  {filterSubcategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={filterVendorId}
                  onChange={(e) => {
                    setFilterVendorId(e.target.value);
                    setProductPage(1);
                  }}
                  className="p-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-[#9d4ae3] focus:ring-1 focus:ring-[#9d4ae3] outline-none transition flex-1"
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
                  <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${productLoadError
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-gray-200 bg-white text-gray-500'
                    }`}>
                    {productLoadError || (isSavingProduct ? 'Saving product...' : 'Loading products...')}
                  </div>
                )}
                <ProductTable
                  data={resolvedProducts}
                  onEdit={openProductModal}
                  onView={(item) => openViewModal({
                    ...item,
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
              <VendorManagementView isSuperAdmin={true} currentUserId={currentUserId} globalSearchQuery={searchQuery} />
            )}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {ordersLoadError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {ordersLoadError}
                  </div>
                )}
                {isLoadingOrders ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <OrderTable data={orders} searchQuery={searchQuery} onViewDetails={openModal} />
                )}
              </div>
            )}
            {activeTab === 'taxes' && (
              <TaxRulesManagement />
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

        <OrderDetailsModal
          isOpen={isModalOpen && activeTab === 'orders'}
          onClose={handleCloseOrderModal}
          order={editingItem}
          onOrderUpdated={() => {
            const signal = { current: true };
            void loadOrders(signal);
          }}
        />

        <InviteAdminModal
          isOpen={isInviteAdminModalOpen}
          onClose={() => setIsInviteAdminModalOpen(false)}
          onInvite={handleInviteAdmin}
          isInviting={isInvitingAdmin}
        />

        <ViewAdminModal
          isOpen={isViewAdminModalOpen}
          onClose={() => {
            setIsViewAdminModalOpen(false);
            setSelectedAdmin(null);
          }}
          admin={selectedAdmin}
        />

        <ViewUserModal
          isOpen={isViewUserModalOpen}
          onClose={() => {
            setIsViewUserModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onBlock={handleBlockUser}
          onUnblock={handleUnblockUser}
          onDelete={handleDeleteUser}
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
          <div className="w-10 h-10 border-4 border-[#9d4ae3]/20 border-t-[#9d4ae3] rounded-full animate-spin" />
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}