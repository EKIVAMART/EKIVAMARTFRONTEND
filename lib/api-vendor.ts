import axiosInstance from './axios';
import { ApiResponse } from './api';
import { categoryApi } from './api';

// Set this to true to run fully client-side (mocked endpoints)
// Set to false to hit the actual backend APIs
export const USE_MOCK_VENDOR_API = false;

export const IS_DEV_MODE = USE_MOCK_VENDOR_API;

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface HomeAddress {
  street: string;
  city: string;
  state: string;
  lga: string;
}

export interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  lga: string;
  postalCode?: string;
}

export interface SocialLinks {
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  tiktok: string | null;
}

export interface VendorDocument {
  id: string;
  documentType: string;
  documentUrl: string;
  originalFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  status:
    | 'pending'
    | 'in_review'
    | 'verified'
    | 'rejected'
    | 'requires_resubmission';
  rejectionReason: string | null;
  uploadedAt?: string;
  createdAt?: string;
}

export interface VendorBankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  accountType: 'savings' | 'current';
  isPrimary: boolean;
  isVerified: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  isActive?: boolean;
}

export interface VendorApplicationStatus {
  applicationReference: string;
  status:
    | 'draft'
    | 'submitted'
    | 'in_review'
    | 'requires_resubmission'
    | 'approved'
    | 'rejected'
    | 'suspended'
    | 'banned';
  vendorType:
    | 'individual'
    | 'registered_business'
    | 'brand'
    | 'reseller'
    | 'dropshipper'
    | '';
  storeName: string;
  storeSlug: string;
  submittedAt: string | null;
  lastUpdatedAt: string;
  resubmissionNote: string | null;
  rejectionReason: string | null;
  documents: {
    documentType: string;
    status:
      | 'pending'
      | 'in_review'
      | 'verified'
      | 'rejected'
      | 'requires_resubmission';
    rejectionReason: string | null;
    uploadedAt: string;
    id?: string;
    originalFilename?: string;
    fileSizeBytes?: number;
    documentUrl?: string;
  }[];
  sellingCategories: Category[];
  sellingCategoriesComplete: boolean;
  personalInfoComplete: boolean;
  businessInfoComplete: boolean;
  storeInfoComplete: boolean;
  documentsComplete: boolean;
  bankAccountsCount: number;
  /** @deprecated use documentsComplete */
  documentsInfoComplete?: boolean;
}

export interface VendorApplicationDraft {
  // Flat fields kept for internal mock storage convenience
  storeName: string;
  vendorType:
    | 'individual'
    | 'registered_business'
    | 'brand'
    | 'reseller'
    | 'dropshipper'
    | '';
  storePhone: string;
  storeEmail: string;
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    homeAddress: HomeAddress;
    nin: string;
    ninProvided?: boolean;
  } | null;
  businessInfo: {
    businessName: string;
    businessType: string;
    cacNumber: string;
    tinNumber: string;
    vatNumber?: string;
    dateOfIncorporation?: string;
  } | null;
  storeInfo: {
    storeDescription: string;
    yearsInBusiness: string;
    businessAddress: BusinessAddress;
    socialLinks: SocialLinks;
  } | null;
  documents: VendorDocument[];
  bankAccounts: VendorBankAccount[];
  sellingCategories: Category[];
  // API-spec step-keyed shape (populated when fetching draft from real API)
  step1?: {
    storeName: string;
    storeSlug: string;
    vendorType: string;
    storePhone: string;
    storeEmail: string;
  };
  step2?: { categories: Category[] };
  step3?: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    homeAddress: HomeAddress;
    ninProvided: boolean;
  } | null;
  step4?: {
    businessName: string | null;
    businessType: string | null;
    cacNumber: string | null;
    tinNumber: string | null;
    vatNumber: string | null;
    dateOfIncorporation: string | null;
  } | null;
  step5?: {
    storeDescription: string | null;
    yearsInBusiness: string | null;
    businessAddress: BusinessAddress | null;
    socialLinks: SocialLinks | null;
  } | null;
}

export interface CheckStoreNameResponse {
  available: boolean;
  name: string;
  slug: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  STATUS: 'faflora_vendor_status',
  DRAFT: 'faflora_vendor_draft',
};

// Mock categories for testing
const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, accessories, and more',
  },
  {
    id: 'cat-2',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Gadgets, phones, and appliances',
  },
  {
    id: 'cat-3',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Furniture, decor, and kitchenware',
  },
  {
    id: 'cat-4',
    name: 'Beauty',
    slug: 'beauty',
    description: 'Cosmetics, skincare, and grooming',
  },
  {
    id: 'cat-5',
    name: 'Groceries',
    slug: 'groceries',
    description: 'Food, beverages, and essentials',
  },
  {
    id: 'cat-6',
    name: 'Footwear',
    slug: 'footwear',
    description: 'Shoes, sandals, and sneakers',
  },
  {
    id: 'cat-7',
    name: 'Bags & Luggage',
    slug: 'bags-luggage',
    description: 'Handbags, backpacks, and travel gear',
  },
  {
    id: 'cat-8',
    name: 'Wellness',
    slug: 'wellness',
    description: 'Health, fitness, and supplements',
  },
  {
    id: 'cat-9',
    name: 'Jewellery',
    slug: 'jewellery',
    description: 'Necklaces, rings, and bracelets',
  },
  {
    id: 'cat-10',
    name: 'Drinks',
    slug: 'drinks',
    description: 'Beverages, juices, and spirits',
  },
];

const getInitialMockData = (): {
  status: VendorApplicationStatus;
  draft: VendorApplicationDraft;
} => {
  if (typeof window === 'undefined') {
    return {
      status: {
        applicationReference: 'VEN-2026-00042',
        status: 'draft',
        vendorType: '',
        storeName: '',
        storeSlug: '',
        submittedAt: null,
        lastUpdatedAt: new Date().toISOString(),
        resubmissionNote: null,
        rejectionReason: null,
        documents: [],
        sellingCategories: [],
        sellingCategoriesComplete: false,
        personalInfoComplete: false,
        businessInfoComplete: false,
        storeInfoComplete: false,
        documentsComplete: false,
        bankAccountsCount: 0,
      },
      draft: {
        storeName: '',
        vendorType: '',
        storePhone: '',
        storeEmail: '',
        personalInfo: null,
        businessInfo: null,
        storeInfo: null,
        documents: [],
        bankAccounts: [],
        sellingCategories: [],
      },
    };
  }

  const savedStatus = localStorage.getItem(STORAGE_KEYS.STATUS);
  const savedDraft = localStorage.getItem(STORAGE_KEYS.DRAFT);

  const defaultStatus: VendorApplicationStatus = {
    applicationReference: 'VEN-2026-00042',
    status: 'draft',
    vendorType: '',
    storeName: '',
    storeSlug: '',
    submittedAt: null,
    lastUpdatedAt: new Date().toISOString(),
    resubmissionNote: null,
    rejectionReason: null,
    documents: [],
    sellingCategories: [],
    sellingCategoriesComplete: false,
    personalInfoComplete: false,
    businessInfoComplete: false,
    storeInfoComplete: false,
    documentsComplete: false,
    bankAccountsCount: 0,
  };

  const defaultDraft: VendorApplicationDraft = {
    storeName: '',
    vendorType: '',
    storePhone: '',
    storeEmail: '',
    personalInfo: null,
    businessInfo: null,
    storeInfo: null,
    documents: [],
    bankAccounts: [],
    sellingCategories: [],
  };

  // Migrate old format: ensure documentsComplete is present
  let parsedStatus: VendorApplicationStatus | null = savedStatus
    ? JSON.parse(savedStatus)
    : null;
  if (
    parsedStatus &&
    parsedStatus.documentsInfoComplete !== undefined &&
    parsedStatus.documentsComplete === undefined
  ) {
    parsedStatus.documentsComplete = !!parsedStatus.documentsInfoComplete;
  }

  return {
    status: parsedStatus || defaultStatus,
    draft: savedDraft ? JSON.parse(savedDraft) : defaultDraft,
  };
};

export const saveMockData = (
  status: VendorApplicationStatus,
  draft: VendorApplicationDraft
) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(status));
    localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
  }
};

export const resetMockData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.STATUS);
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  }
};

// ─── API Functions ────────────────────────────────────────────────────────────

export const vendorApi = {
  /**
   * A0: Check Store Name Availability
   * GET /vendor/application/check-store-name?name=...
   * Rate limit: 30 requests per minute per IP
   */
  async checkStoreName(
    name: string
  ): Promise<ApiResponse<CheckStoreNameResponse>> {
    if (USE_MOCK_VENDOR_API) {
      const isTaken = name.toLowerCase().includes('taken');
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      return {
        success: true,
        message: 'Store name checked',
        data: {
          available: !isTaken,
          name: name,
          slug: slug,
        },
      };
    }
    const response = await axiosInstance.get<
      ApiResponse<CheckStoreNameResponse>
    >(`/vendor/application/check-store-name?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  /**
   * Get All Categories (for the selling categories step)
   * This uses the existing categoryApi to fetch categories
   * Even in mock mode, this attempts to fetch real categories
   */
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    // In mock mode, try to fetch real categories first, fallback to mock
    if (USE_MOCK_VENDOR_API) {
      try {
        // Try to fetch real categories from the API
        const response = await categoryApi.getCategories({ limit: 100 });
        let categories: Category[] = [];
        if (response?.data && Array.isArray(response.data)) {
          categories = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          categories = response.data.data;
        } else if (
          response?.data?.categories &&
          Array.isArray(response.data.categories)
        ) {
          categories = response.data.categories;
        } else if (response?.data?.docs && Array.isArray(response.data.docs)) {
          categories = response.data.docs;
        }

        if (categories.length > 0) {
          return {
            success: true,
            message: 'Categories retrieved',
            data: categories,
          };
        }
      } catch (error) {
        console.warn(
          'Failed to fetch real categories in mock mode, falling back to mock data:',
          error
        );
      }

      // Fallback to mock categories
      return {
        success: true,
        message: 'Categories retrieved (mock)',
        data: MOCK_CATEGORIES,
      };
    }

    // Real API mode
    try {
      const response = await categoryApi.getCategories({ limit: 100 });
      let categories: Category[] = [];
      if (response?.data && Array.isArray(response.data)) {
        categories = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        categories = response.data.data;
      } else if (
        response?.data?.categories &&
        Array.isArray(response.data.categories)
      ) {
        categories = response.data.categories;
      } else if (response?.data?.docs && Array.isArray(response.data.docs)) {
        categories = response.data.docs;
      }
      return {
        success: true,
        message: 'Categories retrieved',
        data: categories,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch categories',
        data: [],
      };
    }
  },

  /**
   * A4: Update Selling Categories
   * PATCH /vendor/application/selling-categories
   * REPLACES the entire selection - sends complete array of category IDs
   */
  async updateSellingCategories(
    categoryIds: string[]
  ): Promise<ApiResponse<{ categories: Category[] }>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      // Match from draft's existing categories first (may include real API categories),
      // then fall back to MOCK_CATEGORIES for any remaining IDs.
      const allKnownCategories = [
        ...draft.sellingCategories,
        ...MOCK_CATEGORIES,
      ];
      const seen = new Set<string>();
      const deduped = allKnownCategories.filter((c) => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });

      // Categories may come from the real API (stored in draft), not just MOCK_CATEGORIES
      // Build a map from id -> category using all known categories
      const catMap = new Map(deduped.map((c) => [c.id, c]));
      const selectedCategories: Category[] = categoryIds
        .map((id) => catMap.get(id))
        .filter((c): c is Category => !!c);

      // For any ids not found in known categories, create placeholder entries
      const foundIds = new Set(selectedCategories.map((c) => c.id));
      categoryIds.forEach((id) => {
        if (!foundIds.has(id)) {
          selectedCategories.push({ id, name: id, slug: id });
        }
      });

      const newDraft: VendorApplicationDraft = {
        ...draft,
        sellingCategories: selectedCategories,
      };

      const newStatus: VendorApplicationStatus = {
        ...status,
        sellingCategories: selectedCategories,
        sellingCategoriesComplete: selectedCategories.length > 0,
        lastUpdatedAt: new Date().toISOString(),
      };

      saveMockData(newStatus, newDraft);

      return {
        success: true,
        message: 'Selling categories updated',
        data: {
          categories: selectedCategories,
        },
      };
    }
    const response = await axiosInstance.patch<
      ApiResponse<{ categories: Category[] }>
    >('/vendor/application/selling-categories', { categoryIds });
    return response.data;
  },

  /**
   * A5: Get Selling Categories
   * GET /vendor/application/selling-categories
   * Fetches the vendor's currently-saved category selections
   */
  async getSellingCategories(): Promise<ApiResponse<Category[]>> {
    if (USE_MOCK_VENDOR_API) {
      const { draft } = getInitialMockData();
      return {
        success: true,
        message: 'Selling categories retrieved',
        data: draft.sellingCategories || [],
      };
    }
    const response = await axiosInstance.get<ApiResponse<Category[]>>(
      '/vendor/application/selling-categories'
    );
    return response.data;
  },

  /**
   * A1: Start Application
   * POST /vendor/application/start
   * Creates the vendor application and store identity
   * Must be called first before any other endpoint
   */
  async startApplication(data: {
    storeName: string;
    vendorType:
      | 'individual'
      | 'registered_business'
      | 'brand'
      | 'reseller'
      | 'dropshipper';
    storePhone?: string;
    storeEmail?: string;
  }): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      const newStatus: VendorApplicationStatus = {
        ...status,
        status: 'draft',
        storeName: data.storeName,
        vendorType: data.vendorType,
        storeSlug: data.storeName.toLowerCase().replace(/\s+/g, '-'),
        lastUpdatedAt: new Date().toISOString(),
      };

      const newDraft: VendorApplicationDraft = {
        ...draft,
        storeName: data.storeName,
        vendorType: data.vendorType,
        storePhone: data.storePhone || '',
        storeEmail: data.storeEmail || '',
      };

      saveMockData(newStatus, newDraft);

      return {
        success: true,
        message: 'Application started successfully',
        data: {
          applicationReference: newStatus.applicationReference,
          vendorProfileId: 'mock-uuid-123456789',
          status: newStatus.status,
          storeSlug: newStatus.storeSlug,
        },
      };
    }

    const payload: {
      storeName: string;
      vendorType: string;
      storePhone?: string;
      storeEmail?: string;
    } = {
      storeName: data.storeName.trim(),
      vendorType: data.vendorType,
    };

    const storePhone = data.storePhone?.trim();
    const storeEmail = data.storeEmail?.trim();

    if (storePhone) {
      payload.storePhone = storePhone;
    }

    if (storeEmail) {
      payload.storeEmail = storeEmail;
    }

    const response = await axiosInstance.post<ApiResponse<any>>(
      '/vendor/application/start',
      payload
    );
    return response.data;
  },

  /**
   * A2: Update Personal & Identity Information
   * PATCH /vendor/application/personal-info
   * Saves personal identity details - full name, DOB, address, NIN (BVN removed as per docs)
   */
  async savePersonalInfo(data: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    homeAddress: HomeAddress;
    nin: string;
  }): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      const newDraft: VendorApplicationDraft = {
        ...draft,
        personalInfo: data,
      };

      const newStatus: VendorApplicationStatus = {
        ...status,
        personalInfoComplete: true,
        lastUpdatedAt: new Date().toISOString(),
      };

      saveMockData(newStatus, newDraft);
      return {
        success: true,
        message: 'Personal information saved successfully',
        data: null,
      };
    }
    const response = await axiosInstance.patch<ApiResponse<any>>(
      '/vendor/application/personal-info',
      data
    );
    return response.data;
  },

  /**
   * A3: Update Business Registration Information
   * PATCH /vendor/application/business-info
   * Saves business registration data - only required for registered_business and brand
   */
  async saveBusinessInfo(data: {
    businessName: string;
    businessType: string;
    cacNumber: string;
    tinNumber: string;
    vatNumber?: string;
    dateOfIncorporation?: string;
  }): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      const newDraft: VendorApplicationDraft = {
        ...draft,
        businessInfo: data,
      };

      const newStatus: VendorApplicationStatus = {
        ...status,
        businessInfoComplete: true,
        lastUpdatedAt: new Date().toISOString(),
      };

      saveMockData(newStatus, newDraft);
      return {
        success: true,
        message: 'Business information saved successfully',
        data: null,
      };
    }
    const response = await axiosInstance.patch<ApiResponse<any>>(
      '/vendor/application/business-info',
      data
    );
    return response.data;
  },

  /**
   * A6: Update Store Description & Policies
   * PATCH /vendor/application/store-info
   * Saves public-facing store description, business address, and social links
   */
  async saveStoreInfo(data: {
    storeDescription: string;
    yearsInBusiness: string;
    businessAddress: BusinessAddress;
    socialLinks: SocialLinks;
  }): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      const newDraft: VendorApplicationDraft = {
        ...draft,
        storeInfo: data,
      };

      const newStatus: VendorApplicationStatus = {
        ...status,
        storeInfoComplete: true,
        lastUpdatedAt: new Date().toISOString(),
      };

      saveMockData(newStatus, newDraft);
      return {
        success: true,
        message: 'Store information saved successfully',
        data: null,
      };
    }
    const response = await axiosInstance.patch<ApiResponse<any>>(
      '/vendor/application/store-info',
      data
    );
    return response.data;
  },

  /**
   * A7: Get a Signed Upload URL for a Document
   * POST /vendor/application/documents/upload-url
   * First step of two-step document upload - gets temporary Cloudinary URL
   */
  async getDocumentUploadUrl(data: {
    documentType: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const folder = `vendor-docs/VEN-2026-00042/${data.documentType}`;
      return {
        success: true,
        message: 'Upload URL generated successfully',
        data: {
          uploadUrl:
            'https://api.cloudinary.com/v1_1/faflora/auto/upload?signature=mock',
          publicId: `${folder}/${Math.random().toString(36).substring(7)}`,
          folder,
          fields: {
            api_key: 'mock-key',
            timestamp: Math.floor(Date.now() / 1000),
            signature: 'mock-sig',
          },
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
      };
    }
    const response = await axiosInstance.post<ApiResponse<any>>(
      '/vendor/application/documents/upload-url',
      data
    );
    return response.data;
  },

  /**
   * A8: Confirm a Document Was Uploaded
   * POST /vendor/application/documents/confirm
   * Second step of two-step document upload - creates document record in database
   */
  async confirmDocumentUpload(data: {
    documentType: string;
    cloudinaryPublicId: string;
    documentUrl: string;
    originalFilename: string;
    fileSizeBytes: number;
    mimeType: string;
  }): Promise<ApiResponse<VendorDocument>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      const newDoc: VendorDocument = {
        id: `doc-${Math.random().toString(36).substring(7)}`,
        documentType: data.documentType,
        documentUrl: data.documentUrl,
        originalFilename: data.originalFilename,
        fileSizeBytes: data.fileSizeBytes,
        mimeType: data.mimeType,
        status: 'pending',
        rejectionReason: null,
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const newDocumentsList = draft.documents.filter(
        (d) => d.documentType !== data.documentType
      );
      newDocumentsList.push(newDoc);

      const newDraft: VendorApplicationDraft = {
        ...draft,
        documents: newDocumentsList,
      };

      const newStatusDocuments = status.documents.filter(
        (d) => d.documentType !== data.documentType
      );
      newStatusDocuments.push({
        documentType: data.documentType,
        status: 'pending',
        rejectionReason: null,
        uploadedAt: new Date().toISOString(),
        id: newDoc.id,
        originalFilename: data.originalFilename,
        fileSizeBytes: data.fileSizeBytes,
        documentUrl: data.documentUrl,
      });

      // Per docs: individual/reseller/dropshipper = gov_id + id_selfie (2)
      //            registered_business = gov_id + id_selfie + cac_cert + tin_cert (4)
      //            brand = gov_id + id_selfie + cac_cert + tin_cert + brand_auth (5)
      const requiredDocTypes: string[] =
        status.vendorType === 'brand'
          ? [
              'government_id',
              'id_selfie',
              'cac_certificate',
              'tin_certificate',
              'brand_authorization',
            ]
          : status.vendorType === 'registered_business'
            ? [
                'government_id',
                'id_selfie',
                'cac_certificate',
                'tin_certificate',
              ]
            : ['government_id', 'id_selfie'];

      // A document counts only if it is NOT rejected/requires_resubmission
      const isDocsComplete = requiredDocTypes.every((reqType) =>
        newStatusDocuments.some(
          (d) =>
            d.documentType === reqType &&
            d.status !== 'rejected' &&
            d.status !== 'requires_resubmission'
        )
      );

      const newStatus: VendorApplicationStatus = {
        ...status,
        documents: newStatusDocuments,
        documentsComplete: isDocsComplete,
        documentsInfoComplete: isDocsComplete,
        lastUpdatedAt: new Date().toISOString(),
      };

      saveMockData(newStatus, newDraft);

      return {
        success: true,
        message: 'Document uploaded successfully',
        data: newDoc,
      };
    }
    const response = await axiosInstance.post<ApiResponse<VendorDocument>>(
      '/vendor/application/documents/confirm',
      data
    );
    return response.data;
  },

  /**
   * A9: Delete an Uploaded Document
   * DELETE /vendor/application/documents/:documentId
   * Removes a document the vendor has uploaded
   */
  async deleteDocument(documentId: string): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      const newDocumentsList = draft.documents.filter(
        (d) => d.id !== documentId
      );
      const newStatusDocuments = status.documents.filter(
        (d) => d.id !== documentId
      );

      const newDraft: VendorApplicationDraft = {
        ...draft,
        documents: newDocumentsList,
      };

      const newStatus: VendorApplicationStatus = {
        ...status,
        documents: newStatusDocuments,
        documentsComplete: false,
        documentsInfoComplete: false,
        lastUpdatedAt: new Date().toISOString(),
      };

      saveMockData(newStatus, newDraft);
      return {
        success: true,
        message: 'Document deleted successfully',
        data: null,
      };
    }
    const response = await axiosInstance.delete<ApiResponse<any>>(
      `/vendor/application/documents/${documentId}`
    );
    return response.data;
  },

  /**
   * A10: Add a Bank Account
   * POST /vendor/application/bank-accounts
   * Saves a bank account for payouts
   */
  async addBankAccount(data: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    accountType: 'savings' | 'current';
  }): Promise<ApiResponse<VendorBankAccount>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      const isPrimary = draft.bankAccounts.length === 0;

      const newAccount: VendorBankAccount = {
        id: `bank-${Math.random().toString(36).substring(7)}`,
        accountName: data.accountName,
        accountNumber: `••••••${data.accountNumber.slice(-4)}`,
        bankName: data.bankName,
        bankCode: data.bankCode,
        accountType: data.accountType,
        isPrimary,
        isVerified: false,
      };

      const newAccounts = [...draft.bankAccounts, newAccount];

      const newDraft: VendorApplicationDraft = {
        ...draft,
        bankAccounts: newAccounts,
      };

      const newStatus: VendorApplicationStatus = {
        ...status,
        bankAccountsCount: newAccounts.length,
        lastUpdatedAt: new Date().toISOString(),
      };

      saveMockData(newStatus, newDraft);

      return {
        success: true,
        message: 'Bank account added successfully',
        data: newAccount,
      };
    }
    const response = await axiosInstance.post<ApiResponse<VendorBankAccount>>(
      '/vendor/application/bank-accounts',
      data
    );
    return response.data;
  },

  /**
   * A11: Get All Bank Accounts
   * GET /vendor/application/bank-accounts
   * Lists all bank accounts the vendor has added
   */
  async getBankAccounts(): Promise<ApiResponse<VendorBankAccount[]>> {
    if (USE_MOCK_VENDOR_API) {
      const { draft } = getInitialMockData();
      return { success: true, data: draft.bankAccounts };
    }
    const response = await axiosInstance.get<ApiResponse<VendorBankAccount[]>>(
      '/vendor/application/bank-accounts'
    );
    return response.data;
  },

  /**
   * A12: Delete a Bank Account
   * DELETE /vendor/application/bank-accounts/:accountId
   * Removes a bank account the vendor no longer wants
   */
  async deleteBankAccount(accountId: string): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      const newAccounts = draft.bankAccounts.filter((a) => a.id !== accountId);
      if (newAccounts.length > 0 && !newAccounts.some((a) => a.isPrimary)) {
        newAccounts[0].isPrimary = true;
      }

      const newDraft: VendorApplicationDraft = {
        ...draft,
        bankAccounts: newAccounts,
      };

      const newStatus: VendorApplicationStatus = {
        ...status,
        bankAccountsCount: newAccounts.length,
        lastUpdatedAt: new Date().toISOString(),
      };

      saveMockData(newStatus, newDraft);
      return {
        success: true,
        message: 'Bank account removed successfully',
        data: null,
      };
    }
    const response = await axiosInstance.delete<ApiResponse<any>>(
      `/vendor/application/bank-accounts/${accountId}`
    );
    return response.data;
  },

  /**
   * A13: Set a Bank Account as Primary
   * PATCH /vendor/application/bank-accounts/:accountId/set-primary
   * Marks a bank account as the default for payouts
   */
  async setPrimaryBankAccount(accountId: string): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      const newAccounts = draft.bankAccounts.map((a) => ({
        ...a,
        isPrimary: a.id === accountId,
      }));

      const newDraft: VendorApplicationDraft = {
        ...draft,
        bankAccounts: newAccounts,
      };

      saveMockData(status, newDraft);
      return {
        success: true,
        message: 'Primary bank account updated successfully',
        data: null,
      };
    }
    const response = await axiosInstance.patch<ApiResponse<any>>(
      `/vendor/application/bank-accounts/${accountId}/set-primary`
    );
    return response.data;
  },

  /**
   * A14: Get Application Draft (pre-fill on return visit)
   * GET /vendor/application/draft
   * Returns everything the user has saved so far for pre-filling forms
   */
  async getApplicationDraft(): Promise<ApiResponse<VendorApplicationDraft>> {
    if (USE_MOCK_VENDOR_API) {
      const { draft, status } = getInitialMockData();
      // Return draft with API-spec step-keyed shape per docs section 5.15
      const enrichedDraft: VendorApplicationDraft = {
        ...draft,
        step1: draft.storeName
          ? {
              storeName: draft.storeName,
              storeSlug:
                status.storeSlug ||
                draft.storeName.toLowerCase().replace(/\s+/g, '-'),
              vendorType: draft.vendorType,
              storePhone: draft.storePhone,
              storeEmail: draft.storeEmail,
            }
          : undefined,
        step2: {
          categories: draft.sellingCategories || [],
        },
        step3: draft.personalInfo
          ? {
              fullName: draft.personalInfo.fullName,
              dateOfBirth: draft.personalInfo.dateOfBirth,
              gender: draft.personalInfo.gender,
              homeAddress: draft.personalInfo.homeAddress,
              // NIN is never returned in plaintext per docs security note
              ninProvided: !!(
                draft.personalInfo.nin || draft.personalInfo.ninProvided
              ),
            }
          : null,
        step4: {
          businessName: draft.businessInfo?.businessName ?? null,
          businessType: draft.businessInfo?.businessType ?? null,
          cacNumber: draft.businessInfo?.cacNumber ?? null,
          tinNumber: draft.businessInfo?.tinNumber ?? null,
          vatNumber: draft.businessInfo?.vatNumber ?? null,
          dateOfIncorporation: draft.businessInfo?.dateOfIncorporation ?? null,
        },
        step5: {
          storeDescription: draft.storeInfo?.storeDescription ?? null,
          yearsInBusiness: draft.storeInfo?.yearsInBusiness ?? null,
          businessAddress: draft.storeInfo?.businessAddress ?? null,
          socialLinks: draft.storeInfo?.socialLinks ?? null,
        },
      };
      return { success: true, data: enrichedDraft };
    }
    const response = await axiosInstance.get<
      ApiResponse<VendorApplicationDraft>
    >('/vendor/application/draft');
    return response.data;
  },

  /**
   * A15: Check Application Status (progress tracker)
   * GET /vendor/application/status
   * Powers the progress checklist and shows application state
   */
  async getApplicationStatus(): Promise<ApiResponse<VendorApplicationStatus>> {
    if (USE_MOCK_VENDOR_API) {
      const { status } = getInitialMockData();
      return { success: true, data: status };
    }
    const response = await axiosInstance.get<
      ApiResponse<VendorApplicationStatus>
    >('/vendor/application/status');
    return response.data;
  },

  /**
   * A16: Submit the Application for Review
   * POST /vendor/application/submit
   * Final action - runs full server-side validation and submits for review
   */
  async submitApplication(): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      // Validation checks
      if (draft.storeName.length < 3) {
        throw new Error(
          'Please complete your store information (store name must be at least 3 characters)'
        );
      }
      if (!draft.personalInfo || !draft.personalInfo.fullName) {
        throw new Error('Please complete your personal information');
      }
      // Fixed: Check sellingCategories with proper null/undefined handling
      if (!status.sellingCategories || status.sellingCategories.length === 0) {
        throw new Error(
          'Please select at least one category you want to sell under'
        );
      }
      if (
        (status.vendorType === 'registered_business' ||
          status.vendorType === 'brand') &&
        (!draft.businessInfo || !draft.businessInfo.businessName)
      ) {
        throw new Error(
          'Please complete your business registration information'
        );
      }
      if (!draft.storeInfo || draft.storeInfo.storeDescription.length < 100) {
        throw new Error(
          'Please complete your store information (description must be at least 100 characters)'
        );
      }

      // Document requirements per docs section 5.16 table
      const requiredDocTypes: string[] =
        status.vendorType === 'brand'
          ? [
              'government_id',
              'id_selfie',
              'cac_certificate',
              'tin_certificate',
              'brand_authorization',
            ]
          : status.vendorType === 'registered_business'
            ? [
                'government_id',
                'id_selfie',
                'cac_certificate',
                'tin_certificate',
              ]
            : ['government_id', 'id_selfie'];
      const missingDocs = requiredDocTypes.filter(
        (reqType) =>
          !draft.documents.some(
            (d) =>
              d.documentType === reqType &&
              d.status !== 'rejected' &&
              d.status !== 'requires_resubmission'
          )
      );
      if (missingDocs.length > 0) {
        throw new Error(
          `Missing required documents: ${missingDocs.join(', ')}`
        );
      }
      if (draft.bankAccounts.length === 0) {
        throw new Error('Please add at least one bank account');
      }

      const newStatus: VendorApplicationStatus = {
        ...status,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };

      saveMockData(newStatus, draft);

      return {
        success: true,
        message: 'Application submitted successfully',
        data: {
          applicationReference: newStatus.applicationReference,
          status: newStatus.status,
          submittedAt: newStatus.submittedAt,
          estimatedReviewDays: '1-3 business days',
        },
      };
    }
    const response = await axiosInstance.post<ApiResponse<any>>(
      '/vendor/application/submit'
    );
    return response.data;
  },

  /**
   * A17: Resubmit After Corrections
   * POST /vendor/application/resubmit
   * Used when status is requires_resubmission - sends application back for review
   */
  async resubmitApplication(): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      const newStatus: VendorApplicationStatus = {
        ...status,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        resubmissionNote: null,
      };

      // Reset all documents to pending
      const updatedDocs = draft.documents.map((d) => ({
        ...d,
        status: 'pending' as const,
      }));

      const updatedStatusDocs = status.documents.map((d) => ({
        ...d,
        status: 'pending' as const,
      }));

      const newDraft = {
        ...draft,
        documents: updatedDocs,
      };

      newStatus.documents = updatedStatusDocs;

      saveMockData(newStatus, newDraft);

      return {
        success: true,
        message:
          'Application resubmitted for review. Our team will be in touch soon.',
        data: null,
      };
    }
    const response = await axiosInstance.post<ApiResponse<any>>(
      '/vendor/application/resubmit'
    );
    return response.data;
  },
};
