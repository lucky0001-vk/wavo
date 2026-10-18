'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { WavoIcon } from './WavoLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup' | 'guest';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signin',
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loginAsGuest, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'guest'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [guestNickname, setGuestNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          onClose();
        }
      } else if (mode === 'signup') {
        const res = await signUpWithEmail(email, password, displayName);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg(res.message || 'Account created successfully!');
          setTimeout(() => onClose(), 1200);
        }
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg(res.message || 'Check your email for reset instructions.');
        }
      } else if (mode === 'guest') {
        loginAsGuest(guestNickname);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in encountered an issue.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestQuickStart = () => {
    loginAsGuest(guestNickname || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cinema-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-cinema-850 border border-cinema-700/60 rounded-3xl p-8 shadow-cinema-card text-cinema-50 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-cinema/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-cinema/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-cinema-400 hover:text-white hover:bg-cinema-800 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cinema-800 border border-cinema-700/80 text-white text-xs font-medium mb-3">
            <WavoIcon size={16} />
            <span>Wavo Social</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            Your next movie night starts here.
          </h2>
          <p className="text-sm text-cinema-400">
            Discover a film. Invite your people. Press play together.
          </p>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Guest Mode View */}
        {mode === 'guest' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-cinema-300 mb-1.5">
                Choose a Guest Nickname
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-3 text-cinema-500" />
                <input
                  type="text"
                  value={guestNickname}
                  onChange={(e) => setGuestNickname(e.target.value)}
                  placeholder="e.g. CinemaLover42"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-900 border border-cinema-700/60 text-cinema-100 placeholder-cinema-500 focus:outline-none focus:border-amber-cinema/70 text-sm"
                  autoFocus
                />
              </div>
              <p className="text-xs text-cinema-400 mt-1">
                You can browse movies, create rooms, and join friends instantly.
              </p>
            </div>

            <button
              onClick={handleGuestQuickStart}
              className="w-full py-3 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-semibold text-sm transition-all duration-200 shadow-glow-amber flex items-center justify-center gap-2"
            >
              <span>Explore as Guest</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setMode('signin')}
              className="w-full text-center text-xs text-cinema-400 hover:text-white transition-colors pt-2"
            >
              Already have an account? <span className="text-amber-cinema font-medium">Sign In</span>
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up / Forgot Password View */
          <div>
            {/* Primary Action 1: Continue with Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-cinema-800 hover:bg-cinema-750 border border-cinema-700/60 text-cinema-100 font-medium text-sm transition-colors flex items-center justify-center gap-3 mb-4 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-cinema-750 w-full" />
              <span className="bg-cinema-850 px-3 text-xs text-cinema-500 uppercase tracking-wider">
                Or with email
              </span>
              <div className="border-t border-cinema-750 w-full" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-cinema-300 mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3 text-cinema-500" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Mia Dolan"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-900 border border-cinema-700/60 text-cinema-100 placeholder-cinema-500 focus:outline-none focus:border-amber-cinema/70 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-cinema-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-cinema-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-900 border border-cinema-700/60 text-cinema-100 placeholder-cinema-500 focus:outline-none focus:border-amber-cinema/70 text-sm"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-cinema-300">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs text-amber-cinema hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3 text-cinema-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-900 border border-cinema-700/60 text-cinema-100 placeholder-cinema-500 focus:outline-none focus:border-amber-cinema/70 text-sm"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-semibold text-sm transition-all duration-200 shadow-glow-amber disabled:opacity-50 mt-2"
              >
                {loading
                  ? 'Processing...'
                  : mode === 'signin'
                  ? 'Continue with Email'
                  : mode === 'signup'
                  ? 'Create Free Account'
                  : 'Send Reset Link'}
              </button>
            </form>

            {/* Toggle Modes */}
            <div className="mt-5 pt-4 border-t border-cinema-750 flex flex-col gap-2 text-center text-xs text-cinema-400">
              {mode === 'signin' ? (
                <>
                  <div>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-amber-cinema font-medium hover:underline"
                    >
                      Sign Up
                    </button>
                  </div>
                  <div>
                    Just testing things out?{' '}
                    <button
                      onClick={() => setMode('guest')}
                      className="text-cinema-200 hover:text-white font-medium hover:underline"
                    >
                      Explore as Guest
                    </button>
                  </div>
                </>
              ) : mode === 'signup' ? (
                <div>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="text-amber-cinema font-medium hover:underline"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <div>
                  Remember your password?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="text-amber-cinema font-medium hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
