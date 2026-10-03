'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mail,
  Users,
  Store,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Play,
  Save,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  Code,
  Eye,
  Type,
  Bold,
  Italic,
  Link as LinkIcon,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import {
  engagementApi,
  authApi,
  EngagementSetting,
  EngagementEmailType,
  UpdateEngagementSettingPayload,
  RunNowResponse,
  SweepResult,
} from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Helpers & Meta ──────────────────────────────────────────────────────────

const TYPE_META: Record<
  EngagementEmailType,
  {
    label: string;
    description: string;
    icon: React.ReactNode;
    accent: string;
    bg: string;
    variables: Array<{ tag: string; label: string; sample: string }>;
  }
> = {
  customer_inactivity: {
    label: 'Customer Inactivity',
    description:
      'Sends a automated reminder email to customers who have not placed an order or engaged beyond the threshold period.',
    icon: <Users size={20} />,
    accent: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
    variables: [
      { tag: '{{firstName}}', label: 'Customer Name', sample: 'Sarah' },
      { tag: '{{daysSinceLastOrder}}', label: 'Inactivity Days', sample: '30' },
      { tag: '{{frontendUrl}}', label: 'Store URL', sample: 'https://faflora.com' },
      { tag: '{{appName}}', label: 'App Name', sample: 'Faflora' },
    ],
  },
  vendor_incomplete_registration: {
    label: 'Vendor Incomplete Registration',
    description:
      'Nudges vendors who started registration but never completed submitting their application to finalize onboarding.',
    icon: <Store size={20} />,
    accent: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    variables: [
      { tag: '{{firstName}}', label: 'Vendor Name', sample: 'Alex' },
      { tag: '{{storeName}}', label: 'Store Name', sample: 'Flora Elegance' },
      { tag: '{{daysSinceStarted}}', label: 'Days Pending', sample: '3' },
      { tag: '{{frontendUrl}}', label: 'Store URL', sample: 'https://faflora.com' },
      { tag: '{{appName}}', label: 'App Name', sample: 'Faflora' },
    ],
  },
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Never';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── Run-Now Results Modal ───────────────────────────────────────────────────

interface RunNowModalProps {
  result: RunNowResponse | null;
  onClose: () => void;
}

function SweepRow({ label, data }: { label: string; data: SweepResult | undefined }) {
  if (!data)
    return (
      <div className="flex items-center justify-between py-3 border-b last:border-b-0">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <span className="text-xs text-gray-400 italic">No data</span>
      </div>
    );

  const isSkipped = !data.enabled;

  return (
    <div className="py-4 border-b last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        {isSkipped ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
            <XCircle size={12} /> Skipped (Disabled)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
            <CheckCircle2 size={12} /> Ran
          </span>
        )}
      </div>
      {!isSkipped && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Eligible', value: data.eligible, color: 'text-slate-700' },
            { label: 'Sent', value: data.sent, color: 'text-emerald-600' },
            { label: 'Failed', value: data.failed, color: data.failed > 0 ? 'text-rose-600' : 'text-gray-400' },
          ].map(({ label: l, value, color }) => (
            <div key={l} className="bg-slate-50 rounded-xl p-3 text-center border">
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RunNowModal({ result, onClose }: RunNowModalProps) {
  if (!result) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#9d4ae3] to-[#8236be] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Zap size={20} />
            <h3 className="font-bold text-lg">Sweep Results</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/20 rounded-xl transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <p className="text-xs text-gray-500 font-semibold mb-4 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <Info size={14} className="text-[#9d4ae3] shrink-0" />
            {result.message}
          </p>

          <SweepRow label="Customer Inactivity" data={result.customer_inactivity} />
          <SweepRow label="Vendor Incomplete Registration" data={result.vendorIncompleteRegistration} />

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white font-bold rounded-xl hover:from-[#8236be] hover:to-[#692a99] transition shadow-md"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Confirm Run-Now Modal ───────────────────────────────────────────────────

interface ConfirmRunNowModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isRunning: boolean;
}

function ConfirmRunNowModal({ onConfirm, onCancel, isRunning }: ConfirmRunNowModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border p-6 text-center"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
          <AlertTriangle size={26} className="text-amber-500" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800">Run Engagement Sweep?</h3>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          This will immediately send real reminder emails to eligible customers and vendors. This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isRunning}
            className="flex-1 py-3 border rounded-xl text-sm font-bold hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isRunning}
            className="flex-1 py-3 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white rounded-xl text-sm font-bold transition shadow-md hover:from-[#8236be] hover:to-[#692a99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Running…
              </>
            ) : (
              <>
                <Play size={14} /> Run Now
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Single Setting Card Component ───────────────────────────────────────────

interface SettingCardProps {
  setting: EngagementSetting;
  userNamesMap: Record<string, string>;
  onSaved: (updated: EngagementSetting) => void;
}

function SettingCard({ setting, userNamesMap, onSaved }: SettingCardProps) {
  const meta = TYPE_META[setting.type];

  const [form, setForm] = useState<UpdateEngagementSettingPayload>({});
  const [showBody, setShowBody] = useState(false);
  const [editorTab, setEditorTab] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const effective = {
    enabled: form.enabled !== undefined ? form.enabled : setting.enabled,
    thresholdDays: form.thresholdDays !== undefined ? form.thresholdDays : setting.thresholdDays,
    subject: form.subject !== undefined ? form.subject : setting.subject,
    bodyHtml: form.bodyHtml !== undefined ? form.bodyHtml : setting.bodyHtml,
  };

  const isDirty = Object.keys(form).length > 0;

  const handleToggleEnabled = () => {
    const next = !effective.enabled;
    setForm((f) => ({ ...f, enabled: next }));
  };

  // Helper to insert snippet/tag into textarea
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setForm((f) => ({ ...f, bodyHtml: (effective.bodyHtml || '') + textToInsert }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = effective.bodyHtml || '';
    const newVal = currentVal.substring(0, start) + textToInsert + currentVal.substring(end);
    
    setForm((f) => ({ ...f, bodyHtml: newVal }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  // Render live preview HTML with sample variable replacements
  const getRenderedPreviewHtml = () => {
    let html = effective.bodyHtml || '';
    meta.variables.forEach((v) => {
      const regex = new RegExp(v.tag.replace(/[{}]/g, '\\$&'), 'g');
      html = html.replace(regex, v.sample);
    });
    return html;
  };

  const handleSave = async () => {
    if (!isDirty) return;

    if (form.thresholdDays !== undefined && (!Number.isInteger(form.thresholdDays) || form.thresholdDays < 1)) {
      toast.error('Threshold days must be a positive integer.');
      return;
    }
    if (form.subject !== undefined && form.subject.trim() === '') {
      toast.error('Subject cannot be empty.');
      return;
    }
    if (form.bodyHtml !== undefined && form.bodyHtml.trim() === '') {
      toast.error('Email body cannot be empty.');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Saving engagement setting…');
    try {
      const payload: UpdateEngagementSettingPayload = {};
      if (form.enabled !== undefined) payload.enabled = form.enabled;
      if (form.thresholdDays !== undefined) payload.thresholdDays = form.thresholdDays;
      if (form.subject !== undefined) payload.subject = form.subject.trim();
      if (form.bodyHtml !== undefined) payload.bodyHtml = form.bodyHtml;

      const res = await engagementApi.update(setting.type, payload);
      const updatedData = res?.data;
      if (updatedData) {
        toast.success('Setting saved successfully', { id: toastId });
        setForm({});
        onSaved(updatedData);
      } else {
        toast.error((res as any)?.message || 'Failed to save setting', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save setting', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => setForm({});

  const updatedByName = setting.updatedBy ? (userNamesMap[setting.updatedBy] || setting.updatedBy) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border ${meta.bg} ${meta.accent}`}>{meta.icon}</div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">{meta.label}</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">{meta.description}</p>
          </div>
        </div>

        <button
          onClick={handleToggleEnabled}
          title={effective.enabled ? 'Disable' : 'Enable'}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs border transition ${
            effective.enabled
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
          }`}
        >
          {effective.enabled ? (
            <>
              <ToggleRight size={18} className="text-emerald-600" /> Enabled
            </>
          ) : (
            <>
              <ToggleLeft size={18} className="text-gray-400" /> Disabled
            </>
          )}
        </button>
      </div>

      {/* Disabled banner */}
      <AnimatePresence>
        {!effective.enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center gap-2 text-xs text-gray-500 font-semibold"
          >
            <XCircle size={14} className="text-gray-400 shrink-0" />
            This reminder type is currently <span className="font-extrabold text-gray-700 ml-0.5">disabled</span> — no emails will be sent.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fields */}
      <div className="p-6 space-y-5">
        {/* Threshold days */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
          <div className="flex-1">
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} className="text-[#9d4ae3]" /> Threshold Days
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                step={1}
                value={effective.thresholdDays}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setForm((f) => ({ ...f, thresholdDays: isNaN(val) ? 1 : val }));
                }}
                className="w-28 px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 transition font-black text-slate-800"
              />
              <span className="text-xs text-slate-500 font-medium">
                days of inactivity before a reminder email is automatically triggered
              </span>
            </div>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={14} className="text-[#9d4ae3]" /> Email Subject
            </span>
          </label>
          <input
            type="text"
            value={effective.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder="e.g. We miss you at Faflora!"
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 transition font-semibold text-slate-800"
          />
        </div>

        {/* Rich HTML Body Editor & Live Preview */}
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
          {/* Header Toggle */}
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowBody((v) => !v)}
              className="flex items-center gap-2 text-xs font-extrabold text-[#9d4ae3] hover:underline"
            >
              {showBody ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showBody ? 'Hide Email Body Editor' : 'Edit Email Body (Rich HTML & Live Preview)'}
            </button>

            {showBody && (
              <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEditorTab('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    editorTab === 'edit' ? 'bg-white text-[#9d4ae3] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code size={13} /> Code (HTML)
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    editorTab === 'preview' ? 'bg-white text-[#9d4ae3] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye size={13} /> Live Preview
                </button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showBody && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {editorTab === 'edit' ? (
                  <div className="p-4 space-y-4">
                    {/* HTML Quick Formatting Toolbar */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[10px] font-black uppercase text-slate-400 mr-1 flex items-center gap-1">
                        <Type size={12} /> Format:
                      </span>
                      <button
                        type="button"
                        onClick={() => insertTextAtCursor('<p>Paragraph text here...</p>')}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 text-slate-700 hover:text-[#9d4ae3] border rounded-lg font-bold transition flex items-center gap-1"
                        title="Add Paragraph"
                      >
                        <Type size={12} /> Paragraph
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTextAtCursor('<h3>Heading Title</h3>')}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 text-slate-700 hover:text-[#9d4ae3] border rounded-lg font-black transition"
                        title="Add Heading"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTextAtCursor('<strong>Bold text</strong>')}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 text-slate-700 hover:text-[#9d4ae3] border rounded-lg font-bold transition"
                        title="Bold text"
                      >
                        <Bold size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTextAtCursor('<em>Italic text</em>')}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 text-slate-700 hover:text-[#9d4ae3] border rounded-lg font-bold transition"
                        title="Italic text"
                      >
                        <Italic size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          insertTextAtCursor(
                            '<p><a href="{{frontendUrl}}" style="display:inline-block; background-color:#9d4ae3; color:#ffffff; padding:12px 24px; border-radius:12px; font-weight:bold; text-decoration:none;">Action Button →</a></p>'
                          )
                        }
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 text-slate-700 hover:text-[#9d4ae3] border rounded-lg font-bold transition flex items-center gap-1"
                        title="Add Button"
                      >
                        <LinkIcon size={12} /> Button
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTextAtCursor('<hr style="border:0; border-top:1px solid #e2e8f0; margin:16px 0;" />')}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 text-slate-700 hover:text-[#9d4ae3] border rounded-lg font-bold transition"
                        title="Add Divider"
                      >
                        Divider
                      </button>
                    </div>

                    {/* Template Variables Toolbar */}
                    <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-purple-900 mb-2">
                        <Sparkles size={13} className="text-[#9d4ae3]" /> Click to insert template variables into HTML:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {meta.variables.map((v) => (
                          <button
                            key={v.tag}
                            type="button"
                            onClick={() => insertTextAtCursor(v.tag)}
                            className="bg-white hover:bg-[#9d4ae3] text-purple-700 hover:text-white border border-purple-200 px-3 py-1 rounded-xl text-xs font-mono font-bold transition shadow-2xs flex items-center gap-1"
                            title={`Insert ${v.label}`}
                          >
                            <span>{v.tag}</span>
                            <span className="text-[10px] opacity-75 font-sans font-medium">({v.label})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Code Textarea */}
                    <textarea
                      ref={textareaRef}
                      rows={10}
                      value={effective.bodyHtml}
                      onChange={(e) => setForm((f) => ({ ...f, bodyHtml: e.target.value }))}
                      placeholder="<p>Enter your email HTML body here...</p>"
                      className="w-full px-4 py-3 text-xs font-mono border border-slate-200 rounded-xl bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#9d4ae3] transition resize-y leading-relaxed"
                    />
                  </div>
                ) : (
                  /* Live Email Preview Tab */
                  <div className="p-5 bg-slate-100 min-h-[350px]">
                    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                      {/* Fake Email Header */}
                      <div className="bg-slate-50 border-b border-slate-200 p-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-extrabold text-slate-700">From: Faflora Notifications &lt;no-reply@faflora.com&gt;</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">Simulated Email</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          <span className="font-bold text-slate-400">Subject:</span>{' '}
                          <span className="font-extrabold text-slate-800">{effective.subject || '(No subject specified)'}</span>
                        </div>
                      </div>

                      {/* Rendered Email Content Body */}
                      <div
                        className="p-6 text-sm text-slate-800 leading-relaxed font-sans prose prose-purple max-w-none"
                        dangerouslySetInnerHTML={{ __html: getRenderedPreviewHtml() }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Audit info */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 border border-gray-100 text-[11px] text-gray-500 font-semibold flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <UserIcon size={14} className="text-[#9d4ae3] shrink-0" />
            <span>
              Updated by{' '}
              <span className="text-slate-800 font-extrabold mx-0.5">
                {updatedByName || 'System Default'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock size={12} />
            <span>{formatDate(setting.updatedAt)}</span>
          </div>
        </div>

        {/* Save / Discard actions */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex items-center gap-3 pt-2"
            >
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white text-xs font-bold rounded-xl shadow-md hover:from-[#8236be] hover:to-[#692a99] transition disabled:opacity-50"
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={handleDiscard}
                disabled={isSaving}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition disabled:opacity-50"
              >
                Discard
              </button>
              <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                <AlertTriangle size={12} /> Unsaved changes
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main View Component ─────────────────────────────────────────────────────

export default function EngagementSettingsView() {
  const [settings, setSettings] = useState<EngagementSetting[]>([]);
  const [userNamesMap, setUserNamesMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [runResult, setRunResult] = useState<RunNowResponse | null>(null);
  const [showResult, setShowResult] = useState(false);

  const resolveUserNames = async (items: EngagementSetting[]) => {
    const uniqueIds = new Set(items.map((s) => s.updatedBy).filter(Boolean) as string[]);
    if (uniqueIds.size === 0) return;

    try {
      // Fetch all admins & super-admins in one go — engagement settings are only touched by them
      const [adminRes, superAdminRes] = await Promise.allSettled([
        authApi.searchUsers({ role: 'admin', limit: 100 }),
        authApi.searchUsers({ role: 'super-admin', limit: 100 }),
      ]);

      const allUsers: any[] = [];

      if (adminRes.status === 'fulfilled' && adminRes.value) {
        const d = adminRes.value.data;
        const users = Array.isArray(d?.users) ? d.users
          : Array.isArray(d?.data) ? d.data
          : Array.isArray(d) ? d : [];
        allUsers.push(...users);
      }
      if (superAdminRes.status === 'fulfilled' && superAdminRes.value) {
        const d = superAdminRes.value.data;
        const users = Array.isArray(d?.users) ? d.users
          : Array.isArray(d?.data) ? d.data
          : Array.isArray(d) ? d : [];
        allUsers.push(...users);
      }

      const map: Record<string, string> = { ...userNamesMap };
      for (const u of allUsers) {
        const uid = u.id || u._id;
        if (!uid) continue;
        const displayName =
          u.fullName ||
          `${u.firstName || ''} ${u.lastName || ''}`.trim() ||
          u.email ||
          uid;
        map[uid] = displayName;
      }

      setUserNamesMap(map);
    } catch (e) {
      console.error('Failed to resolve admin user names:', e);
    }
  };

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await engagementApi.list();
      const data = res?.data ?? (Array.isArray(res) ? (res as any) : null);
      if (Array.isArray(data)) {
        setSettings(data);
        void resolveUserNames(data);
      } else {
        toast.error('Failed to load engagement settings.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load engagement settings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleRunNow = async () => {
    setIsRunning(true);
    const toastId = toast.loading('Running engagement email sweep…');
    try {
      const res = await engagementApi.runNow();
      const data: any = res?.data ?? res;
      if (data && (data.customer_inactivity || data.vendorIncompleteRegistration || data.message)) {
        toast.success('Sweep completed — check results below.', { id: toastId });
        setRunResult(data as RunNowResponse);
        setShowResult(true);
      } else {
        toast.error((res as any)?.message || 'Sweep failed or returned no data.', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Sweep failed.', { id: toastId });
    } finally {
      setIsRunning(false);
      setShowConfirm(false);
    }
  };

  const handleSettingSaved = (updated: EngagementSetting) => {
    setSettings((prev) => prev.map((s) => (s.type === updated.type ? updated : s)));
    if (updated.updatedBy) {
      void resolveUserNames([updated]);
    }
  };

  const ordered: EngagementEmailType[] = ['customer_inactivity', 'vendor_incomplete_registration'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Mail className="text-[#9d4ae3]" size={24} />
            Engagement Settings
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Control how often Faflora sends automated reminder emails to inactive customers and vendors who have not finished registration.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSettings}
            disabled={isLoading}
            title="Refresh"
            className="p-2.5 text-gray-500 hover:text-slate-800 hover:bg-gray-100 rounded-xl transition border"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isLoading || isRunning}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:from-[#8236be] hover:to-[#692a99] text-white rounded-xl font-bold text-sm shadow-sm transition disabled:opacity-50"
          >
            {isRunning ? (
              <><RefreshCw size={15} className="animate-spin" /> Running…</>
            ) : (
              <><Zap size={15} /> Run Now</>
            )}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-4 flex items-start gap-3">
        <Info className="text-[#9d4ae3] shrink-0 mt-0.5" size={18} />
        <div className="text-xs text-purple-900 leading-relaxed space-y-1">
          <p className="font-bold">How Engagement Emails Work</p>
          <ul className="list-disc list-inside text-purple-800/90 space-y-0.5">
            <li>The system sweeps automatically on a scheduled interval to find eligible recipients.</li>
            <li>
              Use <span className="font-bold">Run Now</span> to trigger an immediate sweep — this sends real emails.
            </li>
            <li>
              When a type is <span className="font-bold">disabled</span>, no emails are sent regardless of eligibility.
            </li>
            <li>Only the fields you change are sent in the update payload (partial update).</li>
          </ul>
        </div>
      </div>

      {/* Setting Cards */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-400">
          <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-[#9d4ae3]" />
          <p className="text-sm font-semibold">Loading engagement settings…</p>
        </div>
      ) : settings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border">
          <Mail size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="font-bold text-slate-700">No engagement settings found</p>
          <p className="text-xs text-gray-400 mt-1">Please ensure the backend has seeded the default settings.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {ordered.map((type) => {
            const setting = settings.find((s) => s.type === type);
            if (!setting) return null;
            return (
              <SettingCard
                key={type}
                setting={setting}
                userNamesMap={userNamesMap}
                onSaved={handleSettingSaved}
              />
            );
          })}
        </div>
      )}

      {/* Confirm Run-Now Modal */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmRunNowModal
            onConfirm={handleRunNow}
            onCancel={() => setShowConfirm(false)}
            isRunning={isRunning}
          />
        )}
      </AnimatePresence>

      {/* Run-Now Results Modal */}
      <AnimatePresence>
        {showResult && runResult && (
          <RunNowModal
            result={runResult}
            onClose={() => {
              setShowResult(false);
              setRunResult(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
