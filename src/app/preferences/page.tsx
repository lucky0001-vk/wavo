'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { MOODS, GENRE_OPTIONS } from '@/lib/constants';
import { User, Settings, Save, Sparkles, Check, LogOut, Tv, Shield } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

const POPULAR_STREAMING = ['Netflix', 'Max', 'Prime Video', 'Disney+', 'Apple TV', 'Hulu', 'Criterion'];

export default function PreferencesPage() {
  const { user, updateProfile, signOut, isConfigured } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [selectedMoods, setSelectedMoods] = useState<string[]>(user?.preferredMoods || []);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(user?.preferredGenres || []);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    user?.preferredStreamingServices || ['Netflix', 'Max']
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleToggleMood = (id: string) => {
    setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleToggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleToggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    await updateProfile({
      displayName,
      username,
      avatarUrl,
      preferredMoods: selectedMoods as any,
      preferredGenres: selectedGenres,
      preferredStreamingServices: selectedServices,
    });

    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-cinema/15 text-amber-cinema text-xs font-semibold uppercase tracking-wider mb-2">
          <Settings size={13} />
          <span>Profile & Preferences</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Account Settings</h1>
        <p className="text-xs sm:text-sm text-cinema-400 mt-1">
          Customize your cinema identity, emotional taste profile, and streaming subscriptions.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Info Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-cinema-850 border border-cinema-750/80 shadow-cinema-card">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <User size={18} className="text-amber-cinema" />
            <span>Profile Identity</span>
          </h2>

          {user?.isGuest && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-cinema/10 border border-amber-cinema/30 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-amber-cinema">You are browsing in Guest Mode</p>
                <p className="text-[11px] text-cinema-400 mt-0.5">
                  Sign in or create an account to sync your watchlist and rooms across devices.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-semibold text-xs shrink-0"
              >
                Create Account
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cinema-300 mb-1.5">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-cinema-900 border border-cinema-750 text-cinema-100 text-xs sm:text-sm focus:outline-none focus:border-amber-cinema"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-cinema-300 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-cinema-900 border border-cinema-750 text-cinema-100 text-xs sm:text-sm focus:outline-none focus:border-amber-cinema"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-cinema-300 mb-1.5">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-xl bg-cinema-900 border border-cinema-750 text-cinema-100 text-xs sm:text-sm focus:outline-none focus:border-amber-cinema"
              />
            </div>
          </div>
        </div>

        {/* Favorite Moods Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-cinema-850 border border-cinema-750/80 shadow-cinema-card">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-cinema" />
            <span>Frequent Emotional Frequencies</span>
          </h2>
          <p className="text-xs text-cinema-400 mb-4">
            Select the moods that describe what you watch most often.
          </p>

          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => {
              const active = selectedMoods.includes(m.id);
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => handleToggleMood(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-amber-cinema/20 border-amber-cinema text-amber-cinema'
                      : 'bg-cinema-900 border-cinema-750 text-cinema-400 hover:text-white'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                  {active && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Streaming Services Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-cinema-850 border border-cinema-750/80 shadow-cinema-card">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Tv size={18} className="text-amber-cinema" />
            <span>Your Subscribed Services</span>
          </h2>
          <p className="text-xs text-cinema-400 mb-4">
            We will highlight films available on services you already have access to.
          </p>

          <div className="flex flex-wrap gap-2.5">
            {POPULAR_STREAMING.map((srv) => {
              const active = selectedServices.includes(srv);
              return (
                <button
                  type="button"
                  key={srv}
                  onClick={() => handleToggleService(srv)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-2 ${
                    active
                      ? 'bg-amber-cinema text-cinema-950 font-semibold border-amber-cinema shadow-glow-amber'
                      : 'bg-cinema-900 border-cinema-750 text-cinema-300 hover:text-white'
                  }`}
                >
                  <span>{srv}</span>
                  {active && <Check size={14} className="stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 rounded-2xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-sm transition-all shadow-glow-amber flex items-center gap-2"
          >
            <Save size={16} />
            <span>{saving ? 'Saving Changes...' : 'Save Preferences'}</span>
          </button>

          {saveSuccess && (
            <div className="text-emerald-400 text-xs font-medium flex items-center gap-1.5 animate-fade-in">
              <Check size={16} />
              <span>Preferences updated successfully!</span>
            </div>
          )}

          {!user?.isGuest && (
            <button
              type="button"
              onClick={() => signOut()}
              className="px-4 py-2 rounded-xl bg-cinema-900 hover:bg-red-500/20 text-cinema-400 hover:text-red-400 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </form>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
