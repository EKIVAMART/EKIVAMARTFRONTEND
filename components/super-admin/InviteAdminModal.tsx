import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, User, Send, AlertCircle, UserPlus } from 'lucide-react';

interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (firstName: string, lastName: string, email: string, phone: string) => Promise<void>;
  isInviting?: boolean;
}

export default function InviteAdminModal({ 
  isOpen, 
  onClose, 
  onInvite,
  isInviting = false 
}: InviteAdminModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string; phone?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { firstName?: string; lastName?: string; email?: string; phone?: string } = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onInvite(firstName, lastName, email, phone);
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[3px] ">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="border-b border-slate-200 bg-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900"><UserPlus size={20} className="text-emerald-700" />Invite Admin</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Send an invitation to join your admin team
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close invite admin form"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                    First Name <span className="text-brand-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setErrors(prev => ({ ...prev, firstName: undefined }));
                      }}
                      className={`w-full pl-10 pr-4 py-3 rounded-md border ${
                        errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                      } focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-200 outline-none transition text-sm`}
                      placeholder="John"
                      disabled={isInviting}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                    Last Name <span className="text-brand-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setErrors(prev => ({ ...prev, lastName: undefined }));
                      }}
                      className={`w-full pl-10 pr-4 py-3 rounded-md border ${
                        errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                      } focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-200 outline-none transition text-sm`}
                      placeholder="Doe"
                      disabled={isInviting}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Email Address <span className="text-brand-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-md border ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    } focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-200 outline-none transition text-sm`}
                    placeholder="admin@example.com"
                    disabled={isInviting}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Phone Number <span className="text-brand-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors(prev => ({ ...prev, phone: undefined }));
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-md border ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    } focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-200 outline-none transition text-sm`}
                    placeholder="+234 801 234 5678"
                    disabled={isInviting}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.phone}
                  </p>
                )}
              </div>

              <div className="bg-brand-50 rounded-md p-4 border border-brand-100">
                <p className="text-xs text-brand-700 font-medium leading-relaxed">
                  <span className="font-bold">Note:</span> The invited admin will receive an email with instructions to set up their account. They will have full access to all admin features by default.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-bold transition text-sm"
                  disabled={isInviting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-md font-bold transition flex items-center justify-center gap-2 shadow-sm "
                >
                  {isInviting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending Invite...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Invite Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
