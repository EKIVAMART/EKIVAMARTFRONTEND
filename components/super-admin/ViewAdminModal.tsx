import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Calendar, CheckCircle, Clock, AlertCircle, Shield, Package, ShoppingBag, Users, BarChart3, Ban } from 'lucide-react';
import { AdminUser } from './AdminTable';

interface ViewAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminUser | null;
}

const statusConfig = {
  pending: { label: 'Pending Invite', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  active: { label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
  deactivated: { label: 'Deactivated', color: 'text-gray-600', bg: 'bg-gray-50', icon: AlertCircle },
  blocked: { label: 'Blocked', color: 'text-red-600', bg: 'bg-red-50', icon: Ban },
  deleted: { label: 'Deleted', color: 'text-gray-400', bg: 'bg-gray-50', icon: AlertCircle },
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
  }
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
};

export default function ViewAdminModal({ isOpen, onClose, admin }: ViewAdminModalProps) {
  if (!isOpen || !admin) return null;

  const status = statusConfig[admin.status];
  const StatusIcon = status.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Admin Details</h2>
                <p className="text-sm text-white/80 mt-0.5">
                  View and manage admin information
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Profile Section */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center text-2xl font-bold text-fuchsia-700 shadow-md">
                {admin.avatar ? (
                  <img src={admin.avatar} alt={`${admin.firstName} ${admin.lastName}`} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(admin.firstName, admin.lastName)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-slate-800">
                    {admin.firstName} {admin.lastName}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.color} border`}>
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Shield size={14} />
                    <span className="font-medium">Administrator</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CheckCircle size={14} />
                    <span className="font-medium">Full Permissions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <Mail size={16} className="text-fuchsia-500" />
                Contact Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <span className="text-sm font-medium text-gray-500">Email Address</span>
                  <span className="text-sm font-semibold text-slate-700">{admin.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <span className="text-sm font-medium text-gray-500">Phone Number</span>
                  <span className="text-sm font-semibold text-slate-700">{admin.phone}</span>
                </div>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-fuchsia-500" />
                Activity Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-500">Invited On</span>
                  <span className="text-sm font-semibold text-slate-700">{formatDate(admin.invitedAt)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-500">Activated On</span>
                  <span className="text-sm font-semibold text-slate-700">{formatDate(admin.activatedAt)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <span className="text-sm font-semibold text-slate-700">{formatDate(admin.lastUpdated)}</span>
                </div>
              </div>
            </div>

            {/* Permissions Section - All permissions available by default */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <Shield size={16} className="text-fuchsia-500" />
                Assigned Permissions (Full Access)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Package size={14} />
                  <span className="text-xs font-bold">Manage Products</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <ShoppingBag size={14} />
                  <span className="text-xs font-bold">Manage Orders</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Users size={14} />
                  <span className="text-xs font-bold">Manage Vendors</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <BarChart3 size={14} />
                  <span className="text-xs font-bold">View Analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white rounded-xl font-bold transition shadow-md shadow-fuchsia-100"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}