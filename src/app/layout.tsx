import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { WatchlistProvider } from '@/lib/watchlist-context';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PwaRegistrar } from '@/components/PwaRegistrar';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#08090B',
};

export const metadata: Metadata = {
  title: 'Wavo — Social Cinema & Watch Together',
  description:
    'Discover films by how you feel. Watch together in real-time with friends worldwide on Wavo across mobile Chrome and desktop browsers.',
  manifest: '/manifest.json',
  icons: {
    icon: '/wavo-icon.png',
    apple: '/wavo-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Wavo',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-cinema-950 text-cinema-50 min-h-screen flex flex-col font-sans antialiased selection:bg-amber-cinema selection:text-cinema-950 overflow-x-hidden touch-manipulation">
        <AuthProvider>
          <WatchlistProvider>
            <ErrorBoundary>
              <PwaRegistrar />
              <Navbar />
              <main className="flex-1 w-full pb-safe">{children}</main>
              <Footer />
            </ErrorBoundary>
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
