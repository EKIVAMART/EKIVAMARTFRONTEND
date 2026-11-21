import type { Metadata } from 'next';
import './globals.css';
import './marketplace.css';
import './workspace.css';
import './dashboard-dialogs.css';
import { DM_Sans } from 'next/font/google';
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
import StoreProvider from './StoreProvider';
import LayoutWrapper from '@/components/LayoutWrapper';
import SupportLauncher from '@/components/SupportLauncher';
import TawkWidget from '@/components/TawkWidget';

export const metadata: Metadata = {
  title: 'EkivaMart | Shop local, discover more',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: '/brand/ekivamart-mark.svg', type: 'image/svg+xml' },
    ],
    apple: '/brand/ekivamart-apple.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#228b22" />
      </head>
      <body className={dmSans.variable} suppressHydrationWarning={true}>
        <StoreProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <SupportLauncher />
          <TawkWidget />
          {/* Portal target for modals and overlays */}
          <div id="modal-root" />
        </StoreProvider>
      </body>
    </html>
  );
}
