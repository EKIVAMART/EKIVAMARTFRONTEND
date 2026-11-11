'use client';

import React, { useState, useEffect } from 'react';
import { Percent, Plus, Trash2, Edit2, ShieldAlert, CheckCircle2, XCircle, RefreshCw, Globe } from 'lucide-react';
import { taxRuleApi, TaxRuleData } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaxRulesView() {
  const [taxRules, setTaxRules] = useState<TaxRuleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRule, setEditingRule] = useState<TaxRuleData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    country: 'NG',
    region: '',
    ratePercentage: 10,
    isActive: true,
  });

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await taxRuleApi.getTaxRules();
      if (res?.success && Array.isArray(res.data)) {
        setTaxRules(res.data);
      } else if (Array.isArray(res)) {
        setTaxRules(res as any);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load tax rules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const openCreateModal = () => {
    setEditingRule(null);
    setFormData({
      country: 'NG',
      region: '',
      ratePercentage: 10,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rule: TaxRuleData) => {
    setEditingRule(rule);
    setFormData({
      country: rule.country,
      region: rule.region || '',
      ratePercentage: Math.round(rule.ratePercentage * 1000) / 10,
      isActive: rule.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.ratePercentage < 0 || formData.ratePercentage > 100) {
      toast.error('Tax rate must be between 0% and 100%.');
      return;
    }

    const decimalRate = formData.ratePercentage / 100;
    setIsSaving(true);
    const toastId = toast.loading(editingRule ? 'Updating tax rule...' : 'Creating tax rule...');

    try {
      if (editingRule) {
        const res = await taxRuleApi.updateTaxRule(editingRule.id, {
          ratePercentage: decimalRate,
          isActive: formData.isActive,
        });
        if (res?.success) {
          toast.success('Tax rule updated successfully', { id: toastId });
          setIsModalOpen(false);
          fetchRules();
        } else {
          toast.error(res?.message || 'Failed to update tax rule', { id: toastId });
        }
      } else {
        const res = await taxRuleApi.createTaxRule({
          country: formData.country.toUpperCase(),
          region: formData.region ? formData.region.trim() : null,
          ratePercentage: decimalRate,
        });
        if (res?.success) {
          toast.success('Tax rule created successfully', { id: toastId });
          setIsModalOpen(false);
          fetchRules();
        } else {
          toast.error(res?.message || 'Failed to create tax rule', { id: toastId });
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Operation failed', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax rule?')) return;
    const toastId = toast.loading('Deleting tax rule...');
    try {
      const res = await taxRuleApi.deleteTaxRule(id);
      if (res?.success) {
        toast.success('Tax rule deleted successfully', { id: toastId });
        fetchRules();
      } else {
        toast.error(res?.message || 'Failed to delete tax rule', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete tax rule', { id: toastId });
    }
  };

  const handleToggleActive = async (rule: TaxRuleData) => {
    const toastId = toast.loading('Updating rule status...');
    try {
      const res = await taxRuleApi.updateTaxRule(rule.id, {
        isActive: !rule.isActive,
      });
      if (res?.success) {
        toast.success(`Tax rule ${!rule.isActive ? 'activated' : 'deactivated'}`, { id: toastId });
        fetchRules();
      } else {
        toast.error(res?.message || 'Failed to update status', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-md border shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Percent className="text-[#228b22]" size={24} />
            Tax Configuration & Rates
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage regional tax rules and jurisdiction rates. Tax rates are fully configurable.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRules}
            disabled={isLoading}
            className="p-2.5 text-gray-500 hover:text-slate-800 hover:bg-gray-100 rounded-md transition border"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#228b22] hover:bg-[#1c711c] text-white rounded-md font-bold text-sm shadow-sm transition"
          >
            <Plus size={16} /> Add Tax Rule
          </button>
        </div>
      </div>

      {/* Policy Banner */}
      <div className="bg-brand-50/80 border border-brand-200/80 rounded-md p-4 flex items-start gap-3">
        <ShieldAlert className="text-[#228b22]" size={20} />
        <div className="text-xs text-brand-900 leading-relaxed">
          <p className="font-bold mb-0.5">Flexible Tax Rates Active</p>
          <p className="text-brand-800/90">
            Configure jurisdiction and region-specific tax rates to any desired percentage. The matched active rule will be applied to the order subtotal during checkout.
          </p>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-md border shadow-xs overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Configured Regional Rules</h3>
          <span className="text-xs font-semibold text-gray-500">{taxRules.length} Rules Configured</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#228b22]" />
            <p className="text-sm font-medium">Loading tax rules...</p>
          </div>
        ) : taxRules.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Globe size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="font-bold text-slate-700 text-sm">No custom regional rules configured</p>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              All checkout orders currently use the platform default tax rate of 10% (0.10). Click &ldquo;Add Tax Rule&rdquo; to add region-specific configurations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b">
                <tr>
                  <th className="py-3.5 px-6">Country</th>
                  <th className="py-3.5 px-6">Region / State</th>
                  <th className="py-3.5 px-6">Rate (%)</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Last Updated</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {taxRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-brand-100 text-[#228b22] text-xs font-black flex items-center justify-center">
                        {rule.country.substring(0, 2)}
                      </span>
                      {rule.country}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {rule.region || <span className="text-gray-400 italic">All regions (Country-wide)</span>}
                    </td>
                    <td className="py-4 px-6 font-bold text-[#228b22]">
                      {(rule.ratePercentage * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition ${
                          rule.isActive
                            ? 'bg-emerald-50 text-slate-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {rule.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {rule.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {rule.updatedAt ? new Date(rule.updatedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(rule)}
                        className="p-1.5 text-gray-400 hover:text-slate-800 hover:bg-gray-100 rounded-lg transition"
                        title="Edit rule"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1.5 text-gray-400 hover:text-slate-900 hover:bg-rose-50 rounded-lg transition"
                        title="Delete rule"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Tax Rule Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[3px] ">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border"
            >
              <div className="bg-[#228b22] px-6 py-4 text-white flex justify-between items-center">
                <h3 className="font-bold text-lg">
                  {editingRule ? 'Edit Tax Rule' : 'Add Regional Tax Rule'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-md transition"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country Code *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingRule}
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                    placeholder="NG"
                    maxLength={3}
                    className="w-full px-3.5 py-2.5 text-sm border rounded-md bg-slate-50 focus:outline-none focus:border-[#228b22] uppercase font-bold disabled:opacity-60"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">2 or 3 letter ISO country code (e.g. NG, US, UK, GH)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Region / State (Optional)</label>
                  <input
                    type="text"
                    disabled={!!editingRule}
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="e.g. Lagos, Abuja, Rivers (leave blank for country-wide)"
                    className="w-full px-3.5 py-2.5 text-sm border rounded-md bg-slate-50 focus:outline-none focus:border-[#228b22] disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tax Rate (%) * <span className="text-[#228b22] font-semibold">(0% - 100%)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      step={0.1}
                      value={formData.ratePercentage}
                      onChange={(e) => setFormData({ ...formData, ratePercentage: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 pr-8 text-sm border rounded-md bg-slate-50 focus:outline-none focus:border-[#228b22] font-bold text-slate-800"
                    />
                    <span className="absolute right-3.5 top-2.5 text-gray-400 font-bold text-sm">%</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">
                    Enter percentage value (e.g. 5 for 5%, 7.5 for 7.5%, 10 for 10%).
                  </p>
                </div>

                {editingRule && (
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded text-[#228b22] focus:ring-[#228b22] w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-700">Tax rule is active</span>
                    </label>
                  </div>
                )}

                <div className="pt-4 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-md transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-[#228b22] hover:bg-[#1c711c] rounded-md shadow-sm transition disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
