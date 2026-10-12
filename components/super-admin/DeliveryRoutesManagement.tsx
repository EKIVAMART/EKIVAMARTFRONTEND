'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  Grid,
  List,
  DollarSign,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  deliveryRoutesApi,
  DeliveryRoute,
  AvailableState,
  CreateRouteDto,
  PatchRouteDto,
} from '@/lib/api';
import toast from 'react-hot-toast';

interface DeliveryRoutesManagementProps {
  externalSearchQuery?: string;
}

export default function DeliveryRoutesManagement({ externalSearchQuery = '' }: DeliveryRoutesManagementProps) {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [availableStates, setAvailableStates] = useState<AvailableState[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');

  // Filters
  const [searchOrigin, setSearchOrigin] = useState<string>('');
  const [searchDestination, setSearchDestination] = useState<string>('');
  const [activeOnly, setActiveOnly] = useState<boolean>(false);
  const [searchGeneral, setSearchGeneral] = useState<string>('');

  // Sync external search query (from dashboard hero search bar) into internal state
  useEffect(() => {
    setSearchGeneral(externalSearchQuery);
  }, [externalSearchQuery]);

  // Modal / Drawer state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingRoute, setEditingRoute] = useState<DeliveryRoute | null>(null);
  const [modalOrigin, setModalOrigin] = useState<string>('');
  const [modalDestination, setModalDestination] = useState<string>('');
  const [modalFee, setModalFee] = useState<string>('');
  const [isWithinState, setIsWithinState] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Inline edit state
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineFeeValue, setInlineFeeValue] = useState<string>('');

  // Warning Confirmation state for Disable or Delete
  const [confirmAction, setConfirmAction] = useState<{
    type: 'toggle' | 'delete';
    route: DeliveryRoute;
    nextActive?: boolean;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Load routes & deliverable states
  const loadData = async () => {
    setLoading(true);
    try {
      const [routesRes, statesRes] = await Promise.all([
        deliveryRoutesApi.getRoutes({
          originState: searchOrigin || undefined,
          destinationState: searchDestination || undefined,
          activeOnly: activeOnly ? true : undefined,
        }),
        deliveryRoutesApi.getAvailableStates(),
      ]);

      if (routesRes?.success && Array.isArray(routesRes.data)) {
        setRoutes(routesRes.data);
      }
      if (statesRes?.success && Array.isArray(statesRes.data)) {
        setAvailableStates(statesRes.data);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load delivery routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOrigin, searchDestination, activeOnly]);

  // Derived set of all unique states for matrix view & dropdown suggestions
  const allKnownStates = useMemo(() => {
    const set = new Set<string>();
    availableStates.forEach((s) => set.add(s.state));
    routes.forEach((r) => {
      if (r.originState) set.add(r.originState);
      if (r.destinationState) set.add(r.destinationState);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [availableStates, routes]);

  // Matrix Map builder:
  // direct[A][B] = route
  const matrixData = useMemo(() => {
    const directMap = new Map<string, DeliveryRoute>();
    routes.forEach((r) => {
      const key = `${r.originState.toLowerCase()}__${r.destinationState.toLowerCase()}`;
      directMap.set(key, r);
    });
    return directMap;
  }, [routes]);

  // KPI stats
  const stats = useMemo(() => {
    const total = routes.length;
    const withinState = routes.filter((r) => r.isInternal).length;
    const interState = routes.filter((r) => !r.isInternal).length;
    const active = routes.filter((r) => r.isActive).length;
    return { total, withinState, interState, active };
  }, [routes]);

  // Filtered routes list for table view
  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      if (!searchGeneral.trim()) return true;
      const q = searchGeneral.toLowerCase();
      return (
        r.originState.toLowerCase().includes(q) ||
        r.destinationState.toLowerCase().includes(q) ||
        String(r.fee).includes(q)
      );
    });
  }, [routes, searchGeneral]);

  // Handler: Open Add Modal
  const handleOpenAddModal = (prefillOrigin = '', prefillDest = '') => {
    setEditingRoute(null);
    setModalOrigin(prefillOrigin);
    setModalDestination(prefillDest || prefillOrigin);
    setIsWithinState(Boolean(prefillOrigin && prefillDest && prefillOrigin === prefillDest));
    setModalFee('');
    setIsAddModalOpen(true);
  };

  // Handler: Open Edit Fee Modal
  const handleOpenEditModal = (route: DeliveryRoute) => {
    setEditingRoute(route);
    setModalOrigin(route.originState);
    setModalDestination(route.destinationState);
    setIsWithinState(route.isInternal);
    setModalFee(String(route.fee));
    setIsAddModalOpen(true);
  };

  // Handler: Submit Create or Edit Route
  const handleSubmitRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const origin = modalOrigin.trim();
    const destination = isWithinState ? origin : modalDestination.trim();
    const feeNum = Number(modalFee);

    if (!origin || !destination) {
      toast.error('Origin and Destination states are required');
      return;
    }

    if (isNaN(feeNum) || feeNum < 0 || feeNum > 10000000) {
      toast.error('Fee must be a valid amount between ₦0 and ₦10,000,000');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRoute) {
        // Updating existing route fee
        const res = await deliveryRoutesApi.updateRoute(editingRoute.id, { fee: feeNum });
        if (res?.success) {
          toast.success(`Updated route fee to ₦${feeNum.toLocaleString()}`);
          setIsAddModalOpen(false);
          await loadData();
        } else {
          toast.error(res?.message || 'Failed to update route');
        }
      } else {
        // Creating new route
        const res = await deliveryRoutesApi.createRoute({
          originState: origin,
          destinationState: destination,
          fee: feeNum,
        });

        if (res?.success) {
          toast.success(
            origin.toLowerCase() === destination.toLowerCase()
              ? `Configured within-state fee for ${origin}: ₦${feeNum.toLocaleString()}`
              : `Added route ${origin} → ${destination}: ₦${feeNum.toLocaleString()}`
          );
          setIsAddModalOpen(false);
          await loadData();
        } else {
          toast.error(res?.message || 'Failed to create route');
        }
      }
    } catch (err: any) {
      if (err?.statusCode === 409 || err?.message?.includes('already exists')) {
        // 409 pair already exists -> Offer to edit
        toast.error('A delivery route already exists between these states.');
        const existing = routes.find(
          (r) =>
            r.originState.toLowerCase() === origin.toLowerCase() &&
            r.destinationState.toLowerCase() === destination.toLowerCase()
        );
        if (existing) {
          setEditingRoute(existing);
        }
      } else {
        toast.error(err?.message || 'Operation failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Inline fee update
  const handleSaveInlineFee = async (id: string) => {
    const feeNum = Number(inlineFeeValue);
    if (isNaN(feeNum) || feeNum < 0 || feeNum > 10000000) {
      toast.error('Fee must be between ₦0 and ₦10,000,000');
      return;
    }
    const updateToast = toast.loading('Saving fee...');
    try {
      const res = await deliveryRoutesApi.updateRoute(id, { fee: feeNum });
      if (res?.success) {
        toast.success('Fee updated successfully', { id: updateToast });
        setInlineEditingId(null);
        setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, fee: feeNum } : r)));
      } else {
        toast.error(res?.message || 'Failed to update fee', { id: updateToast });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update fee', { id: updateToast });
    }
  };

  // Trigger Disable or Delete with required warning confirmation
  const triggerToggleActive = (route: DeliveryRoute) => {
    const nextActive = !route.isActive;
    if (!nextActive) {
      // Disabling route -> Warn admin
      setConfirmAction({
        type: 'toggle',
        route,
        nextActive: false,
      });
    } else {
      // Enabling route immediately
      executeToggleActive(route, true);
    }
  };

  const executeToggleActive = async (route: DeliveryRoute, nextActive: boolean) => {
    setActionLoading(true);
    try {
      const res = await deliveryRoutesApi.updateRoute(route.id, { isActive: nextActive });
      if (res?.success) {
        toast.success(`Route ${route.originState} → ${route.destinationState} is now ${nextActive ? 'active' : 'disabled'}`);
        setRoutes((prev) => prev.map((r) => (r.id === route.id ? { ...r, isActive: nextActive } : r)));
        setConfirmAction(null);
      } else {
        toast.error(res?.message || 'Failed to update route status');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update route status');
    } finally {
      setActionLoading(false);
    }
  };

  const triggerDelete = (route: DeliveryRoute) => {
    setConfirmAction({
      type: 'delete',
      route,
    });
  };

  const executeDelete = async (route: DeliveryRoute) => {
    setActionLoading(true);
    const delToast = toast.loading('Deleting delivery route...');
    try {
      const res = await deliveryRoutesApi.deleteRoute(route.id);
      if (res?.success) {
        toast.success(`Deleted route ${route.originState} → ${route.destinationState}`, { id: delToast });
        setRoutes((prev) => prev.filter((r) => r.id !== route.id));
        setConfirmAction(null);
      } else {
        toast.error(res?.message || 'Failed to delete route', { id: delToast });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete route', { id: delToast });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#9d4ae3] to-[#8236be] text-white flex items-center justify-center shadow-md shadow-purple-200">
              <Truck size={20} />
            </div>
            Delivery Route & Fee Management
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure shipping leg fees, internal within-state charges, and inter-state matrices for automated Korapay checkout pricing.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => loadData()}
            className="p-2.5 bg-white border border-gray-200 hover:border-purple-300 text-slate-700 hover:text-purple-600 rounded-xl transition text-xs font-bold flex items-center gap-1.5 shadow-xs"
            title="Refresh routes"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2.5 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:from-[#8236be] hover:to-[#692a99] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-purple-200"
          >
            <Plus size={16} />
            Add Delivery Route
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#9d4ae3] flex items-center justify-center">
            <Layers size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Routes</p>
            <p className="text-xl font-black text-slate-800">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Within-State Fees</p>
            <p className="text-xl font-black text-slate-800">{stats.withinState}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Truck size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inter-State Routes</p>
            <p className="text-xl font-black text-slate-800">{stats.interState}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Deliverable</p>
            <p className="text-xl font-black text-slate-800">{availableStates.length} States</p>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search & View Toggle ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Select Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by state or fee..."
              value={searchGeneral}
              onChange={(e) => setSearchGeneral(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-400 focus:bg-white"
            />
          </div>

          <select
            value={searchOrigin}
            onChange={(e) => setSearchOrigin(e.target.value)}
            className="px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-400"
          >
            <option value="">Origin: All States</option>
            {allKnownStates.map((st) => (
              <option key={`orig-${st}`} value={st}>
                Origin: {st}
              </option>
            ))}
          </select>

          <select
            value={searchDestination}
            onChange={(e) => setSearchDestination(e.target.value)}
            className="px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-400"
          >
            <option value="">Destination: All States</option>
            {allKnownStates.map((st) => (
              <option key={`dest-${st}`} value={st}>
                Dest: {st}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600 pl-1">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="rounded text-[#9d4ae3] focus:ring-[#9d4ae3]"
            />
            Active only
          </label>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl self-end md:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'table' ? 'bg-white text-[#9d4ae3] shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <List size={14} /> Table View
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'matrix' ? 'bg-white text-[#9d4ae3] shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Grid size={14} /> Matrix View
          </button>
        </div>
      </div>

      {/* ── View 1: Table View ── */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 uppercase tracking-wider text-[11px] font-extrabold text-gray-500">
                <tr>
                  <th className="py-3.5 px-4">Start State (Origin)</th>
                  <th className="py-3.5 px-4">End State (Destination)</th>
                  <th className="py-3.5 px-4">Route Type</th>
                  <th className="py-3.5 px-4">Delivery Fee (NGN)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <RefreshCw size={24} className="animate-spin mx-auto text-[#9d4ae3] mb-2" />
                      Loading configured delivery routes...
                    </td>
                  </tr>
                ) : filteredRoutes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <Truck size={32} className="mx-auto text-gray-300 mb-2" />
                      No delivery routes found. Click &quot;Add Delivery Route&quot; to configure pricing.
                    </td>
                  </tr>
                ) : (
                  filteredRoutes.map((route) => {
                    const isInline = inlineEditingId === route.id;

                    return (
                      <tr key={route.id} className="hover:bg-purple-50/20 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            {route.originState}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          <span className="flex items-center gap-1.5">
                            <ArrowRight size={12} className="text-gray-400" />
                            {route.destinationState}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {route.isInternal ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <MapPin size={10} /> Within State
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                              <Truck size={10} /> Inter-State Route
                            </span>
                          )}
                        </td>

                        {/* Inline fee editing */}
                        <td className="py-3.5 px-4">
                          {isInline ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                autoFocus
                                value={inlineFeeValue}
                                onChange={(e) => setInlineFeeValue(e.target.value)}
                                className="w-24 px-2 py-1 text-xs border rounded-lg border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-300 font-bold"
                              />
                              <button
                                onClick={() => handleSaveInlineFee(route.id)}
                                className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"
                                title="Save fee"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={() => setInlineEditingId(null)}
                                className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                title="Cancel"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <span className="font-extrabold text-[#9d4ae3] text-sm">
                                ₦{route.fee.toLocaleString()}
                              </span>
                              <button
                                onClick={() => {
                                  setInlineEditingId(route.id);
                                  setInlineFeeValue(String(route.fee));
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-purple-600 transition"
                                title="Click to quick-edit fee"
                              >
                                <Edit2 size={11} />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Active toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => triggerToggleActive(route)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              route.isActive ? 'bg-[#9d4ae3]' : 'bg-gray-300'
                            }`}
                            title={route.isActive ? 'Active (Click to disable)' : 'Disabled (Click to activate)'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                route.isActive ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(route)}
                              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title="Edit route fee"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => triggerDelete(route)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete route"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── View 2: Matrix View ── */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-6 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Grid size={16} className="text-[#9d4ae3]" />
                Inter-State Route Matrix
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Rows represent origin states (where vendor items ship from). Columns represent customer destination states.
                A single entry A → B covers B → A unless set separately (&quot;uses reverse&quot;).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] border rounded-xl">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-20">
                <tr>
                  <th className="p-3 bg-gray-200 font-extrabold text-slate-700 text-left sticky left-0 z-30 min-w-[120px]">
                    Origin \ Dest
                  </th>
                  {allKnownStates.map((dest) => (
                    <th key={`col-${dest}`} className="p-3 font-bold text-slate-700 min-w-[110px] whitespace-nowrap">
                      {dest}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allKnownStates.map((orig) => (
                  <tr key={`row-${orig}`} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800 bg-gray-50 text-left sticky left-0 z-10 whitespace-nowrap border-r">
                      {orig}
                    </td>

                    {allKnownStates.map((dest) => {
                      const isSame = orig.toLowerCase() === dest.toLowerCase();
                      const directKey = `${orig.toLowerCase()}__${dest.toLowerCase()}`;
                      const reverseKey = `${dest.toLowerCase()}__${orig.toLowerCase()}`;

                      const direct = matrixData.get(directKey);
                      const reverse = !direct && !isSame ? matrixData.get(reverseKey) : null;

                      if (direct) {
                        return (
                          <td
                            key={`cell-${orig}-${dest}`}
                            onClick={() => handleOpenEditModal(direct)}
                            className={`p-2 cursor-pointer transition-colors border-r ${
                              isSame ? 'bg-emerald-50/80 hover:bg-emerald-100' : 'bg-purple-50/60 hover:bg-purple-100'
                            }`}
                            title={`Click to edit fee for ${orig} → ${dest}`}
                          >
                            <span className="font-extrabold text-slate-800 block">
                              ₦{direct.fee.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-gray-500 font-semibold block mt-0.5">
                              {isSame ? 'Internal' : direct.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                        );
                      }

                      if (reverse) {
                        return (
                          <td
                            key={`cell-${orig}-${dest}`}
                            onClick={() => handleOpenAddModal(orig, dest)}
                            className="p-2 cursor-pointer bg-slate-50/90 hover:bg-slate-100 transition-colors border-r"
                            title={`Pricing uses reverse (${dest} → ${orig}). Click to set distinct rate.`}
                          >
                            <span className="font-bold text-slate-600 block">
                              ₦{reverse.fee.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-amber-600 font-bold block mt-0.5">
                              uses reverse
                            </span>
                          </td>
                        );
                      }

                      // Empty cell
                      return (
                        <td
                          key={`cell-${orig}-${dest}`}
                          onClick={() => handleOpenAddModal(orig, dest)}
                          className="p-2 cursor-pointer hover:bg-purple-50/50 text-gray-300 font-bold transition-colors border-r text-center"
                          title={`No route configured between ${orig} and ${dest}. Click to add.`}
                        >
                          <span className="text-gray-300 hover:text-purple-600">+ Add</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add / Edit Route Modal ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsAddModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-gray-150 z-10"
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Truck size={18} className="text-[#9d4ae3]" />
                  {editingRoute ? 'Edit Delivery Route Fee' : 'Add New Delivery Route'}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitRoute} className="space-y-4">
                {/* Same State Switch */}
                {!editingRoute && (
                  <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-purple-900">Within-State Rate</p>
                      <p className="text-[10px] text-purple-700">Set base last-mile fee for delivery within the same state</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isWithinState}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setIsWithinState(val);
                          if (val && modalOrigin) {
                            setModalDestination(modalOrigin);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#9d4ae3]" />
                    </label>
                  </div>
                )}

                {/* Origin State */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Origin State (Ships From) *
                  </label>
                  {editingRoute ? (
                    <input
                      type="text"
                      disabled
                      value={editingRoute.originState}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-500"
                    />
                  ) : (
                    <div>
                      <input
                        type="text"
                        required
                        list="origin-states-list"
                        placeholder="e.g. Lagos, Abuja, Abia..."
                        value={modalOrigin}
                        onChange={(e) => {
                          const val = e.target.value;
                          setModalOrigin(val);
                          if (isWithinState) setModalDestination(val);
                        }}
                        className="w-full px-3 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 bg-slate-50/50"
                      />
                      <datalist id="origin-states-list">
                        {allKnownStates.map((st) => (
                          <option key={st} value={st} />
                        ))}
                      </datalist>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Select an existing state or type a new state name.
                      </p>
                    </div>
                  )}
                </div>

                {/* Destination State */}
                {!isWithinState && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Destination State (Delivered To) *
                    </label>
                    {editingRoute ? (
                      <input
                        type="text"
                        disabled
                        value={editingRoute.destinationState}
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-500"
                      />
                    ) : (
                      <div>
                        <input
                          type="text"
                          required
                          list="dest-states-list"
                          placeholder="e.g. Enugu, Rivers, Kano..."
                          value={modalDestination}
                          onChange={(e) => setModalDestination(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 bg-slate-50/50"
                        />
                        <datalist id="dest-states-list">
                          {allKnownStates.map((st) => (
                            <option key={st} value={st} />
                          ))}
                        </datalist>
                      </div>
                    )}
                  </div>
                )}

                {/* Fee */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Route Delivery Fee (NGN) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                      ₦
                    </span>
                    <input
                      type="number"
                      required
                      min={0}
                      max={10000000}
                      placeholder="e.g. 3500"
                      value={modalFee}
                      onChange={(e) => setModalFee(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 text-xs font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 bg-slate-50/50"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Amount between ₦0 and ₦10,000,000.</p>
                </div>

                {editingRoute && (
                  <p className="text-[11px] text-gray-400 italic">
                    Note: Start and end states cannot be changed once created. To change state names, delete this route and create a new one.
                  </p>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white rounded-xl text-xs font-bold hover:opacity-90 transition disabled:opacity-50 shadow-md shadow-purple-200"
                  >
                    {submitting ? 'Saving...' : editingRoute ? 'Update Fee' : 'Save Route'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Warning Confirmation Dialog on Disable or Delete ── */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setConfirmAction(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-red-100 z-10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={24} />
              </div>

              <h3 className="text-base font-extrabold text-slate-800 mb-1">
                {confirmAction.type === 'delete' ? 'Delete Delivery Route?' : 'Disable Delivery Route?'}
              </h3>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 my-3 text-left">
                <p className="text-xs text-amber-800 font-bold mb-1">Impact Warning:</p>
                <p className="text-[11px] text-amber-700 leading-snug">
                  Customers ordering items shipping between{' '}
                  <span className="font-extrabold">{confirmAction.route.originState}</span> and{' '}
                  <span className="font-extrabold">{confirmAction.route.destinationState}</span> will be unable to check out until this route is active!
                </p>
              </div>

              <p className="text-xs text-gray-500 mb-5">
                Current fee: <span className="font-bold">₦{confirmAction.route.fee.toLocaleString()}</span>.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    if (confirmAction.type === 'delete') {
                      executeDelete(confirmAction.route);
                    } else {
                      executeToggleActive(confirmAction.route, confirmAction.nextActive ?? false);
                    }
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-200"
                >
                  {actionLoading ? 'Processing...' : confirmAction.type === 'delete' ? 'Yes, Delete' : 'Yes, Disable'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
