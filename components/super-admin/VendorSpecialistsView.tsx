'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Edit2, RefreshCw, Plus, Search, Filter,
  ChevronLeft, ChevronRight, Phone, MapPin, X, User,
  CheckCircle2, XCircle, Calendar, Clock, ToggleLeft, ToggleRight,
  AlertTriangle, Info, Truck,
} from 'lucide-react';
import {
  vendorSpecialistApi,
  VendorSpecialist,
  CreateVendorSpecialistDto,
  UpdateVendorSpecialistDto,
  StateEnumValue,
  STATE_ENUM_VALUES,
} from '@/lib/api';
import toast from 'react-hot-toast';
import RecordActions from '@/components/admin/RecordActions';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

function formatStateLabel(state: string): string {
  if (!state) return '';
  if (state === 'fct') return 'FCT';
  return state
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

const DetailRow = ({
  icon: Icon, label, value, valueClass = '',
}: {
  icon: React.ElementType; label: string; value: React.ReactNode; valueClass?: string;
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-semibold text-slate-800 mt-0.5 break-all ${valueClass}`}>{value}</p>
    </div>
  </div>
);

// ─── View Modal ───────────────────────────────────────────────────────────────

interface ViewModalProps {
  specialist: VendorSpecialist | null;
  onClose: () => void;
  onEdit: (s: VendorSpecialist) => void;
  onDelete: (id: string) => void;
  onToggleActive: (s: VendorSpecialist) => void;
}

function ViewModal({ specialist, onClose, onEdit, onDelete, onToggleActive }: ViewModalProps) {
  if (!specialist) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 "
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
            <div className="flex min-w-0 items-start gap-3">
              <Truck size={22} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Vendor specialist</p>
                <h2 className="truncate text-xl font-semibold text-slate-900">{specialist.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{specialist.contactPhone}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close specialist details" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><X size={20} /></button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              {specialist.isActive ? <CheckCircle2 size={19} className="shrink-0 text-emerald-700" /> : <XCircle size={19} className="shrink-0 text-slate-500" />}
              <div>
                <p className="text-sm font-semibold text-slate-900">{specialist.isActive ? 'Available for assignment' : 'Not in rotation'}</p>
                <p className="mt-1 text-xs text-slate-600">{specialist.isActive ? 'This specialist can be assigned to orders in their state.' : 'This specialist will not be assigned to orders.'}</p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Specialist Details</h3>
              <div className="bg-gray-50/50 rounded-md p-2">
                <DetailRow icon={User} label="Full Name" value={specialist.name} />
                <DetailRow icon={Phone} label="Contact Phone" value={specialist.contactPhone} />
                <DetailRow icon={MapPin} label="Operating State" value={
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-brand-100 text-brand-700 border border-brand-200">
                    {formatStateLabel(specialist.state)}
                  </span>
                } />
                <DetailRow icon={Info} label="Specialist ID" value={
                  <span className="text-[11px] text-gray-400 font-mono break-all">{specialist.id}</span>
                } />
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Timestamps</h3>
              <div className="bg-gray-50/50 rounded-md p-2">
                <DetailRow icon={Calendar} label="Created At" value={formatDateTime(specialist.createdAt)} />
                <DetailRow icon={Clock} label="Last Updated" value={formatDateTime(specialist.updatedAt)} />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 p-4 flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => { onToggleActive(specialist); onClose(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-bold transition ${
                specialist.isActive
                  ? 'bg-amber-50 hover:bg-amber-100 text-slate-600'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-slate-600'
              }`}
            >
              {specialist.isActive
                ? <><ToggleLeft size={15} /> Deactivate</>
                : <><ToggleRight size={15} /> Activate</>}
            </button>
            <button
              onClick={() => { onEdit(specialist); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-md text-sm font-bold transition"
            >
              <Edit2 size={15} /> Edit
            </button>
            <button
              onClick={() => { onDelete(specialist.id); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-slate-500 rounded-md text-sm font-bold transition"
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSpecialist: VendorSpecialist | null;
  onSaved: () => void;
}

function FormModal({ isOpen, onClose, editingSpecialist, onSaved }: FormModalProps) {
  const isEditing = Boolean(editingSpecialist);
  const [form, setForm] = useState({ name: '', contactPhone: '', state: '' as StateEnumValue | '' });
  const [isActiveForm, setIsActiveForm] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingSpecialist) {
      setForm({ name: editingSpecialist.name, contactPhone: editingSpecialist.contactPhone, state: (String(editingSpecialist.state || '').toLowerCase() as StateEnumValue) });
      setIsActiveForm(editingSpecialist.isActive);
    } else {
      setForm({ name: '', contactPhone: '', state: '' });
      setIsActiveForm(true);
    }
  }, [editingSpecialist, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.name || form.name.length < 2 || form.name.length > 150) {
      toast.error('Name must be between 2 and 150 characters.');
      return;
    }
    if (!PHONE_REGEX.test(form.contactPhone)) {
      toast.error('Phone must be E.164 format (e.g. +2348012345678). No spaces or dashes.');
      return;
    }
    if (!form.state || !(STATE_ENUM_VALUES as readonly string[]).includes(form.state)) {
      toast.error('Please select a valid Nigerian state.');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(isEditing ? 'Updating specialist…' : 'Creating specialist…');
    try {
      if (isEditing && editingSpecialist) {
        const dto: UpdateVendorSpecialistDto = {};
        if (form.name !== editingSpecialist.name) dto.name = form.name;
        if (form.contactPhone !== editingSpecialist.contactPhone) dto.contactPhone = form.contactPhone;
        if (form.state !== editingSpecialist.state) dto.state = form.state as StateEnumValue;
        if (isActiveForm !== editingSpecialist.isActive) dto.isActive = isActiveForm;

        if (Object.keys(dto).length === 0) {
          toast.dismiss(toastId);
          onClose();
          return;
        }
        const res = await vendorSpecialistApi.update(editingSpecialist.id, dto);
        if (res?.data || res?.message) {
          toast.success('Specialist updated', { id: toastId });
          onSaved();
          onClose();
        } else {
          toast.error((res as any)?.message || 'Failed to update', { id: toastId });
        }
      } else {
        const dto: CreateVendorSpecialistDto = {
          name: form.name,
          contactPhone: form.contactPhone,
          state: form.state as StateEnumValue,
        };
        const res = await vendorSpecialistApi.create(dto);
        if (res?.data || res?.message) {
          toast.success('Specialist created', { id: toastId });
          onSaved();
          onClose();
        } else {
          toast.error((res as any)?.message || 'Failed to create', { id: toastId });
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Operation failed', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[3px] ">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
              <div className="flex items-center gap-2">
                <Truck size={20} className="text-emerald-700" />
                <h3 className="text-lg font-semibold text-slate-900">
                  {isEditing ? 'Edit Specialist' : 'Add Vendor Specialist'}
                </h3>
              </div>
              <button type="button" onClick={onClose} aria-label="Close specialist form" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={150}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Chinedu Okafor"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-emerald-700 focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">2–150 characters</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={form.contactPhone}
                  onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  placeholder="+2348012345678"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 transition focus:border-emerald-700 focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">E.164 format — no spaces, dashes or leading 0 (e.g. +2348012345678)</p>
                {form.contactPhone && !PHONE_REGEX.test(form.contactPhone) && (
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold flex items-center gap-1">
                    <AlertTriangle size={10} /> Invalid phone format
                  </p>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operating State *</label>
                <select
                  required
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value as StateEnumValue }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-emerald-700 focus:outline-none"
                >
                  <option value="">Select a state…</option>
                  {STATE_ENUM_VALUES.map((s) => (
                    <option key={s} value={s}>{formatStateLabel(s)}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Lowercase value sent to API; display label is capitalized automatically.</p>
              </div>

              {/* isActive — edit only */}
              {isEditing && (
                <div className="flex items-center justify-between py-2 border-t border-gray-100 mt-2">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Active Status</p>
                    <p className="text-[10px] text-gray-400">Set to inactive to remove from rotation without deleting</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActiveForm((v) => !v)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold border transition ${
                      isActiveForm
                        ? 'bg-emerald-50 text-slate-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {isActiveForm ? <><ToggleRight size={15} className="text-slate-600" /> Active</> : <><ToggleLeft size={15} /> Inactive</>}
                  </button>
                </div>
              )}

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-[#228b22] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1c711c] disabled:opacity-50"
                >
                  {isSaving ? 'Saving…' : isEditing ? 'Update Specialist' : 'Create Specialist'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

interface DeleteConfirmProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteConfirmModal({ name, onConfirm, onCancel, isDeleting }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[3px] ">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border p-6 text-center"
      >
        <div className="w-14 h-14 mx-auto rounded-md bg-red-50 border border-red-100 flex items-center justify-center mb-4">
          <Trash2 size={24} className="text-slate-500" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800">Delete Specialist?</h3>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Are you sure you want to delete <span className="font-bold text-slate-700">{name}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 border rounded-md text-sm font-bold hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? <><RefreshCw size={14} className="animate-spin" /> Deleting…</> : <><Trash2 size={14} /> Delete</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

const PAGE_LIMIT = 20;
const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
] as const;

export default function VendorSpecialistsView() {
  const [specialists, setSpecialists] = useState<VendorSpecialist[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'' | 'true' | 'false'>('');
  const [stateFilter, setStateFilter] = useState<StateEnumValue | ''>('');

  // Modals
  const [viewingSpecialist, setViewingSpecialist] = useState<VendorSpecialist | null>(null);
  const [editingSpecialist, setEditingSpecialist] = useState<VendorSpecialist | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSpecialists = useCallback(async (pg = page) => {
    setIsLoading(true);
    try {
      const params: any = { page: pg, limit: PAGE_LIMIT };
      if (activeFilter !== '') params.isActive = activeFilter;
      if (stateFilter) params.state = stateFilter;

      const res = await vendorSpecialistApi.list(params);
      const data = res?.data;
      if (data?.items) {
        setSpecialists(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages || 1);
      } else {
        setSpecialists([]);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load specialists');
    } finally {
      setIsLoading(false);
    }
  }, [page, activeFilter, stateFilter]);

  useEffect(() => {
    loadSpecialists(page);
  }, [page, activeFilter, stateFilter]);

  // Client-side search filter on loaded page
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return specialists;
    const q = searchQuery.toLowerCase();
    return specialists.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.contactPhone.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q)
    );
  }, [specialists, searchQuery]);

  const handleOpenCreate = () => {
    setEditingSpecialist(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (s: VendorSpecialist) => {
    setEditingSpecialist(s);
    setIsFormOpen(true);
  };

  const handleOpenView = (s: VendorSpecialist) => {
    setViewingSpecialist(s);
  };

  const handleToggleActive = async (s: VendorSpecialist) => {
    const toastId = toast.loading(`${s.isActive ? 'Deactivating' : 'Activating'} specialist…`);
    try {
      const res = await vendorSpecialistApi.update(s.id, { isActive: !s.isActive });
      if (res?.data) {
        toast.success(`Specialist ${!s.isActive ? 'activated' : 'deactivated'}`, { id: toastId });
        loadSpecialists(page);
      } else {
        toast.error((res as any)?.message || 'Failed to update', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update', { id: toastId });
    }
  };

  const handleDeleteRequest = (id: string, name: string) => {
    setDeletingId(id);
    setDeletingName(name);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const toastId = toast.loading('Deleting specialist…');
    try {
      await vendorSpecialistApi.delete(deletingId);
      toast.success('Specialist deleted', { id: toastId });
      setDeletingId(null);
      loadSpecialists(page);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const showingTo = Math.min(page * PAGE_LIMIT, total);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Vendor Specialists
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Manage logistics specialists by Nigerian state. Filter by state and availability for order assignment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadSpecialists(page)}
            disabled={isLoading}
            title="Refresh"
            aria-label="Refresh specialists"
            className="p-2.5 text-gray-500 hover:text-slate-800 hover:bg-gray-100 rounded-md transition border"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#228b22] hover:bg-[#1c711c] text-white rounded-md font-bold text-sm shadow-sm transition"
          >
            <Plus size={15} /> Add Specialist
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="bg-white rounded-md border shadow-xs p-4 space-y-3">
        {/* Search */}
        <div className="flex items-center gap-3 border border-gray-200 rounded-md px-3 py-2.5 focus-within:border-[#228b22] focus-within:ring-2 focus-within:ring-[#228b22]/20 transition bg-slate-50">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, phone or state…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status tabs + State filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active status tabs */}
          <div className="flex items-center bg-gray-100 rounded-md p-1 gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setActiveFilter(tab.value as any); setPage(1); }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                  activeFilter === tab.value
                    ? 'bg-white text-[#228b22] shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* State dropdown filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={stateFilter}
              onChange={(e) => { setStateFilter(e.target.value as any); setPage(1); }}
              className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-slate-50 focus:outline-none focus:border-[#228b22] transition font-medium"
            >
              <option value="">All States</option>
              {STATE_ENUM_VALUES.map((s) => (
                <option key={s} value={s}>{formatStateLabel(s)}</option>
              ))}
            </select>
          </div>

          {(activeFilter !== '' || stateFilter) && (
            <button
              onClick={() => { setActiveFilter(''); setStateFilter(''); setPage(1); }}
              className="text-xs font-bold text-[#228b22] hover:underline flex items-center gap-1"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400">
            <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-[#228b22]" />
            <p className="text-sm font-semibold">Loading specialists…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Truck size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-slate-700">No specialists found</p>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery || activeFilter || stateFilter
                ? 'Try adjusting your filters or search query.'
                : 'Click "Add Specialist" to create the first one.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Specialist</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">State</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Created</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr
                      key={s.id}
                      tabIndex={0}
                      aria-label={`View ${s.name} details`}
                      onClick={() => handleOpenView(s)}
                      onKeyDown={(event) => {
                        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault();
                          handleOpenView(s);
                        }
                      }}
                      className="group cursor-pointer border-b transition-colors hover:bg-emerald-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 last:border-0"
                    >
                      {/* Name + Phone */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-brand-100 flex items-center justify-center shrink-0">
                            <Truck size={16} className="text-[#228b22]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-emerald-800">{s.name}</p>
                            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium mt-0.5">
                              <Phone size={10} />
                              {s.contactPhone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* State */}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                          <MapPin size={10} />
                          {formatStateLabel(s.state)}
                        </span>
                      </td>

                      {/* Status toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={(event) => { event.stopPropagation(); handleToggleActive(s); }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter transition border ${
                            s.isActive
                              ? 'bg-emerald-50 text-slate-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                          }`}
                          title={s.isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {s.isActive
                            ? <><CheckCircle2 size={11} /> Active</>
                            : <><XCircle size={11} /> Inactive</>}
                        </button>
                      </td>

                      {/* Created at */}
                      <td className="p-4 text-center">
                        <span className="text-xs text-gray-500 font-medium">{formatDate(s.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <RecordActions name={s.name} actions={[
                          { label: 'View details', onSelect: () => handleOpenView(s) },
                          { label: 'Edit specialist', onSelect: () => handleOpenEdit(s) },
                          { label: 'Delete specialist', onSelect: () => handleDeleteRequest(s.id, s.name), destructive: true },
                        ]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden flex flex-col p-4 space-y-3 bg-gray-50/50">
              {filtered.map((s) => (
                <div key={s.id} role="button" tabIndex={0} aria-label={`View ${s.name} details`} onClick={() => handleOpenView(s)} onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); handleOpenView(s); } }} className="cursor-pointer rounded-md border border-gray-100 bg-white p-4 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-md bg-brand-100 flex items-center justify-center shrink-0">
                        <Truck size={16} className="text-[#228b22]" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium mt-0.5">
                          <Phone size={10} /> {s.contactPhone}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(event) => { event.stopPropagation(); handleToggleActive(s); }}
                      className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase border transition ${
                        s.isActive
                          ? 'bg-emerald-50 text-slate-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {s.isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {s.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3 border-t border-gray-50 pt-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                      <MapPin size={10} /> {formatStateLabel(s.state)}
                    </span>
                    <RecordActions name={s.name} actions={[
                      { label: 'View details', onSelect: () => handleOpenView(s) },
                      { label: 'Edit specialist', onSelect: () => handleOpenEdit(s) },
                      { label: 'Delete specialist', onSelect: () => handleDeleteRequest(s.id, s.name), destructive: true },
                    ]} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {(totalPages > 1 || page > 1) && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
                <span className="text-sm text-gray-500 font-medium hidden sm:block">
                  Showing {showingFrom}–{showingTo} of {total} specialists
                </span>
                <div className="flex items-center gap-1 mx-auto sm:mx-0">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 disabled:opacity-40 transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition text-sm font-medium ${
                        page === pg ? 'bg-[#228b22] text-white font-bold shadow-sm' : 'hover:bg-gray-50 text-gray-500'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 disabled:opacity-40 transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingSpecialist={editingSpecialist}
        onSaved={() => loadSpecialists(page)}
      />

      {viewingSpecialist && (
        <ViewModal
          specialist={viewingSpecialist}
          onClose={() => setViewingSpecialist(null)}
          onEdit={(s) => { setViewingSpecialist(null); handleOpenEdit(s); }}
          onDelete={(id) => { setViewingSpecialist(null); const sp = specialists.find((x) => x.id === id); handleDeleteRequest(id, sp?.name || ''); }}
          onToggleActive={handleToggleActive}
        />
      )}

      <AnimatePresence>
        {deletingId && (
          <DeleteConfirmModal
            name={deletingName}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeletingId(null)}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
