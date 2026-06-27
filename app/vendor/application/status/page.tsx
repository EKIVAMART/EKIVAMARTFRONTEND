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
  Info
} from 'lucide-react';
import { 
  vendorApi, 
  saveMockData,
  VendorApplicationStatus, 
  VendorApplicationDraft,
  VendorDocument 
} from '@/lib/api-vendor';
import toast from 'react-hot-toast';

const DOCUMENT_LABELS: Record<string, string> = {
  government_id: 'Government ID Card',
  id_selfie: 'Selfie holding ID Card',
  proof_of_address: 'Proof of Address',
  cac_certificate: 'CAC Certificate',
  tin_certificate: 'TIN Certificate',
  brand_auth_letter: 'Brand Authorization Letter'
};

export default function VendorStatusPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [appStatus, setAppStatus] = useState<VendorApplicationStatus | null>(null);
  const [appDraft, setAppDraft] = useState<VendorApplicationDraft | null>(null);
  
  // Resubmission Mode state
  const [isResubmittingMode, setIsResubmittingMode] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [resubmitLoading, setResubmitLoading] = useState(false);

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
    }

    const updatedStatus: VendorApplicationStatus = {
      ...appStatus,
      status: newStatus,
      resubmissionNote,
      rejectionReason,
      documents: docs
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
      default:
        return <span className="bg-slate-50 text-slate-700 border border-slate-100 px-3 py-1 rounded-full text-xs font-bold capitalize">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans pt-12">
      
      {/* Dev Mock Status Controls Switcher */}
      <div className="max-w-4xl mx-auto px-6 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Dev Status Controls (Click to test UI)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['draft', 'submitted', 'in_review', 'requires_resubmission', 'approved', 'rejected'] as const).map(s => (
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
                        <h4 className="font-black text-lg text-slate-800">Application Approved! 🎉</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Congratulations, your seller credentials have been verified successfully. You can now access your customized merchant console to list floral catalog items, adjust store coordinates, and fulfill customer orders.
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
                      >
                        Go to My Dashboard
                        <ArrowRight size={14} />
                      </button>
                    </div>
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
                    <a
                      href="mailto:vendors@faflora.com?subject=Vendor Application Appeal - VEN-2026-00042"
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shrink-0 self-end md:self-auto transition-all flex items-center gap-1.5"
                    >
                      <Mail size={13} />
                      Appeal Application
                    </a>
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
                    {appStatus?.documents.map((doc) => {
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
                          <div>
                            {doc.status === 'verified' && (
                              <span className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">Verified</span>
                            )}
                            {doc.status === 'pending' && (
                              <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">Pending</span>
                            )}
                            {doc.status === 'rejected' && (
                              <span className="bg-red-50 text-red-700 border border-red-100 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">Rejected</span>
                            )}
                            {doc.status === 'requires_resubmission' && (
                              <span className="bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">Action Required</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
      
    </div>
  );
}
