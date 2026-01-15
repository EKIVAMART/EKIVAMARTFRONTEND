import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import StoreProvider from './StoreProvider';

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
            <Navbar />
            <main>{children}</main>
            <Footer />
          </body>
        </html>
      </StoreProvider>
    </ClerkProvider>
  );
}
