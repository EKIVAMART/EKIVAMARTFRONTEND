'use client';
import { useDashboardConfirmation } from '@/components/admin/useDashboardConfirmation';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X } from '@/components/ui/platform-icons';
import RecordActions from '@/components/admin/RecordActions';
import { taxRulesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface TaxRule {
  id: string;
  country: string;
  region: string | null;
  ratePercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const isValidRate = (value: number) => Number.isFinite(value) && value >= 0 && value <= 100;

export default function TaxRulesManagement() {
  const { confirm: requestConfirmation, confirmationDialog } = useDashboardConfirmation();
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [country, setCountry] = useState('Nigeria');
  const [region, setRegion] = useState('');
  const [ratePercentage, setRatePercentage] = useState('7.5');
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState('7.5');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await taxRulesApi.list();
      if (res?.success) {
        setRules(res.data || []);
      } else {
        setRules([]);
        setLoadError(res?.message || 'Could not load tax rules.');
      }
    } catch {
      setRules([]);
      setLoadError('Could not load tax rules.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void fetchRules(), 0);
    return () => clearTimeout(timer);
  }, [fetchRules]);

  useEffect(() => {
    if (!showAddForm && !editingId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting && !savingEdit) {
        setShowAddForm(false);
        setEditingId(null);
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onEscape);
    };
  }, [showAddForm, editingId, submitting, savingEdit]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country.trim()) return;
    if (!ratePercentage.trim() || !isValidRate(Number(ratePercentage))) {
      toast.error('Tax rate must be a number between 0% and 100%.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await taxRulesApi.create({
        country: country.trim(),
        region: region.trim() || null,
        ratePercentage: Number(ratePercentage) / 100, // Convert e.g. 7.5% -> 0.075
      });
      if (res?.success) {
        toast.success('Tax rule created successfully');
        setShowAddForm(false);
        setRegion('');
        setRatePercentage('7.5');
        void fetchRules();
      } else {
        toast.error(res?.message || 'Failed to create tax rule');
      }
    } catch {
      toast.error('Failed to create tax rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await taxRulesApi.update(id, { isActive: !currentStatus });
      if (res?.success) {
        toast.success('Status updated successfully');
        void fetchRules();
      } else {
        toast.error(res?.message || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleStartEdit = (rule: TaxRule) => {
    setShowAddForm(false);
    setEditingId(rule.id);
    setEditRate(String(rule.ratePercentage * 100));
  };

  const handleSaveEdit = async (id: string) => {
    if (!editRate.trim() || !isValidRate(Number(editRate))) {
      toast.error('Tax rate must be a number between 0% and 100%.');
      return;
    }
    setSavingEdit(true);
    try {
      const res = await taxRulesApi.update(id, { ratePercentage: Number(editRate) / 100 });
      if (res?.success) {
        toast.success('Tax rate updated successfully');
        setEditingId(null);
        void fetchRules();
      } else {
        toast.error(res?.message || 'Failed to save updates');
      }
    } catch {
      toast.error('Failed to update tax rate');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    const rule = rules.find((r) => r.id === id);
    const label = rule ? [rule.country === 'NG' ? 'Nigeria' : rule.country, rule.region].filter(Boolean).join(' · ') : 'this tax rule';
    if (!(await requestConfirmation(`Are you sure you want to delete the tax rule for ${label}? This cannot be undone.`, { title: "Delete tax rule?", confirmLabel: "Delete tax rule", destructive: true }))) return;
    try {
      const res = await taxRulesApi.delete(id);
      if (res?.success) {
        toast.success('Tax rule deleted successfully');
        void fetchRules();
      } else {
        toast.error(res?.message || 'Failed to delete tax rule');
      }
    } catch {
      toast.error('Failed to delete tax rule');
    }
  };

  const editingRule = rules.find((rule) => rule.id === editingId);
  const closeForm = () => {
    if (submitting || savingEdit) return;
    setShowAddForm(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-5">
      {confirmationDialog}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tax rules</h1>
        </div>
        <button
          type="button"
          onClick={() => { setEditingId(null); setShowAddForm(true); }}
          className="flex min-h-11 items-center gap-2 self-start rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 sm:self-center"
        >
          <Plus size={16} /> Add rule
        </button>
      </div>

      {/* Tax Rules List Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3">
          <div className="w-8 h-8 border-3 border-brand-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-400 font-bold text-xs">Loading tax rules...</p>
        </div>
      ) : loadError ? (
        <div role="alert" className="bg-white border border-slate-200 p-6 text-sm text-slate-700">
          <p>{loadError}</p>
          <button type="button" onClick={() => void fetchRules()} className="mt-3 font-medium text-[#176a35] underline">Retry</button>
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white border border-slate-200 p-6 text-sm text-slate-600">
          No tax rules have been configured.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 bg-white">
          <table className="w-full text-left border-collapse min-w-[600px] text-xs">
            <thead className="bg-gray-50/50 border-b">
              <tr>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Scope / Geography</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tax rate</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((rule) => (
                  <tr key={rule.id} tabIndex={0} aria-label={`Edit tax rule for ${rule.country}${rule.region ? `, ${rule.region}` : ''}`} onClick={() => handleStartEdit(rule)} onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); handleStartEdit(rule); } }} className="cursor-pointer transition-colors hover:bg-emerald-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700">
                    <td className="p-4 font-medium text-slate-800">
                      {rule.country === 'NG' ? 'Nigeria' : rule.country} {rule.region && <span className="font-normal text-slate-500">· {rule.region}</span>}
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {Number.isFinite(Number(rule.ratePercentage))
                        ? `${(Number(rule.ratePercentage) * 100).toFixed(2)}%`
                        : '—'}
                    </td>
                    <td className="p-4">
                      {rule.region ? (
                        <span className="text-slate-600">Region</span>
                      ) : (
                        <span className="text-slate-600">Country</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-slate-700">{rule.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="p-4 text-right">
                      <RecordActions name={`tax rule for ${rule.country}`} actions={[
                            { label: 'Edit rate', onSelect: () => handleStartEdit(rule) },
                            { label: rule.isActive ? 'Deactivate rule' : 'Activate rule', onSelect: () => void handleToggleStatus(rule.id, rule.isActive) },
                            { label: 'Delete rule', onSelect: () => void handleDeleteRule(rule.id), destructive: true },
                          ]} />
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showAddForm || editingRule) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-[3px] sm:p-6 dashboard-dialog-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="tax-rule-dialog-title" className="flex w-full flex-col overflow-hidden bg-white dashboard-dialog dashboard-dialog--form">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-7 dashboard-dialog-header">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Tax settings</p>
                <h2 id="tax-rule-dialog-title" className="text-xl font-semibold tracking-tight text-slate-900">{showAddForm ? 'Add tax rule' : 'Edit tax rate'}</h2>
                <p className="mt-1 text-sm text-slate-600">{showAddForm ? 'Set a rate for a country or a specific region.' : 'Update the rate for this tax rule.'}</p>
              </div>
              <button type="button" onClick={closeForm} disabled={submitting || savingEdit} aria-label="Close tax rule form" className="rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dashboard-dialog-close"><X size={20} /></button>
            </div>

            <form onSubmit={showAddForm ? handleCreateRule : (event) => { event.preventDefault(); if (editingRule) void handleSaveEdit(editingRule.id); }} className="flex min-h-0 flex-col">
              <div className="space-y-5 overflow-y-auto bg-slate-50/60 px-5 py-6 sm:px-7">
                {showAddForm ? (
                  <>
                    <div className="space-y-1.5">
                      <label htmlFor="tax-country" className="text-sm font-medium text-slate-700">Country</label>
                      <input id="tax-country" type="text" required autoFocus value={country} onChange={(event) => setCountry(event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="tax-region" className="text-sm font-medium text-slate-700">Region or state <span className="font-normal text-slate-500">(optional)</span></label>
                      <input id="tax-region" type="text" placeholder="e.g. Lagos" value={region} onChange={(event) => setRegion(event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none" />
                      <p className="text-xs text-slate-500">Leave blank to apply the rate countrywide.</p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Applies to</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{editingRule?.country === 'NG' ? 'Nigeria' : editingRule?.country}{editingRule?.region ? ` · ${editingRule.region}` : ' · Countrywide'}</p>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label htmlFor="tax-rate" className="text-sm font-medium text-slate-700">Tax rate (%)</label>
                  <div className="relative">
                    <input id="tax-rate" type="number" step="0.01" min="0" max="100" required autoFocus={!showAddForm} value={showAddForm ? ratePercentage : editRate} onChange={(event) => showAddForm ? setRatePercentage(event.target.value) : setEditRate(event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none" />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
                <button type="button" onClick={closeForm} disabled={submitting || savingEdit} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={submitting || savingEdit} className="min-h-11 rounded-lg bg-emerald-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 disabled:opacity-50">{submitting || savingEdit ? 'Saving…' : showAddForm ? 'Add rule' : 'Save changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
