'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit3, Check, Loader2, Home } from '@/components/ui/platform-icons';
import { userAddressApi, SavedAddressItem, SavedAddressPayload } from '@/lib/api';
import toast from 'react-hot-toast';

import { DeliveryLocationPicker } from '@/components/DeliveryLocationPicker';
import { refreshCoverage, locationError } from '@/lib/delivery-coverage';

export const AddressesTab = ({ initialAddress, onSaved, onCancel }: { initialAddress?: SavedAddressItem; onSaved?(): void; onCancel?(): void } = {}) => {
  const [addresses, setAddresses] = useState<SavedAddressItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddressItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState<SavedAddressPayload>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    lga: '',
    town: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
    phoneNumber: '',
  });

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await userAddressApi.list();
      if (res?.success) {
        let list: SavedAddressItem[] = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && Array.isArray((res.data as any).items)) {
          list = (res.data as any).items;
        } else if (res.data && Array.isArray((res.data as any).data)) {
          list = (res.data as any).data;
        } else if (Array.isArray((res as any).items)) {
          list = (res as any).items;
        }
        setAddresses(list);
      }
    } catch (err: any) {
      console.error('Failed to load saved addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAddresses();
    if (initialAddress) handleOpenEdit(initialAddress);
  }, [initialAddress]);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      lga: '',
      town: '',
      state: '',
      postalCode: '',
      country: 'Nigeria',
      phoneNumber: '',
    });
    setIsAdding(true);
  };

  const handleOpenEdit = (addr: SavedAddressItem) => {
    setEditingAddress(addr);
    setFormData({
      fullName: addr.fullName || (addr as any).name || '',
      addressLine1: addr.addressLine1 || (addr as any).street || (addr as any).address || '',
      addressLine2: addr.addressLine2 || '',
      lga: addr.lga ?? '',
      town: addr.town || '',
      state: addr.state || '',
      postalCode: addr.postalCode || (addr as any).zip || (addr as any).zipCode || '',
      country: addr.country || 'Nigeria',
      phoneNumber: addr.phoneNumber || (addr as any).phone || '',
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    const deleteToast = toast.loading('Deleting address...');
    try {
      const res = await userAddressApi.delete(id);
      if (res?.success) {
        toast.success('Address deleted successfully', { id: deleteToast });
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      } else {
        toast.error(res?.message || 'Failed to delete address', { id: deleteToast });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete address', { id: deleteToast });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.lga?.trim() || !formData.town?.trim() || !formData.state || !formData.phoneNumber) {
      toast.error('Please fill in all required address fields.');
      return;
    }

    const payload = { ...formData, addressLine1: formData.addressLine1?.trim() || undefined, postalCode: formData.postalCode?.trim() || undefined, town: formData.town.trim(), lga: formData.lga.trim() };
    setSaving(true);
    const saveToast = toast.loading(editingAddress ? 'Updating address...' : 'Saving address...');

    try {
      if (editingAddress) {
        const res = await userAddressApi.update(editingAddress.id, payload);
        if (res?.success) {
          toast.success('Address updated successfully', { id: saveToast });
          setIsAdding(false);
          await loadAddresses();
          onSaved?.();
        } else {
          toast.error(res?.message || 'Failed to update address', { id: saveToast });
        }
      } else {
        const res = await userAddressApi.create(payload);
        if (res?.success) {
          toast.success('Address saved to profile', { id: saveToast });
          setIsAdding(false);
          await loadAddresses();
          onSaved?.();
        } else {
          toast.error(res?.message || 'Failed to save address', { id: saveToast });
        }
      }
    } catch (err: any) {
      if (locationError(err?.message || '')) refreshCoverage();
      toast.error(err?.message || 'Error saving address', { id: saveToast });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            Saved Addresses
          </h4>
          <p className="text-xs text-gray-500">Manage your shipping destinations for faster checkouts</p>
        </div>
        {!isAdding && (
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 bg-gradient-to-r from-[#228b22] to-[#1c711c] text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:opacity-90 transition shadow-xs"
          >
            <Plus size={14} /> Add New Address
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-purple-100 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-purple-700">
              {editingAddress ? 'Edit Address' : 'Add New Shipping Address'}
            </span>
            <button
              type="button"
              onClick={() => { setIsAdding(false); onCancel?.(); }}
              className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+2348012345678"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <DeliveryLocationPicker value={formData} onChange={location => setFormData(prev => ({ ...prev, ...location }))}
            street={formData.addressLine1} onStreet={addressLine1 => setFormData(prev => ({ ...prev, addressLine1 }))}/>
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={formData.addressLine2 || ''}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              placeholder="Suite 4B"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <label className="block text-xs font-semibold text-slate-700">Postal code (optional)
            <input className="mt-1 block w-full rounded-lg border px-3 py-2" value={formData.postalCode ?? ''} onChange={e => setFormData({ ...formData, postalCode: e.target.value })}/>
          </label>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setIsAdding(false); onCancel?.(); }}
              className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-gradient-to-r from-[#228b22] to-[#1c711c] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      ) : loading ? (
        <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-xs">Loading addresses...</span>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-xl text-center border border-dashed border-gray-200">
          <Home className="mx-auto text-gray-300 mb-2" size={32} />
          <p className="text-xs text-gray-500 font-medium">No saved addresses yet.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 text-xs font-bold text-[#228b22] hover:underline"
          >
            + Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr) => {
            const line1 = addr.addressLine1 || (addr as any).street || (addr as any).address || '';
            const phone = addr.phoneNumber || (addr as any).phone || (addr as any).phoneNumber;
            return (
              <div
                key={addr.id}
                className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between relative hover:border-purple-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-gray-800">{addr.fullName || (addr as any).name || 'Address'}</span>
                    {(!addr.lga || !addr.town) && <span className="rounded bg-amber-100 px-2 text-xs">Please update</span>}
                    {addr.isDefault && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 font-medium">{line1}</p>
                  {addr.addressLine2 && <p className="text-xs text-gray-500">{addr.addressLine2}</p>}
                  <p className="text-xs text-gray-500">
                    {[addr.town || addr.city, addr.lga, addr.state].filter(Boolean).join(', ')} {addr.postalCode || ''}
                  </p>
                  <p className="text-xs text-gray-500">{addr.country}</p>
                  {phone && <p className="text-xs text-purple-600 font-semibold mt-1">📞 {phone}</p>}
                </div>

                <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    className="p-1 text-gray-400 hover:text-purple-600 transition"
                    title="Edit Address"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition"
                    title="Delete Address"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
