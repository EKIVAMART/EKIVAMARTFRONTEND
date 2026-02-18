import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import StoreProvider from './StoreProvider';
import LayoutWrapper from '@/components/LayoutWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <StoreProvider>
        <html lang="en">
          <body suppressHydrationWarning={true}>
            <LayoutWrapper>{children}</LayoutWrapper>
          </body>
        </html>
      </StoreProvider>
    </ClerkProvider>
  );
}
