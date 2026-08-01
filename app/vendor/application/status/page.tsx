'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, 
  FileText, 
  Check, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles,
  HelpCircle,
  Mail,
  UploadCloud,
  FileCheck,
  Info,
  Eye,
  Building,
  User,
  Tag,
  CreditCard,
  ChevronDown,
  Ban
} from 'lucide-react';
import { 
  vendorApi, 
  saveMockData,
  VendorApplicationStatus, 
  VendorApplicationDraft,
  VendorDocument,
  Category,
  VendorBankAccount,
  IS_DEV_MODE,
} from '@/lib/api-vendor';
import toast from 'react-hot-toast';

const DOCUMENT_LABELS: Record<string, string> = {
  government_id: 'Government ID Card',
  id_selfie: 'Selfie holding ID Card',
  proof_of_address: 'Proof of Address',
  cac_certificate: 'CAC Certificate',
  tin_certificate: 'TIN Certificate',
  brand_authorization: 'Brand Authorization Letter',
  brand_auth_letter: 'Brand Authorization Letter'
};

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
      return 'Verified';
    case 'rejected':
      return 'Rejected';
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
      return <AlertTriangle size={14} className="text-orange-500" />;
    default:
      return null;
  }
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
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

export default function VendorStatusPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [appStatus, setAppStatus] = useState<VendorApplicationStatus | null>(null);
  const [appDraft, setAppDraft] = useState<VendorApplicationDraft | null>(null);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  
  // Resubmission Mode state
  const [isResubmittingMode, setIsResubmittingMode] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [resubmitLoading, setResubmitLoading] = useState(false);

  // View submission modal states
  const [showViewSubmissionModal, setShowViewSubmissionModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<VendorDocument | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Load application status
  const loadStatusData = async () => {
    try {
      const res = await vendorApi.getApplicationStatus();
      if (res.success && res.data) {
        setAppStatus(res.data);
      }
      
      const draftRes = await vendorApi.getApplicationDraft();
      if (draftRes.success && draftRes.data) {
        setAppDraft(draftRes.data);
      }

      const catRes = await vendorApi.getAllCategories();
      if (catRes.success && catRes.data) {
        setCategoriesList(catRes.data);
      }
    } catch (err) {
      console.error('Failed to load status details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatusData();
  }, []);

  // Handler for simulating status switching in Dev Mock Mode
  const handleDevStatusSwitch = (newStatus: VendorApplicationStatus['status']) => {
    if (!appStatus || !appDraft) return;

    let resubmissionNote = null;
    let rejectionReason = null;
    let docs = [...appStatus.documents];

    if (newStatus === 'requires_resubmission') {
      resubmissionNote = 'Government ID copy is too blurry. Please re-upload a clear scanned copy of your national identity card.';
      docs = docs.map(d => {
        if (d.documentType === 'government_id') {
          return { ...d, status: 'rejected', rejectionReason: 'Document image is blurry — please re-upload a clearer photo' };
        }
        return { ...d, status: 'verified' };
      });
    } else if (newStatus === 'rejected') {
      rejectionReason = 'Business type and registration documents do not align with our regulatory compliance directives. Appeal below if you believe this is in error.';
    } else if (newStatus === 'approved') {
      docs = docs.map(d => ({ ...d, status: 'verified' }));
    } else if (newStatus === 'suspended') {
      docs = docs.map(d => ({ ...d, status: 'verified' }));
    } else if (newStatus === 'banned') {
      docs = docs.map(d => ({ ...d, status: 'verified' }));
    }

    const updatedStatus: VendorApplicationStatus = {
      ...appStatus,
      status: newStatus,
      resubmissionNote,
      rejectionReason,
      documents: docs,
      submittedAt: newStatus === 'draft' ? null : (appStatus.submittedAt || new Date().toISOString())
    };

    const updatedDraft: VendorApplicationDraft = {
      ...appDraft,
      documents: appDraft.documents.map(d => {
        if (d.documentType === 'government_id' && newStatus === 'requires_resubmission') {
          return { ...d, status: 'rejected', rejectionReason: 'Document image is blurry — please re-upload a clearer photo' };
        }
        return { ...d, status: newStatus === 'approved' ? 'verified' : d.status };
      })
    };

    setAppStatus(updatedStatus);
    setAppDraft(updatedDraft);
    saveMockData(updatedStatus, updatedDraft);
    toast.success(`Mock status set to: ${newStatus.toUpperCase()}`);
  };

  // Upload handler for resubmission doc slots
  const handleResubmitUpload = async (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5242880) {
      toast.error('File size cannot exceed 5MB');
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
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const confirmRes = await vendorApi.confirmDocumentUpload({
          documentType: docType,
          cloudinaryPublicId: signedRes.data.publicId,
          documentUrl: `https://res.cloudinary.com/faflora/image/upload/v1234567890/${signedRes.data.publicId}`,
          originalFilename: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type,
        });

        if (confirmRes.success) {
          await loadStatusData();
          toast.success('Replacement file uploaded successfully!');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'File upload failed');
    } finally {
      setUploadingDocType(null);
    }
  };

  // Submit Corrections Action
  const handleSubmitCorrections = async () => {
    // Check if any flagged documents remain unresolved
    const flaggedDocs = appStatus?.documents.filter(d => d.status === 'rejected' || d.status === 'requires_resubmission') || [];
    if (flaggedDocs.length > 0) {
      toast.error('Please re-upload all flagged documents first');
      return;
    }

    setResubmitLoading(true);
    try {
      const res = await vendorApi.resubmitApplication();
      if (res.success) {
        toast.success('Corrections submitted successfully!');
        setIsResubmittingMode(false);
        await loadStatusData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit corrections');
    } finally {
      setResubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-[#9d4ae3] rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-bold">Retrieving application status...</p>
        </div>
      </div>
    );
  }

  const status = appStatus?.status || 'draft';
  const refNumber = appStatus?.applicationReference || 'N/A';

  // Helper for Status Badge Styling
  const getStatusBadge = () => {
    switch (status) {
      case 'submitted':
        return <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold capitalize">Submitted</span>;
      case 'in_review':
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full text-xs font-bold capitalize">In Review</span>;
      case 'requires_resubmission':
        return <span className="bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full text-xs font-bold capitalize">Action Required</span>;
      case 'approved':
        return <span className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-xs font-bold capitalize">Approved</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full text-xs font-bold capitalize">Rejected</span>;
      case 'suspended':
        return <span className="bg-yellow-50 text-yellow-700 border border-yellow-100 px-3 py-1 rounded-full text-xs font-bold capitalize">Suspended</span>;
      case 'banned':
        return <span className="bg-slate-900 text-slate-100 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold capitalize">Banned</span>;
      default:
        return <span className="bg-slate-50 text-slate-700 border border-slate-100 px-3 py-1 rounded-full text-xs font-bold capitalize">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans pt-12">
      
      {/* Dev Mock Status Controls Switcher - Wrap with environment check */}
      {IS_DEV_MODE && (
        <div className="max-w-4xl mx-auto px-6 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Dev Status Controls (Click to test UI)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['draft', 'submitted', 'in_review', 'requires_resubmission', 'approved', 'rejected', 'suspended', 'banned'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => handleDevStatusSwitch(s)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    status === s 
                      ? 'bg-[#9d4ae3] text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6">
        
        {/* Main Status Header Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Application Reference</p>
              <h1 className="text-xl font-black text-slate-800 tracking-tight mt-1 flex items-center gap-2">
                {refNumber}
                <Sparkles className="w-4 h-4 text-[#ffbd30]" />
              </h1>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Status</span>
              <div className="mt-1">{getStatusBadge()}</div>
            </div>
          </div>

          {/* Action Row */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Application Date</p>
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Calendar size={14} className="text-purple-600" />
                {appStatus?.submittedAt ? (
                  <span>Submitted At: {formatDate(appStatus.submittedAt)}</span>
                ) : (
                  <span>Last Updated: {formatDate(appStatus?.lastUpdatedAt)}</span>
                )}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* DRAFT or REQUIRES_RESUBMISSION - Purple button */}
              {(status === 'draft' || status === 'requires_resubmission') && (
                <button
                  onClick={() => router.push('/vendor/apply')}
                  className="bg-[#9d4ae3] hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  Edit My Submission
                  <ArrowRight size={14} />
                </button>
              )}
              
              {/* SUBMITTED, IN_REVIEW, APPROVED - Purple View Submission button */}
              {(status === 'submitted' || status === 'in_review' || status === 'approved') && (
                <button
                  onClick={() => setShowViewSubmissionModal(true)}
                  className="bg-[#9d4ae3] hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  View Submission
                  <Eye size={14} />
                </button>
              )}
              
              {/* REJECTED, SUSPENDED, BANNED - NO BUTTON HERE */}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isResubmittingMode ? (
              
              /* TASK 4: Resubmission Flow Form View */
              <motion.div
                key="resubmission-flow"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3 text-orange-700">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">Resolve Document Flagging</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Please review the comments from the administrator below, replace the flagged documents, and submit your corrections for re-evaluation.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {appStatus?.documents.filter(d => d.status === 'rejected' || d.status === 'requires_resubmission').map(doc => {
                    const isUploading = uploadingDocType === doc.documentType;
                    const resolvedLabel = DOCUMENT_LABELS[doc.documentType] || doc.documentType;

                    return (
                      <div key={doc.documentType} className="border border-orange-200/60 rounded-2xl p-5 bg-orange-50/20 space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-sm text-slate-800 capitalize">{resolvedLabel}</h4>
                            <p className="text-xs text-orange-600 font-semibold flex items-start gap-1.5 mt-1 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <span>Comment: {doc.rejectionReason || 'Document is blurry or incorrect — please re-upload.'}</span>
                            </p>
                          </div>

                          <div className="shrink-0 w-full md:w-auto">
                            {isUploading ? (
                              <div className="flex items-center gap-2 px-6 py-2.5 bg-purple-50 text-purple-600 rounded-xl font-bold text-xs">
                                <div className="w-3.5 h-3.5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                                Uploading replacement...
                              </div>
                            ) : (
                              <label className="inline-flex items-center justify-center gap-2 bg-[#9d4ae3] hover:opacity-90 text-white font-extrabold text-xs px-6 py-3 rounded-xl cursor-pointer transition-all w-full md:w-auto">
                                <UploadCloud size={14} />
                                Re-upload File
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={(e) => handleResubmitUpload(doc.documentType, e)}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsResubmittingMode(false)}
                    className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 px-6 py-3 rounded-xl text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={resubmitLoading}
                    onClick={handleSubmitCorrections}
                    className="inline-flex items-center gap-2 bg-[#9d4ae3] hover:opacity-90 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {resubmitLoading ? 'Submitting corrections...' : 'Submit Corrections'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>

            ) : (
              
              /* Status view showing details, timeline & alerts */
              <motion.div
                key="status-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                
                {/* ALERTS BANNERS */}
                {/* 1. Requires Resubmission */}
                {status === 'requires_resubmission' && (
                  <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-orange-800">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-6 h-6 shrink-0 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800">Re-upload Required</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {appStatus?.resubmissionNote || 'The admin team flagged issues with your documents. Please review and re-submit.'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsResubmittingMode(true)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shrink-0 self-end md:self-auto transition-all"
                    >
                      Fix & Resubmit
                    </button>
                  </div>
                )}

                {/* 2. Approved celebration banner */}
                {status === 'approved' && (
                  <div className="p-6 bg-green-50 border border-green-100 rounded-3xl space-y-4 text-green-800 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-lg text-slate-800">Application Approved</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Congratulations, your seller credentials have been verified successfully. You can now access your customized merchant console to list floral catalog items, adjust store coordinates, and fulfill customer orders.
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        onClick={() => router.push('/vendor/dashboard')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
                      >
                        Go to My Dashboard
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Suspended / Banned banner */}
                {(status === 'suspended' || status === 'banned') && (
                  <div className="p-5 bg-yellow-50 border border-yellow-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-yellow-800">
                    <div className="flex gap-3">
                      <Ban className="w-6 h-6 shrink-0 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800">
                          {status === 'banned' ? 'Account Banned' : 'Account Suspended'}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Your vendor account has been {status === 'banned' ? 'permanently banned' : 'temporarily suspended'} due to a policy violation. Please contact our support team to resolve this.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/contact-us')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shrink-0 self-end md:self-auto transition-all flex items-center gap-1.5"
                    >
                      <Mail size={13} />
                      Contact Support
                    </button>
                  </div>
                )}
 
                {/* 3. Rejected banner */}
                {status === 'rejected' && (
                  <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-red-800">
                    <div className="flex gap-3">
                      <X className="w-6 h-6 shrink-0 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800">Application Rejected</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {appStatus?.rejectionReason || 'Unfortunately, your store application could not be verified by our administrative onboarding staff.'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/vendor/apply')}
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shrink-0 self-end md:self-auto transition-all flex items-center gap-1.5"
                    >
                      Start a New Application
                      <ArrowRight size={13} />
                    </button>
                  </div>
                )}

                {/* 4. Submitted/In review standard badge */}
                {(status === 'submitted' || status === 'in_review') && (
                  <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-3 text-blue-800">
                    <Clock className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">Under Review</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Your application is currently queued for onboarding clearance review. The verification team processes applications within 24 to 72 business hours. We will notify you via email as soon as an evaluation is confirmed.
                      </p>
                    </div>
                  </div>
                )}

                {/* VERTICAL TIMELINE OF THE APPLICATION JOURNEY */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-700">Onboarding Journey</h3>
                  <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6 text-xs">
                    
                    {/* Step 1 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800">Store Profile Initialized</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Basics, contact and email credentials confirmed.</p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800">Information Submitted</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">BVN, addresses and bank accounts fully linked.</p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                      <div className={`absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center text-white ${
                        status === 'approved' || status === 'rejected'
                          ? 'bg-green-500'
                          : status === 'requires_resubmission'
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                      }`}>
                        {status === 'approved' || status === 'rejected' ? (
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800">Admin Review</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {status === 'approved' 
                            ? 'Verification review completed successfully.'
                            : status === 'requires_resubmission'
                              ? 'Admin flagged items requiring correction.'
                              : 'Onboarding specialist evaluation in progress.'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="relative">
                      <div className={`absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center text-white ${
                        status === 'approved'
                          ? 'bg-green-500'
                          : status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-slate-200'
                      }`}>
                        {status === 'approved' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        {status === 'rejected' && <X className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800">Activation Status</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {status === 'approved' 
                            ? 'Merchant account activated. Ready to start selling.'
                            : status === 'rejected'
                              ? 'Onboarding application rejected.'
                              : 'Awaiting review confirmation before merchant launch.'
                          }
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* DOCUMENTS DETAIL LIST */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-700">Documents Status</h3>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {appStatus?.documents && appStatus.documents.length > 0 ? (
                      appStatus.documents.map((doc) => {
                        const docLabel = DOCUMENT_LABELS[doc.documentType] || doc.documentType;

                        return (
                          <div key={doc.documentType} className="flex justify-between items-center p-4 bg-white hover:bg-slate-50/50 transition-colors">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-slate-800">{docLabel}</p>
                              {doc.uploadedAt ? (
                                <p className="text-[10px] text-slate-400">Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              ) : (
                                <p className="text-[10px] text-slate-400">Pending upload</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getDocumentStatusColor(doc.status)}`}>
                                {getDocumentStatusLabel(doc.status)}
                              </span>
                              {doc.documentUrl && (
                                <button
                                  onClick={() => {
                                    // Convert to full VendorDocument with mimeType
                                    const fullDoc: VendorDocument = {
                                      id: doc.id || '',
                                      documentType: doc.documentType,
                                      documentUrl: doc.documentUrl || '',
                                      originalFilename: doc.originalFilename || '',
                                      fileSizeBytes: doc.fileSizeBytes || 0,
                                      mimeType: 'application/pdf', // Default fallback
                                      status: doc.status,
                                      rejectionReason: doc.rejectionReason,
                                      uploadedAt: doc.uploadedAt,
                                    };
                                    setSelectedDocument(fullDoc);
                                    setShowDocumentModal(true);
                                  }}
                                  className="text-[#9d4ae3] hover:underline"
                                >
                                  <Eye size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="p-4 text-xs text-slate-400 italic bg-white">No documents uploaded yet.</p>
                    )}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Read-Only View Submission Modal */}
      <AnimatePresence>
        {showViewSubmissionModal && appDraft && (
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
                  <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#9d4ae3]" />
                    My Submitted Application
                  </h3>
                  <p className="text-xs text-slate-500">
                    Read-only summary of the registration details you provided.
                  </p>
                </div>
                <button
                  onClick={() => setShowViewSubmissionModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Modal Content Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/50">
                
                {/* Store Basics */}
                <div className="border border-slate-200/60 bg-white rounded-2xl p-5 space-y-2">
                  <h4 className="font-extrabold text-sm text-[#9d4ae3] border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Store Basics
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-2">
                    <div>
                      <span className="text-slate-400">Store Name:</span>
                      <p className="font-bold text-slate-700 mt-0.5 truncate">{appDraft.storeName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Vendor Type:</span>
                      <p className="font-bold text-slate-700 mt-0.5 capitalize truncate">{appDraft.vendorType?.replace('_', ' ') || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Phone Number:</span>
                      <p className="font-bold text-slate-700 mt-0.5 truncate">{appDraft.storePhone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Store Email:</span>
                      <p className="font-bold text-slate-700 mt-0.5 truncate">{appDraft.storeEmail || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Selling Categories */}
                <div className="border border-slate-200/60 bg-white rounded-2xl p-5 space-y-2">
                  <h4 className="font-extrabold text-sm text-[#9d4ae3] border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Selling Categories
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(() => {
                      // Prefer resolved categories from appStatus, fall back to sellingCategories flat array, then step2.categories from real API draft
                      const cats = (appStatus?.sellingCategories && appStatus.sellingCategories.length > 0)
                        ? appStatus.sellingCategories
                        : (appDraft.sellingCategories && appDraft.sellingCategories.length > 0)
                          ? appDraft.sellingCategories
                          : (appDraft.step2?.categories ?? []);

                      return cats.length > 0 ? (
                        cats.map(c => {
                          const foundCat = categoriesList.find(item => item.id === c.id);
                          const displayName = foundCat?.name || c.name || c.id;
                          return (
                            <span key={c.id} className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                              {displayName}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400 italic">No categories selected</span>
                      );
                    })()}
                  </div>
                </div>

                {/* Personal Details */}
                {appDraft.personalInfo && (
                  <div className="border border-slate-200/60 bg-white rounded-2xl p-5 space-y-2">
                    <h4 className="font-extrabold text-sm text-[#9d4ae3] border-b border-slate-100 pb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Personal Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-2">
                      <div>
                        <span className="text-slate-400">Legal Name:</span>
                        <p className="font-bold text-slate-700 mt-0.5 truncate">{appDraft.personalInfo.fullName}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Date of Birth:</span>
                        <p className="font-bold text-slate-700 mt-0.5 truncate">{appDraft.personalInfo.dateOfBirth}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Gender:</span>
                        <p className="font-bold text-slate-700 mt-0.5 capitalize truncate">{appDraft.personalInfo.gender}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Current Location:</span>
                        <p className="font-bold text-slate-700 mt-0.5 truncate">
                          {appDraft.personalInfo.homeAddress?.street}, {appDraft.personalInfo.homeAddress?.city}, {appDraft.personalInfo.homeAddress?.state}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">NIN Status:</span>
                        <p className="font-bold text-green-600 mt-0.5 flex items-center gap-1">
                          <Check size={12} /> Provided
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Business Registration */}
                {(appDraft.vendorType === 'registered_business' || appDraft.vendorType === 'brand') && appDraft.businessInfo && (
                  <div className="border border-slate-200/60 bg-white rounded-2xl p-5 space-y-2">
                    <h4 className="font-extrabold text-sm text-[#9d4ae3] border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Business Registration
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-2">
                      <div>
                        <span className="text-slate-400">Business Name:</span>
                        <p className="font-bold text-slate-700 mt-0.5 truncate">{appDraft.businessInfo.businessName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Business Type:</span>
                        <p className="font-bold text-slate-700 mt-0.5 capitalize truncate">{appDraft.businessInfo.businessType?.replace('_', ' ') || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">CAC Number:</span>
                        <p className="font-bold text-slate-700 mt-0.5 truncate">{appDraft.businessInfo.cacNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">TIN Number:</span>
                        <p className="font-bold text-slate-700 mt-0.5 truncate">{appDraft.businessInfo.tinNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">VAT Number:</span>
                        <p className="font-bold text-slate-700 mt-0.5 truncate">{appDraft.businessInfo.vatNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Date of Incorporation:</span>
                        <p className="font-bold text-slate-700 mt-0.5 truncate">{appDraft.businessInfo.dateOfIncorporation || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Store Details & Policies */}
                {appDraft.storeInfo && (
                  <div className="border border-slate-200/60 bg-white rounded-2xl p-5 space-y-2">
                    <h4 className="font-extrabold text-sm text-[#9d4ae3] border-b border-slate-100 pb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description & Address
                    </h4>
                    <div className="max-w-full mt-2">
                      <span className="text-slate-400 text-xs">Store Description:</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1 break-words whitespace-pre-wrap">
                        {appDraft.storeInfo.storeDescription}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-3 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400">Years in Business:</span>
                        <p className="font-bold text-slate-700 mt-0.5 capitalize truncate">{appDraft.storeInfo.yearsInBusiness?.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Business Address:</span>
                        <p className="font-bold text-slate-700 mt-0.5 truncate">
                          {appDraft.storeInfo.businessAddress?.street}, {appDraft.storeInfo.businessAddress?.city}, {appDraft.storeInfo.businessAddress?.state}
                        </p>
                      </div>
                    </div>
                    {appDraft.storeInfo.socialLinks && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <span className="text-slate-400 text-xs">Social Handles:</span>
                        <div className="flex flex-wrap gap-3 mt-1.5">
                          {appDraft.storeInfo.socialLinks.instagram && (
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-medium">
                              Instagram: @{appDraft.storeInfo.socialLinks.instagram.split('/').pop()}
                            </span>
                          )}
                          {appDraft.storeInfo.socialLinks.facebook && (
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-medium">
                              Facebook: @{appDraft.storeInfo.socialLinks.facebook.split('/').pop()}
                            </span>
                          )}
                          {appDraft.storeInfo.socialLinks.twitter && (
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-medium">
                              Twitter: @{appDraft.storeInfo.socialLinks.twitter.split('/').pop()}
                            </span>
                          )}
                          {appDraft.storeInfo.socialLinks.tiktok && (
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-medium">
                              TikTok: @{appDraft.storeInfo.socialLinks.tiktok.split('@').pop()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Uploaded Documents */}
                <div className="border border-slate-200/60 bg-white rounded-2xl p-5 space-y-2">
                  <h4 className="font-extrabold text-sm text-[#9d4ae3] border-b border-slate-100 pb-2 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    Uploaded Documents Checklist
                  </h4>
                  <div className="space-y-2.5 pt-2">
                    {appDraft.documents && appDraft.documents.length > 0 ? (
                      appDraft.documents.map((doc) => {
                        const docLabel = DOCUMENT_LABELS[doc.documentType] || doc.documentType;
                        return (
                          <div key={doc.id} className="flex items-center justify-between text-xs border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                            <span className="text-slate-600">{docLabel}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDocumentStatusColor(doc.status)}`}>
                                {getDocumentStatusLabel(doc.status)}
                              </span>
                              <button
                                onClick={() => {
                                  // Convert to full VendorDocument with mimeType
                                  const fullDoc: VendorDocument = {
                                    id: doc.id,
                                    documentType: doc.documentType,
                                    documentUrl: doc.documentUrl,
                                    originalFilename: doc.originalFilename,
                                    fileSizeBytes: doc.fileSizeBytes || 0,
                                    mimeType: 'application/pdf', // Default fallback
                                    status: doc.status,
                                    rejectionReason: doc.rejectionReason,
                                    uploadedAt: doc.uploadedAt,
                                  };
                                  setSelectedDocument(fullDoc);
                                  setShowDocumentModal(true);
                                }}
                                className="text-[#9d4ae3] hover:underline"
                              >
                                <Eye size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic">No documents uploaded.</p>
                    )}
                  </div>
                </div>

                {/* Bank Accounts */}
                <div className="border border-slate-200/60 bg-white rounded-2xl p-5 space-y-2">
                  <h4 className="font-extrabold text-sm text-[#9d4ae3] border-b border-slate-100 pb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Linked Accounts
                  </h4>
                  <div className="space-y-2.5 pt-2">
                    {appDraft.bankAccounts && appDraft.bankAccounts.length > 0 ? (
                      appDraft.bankAccounts.map((acc) => (
                        <div key={acc.id} className="flex justify-between items-center text-xs border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                          <div>
                            <p className="font-bold text-slate-700">{acc.bankName} ({acc.accountType})</p>
                            <p className="text-[10px] text-slate-400">{acc.accountName} • {acc.accountNumber}</p>
                          </div>
                          {acc.isPrimary && <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[9px] font-bold">Primary</span>}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No bank accounts linked</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowViewSubmissionModal(false)}
                  className="px-6 py-2.5 bg-[#9d4ae3] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Close
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
                    {DOCUMENT_LABELS[selectedDocument.documentType] || selectedDocument.documentType}
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
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getDocumentStatusColor(selectedDocument.status)}`}>
                  {getDocumentStatusLabel(selectedDocument.status)}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <FileText size={12} />
                  {formatBytes(selectedDocument.fileSizeBytes || 0)}
                </span>
                {selectedDocument.uploadedAt && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    Uploaded: {formatDate(selectedDocument.uploadedAt)}
                  </span>
                )}
              </div>

              {/* Rejection Reason */}
              {selectedDocument.rejectionReason && (
                <div className="p-4 bg-red-50 border-b border-red-100 flex-shrink-0">
                  <p className="text-xs font-semibold text-red-600 flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>Rejection reason: {selectedDocument.rejectionReason}</span>
                  </p>
                </div>
              )}

              {/* Document Preview */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 min-h-[400px] flex items-center justify-center">
                {selectedDocument.mimeType?.startsWith('image/') ? (
                  <img
                    src={selectedDocument.documentUrl}
                    alt={selectedDocument.originalFilename}
                    className="max-w-full max-h-[600px] object-contain rounded-lg shadow-sm"
                  />
                ) : selectedDocument.mimeType === 'application/pdf' ? (
                  <div className="w-full h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
                    <object
                      data={selectedDocument.documentUrl}
                      type="application/pdf"
                      className="w-full h-full"
                      aria-label={selectedDocument.originalFilename}
                    >
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
                        <FileText size={64} className="text-slate-400 mx-auto mb-4" />
                        <p className="text-sm text-slate-600 font-medium">{selectedDocument.originalFilename}</p>
                        <p className="text-xs text-slate-400 mt-1">PDF Document • {formatBytes(selectedDocument.fileSizeBytes || 0)}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          Your browser cannot display this PDF inline.
                        </p>
                        <a
                          href={selectedDocument.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 bg-[#9d4ae3] hover:opacity-90 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                        >
                          <Eye size={16} />
                          View PDF
                        </a>
                      </div>
                    </object>
                  </div>
                ) : (
                  <div className="text-center p-8 w-full max-w-md">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <FileText size={48} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">{selectedDocument.originalFilename}</p>
                    <a
                      href={selectedDocument.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 bg-[#9d4ae3] hover:opacity-90 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                    >
                      <Eye size={16} />
                      View File
                    </a>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="px-6 py-2.5 bg-[#9d4ae3] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}