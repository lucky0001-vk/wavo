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
      <header className="sticky top-0 z-40 w-full border-b border-surface-container-highest/60 bg-surface-container-lowest/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center group">
            <WavoLogo />
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-container-low/80 border border-surface-container-highest/60 p-1 rounded-full backdrop-blur-md">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-surface-container-high transition-colors"
            >
              Moods
            </Link>
            <Link
              href="/discover"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-surface-container-high transition-colors"
            >
              Discover
            </Link>
            <Link
              href="/media-browser"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
            >
              <Compass size={14} className="text-secondary" />
              <span>Media Browser</span>
            </Link>
            <Link
              href="/watch-together"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-secondary hover:text-white hover:bg-secondary/10 transition-colors flex items-center gap-1.5"
            >
              <Users size={14} />
              <span>Watch Together</span>
            </Link>
            <Link
              href="/watchlist"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
            >
              <Bookmark size={14} />
              <span>Watchlist</span>
              {watchlist.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-primary-container/20 text-primary text-[10px] font-mono border border-primary/30">
                  {watchlist.length}
                </span>
              )}
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Live Synchrony Latency Pill */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/60 border border-outline-variant/30 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-slate-300">Synced (0.0s delay)</span>
              <span className="text-outline/40">|</span>
              <span className="text-secondary font-bold">#NOVA-482</span>
            </div>

            {/* Quick Room Code Input */}
            <form onSubmit={handleQuickJoin} className="relative">
              <input
                type="text"
                placeholder="Code: NOVA-482"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                className="w-36 pl-3 pr-7 py-1.5 rounded-xl bg-surface-container-high/60 border border-surface-container-highest text-white placeholder-slate-400 text-xs font-mono uppercase focus:outline-none focus:border-secondary transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 p-1 rounded-lg text-slate-400 hover:text-secondary transition-colors"
                title="Join Room"
              >
                <ArrowRight size={13} />
              </button>
            </form>

            {/* Watch Together Action Button */}
            <Link
              href="/watch-together"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary-container via-primary-container to-secondary text-white font-bold text-xs shadow-md shadow-primary-container/20 hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              <Users size={13} />
              <span>Watch Together</span>
            </Link>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-surface-container-high/70 border border-surface-container-highest hover:border-outline-variant transition-colors text-left"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-7 h-7 rounded-full object-cover border border-secondary/40"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary-container/30 text-primary flex items-center justify-center text-xs font-semibold">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-100 leading-tight">
                      {user.displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-none">
                      {user.isGuest ? 'Guest' : 'Member'}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-surface-container border border-surface-container-highest rounded-2xl shadow-2xl py-2 text-slate-200 text-xs z-50 animate-fade-in backdrop-blur-xl">
                    <div className="px-3 py-2 border-b border-surface-container-highest">
                      <p className="font-medium text-white truncate">{user.displayName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email || 'Guest Explorer'}</p>
                    </div>

                    <Link
                      href="/preferences"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-surface-container-high hover:text-white transition-colors"
                    >
                      <Settings size={14} />
                      <span>Preferences & Profile</span>
                    </Link>

                    <Link
                      href="/watchlist"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-surface-container-high hover:text-white transition-colors"
                    >
                      <Bookmark size={14} />
                      <span>Saved Movies ({watchlist.length})</span>
                    </Link>

                    <Link
                      href="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-surface-container-high text-slate-300 hover:text-white transition-colors border-t border-surface-container-highest"
                    >
                      <Shield size={14} className="text-secondary" />
                      <span>Admin & Health</span>
                    </Link>

                    {user.isGuest ? (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setAuthModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-secondary hover:bg-surface-container-high transition-colors"
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
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-surface-container-high transition-colors"
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
                className="px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-white font-semibold text-xs border border-surface-container-highest transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-container-high transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-container-highest/60 bg-surface-container-lowest/95 backdrop-blur-xl px-4 py-4 space-y-3">
            <form onSubmit={handleQuickJoin} className="relative">
              <input
                type="text"
                placeholder="Enter Room Code (e.g. NOVA-482)"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-surface-container-high/60 border border-surface-container-highest text-white placeholder-slate-400 text-xs font-mono uppercase focus:outline-none focus:border-secondary"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-1 rounded-lg text-secondary"
              >
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] p-2.5 rounded-xl bg-surface-container-low text-xs text-slate-200 hover:bg-surface-container-high flex items-center justify-center font-medium"
              >
                Moods
              </Link>
              <Link
                href="/discover"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] p-2.5 rounded-xl bg-surface-container-low text-xs text-slate-200 hover:bg-surface-container-high flex items-center justify-center font-medium"
              >
                Discover
              </Link>
              <Link
                href="/media-browser"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] p-2.5 rounded-xl bg-surface-container-low text-xs text-slate-200 hover:bg-surface-container-high flex items-center justify-center font-medium"
              >
                Media Browser
              </Link>
              <Link
                href="/watch-together"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] p-2.5 rounded-xl bg-gradient-to-r from-primary-container/20 to-secondary/20 border border-secondary/40 text-xs text-secondary flex items-center justify-center font-medium"
              >
                Watch Together
              </Link>
              <Link
                href="/watchlist"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] p-2.5 rounded-xl bg-surface-container-low text-xs text-slate-200 hover:bg-surface-container-high flex items-center justify-center font-medium"
              >
                Watchlist ({watchlist.length})
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] p-2.5 rounded-xl bg-surface-container-low text-xs text-slate-200 hover:bg-surface-container-high flex items-center justify-center font-medium"
              >
                Admin
              </Link>
            </div>

            <div className="pt-2 border-t border-surface-container-highest/60">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-200">{user.displayName}</span>
                    <span className="text-[10px] text-slate-400">({user.isGuest ? 'Guest' : 'Member'})</span>
                  </div>
                  <Link
                    href="/preferences"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-secondary hover:underline"
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
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary text-white font-semibold text-xs text-center shadow-md shadow-primary-container/20"
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
