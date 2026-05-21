'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import ActionModal, {
  ProductCategoryOption,
  ProductFormData,
  categoryIncludesWeightAndDimensions,
} from '@/components/admin/ActionModal';
import CategoriesModal from '@/components/admin/CategoriesModal';
import ImageUploadModal from '@/components/admin/ImageUploadModal';
import ProductTable from '@/components/admin/ProductTable';
import VendorTable from '@/components/admin/VendorTable';
import OrderTable from '@/components/admin/OrderTable';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';
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
  productApi,
} from '@/lib/api';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setUser } from '@/lib/features/auth/authSlice';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

type AdminProduct = Partial<ProductFormData> & {
  id: string;
  name: string;
  price: number;
  category?: string;
  stock: number;
  image: string;
  status?: ProductStatus;
  images?: string[];
  color?: string;
  size?: string;
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
  stock?: number | { quantity?: number; isInStock?: boolean };
  quantity?: number;
  image?: string;
  images?: Array<string | { url?: string; isPrimary?: boolean; order?: number }>;
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

const fallbackProducts: AdminProduct[] = [
  {
    id: '1',
    name: 'Lenovo Ideapad Slim 3',
    price: 45000,
    category: 'Electronics',
    stock: 12,
    image: '/laptop.jpg',
  },
];

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

const getProductImages = (images: ProductRecord['images']) => {
  if (!Array.isArray(images)) return [];

  return [...images]
    .sort((a, b) => {
      if (typeof a === 'string' || typeof b === 'string') return 0;
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return Number(a.order ?? 0) - Number(b.order ?? 0);
    })
    .map((image) => (typeof image === 'string' ? image : image.url))
    .filter((url): url is string => Boolean(url));
};

const normalizeProduct = (product: unknown): AdminProduct | null => {
  if (!isRecord(product)) return null;

  const record = product as ProductRecord;
  const id = record.id || record._id;
  const name = record.name || record.title;

  if (!id || !name) return null;

  const imageUrls = getProductImages(record.images);
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
    images: imageUrls,
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
    subCategoryId: '',
    origin: String((metadata as { origin?: unknown }).origin || 'Nigeria'),
    returnConditions: String((metadata as { returnConditions?: unknown }).returnConditions || ''),
    warrantyDetails: String((metadata as { warrantyDetails?: unknown }).warrantyDetails || ''),
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

  // Ensure origin is completely removed from metadata
  delete customMetadata.origin;

  if (formData.colours.length > 0) {
    customMetadata.colours = formData.colours;
  }

  if (formData.sizes.length > 0) {
    customMetadata.sizes = formData.sizes;
  }

  const resolvedCategoryId = formData.subCategoryId && formData.subCategoryId !== ''
    ? formData.subCategoryId
    : resolveCategoryId(formData.categoryId, categoryOptions);

  const payload: CreateProductDto = {
    vendorId: formData.vendorId,
    categoryId: resolvedCategoryId,
    name: formData.name,
    preview: formData.preview,
    description: formData.description,
    compareAtPrice: Math.max(0, Number(formData.compareAtPrice) || 0),
    stock: toNonNegativeInteger(formData.stock),
    metadata: customMetadata,
    origin: formData.origin,
  };

  if (formData.brand) payload.brand = formData.brand;
  if (formData.sku) payload.sku = formData.sku;
  if (formData.currency) payload.currency = formData.currency;
  if (formData.tags.length) payload.tags = formData.tags;
  if (formData.colours[0]) payload.color = formData.colours[0];
  if (formData.sizes[0]) payload.size = formData.sizes[0];
  if (formData.images?.length) {
    payload.images = formData.images.map((url, index) => ({
      url,
      alt: `${formData.name} image ${index + 1}`,
      isPrimary: index === 0,
    }));
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

  // Only include weight and dimensions if whitelisted category
  if (includesWeightAndDimensions) {
    const weight = getOptionalNumber(formData.weight);
    if (weight !== undefined) payload.weight = weight;

    const { length, width, height } = formData.dimensions;
    if ([length, width, height].some(value => getOptionalNumber(value) !== undefined)) {
      payload.dimensions = {
        length: Number(length) || 0,
        width: Number(width) || 0,
        height: Number(height) || 0,
        unit: (formData as any).dimensionsUnit || 'cm',
      };
    }
  }

  return payload;
};

export default function AdminPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'vendors' | 'orders'>('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [productToPublishId, setProductToPublishId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<AdminProduct | AdminVendor | AdminOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productLoadError, setProductLoadError] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [productLimit, setProductLimit] = useState(PRODUCT_PAGE_LIMIT);
  const [productTotal, setProductTotal] = useState(fallbackProducts.length);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [categories, setCategories] = useState<ProductCategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Mock Data 
  const [products, setProducts] = useState<AdminProduct[]>(fallbackProducts);
  const [vendors, setVendors] = useState<AdminVendor[]>([
    { id: 1, name: 'TechHub Solutions', type: 'Electronics', email: 'contact@techhub.com', status: 'Active' },
  ]);
  const [orders] = useState<AdminOrder[]>([
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

  const openModal = (item: AdminProduct | AdminVendor | AdminOrder | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

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
              role: profileData?.role || profileData?.user?.role || '', // Strict role check, no admin fallback
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
  }, []);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setProductLoadError('');

    try {
      const response = await productApi.getAllProducts({
        page: productPage,
        limit: PRODUCT_PAGE_LIMIT,
        searchQuery: searchQuery || undefined,
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
      setProducts(fallbackProducts);
      setProductTotal(fallbackProducts.length);
      setProductTotalPages(1);
      setProductLoadError(
        getApiErrorMessage(error) || 'Could not load products. Showing fallback data.'
      );
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      setProductLoadError('');

      try {
        const response = await productApi.getAllProducts({
          page: productPage,
          limit: PRODUCT_PAGE_LIMIT,
          searchQuery: searchQuery || undefined,
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
        setProducts(fallbackProducts);
        setProductTotal(fallbackProducts.length);
        setProductTotalPages(1);
        setProductLoadError(
          getApiErrorMessage(error) || 'Could not load products. Showing fallback data.'
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
  }, [productPage, searchQuery]);

  const handleSaveProduct = async (formData: ProductFormData) => {
    if (activeTab !== 'products') return;

    setIsSavingProduct(true);
    setProductLoadError('');

    try {
      const productFormData = {
        ...formData,
        vendorId: formData.vendorId || currentUserId,
      };

      if (!productFormData.vendorId) {
        const message = 'Could not determine the current user ID for vendorId. Please sign in again.';
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

  const handlePublishClick = (id: string) => {
    setProductToPublishId(id);
    setIsImageModalOpen(true);
  };

  const handleImageComplete = async (images: File[]) => {
    if (!productToPublishId) return;

    try {
      setIsLoadingProducts(true);
      setProductLoadError('');

      if (images.length > 0) {
        await productApi.uploadProductImages(productToPublishId, images);
      }

      const response = await productApi.publishProduct(productToPublishId);
      const publishedProduct = normalizeProduct(response?.data);

      if (publishedProduct) {
        setProducts(prev => prev.map(p => p.id === productToPublishId ? publishedProduct : p));
      } else {
        await fetchProducts();
      }
    } catch (error) {
      setProductLoadError(
        getApiErrorMessage(error) ||
        'Could not publish product. Products need images and stock before publishing.'
      );
      return;
    } finally {
      setIsLoadingProducts(false);
    }

    setIsImageModalOpen(false);
    setProductToPublishId(null);
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

  const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'];
  const hasAdminRole = authUser && ADMIN_ROLES.includes(authUser.role);
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

  // Trigger redirect for unauthenticated users
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
          <div className="w-12 h-12 border-4 border-[#c800ff]/20 border-t-[#c800ff] rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-600 animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // 1. Session expired / No token / No user
  if (!hasToken && !authUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Background decorations */}
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
            onClick={() => router.push('/admin/login')}
            className="w-full mt-8 bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-fuchsia-100"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // 2. Logged in, but unauthorized role
  if (authUser && !hasAdminRole) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-r from-[#c800ff] to-[#912cad] rounded-full blur-[120px] opacity-15 pointer-events-none" />
        
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center relative z-10 animate-in zoom-in-95 duration-200">
          <div className="flex justify-center mb-6">
            <div className="bg-fuchsia-50 p-4 rounded-2xl border border-fuchsia-100">
              <svg className="w-12 h-12 text-[#c800ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Unauthorized Access</h2>
          <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed">
            You do not have administrative privileges to access this dashboard. This portal is restricted to authorized admins only.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full mt-8 bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-fuchsia-100"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] flex-col md:flex-row relative">

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-1.5 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Faflora" width={100} height={28} className="object-contain" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
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
        setActiveTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter capitalize">{activeTab} Management</h2>
            <p className="text-sm text-gray-500 font-medium">Control and oversee your marketplace data</p>
          </div>
          {activeTab !== 'orders' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {activeTab === 'products' && (
                <button
                  onClick={() => setIsCategoriesModalOpen(true)}
                  className="bg-white text-[#912cad] border border-[#c800ff]/30 hover:border-[#c800ff] hover:bg-fuchsia-50 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm whitespace-nowrap"
                >
                  All Categories
                </button>
              )}
              <button
                onClick={() => openModal()}
                className="bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-fuchsia-100 whitespace-nowrap"
              >
                <Plus size={18} /> Add {activeTab === 'products' ? 'Product' : 'Vendor'}
              </button>
            </div>
          )}
        </header>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 flex items-center gap-3 shadow-sm focus-within:border-[#c800ff] focus-within:ring-2 focus-within:ring-[#c800ff]/20 transition-all">
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
              data={products}
              onEdit={openModal}
              onDelete={handleDeleteProduct}
              onPublish={handlePublishClick}
              currentPage={productPage}
              totalPages={productTotalPages}
              totalItems={productTotal}
              itemsPerPage={productLimit}
              onPageChange={setProductPage}
              isLoading={isLoadingProducts}
            />
          </div>
        )}
        {activeTab === 'vendors' && (
          <VendorTable data={vendors} onEdit={openModal} onDelete={(id: number) => setVendors(vendors.filter(v => v.id !== id))} searchQuery={searchQuery} />
        )}
        {activeTab === 'orders' && (
          <OrderTable data={orders} searchQuery={searchQuery} onViewDetails={openModal} />
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
          onClose={() => setIsModalOpen(false)}
          order={editingItem}
        />
      </main>
    </div>
  );
}
