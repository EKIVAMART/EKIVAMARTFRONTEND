import axiosInstance from './axios';
import { ApiResponse } from './api';

// Set this to true to run fully client-side (mocked endpoints)
// Set to false to hit the actual backend APIs
export const USE_MOCK_VENDOR_API = true;

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
  status: 'pending' | 'in_review' | 'verified' | 'rejected' | 'requires_resubmission';
  rejectionReason: string | null;
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

export interface VendorApplicationStatus {
  applicationReference: string;
  status: 'draft' | 'submitted' | 'in_review' | 'requires_resubmission' | 'approved' | 'rejected' | 'suspended' | 'banned';
  vendorType: 'individual' | 'registered_business' | 'brand' | 'reseller' | 'dropshipper' | '';
  storeName: string;
  storeSlug: string;
  submittedAt: string | null;
  lastUpdatedAt: string;
  resubmissionNote: string | null;
  rejectionReason: string | null;
  documents: {
    documentType: string;
    status: 'pending' | 'in_review' | 'verified' | 'rejected' | 'requires_resubmission';
    rejectionReason: string | null;
    uploadedAt: string;
    id?: string;
    originalFilename?: string;
    fileSizeBytes?: number;
  }[];
  personalInfoComplete: boolean;
  businessInfoComplete: boolean;
  bankAccountsCount: number;
  // Steps check for routing
  storeInfoComplete?: boolean;
  documentsInfoComplete?: boolean;
}

export interface VendorApplicationDraft {
  storeName: string;
  vendorType: 'individual' | 'registered_business' | 'brand' | 'reseller' | 'dropshipper' | '';
  storePhone: string;
  storeEmail: string;
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    homeAddress: HomeAddress;
    bvn: string;
    nin?: string;
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
}

// Client-side local storage mock database to support full end-to-end user flow verification
const STORAGE_KEYS = {
  STATUS: 'faflora_vendor_status',
  DRAFT: 'faflora_vendor_draft',
};

const getInitialMockData = (): { status: VendorApplicationStatus; draft: VendorApplicationDraft } => {
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
        personalInfoComplete: false,
        businessInfoComplete: false,
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
    personalInfoComplete: false,
    businessInfoComplete: false,
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
  };

  return {
    status: savedStatus ? JSON.parse(savedStatus) : defaultStatus,
    draft: savedDraft ? JSON.parse(savedDraft) : defaultDraft,
  };
};

export const saveMockData = (status: VendorApplicationStatus, draft: VendorApplicationDraft) => {
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

export const vendorApi = {
  // A13: Check Application Status
  async getApplicationStatus(): Promise<ApiResponse<VendorApplicationStatus>> {
    if (USE_MOCK_VENDOR_API) {
      const { status } = getInitialMockData();
      return { success: true, data: status };
    }
    const response = await axiosInstance.get<ApiResponse<VendorApplicationStatus>>('/vendor/application/status');
    return response.data;
  },

  // GET Draft endpoint (fetches all details entered per each step)
  async getApplicationDraft(): Promise<ApiResponse<VendorApplicationDraft>> {
    if (USE_MOCK_VENDOR_API) {
      const { draft } = getInitialMockData();
      return { success: true, data: draft };
    }
    const response = await axiosInstance.get<ApiResponse<VendorApplicationDraft>>('/vendor/application/draft');
    return response.data;
  },

  // A1: Start Application
  async startApplication(data: {
    storeName: string;
    vendorType: 'individual' | 'registered_business' | 'brand' | 'reseller' | 'dropshipper';
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
    const response = await axiosInstance.post<ApiResponse<any>>('/vendor/application/start', data);
    return response.data;
  },

  // A2: Save Personal Information - FIXED: bvn is now required (not optional)
  async savePersonalInfo(data: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    homeAddress: HomeAddress;
    bvn: string;  // Changed from bvn?: string to bvn: string
    nin?: string;
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
      return { success: true, message: 'Personal information saved successfully', data: null };
    }
    const response = await axiosInstance.patch<ApiResponse<any>>('/vendor/application/personal-info', data);
    return response.data;
  },

  // A3: Save Business Information
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
      return { success: true, message: 'Business information saved successfully', data: null };
    }
    const response = await axiosInstance.patch<ApiResponse<any>>('/vendor/application/business-info', data);
    return response.data;
  },

  // A4: Save Store Information
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
      return { success: true, message: 'Store information saved successfully', data: null };
    }
    const response = await axiosInstance.patch<ApiResponse<any>>('/vendor/application/store-info', data);
    return response.data;
  },

  // A5: Get Document Upload URL
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
          uploadUrl: 'https://api.cloudinary.com/v1_1/faflora/auto/upload?signature=mock',
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
    const response = await axiosInstance.post<ApiResponse<any>>('/vendor/application/documents/upload-url', data);
    return response.data;
  },

  // A6: Confirm Document Upload
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
        createdAt: new Date().toISOString(),
      };

      const newDocumentsList = draft.documents.filter(d => d.documentType !== data.documentType);
      newDocumentsList.push(newDoc);

      const newDraft: VendorApplicationDraft = {
        ...draft,
        documents: newDocumentsList,
      };

      const newStatusDocuments = status.documents.filter(d => d.documentType !== data.documentType);
      newStatusDocuments.push({
        documentType: data.documentType,
        status: 'pending',
        rejectionReason: null,
        uploadedAt: new Date().toISOString(),
        id: newDoc.id,
        originalFilename: data.originalFilename,
        fileSizeBytes: data.fileSizeBytes,
      });

      // Simple doc check: we determine completeness if all slots are filled.
      // Individual: 3 slots, Business: 5 slots, Brand: 6 slots
      const reqCount = status.vendorType === 'brand' ? 6 : (status.vendorType === 'registered_business' ? 5 : 3);
      const isDocsComplete = newStatusDocuments.length >= reqCount;

      const newStatus: VendorApplicationStatus = {
        ...status,
        documents: newStatusDocuments,
        documentsInfoComplete: isDocsComplete,
        lastUpdatedAt: new Date().toISOString(),
      };

      saveMockData(newStatus, newDraft);

      return {
        success: true,
        message: 'Document upload confirmed successfully',
        data: newDoc,
      };
    }
    const response = await axiosInstance.post<ApiResponse<VendorDocument>>('/vendor/application/documents/confirm', data);
    return response.data;
  },

  // A7: Delete a Document
  async deleteDocument(documentId: string): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      const newDocumentsList = draft.documents.filter(d => d.id !== documentId);
      const newStatusDocuments = status.documents.filter(d => d.id !== documentId);

      const newDraft: VendorApplicationDraft = {
        ...draft,
        documents: newDocumentsList,
      };

      const newStatus: VendorApplicationStatus = {
        ...status,
        documents: newStatusDocuments,
        documentsInfoComplete: false,
        lastUpdatedAt: new Date().toISOString(),
      };

      saveMockData(newStatus, newDraft);
      return { success: true, message: 'Document deleted successfully', data: null };
    }
    const response = await axiosInstance.delete<ApiResponse<any>>(`/vendor/application/documents/${documentId}`);
    return response.data;
  },

  // A8: Add Bank Account
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
    const response = await axiosInstance.post<ApiResponse<VendorBankAccount>>('/vendor/application/bank-accounts', data);
    return response.data;
  },

  // A9: Get All Bank Accounts
  async getBankAccounts(): Promise<ApiResponse<VendorBankAccount[]>> {
    if (USE_MOCK_VENDOR_API) {
      const { draft } = getInitialMockData();
      return { success: true, data: draft.bankAccounts };
    }
    const response = await axiosInstance.get<ApiResponse<VendorBankAccount[]>>('/vendor/application/bank-accounts');
    return response.data;
  },

  // A10: Delete a Bank Account
  async deleteBankAccount(accountId: string): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      const newAccounts = draft.bankAccounts.filter(a => a.id !== accountId);
      // Re-assign primary if necessary
      if (newAccounts.length > 0 && !newAccounts.some(a => a.isPrimary)) {
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
      return { success: true, message: 'Bank account removed successfully', data: null };
    }
    const response = await axiosInstance.delete<ApiResponse<any>>(`/vendor/application/bank-accounts/${accountId}`);
    return response.data;
  },

  // A11: Set Primary Bank Account
  async setPrimaryBankAccount(accountId: string): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      const newAccounts = draft.bankAccounts.map(a => ({
        ...a,
        isPrimary: a.id === accountId,
      }));

      const newDraft: VendorApplicationDraft = {
        ...draft,
        bankAccounts: newAccounts,
      };

      saveMockData(status, newDraft);
      return { success: true, message: 'Primary bank account updated successfully', data: null };
    }
    const response = await axiosInstance.patch<ApiResponse<any>>(`/vendor/application/bank-accounts/${accountId}/set-primary`);
    return response.data;
  },

  // A12: Submit the Application
  async submitApplication(): Promise<ApiResponse<any>> {
    if (USE_MOCK_VENDOR_API) {
      const { status, draft } = getInitialMockData();

      // Check validation again
      if (draft.storeName.length < 3) {
        throw new Error('Please complete your store information (store name must be at least 3 characters)');
      }
      if (!draft.personalInfo || !draft.personalInfo.fullName) {
        throw new Error('Please complete your personal information');
      }
      if ((status.vendorType === 'registered_business' || status.vendorType === 'brand') && (!draft.businessInfo || !draft.businessInfo.businessName)) {
        throw new Error('Please complete your business registration information');
      }
      if (!draft.storeInfo || draft.storeInfo.storeDescription.length < 100) {
        throw new Error('Please complete your store information (description must be at least 100 characters)');
      }
      const reqCount = status.vendorType === 'brand' ? 6 : (status.vendorType === 'registered_business' ? 5 : 3);
      if (draft.documents.length < reqCount) {
        throw new Error('Missing required documents');
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
    const response = await axiosInstance.post<ApiResponse<any>>('/vendor/application/submit');
    return response.data;
  },

  // A14: Resubmit After Corrections
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

      // Set all documents to pending
      const updatedDocs = draft.documents.map(d => ({
        ...d,
        status: 'pending' as const,
      }));

      const updatedStatusDocs = status.documents.map(d => ({
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
        message: 'Application resubmitted for review. Our team will be in touch soon.',
        data: null,
      };
    }
    const response = await axiosInstance.post<ApiResponse<any>>('/vendor/application/resubmit');
    return response.data;
  },
};