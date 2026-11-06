'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
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

export default function TaxRulesManagement() {
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [country, setCountry] = useState('Nigeria');
  const [region, setRegion] = useState('');
  const [ratePercentage, setRatePercentage] = useState(7.5);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState(7.5);
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

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country.trim()) return;
    setSubmitting(true);
    try {
      const res = await taxRulesApi.create({
        country: country.trim(),
        region: region.trim() || null,
        ratePercentage: ratePercentage / 100, // Convert e.g. 7.5% -> 0.075
      });
      if (res?.success) {
        toast.success('Tax rule created successfully');
        setShowAddForm(false);
        setRegion('');
        setRatePercentage(7.5);
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
    setEditingId(rule.id);
    setEditRate(rule.ratePercentage * 100);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    setSavingEdit(true);
    try {
      const res = await taxRulesApi.update(id, { ratePercentage: editRate / 100 });
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
    if (!confirm('Are you sure you want to delete this tax rule?')) return;
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

  return (
    <div className="space-y-5">

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tax rules</h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="self-start sm:self-center min-h-10 px-4 bg-[#176a35] hover:bg-[#12582b] text-white text-sm font-medium flex items-center gap-1.5"
        >
          {showAddForm ? <X size={15} /> : <Plus size={15} />}
          {showAddForm ? 'Close form' : 'Add rule'}
        </button>
      </div>

      {/* Add Tax Rule Drawer Form */}
      {showAddForm && (
        <form onSubmit={handleCreateRule} className="bg-white p-5 border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label htmlFor="tax-country" className="text-xs font-medium text-slate-700">Country</label>
            <input
              id="tax-country"
              type="text"
              required
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-xs bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="tax-region" className="text-xs font-medium text-slate-700">Region or state (optional)</label>
            <input
              id="tax-region"
              type="text"
              placeholder="e.g. Lagos (leave blank for country default)"
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-xs bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="tax-rate" className="text-xs font-medium text-slate-700">Tax rate (%)</label>
            <div className="relative">
              <input
                id="tax-rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={ratePercentage}
                onChange={e => setRatePercentage(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded-md text-xs bg-white focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-10 bg-[#176a35] hover:bg-[#12582b] text-white text-sm font-medium"
          >
            {submitting ? 'Saving…' : 'Add rule'}
          </button>
        </form>
      )}

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
              {rules.map((rule) => {
                const isEditing = editingId === rule.id;
                return (
                  <tr key={rule.id} className="hover:bg-gray-50/40 transition">
                    <td className="p-4 font-medium text-slate-800">
                      {rule.country === 'NG' ? 'Nigeria' : rule.country} {rule.region && <span className="font-normal text-slate-500">· {rule.region}</span>}
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 max-w-[100px]">
                          <input
                            aria-label="Tax rate percentage"
                            type="number"
                            step="0.01"
                            value={editRate}
                            onChange={e => setEditRate(parseFloat(e.target.value))}
                            className="w-full px-2 py-1 border rounded focus:outline-none"
                          />
                          <span className="font-bold">%</span>
                        </div>
                      ) : (
                        `${(rule.ratePercentage * 100).toFixed(2)}%`
                      )}
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
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button type="button"
                              onClick={() => handleSaveEdit(rule.id)}
                              disabled={savingEdit}
                              className="p-1.5 text-[#176a35] hover:underline"
                              aria-label="Save tax rate"
                            >
                              <Save size={14} />
                            </button>
                            <button type="button"
                              onClick={handleCancelEdit}
                              className="p-1.5 text-slate-600 hover:underline"
                              aria-label="Cancel editing"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button"
                              onClick={() => handleStartEdit(rule)}
                              className="p-1.5 text-slate-600 hover:text-[#176a35]"
                              aria-label={`Edit tax rate for ${rule.country}`}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button type="button"
                              onClick={() => handleToggleStatus(rule.id, rule.isActive)}
                              className="px-2 text-xs font-medium text-slate-600 hover:underline"
                            >
                              {rule.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button type="button"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-700"
                              aria-label={`Delete tax rule for ${rule.country}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
