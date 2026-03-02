import './globals.css';
import StoreProvider from './StoreProvider';
import LayoutWrapper from '@/components/LayoutWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <html lang="en">
        <body suppressHydrationWarning={true}>
          <LayoutWrapper>{children}</LayoutWrapper>
          {/* Portal target for modals and overlays */}
          <div id="modal-root" />
        </body>
      </html>
    </StoreProvider>
  );
}
