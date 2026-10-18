'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, Download, X } from 'lucide-react';

export const PwaRegistrar: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            // Service worker successfully registered
          })
          .catch((err) => {
            console.warn('PWA service worker registration notice:', err);
          });
      });
    }

    // 2. Online / Offline listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    // 3. PWA Install Prompt (Chrome Android & Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Show install banner on mobile phones
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setInstallPrompt(null);
  };

  return (
    <>
      {/* Offline Toast Banner */}
      {isOffline && (
        <div className="fixed top-16 inset-x-4 z-50 max-w-md mx-auto p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 backdrop-blur-md text-amber-200 text-xs flex items-center justify-between shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2">
            <WifiOff size={16} className="text-amber-400 shrink-0" />
            <span>You are currently offline. Cached content is still accessible.</span>
          </div>
          <button
            onClick={() => setIsOffline(false)}
            className="p-1 text-amber-300 hover:text-white"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Optional Mobile PWA Install Prompt Banner */}
      {showInstallBanner && installPrompt && (
        <div className="fixed bottom-4 inset-x-4 z-40 max-w-sm mx-auto p-3.5 rounded-2xl bg-cinema-850/95 border border-amber-cinema/40 backdrop-blur-xl text-white shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/wavo-icon.png" alt="Wavo" className="w-8 h-8 rounded-lg shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">Install Wavo</span>
              <span className="text-[10px] text-cinema-400 block truncate">
                Add to your phone's home screen
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-xs flex items-center gap-1 shadow-sm"
            >
              <Download size={12} />
              <span>Install</span>
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1.5 text-cinema-400 hover:text-white"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
