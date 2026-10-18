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
  themeColor: '#11131b',
};

export const metadata: Metadata = {
  title: 'Wavo — Social Cinema Salon & Watch Together',
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface min-h-screen flex flex-col font-sans antialiased selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden touch-manipulation relative">
        {/* Ambient Atmospheric Gradients */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-primary-container/10 blur-[130px]" />
          <div className="absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-secondary-container/10 blur-[140px]" />
          <div className="absolute -bottom-20 left-1/3 h-[450px] w-[450px] rounded-full bg-tertiary-container/10 blur-[120px]" />
        </div>

        <AuthProvider>
          <WatchlistProvider>
            <ErrorBoundary>
              <PwaRegistrar />
              <Navbar />
              <main className="flex-1 w-full pb-safe relative z-10">{children}</main>
              <Footer />
            </ErrorBoundary>
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
