import './globals.css';
import './marketplace.css';
import './workspace.css';
import { DM_Sans } from 'next/font/google';
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
import StoreProvider from './StoreProvider';
import LayoutWrapper from '@/components/LayoutWrapper';
import SupportLauncher from '@/components/SupportLauncher';
import TawkWidget from '@/components/TawkWidget';

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
