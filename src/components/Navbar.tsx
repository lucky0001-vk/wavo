'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Film, Users, Bookmark, Sparkles, User, LogOut, Settings, LogIn, Menu, X, ArrowRight, Compass, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useWatchlist } from '@/lib/watchlist-context';
import { AuthModal } from './AuthModal';
import { WavoLogo } from './WavoLogo';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { watchlist } = useWatchlist();
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickCode, setQuickCode] = useState('');

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) return;
    const cleanCode = quickCode.trim().toUpperCase();
    setQuickCode('');
    router.push(`/room/${cleanCode}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-cinema-800/80 bg-cinema-950/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center group">
            <WavoLogo />
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-cinema-900/60 border border-cinema-800/70 p-1 rounded-full">
            <Link
              href="/"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-cinema-300 hover:text-white hover:bg-cinema-800/80 transition-colors"
            >
              Moods
            </Link>
            <Link
              href="/discover"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-cinema-300 hover:text-white hover:bg-cinema-800/80 transition-colors"
            >
              Discover
            </Link>
            <Link
              href="/media-browser"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-cinema-300 hover:text-white hover:bg-cinema-800/80 transition-colors flex items-center gap-1.5"
            >
              <Compass size={14} />
              <span>Media Browser</span>
            </Link>
            <Link
              href="/watch-together"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-amber-cinema hover:text-amber-hover hover:bg-amber-cinema/10 transition-colors flex items-center gap-1.5"
            >
              <Users size={14} />
              <span>Watch Together</span>
            </Link>
            <Link
              href="/watchlist"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-cinema-300 hover:text-white hover:bg-cinema-800/80 transition-colors flex items-center gap-1.5"
            >
              <Bookmark size={14} />
              <span>Watchlist</span>
              {watchlist.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cinema-750 text-cinema-200 text-[10px] font-mono">
                  {watchlist.length}
                </span>
              )}
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Room Code Input */}
            <form onSubmit={handleQuickJoin} className="relative">
              <input
                type="text"
                placeholder="Code: MOON-582"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                className="w-36 pl-3 pr-7 py-1.5 rounded-xl bg-cinema-900 border border-cinema-750 text-cinema-100 placeholder-cinema-500 text-xs font-mono uppercase focus:outline-none focus:border-amber-cinema/70 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 p-1 rounded-lg text-cinema-400 hover:text-amber-cinema transition-colors"
                title="Join Room"
              >
                <ArrowRight size={13} />
              </button>
            </form>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-cinema-900 border border-cinema-800 hover:border-cinema-700 transition-colors text-left"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-7 h-7 rounded-full object-cover border border-amber-cinema/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-cinema/20 text-amber-cinema flex items-center justify-center text-xs font-semibold">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-cinema-100 leading-tight">
                      {user.displayName}
                    </span>
                    <span className="text-[10px] text-cinema-500 leading-none">
                      {user.isGuest ? 'Guest' : 'Member'}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-cinema-850 border border-cinema-700/80 rounded-2xl shadow-cinema-card py-2 text-cinema-200 text-xs z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-cinema-750">
                      <p className="font-medium text-cinema-50 truncate">{user.displayName}</p>
                      <p className="text-[10px] text-cinema-500 truncate">{user.email || 'Guest Explorer'}</p>
                    </div>

                    <Link
                      href="/preferences"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-cinema-800 hover:text-white transition-colors"
                    >
                      <Settings size={14} />
                      <span>Preferences & Profile</span>
                    </Link>

                    <Link
                      href="/watchlist"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-cinema-800 hover:text-white transition-colors"
                    >
                      <Bookmark size={14} />
                      <span>Saved Movies ({watchlist.length})</span>
                    </Link>

                    <Link
                      href="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-cinema-800 text-cinema-300 hover:text-white transition-colors border-t border-cinema-750"
                    >
                      <Shield size={14} className="text-amber-cinema" />
                      <span>Admin & Health</span>
                    </Link>

                    {user.isGuest ? (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setAuthModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-amber-cinema hover:bg-cinema-800 transition-colors"
                      >
                        <LogIn size={14} />
                        <span>Sign In / Create Account</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-cinema-800 transition-colors"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-1.5 rounded-full bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-medium text-xs transition-colors shadow-glow-amber"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-cinema-400 hover:text-white hover:bg-cinema-850"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-cinema-800 bg-cinema-950 px-4 py-4 space-y-3">
            <form onSubmit={handleQuickJoin} className="relative">
              <input
                type="text"
                placeholder="Enter Room Code (e.g. MOON-582)"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-cinema-900 border border-cinema-750 text-cinema-100 placeholder-cinema-500 text-xs font-mono uppercase focus:outline-none focus:border-amber-cinema/70"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-1 rounded-lg text-amber-cinema"
              >
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] p-2.5 rounded-xl bg-cinema-900 text-xs text-cinema-200 flex items-center justify-center font-medium"
              >
                Moods
              </Link>
              <Link
                href="/discover"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] p-2.5 rounded-xl bg-cinema-900 text-xs text-cinema-200 flex items-center justify-center font-medium"
              >
                Discover
              </Link>
              <Link
                href="/media-browser"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] p-2.5 rounded-xl bg-cinema-900 text-xs text-cinema-200 flex items-center justify-center font-medium"
              >
                Media Browser
              </Link>
              <Link
                href="/watch-together"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] p-2.5 rounded-xl bg-amber-cinema/15 border border-amber-cinema/30 text-xs text-amber-cinema flex items-center justify-center font-medium"
              >
                Watch Together
              </Link>
              <Link
                href="/watchlist"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] p-2.5 rounded-xl bg-cinema-900 text-xs text-cinema-200 flex items-center justify-center font-medium"
              >
                Watchlist ({watchlist.length})
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] p-2.5 rounded-xl bg-cinema-900 text-xs text-cinema-200 flex items-center justify-center font-medium"
              >
                Admin
              </Link>
            </div>

            <div className="pt-2 border-t border-cinema-800">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cinema-200">{user.displayName}</span>
                    <span className="text-[10px] text-cinema-500">({user.isGuest ? 'Guest' : 'Member'})</span>
                  </div>
                  <Link
                    href="/preferences"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-amber-cinema hover:underline"
                  >
                    Profile & Settings
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-cinema text-cinema-950 font-semibold text-xs text-center"
                >
                  Sign In / Create Account
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
