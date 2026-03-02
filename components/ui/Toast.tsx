'use client';

import { Toaster } from 'react-hot-toast';

export const Toast = () => {
  return (
    <Toaster
      position="top-right"
      containerStyle={{
        zIndex: 999999999,
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        pointerEvents: 'none',
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#374151',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          fontSize: '14px',
          boxShadow:
            '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          zIndex: 999999999,
          pointerEvents: 'auto',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #10B981',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #EF4444',
          },
        },
        loading: {
          iconTheme: {
            primary: '#3B82F6',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};
