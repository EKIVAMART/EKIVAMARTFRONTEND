'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, ToggleLeft, ToggleRight, Globe, AlertCircle, Percent } from 'lucide-react';
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

  useEffect(() => {
    void fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await taxRulesApi.list();
      if (res?.success) {
        setRules(res.data || []);
      }
    } catch {
      toast.error('Could not load tax rules');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create tax rule');
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
    <div className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Percent size={20} className="text-purple-600" /> Regional Tax Rules
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">Manage tax rate percentages for checkout calculations by region or country.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="self-start sm:self-center px-4 py-2 bg-[#9d4ae3] hover:bg-[#8236be] text-white rounded-xl text-xs font-bold transition shadow-md shadow-fuchsia-100 flex items-center gap-1.5"
        >
          {showAddForm ? <X size={15} /> : <Plus size={15} />}
          {showAddForm ? 'Close Drawer' : 'Add New Rule'}
        </button>
      </div>

      {/* Add Tax Rule Drawer Form */}
      {showAddForm && (
        <form onSubmit={handleCreateRule} className="bg-gray-50 p-6 rounded-2xl border border-gray-150 grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-[slideDown_0.2s_ease-out]">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Country</label>
            <input
              type="text"
              required
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Region / State (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Lagos (leave blank for country default)"
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Tax Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={ratePercentage}
                onChange={e => setRatePercentage(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            {submitting ? 'Saving...' : 'Add Rule'}
          </button>
        </form>
      )}

      {/* Tax Rules List Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-400 font-bold text-xs">Loading tax rules...</p>
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-gray-50 border rounded-2xl p-8 text-center flex flex-col items-center">
          <AlertCircle size={24} className="text-gray-300 mb-2" />
          <p className="text-xs text-gray-500 font-semibold">No regional tax rules defined.</p>
          <p className="text-[10px] text-gray-400 mt-1">Nigerian default tax rate of 7.5% is active by default.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-2xl bg-white shadow-sm">
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
                    <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                      <Globe size={14} className="text-gray-400" />
                      {rule.country} {rule.region && <span className="font-normal text-gray-400">• {rule.region}</span>}
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 max-w-[80px]">
                          <input
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
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold">Region Specific</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-semibold">Country Default</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(rule.id, rule.isActive)}
                        className={`transition-colors ${rule.isActive ? 'text-emerald-500' : 'text-gray-300'}`}
                      >
                        {rule.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(rule.id)}
                              disabled={savingEdit}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                              title="Save"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(rule)}
                              className="p-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="Edit Rate"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1.5 bg-rose-50 text-rose-750 hover:bg-rose-100 rounded-lg transition"
                              title="Delete Rule"
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
