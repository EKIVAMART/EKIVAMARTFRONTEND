'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/lib/api';
import {
  Store,
  User,
  FileText,
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  Building,
  Briefcase,
  X,
  ShieldAlert,
  Smartphone,
  Lock,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  Clock,
  Eye,
  Download,
  Ban,
  Tag,
} from '@/components/ui/platform-icons';
import { FaInstagram, FaFacebookF } from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { useAppSelector } from '@/lib/hooks';
import {
  vendorApi,
  VendorApplicationStatus,
  VendorApplicationDraft,
  VendorDocument,
  VendorBankAccount,
  HomeAddress,
  BusinessAddress,
  SocialLinks,
  Category,
  resetMockData,
  IS_DEV_MODE,
  USE_MOCK_VENDOR_API,
} from '@/lib/api-vendor';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';

import 'react-phone-number-input/style.css';

// Constants
const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT - Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

const MAX_BANK_ACCOUNTS = 2;
const MAX_CATEGORIES = 20;

// Use unique identifiers for banks - combine name and code
const NIGERIAN_BANKS = [
  { name: 'Guaranty Trust Bank', code: '058', id: 'gtb-058' },
  { name: 'Access Bank', code: '044', id: 'access-044' },
  { name: 'Zenith Bank', code: '057', id: 'zenith-057' },
  { name: 'United Bank for Africa', code: '033', id: 'uba-033' },
  { name: 'First Bank of Nigeria', code: '011', id: 'firstbank-011' },
  { name: 'Union Bank of Nigeria', code: '032', id: 'union-032' },
  { name: 'Sterling Bank', code: '050', id: 'sterling-050' },
  { name: 'Wema Bank', code: '035', id: 'wema-035' },
  { name: 'Fidelity Bank', code: '070', id: 'fidelity-070' },
  { name: 'Polaris Bank', code: '076', id: 'polaris-076' },
  { name: 'Keystone Bank', code: '082', id: 'keystone-082' },
  { name: 'Stanbic IBTC Bank', code: '219', id: 'stanbic-219' },
  { name: 'Ecobank Nigeria', code: '050', id: 'ecobank-050' },
  { name: 'Unity Bank', code: '215', id: 'unity-215' },
  { name: 'First City Monument Bank', code: '214', id: 'fcmb-214' },
  { name: 'Heritage Bank', code: '030', id: 'heritage-030' },
  { name: 'Providus Bank', code: '101', id: 'providus-101' },
  { name: 'Taj Bank', code: '302', id: 'taj-302' },
  { name: 'Jaiz Bank', code: '301', id: 'jaiz-301' },
  { name: 'Globus Bank', code: '103', id: 'globus-103' },
  { name: 'Titan Trust Bank', code: '102', id: 'titan-102' },
  { name: 'PremiumTrust Bank', code: '105', id: 'premiumtrust-105' },
];

const VENDOR_TYPES = [
  {
    value: 'individual',
    label: 'Individual Seller',
    desc: 'A single person selling from home',
  },
  {
    value: 'registered_business',
    label: 'Registered Business',
    desc: 'A formally registered corporate entity in Nigeria',
  },
  {
    value: 'brand',
    label: 'Brand / Manufacturer',
    desc: 'An official original brand owner or manufacturer',
  },
  {
    value: 'reseller',
    label: 'Authorized Reseller',
    desc: 'An authorized vendor reselling third-party branded products',
  },
  {
    value: 'dropshipper',
    label: 'Dropshipper',
    desc: 'Sells directly to buyers without maintaining physical inventory',
  },
];

const BUSINESS_TYPES = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'private_limited', label: 'Private Limited (LTD)' },
  { value: 'public_limited', label: 'Public Limited (PLC)' },
];

const DOCUMENT_DESCRIPTIONS: Record<string, { label: string; desc: string }> = {
  government_id: {
    label: 'Government ID Card',
    desc: 'National ID card (NIN Slip), Voter Card, International Passport, or Drivers License.',
  },
  id_selfie: {
    label: 'Selfie holding ID Card',
    desc: 'Clear portrait photo of yourself holding the ID submitted above next to your face.',
  },
  cac_certificate: {
    label: 'CAC Certificate',
    desc: 'Official CAC corporate registration certificate (Form CAC 1.1 / CAC 2).',
  },
  tin_certificate: {
    label: 'TIN Certificate',
    desc: 'FIRS Tax Identification Number registration certificate or tax receipt.',
  },
  brand_authorization: {
    label: 'Brand Authorization Letter',
    desc: 'Official trademark ownership certificate or authorization letter from the brand.',
  },
};

// Document status helpers
const getDocumentStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'in_review':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'verified':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'rejected':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'requires_resubmission':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

const getDocumentStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending Review';
    case 'in_review':
      return 'In Review';
    case 'verified':
      return 'Verified ✓';
    case 'rejected':
      return 'Rejected ✗';
    case 'requires_resubmission':
      return 'Resubmit Required';
    default:
      return status;
  }
};

const getDocumentStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock size={14} className="text-yellow-500" />;
    case 'in_review':
      return <Clock size={14} className="text-blue-500" />;
    case 'verified':
      return <Check size={14} className="text-green-500" />;
    case 'rejected':
      return <X size={14} className="text-red-500" />;
    case 'requires_resubmission':
      return <AlertCircle size={14} className="text-orange-500" />;
    default:
      return null;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

const normalizeDocument = (doc: any): VendorDocument => {
  return {
    id: doc.id || doc.cloudinaryPublicId || Math.random().toString(36).substring(7),
    documentType: doc.documentType,
    documentUrl: doc.documentUrl || doc.fileUrl || doc.url || '',
    originalFilename: doc.originalFilename || doc.fileName || doc.filename || 'document',
    fileSizeBytes: doc.fileSizeBytes || doc.fileSize || 0,
    mimeType: doc.mimeType || 'application/pdf',
    status: (doc.status || doc.verificationStatus || 'pending').toLowerCase() as any,
    rejectionReason: doc.rejectionReason || null,
    uploadedAt: doc.uploadedAt || doc.createdAt || new Date().toISOString(),
    createdAt: doc.createdAt || doc.uploadedAt || new Date().toISOString(),
  };
};

export default function VendorApplyPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [highestStepAllowed, setHighestStepAllowed] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const [baselineDraft, setBaselineDraft] =
    useState<VendorApplicationDraft | null>(null);
  const [appStatus, setAppStatus] = useState<VendorApplicationStatus | null>(
    null
  );

  // Form states per step
  // Step 1: Store Basics
  const [storeName, setStoreName] = useState('');
  const [vendorType, setVendorType] = useState<
    | 'individual'
    | 'registered_business'
    | 'brand'
    | 'reseller'
    | 'dropshipper'
    | ''
  >('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeNameStatus, setStoreNameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const storeNameTimeout = useRef<NodeJS.Timeout | null>(null);

  // Step 2: Selling Categories
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Step 3: Personal Information
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [homeStreet, setHomeStreet] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [homeState, setHomeState] = useState('');
  const [homeLga, setHomeLga] = useState('');
  const [nin, setNin] = useState('');
  const [ninProvided, setNinProvided] = useState(false);
  const [showNinModal, setShowNinModal] = useState(false);

  // Step 4: Business Information
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [dateOfIncorporation, setDateOfIncorporation] = useState('');

  // Step 5: Store Details
  const [storeDescription, setStoreDescription] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [busStreet, setBusStreet] = useState('');
  const [busCity, setBusCity] = useState('');
  const [busState, setBusState] = useState('');
  const [busLga, setBusLga] = useState('');
  const [busPostal, setBusPostal] = useState('');
  const [linkInstagram, setLinkInstagram] = useState('');
  const [linkFacebook, setLinkFacebook] = useState('');
  const [linkTwitter, setLinkTwitter] = useState('');
  const [linkTiktok, setLinkTiktok] = useState('');

  // Step 6: Documents
  const [documentsList, setDocumentsList] = useState<VendorDocument[]>([]);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<VendorDocument | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Step 7: Bank Account
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountType, setAccountType] = useState<'savings' | 'current'>(
    'savings'
  );
  const [bankSearchText, setBankSearchText] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankAccountsList, setBankAccountsList] = useState<VendorBankAccount[]>(
    []
  );

  // Step 8: Submit
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);

  const [showConfirmTypeModal, setShowConfirmTypeModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [showStatusBanner, setShowStatusBanner] = useState(false);

  // Determine if business step should be shown - based on current vendorType state
  const shouldShowBusinessStep =
    vendorType === 'registered_business' || vendorType === 'brand';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please log in to apply for vendor account');
      router.push('/become-a-vendor');
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        // Fetch categories first
        try {
          const categoriesRes = await vendorApi.getAllCategories();
          if (categoriesRes.success && categoriesRes.data) {
            setCategoriesList(categoriesRes.data);
          }
        } catch (err) {
          console.error('Failed to fetch categories:', err);
        }

        // Fetch both status and draft in parallel
        const [statusRes, draftRes] = await Promise.all([
          vendorApi.getApplicationStatus(),
          vendorApi.getApplicationDraft(),
        ]);

        // Use fresh local variables — do NOT rely on React state here since setAppStatus
        // is async and appStatus state won't be updated until next render.
        let freshApp: VendorApplicationStatus | null = null;

        // Handle status
        if (statusRes.success && statusRes.data) {
          freshApp = statusRes.data;
          setAppStatus(freshApp);

          if (
            freshApp.status !== 'draft' &&
            freshApp.status !== 'requires_resubmission'
          ) {
            setShowStatusBanner(true);
            if (freshApp.status === 'approved') {
              toast.success(
                'Congratulations! Your vendor application is approved! 🎉'
              );
            } else if (freshApp.status === 'rejected') {
              toast.error(
                'Your application was rejected. Please review the reason.'
              );
            }
          }
        }

        // Handle draft — support both flat format (mock) and step-keyed format (real API)
        if (draftRes.success && draftRes.data) {
          const draft = draftRes.data;
          setBaselineDraft(draft);

          // Step 1 data — prefer step1 keyed shape, fall back to flat fields
          const step1 = (draft as any).step1;
          const draftStoreName = step1?.storeName ?? draft.storeName ?? '';
          const draftVendorType = step1?.vendorType ?? draft.vendorType ?? '';
          const draftStorePhone = step1?.storePhone ?? draft.storePhone ?? '';
          const draftStoreEmail = step1?.storeEmail ?? draft.storeEmail ?? '';

          setStoreName(draftStoreName);
          setVendorType(draftVendorType as any);

          let profileEmail = user?.email || '';
          let profilePhone = user?.phoneNumber || '';
          try {
            const profileRes = await authApi.getProfile();
            if (profileRes && profileRes.success && profileRes.data) {
              profileEmail = profileRes.data.email || profileEmail;
              profilePhone = profileRes.data.phoneNumber || profilePhone;
            }
          } catch (profileErr) {
            console.error(
              'Failed to get profile for prepopulation:',
              profileErr
            );
          }
          setStoreEmail(draftStoreEmail || profileEmail);
          setStorePhone(draftStorePhone || profilePhone);

          // Step 2 — selling categories (supports categoryIds array or category objects)
          const step2 = (draft as any).step2;
          const savedCategoryIds: string[] =
            step2?.categoryIds ??
            (step2?.categories?.map((c: any) => c.id || c.categoryId) ??
              draft.sellingCategories?.map((c: any) => c.id) ?? []);
          if (savedCategoryIds.length > 0) {
            setSelectedCategories(savedCategoryIds);
          }

          // Step 3 — personal info (support both step3 keyed and flat personalInfo)
          const step3 = (draft as any).step3;
          const personalInfo = step3 ?? draft.personalInfo;
          if (personalInfo) {
            setFullName(personalInfo.fullName || '');
            setDateOfBirth(personalInfo.dateOfBirth || '');
            setGender(personalInfo.gender || '');
            setHomeStreet(personalInfo.homeAddress?.street || '');
            setHomeCity(personalInfo.homeAddress?.city || '');
            setHomeState(personalInfo.homeAddress?.state || '');
            setHomeLga(personalInfo.homeAddress?.lga || '');
            const hasNin = !!(personalInfo.ninProvided ?? personalInfo.nin);
            setNinProvided(hasNin);
            setNin('');
          }

          // Step 4 — business info
          const step4 = (draft as any).step4;
          const businessInfo =
            step4?.businessName !== undefined && step4?.businessName !== null
              ? step4
              : draft.businessInfo;
          if (businessInfo) {
            setBusinessName(businessInfo.businessName || '');
            setBusinessType(businessInfo.businessType || '');
            setCacNumber(businessInfo.cacNumber || '');
            setTinNumber(businessInfo.tinNumber || '');
            setVatNumber(businessInfo.vatNumber || '');
            setDateOfIncorporation(businessInfo.dateOfIncorporation || '');
          }

          // Step 5 — store info
          const step5 = (draft as any).step5;
          const storeInfo =
            step5?.storeDescription !== undefined ? step5 : draft.storeInfo;
          if (
            storeInfo &&
            (storeInfo.storeDescription || storeInfo.yearsInBusiness)
          ) {
            setStoreDescription(storeInfo.storeDescription || '');
            setYearsInBusiness(storeInfo.yearsInBusiness || '');
            setBusStreet(storeInfo.businessAddress?.street || '');
            setBusCity(storeInfo.businessAddress?.city || '');
            setBusState(storeInfo.businessAddress?.state || '');
            setBusLga(storeInfo.businessAddress?.lga || '');
            setBusPostal(storeInfo.businessAddress?.postalCode || '');
            setLinkInstagram(storeInfo.socialLinks?.instagram || '');
            setLinkFacebook(storeInfo.socialLinks?.facebook || '');
            setLinkTwitter(storeInfo.socialLinks?.twitter || '');
            setLinkTiktok(storeInfo.socialLinks?.tiktok || '');
          }

          // Step 6 — documents
          const step6 = (draft as any).step6;
          const rawDocs: any[] = step6?.documents ?? draft.documents ?? [];
          const normalizedDocs = rawDocs.map(normalizeDocument);
          setDocumentsList(normalizedDocs);

          // Step 7 — bank accounts
          const step7 = (draft as any).step7;
          const rawBanks: any[] = step7?.bankAccounts ?? draft.bankAccounts ?? [];
          const normalizedBanks: VendorBankAccount[] = rawBanks.map((b: any) => ({
            id: b.id || Math.random().toString(36).substring(7),
            accountName: b.accountName || '',
            accountNumber: b.accountNumber || '',
            bankName: b.bankName || '',
            bankCode: b.bankCode || '',
            accountType: (b.accountType || 'SAVINGS').toLowerCase() as any,
            isPrimary: !!b.isPrimary,
            isVerified: !!b.isVerified,
          }));
          setBankAccountsList(normalizedBanks);

          const completed = new Set<number>();
          if (draftStoreName && draftVendorType) completed.add(1);
          if (freshApp?.sellingCategoriesComplete) completed.add(2);
          if (freshApp?.personalInfoComplete) completed.add(3);
          // businessInfoComplete: if vendorType doesn't require it, mark it done
          const vType = draftVendorType;
          const requiresBusiness =
            vType === 'registered_business' || vType === 'brand';
          if (freshApp?.businessInfoComplete || !requiresBusiness)
            completed.add(4);
          if (freshApp?.storeInfoComplete) completed.add(5);
          if (
            freshApp?.documentsComplete ||
            (freshApp as any)?.documentsInfoComplete
          )
            completed.add(6);
          if (freshApp?.bankAccountsCount && freshApp.bankAccountsCount > 0)
            completed.add(7);
          setCompletedSteps(completed);

          // Set highestStepAllowed to the max completed step + 1 (so the next step is accessible)
          // This ensures all previously completed steps are clickable on return visits.
          const maxCompleted =
            completed.size > 0 ? Math.max(...Array.from(completed)) : 0;

          // Determine the first incomplete step to land on
          let initialStep = (draft as any).currentStep || 1;
          if (!initialStep || initialStep === 1) {
            if (!draftStoreName || !draftVendorType) {
              initialStep = 1;
            } else if (!freshApp?.sellingCategoriesComplete) {
              initialStep = 2;
            } else if (!freshApp?.personalInfoComplete) {
              initialStep = 3;
            } else if (requiresBusiness && !freshApp?.businessInfoComplete) {
              initialStep = 4;
            } else if (!freshApp?.storeInfoComplete) {
              initialStep = 5;
            } else if (
              !freshApp?.documentsComplete &&
              !(freshApp as any)?.documentsInfoComplete
            ) {
              initialStep = 6;
            } else if (
              !freshApp?.bankAccountsCount ||
              freshApp.bankAccountsCount === 0
            ) {
              initialStep = 7;
            } else {
              initialStep = 8;
            }
          }
          setCurrentStep(initialStep);
          // Allow navigation to all completed steps + the current one
          setHighestStepAllowed(Math.max(initialStep, maxCompleted + 1, 1));
        }
      } catch (err: any) {
        if (err?.response?.status === 404 || err?.status === 404) {
          try {
            await vendorApi.startApplication({
              storeName: '',
              vendorType: '' as any,
            });
          } catch (startErr) {
            // Silently handle if application already started
          }
        } else {
          console.error('Failed to fetch vendor data:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchApplicationData();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (currentStep > highestStepAllowed) {
      setHighestStepAllowed(currentStep);
    }
  }, [currentStep, highestStepAllowed]);

  useEffect(() => {
    if (!storeName || storeName.length < 3) {
      setStoreNameStatus('idle');
      return;
    }

    if (baselineDraft && storeName === baselineDraft.storeName) {
      setStoreNameStatus('available');
      return;
    }

    setStoreNameStatus('checking');
    if (storeNameTimeout.current) clearTimeout(storeNameTimeout.current);

    storeNameTimeout.current = setTimeout(async () => {
      try {
        const res = await vendorApi.checkStoreName(storeName);
        if (res.success && res.data) {
          setStoreNameStatus(res.data.available ? 'available' : 'taken');
        }
      } catch (err) {
        const isTaken = storeName.toLowerCase().includes('taken');
        setStoreNameStatus(isTaken ? 'taken' : 'available');
      }
    }, 500);

    return () => {
      if (storeNameTimeout.current) clearTimeout(storeNameTimeout.current);
    };
  }, [storeName, baselineDraft]);

  const hasStepChanges = (stepNum: number): boolean => {
    if (!baselineDraft) return true;
    switch (stepNum) {
      case 1:
        // Step 1 is read-only after completion - no changes possible
        if (isStep1Completed) return false;
        return (
          storeName !== (baselineDraft.storeName || '') ||
          vendorType !== (baselineDraft.vendorType || '') ||
          storePhone !== (baselineDraft.storePhone || '') ||
          storeEmail !== (baselineDraft.storeEmail || '')
        );

      case 2:
        const savedCategories =
          baselineDraft.sellingCategories?.map((c) => c.id) || [];
        const currentCategories = [...selectedCategories].sort();
        const savedSorted = [...savedCategories].sort();

        // If both arrays are empty, no changes
        if (currentCategories.length === 0 && savedSorted.length === 0) {
          return false;
        }

        // If lengths differ, there are changes
        if (currentCategories.length !== savedSorted.length) {
          return true;
        }

        // Compare each element
        for (let i = 0; i < currentCategories.length; i++) {
          if (currentCategories[i] !== savedSorted[i]) {
            return true;
          }
        }
        return false;

      case 3:
        const pInfo = baselineDraft.personalInfo;
        return (
          fullName !== (pInfo?.fullName || '') ||
          dateOfBirth !== (pInfo?.dateOfBirth || '') ||
          gender !== (pInfo?.gender || '') ||
          homeStreet !== (pInfo?.homeAddress?.street || '') ||
          homeCity !== (pInfo?.homeAddress?.city || '') ||
          homeState !== (pInfo?.homeAddress?.state || '') ||
          homeLga !== (pInfo?.homeAddress?.lga || '')
        );

      case 4:
        // If business step is not applicable, no changes needed
        if (!shouldShowBusinessStep) return false;
        const bInfo = baselineDraft.businessInfo;
        return (
          businessName !== (bInfo?.businessName || '') ||
          businessType !== (bInfo?.businessType || '') ||
          cacNumber !== (bInfo?.cacNumber || '') ||
          tinNumber !== (bInfo?.tinNumber || '') ||
          vatNumber !== (bInfo?.vatNumber || '') ||
          dateOfIncorporation !== (bInfo?.dateOfIncorporation || '')
        );

      case 5:
        const sInfo = baselineDraft.storeInfo;
        return (
          storeDescription !== (sInfo?.storeDescription || '') ||
          yearsInBusiness !== (sInfo?.yearsInBusiness || '') ||
          busStreet !== (sInfo?.businessAddress?.street || '') ||
          busCity !== (sInfo?.businessAddress?.city || '') ||
          busState !== (sInfo?.businessAddress?.state || '') ||
          busLga !== (sInfo?.businessAddress?.lga || '') ||
          busPostal !== (sInfo?.businessAddress?.postalCode || '') ||
          linkInstagram !== (sInfo?.socialLinks?.instagram || '') ||
          linkFacebook !== (sInfo?.socialLinks?.facebook || '') ||
          linkTwitter !== (sInfo?.socialLinks?.twitter || '') ||
          linkTiktok !== (sInfo?.socialLinks?.tiktok || '')
        );

      case 7:
        const currentBankAccounts = bankAccountsList;
        const baselineBankAccounts = baselineDraft.bankAccounts || [];
        if (currentBankAccounts.length !== baselineBankAccounts.length)
          return true;
        for (let i = 0; i < currentBankAccounts.length; i++) {
          if (
            currentBankAccounts[i].accountNumber !==
            baselineBankAccounts[i]?.accountNumber
          )
            return true;
        }
        return false;

      default:
        return false;
    }
  };

  const markStepCompleted = (stepNum: number) => {
    setCompletedSteps((prev) => new Set([...prev, stepNum]));
  };

  const isStep1Completed = completedSteps.has(1);

  const handleSaveStep = async (stepNum: number) => {
    const hasChanges = hasStepChanges(stepNum);

    try {
      if (stepNum === 1) {
        if (!storeName || storeName.length < 3) {
          toast.error('Store name must be at least 3 characters');
          return;
        }
        if (storeNameStatus === 'taken') {
          toast.error('Store name already in use. Please select another name.');
          return;
        }
        if (!vendorType) {
          toast.error('Please choose a Vendor Type');
          return;
        }
        const ngPhoneRegex = /^0[789][01]\d{8}$/;
        if (storePhone && !ngPhoneRegex.test(storePhone)) {
          toast.error(
            'Store phone number must be in local Nigerian format (e.g. 08012345678)'
          );
          return;
        }

        // If no baseline draft or no vendor type in draft, this is a new application
        if (!baselineDraft || !baselineDraft.vendorType) {
          setShowConfirmTypeModal(true);
          return;
        }

        // Only save if there are actual changes
        if (hasChanges) {
          toast.loading('Saving store basics...', { id: 'save-step' });
          await vendorApi.startApplication({
            storeName: storeName.trim(),
            vendorType,
            storePhone: storePhone?.trim() || undefined,
            storeEmail: storeEmail?.trim() || undefined,
          });
          toast.success('Store basics saved successfully', { id: 'save-step' });

          // Update baseline draft after save
          const draftRes = await vendorApi.getApplicationDraft();
          if (draftRes.success) setBaselineDraft(draftRes.data);
        }

        markStepCompleted(1);
        setCurrentStep(2);
      }

      if (stepNum === 2) {
        if (selectedCategories.length === 0) {
          toast.error('Please select at least one category');
          return;
        }

        // Only save if there are actual changes
        if (hasChanges) {
          toast.loading('Saving selling categories...', { id: 'save-step' });
          await vendorApi.updateSellingCategories(selectedCategories);
          toast.success('Selling categories updated!', { id: 'save-step' });

          // Update baseline draft after save
          const draftRes = await vendorApi.getApplicationDraft();
          if (draftRes.success) setBaselineDraft(draftRes.data);
        }

        // Always mark as complete and move on
        markStepCompleted(2);
        setCurrentStep(3);
      }

      if (stepNum === 3) {
        if (
          !fullName ||
          !dateOfBirth ||
          !gender ||
          !homeStreet ||
          !homeCity ||
          !homeState ||
          !homeLga
        ) {
          toast.error('Please fill in all required fields');
          return;
        }
        // Check if NIN is provided OR if it was already provided before
        if (!ninProvided && (!nin || nin.length !== 11)) {
          toast.error('NIN is required and must be exactly 11 digits');
          return;
        }
        const birthDate = new Date(dateOfBirth);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          toast.error('You must be at least 18 years old to apply');
          return;
        }

        if (hasChanges) {
          toast.loading('Saving personal information...', { id: 'save-step' });

          // Only save if we have a NIN value (not just ninProvided)
          if (nin && nin.length === 11) {
            await vendorApi.savePersonalInfo({
              fullName,
              dateOfBirth,
              gender,
              homeAddress: {
                street: homeStreet,
                city: homeCity,
                state: homeState,
                lga: homeLga,
              },
              nin: nin,
            });
            setNinProvided(true);
            setNin('');
          } else if (ninProvided) {
            // NIN already provided, just update other fields
            const existingNin = baselineDraft?.personalInfo?.nin || '';
            await vendorApi.savePersonalInfo({
              fullName,
              dateOfBirth,
              gender,
              homeAddress: {
                street: homeStreet,
                city: homeCity,
                state: homeState,
                lga: homeLga,
              },
              nin: existingNin,
            });
          }

          toast.success('Personal information updated!', { id: 'save-step' });
        }

        markStepCompleted(3);

        if (shouldShowBusinessStep) {
          setCurrentStep(4);
        } else {
          setCurrentStep(5);
        }
      }

      if (stepNum === 4) {
        if (!shouldShowBusinessStep) {
          // Business step is not applicable - mark as completed and skip
          markStepCompleted(4);
          setCurrentStep(5);
          return;
        }

        if (!businessName || !businessType || !cacNumber || !tinNumber) {
          toast.error('Please fill in all required business fields');
          return;
        }

        if (hasChanges) {
          toast.loading('Saving business details...', { id: 'save-step' });

          await vendorApi.saveBusinessInfo({
            businessName: businessName || '',
            businessType: businessType || '',
            cacNumber: cacNumber || '',
            tinNumber: tinNumber || '',
            vatNumber: vatNumber || undefined,
            dateOfIncorporation: dateOfIncorporation || undefined,
          });

          toast.success('Business info updated!', { id: 'save-step' });
        }

        markStepCompleted(4);
        setCurrentStep(5);
      }

      if (stepNum === 5) {
        if (storeDescription.length < 100) {
          toast.error('Store description must be at least 100 characters');
          return;
        }
        if (
          !yearsInBusiness ||
          !busStreet ||
          !busCity ||
          !busState ||
          !busLga
        ) {
          toast.error('Please fill in all required store fields');
          return;
        }

        if (hasChanges) {
          toast.loading('Saving store details...', { id: 'save-step' });

          await vendorApi.saveStoreInfo({
            storeDescription,
            yearsInBusiness,
            businessAddress: {
              street: busStreet,
              city: busCity,
              state: busState,
              lga: busLga,
              postalCode: busPostal || undefined,
            },
            socialLinks: {
              instagram: linkInstagram || null,
              facebook: linkFacebook || null,
              twitter: linkTwitter || null,
              tiktok: linkTiktok || null,
            },
          });

          toast.success('Store details updated!', { id: 'save-step' });
        }

        markStepCompleted(5);
        setCurrentStep(6);
      }

      if (stepNum === 6) {
        const reqSlots = getRequiredDocTypes();
        const missing = reqSlots.filter(
          (slot) => !documentsList.some((doc) => doc.documentType === slot)
        );
        if (missing.length > 0) {
          toast.error(`Please upload all required files to continue`);
          return;
        }
        markStepCompleted(6);
        setCurrentStep(7);
      }

      if (stepNum === 7) {
        if (bankAccountsList.length === 0) {
          toast.error('Please add at least one bank account to continue');
          return;
        }
        markStepCompleted(7);
        setCurrentStep(8);
      }

      // Update baseline draft after save for change detection on next visit
      const draftRes = await vendorApi.getApplicationDraft();
      if (draftRes.success) setBaselineDraft(draftRes.data);
    } catch (err: any) {
      toast.error(err.message || 'Error occurred while saving progress');
    }
  };

  const handleProceedStep1 = async () => {
    setShowConfirmTypeModal(false);
    try {
      toast.loading('Starting application...', { id: 'start-app' });
      await vendorApi.startApplication({
        storeName: storeName.trim(),
        vendorType: vendorType as any,
        storePhone: storePhone?.trim() || undefined,
        storeEmail: storeEmail?.trim() || undefined,
      });
      toast.success('Vendor profile created!', { id: 'start-app' });

      // Fetch fresh data after starting
      const draftRes = await vendorApi.getApplicationDraft();
      if (draftRes.success) {
        setBaselineDraft(draftRes.data);
        markStepCompleted(1);
        setCurrentStep(2);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to start application', {
        id: 'start-app',
      });
    }
  };

  const handleNinChange = () => {
    setShowNinModal(true);
  };

  const handleNinModalSubmit = async () => {
    if (!nin || nin.length !== 11) {
      toast.error('NIN must be exactly 11 digits');
      return;
    }

    try {
      toast.loading('Updating NIN...', { id: 'nin-update' });
      await vendorApi.savePersonalInfo({
        fullName,
        dateOfBirth,
        gender,
        homeAddress: {
          street: homeStreet,
          city: homeCity,
          state: homeState,
          lga: homeLga,
        },
        nin: nin,
      });
      toast.success('NIN updated successfully!', { id: 'nin-update' });
      setNinProvided(true);
      setNin('');
      setShowNinModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update NIN');
    }
  };

  const getRequiredDocTypes = (): string[] => {
    if (vendorType === 'brand') {
      return [
        'government_id',
        'id_selfie',
        'cac_certificate',
        'tin_certificate',
        'brand_authorization',
      ];
    }
    if (vendorType === 'registered_business') {
      return [
        'government_id',
        'id_selfie',
        'cac_certificate',
        'tin_certificate',
      ];
    }
    // For individual, reseller, dropshipper
    return ['government_id', 'id_selfie'];
  };

  const handleFileUpload = async (
    docType: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5242880) {
      toast.error('File size cannot exceed 5MB');
      return;
    }

    const isSelfie = docType === 'id_selfie';
    const acceptedTypes = isSelfie
      ? ['image/jpeg', 'image/jpg', 'image/png']
      : ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (!acceptedTypes.includes(file.type)) {
      toast.error(
        isSelfie
          ? 'Unsupported file format for selfie. JPG or PNG only.'
          : 'Unsupported file format. JPG, PNG or PDF only.'
      );
      return;
    }

    setUploadingDocType(docType);
    try {
      // 1. Request signed upload credentials and authenticated delivery URL from EkivaMart Backend
      const signedRes = await vendorApi.getDocumentUploadUrl({
        documentType: docType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      if (signedRes.success && signedRes.data) {
        const sig = signedRes.data;

        // 2. Direct upload to Cloudinary using FormData with all signature fields and file blob
        if (sig.uploadUrl && sig.fields) {
          const formData = new FormData();
          Object.entries(sig.fields).forEach(([key, value]) => {
            formData.append(key, String(value));
          });
          formData.append('file', file);

          if (!USE_MOCK_VENDOR_API) {
            const cloudResponse = await fetch(sig.uploadUrl, {
              method: 'POST',
              body: formData,
            });
            if (!cloudResponse.ok) {
              throw new Error('Cloudinary direct upload failed');
            }
          }
        }

        // 3. Confirm upload with EkivaMart Backend passing exact signed URL returned by Step 1
        const confirmRes = await vendorApi.confirmDocumentUpload({
          documentType: docType,
          cloudinaryPublicId: sig.publicId,
          documentUrl: sig.url,
          originalFilename: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type,
        });

        if (confirmRes.success && confirmRes.data) {
          const savedDoc = normalizeDocument(confirmRes.data);
          setDocumentsList((prev) => {
            const updated = prev.filter((d) => d.documentType !== docType);
            return [...updated, savedDoc];
          });
          toast.success(
            `${DOCUMENT_DESCRIPTIONS[docType]?.label || docType} uploaded successfully!`
          );
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
      const res = await vendorApi.deleteDocument(docId);
      if (res.success) {
        setDocumentsList((prev) => prev.filter((d) => d.id !== docId));
        toast.success('Document deleted');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete document');
    }
  };

  const handleViewDocument = (doc: VendorDocument) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  const handleAddBank = async () => {
    if (bankAccountsList.length >= MAX_BANK_ACCOUNTS) {
      toast.error(`Maximum of ${MAX_BANK_ACCOUNTS} bank accounts allowed`);
      return;
    }

    if (!accountNumber || accountNumber.length !== 10) {
      toast.error('Account number must be 10 digits');
      return;
    }
    if (!accountName || accountName.length < 2) {
      toast.error('Please enter the account holder name');
      return;
    }
    if (!bankName || !bankCode) {
      toast.error('Please select a bank');
      return;
    }

    try {
      const res = await vendorApi.addBankAccount({
        accountName: accountName,
        accountNumber,
        bankName,
        bankCode,
        accountType,
      });

      if (res.success && res.data) {
        setBankAccountsList((prev) => [...prev, res.data!]);
        setAccountNumber('');
        setAccountName('');
        setBankName('');
        setBankCode('');
        setBankSearchText('');
        toast.success('Bank account linked successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add bank account');
    }
  };

  const handleDeleteBank = async (bankId: string) => {
    try {
      const res = await vendorApi.deleteBankAccount(bankId);
      if (res.success) {
        setBankAccountsList((prev) => prev.filter((a) => a.id !== bankId));
        toast.success('Bank account removed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove bank account');
    }
  };

  const handleSetPrimaryBank = async (bankId: string) => {
    try {
      const res = await vendorApi.setPrimaryBankAccount(bankId);
      if (res.success) {
        setBankAccountsList((prev) =>
          prev.map((a) => ({ ...a, isPrimary: a.id === bankId }))
        );
        toast.success('Primary account updated');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update primary bank account');
    }
  };

  const handleSubmitAll = async () => {
    if (!confirmAccurate || !confirmTerms) {
      toast.error('You must agree to terms and check all boxes');
      return;
    }

    setSubmittingApplication(true);
    try {
      // Validate completeness status prior to submission
      const statusRes = await vendorApi.getApplicationStatus();
      if (statusRes.success && statusRes.data) {
        setAppStatus(statusRes.data);
      }

      const res = await vendorApi.submitApplication();
      if (res.success) {
        toast.success('Application submitted successfully! 🎉');
        router.push('/vendor/application/status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleClearAll = async () => {
    try {
      resetMockData();
      toast.success('All vendor data cleared! Refreshing...');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to clear data');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const isStepCompleted = (stepIndex: number): boolean => {
    return completedSteps.has(stepIndex);
  };

  const isStepActive = (stepIndex: number): boolean => {
    return currentStep === stepIndex;
  };

  const isStepClickable = (stepIndex: number): boolean => {
    return stepIndex <= highestStepAllowed;
  };

  const isStepSkipped = (stepIndex: number): boolean => {
    if (stepIndex === 4) {
      // If vendor type is empty, don't mark as skipped
      if (!vendorType) return false;
      const showBusiness =
        vendorType === 'registered_business' || vendorType === 'brand';
      return !showBusiness;
    }
    return false;
  };

  // Custom StyledSelect component
  const StyledSelect = ({
    value,
    onChange,
    options,
    placeholder,
    className = '',
    disabled = false,
  }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setIsFocused(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt: any) => opt.value === value);

    return (
      <div ref={selectRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              setIsFocused(true);
            }
          }}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`w-full border-2 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium flex items-center justify-between ${
            disabled
              ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
              : isFocused || isOpen
                ? 'bg-white border-[#228b22] ring-2 ring-brand-500/10'
                : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span
            className={
              selectedOption && !disabled
                ? 'text-slate-800'
                : disabled
                  ? 'text-slate-500'
                  : 'text-slate-400'
            }
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${isOpen && !disabled ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
            {options.map((option: any) => (
              <button
                key={option.value || option.id || option.label}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setIsFocused(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-50 transition-colors ${
                  value === option.value
                    ? 'bg-brand-50 text-[#228b22] font-bold'
                    : 'text-slate-700'
                } border-b border-slate-50 last:border-0`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-[#228b22] rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-bold">
            Verifying authentication & loading application state...
          </p>
        </div>
      </div>
    );
  }

  // Get step titles dynamically - Business Info is always shown but may be greyed out
  const getStepTitles = () => {
    const titles = [
      'Store Basics',
      'Selling Categories',
      'Personal Info',
      'Business Info',
      'Store Details',
      'Documents',
      'Bank Account',
      'Review',
    ];
    return titles;
  };

  // Get step index mapping for display
  const getStepIndexMap = () => {
    const map: { [key: number]: number } = {};
    for (let i = 1; i <= 8; i++) {
      map[i] = i;
    }
    return map;
  };

  const stepTitles = getStepTitles();
  const stepIndexMap = getStepIndexMap();

  const getButtonText = (stepNum: number): string => {
    const isCompleted = isStepCompleted(stepNum);
    const hasChanges = hasStepChanges(stepNum);

    if (isCompleted && !hasChanges) {
      return 'Continue';
    }
    return 'Save & Continue';
  };

  // Get category image - supports real images from API with fallback to first letter SVG
  const getCategoryImage = (category: Category): string => {
    // If the category has an imageUrl from the API, use it
    if (category.imageUrl) {
      return category.imageUrl;
    }

    // Fallback: use first letter as a simple SVG
    const firstLetter = category.name.charAt(0).toUpperCase();
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23f3e8ff"/><text y=".9em" font-size="40" x="50%" text-anchor="middle" dominant-baseline="middle" dy="0.1em" fill="%239d4ae3" font-weight="bold">${firstLetter}</text></svg>`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-8 font-sans">
      <header className="bg-white border-b border-slate-100 py-4 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/ekivamart-logo.svg"
              alt="EkivaMart Logo"
              width={110}
              height={36}
              className="h-8 w-auto object-contain"
            />
            <div className="w-px h-5 bg-slate-200" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Vendor Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            {IS_DEV_MODE && (
              <button
                onClick={() => setShowClearAllModal(true)}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
              >
                <RefreshCw size={14} />
                Clear All
              </button>
            )}
            <Link
              href="/become-a-vendor"
              className="text-xs font-bold text-slate-500 hover:text-[#228b22] transition-colors"
            >
              Exit Application
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Stepper - Fixed alignment */}
      <div className="lg:hidden max-w-4xl mx-auto px-4 mb-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm overflow-x-auto no-scrollbar">
          <div className="relative flex items-start justify-between min-w-[700px] pt-4">
            {/* Horizontal line */}
            <div className="absolute left-[30px] right-[30px] top-1/2 h-0.5 bg-slate-200 z-0" />

            {stepTitles.map((title, idx) => {
              const stepIndex = idx + 1;
              const isCompleted = isStepCompleted(stepIndex);
              const isActive = isStepActive(stepIndex);
              const isSkipped = isStepSkipped(stepIndex);
              const isClickable = isStepClickable(stepIndex);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!isClickable || isSkipped}
                  onClick={() => {
                    if (isClickable && !isSkipped) setCurrentStep(stepIndex);
                  }}
                  className={`flex-1 flex flex-col items-center gap-1 relative z-10 transition-all ${
                    isSkipped
                      ? 'opacity-100 cursor-not-allowed'
                      : isClickable
                        ? 'cursor-pointer hover:opacity-80'
                        : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  {/* Circle - solid background to hide the line */}
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all flex-shrink-0 ${
                      isSkipped
                        ? 'bg-slate-200  border-slate-300 text-slate-400'
                        : isCompleted
                          ? 'bg-[#228b22] border-[#228b22] text-white'
                          : isActive
                            ? 'bg-[#eff4e9] border-[#228b22] text-[#228b22] ring-2 ring-brand-100'
                            : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {isCompleted && !isSkipped ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <span>{stepIndex}</span>
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider text-center leading-tight max-w-[70px] ${
                      isSkipped
                        ? 'text-slate-300'
                        : isActive || isCompleted
                          ? 'text-[#228b22]'
                          : 'text-slate-400'
                    }`}
                  >
                    {title}
                    {isSkipped && ' (N/A)'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 lg:flex lg:gap-8 lg:items-start">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 shrink-0 sticky top-8">
          <div className="bg-gradient-to-br from-brand-900 to-[#1c711c] text-white rounded-2xl p-5 shadow-lg mb-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-[#00bca6]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm">Vendor Application</h3>
                <p className="text-[10px] text-brand-200">
                  Progress saved automatically
                </p>
              </div>
            </div>
            <p className="text-[11px] text-brand-100 leading-relaxed">
              Typically takes 5–10 minutes. You may return to continue at any
              step.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {stepTitles.map((title, idx) => {
              const stepIndex = idx + 1;
              const isCompleted = isStepCompleted(stepIndex);
              const isActive = isStepActive(stepIndex);
              const isSkipped = isStepSkipped(stepIndex);
              const isClickable = isStepClickable(stepIndex);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!isClickable || isSkipped}
                  onClick={() => {
                    if (isClickable && !isSkipped) setCurrentStep(stepIndex);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-slate-50 last:border-0 ${
                    isSkipped
                      ? 'opacity-50 cursor-not-allowed bg-slate-50'
                      : isActive
                        ? 'bg-brand-50'
                        : isClickable
                          ? 'hover:bg-slate-50 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-[11px] shrink-0 transition-all ${
                      isSkipped
                        ? 'bg-slate-100 border-slate-200 text-slate-400'
                        : isCompleted
                          ? 'bg-[#228b22] border-[#228b22] text-white'
                          : isActive
                            ? 'bg-[#eff4e9] border-[#228b22] text-[#228b22]'
                            : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {isCompleted && !isSkipped ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      stepIndex
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        isSkipped
                          ? 'text-slate-400'
                          : isActive
                            ? 'text-[#228b22]'
                            : isCompleted
                              ? 'text-slate-700'
                              : 'text-slate-400'
                      }`}
                    >
                      {title}
                    </p>
                    {isSkipped && (
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-black">
                        <Ban size={10} />
                        Not applicable
                      </div>
                    )}
                    {isCompleted && !isSkipped && (
                      <p className="text-[9px] text-green-500 uppercase font-black">
                        Complete
                      </p>
                    )}
                    {!isCompleted && !isActive && !isSkipped && isClickable && (
                      <p className="text-[9px] text-slate-400 uppercase font-black">
                        Pending
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            {/* Status Banner */}
            {showStatusBanner && appStatus && (
              <div
                className={`mb-6 p-4 rounded-xl border ${
                  appStatus.status === 'submitted' ||
                  appStatus.status === 'in_review'
                    ? 'bg-blue-50 border-blue-200'
                    : appStatus.status === 'approved'
                      ? 'bg-green-50 border-green-200'
                      : appStatus.status === 'rejected'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {appStatus.status === 'submitted' ||
                    appStatus.status === 'in_review' ? (
                      <Clock size={18} className="text-blue-600" />
                    ) : appStatus.status === 'approved' ? (
                      <Check size={18} className="text-green-600" />
                    ) : appStatus.status === 'rejected' ? (
                      <X size={18} className="text-red-600" />
                    ) : (
                      <Info size={18} className="text-slate-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">
                      Application Status:{' '}
                      <span
                        className={`capitalize ${
                          appStatus.status === 'submitted' ||
                          appStatus.status === 'in_review'
                            ? 'text-blue-600'
                            : appStatus.status === 'approved'
                              ? 'text-green-600'
                              : appStatus.status === 'rejected'
                                ? 'text-red-600'
                                : 'text-slate-600'
                        }`}
                      >
                        {appStatus.status.replace('_', ' ')}
                      </span>
                    </h4>
                    {appStatus.status === 'submitted' && (
                      <p className="text-xs text-blue-600 mt-1">
                        Your application has been submitted and is awaiting
                        review by our team. This typically takes 1-3 business
                        days.
                      </p>
                    )}
                    {appStatus.status === 'in_review' && (
                      <p className="text-xs text-blue-600 mt-1">
                        Our team is currently reviewing your application. You'll
                        be notified once a decision is made.
                      </p>
                    )}
                    {appStatus.status === 'approved' && (
                      <p className="text-xs text-green-600 mt-1">
                        Congratulations! Your vendor application has been
                        approved. You can now start selling on EkivaMart.
                      </p>
                    )}
                    {appStatus.status === 'rejected' &&
                      appStatus.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-100 rounded-lg">
                          <p className="text-xs text-red-700 font-medium">
                            Rejection Reason:
                          </p>
                          <p className="text-xs text-red-600 mt-0.5">
                            {appStatus.rejectionReason}
                          </p>
                        </div>
                      )}
                    {appStatus.status === 'requires_resubmission' &&
                      appStatus.resubmissionNote && (
                        <div className="mt-2 p-2 bg-orange-100 rounded-lg">
                          <p className="text-xs text-orange-700 font-medium">
                            Action Required:
                          </p>
                          <p className="text-xs text-orange-600 mt-0.5">
                            {appStatus.resubmissionNote}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
              >
                {/* STEP 1: Store Basics */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-black text-[#228b22] flex items-center gap-2">
                            <Store className="w-6 h-6 text-[#228b22]" />
                            Store Basics
                          </h2>
                          <p className="text-sm text-slate-500">
                            Provide the basic identifying elements of your
                            digital storefront.
                          </p>
                        </div>
                        {isStep1Completed && (
                          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200">
                            <Check size={14} />
                            Locked & Confirmed
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                          Store Name (unique)
                          <span
                            className="text-[#228b22] ml-1 font-bold"
                            aria-hidden="true"
                          >
                            *
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            placeholder="Chisom Flowers"
                            disabled={isStep1Completed}
                            className={`w-full border-2 rounded-xl px-4 py-3 text-sm transition-all outline-none font-medium placeholder:text-slate-400 ${
                              isStep1Completed
                                ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                                : storeNameStatus === 'taken'
                                  ? 'bg-white border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 text-slate-800'
                                  : storeNameStatus === 'available'
                                    ? 'bg-white border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 text-slate-800'
                                    : 'bg-white border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 text-slate-800'
                            }`}
                          />
                          {!isStep1Completed &&
                            storeNameStatus === 'checking' && (
                              <span className="absolute right-3.5 top-3.5 w-4.5 h-4.5 border-2 border-brand-200 border-t-[#228b22] rounded-full animate-spin inline-block" />
                            )}
                          {!isStep1Completed &&
                            storeNameStatus === 'available' && (
                              <CheckCircle2 className="absolute right-3.5 top-3.5 w-5 h-5 text-green-500" />
                            )}
                          {!isStep1Completed && storeNameStatus === 'taken' && (
                            <X className="absolute right-3.5 top-3.5 w-5 h-5 text-red-500" />
                          )}
                          {isStep1Completed && (
                            <CheckCircle2 className="absolute right-3.5 top-3.5 w-5 h-5 text-green-500" />
                          )}
                        </div>

                        {/* Status indicator text - using span instead of div inside p */}
                        {!isStep1Completed &&
                          storeNameStatus === 'checking' && (
                            <p className="text-xs text-brand-600 mt-1.5 flex items-center gap-1 font-medium">
                              <span className="w-3 h-3 border-2 border-brand-300 border-t-purple-600 rounded-full animate-spin inline-block flex-shrink-0" />
                              Checking availability...
                            </p>
                          )}

                        {!isStep1Completed &&
                          storeNameStatus === 'available' &&
                          storeName.length >= 3 && (
                            <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1 font-medium">
                              <Check
                                size={14}
                                className="text-green-500 flex-shrink-0"
                              />
                              Available ✓
                            </p>
                          )}

                        {!isStep1Completed && storeNameStatus === 'taken' && (
                          <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 font-medium">
                            <X
                              size={14}
                              className="text-red-500 flex-shrink-0"
                            />
                            This store name is already in use. Please choose
                            another.
                          </p>
                        )}

                        {isStep1Completed && (
                          <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1 font-medium">
                            <Check
                              size={14}
                              className="text-green-500 flex-shrink-0"
                            />
                            Store name confirmed ✓
                          </p>
                        )}

                        {!isStep1Completed &&
                          storeNameStatus === 'idle' &&
                          storeName.length >= 3 && (
                            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                              <AlertCircle
                                size={14}
                                className="text-slate-400 flex-shrink-0"
                              />
                              Enter a unique store name
                            </p>
                          )}

                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                          Between 3 and 100 characters. Letters, numbers and
                          spaces allowed.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                          Vendor Type
                          <span
                            className="text-[#228b22] ml-1 font-bold"
                            aria-hidden="true"
                          >
                            *
                          </span>
                        </label>
                        <StyledSelect
                          value={vendorType}
                          onChange={(val: any) => setVendorType(val)}
                          options={VENDOR_TYPES.map((t) => ({
                            value: t.value,
                            label: t.label,
                          }))}
                          placeholder="Select Vendor Type"
                          disabled={isStep1Completed}
                        />
                        {vendorType && (
                          <p className="text-xs text-[#228b22] mt-1.5 font-bold">
                            {
                              VENDOR_TYPES.find((t) => t.value === vendorType)
                                ?.desc
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                          Store Phone Number
                          <span className="text-slate-400 ml-1 text-[10px] font-normal">
                            (Optional)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={storePhone}
                          onChange={(e) =>
                            setStorePhone(e.target.value.replace(/\D/g, ''))
                          }
                          maxLength={11}
                          placeholder="e.g. 08012345678"
                          disabled={isStep1Completed}
                          className={`w-full border-2 rounded-xl px-4 py-3 text-sm transition-all outline-none font-medium placeholder:text-slate-400 ${
                            isStep1Completed
                              ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                              : 'bg-white border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 text-slate-800'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                          Store Contact Email
                          <span className="text-slate-400 ml-1.5 text-[10px] font-normal">
                            (Read-only)
                          </span>
                        </label>
                        <input
                          type="email"
                          readOnly
                          value={storeEmail || user?.email || ''}
                          className="w-full bg-slate-50 border-2 border-slate-200 text-slate-500 rounded-xl px-4 py-3 text-sm outline-none cursor-not-allowed font-medium"
                        />
                        {/* <p className="text-[10px] text-slate-400 mt-1 font-medium">
                          Linked to your main authenticated EkivaMart account.
                        </p> */}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Selling Categories - Clean version with image and name only */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-[#228b22] flex items-center gap-2">
                        <Tag className="w-6 h-6 text-[#228b22]" />
                        Selling Categories
                      </h2>
                      <p className="text-sm text-slate-500">
                        Select the categories you plan to sell under. You can
                        select multiple categories.
                        <span className="text-[#228b22] font-semibold">
                          {' '}
                          Minimum 1, maximum {MAX_CATEGORIES}.
                        </span>
                      </p>
                    </div>

                    {categoriesList.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <div className="w-12 h-12 border-4 border-brand-200 border-t-[#228b22] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm font-medium">
                          Loading categories...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {categoriesList.map((category) => {
                            const isSelected = selectedCategories.includes(
                              category.id
                            );
                            const imageUrl = getCategoryImage(category);
                            const hasRealImage = !!category.imageUrl;

                            return (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedCategories((prev) =>
                                      prev.filter((id) => id !== category.id)
                                    );
                                  } else if (
                                    selectedCategories.length < MAX_CATEGORIES
                                  ) {
                                    setSelectedCategories((prev) => [
                                      ...prev,
                                      category.id,
                                    ]);
                                  } else {
                                    toast.error(
                                      `Maximum ${MAX_CATEGORIES} categories allowed`
                                    );
                                  }
                                }}
                                className={`group p-4 rounded-xl border-2 transition-all text-center hover:shadow-md ${
                                  isSelected
                                    ? 'border-[#228b22] bg-brand-50 ring-2 ring-brand-500/20 shadow-md'
                                    : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50/50'
                                }`}
                              >
                                <div className="flex flex-col items-center gap-3">
                                  {/* Image container */}
                                  <div
                                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                                      isSelected
                                        ? 'ring-2 ring-[#228b22] ring-offset-2'
                                        : ''
                                    } ${hasRealImage ? 'bg-white' : 'bg-gradient-to-br from-brand-50 to-brand-100'}`}
                                  >
                                    {hasRealImage ? (
                                      <img
                                        src={imageUrl}
                                        alt={category.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.src = getCategoryImage({
                                            ...category,
                                            imageUrl: undefined,
                                          });
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-3xl font-bold text-[#228b22]">
                                          {category.name
                                            .charAt(0)
                                            .toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Category name only - no description */}
                                  <p
                                    className={`text-sm font-medium ${
                                      isSelected
                                        ? 'text-[#228b22]'
                                        : 'text-slate-700 group-hover:text-[#228b22]'
                                    }`}
                                  >
                                    {category.name}
                                  </p>

                                  {/* Selection indicator */}
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                      isSelected
                                        ? 'border-[#228b22] bg-[#228b22]'
                                        : 'border-slate-300 group-hover:border-brand-300'
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check className="w-3 h-3 text-white stroke-[3]" />
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
                          <p className="text-xs text-slate-500">
                            Selected:{' '}
                            <span className="font-bold text-[#228b22]">
                              {selectedCategories.length}
                            </span>{' '}
                            of {categoriesList.length} categories (max{' '}
                            {MAX_CATEGORIES})
                          </p>
                          {selectedCategories.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedCategories([])}
                              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* STEP 3: Personal Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-[#228b22] flex items-center gap-2">
                        <User className="w-6 h-6 text-[#228b22]" />
                        Personal Information
                      </h2>
                      <p className="text-sm text-slate-500 font-medium">
                        Provide legal identification details to confirm owner
                        registration.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                          Full Legal Name
                          <span
                            className="text-[#228b22] ml-1 font-bold"
                            aria-hidden="true"
                          >
                            *
                          </span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Chisom Ada Okafor"
                          className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Must match the legal name on bank account & government
                          ID.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            Date of Birth
                            <span
                              className="text-[#228b22] ml-1 font-bold"
                              aria-hidden="true"
                            >
                              *
                            </span>
                          </label>
                          <input
                            type="date"
                            required
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            Gender
                            <span
                              className="text-[#228b22] ml-1 font-bold"
                              aria-hidden="true"
                            >
                              *
                            </span>
                          </label>
                          <StyledSelect
                            value={gender}
                            onChange={(val: any) => setGender(val)}
                            options={[
                              { value: 'male', label: 'Male' },
                              { value: 'female', label: 'Female' },
                              { value: 'other', label: 'Other' },
                              {
                                value: 'prefer_not_to_say',
                                label: 'Prefer not to say',
                              },
                            ]}
                            placeholder="Select"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-extrabold text-sm text-brand-800 border-b border-slate-100 pb-2">
                        Current Location
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            Street Address
                            <span
                              className="text-[#228b22] ml-1 font-bold"
                              aria-hidden="true"
                            >
                              *
                            </span>
                          </label>
                          <input
                            type="text"
                            required
                            value={homeStreet}
                            onChange={(e) => setHomeStreet(e.target.value)}
                            placeholder="12 Bode Thomas Street"
                            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                              City
                              <span
                                className="text-[#228b22] ml-1 font-bold"
                                aria-hidden="true"
                              >
                                *
                              </span>
                            </label>
                            <input
                              type="text"
                              required
                              value={homeCity}
                              onChange={(e) => setHomeCity(e.target.value)}
                              placeholder="Surulere"
                              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                              State
                              <span
                                className="text-[#228b22] ml-1 font-bold"
                                aria-hidden="true"
                              >
                                *
                              </span>
                            </label>
                            <StyledSelect
                              value={homeState}
                              onChange={(val: any) => setHomeState(val)}
                              options={NIGERIAN_STATES.map((s) => ({
                                value: s,
                                label: s,
                              }))}
                              placeholder="State"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                              LGA
                              <span
                                className="text-[#228b22] ml-1 font-bold"
                                aria-hidden="true"
                              >
                                *
                              </span>
                            </label>
                            <input
                              type="text"
                              required
                              value={homeLga}
                              onChange={(e) => setHomeLga(e.target.value)}
                              placeholder="Surulere"
                              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-2 py-3 text-xs transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-1 gap-6 pt-4 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                          National Identification Number (NIN)
                        </label>
                        {ninProvided ? (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium flex items-center gap-2">
                              <Check size={16} className="text-green-500" />
                              NIN already provided
                            </div>
                            <button
                              type="button"
                              onClick={handleNinChange}
                              className="text-xs font-bold text-[#228b22] hover:text-[#1c711c] transition-colors px-3 py-2 border border-[#228b22] rounded-xl hover:bg-brand-50"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <input
                            type="text"
                            maxLength={11}
                            value={nin}
                            onChange={(e) =>
                              setNin(e.target.value.replace(/\D/g, ''))
                            }
                            placeholder="11-digit NIN"
                            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                          />
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          Must be exactly 11 digits
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Business Information - Always visible, but greyed out when not applicable */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-black text-[#228b22] flex items-center gap-2">
                            <Building className="w-6 h-6 text-[#228b22]" />
                            Business Information
                          </h2>
                          <p className="text-sm text-slate-500 font-medium">
                            {shouldShowBusinessStep
                              ? 'Provide official CAC corporate registration data for your entity.'
                              : 'Business information is not applicable for your vendor type.'}
                          </p>
                        </div>
                        {!shouldShowBusinessStep && (
                          <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200">
                            <Ban size={14} />
                            Not Applicable
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className={`${!shouldShowBusinessStep ? 'opacity-50 pointer-events-none bg-slate-50/50 rounded-xl p-4' : ''}`}
                    >
                      {!shouldShowBusinessStep && (
                        <div className="mb-4 p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-xs flex items-center gap-2">
                          <Info size={14} />
                          This step is automatically skipped for your vendor
                          type.
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            Registered Business Name
                            {shouldShowBusinessStep && (
                              <span
                                className="text-[#228b22] ml-1 font-bold"
                                aria-hidden="true"
                              >
                                *
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            required={shouldShowBusinessStep}
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="Chisom Flowers Limited"
                            className={`w-full border-2 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400 ${
                              shouldShowBusinessStep
                                ? 'bg-white border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10'
                                : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                            }`}
                            disabled={!shouldShowBusinessStep}
                          />
                          {!shouldShowBusinessStep && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Not required for your vendor type
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            Business Type
                            {shouldShowBusinessStep && (
                              <span
                                className="text-[#228b22] ml-1 font-bold"
                                aria-hidden="true"
                              >
                                *
                              </span>
                            )}
                          </label>
                          <StyledSelect
                            value={businessType}
                            onChange={(val: any) => setBusinessType(val)}
                            options={BUSINESS_TYPES.map((b) => ({
                              value: b.value,
                              label: b.label,
                            }))}
                            placeholder="Select Business Type"
                            disabled={!shouldShowBusinessStep}
                            className={
                              !shouldShowBusinessStep ? 'opacity-60' : ''
                            }
                          />
                          {!shouldShowBusinessStep && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Not required for your vendor type
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            CAC Registration Number
                            {shouldShowBusinessStep && (
                              <span
                                className="text-[#228b22] ml-1 font-bold"
                                aria-hidden="true"
                              >
                                *
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            required={shouldShowBusinessStep}
                            value={cacNumber}
                            onChange={(e) => setCacNumber(e.target.value)}
                            placeholder="e.g. RC1234567"
                            className={`w-full border-2 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400 ${
                              shouldShowBusinessStep
                                ? 'bg-white border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10'
                                : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                            }`}
                            disabled={!shouldShowBusinessStep}
                          />
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            Must start with RC or BN.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            Tax Identification Number (TIN)
                            {shouldShowBusinessStep && (
                              <span
                                className="text-[#228b22] ml-1 font-bold"
                                aria-hidden="true"
                              >
                                *
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            required={shouldShowBusinessStep}
                            maxLength={15}
                            value={tinNumber}
                            onChange={(e) => setTinNumber(e.target.value)}
                            placeholder="8-15 character TIN"
                            className={`w-full border-2 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400 ${
                              shouldShowBusinessStep
                                ? 'bg-white border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10'
                                : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                            }`}
                            disabled={!shouldShowBusinessStep}
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            8-15 characters allowed
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            VAT Number (Optional)
                          </label>
                          <input
                            type="text"
                            value={vatNumber}
                            onChange={(e) => setVatNumber(e.target.value)}
                            placeholder="VAT Registration Number"
                            className={`w-full border-2 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400 ${
                              shouldShowBusinessStep
                                ? 'bg-white border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10'
                                : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                            }`}
                            disabled={!shouldShowBusinessStep}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center font-medium">
                          Date of Incorporation (Optional)
                        </label>
                        <input
                          type="date"
                          value={dateOfIncorporation}
                          onChange={(e) =>
                            setDateOfIncorporation(e.target.value)
                          }
                          className={`w-full border-2 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium ${
                            shouldShowBusinessStep
                              ? 'bg-white border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10'
                              : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                          }`}
                          disabled={!shouldShowBusinessStep}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Store Details */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-[#228b22] flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-[#228b22]" />
                        Store Details
                      </h2>
                      <p className="text-sm text-slate-500 font-medium">
                        Provide store branding elements, operating years, and
                        social handles.
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 flex items-center">
                          Store Description (min 100 characters)
                          <span
                            className="text-[#228b22] ml-1 font-bold"
                            aria-hidden="true"
                          >
                            *
                          </span>
                        </label>
                        <span
                          className={`text-[10px] font-bold text-[#228b22]`}
                        >
                          {storeDescription.length} / 1000
                        </span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        maxLength={1000}
                        value={storeDescription}
                        onChange={(e) => setStoreDescription(e.target.value)}
                        placeholder="Describe what your store sells, your quality focus, and floral arrangement values..."
                        className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none resize-none text-slate-800 font-medium placeholder:text-slate-400"
                      />
                      {storeDescription.length > 0 &&
                        storeDescription.length < 100 && (
                          <p className="text-xs text-[#228b22] mt-1 font-medium">
                            Please enter at least 100 characters (
                            {100 - storeDescription.length} more needed)
                          </p>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                          Years in Business
                          <span
                            className="text-[#228b22] ml-1 font-bold"
                            aria-hidden="true"
                          >
                            *
                          </span>
                        </label>
                        <StyledSelect
                          value={yearsInBusiness}
                          onChange={(val: any) => setYearsInBusiness(val)}
                          options={[
                            { value: 'less_than_1', label: 'Less than 1 year' },
                            { value: '1-3 years', label: '1-3 Years' },
                            { value: '3-5 years', label: '3-5 Years' },
                            { value: '5+ years', label: 'More than 5 Years' },
                          ]}
                          placeholder="Select"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                          Postal Code (Optional)
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={busPostal}
                          onChange={(e) =>
                            setBusPostal(e.target.value.replace(/\D/g, ''))
                          }
                          placeholder="100001"
                          className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          6 digits only
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-extrabold text-sm text-brand-800 border-b border-slate-100 pb-2">
                        Business Operations Address
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            Street Address
                            <span
                              className="text-[#228b22] ml-1 font-bold"
                              aria-hidden="true"
                            >
                              *
                            </span>
                          </label>
                          <input
                            type="text"
                            required
                            value={busStreet}
                            onChange={(e) => setBusStreet(e.target.value)}
                            placeholder="15 Allen Avenue"
                            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                              City
                              <span
                                className="text-[#228b22] ml-1 font-bold"
                                aria-hidden="true"
                              >
                                *
                              </span>
                            </label>
                            <input
                              type="text"
                              required
                              value={busCity}
                              onChange={(e) => setBusCity(e.target.value)}
                              placeholder="Ikeja"
                              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                              State
                              <span
                                className="text-[#228b22] ml-1 font-bold"
                                aria-hidden="true"
                              >
                                *
                              </span>
                            </label>
                            <StyledSelect
                              value={busState}
                              onChange={(val: any) => setBusState(val)}
                              options={NIGERIAN_STATES.map((s) => ({
                                value: s,
                                label: s,
                              }))}
                              placeholder="State"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                              LGA
                              <span
                                className="text-[#228b22] ml-1 font-bold"
                                aria-hidden="true"
                              >
                                *
                              </span>
                            </label>
                            <input
                              type="text"
                              required
                              value={busLga}
                              onChange={(e) => setBusLga(e.target.value)}
                              placeholder="Ikeja"
                              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-2 py-3 text-xs transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h3 className="font-extrabold text-sm text-brand-800 border-b border-slate-100 pb-2">
                        Social Media Links (Optional)
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#228b22]">
                            <FaInstagram size={18} />
                          </div>
                          <input
                            type="url"
                            placeholder="https://instagram.com/yourbrand"
                            value={linkInstagram}
                            onChange={(e) => setLinkInstagram(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl text-xs font-medium transition-all outline-none text-slate-800 placeholder:text-slate-400"
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#228b22]">
                            <FaFacebookF size={18} />
                          </div>
                          <input
                            type="url"
                            placeholder="https://facebook.com/yourbrand"
                            value={linkFacebook}
                            onChange={(e) => setLinkFacebook(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl text-xs font-medium transition-all outline-none text-slate-800 placeholder:text-slate-400"
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#228b22]">
                            <FaXTwitter size={18} />
                          </div>
                          <input
                            type="url"
                            placeholder="https://twitter.com/yourbrand"
                            value={linkTwitter}
                            onChange={(e) => setLinkTwitter(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl text-xs font-medium transition-all outline-none text-slate-800 placeholder:text-slate-400"
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#228b22]">
                            <FaTiktok size={18} />
                          </div>
                          <input
                            type="url"
                            placeholder="https://tiktok.com/@yourbrand"
                            value={linkTiktok}
                            onChange={(e) => setLinkTiktok(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl text-xs font-medium transition-all outline-none text-slate-800 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: Documents */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-extrabold text-[#228b22] flex items-center gap-2">
                        <FileText className="w-6 h-6 text-[#228b22]" />
                        Upload Identity Documents
                      </h2>
                      <p className="text-sm text-slate-500">
                        Required files based on your selection:{' '}
                        <span className="font-extrabold text-brand-600 capitalize">
                          {vendorType?.replace('_', ' ')}
                        </span>
                        .
                      </p>
                      {appStatus?.status === 'requires_resubmission' && (
                        <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                          <p className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                            <AlertCircle size={18} />
                            Action Required: Some documents need your attention
                          </p>
                          {appStatus.resubmissionNote && (
                            <p className="text-xs text-orange-600 mt-1">
                              {appStatus.resubmissionNote}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {getRequiredDocTypes().map((docType) => {
                        const docMeta = DOCUMENT_DESCRIPTIONS[docType] || {
                          label: docType,
                          desc: '',
                        };
                        const uploadedFile = documentsList.find(
                          (d) => d.documentType === docType
                        );
                        const isUploading = uploadingDocType === docType;
                        const isVerified = uploadedFile?.status === 'verified';
                        const isRejected =
                          uploadedFile?.status === 'rejected' ||
                          uploadedFile?.status === 'requires_resubmission';
                        const canReplace = !isVerified; // Verified documents cannot be replaced

                        return (
                          <div
                            key={docType}
                            id={`doc-${docType}`}
                            className={`border rounded-2xl p-5 transition-all ${
                              isVerified
                                ? 'border-green-200 bg-green-50/30'
                                : isRejected
                                  ? 'border-red-200 bg-red-50/30'
                                  : uploadedFile
                                    ? 'border-blue-200 bg-blue-50/30'
                                    : 'border-slate-100 bg-slate-50/50'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="space-y-1 max-w-xl">
                                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 flex-wrap">
                                  {docMeta.label}
                                  {uploadedFile && (
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDocumentStatusColor(uploadedFile.status)}`}
                                    >
                                      {getDocumentStatusLabel(
                                        uploadedFile.status
                                      )}
                                    </span>
                                  )}
                                </h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  {docMeta.desc}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  Accepted formats: JPG, PNG or PDF — max 5MB
                                </p>

                                {uploadedFile?.rejectionReason && (
                                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-[10px] font-semibold text-red-600 flex items-start gap-1">
                                      <AlertCircle
                                        size={12}
                                        className="mt-0.5 flex-shrink-0"
                                      />
                                      <span>
                                        Rejection reason:{' '}
                                        {uploadedFile.rejectionReason}
                                      </span>
                                    </p>
                                  </div>
                                )}

                                {uploadedFile && (
                                  <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                                      <span className="font-medium">File:</span>
                                      <button
                                        onClick={() =>
                                          handleViewDocument(uploadedFile)
                                        }
                                        className="text-[#228b22] hover:underline font-medium flex items-center gap-1"
                                      >
                                        <Eye size={12} />
                                        {uploadedFile.originalFilename}
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                                      <span>
                                        {formatBytes(
                                          uploadedFile.fileSizeBytes
                                        )}
                                      </span>
                                      {uploadedFile.uploadedAt && (
                                        <>
                                          <span className="text-slate-300">
                                            •
                                          </span>
                                          <span>
                                            Uploaded:{' '}
                                            {formatDate(
                                              uploadedFile.uploadedAt
                                            )}
                                          </span>
                                        </>
                                      )}
                                      {uploadedFile.status === 'in_review' && (
                                        <>
                                          <span className="text-slate-300">
                                            •
                                          </span>
                                          <span className="text-blue-500">
                                            Under review by admin
                                          </span>
                                        </>
                                      )}
                                      {uploadedFile.status === 'verified' && (
                                        <>
                                          <span className="text-slate-300">
                                            •
                                          </span>
                                          <span className="text-green-500">
                                            Verified
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="shrink-0 w-full md:w-auto">
                                {isUploading ? (
                                  <div className="flex items-center gap-2 px-6 py-2 bg-brand-50 text-brand-600 rounded-xl font-bold text-xs">
                                    <div className="w-3.5 h-3.5 border-2 border-brand-200 border-t-purple-600 rounded-full animate-spin" />
                                    Uploading...
                                  </div>
                                ) : uploadedFile ? (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {canReplace && (
                                      <label className="inline-flex items-center gap-2 bg-[#228b22] hover:opacity-90 text-white font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer transition-all">
                                        <UploadCloud size={14} />
                                        Replace
                                        <input
                                          type="file"
                                          className="hidden"
                                          accept=".jpg,.jpeg,.png,.pdf"
                                          onChange={(e) =>
                                            handleFileUpload(docType, e)
                                          }
                                        />
                                      </label>
                                    )}
                                    {isVerified && (
                                      <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                        <Check size={14} />
                                        Verified - Cannot be changed
                                      </div>
                                    )}
                                    {uploadedFile.status === 'pending' && (
                                      <div className="flex items-center gap-1 text-yellow-600 text-xs font-medium">
                                        <Clock size={14} />
                                        Pending review
                                      </div>
                                    )}
                                    {uploadedFile.status === 'in_review' && (
                                      <div className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                                        <Clock size={14} />
                                        Under review
                                      </div>
                                    )}
                                    {uploadedFile.status ===
                                      'requires_resubmission' && (
                                      <div className="flex items-center gap-1 text-orange-600 text-xs font-medium">
                                        <AlertCircle size={14} />
                                        Resubmit required
                                      </div>
                                    )}
                                    {uploadedFile.status === 'rejected' && (
                                      <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
                                        <X size={14} />
                                        Rejected - Please replace
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <label className="inline-flex items-center justify-center gap-2 bg-[#228b22] hover:opacity-90 text-white font-extrabold text-xs px-6 py-3 rounded-xl cursor-pointer transition-all w-full md:w-auto">
                                    <UploadCloud size={14} />
                                    Choose File
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".jpg,.jpeg,.png,.pdf"
                                      onChange={(e) =>
                                        handleFileUpload(docType, e)
                                      }
                                    />
                                  </label>
                                )}
                              </div>
                            </div>

                            {uploadedFile &&
                              uploadedFile.status !== 'verified' && (
                                <div className="mt-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteDoc(uploadedFile.id)
                                    }
                                    className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                                  >
                                    <Trash2 size={12} />
                                    Delete this document
                                  </button>
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 7: Bank Account */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-extrabold text-[#228b22] flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-[#228b22]" />
                        Add Bank Account
                      </h2>
                      <p className="text-sm text-slate-500">
                        Provide bank credentials to receive weekly sales
                        payouts.
                      </p>
                      {bankAccountsList.length >= MAX_BANK_ACCOUNTS && (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-medium flex items-center gap-2">
                          <Info size={14} />
                          Maximum of {MAX_BANK_ACCOUNTS} bank accounts linked.
                          You cannot add more.
                        </div>
                      )}
                    </div>

                    <div
                      className={`bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4 ${
                        bankAccountsList.length >= MAX_BANK_ACCOUNTS
                          ? 'opacity-50 pointer-events-none'
                          : ''
                      }`}
                    >
                      <h3 className="font-extrabold text-sm text-slate-700">
                        Link Bank Account
                      </h3>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                        <div className="relative">
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            placeholder="Search Bank..."
                            value={bankSearchText}
                            onChange={(e) => {
                              setBankSearchText(e.target.value);
                              setIsBankDropdownOpen(true);
                            }}
                            onFocus={() => setIsBankDropdownOpen(true)}
                            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 font-medium"
                            disabled={
                              bankAccountsList.length >= MAX_BANK_ACCOUNTS
                            }
                          />
                          {isBankDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
                              {NIGERIAN_BANKS.filter((b) =>
                                b.name
                                  .toLowerCase()
                                  .includes(bankSearchText.toLowerCase())
                              ).map((bank) => (
                                <button
                                  type="button"
                                  key={bank.id}
                                  onClick={() => {
                                    setBankName(bank.name);
                                    setBankCode(bank.code);
                                    setBankSearchText(bank.name);
                                    setIsBankDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs hover:bg-brand-50 text-slate-700 font-medium border-b border-slate-50 last:border-0"
                                >
                                  {bank.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Account Number
                          </label>
                          <input
                            type="text"
                            maxLength={10}
                            value={accountNumber}
                            onChange={(e) =>
                              setAccountNumber(
                                e.target.value.replace(/\D/g, '')
                              )
                            }
                            placeholder="10-digit NUBAN"
                            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 font-medium"
                            disabled={
                              bankAccountsList.length >= MAX_BANK_ACCOUNTS
                            }
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Enter exactly 10 digits
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Account Holder Name
                          </label>
                          <input
                            type="text"
                            value={accountName}
                            onChange={(e) =>
                              setAccountName(e.target.value.toUpperCase())
                            }
                            placeholder="e.g. JOHN DOE"
                            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 font-medium placeholder:text-slate-400 uppercase"
                            disabled={
                              bankAccountsList.length >= MAX_BANK_ACCOUNTS
                            }
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Enter the account holder's name
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Account Type
                          </label>
                          <StyledSelect
                            value={accountType}
                            onChange={(val: any) => setAccountType(val)}
                            options={[
                              { value: 'savings', label: 'Savings' },
                              { value: 'current', label: 'Current' },
                            ]}
                            placeholder="Select"
                            disabled={
                              bankAccountsList.length >= MAX_BANK_ACCOUNTS
                            }
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddBank}
                          disabled={
                            bankAccountsList.length >= MAX_BANK_ACCOUNTS
                          }
                          className="bg-[#228b22] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all"
                        >
                          Link Account
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-extrabold text-sm text-slate-700">
                        Linked Accounts ({bankAccountsList.length}/
                        {MAX_BANK_ACCOUNTS})
                      </h3>
                      {bankAccountsList.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          No bank accounts linked yet.
                        </p>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {bankAccountsList.map((acc) => (
                            <div
                              key={acc.id}
                              className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm flex justify-between items-start relative overflow-hidden"
                            >
                              {acc.isPrimary && (
                                <div className="absolute right-0 top-0 bg-green-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                                  Primary
                                </div>
                              )}

                              <div className="space-y-1">
                                <p className="text-xs font-extrabold text-slate-700">
                                  {acc.bankName}
                                </p>
                                <p className="text-[10px] text-slate-400 tracking-wider">
                                  Number: {acc.accountNumber}
                                </p>
                                <p className="text-xs font-bold text-slate-800">
                                  {acc.accountName}
                                </p>

                                {!acc.isPrimary && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimaryBank(acc.id)}
                                    className="text-[10px] font-bold text-brand-600 hover:text-brand-700 hover:underline mt-2 block"
                                  >
                                    Make Primary
                                  </button>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteBank(acc.id)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                title="Delete account"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 8: Review & Submit */}
                {currentStep === 8 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-extrabold text-[#228b22] flex items-center gap-2">
                        <FileCheck className="w-6 h-6 text-[#228b22]" />
                        Review & Submit
                      </h2>
                      <p className="text-sm text-slate-500">
                        Confirm and review all submitted information before
                        submitting for admin clearance.
                      </p>
                    </div>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
                      {/* Store Basics */}
                      <div className="border border-slate-100 rounded-2xl p-5 space-y-2 relative">
                        <div className="absolute right-5 top-5 flex items-center gap-1.5 text-green-600 text-xs font-bold">
                          <Check size={14} />
                          Locked
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2">
                          Store Basics
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400">Store Name:</span>
                            <p className="font-bold text-slate-700 mt-0.5 truncate">
                              {storeName}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Vendor Type:</span>
                            <p className="font-bold text-slate-700 mt-0.5 capitalize truncate">
                              {vendorType?.replace('_', ' ')}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">
                              Phone Number:
                            </span>
                            <p className="font-bold text-slate-700 mt-0.5 truncate">
                              {storePhone || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Store Email:</span>
                            <p className="font-bold text-slate-700 mt-0.5 truncate">
                              {storeEmail}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Selling Categories */}
                      <div className="border border-slate-100 rounded-2xl p-5 space-y-2 relative">
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="absolute right-5 top-5 text-xs font-extrabold text-brand-600 hover:underline"
                        >
                          Edit
                        </button>
                        <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2">
                          Selling Categories
                        </h4>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedCategories.length > 0 ? (
                            categoriesList
                              .filter((c) => selectedCategories.includes(c.id))
                              .map((c) => (
                                <span
                                  key={c.id}
                                  className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium"
                                >
                                  {c.name}
                                </span>
                              ))
                          ) : (
                            <span className="text-xs text-slate-400">
                              No categories selected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Personal Details */}
                      <div className="border border-slate-100 rounded-2xl p-5 space-y-2 relative">
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="absolute right-5 top-5 text-xs font-extrabold text-brand-600 hover:underline"
                        >
                          Edit
                        </button>
                        <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2">
                          Personal Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400">Legal Name:</span>
                            <p className="font-bold text-slate-700 mt-0.5 truncate">
                              {fullName}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">
                              Date of Birth:
                            </span>
                            <p className="font-bold text-slate-700 mt-0.5 truncate">
                              {dateOfBirth}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Gender:</span>
                            <p className="font-bold text-slate-700 mt-0.5 capitalize truncate">
                              {gender}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">
                              Current Location:
                            </span>
                            <p className="font-bold text-slate-700 mt-0.5 truncate">
                              {homeStreet}, {homeCity}, {homeState}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">NIN:</span>
                            <p className="font-bold text-slate-700 mt-0.5 text-green-600 flex items-center gap-1">
                              <Check size={12} /> Provided
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Business Registration (conditional) */}
                      {shouldShowBusinessStep && (
                        <div className="border border-slate-100 rounded-2xl p-5 space-y-2 relative">
                          <button
                            onClick={() => setCurrentStep(4)}
                            className="absolute right-5 top-5 text-xs font-extrabold text-brand-600 hover:underline"
                          >
                            Edit
                          </button>
                          <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2">
                            Business Registration
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-slate-400">
                                Business Name:
                              </span>
                              <p className="font-bold text-slate-700 mt-0.5 truncate">
                                {businessName || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400">
                                Business Type:
                              </span>
                              <p className="font-bold text-slate-700 mt-0.5 capitalize truncate">
                                {businessType?.replace('_', ' ') ||
                                  'Not provided'}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400">
                                CAC Number:
                              </span>
                              <p className="font-bold text-slate-700 mt-0.5 truncate">
                                {cacNumber || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400">
                                TIN Number:
                              </span>
                              <p className="font-bold text-slate-700 mt-0.5 truncate">
                                {tinNumber || 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Description & Address */}
                      <div className="border border-slate-100 rounded-2xl p-5 space-y-2 relative">
                        <button
                          onClick={() => setCurrentStep(5)}
                          className="absolute right-5 top-5 text-xs font-extrabold text-brand-600 hover:underline"
                        >
                          Edit
                        </button>
                        <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2">
                          Description & Address
                        </h4>
                        <div className="max-w-full">
                          <p className="text-xs text-slate-600 leading-relaxed font-medium break-words whitespace-pre-wrap">
                            {storeDescription}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 truncate">
                          Business Address: {busStreet}, {busCity}, {busState}
                        </p>
                      </div>

                      {/* Documents Checklist */}
                      <div className="border border-slate-100 rounded-2xl p-5 space-y-2 relative">
                        <button
                          onClick={() => setCurrentStep(6)}
                          className="absolute right-5 top-5 text-xs font-extrabold text-brand-600 hover:underline"
                        >
                          Edit
                        </button>
                        <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2">
                          Uploaded Documents Checklist
                        </h4>
                        <div className="space-y-1.5 pt-2">
                          {getRequiredDocTypes().map((type) => {
                            const doc = documentsList.find(
                              (d) => d.documentType === type
                            );
                            return (
                              <div
                                key={type}
                                className="flex flex-wrap items-center justify-between gap-2 text-xs"
                              >
                                <span className="text-slate-600 truncate">
                                  {DOCUMENT_DESCRIPTIONS[type]?.label || type}
                                </span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {doc ? (
                                    <>
                                      <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDocumentStatusColor(doc.status)}`}
                                      >
                                        {getDocumentStatusLabel(doc.status)}
                                      </span>
                                      {doc.rejectionReason && (
                                        <span
                                          className="text-red-500 text-[10px]"
                                          title={doc.rejectionReason}
                                        >
                                          <AlertCircle size={12} />
                                        </span>
                                      )}
                                      <button
                                        onClick={() => handleViewDocument(doc)}
                                        className="text-[#228b22] hover:underline"
                                      >
                                        <Eye size={12} />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-red-500 font-bold">
                                      Missing
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Linked Accounts */}
                      <div className="border border-slate-100 rounded-2xl p-5 space-y-2 relative">
                        <button
                          onClick={() => setCurrentStep(7)}
                          className="absolute right-5 top-5 text-xs font-extrabold text-brand-600 hover:underline"
                        >
                          Edit
                        </button>
                        <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2">
                          Linked Accounts
                        </h4>
                        <div className="space-y-2 pt-2">
                          {bankAccountsList.length > 0 ? (
                            bankAccountsList.map((acc) => (
                              <div
                                key={acc.id}
                                className="flex flex-wrap justify-between items-center text-xs"
                              >
                                <div>
                                  <p className="font-bold text-slate-700 truncate">
                                    {acc.bankName} ({acc.accountType})
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {acc.accountName} • {acc.accountNumber}
                                  </p>
                                </div>
                                {acc.isPrimary && (
                                  <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[9px] font-bold flex-shrink-0">
                                    Primary
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic">
                              No bank accounts linked
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={confirmAccurate}
                          onChange={(e) => setConfirmAccurate(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-[#228b22] focus:ring-brand-500"
                        />
                        <span className="text-xs font-semibold text-slate-600 leading-normal">
                          I confirm that all information provided is accurate
                          and corresponds to legal registration records.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={confirmTerms}
                          onChange={(e) => setConfirmTerms(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-[#228b22] focus:ring-brand-500"
                        />
                        <span className="text-xs font-semibold text-slate-600 leading-normal">
                          I agree to EkivaMart's Vendor Terms and Commission
                          Structure.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-8">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentStep === 5 && !shouldShowBusinessStep) {
                          setCurrentStep(3);
                        } else {
                          setCurrentStep((prev) => prev - 1);
                        }
                      }}
                      className="inline-flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-600 px-6 py-3 rounded-xl text-sm font-bold transition-all h-[52px]"
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                  ) : (
                    <div className="w-[100px] lg:w-[120px]" />
                  )}

                  {currentStep < 8 ? (
                    <button
                      type="button"
                      onClick={() => handleSaveStep(currentStep)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#228b22] to-[#1c711c] hover:opacity-90 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98] h-[52px] ml-4 lg:ml-0"
                    >
                      {getButtonText(currentStep)}
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        !confirmAccurate ||
                        !confirmTerms ||
                        submittingApplication
                      }
                      onClick={handleSubmitAll}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#228b22] to-[#1c711c] hover:opacity-90 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed h-[52px] ml-4 lg:ml-0"
                    >
                      {submittingApplication
                        ? 'Submitting Application...'
                        : 'Submit Application'}
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Confirm Vendor Type Modal */}
      <AnimatePresence>
        {showConfirmTypeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex gap-3 text-amber-600">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">
                    Confirm Vendor Type Selection
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    You have selected{' '}
                    <span className="font-extrabold text-brand-600 capitalize">
                      {(vendorType || '').replace('_', ' ')}
                    </span>
                    .
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                Once initialized, your Vendor Type selection cannot be changed.
                This choice directly affects the required documentation (Step 6)
                and business data required to submit. Please confirm you wish to
                proceed.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmTypeModal(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProceedStep1}
                  className="px-6 py-2.5 bg-[#228b22] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NIN Change Modal */}
      <AnimatePresence>
        {showNinModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex gap-3 text-brand-600">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">
                    Update NIN
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Enter your new National Identification Number (NIN).
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  NIN
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={nin}
                  onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                  placeholder="11-digit NIN"
                  className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#228b22] focus:ring-2 focus:ring-brand-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Must be exactly 11 digits
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNinModal(false);
                    setNin('');
                  }}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNinModalSubmit}
                  className="px-6 py-2.5 bg-[#228b22] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Update NIN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document View Modal */}
      <AnimatePresence>
        {showDocumentModal && selectedDocument && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                    {selectedDocument.originalFilename}
                    {getDocumentStatusIcon(selectedDocument.status)}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {DOCUMENT_DESCRIPTIONS[selectedDocument.documentType]
                      ?.label || selectedDocument.documentType}
                  </p>
                </div>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Document Info */}
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/50 flex-shrink-0">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${getDocumentStatusColor(selectedDocument.status)}`}
                >
                  {getDocumentStatusLabel(selectedDocument.status)}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <FileText size={12} />
                  {formatBytes(selectedDocument.fileSizeBytes)}
                </span>
                {selectedDocument.uploadedAt && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    Uploaded: {formatDate(selectedDocument.uploadedAt)}
                  </span>
                )}
                {selectedDocument.status === 'rejected' &&
                  selectedDocument.rejectionReason && (
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Rejected
                    </span>
                  )}
              </div>

              {/* Rejection Reason */}
              {selectedDocument.rejectionReason && (
                <div className="p-4 bg-red-50 border-b border-red-100 flex-shrink-0">
                  <p className="text-xs font-semibold text-red-600 flex items-start gap-2">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>
                      Rejection reason: {selectedDocument.rejectionReason}
                    </span>
                  </p>
                </div>
              )}

              {/* Document Preview */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 min-h-[400px] flex items-center justify-center">
                {selectedDocument.mimeType?.startsWith('image/') ? (
                  // Image preview
                  <img
                    src={selectedDocument.documentUrl}
                    alt={selectedDocument.originalFilename}
                    className="max-w-full max-h-[600px] object-contain rounded-lg shadow-sm"
                  />
                ) : selectedDocument.mimeType === 'application/pdf' ? (
                  // PDF preview
                  <div className="w-full h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
                    <object
                      data={selectedDocument.documentUrl}
                      type="application/pdf"
                      className="w-full h-full"
                      aria-label={selectedDocument.originalFilename}
                    >
                      {/* Fallback for browsers that can't render PDF */}
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
                        <FileText
                          size={64}
                          className="text-slate-400 mx-auto mb-4"
                        />
                        <p className="text-sm text-slate-600 font-medium">
                          {selectedDocument.originalFilename}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          PDF Document •{' '}
                          {formatBytes(selectedDocument.fileSizeBytes)}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          Your browser cannot display this PDF inline.
                        </p>
                        <a
                          href={selectedDocument.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 bg-[#228b22] hover:opacity-90 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                        >
                          <Eye size={16} />
                          View PDF
                        </a>
                      </div>
                    </object>
                  </div>
                ) : (
                  // Other file types (shouldn't happen since we only accept images and PDFs)
                  <div className="text-center p-8 w-full max-w-md">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <FileText size={48} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      {selectedDocument.originalFilename}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedDocument.mimeType || 'Unknown file type'} •{' '}
                      {formatBytes(selectedDocument.fileSizeBytes)}
                    </p>
                    <a
                      href={selectedDocument.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 bg-[#228b22] hover:opacity-90 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                    >
                      <Eye size={16} />
                      View File
                    </a>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                {selectedDocument.status !== 'verified' && (
                  <button
                    onClick={() => {
                      setShowDocumentModal(false);
                      setTimeout(() => {
                        const docElement = document.getElementById(
                          `doc-${selectedDocument.documentType}`
                        );
                        if (docElement) {
                          docElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          });
                        }
                      }, 300);
                    }}
                    className="px-4 py-2 border border-[#228b22] text-[#228b22] hover:bg-brand-50 rounded-xl text-xs font-bold transition-all"
                  >
                    Replace Document
                  </button>
                )}
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="px-6 py-2.5 bg-[#228b22] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear All Modal - Dev Mode */}
      <AnimatePresence>
        {showClearAllModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex gap-3 text-red-600">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">
                    Clear All Data
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    This will permanently delete all vendor application data and
                    allow you to start fresh. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-red-50 rounded-xl border border-red-100 text-xs text-red-600 leading-relaxed">
                <strong>Warning:</strong> All progress will be lost. You'll need
                to start the application from the beginning.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearAllModal(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Clear All Data
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 lg:px-6 mt-6 pt-4 border-t border-slate-200">
        <p className="text-center text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} EkivaMart Group. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
