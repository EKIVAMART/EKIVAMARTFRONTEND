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
  ChevronDown
} from 'lucide-react';
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
  SocialLinks
} from '@/lib/api-vendor';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';

import 'react-phone-number-input/style.css';

// Constants
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe', 
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 
  'Taraba', 'Yobe', 'Zamfara'
];

const MAX_BANK_ACCOUNTS = 2;

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
  { name: 'PremiumTrust Bank', code: '105', id: 'premiumtrust-105' }
];

const VENDOR_TYPES = [
  { value: 'individual', label: 'Individual Seller', desc: 'A single person selling from home' },
  { value: 'registered_business', label: 'Registered Business', desc: 'A formally registered corporate entity in Nigeria' },
  { value: 'brand', label: 'Brand / Manufacturer', desc: 'An official original brand owner or manufacturer' },
  { value: 'reseller', label: 'Authorized Reseller', desc: 'An authorized vendor reselling third-party branded products' },
  { value: 'dropshipper', label: 'Dropshipper', desc: 'Sells directly to buyers without maintaining physical inventory' }
];

const BUSINESS_TYPES = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'private_limited', label: 'Private Limited (LTD)' },
  { value: 'public_limited', label: 'Public Limited (PLC)' }
];

const DOCUMENT_DESCRIPTIONS: Record<string, { label: string; desc: string }> = {
  government_id: { label: 'Government ID Card', desc: 'National ID card (NIN Slip), Voter Card, International Passport, or Drivers License.' },
  id_selfie: { label: 'Selfie holding ID Card', desc: 'Clear portrait photo of yourself holding the ID submitted above next to your face.' },
  proof_of_address: { label: 'Proof of Home Address', desc: 'Utility bill (electricity, water) or bank statement not older than 3 months.' },
  cac_certificate: { label: 'CAC Certificate', desc: 'Official CAC corporate registration certificate (Form CAC 1.1 / CAC 2).' },
  tin_certificate: { label: 'TIN Certificate', desc: 'FIRS Tax Identification Number registration certificate or tax receipt.' },
  brand_auth_letter: { label: 'Brand Authorization Letter', desc: 'Official trademark ownership certificate or authorization letter from the brand.' }
};

export default function VendorApplyPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [highestStepAllowed, setHighestStepAllowed] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  const [baselineDraft, setBaselineDraft] = useState<VendorApplicationDraft | null>(null);
  const [appStatus, setAppStatus] = useState<VendorApplicationStatus | null>(null);

  // Form states per step
  const [storeName, setStoreName] = useState('');
  const [vendorType, setVendorType] = useState<'individual' | 'registered_business' | 'brand' | 'reseller' | 'dropshipper' | ''>('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeNameStatus, setStoreNameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const storeNameTimeout = useRef<NodeJS.Timeout | null>(null);

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [homeStreet, setHomeStreet] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [homeState, setHomeState] = useState('');
  const [homeLga, setHomeLga] = useState('');
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [dateOfIncorporation, setDateOfIncorporation] = useState('');

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

  const [documentsList, setDocumentsList] = useState<VendorDocument[]>([]);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  // Bank account fields
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountType, setAccountType] = useState<'savings' | 'current'>('savings');
  const [bankSearchText, setBankSearchText] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankAccountsList, setBankAccountsList] = useState<VendorBankAccount[]>([]);

  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);

  const [showConfirmTypeModal, setShowConfirmTypeModal] = useState(false);

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
        const statusRes = await vendorApi.getApplicationStatus();
        if (statusRes.success && statusRes.data) {
          const app = statusRes.data;
          setAppStatus(app);

          if (app.status !== 'draft' && app.status !== 'requires_resubmission') {
            router.push('/vendor/application/status');
            return;
          }

          const draftRes = await vendorApi.getApplicationDraft();
          if (draftRes.success && draftRes.data) {
            const draft = draftRes.data;
            setBaselineDraft(draft);

            setStoreName(draft.storeName || '');
            setVendorType(draft.vendorType || '');
            
            let profileEmail = user?.email || '';
            let profilePhone = user?.phoneNumber || '';
            try {
              const profileRes = await authApi.getProfile();
              if (profileRes && profileRes.success && profileRes.data) {
                profileEmail = profileRes.data.email || profileEmail;
                profilePhone = profileRes.data.phoneNumber || profilePhone;
              }
            } catch (profileErr) {
              console.error('Failed to get profile for prepopulation:', profileErr);
            }
            setStoreEmail(draft.storeEmail || profileEmail);
            setStorePhone(draft.storePhone || profilePhone);

            if (draft.personalInfo) {
              setFullName(draft.personalInfo.fullName || '');
              setDateOfBirth(draft.personalInfo.dateOfBirth || '');
              setGender(draft.personalInfo.gender || '');
              setHomeStreet(draft.personalInfo.homeAddress?.street || '');
              setHomeCity(draft.personalInfo.homeAddress?.city || '');
              setHomeState(draft.personalInfo.homeAddress?.state || '');
              setHomeLga(draft.personalInfo.homeAddress?.lga || '');
              setBvn(draft.personalInfo.bvn || '');
              setNin(draft.personalInfo.nin || '');
            }

            if (draft.businessInfo) {
              setBusinessName(draft.businessInfo.businessName || '');
              setBusinessType(draft.businessInfo.businessType || '');
              setCacNumber(draft.businessInfo.cacNumber || '');
              setTinNumber(draft.businessInfo.tinNumber || '');
              setVatNumber(draft.businessInfo.vatNumber || '');
              setDateOfIncorporation(draft.businessInfo.dateOfIncorporation || '');
            }

            if (draft.storeInfo) {
              setStoreDescription(draft.storeInfo.storeDescription || '');
              setYearsInBusiness(draft.storeInfo.yearsInBusiness || '');
              setBusStreet(draft.storeInfo.businessAddress?.street || '');
              setBusCity(draft.storeInfo.businessAddress?.city || '');
              setBusState(draft.storeInfo.businessAddress?.state || '');
              setBusLga(draft.storeInfo.businessAddress?.lga || '');
              setBusPostal(draft.storeInfo.businessAddress?.postalCode || '');
              setLinkInstagram(draft.storeInfo.socialLinks?.instagram || '');
              setLinkFacebook(draft.storeInfo.socialLinks?.facebook || '');
              setLinkTwitter(draft.storeInfo.socialLinks?.twitter || '');
              setLinkTiktok(draft.storeInfo.socialLinks?.tiktok || '');
            }

            setDocumentsList(draft.documents || []);
            setBankAccountsList(draft.bankAccounts || []);

            const completed = new Set<number>();
            if (draft.storeName && draft.vendorType) completed.add(1);
            if (draft.personalInfo?.fullName) completed.add(2);
            if (draft.businessInfo?.businessName) completed.add(3);
            if (draft.storeInfo?.storeDescription) completed.add(4);
            if (draft.documents && draft.documents.length > 0) completed.add(5);
            if (draft.bankAccounts && draft.bankAccounts.length > 0) completed.add(6);
            setCompletedSteps(completed);

            let initialStep = 1;
            if (!draft.storeName || !draft.vendorType) {
              initialStep = 1;
            } else if (!draft.personalInfo?.fullName) {
              initialStep = 2;
            } else if (!draft.businessInfo?.businessName) {
              initialStep = 3;
            } else if (!draft.storeInfo?.storeDescription) {
              initialStep = 4;
            } else if (draft.documents?.length === 0) {
              initialStep = 5;
            } else if (draft.bankAccounts?.length === 0) {
              initialStep = 6;
            } else {
              initialStep = 7;
            }
            setCurrentStep(initialStep);
            setHighestStepAllowed(initialStep);
          }
        }
      } catch (err) {
        console.error('Failed to fetch vendor draft data:', err);
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
      const isTaken = storeName.toLowerCase().includes('taken');
      setStoreNameStatus(isTaken ? 'taken' : 'available');
    }, 500);

    return () => {
      if (storeNameTimeout.current) clearTimeout(storeNameTimeout.current);
    };
  }, [storeName, baselineDraft]);

  const hasStepChanges = (stepNum: number): boolean => {
    if (!baselineDraft) return true;
    switch (stepNum) {
      case 1:
        return storeName !== (baselineDraft.storeName || '') || 
               vendorType !== (baselineDraft.vendorType || '') || 
               storePhone !== (baselineDraft.storePhone || '') ||
               storeEmail !== (baselineDraft.storeEmail || '');
      case 2:
        const pInfo = baselineDraft.personalInfo;
        return fullName !== (pInfo?.fullName || '') ||
               dateOfBirth !== (pInfo?.dateOfBirth || '') ||
               gender !== (pInfo?.gender || '') ||
               homeStreet !== (pInfo?.homeAddress?.street || '') ||
               homeCity !== (pInfo?.homeAddress?.city || '') ||
               homeState !== (pInfo?.homeAddress?.state || '') ||
               homeLga !== (pInfo?.homeAddress?.lga || '') ||
               bvn !== (pInfo?.bvn || '') ||
               nin !== (pInfo?.nin || '');
      case 3:
        const bInfo = baselineDraft.businessInfo;
        return businessName !== (bInfo?.businessName || '') ||
               businessType !== (bInfo?.businessType || '') ||
               cacNumber !== (bInfo?.cacNumber || '') ||
               tinNumber !== (bInfo?.tinNumber || '') ||
               vatNumber !== (bInfo?.vatNumber || '') ||
               dateOfIncorporation !== (bInfo?.dateOfIncorporation || '');
      case 4:
        const sInfo = baselineDraft.storeInfo;
        return storeDescription !== (sInfo?.storeDescription || '') ||
               yearsInBusiness !== (sInfo?.yearsInBusiness || '') ||
               busStreet !== (sInfo?.businessAddress?.street || '') ||
               busCity !== (sInfo?.businessAddress?.city || '') ||
               busState !== (sInfo?.businessAddress?.state || '') ||
               busLga !== (sInfo?.businessAddress?.lga || '') ||
               busPostal !== (sInfo?.businessAddress?.postalCode || '') ||
               linkInstagram !== (sInfo?.socialLinks?.instagram || '') ||
               linkFacebook !== (sInfo?.socialLinks?.facebook || '') ||
               linkTwitter !== (sInfo?.socialLinks?.twitter || '') ||
               linkTiktok !== (sInfo?.socialLinks?.tiktok || '');
      case 6:
        const currentBankAccounts = bankAccountsList;
        const baselineBankAccounts = baselineDraft.bankAccounts || [];
        if (currentBankAccounts.length !== baselineBankAccounts.length) return true;
        for (let i = 0; i < currentBankAccounts.length; i++) {
          if (currentBankAccounts[i].accountNumber !== baselineBankAccounts[i]?.accountNumber) return true;
        }
        return false;
      default:
        return false;
    }
  };

  const markStepCompleted = (stepNum: number) => {
    setCompletedSteps(prev => new Set([...prev, stepNum]));
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
        if (storePhone && !isValidPhoneNumber(storePhone)) {
          toast.error('Please enter a valid store phone number');
          return;
        }

        if (!baselineDraft || !baselineDraft.vendorType) {
          setShowConfirmTypeModal(true);
          return;
        }

        const res = await vendorApi.startApplication({
          storeName,
          vendorType,
          storePhone,
          storeEmail,
        });

        if (res.success) {
          toast.success('Store basics saved successfully');
          const draftRes = await vendorApi.getApplicationDraft();
          if (draftRes.success) setBaselineDraft(draftRes.data);
          markStepCompleted(1);
          setCurrentStep(2);
        }
      }

      if (stepNum === 2) {
        if (!fullName || !dateOfBirth || !gender || !homeStreet || !homeCity || !homeState || !homeLga) {
          toast.error('Please fill in all required fields');
          return;
        }
        if (bvn && bvn.length !== 11) {
          toast.error('BVN must be exactly 11 digits');
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
          
          await vendorApi.savePersonalInfo({
            fullName,
            dateOfBirth,
            gender,
            homeAddress: { street: homeStreet, city: homeCity, state: homeState, lga: homeLga },
            bvn: bvn || '', // Always provide a string, empty string if not provided
            nin: nin || undefined
          });
          
          toast.success('Personal information updated!', { id: 'save-step' });
        }

        markStepCompleted(2);
        setCurrentStep(3);
      }

      if (stepNum === 3) {
        const isBusinessRequired = vendorType === 'registered_business' || vendorType === 'brand';
        
        if (isBusinessRequired) {
          if (!businessName || !businessType || !cacNumber || !tinNumber) {
            toast.error('Please fill in all required business fields');
            return;
          }
        }

        if (hasChanges) {
          toast.loading('Saving business details...', { id: 'save-step' });
          
          const businessData = {
            businessName: businessName || '',
            businessType: businessType || '',
            cacNumber: cacNumber || '',
            tinNumber: tinNumber || '',
            vatNumber: vatNumber || undefined,
            dateOfIncorporation: dateOfIncorporation || undefined
          };

          await vendorApi.saveBusinessInfo(businessData);

          toast.success('Business info updated!', { id: 'save-step' });
        }

        markStepCompleted(3);
        setCurrentStep(4);
      }

      if (stepNum === 4) {
        if (storeDescription.length < 100) {
          toast.error('Store description must be at least 100 characters');
          return;
        }
        if (!yearsInBusiness || !busStreet || !busCity || !busState || !busLga) {
          toast.error('Please fill in all required store fields');
          return;
        }

        if (hasChanges) {
          toast.loading('Saving store details...', { id: 'save-step' });
          
          await vendorApi.saveStoreInfo({
            storeDescription,
            yearsInBusiness,
            businessAddress: { street: busStreet, city: busCity, state: busState, lga: busLga, postalCode: busPostal || undefined },
            socialLinks: { instagram: linkInstagram || null, facebook: linkFacebook || null, twitter: linkTwitter || null, tiktok: linkTiktok || null }
          });

          toast.success('Store details updated!', { id: 'save-step' });
        }

        markStepCompleted(4);
        setCurrentStep(5);
      }

      if (stepNum === 5) {
        const reqSlots = getRequiredDocTypes();
        const missing = reqSlots.filter(slot => !documentsList.some(doc => doc.documentType === slot));
        if (missing.length > 0) {
          toast.error(`Please upload all required files to continue`);
          return;
        }
        markStepCompleted(5);
        setCurrentStep(6);
      }

      if (stepNum === 6) {
        if (bankAccountsList.length === 0) {
          toast.error('Please add at least one bank account to continue');
          return;
        }
        markStepCompleted(6);
        setCurrentStep(7);
      }

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
      const res = await vendorApi.startApplication({
        storeName,
        vendorType: vendorType as any,
        storePhone,
        storeEmail,
      });
      if (res.success) {
        toast.success('Vendor profile created!', { id: 'start-app' });
        const draftRes = await vendorApi.getApplicationDraft();
        if (draftRes.success) setBaselineDraft(draftRes.data);
        markStepCompleted(1);
        setCurrentStep(2);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to start application', { id: 'start-app' });
    }
  };

  const getRequiredDocTypes = (): string[] => {
    if (vendorType === 'brand') {
      return ['government_id', 'id_selfie', 'proof_of_address', 'cac_certificate', 'tin_certificate', 'brand_auth_letter'];
    }
    if (vendorType === 'registered_business') {
      return ['government_id', 'id_selfie', 'proof_of_address', 'cac_certificate', 'tin_certificate'];
    }
    return ['government_id', 'id_selfie', 'proof_of_address'];
  };

  const handleFileUpload = async (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5242880) {
      toast.error('File size cannot exceed 5MB');
      return;
    }

    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Unsupported file format. JPG, PNG or PDF only.');
      return;
    }

    setUploadingDocType(docType);
    try {
      const signedRes = await vendorApi.getDocumentUploadUrl({
        documentType: docType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      if (signedRes.success) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        const confirmRes = await vendorApi.confirmDocumentUpload({
          documentType: docType,
          cloudinaryPublicId: signedRes.data.publicId,
          documentUrl: `https://res.cloudinary.com/faflora/image/upload/v1234567890/${signedRes.data.publicId}`,
          originalFilename: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type,
        });

        if (confirmRes.success && confirmRes.data) {
          setDocumentsList(prev => {
            const updated = prev.filter(d => d.documentType !== docType);
            return [...updated, confirmRes.data!];
          });
          toast.success(`${DOCUMENT_DESCRIPTIONS[docType]?.label || docType} uploaded successfully!`);
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
        setDocumentsList(prev => prev.filter(d => d.id !== docId));
        toast.success('Document deleted');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete document');
    }
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
        setBankAccountsList(prev => [...prev, res.data!]);
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
        setBankAccountsList(prev => prev.filter(a => a.id !== bankId));
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
        setBankAccountsList(prev => prev.map(a => ({ ...a, isPrimary: a.id === bankId })));
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

  // Custom StyledSelect component with proper focus/active states
  const StyledSelect = ({ 
    value, 
    onChange, 
    options, 
    placeholder, 
    className = '',
    disabled = false
  }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setIsFocused(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
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
                ? 'bg-white border-[#9d4ae3] ring-2 ring-purple-500/10'
                : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={selectedOption && !disabled ? 'text-slate-800' : disabled ? 'text-slate-500' : 'text-slate-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen && !disabled ? 'rotate-180' : ''}`} />
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
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors ${
                  value === option.value ? 'bg-purple-50 text-[#9d4ae3] font-bold' : 'text-slate-700'
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
          <div className="w-12 h-12 border-4 border-purple-200 border-t-[#9d4ae3] rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-bold">Verifying authentication & loading application state...</p>
        </div>
      </div>
    );
  }

  const stepTitles = [
    'Store Basics',
    'Personal Info',
    'Business Info',
    'Store Details',
    'Documents',
    'Bank Account',
    'Review'
  ];

  // Get button text based on step completion and changes
  const getButtonText = (stepNum: number): string => {
    const isCompleted = isStepCompleted(stepNum);
    const hasChanges = hasStepChanges(stepNum);
    
    if (isCompleted && !hasChanges) {
      return 'Continue';
    }
    return 'Save & Continue';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-8 font-sans">
      
      <header className="bg-white border-b border-slate-100 py-4 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/fa_logo_brand.png"
              alt="Faflora Logo"
              width={110}
              height={36}
              className="h-8 w-auto object-contain"
            />
            <div className="w-px h-5 bg-slate-200" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Vendor Portal</span>
          </div>
          <Link href="/become-a-vendor" className="text-xs font-bold text-slate-500 hover:text-[#9d4ae3] transition-colors">
            Exit Application
          </Link>
        </div>
      </header>

      {/* Mobile Stepper */}
      <div className="lg:hidden max-w-4xl mx-auto px-4 mb-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[600px] relative">
            {/* Horizontal line connecting steps */}
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 z-10" />
            {stepTitles.map((title, idx) => {
              const stepIndex = idx + 1;
              const isCompleted = isStepCompleted(stepIndex);
              const isActive = isStepActive(stepIndex);
              const isClickable = isStepClickable(stepIndex);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!isClickable}
                  onClick={() => {
                    if (isClickable) setCurrentStep(stepIndex);
                  }}
                  className={`flex flex-col items-center gap-1.5 flex-1 relative z-10 transition-all ${
                    isClickable ? 'cursor-pointer hover:opacity-80' : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted ? 'bg-[#9d4ae3] border-[#9d4ae3] text-white'
                    : isActive ? 'bg-[#f3ecfc] border-[#9d4ae3] text-[#9d4ae3] ring-2 ring-purple-100'
                    : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span>{stepIndex}</span>}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider text-center ${
                    isActive || isCompleted ? 'text-[#9d4ae3]' : 'text-slate-400'
                  }`}>{title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 lg:flex lg:gap-8 lg:items-start">
        
        {/* Sidebar */}
        <div className="hidden lg:block w-64 shrink-0 sticky top-8">
          <div className="bg-gradient-to-br from-purple-900 to-[#8236be] text-white rounded-2xl p-5 shadow-lg mb-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-[#00bca6]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm">Vendor Application</h3>
                <p className="text-[10px] text-purple-200">Progress saved automatically</p>
              </div>
            </div>
            <p className="text-[11px] text-purple-100 leading-relaxed">
              Typically takes 5–10 minutes. You may return to continue at any step.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {stepTitles.map((title, idx) => {
              const stepIndex = idx + 1;
              const isCompleted = isStepCompleted(stepIndex);
              const isActive = isStepActive(stepIndex);
              const isClickable = isStepClickable(stepIndex);
              
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!isClickable}
                  onClick={() => {
                    if (isClickable) setCurrentStep(stepIndex);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-slate-50 last:border-0 ${
                    isActive
                      ? 'bg-purple-50'
                      : isClickable
                        ? 'hover:bg-slate-50 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-[11px] shrink-0 transition-all ${
                    isCompleted ? 'bg-[#9d4ae3] border-[#9d4ae3] text-white'
                    : isActive ? 'bg-[#f3ecfc] border-[#9d4ae3] text-[#9d4ae3]'
                    : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : stepIndex}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${
                      isActive ? 'text-[#9d4ae3]' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                    }`}>{title}</p>
                    {isCompleted && <p className="text-[9px] text-green-500 uppercase font-black">Complete</p>}
                    {!isCompleted && !isActive && isClickable && <p className="text-[9px] text-slate-400 uppercase font-black">Pending</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">

        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          
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
                        <h2 className="text-2xl font-black text-[#9d4ae3] flex items-center gap-2">
                          <Store className="w-6 h-6 text-[#9d4ae3]" />
                          Store Basics
                        </h2>
                        <p className="text-sm text-slate-500">Provide the basic identifying elements of your digital storefront.</p>
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
                        <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
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
                              : 'bg-white border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 text-slate-800'
                          }`}
                        />
                        {!isStep1Completed && storeNameStatus === 'checking' && (
                          <div className="absolute right-3.5 top-3.5 w-4.5 h-4.5 border-2 border-purple-200 border-t-[#9d4ae3] rounded-full animate-spin" />
                        )}
                        {!isStep1Completed && storeNameStatus === 'available' && (
                          <CheckCircle2 className="absolute right-3.5 top-3.5 w-5 h-5 text-green-500" />
                        )}
                        {!isStep1Completed && storeNameStatus === 'taken' && (
                          <X className="absolute right-3.5 top-3.5 w-5 h-5 text-red-500" />
                        )}
                        {isStep1Completed && (
                          <CheckCircle2 className="absolute right-3.5 top-3.5 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {!isStep1Completed && storeNameStatus === 'taken' && (
                        <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 font-semibold">
                          Store name is already in use
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">Between 3 and 100 characters. Letters, numbers and spaces allowed.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                        Vendor Type
                        <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                      </label>
                      <StyledSelect
                        value={vendorType}
                        onChange={(val: any) => setVendorType(val)}
                        options={VENDOR_TYPES.map(t => ({ value: t.value, label: t.label }))}
                        placeholder="Select Vendor Type"
                        disabled={isStep1Completed}
                      />
                      {vendorType && (
                        <p className="text-xs text-[#9d4ae3] mt-1.5 font-bold">
                          {VENDOR_TYPES.find(t => t.value === vendorType)?.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                        Store Phone Number
                        <span className="text-slate-400 ml-1 text-[10px] font-normal">(Optional)</span>
                      </label>
                      <PhoneInput
                        value={storePhone}
                        onChange={(val) => setStorePhone(val || '')}
                        defaultCountry="NG"
                        international
                        countryCallingCodeEditable={false}
                        placeholder="Enter phone number"
                        disabled={isStep1Completed}
                        className={`phone-number-input rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 font-medium ${
                          isStep1Completed
                            ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-white border-slate-200 focus-within:ring-2 focus-within:ring-purple-500/10 focus-within:border-[#9d4ae3] text-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                        Store Contact Email
                        <span className="text-slate-400 ml-1.5 text-[10px] font-normal">(Read-only)</span>
                      </label>
                      <input
                        type="email"
                        readOnly
                        value={storeEmail}
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-500 rounded-xl px-4 py-3 text-sm outline-none cursor-not-allowed font-medium"
                      />
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">Linked to your main authenticated Faflora account.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Personal Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-[#9d4ae3] flex items-center gap-2">
                      <User className="w-6 h-6 text-[#9d4ae3]" />
                      Personal Information
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Provide legal identification details to confirm owner registration.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                        Full Legal Name
                        <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Chisom Ada Okafor"
                        className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Must match the legal name on bank account & government ID.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                          Date of Birth
                          <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                          Gender
                          <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                        </label>
                        <StyledSelect
                          value={gender}
                          onChange={(val: any) => setGender(val)}
                          options={[
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' }
                          ]}
                          placeholder="Select"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-extrabold text-sm text-purple-800 border-b border-slate-100 pb-2">Home Address</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                          Street Address
                          <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={homeStreet}
                          onChange={(e) => setHomeStreet(e.target.value)}
                          placeholder="12 Bode Thomas Street"
                          className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            City
                            <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={homeCity}
                            onChange={(e) => setHomeCity(e.target.value)}
                            placeholder="Surulere"
                            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            State
                            <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                          </label>
                          <StyledSelect
                            value={homeState}
                            onChange={(val: any) => setHomeState(val)}
                            options={NIGERIAN_STATES.map(s => ({ value: s, label: s }))}
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            LGA
                            <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={homeLga}
                            onChange={(e) => setHomeLga(e.target.value)}
                            placeholder="Surulere"
                            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-2 py-3 text-xs transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 flex items-center">Bank Verification Number (BVN)</label>
                        <div className="group relative">
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            Your BVN is used for identity verification only and is never stored.
                          </div>
                        </div>
                      </div>
                      <input
                        type="text"
                        maxLength={11}
                        value={bvn}
                        onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                        placeholder="11-digit BVN"
                        className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Enter exactly 11 digits</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">NIN (Optional)</label>
                      <input
                        type="text"
                        maxLength={11}
                        value={nin}
                        onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                        placeholder="11-digit NIN"
                        className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Optional - enter exactly 11 digits</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Business Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-[#9d4ae3] flex items-center gap-2">
                      <Building className="w-6 h-6 text-[#9d4ae3]" />
                      Business Information
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                      {vendorType === 'registered_business' || vendorType === 'brand' 
                        ? 'Provide official CAC corporate registration data for your entity.'
                        : 'Business information is optional for individual sellers, resellers, and dropshippers.'}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                        Registered Business Name
                        {(vendorType === 'registered_business' || vendorType === 'brand') && (
                          <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required={vendorType === 'registered_business' || vendorType === 'brand'}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Chisom Flowers Limited"
                        className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                      />
                      {(vendorType !== 'registered_business' && vendorType !== 'brand') && (
                        <p className="text-[10px] text-slate-400 mt-1">Optional for your vendor type</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                        Business Type
                        {(vendorType === 'registered_business' || vendorType === 'brand') && (
                          <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                        )}
                      </label>
                      <StyledSelect
                        value={businessType}
                        onChange={(val: any) => setBusinessType(val)}
                        options={BUSINESS_TYPES.map(b => ({ value: b.value, label: b.label }))}
                        placeholder="Select Business Type"
                      />
                      {(vendorType !== 'registered_business' && vendorType !== 'brand') && (
                        <p className="text-[10px] text-slate-400 mt-1">Optional for your vendor type</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                        CAC Registration Number
                        {(vendorType === 'registered_business' || vendorType === 'brand') && (
                          <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required={vendorType === 'registered_business' || vendorType === 'brand'}
                        value={cacNumber}
                        onChange={(e) => setCacNumber(e.target.value)}
                        placeholder="e.g. RC1234567"
                        className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                      />
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">Must start with RC or BN.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                        Tax Identification Number (TIN)
                        {(vendorType === 'registered_business' || vendorType === 'brand') && (
                          <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required={vendorType === 'registered_business' || vendorType === 'brand'}
                        maxLength={13}
                        value={tinNumber}
                        onChange={(e) => setTinNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="8-13 digit TIN"
                        className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">8-13 digits only</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">VAT Number (Optional)</label>
                      <input
                        type="text"
                        value={vatNumber}
                        onChange={(e) => setVatNumber(e.target.value)}
                        placeholder="VAT Registration Number"
                        className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center font-medium">Date of Incorporation (Optional)</label>
                    <input
                      type="date"
                      value={dateOfIncorporation}
                      onChange={(e) => setDateOfIncorporation(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Store Details */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-[#9d4ae3] flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-[#9d4ae3]" />
                      Store Details
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Provide store branding elements, operating years, and social handles.</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 flex items-center">
                        Store Description (min 100 characters)
                        <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                      </label>
                      <span className={`text-[10px] font-bold text-[#9d4ae3]`}>
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
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none resize-none text-slate-800 font-medium placeholder:text-slate-400"
                    />
                    {storeDescription.length > 0 && storeDescription.length < 100 && (
                      <p className="text-xs text-[#9d4ae3] mt-1 font-medium">
                        Please enter at least 100 characters ({100 - storeDescription.length} more needed)
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                        Years in Business
                        <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                      </label>
                      <StyledSelect
                        value={yearsInBusiness}
                        onChange={(val: any) => setYearsInBusiness(val)}
                        options={[
                          { value: '0', label: 'Less than 1 year' },
                          { value: '1', label: '1 Year' },
                          { value: '2', label: '2 Years' },
                          { value: '3', label: '3 Years' },
                          { value: '5', label: '4-5 Years' },
                          { value: '10', label: 'More than 5 Years' }
                        ]}
                        placeholder="Select"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">Postal Code (Optional)</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={busPostal}
                        onChange={(e) => setBusPostal(e.target.value.replace(/\D/g, ''))}
                        placeholder="100001"
                        className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">6 digits only</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-extrabold text-sm text-purple-800 border-b border-slate-100 pb-2">Business Operations Address</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                          Street Address
                          <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={busStreet}
                          onChange={(e) => setBusStreet(e.target.value)}
                          placeholder="15 Allen Avenue"
                          className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            City
                            <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={busCity}
                            onChange={(e) => setBusCity(e.target.value)}
                            placeholder="Ikeja"
                            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            State
                            <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                          </label>
                          <StyledSelect
                            value={busState}
                            onChange={(val: any) => setBusState(val)}
                            options={NIGERIAN_STATES.map(s => ({ value: s, label: s }))}
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                            LGA
                            <span className="text-[#9d4ae3] ml-1 font-bold" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={busLga}
                            onChange={(e) => setBusLga(e.target.value)}
                            placeholder="Ikeja"
                            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-2 py-3 text-xs transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="font-extrabold text-sm text-purple-800 border-b border-slate-100 pb-2">Social Media Links (Optional)</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9d4ae3]">
                          <FaInstagram size={18} />
                        </div>
                        <input
                          type="url"
                          placeholder="https://instagram.com/yourbrand"
                          value={linkInstagram}
                          onChange={(e) => setLinkInstagram(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl text-xs font-medium transition-all outline-none text-slate-800 placeholder:text-slate-400"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9d4ae3]">
                          <FaFacebookF size={18} />
                        </div>
                        <input
                          type="url"
                          placeholder="https://facebook.com/yourbrand"
                          value={linkFacebook}
                          onChange={(e) => setLinkFacebook(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl text-xs font-medium transition-all outline-none text-slate-800 placeholder:text-slate-400"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9d4ae3]">
                          <FaXTwitter size={18} />
                        </div>
                        <input
                          type="url"
                          placeholder="https://twitter.com/yourbrand"
                          value={linkTwitter}
                          onChange={(e) => setLinkTwitter(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl text-xs font-medium transition-all outline-none text-slate-800 placeholder:text-slate-400"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9d4ae3]">
                          <FaTiktok size={18} />
                        </div>
                        <input
                          type="url"
                          placeholder="https://tiktok.com/@yourbrand"
                          value={linkTiktok}
                          onChange={(e) => setLinkTiktok(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl text-xs font-medium transition-all outline-none text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Document Uploads */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold text-slate-800">Upload Identity Documents</h2>
                    <p className="text-sm text-slate-500">
                      Required files based on your selection: <span className="font-extrabold text-purple-600 capitalize">{vendorType?.replace('_', ' ')}</span>.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {getRequiredDocTypes().map((docType) => {
                      const docMeta = DOCUMENT_DESCRIPTIONS[docType] || { label: docType, desc: '' };
                      const uploadedFile = documentsList.find((d) => d.documentType === docType);
                      const isUploading = uploadingDocType === docType;

                      return (
                        <div key={docType} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-1 max-w-xl">
                            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                              {docMeta.label}
                              {uploadedFile && <Check className="w-4 h-4 text-green-500 stroke-[3]" />}
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{docMeta.desc}</p>
                            <p className="text-[10px] text-slate-400">Accepted formats: JPG, PNG or PDF — max 5MB</p>
                          </div>

                          <div className="shrink-0 w-full md:w-auto">
                            {isUploading ? (
                              <div className="flex items-center gap-2 px-6 py-2 bg-purple-50 text-purple-600 rounded-xl font-bold text-xs">
                                <div className="w-3.5 h-3.5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                                Uploading...
                              </div>
                            ) : uploadedFile ? (
                              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs">
                                <FileCheck className="w-4 h-4 text-[#00bca6]" />
                                <div className="text-left">
                                  <p className="font-bold text-slate-700 line-clamp-1 max-w-[120px]">
                                    {uploadedFile.originalFilename}
                                  </p>
                                  <p className="text-[10px] text-slate-400">{formatBytes(uploadedFile.fileSizeBytes)}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDoc(uploadedFile.id)}
                                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                                  title="Remove document"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            ) : (
                              <label className="inline-flex items-center justify-center gap-2 bg-[#9d4ae3] hover:opacity-90 text-white font-extrabold text-xs px-6 py-3 rounded-xl cursor-pointer transition-all w-full md:w-auto">
                                <UploadCloud size={14} />
                                Choose File
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={(e) => handleFileUpload(docType, e)}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 6: Bank Account Details */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold text-slate-800">Add Bank Account</h2>
                    <p className="text-sm text-slate-500">Provide bank credentials to receive weekly sales payouts.</p>
                    {bankAccountsList.length >= MAX_BANK_ACCOUNTS && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-medium flex items-center gap-2">
                        <Info size={14} />
                        Maximum of {MAX_BANK_ACCOUNTS} bank accounts linked. You cannot add more.
                      </div>
                    )}
                  </div>

                  <div className={`bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4 ${
                    bankAccountsList.length >= MAX_BANK_ACCOUNTS ? 'opacity-50 pointer-events-none' : ''
                  }`}>
                    <h3 className="font-extrabold text-sm text-slate-700">Link Bank Account</h3>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                      <div className="relative">
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bank Name</label>
                        <input
                          type="text"
                          placeholder="Search Bank..."
                          value={bankSearchText}
                          onChange={(e) => {
                            setBankSearchText(e.target.value);
                            setIsBankDropdownOpen(true);
                          }}
                          onFocus={() => setIsBankDropdownOpen(true)}
                          className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 font-medium"
                          disabled={bankAccountsList.length >= MAX_BANK_ACCOUNTS}
                        />
                        {isBankDropdownOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
                            {NIGERIAN_BANKS.filter(b => b.name.toLowerCase().includes(bankSearchText.toLowerCase())).map(bank => (
                              <button
                                type="button"
                                key={bank.id}
                                onClick={() => {
                                  setBankName(bank.name);
                                  setBankCode(bank.code);
                                  setBankSearchText(bank.name);
                                  setIsBankDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs hover:bg-purple-50 text-slate-700 font-medium border-b border-slate-50 last:border-0"
                              >
                                {bank.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account Number</label>
                        <input
                          type="text"
                          maxLength={10}
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit NUBAN"
                          className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 font-medium"
                          disabled={bankAccountsList.length >= MAX_BANK_ACCOUNTS}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Enter exactly 10 digits</p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account Holder Name</label>
                        <input
                          type="text"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                          placeholder="e.g. JOHN DOE"
                          className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 font-medium placeholder:text-slate-400 uppercase"
                          disabled={bankAccountsList.length >= MAX_BANK_ACCOUNTS}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Enter the account holder's name</p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account Type</label>
                        <StyledSelect
                          value={accountType}
                          onChange={(val: any) => setAccountType(val)}
                          options={[
                            { value: 'savings', label: 'Savings' },
                            { value: 'current', label: 'Current' }
                          ]}
                          placeholder="Select"
                          disabled={bankAccountsList.length >= MAX_BANK_ACCOUNTS}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddBank}
                        disabled={bankAccountsList.length >= MAX_BANK_ACCOUNTS}
                        className="bg-[#9d4ae3] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all"
                      >
                        Link Account
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-extrabold text-sm text-slate-700">Linked Accounts ({bankAccountsList.length}/{MAX_BANK_ACCOUNTS})</h3>
                    {bankAccountsList.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No bank accounts linked yet.</p>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {bankAccountsList.map((acc) => (
                          <div key={acc.id} className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm flex justify-between items-start relative overflow-hidden">
                            {acc.isPrimary && (
                              <div className="absolute right-0 top-0 bg-green-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                                Primary
                              </div>
                            )}
                            
                            <div className="space-y-1">
                              <p className="text-xs font-extrabold text-slate-700">{acc.bankName}</p>
                              <p className="text-[10px] text-slate-400 tracking-wider">Number: {acc.accountNumber}</p>
                              <p className="text-xs font-bold text-slate-800">{acc.accountName}</p>
                              
                              {!acc.isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryBank(acc.id)}
                                  className="text-[10px] font-bold text-purple-600 hover:text-purple-700 hover:underline mt-2 block"
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

              {/* STEP 7: Review & Submit */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold text-slate-800">Review & Submit</h2>
                    <p className="text-sm text-slate-500">Confirm and review all submitted information before submitting for admin clearance.</p>
                  </div>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
                    
                    <div className="border border-slate-100 rounded-2xl p-5 space-y-2 relative">
                      <div className="absolute right-5 top-5 flex items-center gap-1.5 text-green-600 text-xs font-bold">
                        <Check size={14} />
                        Locked
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2">Store Basics</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400">Store Name:</span>
                          <p className="font-bold text-slate-700 mt-0.5">{storeName}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Vendor Type:</span>
                          <p className="font-bold text-slate-700 mt-0.5 capitalize">{vendorType?.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Phone Number:</span>
                          <p className="font-bold text-slate-700 mt-0.5">{storePhone || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Store Email:</span>
                          <p className="font-bold text-slate-700 mt-0.5">{storeEmail}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl p-5 space-y-2 relative">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="absolute right-5 top-5 text-xs font-extrabold text-purple-600 hover:underline"
                      >
                        Edit
                      </button>
                      <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2">Personal Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400">Legal Name:</span>
                          <p className="font-bold text-slate-700 mt-0.5">{fullName}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Date of Birth:</span>
                          <p className="font-bold text-slate-700 mt-0.5">{dateOfBirth}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Gender:</span>
                          <p className="font-bold text-slate-700 mt-0.5 capitalize">{gender}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Address:</span>
                          <p className="font-bold text-slate-700 mt-0.5">{homeStreet}, {homeCity}, {homeState}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl p-5 space-y-2 relative">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="absolute right-5 top-5 text-xs font-extrabold text-purple-600 hover:underline"
                      >
                        Edit
                      </button>
                      <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2">Business Registration</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400">Business Name:</span>
                          <p className="font-bold text-slate-700 mt-0.5">{businessName || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Business Type:</span>
                          <p className="font-bold text-slate-700 mt-0.5 capitalize">{businessType?.replace('_', ' ') || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">CAC Number:</span>
                          <p className="font-bold text-slate-700 mt-0.5">{cacNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">TIN Number:</span>
                          <p className="font-bold text-slate-700 mt-0.5">{tinNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl p-5 space-y-2 relative">
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="absolute right-5 top-5 text-xs font-extrabold text-purple-600 hover:underline"
                      >
                        Edit
                      </button>
                      <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2">Description & Address</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{storeDescription}</p>
                      <p className="text-[10px] text-slate-400 mt-2">Business Address: {busStreet}, {busCity}, {busState}</p>
                    </div>

                    <div className="border border-slate-100 rounded-2xl p-5 space-y-2 relative">
                      <button
                        onClick={() => setCurrentStep(5)}
                        className="absolute right-5 top-5 text-xs font-extrabold text-purple-600 hover:underline"
                      >
                        Edit
                      </button>
                      <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2">Uploaded Documents Checklist</h4>
                      <div className="space-y-1.5 pt-2">
                        {getRequiredDocTypes().map((type) => {
                          const doc = documentsList.find((d) => d.documentType === type);
                          return (
                            <div key={type} className="flex items-center justify-between text-xs font-medium">
                              <span className="text-slate-600">{DOCUMENT_DESCRIPTIONS[type]?.label || type}</span>
                              {doc ? (
                                <span className="text-green-500 font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Uploaded
                                </span>
                              ) : (
                                <span className="text-red-500 font-bold">Missing</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl p-5 space-y-2 relative">
                      <button
                        onClick={() => setCurrentStep(6)}
                        className="absolute right-5 top-5 text-xs font-extrabold text-purple-600 hover:underline"
                      >
                        Edit
                      </button>
                      <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2">Linked Accounts</h4>
                      <div className="space-y-2 pt-2">
                        {bankAccountsList.map((acc) => (
                          <div key={acc.id} className="flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-slate-700">{acc.bankName} ({acc.accountType})</p>
                              <p className="text-[10px] text-slate-400">{acc.accountName} • {acc.accountNumber}</p>
                            </div>
                            {acc.isPrimary && <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[9px] font-bold">Primary</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={confirmAccurate}
                        onChange={(e) => setConfirmAccurate(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-[#9d4ae3] focus:ring-purple-500"
                      />
                      <span className="text-xs font-semibold text-slate-600 leading-normal">
                        I confirm that all information provided is accurate and corresponds to legal registration records.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={confirmTerms}
                        onChange={(e) => setConfirmTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-[#9d4ae3] focus:ring-purple-500"
                      />
                      <span className="text-xs font-semibold text-slate-600 leading-normal">
                        I agree to Faflora's Vendor Terms and Commission Structure.
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
                      setCurrentStep(prev => prev - 1);
                    }}
                    className="inline-flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-600 px-6 py-3 rounded-xl text-sm font-bold transition-all h-[52px]"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                ) : (
                  <div className="w-[100px] lg:w-[120px]" />
                )}

                {currentStep < 7 ? (
                  <button
                    type="button"
                    onClick={() => handleSaveStep(currentStep)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:opacity-90 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98] h-[52px] ml-4 lg:ml-0"
                  >
                    {getButtonText(currentStep)}
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!confirmAccurate || !confirmTerms || submittingApplication}
                    onClick={handleSubmitAll}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:opacity-90 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed h-[52px] ml-4 lg:ml-0"
                  >
                    {submittingApplication ? 'Submitting Application...' : 'Submit Application'}
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>

            </motion.div>
          </AnimatePresence>

        </div>
        </div>
      </div>

      {/* Confirm Modal */}
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
                  <h3 className="font-extrabold text-base text-slate-800">Confirm Vendor Type Selection</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    You have selected <span className="font-extrabold text-purple-600 capitalize">{(vendorType || '').replace('_', ' ')}</span>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                Once initialized, your Vendor Type selection cannot be changed. This choice directly affects the required documentation (Step 5) and business data required to submit. Please confirm you wish to proceed.
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
                  className="px-6 py-2.5 bg-[#9d4ae3] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 lg:px-6 mt-6 pt-4 border-t border-slate-200">
        <p className="text-center text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} Faflora Group. All rights reserved.
        </p>
      </footer>

    </div>
  );
}