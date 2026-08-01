import './globals.css';
import StoreProvider from './StoreProvider';
import LayoutWrapper from '@/components/LayoutWrapper';
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
        <link href="https://fonts.googleapis.com/css2?family=Italianno&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning={true}>
        <StoreProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <TawkWidget />
          {/* Portal target for modals and overlays */}
          <div id="modal-root" />
        </StoreProvider>
      </body>
    </html>
  );
}
