import React from 'react';
import Link from 'next/link';
import { WavoLogo } from './WavoLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-cinema-800/80 bg-cinema-950 text-cinema-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand statement */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <Link href="/" className="flex items-center">
            <WavoLogo size="sm" />
          </Link>
          <p className="text-xs text-cinema-500 max-w-sm">
            “Every mood has a movie.” A social cinema platform to discover films by feeling and watch in real-time with friends on Wavo.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-cinema-300">
          <Link href="/discover" className="hover:text-amber-cinema transition-colors">
            Discover
          </Link>
          <Link href="/watch-together" className="hover:text-amber-cinema transition-colors">
            Watch Together
          </Link>
          <Link href="/watchlist" className="hover:text-amber-cinema transition-colors">
            Watchlist
          </Link>
          <Link href="/preferences" className="hover:text-amber-cinema transition-colors">
            Preferences
          </Link>
        </div>

        {/* Attribution & Legal notice */}
        <div className="flex flex-col items-center md:items-end text-xs text-cinema-500 text-center md:text-right gap-1">
          <p className="flex items-center gap-1">
            Trailers streamed via official YouTube Player API
          </p>
          <p className="text-[11px] text-cinema-600">
            Movie metadata powered by TMDB. Synchronized party sessions strictly respect copyright & provider DRM.
          </p>
        </div>
      </div>
    </footer>
  );
};
