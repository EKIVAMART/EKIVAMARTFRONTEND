'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Description,
} from '@headlessui/react';
import { X } from '@/components/ui/platform-icons';

type Confirmation = {
  message: string;
  title: string;
  confirmLabel: string;
  destructive?: boolean;
};

/** Shared async confirmation; callers retain their existing action and error handling. */
export function useDashboardConfirmation() {
  const [pending, setPending] = useState<Confirmation | null>(null);
  const resolve = useRef<((accepted: boolean) => void) | null>(null);
  useEffect(
    () => () => {
      resolve.current?.(false);
    },
    []
  );

  const confirm = useCallback(
    (message: string, options: Omit<Confirmation, 'message'>) => {
      resolve.current?.(false);
      setPending({ message, ...options });
      return new Promise<boolean>((accept) => {
        resolve.current = accept;
      });
    },
    []
  );

  const finish = useCallback((accepted: boolean) => {
    setPending(null);
    resolve.current?.(accepted);
    resolve.current = null;
  }, []);

  const confirmationDialog = (
    <Dialog
      open={pending !== null}
      onClose={() => finish(false)}
      className="relative z-[300]"
    >
      <div className="fixed inset-0 flex items-center justify-center dashboard-dialog-overlay">
        <DialogPanel className="dashboard-dialog dashboard-dialog--compact dashboard-dialog--padded">
          <div className="dashboard-dialog-header">
            <DialogTitle as="h2">{pending?.title}</DialogTitle>
            <button
              type="button"
              aria-label="Close confirmation"
              className="dashboard-dialog-close"
              onClick={() => finish(false)}
            >
              <X />
            </button>
          </div>
          <Description className="text-sm leading-relaxed text-slate-600">
            {pending?.message}
          </Description>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              data-autofocus
              onClick={() => finish(false)}
              className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => finish(true)}
              className={`min-h-11 rounded-lg px-4 text-sm font-semibold text-white ${pending?.destructive ? 'bg-rose-700 hover:bg-rose-800' : 'bg-emerald-800 hover:bg-emerald-900'}`}
            >
              {pending?.confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
  return { confirm, confirmationDialog };
}
