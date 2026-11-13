'use client';

import React, { useEffect, useState, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@/components/ui/platform-icons';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  footer?: React.ReactNode;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
  showCloseButton = true,
}) => {
  // Handle hydration - only render on client-side
  const isMounted = useState(() => {
    // Only for client-side
    if (typeof window !== 'undefined') {
      return true;
    }
    return false;
  })[0];

  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    dialog.current?.focus({ preventScroll: true });

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') close.current();
      if (event.key !== 'Tab' || !dialog.current) return;
      const controls = Array.from(dialog.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
      )).filter(element => element.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      root.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [isOpen]);

  // Mobile-first sizing with very wide constraints
  const sizes = {
    sm: 'w-[95%] max-w-[90vw] sm:w-full sm:max-w-xs md:max-w-sm',
    md: 'w-[95%] max-w-[90vw] sm:w-full sm:max-w-sm md:max-w-md',
    lg: 'w-[95%] max-w-[90vw] sm:w-full sm:max-w-md md:max-w-lg',
    xl: 'w-[95%] max-w-[90vw] sm:w-full sm:max-w-lg md:max-w-xl',
    '2xl': 'w-[95%] max-w-[90vw] sm:w-full sm:max-w-lg md:max-w-2xl',
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Full Screen Portal Container */}
          <div
            className="fixed inset-0 flex items-center justify-center"
            style={{
              position: 'fixed' as const,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 50000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
              margin: 0,
              padding: '1rem',
              overflow: 'auto',
            }}
          >
            {/* Backdrop with click to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
              style={{
                position: 'fixed' as const,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 49999,
                cursor: 'pointer',
              }}
            />

            {/* Modal Content - Will be above backdrop */}
            <motion.div
              key="modal-content"
              ref={dialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`relative bg-white shadow-2xl flex flex-col ${sizes[size]} max-h-[85vh] sm:max-h-[88vh] md:max-h-[92vh] rounded-lg sm:rounded-xl md:rounded-2xl`}
              style={{
                zIndex: 50000,
                pointerEvents: 'auto',
                position: 'relative',
                minWidth: 0,
              }}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between gap-2 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 border-b border-gray-100 shrink-0">
                  <div className="flex-1 min-w-0 pr-2">
                    {title && (
                      <h2 id={titleId} className="text-base sm:text-lg md:text-xl font-bold text-gray-900 break-all">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-1 sm:p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0 active:bg-gray-200"
                      aria-label="Close modal"
                      type="button"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    </button>
                  )}
                </div>
              )}

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 min-w-0">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-gray-50 border-t border-gray-100 shrink-0 rounded-b-lg sm:rounded-b-xl md:rounded-b-2xl">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Only render in browser (client-side)
  if (!isMounted) {
    return null;
  }

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    return null;
  }

  return createPortal(modalContent, modalRoot);
};
