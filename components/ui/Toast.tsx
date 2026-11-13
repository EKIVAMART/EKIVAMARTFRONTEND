'use client';

import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { Check, CircleAlert, LoaderCircle, X } from '@/components/ui/platform-icons';
import styles from './toast.module.css';

export const Toast = () => <Toaster position="top-right" gutter={10}
  containerStyle={{ zIndex: 100000, top: 'max(16px, env(safe-area-inset-top))', left: 12, right: 12 }}
  toastOptions={{ duration: 4500, className: styles.card, style: { background: '#fff', color: '#202820', padding: '8px 10px 8px 14px', borderRadius: 10, border: '1px solid #dce3dc', fontSize: 14, maxWidth: 400, boxShadow: '0 4px 18px #183d2714' } }}>
  {t => <ToastBar toast={t}>{({ message }) => <>
    <span aria-hidden="true" className={styles.icon}>
      {t.icon || (t.type === 'success' ? <Check size={20} color="#22643e" /> : t.type === 'error' ? <CircleAlert size={20} color="#b42318" /> : t.type === 'loading' ? <LoaderCircle size={20} className={styles.loading} /> : null)}
    </span>
    <div className={styles.message}>{message}</div>
    {t.type !== 'loading' && <button type="button" aria-label="Dismiss notification" className={styles.close} onClick={() => toast.dismiss(t.id)}><X size={17} /></button>}
  </>}</ToastBar>}
</Toaster>;
