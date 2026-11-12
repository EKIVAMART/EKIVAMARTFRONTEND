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
  const [loadError, setLoadError] = useState<string | null>(null);
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
    setLoadError(null);
    try {
      const [routesResult, statesResult] = await Promise.allSettled([
        deliveryRoutesApi.getRoutes({
          originState: searchOrigin || undefined,
          destinationState: searchDestination || undefined,
          activeOnly: activeOnly ? true : undefined,
        }),
        deliveryRoutesApi.getAvailableStates(),
      ]);

      if (statesResult.status === 'fulfilled' && statesResult.value?.success && Array.isArray(statesResult.value.data)) {
        setAvailableStates(statesResult.value.data);
      }
      if (routesResult.status === 'rejected') {
        throw routesResult.reason;
      }
      if (!routesResult.value?.success || !Array.isArray(routesResult.value.data)) {
        throw new Error(routesResult.value?.message || 'Failed to load delivery routes.');
      }
      setRoutes(routesResult.value.data);
    } catch (err: any) {
      setRoutes([]);
      setLoadError(err?.statusCode === 403 ? 'You do not have permission to view delivery routes.' : (err?.message || 'Failed to load delivery routes.'));
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Delivery routes</h1>
        <button type="button" onClick={() => handleOpenAddModal()}
          className="inline-flex min-h-10 items-center gap-2 bg-[#176a35] px-4 text-sm font-medium text-white hover:bg-[#12582b]">
          <Plus size={16} aria-hidden="true" /> Add route
        </button>
      </div>

      {!loading && !loadError && <div className="flex flex-wrap gap-x-7 gap-y-2 text-xs text-slate-600">
        <span><strong className="font-semibold text-slate-900">{stats.total}</strong> routes</span>
        <span><strong className="font-semibold text-slate-900">{stats.active}</strong> active</span>
        <span><strong className="font-semibold text-slate-900">{stats.withinState}</strong> within state</span>
        <span><strong className="font-semibold text-slate-900">{stats.interState}</strong> between states</span>
      </div>}

            {/* ── Toolbar: Search & View Toggle ── */}
      <div className="bg-white p-3 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search & Select Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              aria-label="Search delivery routes"
              placeholder="Search routes"
              value={searchGeneral}
              onChange={(e) => setSearchGeneral(e.target.value)}
              className="w-full min-h-10 pl-9 pr-3 bg-white border border-slate-300 text-sm"
            />
          </div>

          <select
            value={searchOrigin}
            onChange={(e) => setSearchOrigin(e.target.value)}
            aria-label="Origin state"
            className="min-h-10 px-3 bg-white border border-slate-300 text-sm text-slate-700"
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
            aria-label="Destination state"
            className="min-h-10 px-3 bg-white border border-slate-300 text-sm text-slate-700"
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
              className="rounded text-[#228b22] focus:ring-[#228b22]"
            />
            Active only
          </label>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center border border-slate-300 self-end md:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`min-h-10 px-3 text-xs font-medium flex items-center gap-1.5 ${
              viewMode === 'table' ? 'bg-[#e8f3e8] text-[#166a24]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <List size={14} /> Table View
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`min-h-10 px-3 text-xs font-medium flex items-center gap-1.5 ${
              viewMode === 'matrix' ? 'bg-[#e8f3e8] text-[#166a24]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Grid size={14} /> Matrix View
          </button>
        </div>
      </div>

      {viewMode === 'matrix' && loadError && <div role="alert" className="border border-slate-200 bg-white p-6 text-sm text-slate-700">
        <p>{loadError}</p>
        {!loadError.includes('permission') && <button type="button" className="mt-3 font-medium text-[#176a35] underline" onClick={() => void loadData()}>Retry</button>}
      </div>}

      {/* ── View 1: Table View ── */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 overflow-hidden">
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
                      <RefreshCw size={24} className="animate-spin mx-auto text-[#228b22] mb-2" />
                      Loading configured delivery routes...
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-700"><p role="alert">{loadError}</p>{!loadError.includes('permission') && <button type="button" className="mt-3 text-[#228b22] underline" onClick={() => void loadData()}>Retry</button>}</td></tr>
                ) : filteredRoutes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <Truck size={32} className="mx-auto text-gray-300 mb-2" />
                      {routes.length === 0 ? 'No delivery routes yet. Use Add route to configure pricing.' : 'No routes match these filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredRoutes.map((route) => {
                    const isInline = inlineEditingId === route.id;

                    return (
                      <tr key={route.id} className="hover:bg-brand-50/20 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          <span className="flex items-center gap-1.5">
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
                            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                              <MapPin size={10} /> Within State
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
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
                                className="w-24 px-2 py-1 text-xs border rounded-lg border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-300 font-bold"
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
                              <span className="font-extrabold text-[#228b22] text-sm">
                                ₦{route.fee.toLocaleString()}
                              </span>
                              <button
                                onClick={() => {
                                  setInlineEditingId(route.id);
                                  setInlineFeeValue(String(route.fee));
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-brand-600 transition"
                                title="Click to quick-edit fee"
                              >
                                <Edit2 size={11} />
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <p className="text-xs text-slate-700">{route.isActive ? 'Active' : 'Inactive'}</p>
                          <button
                            type="button"
                            onClick={() => triggerToggleActive(route)}
                            className="mt-1 px-2 py-1 text-xs font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
                            aria-label={`${route.isActive ? 'Deactivate' : 'Activate'} route`}
                          >
                            {route.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(route)}
                              className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                              title="Edit route fee"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => triggerDelete(route)}
                              className="p-1.5 text-gray-400 hover:text-slate-900 hover:bg-red-50 rounded-lg transition"
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
      {viewMode === 'matrix' && !loadError && (
        <div className="bg-white rounded-md border border-gray-150 shadow-xs p-6 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Grid size={16} className="text-[#228b22]" />
                Inter-State Route Matrix
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Rows represent origin states (where vendor items ship from). Columns represent customer destination states.
                A single entry A → B covers B → A unless set separately (&quot;uses reverse&quot;).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] border rounded-md">
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
                              isSame ? 'bg-emerald-50/80 hover:bg-emerald-100' : 'bg-brand-50/60 hover:bg-brand-100'
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
                            <span className="text-[9px] text-slate-600 font-bold block mt-0.5">
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
                          className="p-2 cursor-pointer hover:bg-brand-50/50 text-gray-300 font-bold transition-colors border-r text-center"
                          title={`No route configured between ${orig} and ${dest}. Click to add.`}
                        >
                          <span className="text-gray-300 hover:text-brand-600">+ Add</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dashboard-dialog-overlay">
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
              className="relative w-full bg-white p-6 z-10 dashboard-dialog dashboard-dialog--form dashboard-dialog--padded" role="dialog" aria-modal="true" aria-labelledby="DeliveryRoutesManagement-dialog-0-title"
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4 dashboard-dialog-header">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2" id="DeliveryRoutesManagement-dialog-0-title">
                  <Truck size={18} className="text-[#228b22]" />
                  {editingRoute ? 'Edit Delivery Route Fee' : 'Add New Delivery Route'}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg dashboard-dialog-close" aria-label="Close dialog" type="button"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitRoute} className="space-y-4">
                {/* Same State Switch */}
                {!editingRoute && (
                  <div className="bg-brand-50/60 p-3 rounded-md border border-brand-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-brand-900">Within-State Rate</p>
                      <p className="text-[10px] text-brand-700">Set base last-mile fee for delivery within the same state</p>
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
                      <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-md peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-md after:h-3 after:w-3 after:transition-all peer-checked:bg-[#228b22]" />
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
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-xs font-bold text-gray-500"
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
                        className="w-full px-3 py-2.5 text-xs font-semibold border border-gray-200 rounded-md focus:outline-none focus:border-brand-500 bg-slate-50/50"
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
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-xs font-bold text-gray-500"
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
                          className="w-full px-3 py-2.5 text-xs font-semibold border border-gray-200 rounded-md focus:outline-none focus:border-brand-500 bg-slate-50/50"
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
                      className="w-full pl-8 pr-3 py-2.5 text-xs font-bold border border-gray-200 rounded-md focus:outline-none focus:border-brand-500 bg-slate-50/50"
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
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-md text-xs font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#228b22] text-white rounded-md text-xs font-bold hover:opacity-90 transition disabled:opacity-50 shadow-sm "
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dashboard-dialog-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-[3px] backdrop-blur-xs"
              onClick={() => setConfirmAction(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full bg-white p-6 z-10 text-center dashboard-dialog dashboard-dialog--compact dashboard-dialog--padded" role="dialog" aria-modal="true" aria-labelledby="DeliveryRoutesManagement-dialog-1-title"
            >
              <div className="w-12 h-12 rounded-md bg-red-50 text-slate-500 flex items-center justify-center mx-auto mb-3 dashboard-dialog-icon">
                <AlertTriangle size={24} />
              </div>

              <h3 className="text-base font-extrabold text-slate-800 mb-1" id="DeliveryRoutesManagement-dialog-1-title">
                {confirmAction.type === 'delete' ? 'Delete Delivery Route?' : 'Disable Delivery Route?'}
              </h3>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 my-3 text-left">
                <p className="text-xs text-slate-800 font-bold mb-1">Impact Warning:</p>
                <p className="text-[11px] text-slate-700 leading-snug">
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
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-md text-xs font-bold hover:bg-gray-50"
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
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold transition shadow-sm "
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
