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
  step2?: { categoryIds?: string[]; categories?: Category[] };
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
  step6?: { documents?: VendorDocument[] };
  step7?: { bankAccounts?: VendorBankAccount[] };
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

    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        '/vendor/application/start',
        payload
      );
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 409) {
        return {
          success: true,
          message: 'Active application already exists',
          data: err.response?.data?.data || null,
        };
      }
      throw err;
    }
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
      const publicId = `${folder}/${Math.random().toString(36).substring(7)}`;
      const ext = data.fileName.includes('.') ? data.fileName.split('.').pop() : (data.mimeType.includes('pdf') ? 'pdf' : 'png');
      return {
        success: true,
        message: 'Upload URL generated successfully',
        data: {
          uploadUrl:
            'https://api.cloudinary.com/v1_1/faflora/image/upload',
          url: `https://res.cloudinary.com/faflora/image/authenticated/s--xyz--/${publicId}.${ext}`,
          publicId,
          folder,
          fields: {
            public_id: publicId,
            timestamp: Math.floor(Date.now() / 1000),
            type: 'authenticated',
            api_key: '123456789012345',
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
          categoryIds: (draft.sellingCategories || []).map((c) => c.id),
          categories: draft.sellingCategories || [],
        },
        step3: draft.personalInfo
          ? {
              fullName: draft.personalInfo.fullName,
              dateOfBirth: draft.personalInfo.dateOfBirth,
              gender: draft.personalInfo.gender,
              homeAddress: draft.personalInfo.homeAddress,
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
        step6: {
          documents: draft.documents || [],
        },
        step7: {
          bankAccounts: draft.bankAccounts || [],
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

// ─── Admin and Super Admin API Mock Data & Logic ─────────────────────────────

export interface AdminVendorProfile {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  storeDescription: string | null;
  storeLogoUrl: string | null;
  storeBannerUrl: string | null;
  storePhone: string | null;
  storeEmail: string | null;
  vendorType: string;
  applicationStatus:
    | 'draft'
    | 'submitted'
    | 'in_review'
    | 'requires_resubmission'
    | 'approved'
    | 'rejected'
    | 'suspended'
    | 'banned';
  applicationReference: string | null;
  trustLevel:
    | 'new_seller'
    | 'verified_seller'
    | 'trusted_seller'
    | 'top_seller'
    | 'official_brand';
  rejectionReason: string | null;
  resubmissionNote: string | null;
  isVacationMode: boolean;
  vacationMessage: string | null;
  returnPolicy: string | null;
  shippingPolicy: string | null;
  yearsInBusiness: number | null;
  businessAddress: BusinessAddress | null;
  socialLinks: SocialLinks | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  daysWaiting: number | null;
  assignedAdminId: string | null;
}

export interface AdminVendorDocument {
  id: string;
  documentType: string;
  documentUrl: string;
  originalFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  status: 'pending' | 'verified' | 'rejected' | 'requires_resubmission';
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminVendorBankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  accountType: string;
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface AdminVendorAuditLogEntry {
  id: string;
  vendorId: string;
  actorId: string | null;
  actorRole: string;
  action: string;
  notes: string | null;
  metadata: object | null;
  createdAt: string;
}

export interface AdminWithdrawal {
  id: string;
  vendorId: string;
  vendorStoreName?: string;
  bankAccountId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  failureReason: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface AdminFlaggedReview {
  id: string;
  vendorId: string;
  vendorStoreName?: string;
  customerId: string;
  orderId: string;
  productId?: string | null;
  reviewerName?: string | null;
  rating: number;
  comment?: string | null;
  images?: string[] | null;
  vendorReply?: string | null;
  vendorRepliedAt?: string | null;
  isFlagged: boolean;
  flaggedReason?: string | null;
  isHidden: boolean;
  hiddenBy?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AdminCommissionConfig {
  id: string;
  categoryId?: string | null;
  vendorId?: string | null;
  commissionRate: number;
  gatewayFeeRate: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const getInitialAdminMockData = () => {
  if (typeof window === 'undefined') {
    return {
      vendors: [] as AdminVendorProfile[],
      withdrawals: [] as AdminWithdrawal[],
      commissions: [] as AdminCommissionConfig[],
      reviews: [] as AdminFlaggedReview[],
      auditLogs: [] as AdminVendorAuditLogEntry[],
    };
  }

  let vendors = [] as AdminVendorProfile[];
  try {
    const val = localStorage.getItem('faflora_admin_vendors');
    if (val) vendors = JSON.parse(val);
  } catch {}

  if (vendors.length === 0) {
    vendors = [
      {
        id: 'v-1',
        userId: 'u-1',
        storeName: 'Afriflora Botanicals',
        storeSlug: 'afriflora-botanicals',
        storeDescription: 'A premium African plant and seed boutique selling authentic indigenous flora.',
        storeLogoUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=150&h=150&fit=crop',
        storeBannerUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=300&fit=crop',
        storePhone: '+2348011112222',
        storeEmail: 'info@afriflora.com',
        vendorType: 'brand',
        applicationStatus: 'submitted',
        applicationReference: 'VEN-2026-00001',
        trustLevel: 'new_seller',
        rejectionReason: null,
        resubmissionNote: null,
        isVacationMode: false,
        vacationMessage: null,
        returnPolicy: 'No refunds on live plants unless damaged during delivery.',
        shippingPolicy: 'Ships within Lagos in 2 business days.',
        yearsInBusiness: 3,
        businessAddress: { street: '15 Admiralty Way', city: 'Lekki', state: 'Lagos', lga: 'Eti-Osa', postalCode: '105102' },
        socialLinks: { instagram: '@afriflora', facebook: 'Afriflora', twitter: '@afriflora_bot', tiktok: null },
        approvedAt: null,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        daysWaiting: 4,
        assignedAdminId: 'mock-uuid-123456789'
      },
      {
        id: 'v-2',
        userId: 'u-2',
        storeName: 'Nesta Greens',
        storeSlug: 'nesta-greens',
        storeDescription: 'High quality indoor plants, succulents, and hanging baskets for modern homes.',
        storeLogoUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=150&h=150&fit=crop',
        storeBannerUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=300&fit=crop',
        storePhone: '+2348022223333',
        storeEmail: 'contact@nestagreens.com',
        vendorType: 'individual',
        applicationStatus: 'submitted',
        applicationReference: 'VEN-2026-00002',
        trustLevel: 'new_seller',
        rejectionReason: null,
        resubmissionNote: null,
        isVacationMode: false,
        vacationMessage: null,
        returnPolicy: '7-day replacement for damaged items.',
        shippingPolicy: 'Nationwide shipping via GIG Logistics.',
        yearsInBusiness: 1,
        businessAddress: { street: '42 Herbert Macaulay Way', city: 'Yaba', state: 'Lagos', lga: 'Lagos Mainland', postalCode: '101212' },
        socialLinks: { instagram: '@nestagreens', facebook: null, twitter: null, tiktok: null },
        approvedAt: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        daysWaiting: 1,
        assignedAdminId: null
      },
      {
        id: 'v-3',
        userId: 'u-3',
        storeName: 'Floral Design Co.',
        storeSlug: 'floral-design-co',
        storeDescription: 'Wedding bouquets, luxury event decorations, and fresh-cut roses.',
        storeLogoUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=150&h=150&fit=crop',
        storeBannerUrl: 'https://images.unsplash.com/photo-1519225495810-7517c5000916?w=800&h=300&fit=crop',
        storePhone: '+2348033334444',
        storeEmail: 'orders@floraldesign.com',
        vendorType: 'registered_business',
        applicationStatus: 'in_review',
        applicationReference: 'VEN-2026-00003',
        trustLevel: 'new_seller',
        rejectionReason: null,
        resubmissionNote: null,
        isVacationMode: false,
        vacationMessage: null,
        returnPolicy: 'No returns on cut flowers.',
        shippingPolicy: 'Same day delivery in Lagos.',
        yearsInBusiness: 5,
        businessAddress: { street: '7 Toyin Street', city: 'Ikeja', state: 'Lagos', lga: 'Ikeja', postalCode: '100001' },
        socialLinks: { instagram: '@floraldesignco', facebook: 'Floral Design Co', twitter: null, tiktok: '@floraldesign' },
        approvedAt: null,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        daysWaiting: null,
        assignedAdminId: 'mock-uuid-123456789'
      },
      {
        id: 'v-4',
        userId: 'u-4',
        storeName: 'Seed & Soil Depot',
        storeSlug: 'seed-soil-depot',
        storeDescription: 'Wholesale suppliers of organic compost, rare seeds, and gardening tools.',
        storeLogoUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=150&h=150&fit=crop',
        storeBannerUrl: 'https://images.unsplash.com/photo-1500628557208-055d4967907e?w=800&h=300&fit=crop',
        storePhone: '+2348044445555',
        storeEmail: 'wholesale@seedsoil.com',
        vendorType: 'registered_business',
        applicationStatus: 'requires_resubmission',
        applicationReference: 'VEN-2026-00004',
        trustLevel: 'new_seller',
        rejectionReason: null,
        resubmissionNote: 'Please re-upload your CAC certificate. The previous file was too blurry to read.',
        isVacationMode: false,
        vacationMessage: null,
        returnPolicy: '30-day return on unopened tools.',
        shippingPolicy: 'Bulk cargo delivery nationwide.',
        yearsInBusiness: 8,
        businessAddress: { street: 'Plot 12, Industrial Estate', city: 'Kano', state: 'Kano', lga: 'Fagge', postalCode: '700251' },
        socialLinks: { instagram: '@seedsoildepot', facebook: 'Seed & Soil Depot', twitter: '@seedsoil', tiktok: null },
        approvedAt: null,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        daysWaiting: null,
        assignedAdminId: 'other-admin-id'
      },
      {
        id: 'v-5',
        userId: 'u-5',
        storeName: 'EcoGrow Systems',
        storeSlug: 'ecogrow-systems',
        storeDescription: 'Hydroponics kits, smart planters, and LED grow lights for vertical farming.',
        storeLogoUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=150&h=150&fit=crop',
        storeBannerUrl: 'https://images.unsplash.com/photo-1558904541-efa8c1a68f6f?w=800&h=300&fit=crop',
        storePhone: '+2348055556666',
        storeEmail: 'support@ecogrow.com',
        vendorType: 'brand',
        applicationStatus: 'approved',
        applicationReference: 'VEN-2026-00005',
        trustLevel: 'official_brand',
        rejectionReason: null,
        resubmissionNote: null,
        isVacationMode: false,
        vacationMessage: null,
        returnPolicy: '1-year warranty on electronic grow systems.',
        shippingPolicy: 'Free shipping within Lagos and Abuja.',
        yearsInBusiness: 4,
        businessAddress: { street: '8 Gbadamosi Close', city: 'Surulere', state: 'Lagos', lga: 'Surulere', postalCode: '101283' },
        socialLinks: { instagram: '@ecogrowsystems', facebook: 'EcoGrow Systems', twitter: '@ecogrow_tech', tiktok: '@ecogrow' },
        approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        daysWaiting: null,
        assignedAdminId: 'mock-uuid-123456789'
      },
      {
        id: 'v-6',
        userId: 'u-6',
        storeName: 'Rooted Delights',
        storeSlug: 'rooted-delights',
        storeDescription: 'Foliage houseplants, plant pots, and organic plant food.',
        storeLogoUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=150&h=150&fit=crop',
        storeBannerUrl: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&h=300&fit=crop',
        storePhone: '+2348066667777',
        storeEmail: 'hello@rooteddelights.com',
        vendorType: 'reseller',
        applicationStatus: 'rejected',
        applicationReference: 'VEN-2026-00006',
        trustLevel: 'new_seller',
        rejectionReason: 'The business model is dropshipping without verification. We require a registered location or reseller agreement.',
        resubmissionNote: null,
        isVacationMode: false,
        vacationMessage: null,
        returnPolicy: 'No returns.',
        shippingPolicy: 'Ships from third-party warehouse.',
        yearsInBusiness: 1,
        businessAddress: { street: '99 Allen Avenue', city: 'Ikeja', state: 'Lagos', lga: 'Ikeja', postalCode: '100001' },
        socialLinks: { instagram: '@rooteddelights', facebook: null, twitter: null, tiktok: null },
        approvedAt: null,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        daysWaiting: null,
        assignedAdminId: 'other-admin-id'
      },
      {
        id: 'v-7',
        userId: 'u-7',
        storeName: 'Bloom & Petals',
        storeSlug: 'bloom-petals',
        storeDescription: 'Imported fresh flowers, bouquets, and flower wrapping paper.',
        storeLogoUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=150&h=150&fit=crop',
        storeBannerUrl: 'https://images.unsplash.com/photo-1470058869855-412f56c3bb33?w=800&h=300&fit=crop',
        storePhone: '+2348077778888',
        storeEmail: 'bloom@petals.com',
        vendorType: 'reseller',
        applicationStatus: 'suspended',
        applicationReference: 'VEN-2026-00007',
        trustLevel: 'verified_seller',
        rejectionReason: 'Repeated customer complaints regarding withered flower deliveries.',
        resubmissionNote: null,
        isVacationMode: false,
        vacationMessage: null,
        returnPolicy: '24-hour return on fresh items.',
        shippingPolicy: 'Express bike delivery.',
        yearsInBusiness: 2,
        businessAddress: { street: '24 Awolowo Road', city: 'Ikoyi', state: 'Lagos', lga: 'Eti-Osa', postalCode: '101233' },
        socialLinks: { instagram: '@bloompetals', facebook: 'Bloom & Petals', twitter: null, tiktok: null },
        approvedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        daysWaiting: null,
        assignedAdminId: 'mock-uuid-123456789'
      }
    ];
    localStorage.setItem('faflora_admin_vendors', JSON.stringify(vendors));
  }

  let withdrawals = [] as AdminWithdrawal[];
  try {
    const val = localStorage.getItem('faflora_admin_withdrawals');
    if (val) withdrawals = JSON.parse(val);
  } catch {}

  if (withdrawals.length === 0) {
    withdrawals = [
      {
        id: 'w-1',
        vendorId: 'v-5',
        vendorStoreName: 'EcoGrow Systems',
        bankAccountId: 'bank-1',
        amount: 320000,
        currency: 'NGN',
        status: 'pending',
        reference: 'WDR-2026-04981',
        failureReason: null,
        processedAt: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'w-2',
        vendorId: 'v-7',
        vendorStoreName: 'Bloom & Petals',
        bankAccountId: 'bank-2',
        amount: 85000,
        currency: 'NGN',
        status: 'completed',
        reference: 'WDR-2026-04875',
        failureReason: null,
        processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'w-3',
        vendorId: 'v-5',
        vendorStoreName: 'EcoGrow Systems',
        bankAccountId: 'bank-1',
        amount: 150000,
        currency: 'NGN',
        status: 'failed',
        reference: 'WDR-2026-04800',
        failureReason: 'Invalid account details - payout rejected by bank.',
        processedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('faflora_admin_withdrawals', JSON.stringify(withdrawals));
  }

  let commissions = [] as AdminCommissionConfig[];
  try {
    const val = localStorage.getItem('faflora_admin_commissions');
    if (val) commissions = JSON.parse(val);
  } catch {}

  if (commissions.length === 0) {
    commissions = [
      {
        id: 'comm-global',
        categoryId: null,
        vendorId: null,
        commissionRate: 10.0,
        gatewayFeeRate: 1.5,
        createdBy: 'admin-id-123',
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'comm-cat-1',
        categoryId: 'cat-2',
        vendorId: null,
        commissionRate: 8.0,
        gatewayFeeRate: 2.0,
        createdBy: 'admin-id-123',
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'comm-vendor-1',
        categoryId: null,
        vendorId: 'v-5',
        commissionRate: 5.0,
        gatewayFeeRate: 1.0,
        createdBy: 'admin-id-456',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('faflora_admin_commissions', JSON.stringify(commissions));
  }

  let reviews = [] as AdminFlaggedReview[];
  try {
    const val = localStorage.getItem('faflora_admin_reviews');
    if (val) reviews = JSON.parse(val);
  } catch {}

  if (reviews.length === 0) {
    reviews = [
      {
        id: 'rev-1',
        vendorId: 'v-5',
        vendorStoreName: 'EcoGrow Systems',
        customerId: 'cust-1',
        orderId: 'ord-1002',
        rating: 1,
        comment: 'The LED light caught fire after 3 hours of use! Extremely dangerous product.',
        vendorReply: 'We are incredibly sorry to hear this. We have contacted you to send a replacement unit and run diagnostics on your returns.',
        vendorRepliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isFlagged: true,
        flaggedReason: 'Profanity and safety accusation flagged by auto-moderator.',
        isHidden: false,
        hiddenBy: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'rev-2',
        vendorId: 'v-7',
        vendorStoreName: 'Bloom & Petals',
        customerId: 'cust-2',
        orderId: 'ord-1005',
        rating: 2,
        comment: 'Flowers arrived completely dry and dead. Total waste of my money!',
        vendorReply: null,
        vendorRepliedAt: null,
        isFlagged: true,
        flaggedReason: 'Seller flagged this review for competitor manipulation.',
        isHidden: false,
        hiddenBy: null,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'rev-3',
        vendorId: 'v-5',
        vendorStoreName: 'EcoGrow Systems',
        customerId: 'cust-3',
        orderId: 'ord-1009',
        rating: 5,
        comment: 'Absolutely love my hydroponic planter! Works like a charm.',
        vendorReply: 'Thank you for your support!',
        vendorRepliedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        isFlagged: true,
        flaggedReason: 'Flagged manually as test by admin.',
        isHidden: true,
        hiddenBy: 'admin-id-123',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('faflora_admin_reviews', JSON.stringify(reviews));
  }

  let auditLogs = [] as AdminVendorAuditLogEntry[];
  try {
    const val = localStorage.getItem('faflora_admin_audit_logs');
    if (val) auditLogs = JSON.parse(val);
  } catch {}

  if (auditLogs.length === 0) {
    auditLogs = [
      {
        id: 'log-1',
        vendorId: 'v-5',
        actorId: 'admin-id-123',
        actorRole: 'SUPER_ADMIN',
        action: 'APPROVE_APPLICATION',
        notes: 'Approved application for EcoGrow Systems. Credentials verified.',
        metadata: {},
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'log-2',
        vendorId: 'v-6',
        actorId: 'admin-id-456',
        actorRole: 'ADMIN',
        action: 'REJECT_APPLICATION',
        notes: 'Rejected application for Rooted Delights due to non-standard dropshipping model.',
        metadata: {},
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'log-3',
        vendorId: 'v-7',
        actorId: 'admin-id-123',
        actorRole: 'SUPER_ADMIN',
        action: 'SUSPEND_VENDOR',
        notes: 'Suspended Bloom & Petals due to excess user complaints.',
        metadata: {},
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('faflora_admin_audit_logs', JSON.stringify(auditLogs));
  }

  return { vendors, withdrawals, commissions, reviews, auditLogs };
};

export const saveAdminMockData = (data: {
  vendors?: AdminVendorProfile[];
  withdrawals?: AdminWithdrawal[];
  commissions?: AdminCommissionConfig[];
  reviews?: AdminFlaggedReview[];
  auditLogs?: AdminVendorAuditLogEntry[];
}) => {
  if (typeof window === 'undefined') return;
  if (data.vendors) localStorage.setItem('faflora_admin_vendors', JSON.stringify(data.vendors));
  if (data.withdrawals) localStorage.setItem('faflora_admin_withdrawals', JSON.stringify(data.withdrawals));
  if (data.commissions) localStorage.setItem('faflora_admin_commissions', JSON.stringify(data.commissions));
  if (data.reviews) localStorage.setItem('faflora_admin_reviews', JSON.stringify(data.reviews));
  if (data.auditLogs) localStorage.setItem('faflora_admin_audit_logs', JSON.stringify(data.auditLogs));
};

const paginateMockArray = <T>(arr: T[], page: number, limit: number) => {
  const total = arr.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const finalPage = Math.min(totalPages, Math.max(1, page));
  const offset = (finalPage - 1) * limit;
  const paginated = arr.slice(offset, offset + limit);

  return {
    items: paginated,
    pagination: {
      total,
      page: finalPage,
      limit,
      totalPages,
    },
  };
};

export const adminVendorApi = {
  // F1: List All Vendors
  async listVendors(params: {
    status?: string;
    vendorType?: string;
    trustLevel?: string;
    search?: string;
    assignedAdminId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<{ vendors: AdminVendorProfile[]; pagination: any }>> {
    if (USE_MOCK_VENDOR_API) {
      const { vendors } = getInitialAdminMockData();
      let filtered = [...vendors];

      if (params.status) {
        filtered = filtered.filter((v) => v.applicationStatus === params.status);
      }
      if (params.vendorType) {
        filtered = filtered.filter((v) => v.vendorType === params.vendorType);
      }
      if (params.trustLevel) {
        filtered = filtered.filter((v) => v.trustLevel === params.trustLevel);
      }
      if (params.assignedAdminId) {
        filtered = filtered.filter((v) => v.assignedAdminId === params.assignedAdminId);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.storeName.toLowerCase().includes(q) ||
            (v.applicationReference && v.applicationReference.toLowerCase().includes(q))
        );
      }

      const paginated = paginateMockArray(filtered, params.page || 1, params.limit || 20);
      return {
        success: true,
        message: 'Vendors retrieved successfully',
        data: {
          vendors: paginated.items,
          pagination: paginated.pagination,
        },
      };
    }

    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });

    const res = await axiosInstance.get<ApiResponse<any>>(`/admin/vendors?${query.toString()}`);
    return res.data;
  },

  // F2: Pending Applications Queue
  async getPendingApplications(params: { page?: number; limit?: number } = {}): Promise<
    ApiResponse<{ applications: (AdminVendorProfile & { isUrgent: boolean })[]; pagination: any }>
  > {
    if (USE_MOCK_VENDOR_API) {
      const { vendors } = getInitialAdminMockData();
      const pending = vendors
        .filter((v) => v.applicationStatus === 'submitted')
        .map((v) => {
          const creationDate = new Date(v.createdAt).getTime();
          const diffDays = Math.floor((Date.now() - creationDate) / (1000 * 60 * 60 * 24));
          return {
            ...v,
            daysWaiting: diffDays,
            isUrgent: diffDays > 3,
          };
        });

      const paginated = paginateMockArray(pending, params.page || 1, params.limit || 20);
      return {
        success: true,
        message: 'Pending applications retrieved successfully',
        data: {
          applications: paginated.items,
          pagination: paginated.pagination,
        },
      };
    }

    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    try {
      const res = await axiosInstance.get<ApiResponse<any>>(
        `/admin/vendors/applications/pending?${query.toString()}`
      );
      return res.data;
    } catch (err) {
      // Fallback to F1 if F2 is missing on backend
      const fallback = await this.listVendors({
        status: 'submitted',
        page: params.page,
        limit: params.limit,
      });
      return {
        success: fallback.success,
        message: fallback.message,
        data: {
          applications: fallback.data.vendors.map((v) => {
            const creationDate = new Date(v.createdAt).getTime();
            const diffDays = Math.floor((Date.now() - creationDate) / (1000 * 60 * 60 * 24));
            return {
              ...v,
              daysWaiting: diffDays,
              isUrgent: diffDays > 3,
            };
          }),
          pagination: fallback.data.pagination,
        },
      };
    }
  },

  // F3: In-Review Applications Queue
  async getInReviewApplications(params: { page?: number; limit?: number } = {}): Promise<
    ApiResponse<{ vendors: AdminVendorProfile[]; pagination: any }>
  > {
    if (USE_MOCK_VENDOR_API) {
      const { vendors } = getInitialAdminMockData();
      const list = vendors.filter((v) => v.applicationStatus === 'in_review');
      const paginated = paginateMockArray(list, params.page || 1, params.limit || 20);
      return {
        success: true,
        data: { vendors: paginated.items, pagination: paginated.pagination },
      };
    }

    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    try {
      const res = await axiosInstance.get<ApiResponse<any>>(
        `/admin/vendors/applications/in-review?${query.toString()}`
      );
      return res.data;
    } catch {
      return this.listVendors({ status: 'in_review', page: params.page, limit: params.limit });
    }
  },

  // F4: Awaiting Resubmission Queue
  async getAwaitingResubmission(params: { page?: number; limit?: number } = {}): Promise<
    ApiResponse<{ vendors: AdminVendorProfile[]; pagination: any }>
  > {
    if (USE_MOCK_VENDOR_API) {
      const { vendors } = getInitialAdminMockData();
      const list = vendors.filter((v) => v.applicationStatus === 'requires_resubmission');
      const paginated = paginateMockArray(list, params.page || 1, params.limit || 20);
      return {
        success: true,
        data: { vendors: paginated.items, pagination: paginated.pagination },
      };
    }

    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    try {
      const res = await axiosInstance.get<ApiResponse<any>>(
        `/admin/vendors/applications/requires-resubmission?${query.toString()}`
      );
      return res.data;
    } catch {
      return this.listVendors({
        status: 'requires_resubmission',
        page: params.page,
        limit: params.limit,
      });
    }
  },

  // custom endpoint client helper for Approved tab
  async getApprovedApplications(params: { page?: number; limit?: number } = {}): Promise<
    ApiResponse<{ vendors: AdminVendorProfile[]; pagination: any }>
  > {
    if (USE_MOCK_VENDOR_API) {
      const { vendors } = getInitialAdminMockData();
      const list = vendors.filter((v) => v.applicationStatus === 'approved');
      const paginated = paginateMockArray(list, params.page || 1, params.limit || 20);
      return {
        success: true,
        data: { vendors: paginated.items, pagination: paginated.pagination },
      };
    }

    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      const res = await axiosInstance.get<ApiResponse<any>>(
        `/admin/vendors/applications/approved?${query.toString()}`
      );
      return res.data;
    } catch {
      return this.listVendors({ status: 'approved', page: params.page, limit: params.limit });
    }
  },

  // custom endpoint client helper for Rejected tab
  async getRejectedApplications(params: { page?: number; limit?: number } = {}): Promise<
    ApiResponse<{ vendors: AdminVendorProfile[]; pagination: any }>
  > {
    if (USE_MOCK_VENDOR_API) {
      const { vendors } = getInitialAdminMockData();
      const list = vendors.filter((v) => v.applicationStatus === 'rejected');
      const paginated = paginateMockArray(list, params.page || 1, params.limit || 20);
      return {
        success: true,
        data: { vendors: paginated.items, pagination: paginated.pagination },
      };
    }

    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      const res = await axiosInstance.get<ApiResponse<any>>(
        `/admin/vendors/applications/rejected?${query.toString()}`
      );
      return res.data;
    } catch {
      return this.listVendors({ status: 'rejected', page: params.page, limit: params.limit });
    }
  },

  // custom endpoint client helper for Suspended tab
  async getSuspendedApplications(params: { page?: number; limit?: number } = {}): Promise<
    ApiResponse<{ vendors: AdminVendorProfile[]; pagination: any }>
  > {
    if (USE_MOCK_VENDOR_API) {
      const { vendors } = getInitialAdminMockData();
      const list = vendors.filter((v) => v.applicationStatus === 'suspended');
      const paginated = paginateMockArray(list, params.page || 1, params.limit || 20);
      return {
        success: true,
        data: { vendors: paginated.items, pagination: paginated.pagination },
      };
    }

    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      const res = await axiosInstance.get<ApiResponse<any>>(
        `/admin/vendors/applications/suspended?${query.toString()}`
      );
      return res.data;
    } catch {
      return this.listVendors({ status: 'suspended', page: params.page, limit: params.limit });
    }
  },

  // custom endpoint client helper for Banned tab
  async getBannedApplications(params: { page?: number; limit?: number } = {}): Promise<
    ApiResponse<{ vendors: AdminVendorProfile[]; pagination: any }>
  > {
    if (USE_MOCK_VENDOR_API) {
      const { vendors } = getInitialAdminMockData();
      const list = vendors.filter((v) => v.applicationStatus === 'banned');
      const paginated = paginateMockArray(list, params.page || 1, params.limit || 20);
      return {
        success: true,
        data: { vendors: paginated.items, pagination: paginated.pagination },
      };
    }

    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      const res = await axiosInstance.get<ApiResponse<any>>(
        `/admin/vendors/applications/banned?${query.toString()}`
      );
      return res.data;
    } catch {
      return this.listVendors({ status: 'banned', page: params.page, limit: params.limit });
    }
  },

  // F5: Full Vendor Detail
  async getVendorDetail(vendorId: string): Promise<
    ApiResponse<{
      profile: AdminVendorProfile;
      documents: AdminVendorDocument[];
      bankAccounts: AdminVendorBankAccount[];
      recentAuditLog: AdminVendorAuditLogEntry[];
    }>
  > {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, auditLogs } = getInitialAdminMockData();
      const profile = vendors.find((v) => v.id === vendorId);
      if (!profile) throw new Error('Vendor profile not found.');

      // Mock documents
      const docs: AdminVendorDocument[] = [
        {
          id: 'doc-gov-id',
          documentType: 'government_id',
          documentUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400',
          originalFilename: 'National_ID_Card.jpg',
          fileSizeBytes: 1024 * 450,
          mimeType: 'image/jpeg',
          status: profile.applicationStatus === 'approved' ? 'verified' : 'pending',
          rejectionReason: null,
          reviewedAt: profile.approvedAt,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
        {
          id: 'doc-selfie',
          documentType: 'id_selfie',
          documentUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          originalFilename: 'Selfie_Verification.jpg',
          fileSizeBytes: 1024 * 380,
          mimeType: 'image/jpeg',
          status: profile.applicationStatus === 'approved' ? 'verified' : 'pending',
          rejectionReason: null,
          reviewedAt: profile.approvedAt,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
      ];

      // If registered_business or brand, add CAC and TIN certs
      if (profile.vendorType === 'registered_business' || profile.vendorType === 'brand') {
        docs.push({
          id: 'doc-cac',
          documentType: 'cac_certificate',
          documentUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400',
          originalFilename: 'CAC_RC_Certificate.pdf',
          fileSizeBytes: 1024 * 1250,
          mimeType: 'application/pdf',
          status: profile.applicationStatus === 'approved' ? 'verified' : 'pending',
          rejectionReason: null,
          reviewedAt: profile.approvedAt,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        });
        docs.push({
          id: 'doc-tin',
          documentType: 'tin_certificate',
          documentUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400',
          originalFilename: 'TIN_Tax_Assigned.pdf',
          fileSizeBytes: 1024 * 920,
          mimeType: 'application/pdf',
          status: profile.applicationStatus === 'approved' ? 'verified' : 'pending',
          rejectionReason: null,
          reviewedAt: profile.approvedAt,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        });
      }

      // If brand, add authorization letter
      if (profile.vendorType === 'brand') {
        docs.push({
          id: 'doc-brand-auth',
          documentType: 'brand_authorization',
          documentUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400',
          originalFilename: 'Brand_Authorization_Letter.pdf',
          fileSizeBytes: 1024 * 850,
          mimeType: 'application/pdf',
          status: profile.applicationStatus === 'approved' ? 'verified' : 'pending',
          rejectionReason: null,
          reviewedAt: profile.approvedAt,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        });
      }

      // Mock bank accounts
      const banks: AdminVendorBankAccount[] = [
        {
          id: 'bank-1',
          accountName: profile.storeName,
          accountNumber: '••••••1049',
          bankName: 'Access Bank PLC',
          bankCode: '044',
          accountType: 'current',
          isPrimary: true,
          isVerified: true,
          createdAt: profile.createdAt,
        },
      ];

      // Vendor Audit Logs
      const logs = auditLogs.filter((l) => l.vendorId === vendorId);

      return {
        success: true,
        data: {
          profile,
          documents: docs,
          bankAccounts: banks,
          recentAuditLog: logs,
        },
      };
    }

    const res = await axiosInstance.get<ApiResponse<any>>(`/admin/vendors/${vendorId}`);
    return res.data;
  },

  // F6: Assign Application to Reviewer
  async assignVendor(
    vendorId: string,
    adminId: string
  ): Promise<ApiResponse<{ message: string; status: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, auditLogs } = getInitialAdminMockData();
      const idx = vendors.findIndex((v) => v.id === vendorId);
      if (idx !== -1) {
        vendors[idx].assignedAdminId = adminId;
        vendors[idx].applicationStatus = 'in_review';
        vendors[idx].updatedAt = new Date().toISOString();

        const log: AdminVendorAuditLogEntry = {
          id: `log-${Math.random().toString(36).substring(7)}`,
          vendorId,
          actorId: 'mock-uuid-123456789',
          actorRole: 'ADMIN',
          action: 'ASSIGN_REVIEWER',
          notes: `Assigned application to admin reviewer ${adminId}`,
          metadata: { adminId },
          createdAt: new Date().toISOString(),
        };
        auditLogs.unshift(log);

        saveAdminMockData({ vendors, auditLogs });
        return {
          success: true,
          message: 'Application assigned successfully',
          data: { message: 'Assigned', status: 'in_review' },
        };
      }
      throw new Error('Vendor not found.');
    }

    const res = await axiosInstance.post<ApiResponse<any>>(`/admin/vendors/${vendorId}/assign`, {
      adminId,
    });
    return res.data;
  },

  // F7: Get All Documents for a Vendor
  async getVendorDocuments(vendorId: string): Promise<ApiResponse<AdminVendorDocument[]>> {
    if (USE_MOCK_VENDOR_API) {
      const res = await this.getVendorDetail(vendorId);
      return {
        success: true,
        data: res.data.documents,
      };
    }
    const res = await axiosInstance.get<ApiResponse<any>>(`/admin/vendors/${vendorId}/documents`);
    return res.data;
  },

  // F8: Review a Single Document
  async reviewDocument(
    vendorId: string,
    documentId: string,
    data: { action: 'verified' | 'rejected' | 'requires_resubmission'; reason?: string }
  ): Promise<ApiResponse<{ message: string; document: AdminVendorDocument }>> {
    if (USE_MOCK_VENDOR_API) {
      const detail = await this.getVendorDetail(vendorId);
      const doc = detail.data.documents.find((d) => d.id === documentId);
      if (!doc) throw new Error('Document not found.');

      doc.status = data.action;
      doc.rejectionReason = data.reason || null;
      doc.reviewedAt = new Date().toISOString();
      doc.updatedAt = new Date().toISOString();

      const log: AdminVendorAuditLogEntry = {
        id: `log-${Math.random().toString(36).substring(7)}`,
        vendorId,
        actorId: 'mock-uuid-123456789',
        actorRole: 'ADMIN',
        action: 'REVIEW_DOCUMENT',
        notes: `Reviewed document ${doc.documentType} to status ${data.action}. Reason: ${data.reason || 'None'}`,
        metadata: { documentId, action: data.action },
        createdAt: new Date().toISOString(),
      };
      const { auditLogs } = getInitialAdminMockData();
      auditLogs.unshift(log);
      saveAdminMockData({ auditLogs });

      return {
        success: true,
        message: 'Document reviewed successfully',
        data: { message: 'Document updated', document: doc },
      };
    }

    const res = await axiosInstance.patch<ApiResponse<any>>(
      `/admin/vendors/${vendorId}/documents/${documentId}/review`,
      data
    );
    return res.data;
  },

  // F9: Approve a Vendor
  async approveVendor(vendorId: string): Promise<ApiResponse<{ message: string; approvedAt: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, auditLogs } = getInitialAdminMockData();
      const idx = vendors.findIndex((v) => v.id === vendorId);
      if (idx !== -1) {
        const approvedAt = new Date().toISOString();
        vendors[idx].applicationStatus = 'approved';
        vendors[idx].approvedAt = approvedAt;
        vendors[idx].updatedAt = approvedAt;

        const log: AdminVendorAuditLogEntry = {
          id: `log-${Math.random().toString(36).substring(7)}`,
          vendorId,
          actorId: 'mock-uuid-123456789',
          actorRole: 'ADMIN',
          action: 'APPROVE_VENDOR',
          notes: 'Approved vendor application and activated store.',
          metadata: {},
          createdAt: approvedAt,
        };
        auditLogs.unshift(log);

        saveAdminMockData({ vendors, auditLogs });
        return {
          success: true,
          message: 'Vendor approved successfully',
          data: { message: 'Approved', approvedAt },
        };
      }
      throw new Error('Vendor not found.');
    }

    const res = await axiosInstance.post<ApiResponse<any>>(`/admin/vendors/${vendorId}/approve`);
    return res.data;
  },

  // F10: Reject a Vendor
  async rejectVendor(vendorId: string, reason: string): Promise<ApiResponse<{ message: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, auditLogs } = getInitialAdminMockData();
      const idx = vendors.findIndex((v) => v.id === vendorId);
      if (idx !== -1) {
        vendors[idx].applicationStatus = 'rejected';
        vendors[idx].rejectionReason = reason;
        vendors[idx].updatedAt = new Date().toISOString();

        const log: AdminVendorAuditLogEntry = {
          id: `log-${Math.random().toString(36).substring(7)}`,
          vendorId,
          actorId: 'mock-uuid-123456789',
          actorRole: 'ADMIN',
          action: 'REJECT_VENDOR',
          notes: `Rejected application. Reason: ${reason}`,
          metadata: { reason },
          createdAt: new Date().toISOString(),
        };
        auditLogs.unshift(log);

        saveAdminMockData({ vendors, auditLogs });
        return {
          success: true,
          message: 'Vendor application rejected successfully',
          data: { message: 'Rejected' },
        };
      }
      throw new Error('Vendor not found.');
    }

    const res = await axiosInstance.post<ApiResponse<any>>(`/admin/vendors/${vendorId}/reject`, {
      reason,
    });
    return res.data;
  },

  // F11: Request Document Resubmission
  async requestResubmission(vendorId: string, note: string): Promise<ApiResponse<{ message: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, auditLogs } = getInitialAdminMockData();
      const idx = vendors.findIndex((v) => v.id === vendorId);
      if (idx !== -1) {
        vendors[idx].applicationStatus = 'requires_resubmission';
        vendors[idx].resubmissionNote = note;
        vendors[idx].updatedAt = new Date().toISOString();

        const log: AdminVendorAuditLogEntry = {
          id: `log-${Math.random().toString(36).substring(7)}`,
          vendorId,
          actorId: 'mock-uuid-123456789',
          actorRole: 'ADMIN',
          action: 'REQUEST_RESUBMISSION',
          notes: `Requested document resubmission. Note: ${note}`,
          metadata: { note },
          createdAt: new Date().toISOString(),
        };
        auditLogs.unshift(log);

        saveAdminMockData({ vendors, auditLogs });
        return {
          success: true,
          message: 'Resubmission requested successfully',
          data: { message: 'Requires Resubmission' },
        };
      }
      throw new Error('Vendor not found.');
    }

    const res = await axiosInstance.post<ApiResponse<any>>(
      `/admin/vendors/${vendorId}/request-resubmission`,
      { note }
    );
    return res.data;
  },

  // F12: Suspend a Vendor
  async suspendVendor(vendorId: string, reason: string): Promise<ApiResponse<{ message: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, auditLogs } = getInitialAdminMockData();
      const idx = vendors.findIndex((v) => v.id === vendorId);
      if (idx !== -1) {
        vendors[idx].applicationStatus = 'suspended';
        vendors[idx].rejectionReason = reason;
        vendors[idx].updatedAt = new Date().toISOString();

        const log: AdminVendorAuditLogEntry = {
          id: `log-${Math.random().toString(36).substring(7)}`,
          vendorId,
          actorId: 'mock-uuid-123456789',
          actorRole: 'ADMIN',
          action: 'SUSPEND_VENDOR',
          notes: `Suspended vendor store. Reason: ${reason}`,
          metadata: { reason },
          createdAt: new Date().toISOString(),
        };
        auditLogs.unshift(log);

        saveAdminMockData({ vendors, auditLogs });
        return {
          success: true,
          message: 'Vendor suspended successfully',
          data: { message: 'Suspended' },
        };
      }
      throw new Error('Vendor not found.');
    }

    const res = await axiosInstance.post<ApiResponse<any>>(`/admin/vendors/${vendorId}/suspend`, {
      reason,
    });
    return res.data;
  },

  // F13: Reactivate Suspended Vendor
  async reactivateVendor(vendorId: string): Promise<ApiResponse<{ message: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, auditLogs } = getInitialAdminMockData();
      const idx = vendors.findIndex((v) => v.id === vendorId);
      if (idx !== -1) {
        vendors[idx].applicationStatus = 'approved';
        vendors[idx].rejectionReason = null;
        vendors[idx].updatedAt = new Date().toISOString();

        const log: AdminVendorAuditLogEntry = {
          id: `log-${Math.random().toString(36).substring(7)}`,
          vendorId,
          actorId: 'mock-uuid-123456789',
          actorRole: 'ADMIN',
          action: 'REACTIVATE_VENDOR',
          notes: 'Reactivated suspended vendor store.',
          metadata: {},
          createdAt: new Date().toISOString(),
        };
        auditLogs.unshift(log);

        saveAdminMockData({ vendors, auditLogs });
        return {
          success: true,
          message: 'Vendor reactivated successfully',
          data: { message: 'Reactivated' },
        };
      }
      throw new Error('Vendor not found.');
    }

    const res = await axiosInstance.post<ApiResponse<any>>(`/admin/vendors/${vendorId}/reactivate`);
    return res.data;
  },

  // F14: Upgrade Vendor Trust Level
  async upgradeTrustLevel(
    vendorId: string,
    trustLevel: string
  ): Promise<ApiResponse<{ message: string; trustLevel: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, auditLogs } = getInitialAdminMockData();
      const idx = vendors.findIndex((v) => v.id === vendorId);
      if (idx !== -1) {
        vendors[idx].trustLevel = trustLevel as any;
        vendors[idx].updatedAt = new Date().toISOString();

        const log: AdminVendorAuditLogEntry = {
          id: `log-${Math.random().toString(36).substring(7)}`,
          vendorId,
          actorId: 'mock-uuid-123456789',
          actorRole: 'ADMIN',
          action: 'UPGRADE_TRUST_LEVEL',
          notes: `Upgraded trust level to ${trustLevel}`,
          metadata: { trustLevel },
          createdAt: new Date().toISOString(),
        };
        auditLogs.unshift(log);

        saveAdminMockData({ vendors, auditLogs });
        return {
          success: true,
          message: 'Trust level updated successfully',
          data: { message: 'Upgraded', trustLevel },
        };
      }
      throw new Error('Vendor not found.');
    }

    const res = await axiosInstance.post<ApiResponse<any>>(
      `/admin/vendors/${vendorId}/upgrade-trust-level`,
      { trustLevel }
    );
    return res.data;
  },

  // F15: View Vendor Earnings
  async getVendorEarnings(vendorId: string): Promise<
    ApiResponse<{
      availableBalance: number;
      pendingBalance: number;
      processingBalance: number;
      lifetimeEarnings: number;
      totalWithdrawn: number;
    }>
  > {
    if (USE_MOCK_VENDOR_API) {
      return {
        success: true,
        data: {
          availableBalance: 450000,
          pendingBalance: 125000,
          processingBalance: 320000,
          lifetimeEarnings: 980000,
          totalWithdrawn: 405000,
        },
      };
    }
    const res = await axiosInstance.get<ApiResponse<any>>(`/admin/vendors/${vendorId}/earnings`);
    return res.data;
  },

  // F16: View Vendor Earnings History
  async getVendorEarningsHistory(
    vendorId: string,
    params: { startDate?: string; endDate?: string; status?: string; page?: number; limit?: number } = {}
  ): Promise<
    ApiResponse<{
      earnings: Array<{
        id: string;
        orderNumber: string;
        date: string;
        grossAmount: number;
        commissionRate: number;
        commissionAmount: number;
        gatewayFeeAmount: number;
        netAmount: number;
        status: string;
      }>;
      total: number;
    }>
  > {
    if (USE_MOCK_VENDOR_API) {
      const records = [
        {
          id: 'e-1',
          orderNumber: 'ORD-99812',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          grossAmount: 45000,
          commissionRate: 10,
          commissionAmount: 4500,
          gatewayFeeAmount: 675,
          netAmount: 39825,
          status: 'available',
        },
        {
          id: 'e-2',
          orderNumber: 'ORD-99754',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          grossAmount: 120000,
          commissionRate: 8,
          commissionAmount: 9600,
          gatewayFeeAmount: 1800,
          netAmount: 108600,
          status: 'available',
        },
        {
          id: 'e-3',
          orderNumber: 'ORD-10022',
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          grossAmount: 85000,
          commissionRate: 10,
          commissionAmount: 8500,
          gatewayFeeAmount: 1275,
          netAmount: 75225,
          status: 'withdrawn',
        },
      ];
      return {
        success: true,
        data: {
          earnings: records,
          total: records.length,
        },
      };
    }

    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });

    const res = await axiosInstance.get<ApiResponse<any>>(
      `/admin/vendors/${vendorId}/earnings/history?${query.toString()}`
    );
    return res.data;
  },

  // F17: View Vendor Audit Log
  async getVendorAuditLog(
    vendorId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<ApiResponse<{ entries: AdminVendorAuditLogEntry[]; total: number }>> {
    if (USE_MOCK_VENDOR_API) {
      const { auditLogs } = getInitialAdminMockData();
      const logs = auditLogs.filter((l) => l.vendorId === vendorId);
      const paginated = paginateMockArray(logs, params.page || 1, params.limit || 50);
      return {
        success: true,
        data: {
          entries: paginated.items,
          total: paginated.pagination.total,
        },
      };
    }

    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const res = await axiosInstance.get<ApiResponse<any>>(
      `/admin/vendors/${vendorId}/audit-log?${query.toString()}`
    );
    return res.data;
  },

  // F18: All Withdrawal Requests (Super Admin uses /super-admin/payouts/withdrawals, Admin uses /admin/vendors/withdrawals)
  async getAllWithdrawalRequests(
    params: {
      status?: string;
      vendorId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
      isSuperAdmin?: boolean;
    } = {}
  ): Promise<ApiResponse<{ withdrawals: AdminWithdrawal[]; total: number }>> {
    if (USE_MOCK_VENDOR_API) {
      const { withdrawals } = getInitialAdminMockData();
      let filtered = [...withdrawals];

      if (params.status) filtered = filtered.filter((w) => w.status === params.status);
      if (params.vendorId) filtered = filtered.filter((w) => w.vendorId === params.vendorId);

      const paginated = paginateMockArray(filtered, params.page || 1, params.limit || 20);
      return {
        success: true,
        data: {
          withdrawals: paginated.items,
          total: paginated.pagination.total,
        },
      };
    }

    const query = new URLSearchParams();
    const { isSuperAdmin, ...queryParams } = params;
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });

    const endpoint = isSuperAdmin
      ? `/super-admin/payouts/withdrawals?${query.toString()}`
      : `/admin/vendors/withdrawals?${query.toString()}`;

    const res = await axiosInstance.get<ApiResponse<any>>(endpoint);
    return res.data;
  },

  // F19: Process a Withdrawal (Super Admin uses /super-admin/payouts/withdrawals/:id/process, Admin uses /admin/vendors/withdrawals/:id/process)
  async processWithdrawal(
    withdrawalId: string,
    data: { action: 'complete' | 'fail'; reason?: string },
    isSuperAdmin?: boolean
  ): Promise<ApiResponse<{ message: string; status: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { withdrawals } = getInitialAdminMockData();
      const idx = withdrawals.findIndex((w) => w.id === withdrawalId);
      if (idx !== -1) {
        withdrawals[idx].status = data.action === 'complete' ? 'completed' : 'failed';
        withdrawals[idx].failureReason = data.reason || null;
        withdrawals[idx].processedAt = new Date().toISOString();

        saveAdminMockData({ withdrawals });
        return {
          success: true,
          message: 'Withdrawal processed successfully',
          data: { message: 'Processed', status: withdrawals[idx].status },
        };
      }
      throw new Error('Withdrawal request not found.');
    }

    const endpoint = isSuperAdmin
      ? `/super-admin/payouts/withdrawals/${withdrawalId}/process`
      : `/admin/vendors/withdrawals/${withdrawalId}/process`;

    const res = await axiosInstance.patch<ApiResponse<any>>(endpoint, data);
    return res.data;
  },

  // G8-A: Super Admin Payout Summary (GET /super-admin/payouts/summary)
  async getPayoutSummary(): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      return {
        success: true,
        data: {
          storePendingEarnings: 120000,
          storeActualEarnings: 784000,
          storeTotalCommission: 904000,
          escrowGrossBalance: 1500000,
          totalGrossSales: 11300000,
          vendorPendingBalance: 1100000,
          vendorAvailableBalance: 2300000,
          vendorProcessingBalance: 0,
          vendorTotalWithdrawn: 6100000,
          pendingWithdrawalsCount: 4,
        },
      };
    }
    const res = await axiosInstance.get<ApiResponse<any>>('/super-admin/payouts/summary');
    return res.data;
  },

  // G8-B: Super Admin Per-Vendor Payout Balances (GET /super-admin/payouts/vendors)
  async getPayoutVendors(params: { search?: string; status?: string; page?: number; limit?: number } = {}): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { vendors } = getInitialAdminMockData();
      return {
        success: true,
        data: {
          vendors: vendors.map((v) => ({
            vendorId: v.id,
            storeName: v.storeName,
            storeSlug: v.storeSlug,
            ownerName: v.ownerName,
            email: v.email,
            phone: v.phone,
            applicationStatus: v.status,
            pendingEarnings: 50000,
            availableEarnings: 120000,
            totalEarnings: 900000,
            totalWithdrawn: 700000,
            processingWithdrawals: 0,
            pendingWithdrawals: 25000,
            orderCount: 84,
            bankAccount: null,
          })),
          pagination: { total: vendors.length, page: params.page || 1, limit: params.limit || 20, totalPages: 1 },
        },
      };
    }
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const res = await axiosInstance.get<ApiResponse<any>>(`/super-admin/payouts/vendors?${query.toString()}`);
    return res.data;
  },

  // G8-C: Super Admin Itemised Earnings Breakdown (GET /super-admin/payouts/breakdown)
  async getPayoutBreakdown(params: { vendorId?: string; orderId?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number } = {}): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      return {
        success: true,
        data: { items: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } },
      };
    }
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const res = await axiosInstance.get<ApiResponse<any>>(`/super-admin/payouts/breakdown?${query.toString()}`);
    return res.data;
  },

  // F20: View Flagged Reviews
  async getViewFlaggedReviews(): Promise<ApiResponse<AdminFlaggedReview[]>> {
    if (USE_MOCK_VENDOR_API) {
      const { reviews } = getInitialAdminMockData();
      return {
        success: true,
        data: reviews.filter((r) => r.isFlagged),
      };
    }
    const res = await axiosInstance.get<ApiResponse<any>>('/admin/vendors/reviews/flagged');
    return res.data;
  },

  // F21: Hide a Review
  async hideReview(reviewId: string): Promise<ApiResponse<{ message: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { reviews } = getInitialAdminMockData();
      const idx = reviews.findIndex((r) => r.id === reviewId);
      if (idx !== -1) {
        reviews[idx].isHidden = true;
        reviews[idx].hiddenBy = 'mock-uuid-123456789';
        saveAdminMockData({ reviews });
        return { success: true, message: 'Review hidden successfully', data: { message: 'Hidden' } };
      }
      throw new Error('Review not found.');
    }
    const res = await axiosInstance.patch<ApiResponse<any>>(`/admin/vendors/reviews/${reviewId}/hide`);
    return res.data;
  },

  // F22: Unhide a Review
  async unhideReview(reviewId: string): Promise<ApiResponse<{ message: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { reviews } = getInitialAdminMockData();
      const idx = reviews.findIndex((r) => r.id === reviewId);
      if (idx !== -1) {
        reviews[idx].isHidden = false;
        reviews[idx].hiddenBy = null;
        saveAdminMockData({ reviews });
        return { success: true, message: 'Review restored successfully', data: { message: 'Unhidden' } };
      }
      throw new Error('Review not found.');
    }
    const res = await axiosInstance.patch<ApiResponse<any>>(`/admin/vendors/reviews/${reviewId}/unhide`);
    return res.data;
  },

  // F23: Permanently Delete a Review
  async deleteReview(reviewId: string): Promise<ApiResponse<{ message: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { reviews } = getInitialAdminMockData();
      const list = reviews.filter((r) => r.id !== reviewId);
      saveAdminMockData({ reviews: list });
      return { success: true, message: 'Review permanently deleted successfully', data: { message: 'Deleted' } };
    }
    const res = await axiosInstance.delete<ApiResponse<any>>(`/admin/vendors/reviews/${reviewId}`);
    return res.data;
  },

  // G1: Platform-Wide Vendor Stats
  async getPlatformStats(): Promise<
    ApiResponse<{
      totalVendors: number;
      vendorsByStatus: Record<string, number>;
      newApplicationsThisMonth: number;
      totalPendingWithdrawals: number;
      platformCommissionThisMonth: number;
      topVendorsByRevenue: any[];
    }>
  > {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, withdrawals } = getInitialAdminMockData();
      const statusCounts: Record<string, number> = {};
      vendors.forEach((v) => {
        statusCounts[v.applicationStatus] = (statusCounts[v.applicationStatus] || 0) + 1;
      });

      const pendingWdCount = withdrawals.filter((w) => w.status === 'pending').length;

      return {
        success: true,
        data: {
          totalVendors: vendors.length,
          vendorsByStatus: statusCounts,
          newApplicationsThisMonth: vendors.filter(
            (v) => new Date(v.createdAt).getMonth() === new Date().getMonth()
          ).length,
          totalPendingWithdrawals: pendingWdCount,
          platformCommissionThisMonth: 0,
          topVendorsByRevenue: [],
        },
      };
    }

    const res = await axiosInstance.get<ApiResponse<any>>('/super-admin/vendors/stats');
    return res.data;
  },

  // G2: Permanently Ban a Vendor
  async banVendor(vendorId: string, reason: string): Promise<ApiResponse<{ message: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, auditLogs } = getInitialAdminMockData();
      const idx = vendors.findIndex((v) => v.id === vendorId);
      if (idx !== -1) {
        vendors[idx].applicationStatus = 'banned';
        vendors[idx].rejectionReason = reason;
        vendors[idx].updatedAt = new Date().toISOString();

        const log: AdminVendorAuditLogEntry = {
          id: `log-${Math.random().toString(36).substring(7)}`,
          vendorId,
          actorId: 'mock-uuid-123456789',
          actorRole: 'SUPER_ADMIN',
          action: 'BAN_VENDOR',
          notes: `Permanently banned vendor. Reason: ${reason}`,
          metadata: { reason },
          createdAt: new Date().toISOString(),
        };
        auditLogs.unshift(log);

        saveAdminMockData({ vendors, auditLogs });
        return { success: true, message: 'Vendor banned for life successfully', data: { message: 'Banned' } };
      }
      throw new Error('Vendor not found.');
    }

    const res = await axiosInstance.post<ApiResponse<any>>(`/super-admin/vendors/${vendorId}/ban`, {
      reason,
    });
    return res.data;
  },

  // G2b: Unban a Banned Vendor
  async unbanVendor(vendorId: string, reason: string): Promise<ApiResponse<{ message: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, auditLogs } = getInitialAdminMockData();
      const idx = vendors.findIndex((v) => v.id === vendorId);
      if (idx !== -1) {
        vendors[idx].applicationStatus = 'submitted';
        vendors[idx].updatedAt = new Date().toISOString();

        const log: AdminVendorAuditLogEntry = {
          id: `log-${Math.random().toString(36).substring(7)}`,
          vendorId,
          actorId: 'mock-uuid-123456789',
          actorRole: 'SUPER_ADMIN',
          action: 'UNBAN_VENDOR',
          notes: `Unbanned vendor. Reason: ${reason}`,
          metadata: { reason },
          createdAt: new Date().toISOString(),
        };
        auditLogs.unshift(log);

        saveAdminMockData({ vendors, auditLogs });
        return { success: true, message: 'Vendor unbanned successfully', data: { message: 'Unbanned' } };
      }
      throw new Error('Vendor not found.');
    }

    const res = await axiosInstance.post<ApiResponse<any>>(`/super-admin/vendors/${vendorId}/unban`, {
      reason,
    });
    return res.data;
  },

  // G3: Override Any Admin Decision
  async overrideDecision(
    vendorId: string,
    data: { newDecision: 'approved' | 'rejected'; reason: string }
  ): Promise<ApiResponse<{ message: string; status: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, auditLogs } = getInitialAdminMockData();
      const idx = vendors.findIndex((v) => v.id === vendorId);
      if (idx !== -1) {
        vendors[idx].applicationStatus = data.newDecision;
        vendors[idx].rejectionReason = data.newDecision === 'rejected' ? data.reason : null;
        vendors[idx].approvedAt = data.newDecision === 'approved' ? new Date().toISOString() : null;
        vendors[idx].updatedAt = new Date().toISOString();

        const log: AdminVendorAuditLogEntry = {
          id: `log-${Math.random().toString(36).substring(7)}`,
          vendorId,
          actorId: 'mock-uuid-123456789',
          actorRole: 'SUPER_ADMIN',
          action: 'OVERRIDE_DECISION',
          notes: `Override decision to ${data.newDecision}. Reason: ${data.reason}`,
          metadata: { decision: data.newDecision, reason: data.reason },
          createdAt: new Date().toISOString(),
        };
        auditLogs.unshift(log);

        saveAdminMockData({ vendors, auditLogs });
        return {
          success: true,
          message: 'Decision overridden successfully',
          data: { message: 'Decision Overridden', status: data.newDecision },
        };
      }
      throw new Error('Vendor not found.');
    }

    const res = await axiosInstance.post<ApiResponse<any>>(
      `/super-admin/vendors/${vendorId}/override-decision`,
      data
    );
    return res.data;
  },

  // G4: Bulk Approve Multiple Vendors
  async bulkApprove(vendorIds: string[]): Promise<
    ApiResponse<{ approved: number; skipped: number; skippedDetails: any[] }>
  > {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, auditLogs } = getInitialAdminMockData();
      let approvedCount = 0;
      let skippedCount = 0;
      const skippedDetails: any[] = [];

      vendorIds.forEach((id) => {
        const idx = vendors.findIndex((v) => v.id === id);
        if (idx !== -1) {
          if (
            vendors[idx].applicationStatus === 'submitted' ||
            vendors[idx].applicationStatus === 'in_review' ||
            vendors[idx].applicationStatus === 'requires_resubmission'
          ) {
            vendors[idx].applicationStatus = 'approved';
            vendors[idx].approvedAt = new Date().toISOString();
            vendors[idx].updatedAt = new Date().toISOString();
            approvedCount++;

            const log: AdminVendorAuditLogEntry = {
              id: `log-${Math.random().toString(36).substring(7)}`,
              vendorId: id,
              actorId: 'mock-uuid-123456789',
              actorRole: 'SUPER_ADMIN',
              action: 'BULK_APPROVE_VENDOR',
              notes: 'Approved via bulk approve command.',
              metadata: {},
              createdAt: new Date().toISOString(),
            };
            auditLogs.unshift(log);
          } else {
            skippedCount++;
            skippedDetails.push({
              vendorId: id,
              reason: `Vendor is in ineligible status: ${vendors[idx].applicationStatus}`,
            });
          }
        } else {
          skippedCount++;
          skippedDetails.push({ vendorId: id, reason: 'Vendor not found' });
        }
      });

      saveAdminMockData({ vendors, auditLogs });
      return {
        success: true,
        message: 'Bulk approval processing complete',
        data: { approved: approvedCount, skipped: skippedCount, skippedDetails },
      };
    }

    const res = await axiosInstance.post<ApiResponse<any>>(`/super-admin/vendors/bulk-approve`, {
      vendorIds,
    });
    return res.data;
  },

  // G4b: Bulk Reject Multiple Vendors
  async bulkReject(
    vendorIds: string[],
    reason: string
  ): Promise<ApiResponse<{ rejected: number; skipped: number; skippedDetails: any[] }>> {
    if (USE_MOCK_VENDOR_API) {
      const { vendors, auditLogs } = getInitialAdminMockData();
      let rejectedCount = 0;
      let skippedCount = 0;
      const skippedDetails: any[] = [];

      vendorIds.forEach((id) => {
        const idx = vendors.findIndex((v) => v.id === id);
        if (idx !== -1) {
          if (
            vendors[idx].applicationStatus === 'submitted' ||
            vendors[idx].applicationStatus === 'in_review' ||
            vendors[idx].applicationStatus === 'requires_resubmission'
          ) {
            vendors[idx].applicationStatus = 'rejected';
            vendors[idx].rejectionReason = reason;
            vendors[idx].updatedAt = new Date().toISOString();
            rejectedCount++;

            const log: AdminVendorAuditLogEntry = {
              id: `log-${Math.random().toString(36).substring(7)}`,
              vendorId: id,
              actorId: 'mock-uuid-123456789',
              actorRole: 'SUPER_ADMIN',
              action: 'BULK_REJECT_VENDOR',
              notes: `Rejected via bulk reject command. Reason: ${reason}`,
              metadata: { reason },
              createdAt: new Date().toISOString(),
            };
            auditLogs.unshift(log);
          } else {
            skippedCount++;
            skippedDetails.push({
              vendorId: id,
              reason: `Vendor is in ineligible status: ${vendors[idx].applicationStatus}`,
            });
          }
        } else {
          skippedCount++;
          skippedDetails.push({ vendorId: id, reason: 'Vendor not found' });
        }
      });

      saveAdminMockData({ vendors, auditLogs });
      return {
        success: true,
        message: 'Bulk rejection processing complete',
        data: { rejected: rejectedCount, skipped: skippedCount, skippedDetails },
      };
    }

    const res = await axiosInstance.post<ApiResponse<any>>(`/super-admin/vendors/bulk-reject`, {
      vendorIds,
      reason,
    });
    return res.data;
  },

  // G5: View All Commission Configurations
  async getCommissionConfigs(): Promise<ApiResponse<AdminCommissionConfig[]>> {
    if (USE_MOCK_VENDOR_API) {
      const { commissions } = getInitialAdminMockData();
      return { success: true, data: commissions };
    }
    const res = await axiosInstance.get<ApiResponse<any>>('/super-admin/vendors/commission');
    return res.data;
  },

  // G6: Create a Commission Rate
  async createCommissionConfig(data: {
    commissionRate: number;
    gatewayFeeRate: number;
    categoryId?: string | null;
    vendorId?: string | null;
  }): Promise<ApiResponse<AdminCommissionConfig>> {
    if (USE_MOCK_VENDOR_API) {
      const { commissions } = getInitialAdminMockData();
      // Ensure only one global config is allowed
      if (!data.categoryId && !data.vendorId) {
        const hasGlobal = commissions.some((c) => !c.categoryId && !c.vendorId);
        if (hasGlobal) throw new Error('Global commission configuration already exists.');
      }

      const newConfig: AdminCommissionConfig = {
        id: `comm-${Math.random().toString(36).substring(7)}`,
        categoryId: data.categoryId || null,
        vendorId: data.vendorId || null,
        commissionRate: data.commissionRate,
        gatewayFeeRate: data.gatewayFeeRate,
        createdBy: 'mock-uuid-123456789',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      commissions.push(newConfig);
      saveAdminMockData({ commissions });
      return { success: true, message: 'Commission configuration created', data: newConfig };
    }

    const res = await axiosInstance.post<ApiResponse<any>>('/super-admin/vendors/commission', data);
    return res.data;
  },

  // G7: Update a Commission Rate
  async updateCommissionConfig(
    configId: string,
    data: { commissionRate?: number; gatewayFeeRate?: number }
  ): Promise<ApiResponse<AdminCommissionConfig>> {
    if (USE_MOCK_VENDOR_API) {
      const { commissions } = getInitialAdminMockData();
      const idx = commissions.findIndex((c) => c.id === configId);
      if (idx !== -1) {
        if (data.commissionRate !== undefined) commissions[idx].commissionRate = data.commissionRate;
        if (data.gatewayFeeRate !== undefined) commissions[idx].gatewayFeeRate = data.gatewayFeeRate;
        commissions[idx].updatedAt = new Date().toISOString();

        saveAdminMockData({ commissions });
        return { success: true, message: 'Commission config updated', data: commissions[idx] };
      }
      throw new Error('Config not found.');
    }

    const res = await axiosInstance.patch<ApiResponse<any>>(
      `/super-admin/vendors/commission/${configId}`,
      data
    );
    return res.data;
  },

  // G8: Delete a Commission Rate
  async deleteCommissionConfig(configId: string): Promise<ApiResponse<{ message: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { commissions } = getInitialAdminMockData();
      const idx = commissions.findIndex((c) => c.id === configId);
      if (idx !== -1) {
        // Sole remaining global config cannot be deleted
        const config = commissions[idx];
        if (!config.categoryId && !config.vendorId) {
          const globals = commissions.filter((c) => !c.categoryId && !c.vendorId);
          if (globals.length <= 1) {
            throw new Error('Cannot delete the sole remaining global commission config.');
          }
        }

        const filtered = commissions.filter((c) => c.id !== configId);
        saveAdminMockData({ commissions: filtered });
        return { success: true, message: 'Commission config deleted successfully', data: { message: 'Deleted' } };
      }
      throw new Error('Config not found.');
    }

    const res = await axiosInstance.delete<ApiResponse<any>>(
      `/super-admin/vendors/commission/${configId}`
    );
    return res.data;
  },

  // G9: Force-Override a Withdrawal
  async overrideWithdrawal(
    withdrawalId: string,
    data: { action: 'complete' | 'fail'; reason: string }
  ): Promise<ApiResponse<{ message: string; status: 'completed' | 'failed' }>> {
    if (USE_MOCK_VENDOR_API) {
      const { withdrawals } = getInitialAdminMockData();
      const idx = withdrawals.findIndex((w) => w.id === withdrawalId);
      if (idx !== -1) {
        withdrawals[idx].status = data.action === 'complete' ? 'completed' : 'failed';
        withdrawals[idx].failureReason = data.reason;
        withdrawals[idx].processedAt = new Date().toISOString();

        saveAdminMockData({ withdrawals });
        return {
          success: true,
          message: 'Withdrawal overridden successfully',
          data: { message: 'Overridden', status: withdrawals[idx].status },
        };
      }
      throw new Error('Withdrawal request not found.');
    }

    const res = await axiosInstance.patch<ApiResponse<any>>(
      `/super-admin/vendors/withdrawals/${withdrawalId}/override`,
      data
    );
    return res.data;
  },

  // G10: View Full Platform Audit Log
  async getPlatformAuditLog(
    params: {
      action?: string;
      actorId?: string;
      vendorId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<ApiResponse<{ entries: AdminVendorAuditLogEntry[]; pagination: any; note?: string }>> {
    if (USE_MOCK_VENDOR_API) {
      const { auditLogs } = getInitialAdminMockData();
      let filtered = [...auditLogs];

      if (params.action) filtered = filtered.filter((l) => l.action === params.action);
      if (params.actorId) filtered = filtered.filter((l) => l.actorId === params.actorId);
      if (params.vendorId) filtered = filtered.filter((l) => l.vendorId === params.vendorId);

      const paginated = paginateMockArray(filtered, params.page || 1, params.limit || 50);

      const responseData: any = {
        entries: paginated.items,
        pagination: paginated.pagination,
      };

      if (!params.vendorId) {
        responseData.note =
          'Audit log scoped to specific vendor is recommended. Viewing all platform entries.';
      }

      return {
        success: true,
        data: responseData,
      };
    }

    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });

    const res = await axiosInstance.get<ApiResponse<any>>(
      `/super-admin/vendors/audit-log?${query.toString()}`
    );
    return res.data;
  },
};
